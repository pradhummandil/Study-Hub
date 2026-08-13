import os
import urllib.request
import urllib.parse

os.makedirs('public/images/journal', exist_ok=True)

downloads = [
    ('saksham-jindal.jpg', 'https://cache.careers360.mobi/media/article_images/2025/6/4/jee-advanced-topper-interview-saksham%20(1).jpg'),
    ('arnab-paul.jpg', 'https://cache.careers360.mobi/media/article_images/2025/4/10/gate-2025-air-1-bt-topper.jpg'),
    ('ekta-priyadarshnee.jpg', 'https://cache.careers360.mobi/media/article_images/2026/3/21/gate-ch-2026-topper-interview-ekta-priyadarshnee.jpg'),
    ('vaishnavi-das.jpg', 'https://cache.careers360.mobi/media/article_images/2026/7/22/Vaishnavi%20Das%20(Karnataka%20Re-NEET%202026%20Topper,%20AIR%2020).jpg')
]

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

for fname, url in downloads:
    dest = os.path.join('public/images/journal', fname)
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as response, open(dest, 'wb') as out_file:
            out_file.write(response.read())
        size = os.path.getsize(dest)
        print(f'Successfully downloaded {fname} ({size} bytes)')
    except Exception as e:
        print(f'Failed downloading {fname}: {e}')
