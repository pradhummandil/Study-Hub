import os
import shutil

pin_map = [
    {
        "pin_id": "322359285828940269",
        "pin_num": 1,
        "type": "image",
        "img_src": "temp_pins/pin_1_img.jpg",
        "vid_src": None,
        "img_dest": "public/assets/pinterest/actual-pin-322359285828940269.jpg",
        "vid_dest": None,
    },
    {
        "pin_id": "975521969305585422",
        "pin_num": 2,
        "type": "video",
        "img_src": "temp_pins/pin_2_img.png",
        "vid_src": "temp_pins/pin_2_vid.mp4",
        "img_dest": "public/assets/pinterest/actual-pin-975521969305585422-poster.png",
        "vid_dest": "public/assets/pinterest/actual-pin-975521969305585422.mp4",
    },
    {
        "pin_id": "203858320627823184",
        "pin_num": 3,
        "type": "image",
        "img_src": "temp_pins/pin_3_img.jpg",
        "vid_src": None,
        "img_dest": "public/assets/pinterest/actual-pin-203858320627823184.jpg",
        "vid_dest": None,
    },
    {
        "pin_id": "998743654885257487",
        "pin_num": 4,
        "type": "video",
        "img_src": "temp_pins/pin_4_img.jpg",
        "vid_src": "temp_pins/pin_4_vid.mp4",
        "img_dest": "public/assets/pinterest/actual-pin-998743654885257487-poster.jpg",
        "vid_dest": "public/assets/pinterest/actual-pin-998743654885257487.mp4",
    },
    {
        "pin_id": "1127025875509575308",
        "pin_num": 5,
        "type": "video",
        "img_src": "temp_pins/pin_5_img.jpg",
        "vid_src": "temp_pins/pin_5_vid.mp4",
        "img_dest": "public/assets/pinterest/actual-pin-1127025875509575308-poster.jpg",
        "vid_dest": "public/assets/pinterest/actual-pin-1127025875509575308.mp4",
    },
    {
        "pin_id": "574771971205186318",
        "pin_num": 6,
        "type": "video",
        "img_src": "temp_pins/pin_6_img.jpg",
        "vid_src": "temp_pins/pin_6_vid.mp4",
        "img_dest": "public/assets/pinterest/actual-pin-574771971205186318-poster.jpg",
        "vid_dest": "public/assets/pinterest/actual-pin-574771971205186318.mp4",
    },
    {
        "pin_id": "682858362229488216",
        "pin_num": 7,
        "type": "video",
        "img_src": "temp_pins/pin_7_img.jpg",
        "vid_src": "temp_pins/pin_7_vid.mp4",
        "img_dest": "public/assets/pinterest/actual-pin-682858362229488216-poster.jpg",
        "vid_dest": "public/assets/pinterest/actual-pin-682858362229488216.mp4",
    },
    {
        "pin_id": "1041387113816400123",
        "pin_num": 8,
        "type": "video",
        "img_src": "temp_pins/pin_8_img.jpg",
        "vid_src": "temp_pins/pin_8_vid.mp4",
        "img_dest": "public/assets/pinterest/actual-pin-1041387113816400123-poster.jpg",
        "vid_dest": "public/assets/pinterest/actual-pin-1041387113816400123.mp4",
    },
    {
        "pin_id": "53972895522938608",
        "pin_num": 9,
        "type": "video",
        "img_src": "temp_pins/pin_9_img.jpg",
        "vid_src": "temp_pins/pin_9_vid.mp4",
        "img_dest": "public/assets/pinterest/actual-pin-53972895522938608-poster.jpg",
        "vid_dest": "public/assets/pinterest/actual-pin-53972895522938608.mp4",
    },
    {
        "pin_id": "909656824725158872",
        "pin_num": 10,
        "type": "video",
        "img_src": "temp_pins/pin_10_img.jpg",
        "vid_src": "temp_pins/pin_10_vid.mp4",
        "img_dest": "public/assets/pinterest/actual-pin-909656824725158872-poster.jpg",
        "vid_dest": "public/assets/pinterest/actual-pin-909656824725158872.mp4",
    },
    {
        "pin_id": "526991593908723703",
        "pin_num": 11,
        "type": "image",
        "img_src": "temp_pins/pin_11_img.png",
        "vid_src": None,
        "img_dest": "public/assets/pinterest/actual-pin-526991593908723703.png",
        "vid_dest": None,
    }
]

os.makedirs("public/assets/pinterest", exist_ok=True)

for p in pin_map:
    print(f"Processing Pin {p['pin_num']} (ID: {p['pin_id']})...")
    if p["img_src"] and os.path.exists(p["img_src"]):
        shutil.copy(p["img_src"], p["img_dest"])
        sz = os.path.getsize(p["img_dest"])
        print(f"  Copied image -> {p['img_dest']} ({sz/1024:.1f} KB)")
    else:
        print(f"  Warning: Image source missing for Pin {p['pin_num']}")

    if p["vid_src"] and os.path.exists(p["vid_src"]):
        shutil.copy(p["vid_src"], p["vid_dest"])
        sz = os.path.getsize(p["vid_dest"])
        print(f"  Copied video -> {p['vid_dest']} ({sz/1024/1024:.2f} MB)")

print("Done organizing actual Pinterest assets!")
