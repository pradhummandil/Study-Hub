import numpy as np
from PIL import Image

def clean_logo(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    arr = np.array(img)
    
    r, g, b, a = arr[:,:,0], arr[:,:,1], arr[:,:,2], arr[:,:,3]
    
    # Identify background pixels:
    # 1. Very light background (R > 235, G > 238, B > 240)
    # 2. Outer greyish halo (R > 200, G > 205, B > 210 and RGB values very close together)
    bg_mask = (r > 230) & (g > 232) & (b > 236)
    
    # Soft shadow at bottom (y > 80% height and greyish)
    h, w = arr.shape[:2]
    y_indices = np.arange(h)[:, None]
    bottom_mask = (y_indices > int(h * 0.85)) & (abs(r.astype(int) - g.astype(int)) < 10) & (r > 150)
    
    combined_bg = bg_mask | bottom_mask
    
    # Set background alpha to 0
    arr[combined_bg, 3] = 0
    
    # Convert back to PIL image
    result = Image.fromarray(arr)
    
    # Bounding box crop to trim unnecessary transparent padding
    bbox = result.getbbox()
    if bbox:
        result = result.crop(bbox)
        
    result.save(output_path, "PNG")
    print(f"Cleaned logo saved to {output_path}")

if __name__ == "__main__":
    clean_logo("public/images/logo.png", "public/images/logo-transparent.png")
