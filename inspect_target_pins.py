import urllib.request
import re
import json

urls = {
    "PIN_1_TRANSITION": "https://in.pinterest.com/pin/847099011191527571/",
    "PIN_2_STARTUP": "https://in.pinterest.com/pin/371898881745229227/"
}

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept-Language': 'en-US,en;q=0.9'
}

results = {}

for name, url in urls.items():
    print(f"=== {name} ({url}) ===")
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
            
            og_title = re.search(r'<meta property="og:title" content="(.*?)"', html)
            og_desc = re.search(r'<meta property="og:description" content="(.*?)"', html)
            og_img = re.search(r'<meta property="og:image" content="(.*?)"', html)
            og_video = re.search(r'<meta property="og:video" content="(.*?)"', html)
            
            vids = re.findall(r'https://[^\s"\'<>]+\.mp4', html)
            imgs = re.findall(r'https://i\.pinimg\.com/[^\s"\'<>]+\.(?:jpg|png|gif|webp)', html)
            
            link_match = re.search(r'"link":\s*"(http[^"]+)"', html)
            domain_match = re.search(r'"domain":\s*"([^"]+)"', html)
            
            data = {
                "title": og_title.group(1) if og_title else "",
                "description": og_desc.group(1) if og_desc else "",
                "og_image": og_img.group(1) if og_img else "",
                "og_video": og_video.group(1) if og_video else "",
                "video_urls": list(set(vids)),
                "image_urls": list(set(imgs))[:10],
                "external_link": link_match.group(1) if link_match else "",
                "domain": domain_match.group(1) if domain_match else ""
            }
            results[name] = data
            
            print("Title:", data["title"])
            print("Description:", data["description"])
            print("OG Image:", data["og_image"])
            print("OG Video:", data["og_video"])
            print("Video URLs count:", len(data["video_urls"]))
            for v in data["video_urls"]:
                print(" - Video:", v)
            print("External Link:", data["external_link"])
            print("Domain:", data["domain"])
            
    except Exception as e:
        print("Error:", e)

with open("target_pins_inspection.json", "w", encoding="utf-8") as f:
    json.dump(results, f, indent=2)
