import urllib.request
import os

os.makedirs("temp_pins", exist_ok=True)

# Data collected from inspection:
pins = [
    {
        "pin": 1,
        "image": "https://i.pinimg.com/originals/6f/04/0a/6f040a055d1291f97e371f0c62f24fad.jpg",
        "video": None,
        "ext": "https://www.instagram.com/p/BwF7ivdAdec/?igshid=qaxokw84rir7"
    },
    {
        "pin": 2,
        "image": "https://i.pinimg.com/originals/fa/8b/48/fa8b48ff5b252dfc9570b78734c115f2.png",
        "video": "https://v1.pinimg.com/videos/iht/expMp4/22/25/98/222598c9c05e373177a0ff79899b8d10_720w.mp4",
        "ext": "https://sites.google.com/view/find-mental-balance/home"
    },
    {
        "pin": 3,
        "image": "https://i.pinimg.com/originals/0f/21/ce/0f21ce07db9d00889d3de2a042a78e0b.jpg",
        "video": None,
        "ext": "https://www.directoryofillustration.com/artist.aspx?AID=10929"
    },
    {
        "pin": 4,
        "image": "https://i.pinimg.com/originals/4f/ac/80/4fac802945329adbde3345cce221c1f8.jpg",
        "video": "https://v1.pinimg.com/videos/iht/expMp4/05/96/27/0596277055e4df2999073956111675ec_720w.mp4",
        "ext": "http://blogvibe.in/"
    },
    {
        "pin": 5,
        "image": "https://i.pinimg.com/originals/82/0e/d1/820ed16380e194762970c421d329a3d5.jpg",
        "video": "https://v1.pinimg.com/videos/iht/expMp4/3d/71/3f/3d713fff756fcc403112708f7d81b47e_720w.mp4",
        "ext": "http://www.youtube.com/@ProductiveLegends"
    },
    {
        "pin": 6,
        "image": "https://i.pinimg.com/originals/c4/05/82/c4058253487e218f29811623e349bee2.jpg",
        "video": "https://v1.pinimg.com/videos/mc/720p/90/23/7f/90237fc22aad8c1851323ea481e20ba4.mp4",
        "ext": ""
    },
    {
        "pin": 7,
        "image": "https://i.pinimg.com/originals/18/c0/8c/18c08cb1bc8733590e03bd65e3fd8f44.jpg",
        "video": "https://v1.pinimg.com/videos/720p/1f/e0/47/1fe04759389dcb9a3414d34cf7258713.mp4",
        "ext": ""
    },
    {
        "pin": 8,
        "image": "https://i.pinimg.com/originals/89/b2/41/89b24133619a1b4f9cc6602e7e6b4aeb.jpg",
        "video": "https://v1.pinimg.com/videos/mc/720p/2e/ee/16/2eee16bd0f24dc0a26d643547a02341d.mp4",
        "ext": "https://l8r.it/LZEn"
    },
    {
        "pin": 9,
        "image": "https://i.pinimg.com/originals/af/a4/dd/afa4dd229cecc1069ba062907ad53a9f.jpg",
        "video": "https://v1.pinimg.com/videos/iht/720p/1d/bb/41/1dbb415b03689b0a379792cdb6bb64f3.mp4",
        "ext": ""
    },
    {
        "pin": 10,
        "image": "https://i.pinimg.com/originals/94/96/5f/94965f157ca12927d8bc5986fe90c16f.jpg",
        "video": "https://v1.pinimg.com/videos/mc/720p/06/28/98/062898ffea43f411ca21bf826ad11437.mp4",
        "ext": ""
    },
    {
        "pin": 11,
        "image": "https://i.pinimg.com/originals/4b/2b/07/4b2b073f439fe78b30e64c5a837d4aea.png",
        "video": None,
        "ext": "https://www.artstation.com/artwork/qQJQbP"
    }
]

headers = {'User-Agent': 'Mozilla/5.0'}

for item in pins:
    p = item["pin"]
    print(f"Downloading Pin {p}...")
    if item["image"]:
        img_filename = f"temp_pins/pin_{p}_img.{item['image'].split('.')[-1]}"
        try:
            req = urllib.request.Request(item["image"], headers=headers)
            with urllib.request.urlopen(req) as resp, open(img_filename, "wb") as f:
                f.write(resp.read())
            print(f"  Saved {img_filename}")
        except Exception as e:
            print(f"  Error downloading image {p}: {e}")
            
    if item["video"]:
        vid_filename = f"temp_pins/pin_{p}_vid.mp4"
        try:
            req = urllib.request.Request(item["video"], headers=headers)
            with urllib.request.urlopen(req) as resp, open(vid_filename, "wb") as f:
                f.write(resp.read())
            print(f"  Saved {vid_filename}")
        except Exception as e:
            print(f"  Error downloading video {p}: {e}")
