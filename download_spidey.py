import urllib.request
import json
import os

# Search Wikimedia Commons for Spider-Man PNG
url = "https://en.wikipedia.org/w/api.php?action=query&prop=imageinfo&iiprop=url&titles=File:Spider-Man_PS4_transparent.png&format=json"

req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode())
        pages = data['query']['pages']
        for page_id in pages:
            if 'imageinfo' in pages[page_id]:
                img_url = pages[page_id]['imageinfo'][0]['url']
                print(f"Found: {img_url}")
                os.makedirs('assets', exist_ok=True)
                urllib.request.urlretrieve(img_url, 'assets/spiderman.png')
                print("Downloaded successfully.")
                break
        else:
            print("Image not found on Wiki.")
except Exception as e:
    print(f"Error: {e}")
