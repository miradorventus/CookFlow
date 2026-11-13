"""Télécharge les photos choisies (scripts/selection.json : id -> index du candidat) en 720 px."""
import json, os, io, time, requests
from PIL import Image
S = requests.Session(); S.headers.update({'User-Agent': 'CookFlowPhotos/1.0 (https://github.com/miradorventus/CookFlow)'})
cand = json.load(open('cand/candidates.json')); sel = json.load(open('scripts/selection.json'))
os.makedirs('img', exist_ok=True); credits = {}
for rid, k in sel.items():
    c = cand[rid]['cands'][k]
    for _ in range(3):
        try:
            r = S.get(c['url'], timeout=60); r.raise_for_status()
            im = Image.open(io.BytesIO(r.content)).convert('RGB')
            w, h = im.size; t = 4 / 3
            if w / h > t: nw = int(h * t); im = im.crop(((w - nw) // 2, 0, (w - nw) // 2 + nw, h))
            else: nh = int(w / t); im = im.crop((0, (h - nh) // 2, w, (h - nh) // 2 + nh))
            im = im.resize((720, 540), Image.LANCZOS); im.save(f'img/{rid}.jpg', 'JPEG', quality=74, optimize=True, progressive=True)
            credits[rid] = {k2: c[k2] for k2 in ('file', 'artist', 'license', 'licenseUrl', 'page')}
            break
        except Exception as e: print('retry', rid, e); time.sleep(8)
    time.sleep(1.5)
    print(rid, 'ok' if rid in credits else 'FAIL', flush=True)
json.dump(credits, open('img/credits.json', 'w'), ensure_ascii=False, indent=1)
