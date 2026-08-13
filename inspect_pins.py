import urllib.request
import re
import json
import os

urls = [
    "https://in.pinterest.com/pin/322359285828940269/",
    "https://in.pinterest.com/pin/975521969305585422/",
    "https://in.pinterest.com/pin/203858320627823184/",
    "https://in.pinterest.com/pin/998743654885257487/",
    "https://in.pinterest.com/pin/1127025875509575308/",
    "https://in.pinterest.com/pin/574771971205186318/",
    "https://in.pinterest.com/pin/682858362229488216/",
    "https://in.pinterest.com/pin/1041387113816400123/",
    "https://in.pinterest.com/pin/53972895522938608/",
    "https://in.pinterest.com/pin/909656824725158872/",
    "https://in.pinterest.com/pin/526991593908723703/"
]

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept-Language': 'en-US,en;q=0.9'
}

results = []

for i, url in enumerate(urls, 1):
    print(f"=== PIN {i} ({url}) ===")
    info = {"pin_num": i, "url": url}
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
            
            # Find JSON-LD or initial data
            json_ld_matches = re.findall(r'<script type="application/ld\+json">(.*?)</script>', html, re.DOTALL)
            for jm in json_ld_matches:
                try:
                    data = json.loads(jm)
                    info["json_ld"] = data
                except:
                    pass

            # Og tags
            og_title = re.search(r'<meta property="og:title" content="(.*?)"', html)
            og_desc = re.search(r'<meta property="og:description" content="(.*?)"', html)
            og_img = re.search(r'<meta property="og:image" content="(.*?)"', html)
            og_video = re.search(r'<meta property="og:video" content="(.*?)"', html)
            og_url = re.search(r'<meta property="og:url" content="(.*?)"', html)
            
            info["title"] = og_title.group(1) if og_title else ""
            info["description"] = og_desc.group(1) if og_desc else ""
            info["image"] = og_img.group(1) if og_img else ""
            info["video"] = og_video.group(1) if og_video else ""
            info["og_url"] = og_url.group(1) if og_url else ""

            # Check for high-res images / video signals in html
            vids = re.findall(r'https://v1\.pinimg\.com/videos/[^\s"\'<>]+\.mp4', html)
            imgs = re.findall(r'https://i\.pinimg\.com/originals/[^\s"\'<>]+\.(?:jpg|png|gif|webp)', html)
            if not imgs:
                imgs = re.findall(r'https://i\.pinimg\.com/736x/[^\s"\'<>]+\.(?:jpg|png|gif|webp)', html)
            if not imgs:
                imgs = re.findall(r'https://i\.pinimg\.com/[0-9]+x/[^\s"\'<>]+\.(?:jpg|png|gif|webp)', html)
            
            info["video_urls"] = list(set(vids))
            info["image_urls"] = list(set(imgs))

            # External link
            link_match = re.search(r'"link":\s*"(http[^"]+)"', html)
            info["external_link"] = link_match.group(1) if link_match else ""

            print(f"Title: {info['title']}")
            print(f"Desc: {info['description'][:100]}..." if info['description'] else "Desc: None")
            print(f"Og Image: {info['image']}")
            print(f"Og Video: {info['video']}")
            print(f"Video URLs found: {info['video_urls']}")
            print(f"Image URLs count: {len(info['image_urls'])}")
            if info['image_urls']:
                print(f"Sample Image URL: {info['image_urls'][0]}")
            print(f"External Link: {info['external_link']}")

    except Exception as e:
        print(f"Error inspecting pin {i}: {e}")
        info["error"] = str(e)
    
    results.append(info)
    print()

with open("pinterest_inspection.json", "w", encoding="utf-8") as f:
    json.dump(results, f, indent=2)
