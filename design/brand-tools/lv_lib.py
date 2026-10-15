"""Hand-made variants of the Aporia mark, built from the refined sketch's painted faces.

Each variant = shape (wobble) + line (marker / charcoal / offset / none) + fill (painted / mottled / wash / riso / paper).
Outputs greyscale-tone RGBA PNGs (dark side ~40, mid ~140, light ~238, ink ~10) to out/variants/, then maps them onto
the site's Nitrate tones and writes 640px WebPs for the comparison page.
"""
import json, sys, numpy as np, cv2
from PIL import Image

OUT = 'out/variants'
S, FX0, FY0 = 2, 40, 70
W, H = 1000 * S, 940 * S
P = lambda s: [tuple(map(float, p.split(','))) for p in s.split()]
FULL = {
    'dark': P('153,153 704,477 593,540 262,349 261,990 153,926'),
    'light': P('153,153 266,90 928,480 817,544 372,800 373,673 704,477'),
    'grey': P('262,349 373,413 372,800 817,544 928,480 930,606 261,990'),
}
BASE = {'dark': 40, 'grey': 140, 'light': 238}
faces = np.load('out/faces.npz')
PAINT, PAINT_A = faces['rgb'].astype(np.float32), faces['a'].astype(np.float32)
LUM = PAINT @ np.array([.299, .587, .114], np.float32)
ys, xs = np.mgrid[0:H, 0:W].astype(np.float32)
toPx = lambda x, y: ((x - FX0) * S, (y - FY0) * S)

def field(seed, sigma, amp):
    """Smooth random field in px: Gaussian-blurred noise, scaled to +-amp."""
    r = np.random.default_rng(seed).standard_normal((H // 8, W // 8)).astype(np.float32)
    r = cv2.GaussianBlur(r, (0, 0), sigma / 8)
    r = cv2.resize(r, (W, H), interpolation=cv2.INTER_CUBIC)
    return r / (np.abs(r).max() + 1e-6) * amp

def fbm(seed, scales, weights):
    acc = np.zeros((H, W), np.float32)
    for i, (sc, w) in enumerate(zip(scales, weights)):
        f = field(seed + i, sc, 1); acc += f * w
    return acc / sum(weights)

def poly_mask(pts, warp=None, grow=0):
    """Antialiased polygon mask; warp displaces each (densely sampled) edge point by the wobble field."""
    dense = []
    for i in range(len(pts)):
        a, b = np.array(pts[i]), np.array(pts[(i + 1) % len(pts)])
        n = max(2, int(np.linalg.norm(b - a) / 2))
        for t in np.linspace(0, 1, n, endpoint=False):
            x, y = toPx(*(a + (b - a) * t))
            if warp is not None:
                xi, yi = int(np.clip(x, 0, W - 1)), int(np.clip(y, 0, H - 1)); x += warp[0][yi, xi]; y += warp[1][yi, xi]
            dense.append((x * 4, y * 4))
    m = np.zeros((H, W), np.uint8)
    cv2.fillPoly(m, [np.array(dense, np.int32)], 255, cv2.LINE_AA, shift=2)
    m = m.astype(np.float32) / 255
    if grow: m = cv2.dilate(m, np.ones((grow, grow), np.uint8))
    return m

def warp_img(img, warp):
    if warp is None: return img
    return cv2.remap(img, xs - warp[0], ys - warp[1], cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT, borderValue=0)

def edges_of(faces):
    seen, out = set(), []
    for pts in faces.values():
        for i in range(len(pts)):
            a, b = pts[i], pts[(i + 1) % len(pts)]
            k = tuple(sorted([a, b]))
            if k not in seen: seen.add(k); out.append((a, b))
    return out

def stroke(edges, seed, width=11, wvar=3, over=(3, 8), wob=2.2, warp=None, broken=0.0, streak=0.0):
    """Hand-drawn line on every edge. width/wvar/over/wob in vector units."""
    rng = np.random.default_rng(seed)
    alpha = np.zeros((H, W), np.float32)
    for k, (a, b) in enumerate(edges):
        a, b = np.array(a), np.array(b)
        L = np.linalg.norm(b - a); d = (b - a) / L; n = np.array([-d[1], d[0]])
        o0, o1 = rng.uniform(*over), rng.uniform(*over)
        N = max(10, int((L + o0 + o1) / 1.2))
        t = np.linspace(-o0, L + o1, N)
        g = np.random.default_rng(seed * 100 + k)
        def smooth(scale):
            knots = g.standard_normal(int((L + o0 + o1) / scale) + 3)
            return np.interp(t, np.linspace(-o0, L + o1, len(knots)), knots)
        off = smooth(80) * wob + smooth(18) * wob * .3
        wdt = width + smooth(55) * wvar
        ends = np.clip(np.minimum(t + o0, L + o1 - t) / 10, .45, 1)  # taper at the very ends
        wdt = np.maximum(1.5, wdt * ends)
        lay = np.zeros((H, W), np.uint8)
        for i in range(N):
            x, y = toPx(*(a + d * t[i] + n * off[i]))
            if warp is not None:
                xi, yi = int(np.clip(x, 0, W - 1)), int(np.clip(y, 0, H - 1)); x += warp[0][yi, xi]; y += warp[1][yi, xi]
            cv2.circle(lay, (int(x * 8), int(y * 8)), int(wdt[i] * S / 2 * 8), 255, -1, cv2.LINE_AA, shift=3)
        la = lay.astype(np.float32) / 255
        if streak:
            # marker streaks: noise smeared along the stroke direction
            ang = np.degrees(np.arctan2(d[1], d[0]))
            ksz = 31; ker = np.zeros((ksz, ksz), np.float32); ker[ksz // 2, :] = 1
            ker = cv2.warpAffine(ker, cv2.getRotationMatrix2D((ksz / 2 - .5, ksz / 2 - .5), -ang, 1), (ksz, ksz)); ker /= ker.sum()
            nz = cv2.filter2D(np.random.default_rng(seed + k).random((H, W)).astype(np.float32), -1, ker)
            nz = (nz - nz.mean()) / (nz.std() + 1e-6)
            la = la * np.clip(1 - streak * (.5 + .5 * nz), 0, 1)
        alpha = np.maximum(alpha, la)
    if broken:
        nz = cv2.GaussianBlur(np.random.default_rng(seed + 7).random((H, W)).astype(np.float32), (0, 0), 1.6)
        nz = (nz - nz.mean()) / nz.std()
        alpha = alpha * np.clip(1.15 - broken * np.maximum(0, nz), 0, 1)
    soft = cv2.GaussianBlur(alpha, (0, 0), .9)
    grain = cv2.GaussianBlur(np.random.default_rng(seed + 3).standard_normal((H, W)).astype(np.float32), (0, 0), .8)
    return np.clip(soft * (1 + .06 * grain), 0, 1)

def face_masks(warp):
    return {k: poly_mask(v, warp) for k, v in FULL.items()}

def flat_faces(masks, tex=None, amount=0):
    rgb = np.zeros((H, W), np.float32); a = np.zeros((H, W), np.float32)
    for k, m in masks.items():
        v = BASE[k] * (1 + (tex if tex is not None else 0) * amount * (1.4 if k == 'dark' else 1))
        rgb += v * m; a += m
    return rgb / np.clip(a, 1e-4, None), np.clip(a, 0, 1)

def compose(lum, a, ink=None, ink_val=10, ink_shift=(0, 0)):
    if ink is not None:
        if ink_shift != (0, 0):
            M = np.float32([[1, 0, ink_shift[0] * S], [0, 1, ink_shift[1] * S]]); ink = cv2.warpAffine(ink, M, (W, H))
        lum = lum * (1 - ink) + ink_val * ink
        a = np.maximum(a, ink)
    g = np.clip(lum, 0, 255)
    return np.dstack([g, g, g, np.clip(a, 0, 1) * 255]).astype(np.uint8)

def grain(seed, sigma=.8, amp=1):
    g = cv2.GaussianBlur(np.random.default_rng(seed).standard_normal((H, W)).astype(np.float32), (0, 0), sigma)
    return g / g.std() * amp

