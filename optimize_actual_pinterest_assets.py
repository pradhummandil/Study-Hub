import os
from PIL import Image

def optimize():
    folder = "public/assets/pinterest"
    for f in os.listdir(folder):
        if f.startswith("actual-pin-") and (f.endswith(".png") or f.endswith(".jpg")):
            path = os.path.join(folder, f)
            try:
                with Image.open(path) as im:
                    webp_name = os.path.splitext(f)[0] + ".webp"
                    webp_path = os.path.join(folder, webp_name)
                    # Convert to RGB if saving JPEG/WebP from RGBA if no transparency
                    if im.mode in ("RGBA", "P"):
                        im_rgb = im.convert("RGBA")
                    else:
                        im_rgb = im.convert("RGB")
                    im_rgb.save(webp_path, "WEBP", quality=85, optimize=True)
                    sz_orig = os.path.getsize(path)
                    sz_webp = os.path.getsize(webp_path)
                    print(f"Optimized {f} ({sz_orig/1024:.1f} KB) -> {webp_name} ({sz_webp/1024:.1f} KB)")
            except Exception as e:
                print(f"Error optimizing {f}: {e}")

if __name__ == "__main__":
    optimize()
