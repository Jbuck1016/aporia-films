"""Generate the site's brand assets in the chosen tones (Lifted, Nitrate palette)."""
import json, io, numpy as np
from PIL import Image, ImageDraw

PUB = '/home/claude/aporia-films/public'
hexrgb = lambda h: np.array([int(h[i:i + 2], 16) for i in (1, 3, 5)], np.float32)
tohex = lambda c: '#' + ''.join(f'{int(round(max(0, min(255, v)))):02x}' for v in c)
mix = lambda a, b, t: tohex(hexrgb(a) + (hexrgb(b) - hexrgb(a)) * t)

G, T = '#1b1e1e', '#e9eeec'          # Nitrate ground and text
TONES = {'dark': mix(G, T, .2), 'mid': mix('#8f8e89', T, .08), 'light': T, 'outline': G, 'ink': mix(G, '#000000', .55)}
print('tones', TONES)

# ---------- Home logo: refined sketch, greys remapped onto the tones ----------
S, FX0, FY0 = 2, 40, 70
im = Image.open('/home/claude/logos/out/sketch2-full.png').convert('RGBA')
a = np.array(im).astype(np.float32)
stops = [(0, TONES['ink']), (22, TONES['ink']), (50, TONES['dark']), (140, TONES['mid']), (240, TONES['light']), (255, TONES['light'])]
lut = np.zeros((256, 3), np.float32)
for L in range(256):
    i = 0
    while i < len(stops) - 2 and L > stops[i + 1][0]: i += 1
    (l0, c0), (l1, c1) = stops[i], stops[i + 1]
    t = min(1, max(0, (L - l0) / (l1 - l0)))
    lut[L] = hexrgb(c0) + (hexrgb(c1) - hexrgb(c0)) * t
Lm = np.clip(np.round(a[..., 0] * .299 + a[..., 1] * .587 + a[..., 2] * .114), 0, 255).astype(int)
a[..., :3] = lut[Lm]
mapped = Image.fromarray(a.clip(0, 255).astype(np.uint8), 'RGBA')
bx0, by0, bx1, by1 = mapped.split()[3].getbbox()
pad = 6
bx0, by0, bx1, by1 = bx0 - pad, by0 - pad, bx1 + pad, by1 + pad
crop = mapped.crop((bx0, by0, bx1, by1))
meta = {'x0': FX0 + bx0 / S, 'y0': FY0 + by0 / S, 'w': (bx1 - bx0) / S, 'h': (by1 - by0) / S}
W = 640
hero = crop.resize((W, round(crop.height * W / crop.width)), Image.LANCZOS)
hero.save(f'{PUB}/assets/mark-hero.webp', 'WEBP', quality=88, method=6)
meta['px'] = list(hero.size)
json.dump(meta, open('/home/claude/logos/mark-hero.json', 'w'))
print('hero', hero.size, meta)

# ---------- Full-triangle vector mark ----------
FULL = {
    'dark': '153,153 704,477 593,540 262,349 261,990 153,926',
    'light': '153,153 266,90 928,480 817,544 372,800 373,673 704,477',
    'grey': '262,349 373,413 372,800 817,544 928,480 930,606 261,990',
}
fill = {'dark': TONES['dark'], 'light': TONES['light'], 'grey': TONES['mid']}
VB = (143, 81, 794, 918)
svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{" ".join(map(str, VB))}">'
       f'<g stroke="{TONES["outline"]}" stroke-width="5" stroke-linejoin="round">'
       + ''.join(f'<polygon fill="{fill[k]}" points="{v}"/>' for k, v in FULL.items()) + '</g></svg>\n')
open(f'{PUB}/assets/mark.svg', 'w').write(svg)

def raster_mark(h, on_tile=None, size=None, inset=.78):
    """Draw the vector mark with PIL at 8x and downsample. on_tile: background square colour."""
    ss = 8
    if size is None:
        w = round(h * VB[2] / VB[3]); canvas = (w * ss, h * ss); ox = oy = 0; scale = h * ss / VB[3]
    else:
        canvas = (size * ss, size * ss); mh = size * inset * ss; scale = mh / VB[3]
        ox = (canvas[0] - VB[2] * scale) / 2 + size * ss * .03; oy = (canvas[1] - mh) / 2
    img = Image.new('RGBA', canvas, (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    if on_tile:
        r = round(canvas[0] * .22)
        d.rounded_rectangle((0, 0, canvas[0] - 1, canvas[1] - 1), radius=r, fill=on_tile)
    for k, v in FULL.items():
        pts = [((float(x) - VB[0]) * scale + ox, (float(y) - VB[1]) * scale + oy) for x, y in (p.split(',') for p in v.split())]
        d.polygon(pts, fill=fill[k], outline=TONES['outline'], width=max(1, round(5 * scale)))
    return img.resize((canvas[0] // ss, canvas[1] // ss), Image.LANCZOS)

# Tab icons: the mark on a small square in the ground colour, so it reads on light and dark tabs
fav32 = raster_mark(None, on_tile=G, size=32, inset=.8); fav32.save(f'{PUB}/assets/favicon-32.png')
icons = [raster_mark(None, on_tile=G, size=s, inset=.8) for s in (16, 32, 48)]
icons[2].save(f'{PUB}/favicon.ico', sizes=[(16, 16), (32, 32), (48, 48)], append_images=icons[:2])
# Apple touch icon: a full square (iOS rounds the corners itself)
apple = Image.new('RGBA', (180, 180), G)
apple.alpha_composite(raster_mark(None, size=180, inset=.66))
apple.convert('RGB').save(f'{PUB}/apple-touch-icon.png')
# SVG favicon for browsers that prefer it
tile = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="{G}"/>'
        f'<g transform="translate({(64 - 51.2 * VB[2] / VB[3]) / 2 + 2:.2f} 6.4) scale({51.2 / VB[3]:.5f}) translate({-VB[0]} {-VB[1]})">'
        f'<g stroke="{TONES["outline"]}" stroke-width="5" stroke-linejoin="round">'
        + ''.join(f'<polygon fill="{fill[k]}" points="{v}"/>' for k, v in FULL.items()) + '</g></g></svg>\n')
open(f'{PUB}/favicon.svg', 'w').write(tile)

# ---------- Fine film grain tile ----------
rng = np.random.default_rng(1895)  # the year of the first public film screening
n = (rng.random((180, 180)) + rng.random((180, 180)) + rng.random((180, 180)) - 1.5) * 120 + 128
Image.fromarray(np.clip(n, 0, 255).astype(np.uint8), 'L').save(f'{PUB}/assets/grain-fine.png', optimize=True)
print('done')
