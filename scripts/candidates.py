"""Cherche des photos libres (Wikimedia) pour chaque recette et enregistre des vignettes candidates."""
import json, os, re, time, io, sys
import requests
from PIL import Image

UA = {'User-Agent': 'CookFlowPhotos/1.0 (https://github.com/miradorventus/CookFlow)'}
OK = re.compile(r'^(cc0|public domain|pd|cc[ -]by(-sa)?[ -]?\d|cc[ -]by(-sa)?$)', re.I)
S = requests.Session(); S.headers.update(UA)

def api(host, **p):
    p.update(format='json', formatversion=2)
    for _ in range(4):
        try:
            r = S.get(f'https://{host}/w/api.php', params=p, timeout=30)
            if r.status_code == 200: return r.json()
        except Exception: pass
        time.sleep(2)
    return {}

def strip(h): return re.sub(r'<[^>]+>', '', h or '').strip()

def file_infos(titles):
    if not titles: return []
    d = api('commons.wikimedia.org', action='query', titles='|'.join(titles), prop='imageinfo',
            iiprop='url|size|extmetadata|mime', iiurlwidth=320)
    out = []
    for pg in d.get('query', {}).get('pages', []):
        ii = (pg.get('imageinfo') or [None])[0]
        if not ii or ii.get('mime') not in ('image/jpeg', 'image/png', 'image/webp'): continue
        m = ii.get('extmetadata', {})
        lic = strip(m.get('LicenseShortName', {}).get('value'))
        if not OK.match(lic): continue
        if ii.get('width', 0) < 700: continue
        out.append({'file': pg['title'], 'thumb': ii.get('thumburl'), 'url': ii.get('url'), 'w': ii['width'], 'h': ii['height'],
                    'license': lic, 'licenseUrl': strip(m.get('LicenseUrl', {}).get('value')),
                    'artist': strip(m.get('Artist', {}).get('value'))[:120], 'page': ii.get('descriptionurl')})
    order = {t: i for i, t in enumerate(titles)}
    return sorted(out, key=lambda x: order.get(x['file'], 99))

def candidates(q):
    titles = []
    # 1) image principale de l'article Wikipédia (fr puis en)
    for host in ('fr.wikipedia.org', 'en.wikipedia.org'):
        d = api(host, action='query', generator='search', gsrsearch=q, gsrlimit=2, prop='pageimages', piprop='name')
        for pg in sorted(d.get('query', {}).get('pages', []), key=lambda p: p.get('index', 9)):
            if pg.get('pageimage'): titles.append('File:' + pg['pageimage'])
    # 2) recherche directe sur Commons
    d = api('commons.wikimedia.org', action='query', list='search', srsearch=q + ' filetype:bitmap', srnamespace=6, srlimit=8)
    titles += [x['title'] for x in d.get('query', {}).get('search', [])]
    seen, uniq = set(), []
    for t in titles:
        t = t.replace('_', ' ')
        if t not in seen: seen.add(t); uniq.append(t)
    return file_infos(uniq[:12])[:5]

def main():
    rec = json.load(open('scripts/recipes.json'))
    os.makedirs('cand', exist_ok=True)
    allc = {}
    for i, r in enumerate(rec):
        cs = candidates(r['q'])
        keep = []
        for k, c in enumerate(cs):
            try:
                b = S.get(c['thumb'], timeout=30).content
                im = Image.open(io.BytesIO(b)).convert('RGB'); im.thumbnail((320, 320))
                fn = f"cand/{r['id']}_{k}.jpg"; im.save(fn, 'JPEG', quality=80)
                c['cand'] = fn; keep.append(c)
            except Exception as e: print('err', r['id'], e)
        allc[r['id']] = {'title': r['title'], 'q': r['q'], 'cands': keep}
        print(i, r['id'], len(keep), flush=True)
        time.sleep(0.3)
    json.dump(allc, open('cand/candidates.json', 'w'), ensure_ascii=False, indent=1)

if __name__ == '__main__': main()
