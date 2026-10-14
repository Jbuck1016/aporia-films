"""Refine the designer's sketch logomark.

- Warps the painted sketch onto the exact vector geometry of the mark (thin-plate spline through 9 control points).
- Smooths away the pencil hatching at the inner top crease and the bottom crease, keeping the painted shading.
- Removes the uneven painted outline and redraws one consistent, hand-wobbled charcoal outline on every edge.
- Outputs the full mark, plus a "floating cube" version as two layers (body and cube) in a shared frame.
"""
import json, sys, numpy as np, cv2
from PIL import Image, ImageDraw
from scipy.interpolate import RBFInterpolator

OUT = sys.argv[1]
S = 2                      # pixels per vector unit
FX0, FY0, FW, FH = 40, 70, 1000, 940   # shared frame in vector units (room for the floating cube)
W, H = FW * S, FH * S

src = np.array([[266, 90], [153, 153], [153, 926], [261, 990], [930, 606], [928, 480], [373, 413], [594, 540], [373, 673]], float)
dst = np.array([[351, 199], [257, 256], [242, 875], [336, 929], [880, 619], [871, 517], [436, 476], [596, 566], [437, 662]], float)
oc, hc = dst[:6].mean(0), dst[6:].mean(0)
for i in range(6): v = oc - dst[i]; dst[i] += v / np.linalg.norm(v) * 6     # outer edge -> centre of painted line
for i in range(6, 9): v = dst[i] - hc; dst[i] += v / np.linalg.norm(v) * 6  # hole edge -> centre of painted line

sk = np.array(Image.open('Logo_Only_-_Sketch.png').convert('RGBA')).astype(np.float32)
# premultiply so transparent edges don't bleed when warping
sk[..., :3] *= sk[..., 3:4] / 255

rbf = RBFInterpolator(src, dst, kernel='thin_plate_spline')
ys, xs = np.mgrid[0:H, 0:W]
pts = np.c_[(xs.ravel() / S + FX0), (ys.ravel() / S + FY0)]
mp = rbf(pts).astype(np.float32)
mapx, mapy = mp[:, 0].reshape(H, W), mp[:, 1].reshape(H, W)
warp = cv2.remap(sk, mapx, mapy, cv2.INTER_CUBIC, borderMode=cv2.BORDER_CONSTANT, borderValue=0)
a = np.clip(warp[..., 3:4], 1e-3, None)
rgb = np.clip(warp[..., :3] / a * 255, 0, 255)  # un-premultiply
rgb[warp[..., 3] < 1] = 0
# Bake the semi-transparent paint (mostly the dark side) onto a solid dark base so every face is opaque
BASE = np.array([62, 60, 58], np.float32)
alpha_w = (warp[..., 3:4] / 255).clip(0, 1)
rgb = rgb * alpha_w + BASE * (1 - alpha_w)

def poly_mask(points, ss=4):
    im = Image.new('L', (W * ss // S * S // S, H * ss // S * S // S) if False else (W * 2, H * 2), 0)
    d = ImageDraw.Draw(im)
    d.polygon([((x - FX0) * S * 2, (y - FY0) * S * 2) for x, y in points], fill=255)
    return np.array(im.resize((W, H), Image.LANCZOS)).astype(np.float32) / 255

P = lambda s: [tuple(map(float, p.split(','))) for p in s.split()]
FULL = {
    'dark': P('153,153 704,477 593,540 262,349 261,990 153,926'),
    'light': P('153,153 266,90 928,480 817,544 372,800 373,673 704,477'),
    'grey': P('262,349 373,413 372,800 817,544 928,480 930,606 261,990'),
}
BODY = {
    'dark': FULL['dark'],
    'light': P('153,153 266,90 817,415 704,477') + [],  # top of the top bar
    'light2': P('704,477 817,544 372,800 373,673'),
    'grey': P('262,349 373,413 372,800 817,544 818,670 261,990'),
}
CUBE = {
    'light': P('928,480 817,415 704,477 817,544'),
    'grey': P('817,544 928,480 930,606 818,670'),
    'side': P('704,477 817,544 818,670 704,604'),
}

L = rgb @ np.array([.299, .587, .114], np.float32)

def nblur(img, w, sigma):
    num = cv2.GaussianBlur(img * w[..., None], (0, 0), sigma)
    den = cv2.GaussianBlur(w, (0, 0), sigma)[..., None]
    return num / np.clip(den, 1e-4, None)

def zone(cx, cy, r):
    d = np.hypot((xs / S + FX0) - cx, (ys / S + FY0) - cy)
    return np.clip((r - d) / (r * .45), 0, 1)

def clean_face(mask, dark_thr, zones=()):
    m = (mask > .5).astype(np.float32)
    inner = cv2.erode(m, np.ones((9, 9), np.uint8))
    local = cv2.GaussianBlur(L * inner, (0, 0), 6 * S) / np.clip(cv2.GaussianBlur(inner, (0, 0), 6 * S), 1e-4, None)
    ratio = .6 if dark_thr < 30 else .84
    bad = ((L < np.maximum(dark_thr, ratio * local)) & (inner > 0))
    bad = cv2.dilate(bad.astype(np.uint8), np.ones((3, 3), np.uint8)).astype(bool) & (m > 0)
    bad |= (m > 0) & (inner == 0)   # painted outline, its faint edges, and the rim
    good = (m > 0) & ~bad
    fill = nblur(rgb, good.astype(np.float32), 9 * S)
    # give the patch the face's own grain, and feather its edge so there is no seam
    hp = rgb - cv2.GaussianBlur(rgb, (0, 0), 1.5)
    sd = hp[good].std(0) if good.any() else np.zeros(3, np.float32)
    nz = cv2.GaussianBlur(np.random.default_rng(3).standard_normal((H, W)).astype(np.float32), (0, 0), .8)
    fill = fill + nz[..., None] * sd * 2.2
    w = np.maximum(bad.astype(np.float32), np.clip(cv2.GaussianBlur(bad.astype(np.float32), (0, 0), 3 * S) * 1.8, 0, 1)) * m
    out = rgb * (1 - w[..., None]) + fill * w[..., None]
    for z in zones:
        smooth = nblur(rgb, good.astype(np.float32), 16 * S)
        # keep a little of the original's grain so the patch doesn't look airbrushed
        grain = (rgb - cv2.GaussianBlur(rgb, (0, 0), 1.2)) * .35
        out = out * (1 - z[..., None]) + (smooth + grain) * z[..., None]
    return out

# Hatching zones, in vector units: top of the inner vertical strip, and the lower-left of the inner diagonal face
Z_TOP = zone(318, 440, 95)
Z_BOT = zone(405, 725, 85)

def neutral_dark(face, m):
    """Replace the brushed texture on the dark side with a soft, even tone like the other faces, a touch darker."""
    inside = (m > .5).astype(np.float32)
    low = nblur(face, inside, 45 * S)
    nz = cv2.GaussianBlur(np.random.default_rng(11).standard_normal((H, W)).astype(np.float32), (0, 0), .9)
    return low * .86 + nz[..., None] * 1.6

def build(faces, zones_for):
    acc = np.zeros((H, W, 3), np.float32); al = np.zeros((H, W), np.float32)
    for name, pts in faces.items():
        m = poly_mask(pts)
        thr = 18 if name in ('dark', 'side') else 70
        face = clean_face(m, thr, zones_for.get(name, ()))
        if name == 'dark': face = neutral_dark(face, m)
        acc += face * m[..., None]; al += m
    rgbf = acc / np.clip(al, 1e-4, None)[..., None]
    return rgbf, np.clip(al, 0, 1)

# ---------- Organic outline ----------
rng = np.random.default_rng(7)
def vnoise1(t, seed):
    g = np.random.default_rng(seed).random(64)
    i = np.floor(t).astype(int); f = t - i; u = f * f * (3 - 2 * f)
    return g[i % 64] * (1 - u) + g[(i + 1) % 64] * u

def edges_of(faces):
    seen, out = set(), []
    for pts in faces.values():
        for i in range(len(pts)):
            a, b = pts[i], pts[(i + 1) % len(pts)]
            key = tuple(sorted([a, b]))
            if key in seen or a == b: continue
            seen.add(key); out.append((a, b))
    # merge collinear duplicates is unnecessary: overlapping strokes just darken a little
    return out

def stroke_layer(edges, seed0=0):
    alpha = np.zeros((H, W), np.float32)
    for k, (a, b) in enumerate(edges):
        a, b = np.array(a), np.array(b)
        length = np.linalg.norm(b - a)
        if length < 1: continue
        d = (b - a) / length; n = np.array([-d[1], d[0]])
        over0, over1 = 2 + 3 * rng.random(), 2 + 3 * rng.random()
        N = max(8, int(length / 3))
        t = np.linspace(-over0 / length, 1 + over1 / length, N)
        seed = seed0 + k * 13
        wob = (vnoise1(t * length / 90, seed) - .5) * 2.6 + (vnoise1(t * length / 17, seed + 1) - .5) * .9
        width = 10.5 + (vnoise1(t * length / 60, seed + 2) - .5) * 3.2
        # taper the overshoot ends
        ends = np.clip(np.minimum(t * length + over0, (1 - t) * length + over1) / 9, .35, 1)
        width *= ends
        pts = a + np.outer(t * length, d) + np.outer(wob, n)
        lay = np.zeros((H, W), np.uint8)
        for i in range(N - 1):
            p0 = ((pts[i] - [FX0, FY0]) * S * 8).astype(int); p1 = ((pts[i + 1] - [FX0, FY0]) * S * 8).astype(int)
            cv2.line(lay, tuple(p0), tuple(p1), 255, max(1, int(width[i] * S)), cv2.LINE_AA, shift=3)
        alpha = np.maximum(alpha, lay.astype(np.float32) / 255)
    # charcoal: break up the stroke edge and body a little
    tex = np.random.default_rng(seed0 + 99).random((H, W)).astype(np.float32)
    tex = cv2.GaussianBlur(tex, (0, 0), .9)
    tex = (tex - tex.mean()) / tex.std()
    soft = cv2.GaussianBlur(alpha, (0, 0), 1.1)
    alpha = np.clip(soft * (1 + .10 * tex) + (soft > .15) * (soft < .85) * .18 * tex, 0, 1)
    return alpha

INK = np.array([10, 10, 9], np.float32)

def compose(rgbf, al, strokes):
    out_rgb = rgbf * (1 - strokes[..., None]) + INK * strokes[..., None]
    out_a = np.maximum(al, strokes)
    return np.dstack([out_rgb, out_a * 255]).clip(0, 255).astype(np.uint8)

zones_full = {'grey': (Z_TOP,), 'light': (Z_BOT,)}
full_rgb, full_a = build(FULL, zones_full)
full_s = stroke_layer(edges_of(FULL), 1)
Image.fromarray((full_s*255).astype(np.uint8)).save(f'{OUT}/strokes.png')
full = compose(full_rgb, full_a, full_s)

zones_body = {'grey': (Z_TOP,), 'light2': (Z_BOT,)}
body_rgb, body_a = build(BODY, zones_body)
body = compose(body_rgb, body_a, stroke_layer(edges_of(BODY), 1))

# Cube: top and right faces come from the painting; the side face borrows texture from the dark side of the bar.
cube_faces = {'light': CUBE['light'], 'grey': CUBE['grey']}
c_rgb, c_a = build(cube_faces, {})
side_m = poly_mask(CUBE['side'])
dark_m = poly_mask(FULL['dark'])
shift = np.float32([[1, 0, -(704 - 170) * S], [0, 1, -(477 - 470) * S]])
dark_tex = clean_face(dark_m, 18)
sx = .86
side_tex = cv2.warpAffine(dark_tex, np.float32([[1 / sx, 0, ((704 - FX0) - (158 - FX0) / sx) * S], [0, 1, (477 - 470) * S]]), (W, H), flags=cv2.INTER_LINEAR)
c_rgb = c_rgb * (1 - side_m[..., None]) + side_tex * side_m[..., None]
c_a = np.maximum(c_a, side_m)
cube_edges = edges_of({**cube_faces, 'side': CUBE['side']})
cube = compose(c_rgb, c_a, stroke_layer(cube_edges, 50))
# The attached cube hides its side face: a second cube layer without it
c2 = compose(*build(cube_faces, {}), stroke_layer(edges_of(cube_faces), 50))

def save(arr, name):
    Image.fromarray(arr, 'RGBA').save(f'{OUT}/{name}.png')
save(full, 'sketch2-full'); save(body, 'sketch2-body'); save(cube, 'sketch2-cube'); save(c2, 'sketch2-cube-attached')
json.dump({'frame': [FX0, FY0, FW, FH], 'scale': S}, open(f'{OUT}/sketch2.json', 'w'))
print('ok', W, H)
