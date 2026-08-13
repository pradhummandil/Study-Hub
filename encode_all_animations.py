import imageio_ffmpeg
import subprocess
import os
import json
import cv2
import numpy as np
from PIL import Image

FFMPEG_EXE = imageio_ffmpeg.get_ffmpeg_exe()
print(f"Using FFmpeg: {FFMPEG_EXE}")

OUTPUT_DIR = os.path.join("public", "assets", "animations")
os.makedirs(OUTPUT_DIR, exist_ok=True)
TEMP_DIR = "temp_pins"

nav_raw = os.path.join(TEMP_DIR, "nav_raw.mp4")
startup_raw = os.path.join(TEMP_DIR, "startup_raw.mp4")

def encode_media(input_file, mp4_out, webm_out, vf_scale):
    print(f"\n--- Encoding {input_file} ---")
    
    # 1. MP4 (H.264 faststart)
    cmd_mp4 = [
        FFMPEG_EXE, "-y",
        "-i", input_file,
        "-vf", vf_scale,
        "-c:v", "libx264",
        "-preset", "fast",
        "-crf", "18",
        "-pix_fmt", "yuv420p",
        "-an",
        "-movflags", "+faststart",
        mp4_out
    ]
    subprocess.run(cmd_mp4, check=True)
    
    # 2. WebM (VP9)
    cmd_webm = [
        FFMPEG_EXE, "-y",
        "-i", input_file,
        "-vf", vf_scale,
        "-c:v", "libvpx-vp9",
        "-crf", "26",
        "-b:v", "0",
        "-an",
        webm_out
    ]
    subprocess.run(cmd_webm, check=True)

def extract_poster_frame(video_file, poster_out, frame_ratio=0.3):
    cap = cv2.VideoCapture(video_file)
    total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    target = max(0, int(total * frame_ratio))
    cap.set(cv2.CAP_PROP_POS_FRAMES, target)
    ret, frame = cap.read()
    if ret:
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        img = Image.fromarray(rgb)
        img.save(poster_out, format="WEBP", quality=90)
        print(f"Saved poster frame to {poster_out}")
    cap.release()

def check_motion(filepath):
    cap = cv2.VideoCapture(filepath)
    total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fps = cap.get(cv2.CAP_PROP_FPS)
    w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    duration = round(total / fps, 3) if fps > 0 else 0
    
    frames = []
    indices = [0, total // 2, max(0, total - 1)]
    for idx in indices:
        cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
        ret, frame = cap.read()
        if ret:
            frames.append(frame)
    cap.release()
    
    diff_0_mid = float(np.mean(np.abs(frames[0].astype(float) - frames[1].astype(float)))) if len(frames) == 3 else 0.0
    diff_mid_end = float(np.mean(np.abs(frames[1].astype(float) - frames[2].astype(float)))) if len(frames) == 3 else 0.0
    has_motion = diff_0_mid > 0.5 or diff_mid_end > 0.5
    
    return {
        "width": w,
        "height": h,
        "fps": round(fps, 2),
        "total_frames": total,
        "duration": duration,
        "diff_0_mid": round(diff_0_mid, 3),
        "diff_mid_end": round(diff_mid_end, 3),
        "has_motion": has_motion
    }

# Encode Navigation Video (Pin 847099011191527571)
nav_mp4 = os.path.join(OUTPUT_DIR, "studyhub-navigation.mp4")
nav_webm = os.path.join(OUTPUT_DIR, "studyhub-navigation.webm")
nav_poster = os.path.join(OUTPUT_DIR, "studyhub-navigation-poster.webp")
encode_media(nav_raw, nav_mp4, nav_webm, "scale=1440:1080:flags=lanczos")
extract_poster_frame(nav_mp4, nav_poster, 0.25)
nav_stats = check_motion(nav_mp4)

# Encode Startup Video (Pin 371898881745229227)
startup_mp4 = os.path.join(OUTPUT_DIR, "studyhub-startup.mp4")
startup_webm = os.path.join(OUTPUT_DIR, "studyhub-startup.webm")
startup_poster = os.path.join(OUTPUT_DIR, "studyhub-startup-poster.webp")
encode_media(startup_raw, startup_mp4, startup_webm, "scale=1920:1080:flags=lanczos")
extract_poster_frame(startup_mp4, startup_poster, 0.35)
startup_stats = check_motion(startup_mp4)

# Write Metadata JSON
metadata = {
    "pin_847099011191527571_navigation": {
        "title": "Pinterest Pin 847099011191527571 - Navigation Transition",
        "purpose": "Page Navigation / Route Transition Animation",
        "sourcePinUrl": "https://in.pinterest.com/pin/847099011191527571/",
        "rawMediaUrl": "Pinterest CDN Video Endpoint",
        "originalResolution": "400x300 (4:3)",
        "finalResolution": f"{nav_stats['width']}x{nav_stats['height']}",
        "aspectRatio": f"{nav_stats['width']}:{nav_stats['height']} (4:3)",
        "durationSeconds": nav_stats['duration'],
        "fps": nav_stats['fps'],
        "codec": "H.264 (MP4) / VP9 (WebM)",
        "fileSizeBytes": os.path.getsize(nav_mp4),
        "fileSizeMB": f"{round(os.path.getsize(nav_mp4)/(1024*1024), 2)} MB",
        "motionVerified": nav_stats['has_motion'],
        "motionDiff": f"0 vs Mid: {nav_stats['diff_0_mid']}, Mid vs End: {nav_stats['diff_mid_end']}",
        "licenseStatus": "Actual Pinterest visual rehosted for educational non-commercial study website",
        "localFiles": {
            "mp4": "/assets/animations/studyhub-navigation.mp4",
            "webm": "/assets/animations/studyhub-navigation.webm",
            "poster": "/assets/animations/studyhub-navigation-poster.webp"
        }
    },
    "pin_371898881745229227_startup": {
        "title": "Pinterest Pin 371898881745229227 - Startup Animation",
        "purpose": "Initial Application Startup / Intro Sequence",
        "sourcePinUrl": "https://in.pinterest.com/pin/371898881745229227/",
        "rawMediaUrl": "Pinterest CDN Video Endpoint",
        "originalResolution": "1280x720 (16:9)",
        "finalResolution": f"{startup_stats['width']}x{startup_stats['height']}",
        "aspectRatio": f"{startup_stats['width']}:{startup_stats['height']} (16:9)",
        "durationSeconds": startup_stats['duration'],
        "fps": startup_stats['fps'],
        "codec": "H.264 (MP4) / VP9 (WebM)",
        "fileSizeBytes": os.path.getsize(startup_mp4),
        "fileSizeMB": f"{round(os.path.getsize(startup_mp4)/(1024*1024), 2)} MB",
        "motionVerified": startup_stats['has_motion'],
        "motionDiff": f"0 vs Mid: {startup_stats['diff_0_mid']}, Mid vs End: {startup_stats['diff_mid_end']}",
        "licenseStatus": "Actual Pinterest visual rehosted for educational non-commercial study website",
        "localFiles": {
            "mp4": "/assets/animations/studyhub-startup.mp4",
            "webm": "/assets/animations/studyhub-startup.webm",
            "poster": "/assets/animations/studyhub-startup-poster.webp"
        }
    }
}

meta_json_path = os.path.join(OUTPUT_DIR, "animation-metadata.json")
with open(meta_json_path, "w", encoding="utf-8") as f:
    json.dump(metadata, f, indent=2)

print("\n================ FINAL MEDIA DIAGNOSTICS ================")
print("Navigation Video Motion Check:", nav_stats)
print("Startup Video Motion Check:", startup_stats)
print("Metadata file written:", meta_json_path)
print("Media processing finished successfully!")
