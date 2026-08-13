import urllib.request
import re

urls = [
    ('saksham-jindal', 'https://engineering.careers360.com/articles/jee-advanced-2025-topper-interview-saksham-jindal-air-2-preparation-strategy-success-story'),
    ('arnab-paul', 'https://engineering.careers360.com/articles/gate-2025-topper-interview-arnab-paul-air-1-bt-preparation-tips-success-story'),
    ('ekta-priyadarshnee', 'https://engineering.careers360.com/articles/gate-ch-2026-topper-interview-ekta-priyadarshnee'),
    ('vaishnavi-das', 'https://medicine.careers360.com/articles/vaishnavi-das-karnataka-re-neet-2026-topper-air-20-study-routine-timetable-preparation-strategy')
]

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

for slug, url in urls:
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
            og_img = re.search(r'<meta[^>]+property=["\']og:image["\'][^>]+content=["\']([^"\'>]+)["\']', html)
            if not og_img:
                og_img = re.search(r'<meta[^>]+content=["\']([^"\'>]+)["\'][^>]+property=["\']og:image=["\']', html)
            img_url = og_img.group(1) if og_img else 'None found'
            print(f'{slug}: {img_url}')
    except Exception as e:
        print(f'{slug} error: {e}')
