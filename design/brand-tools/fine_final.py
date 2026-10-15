"""Fine-grain logo with thinner outlines, mapped to the site's tones and cropped exactly like the live mark-hero.webp."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__))); os.chdir(os.path.dirname(os.path.abspath(__file__)))
from lv_lib import *  # noqa
E = edges_of(FULL)
masks = {k: poly_mask(v) for k, v in FULL.items()}
A = np.clip(sum(masks.values()), 0, 1)
g1 = grain(201, .85, 1)
lum = np.zeros_like(LUM)
for k, m in masks.items(): lum += np.clip(LUM + g1 * (9 if k == 'dark' else 13), 0, 252) * m
lum = lum / np.clip(A, 1e-4, None)

hexrgb = lambda h: np.array([int(h[i:i + 2], 16) for i in (1, 3, 5)], np.float32)
tohex = lambda c: '#' + ''.join(f'{int(round(max(0, min(255, v)))):02x}' for v in c)
mix = lambda a, b, t: tohex(hexrgb(a) + (hexrgb(b) - hexrgb(a)) * t)
G, T = '#1b1e1e', '#e9eeec'
TN = {'dark': mix(G, T, .2), 'mid': mix('#8f8e89', T, .08), 'light': T, 'ink': mix(G, '#000000', .55)}
stops = [(0, TN['ink']), (22, TN['ink']), (50, TN['dark']), (140, TN['mid']), (240, TN['light']), (255, TN['light'])]
lut = np.zeros((256, 3), np.float32)
for L in range(256):
    i = 0
    while i < len(stops) - 2 and L > stops[i + 1][0]: i += 1
    (l0, c0), (l1, c1) = stops[i], stops[i + 1]; t = min(1, max(0, (L - l0) / (l1 - l0))); lut[L] = hexrgb(c0) + (hexrgb(c1) - hexrgb(c0)) * t
CROP = (203, 22, 1799, 1863)  # same box as the live mark-hero.webp (MARK in app.js: x0 141.5, y0 81, w 798)
os.makedirs('out/final', exist_ok=True)
for name, w in [('w115', 11.5), ('w9', 9), ('w7', 7.5)]:
    line = stroke(E, 101, width=w, wvar=1.0 * w / 11.5, over=(2, 4.5), wob=.6, streak=.06, broken=.1)
    # round joins: a disc at every corner so tapered line ends never leave a notch
    joins = np.zeros((H, W), np.uint8)
    for pts in FULL.values():
        for (x, y) in pts:
            px, py = (x - FX0) * S, (y - FY0) * S
            cv2.circle(joins, (int(px * 8), int(py * 8)), int(w * S / 2 * 8), 255, -1, cv2.LINE_AA, shift=3)
    line = np.maximum(line, cv2.GaussianBlur(joins.astype(np.float32) / 255, (0, 0), .9))
    rgba = compose(lum, A, line).astype(np.float32)
    Lm = np.clip(np.round(rgba[..., 0]), 0, 255).astype(int); rgba[..., :3] = lut[Lm]
    im = Image.fromarray(rgba.clip(0, 255).astype(np.uint8), 'RGBA').crop(CROP).resize((640, 738), Image.LANCZOS)
    im.save(f'out/final/fine-{name}.webp', 'WEBP', quality=88, method=6)
    print(name, os.path.getsize(f'out/final/fine-{name}.webp') // 1024, 'KB')
