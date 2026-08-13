import os
import json
import subprocess
import cv2
import imageio_ffmpeg
from PIL import Image

FFMPEG_EXE = imageio_ffmpeg.get_ffmpeg_exe()
print(f"Using FFmpeg executable: {FFMPEG_EXE}")

OUTPUT_DIR = os.path.join("public", "assets", "animations")
os.makedirs(OUTPUT_DIR, exist_ok=True)
TEMP_DIR = "temp_pins"

# Pin 1: Navigation Transition (https://in.pinterest.com/pin/847099011191527571/)
# Raw specs: 400x300 (4:3), 1.53s, ~33.3 fps
nav_input = os.path.join(TEMP_DIR, "nav_raw.mp4")

# Pin 2: Startup Animation (https://in.pinterest.com/pin/371898881745229227/)
# Raw specs: 1280x720 (16:9), 5.367s, 30.0 fps
startup_input = os.path.join(TEMP_DIR, "startup_raw.mp4")

def extract_poster(video_path, poster_path, frame_percent=0.2):
    cap = cv2.VideoCapture(video_path)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    target_frame = max(0, int(total_frames * frame_percent))
    cap.set(cv2.CAP_PROP_POS_FRAMES, target_frame)
    ret, frame = cap.read()
    if ret:
        # Convert BGR to RGB
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        img = Image.fromarray(rgb_frame)
        img.save(poster_path, format="WEBP", quality=90)
        print(f"Saved poster: {poster_path}")
    cap.release()

def process_video(input_path, output_mp4, output_webm, scale_vf):
    # Process MP4 (H.264, yuv420p, faststart, medium preset, crf 20, no audio)
    cmd_mp4 = [
        FFMPEG_EXE, "-y",
        "-i", input_path,
        "-vf", scale_vf,
        "-c:v", "libx264",
        "-preset", "medium",
        "-crf", "20",
        "-pix_fmt", "yuv420p",
        "-an",
        "-movflags", "+faststart",
        output_mp4
    ]
    print(f"Running MP4 command: {' '.join(cmd_mp4)}")
    subprocess.run(cmd_mp4, check=True)

    # Process WebM (VP9, crf 30, no audio)
    cmd_webm = [
        FFMPEG_EXE, "-y",
        "-i", input_path,
        "-vf", scale_vf,
        "-c:v", "libvp9",
        "-crf", "30",
        "-b:v", "0",
        "-an",
        output_webm
    ]
    print(f"Running WebM command: {' '.join(cmd_webm)}")
    subprocess.run(cmd_webm, check=True)

# 1. Process Navigation Video: Scale to 1440:1080 (preserving 4:3) with Lanczos filter
nav_mp4 = os.path.join(OUTPUT_DIR, "studyhub-navigation.mp4")
nav_webm = os.path.join(OUTPUT_DIR, "studyhub-navigation.webm")
nav_poster = os.path.join(OUTPUT_DIR, "studyhub-navigation-poster.webp")

print("--- Processing Navigation Animation ---")
process_video(nav_input, nav_mp4, nav_webm, "scale=1440:1080:flags=lanczos")
extract_poster(nav_mp4, nav_poster, frame_percent=0.25)

# 2. Process Startup Video: Scale to 1920:1080 (16:9) with Lanczos filter
startup_mp4 = os.path.join(OUTPUT_DIR, "studyhub-startup.mp4")
startup_webm = os.path.join(OUTPUT_DIR, "studyhub-startup.webm")
startup_poster = os.path.join(OUTPUT_DIR, "studyhub-startup-poster.webp")

print("--- Processing Startup Animation ---")
process_video(startup_input, startup_mp4, startup_webm, "scale=1920:1080:flags=lanczos")
extract_poster(startup_mp4, startup_poster, frame_percent=0.35)

# Helper to get file stats & video properties
def get_video_info(mp4_path, raw_input, pin_url, purpose, title):
    cap = cv2.VideoCapture(mp4_path)
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = cap.get(cv2.CAP_PROP_FPS)
    frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    duration = round(frames / fps, 3) if fps > 0 else 0
    cap.release()

    size_mp4 = os.path.getsize(mp4_path)
    size_mb = round(size_mp4 / (1024 * 1024), 2)

    return {
        "title": title,
        "purpose": purpose,
        "sourcePinUrl": pin_url,
        "rawMediaUrl": "Pinterest CDN Video Endpoint",
        "originalResolution": "400x300 (4:3)" if "nav" in raw_input else "1280x720 (16:9)",
        "finalResolution": f"{width}x{height}",
        "aspectRatio": "4:3" if "nav" in raw_input else "16:9",
        "durationSeconds": duration,
        "fileSizeBytes": size_mp4,
        "fileSizeMB": f"{size_mb} MB",
        "fps": round(fps, 2),
        "licenseStatus": "Actual Pinterest visual rehosted on local static directory for non-commercial educational study portal",
        "localFiles": {
            "mp4": "/" + os.path.relpath(mp4_path, "public").replace("\\", "/"),
            "webm": "/" + os.path.relpath(mp4_path.replace(".mp4", ".webm"), "public").replace("\\", "/"),
            "poster": "/" + os.path.relpath(mp4_path.replace(".mp4", "-poster.webp"), "public").replace("\\", "/")
        }
    }

metadata = {
    "pin_847099011191527571_navigation": get_video_info(
        nav_mp4, nav_input,
        "https://in.pinterest.com/pin/847099011191527571/",
        "Page Navigation / Route Transition Animation",
        "Pinterest Pin 847099011191527571 - Navigation Transition"
    ),
    "pin_371898881745229227_startup": get_video_info(
        startup_mp4, startup_input,
        "https://in.pinterest.com/pin/371898881745229227/",
        "Initial Application Startup / Intro Sequence",
        "Pinterest Pin 371898881745229227 - Startup Animation"
    )
}

metadata_path = os.path.join(OUTPUT_DIR, "animation-metadata.json")
with open(metadata_path, "w", encoding="utf-8") as f:
    json.dump(metadata, f, indent=2)

print(f"Saved metadata to {metadata_path}")
print("Media processing completed successfully!")
