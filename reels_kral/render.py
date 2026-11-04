#!/usr/bin/env python3
"""Kral ve Muhafiz - Instagram Reels (1080x1920, 30fps)
Fully procedural cinematic renderer (numpy + Pillow + ffmpeg).

Usage:
  python3 render.py preview 5.0 14.0 ...   # write preview PNGs for global times
  python3 render.py render [scene ...]      # render scene clips into build/
"""
import math
import os
import subprocess
import sys
from multiprocessing import Pool

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

from timeline import CAPTIONS, FPS, H, SCENES, W, WALL_TEXT

OS = 1.12
WW, WH = int(W * OS), int(H * OS)
HERE = os.path.dirname(os.path.abspath(__file__))
BUILD = os.path.join(HERE, "build")

F_MONT = "/usr/share/fonts/truetype/montserrat/Montserrat-ExtraBold.ttf"
F_GAR_B = "/usr/share/fonts/opentype/ebgaramond/EBGaramond12-Regular.otf"
F_GAR_I = "/usr/share/fonts/opentype/ebgaramond/EBGaramond12-Italic.otf"

BLUR = ImageFilter.GaussianBlur


# ----------------------------------------------------------------- helpers
def smooth(x):
    x = min(max(x, 0.0), 1.0)
    return x * x * (3 - 2 * x)


def lerp(a, b, t):
    return a + (b - a) * t


def fbm(w, h, seed, octaves=6, base=3, persist=0.5):
    r = np.random.default_rng(seed)
    out = np.zeros((h, w), np.float32)
    amp, tot = 1.0, 0.0
    for o in range(octaves):
        gw = max(2, int(base * 2 ** o))
        gh = max(2, int(gw * h / w))
        a = r.random((gh, gw)).astype(np.float32)
        im = Image.fromarray(a).resize((w, h), Image.BICUBIC)
        out += np.asarray(im, np.float32) * amp
        tot += amp
        amp *= persist
    out /= tot
    return (out - out.min()) / (out.max() - out.min() + 1e-6)


def vgrad(w, h, stops):
    ys = np.linspace(0, 1, h)
    ps = [s[0] for s in stops]
    col = np.stack([np.interp(ys, ps, [s[1][c] for s in stops]) for c in range(3)], -1)
    return np.repeat(col[:, None, :].astype(np.float32), w, 1)


def glow_map(w, h, cx, cy, r):
    y, x = np.ogrid[:h, :w]
    d2 = ((x - cx) ** 2 + (y - cy) ** 2) / float(r * r)
    return (1.0 / (1.0 + d2 * 1.6)).astype(np.float32)


def to_img(arr):
    return Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))


def blur_arr(a, r):
    if r <= 0:
        return a
    mx = float(a.max())
    if mx <= 0:
        return a.astype(np.float32)
    im = Image.fromarray(np.clip(a / mx * 255.0, 0, 255).astype(np.uint8)).filter(BLUR(r))
    return np.asarray(im, np.float32) * (mx / 255.0)


def stone_wall(w, h, seed, block_h=90, block_w=(150, 260), base=(60, 62, 70), var=16):
    rng = np.random.default_rng(seed)
    n = fbm(w, h, seed, 6, 4)
    fine = fbm(w, h, seed + 1, 4, 80)
    arr = np.zeros((h, w, 3), np.float32) + np.array(base, np.float32)
    mort = Image.new("L", (w, h), 0)
    d = ImageDraw.Draw(mort)
    shade = np.zeros((h, w), np.float32)
    bev = np.zeros((h, w), np.float32)
    y = 0
    while y < h:
        x = -int(rng.integers(0, 200))
        bh = int(block_h * rng.uniform(0.85, 1.15))
        while x < w:
            bw = int(rng.integers(*block_w))
            x0, x1 = max(0, x), min(w, x + bw)
            if x1 > x0:
                shade[y:y + bh, x0:x1] = rng.normal(0, 1)
                ramp = np.linspace(1, -1, min(bh, h - y))[:, None]
                bev[y:y + bh, x0:x1] = ramp
            d.rectangle([x, y, x + bw, y + bh], outline=255, width=max(3, block_h // 18))
            x += bw
        y += bh
    mortar = np.asarray(mort.filter(BLUR(max(1.5, block_h / 40))), np.float32) / 255
    arr += shade[..., None] * var
    arr *= (0.72 + 0.56 * n)[..., None]
    arr += (fine[..., None] - 0.5) * 34
    arr += bev[..., None] * 7
    arr *= (1 - 0.6 * mortar)[..., None]
    return arr


def grade(arr, sat=1.0, contrast=1.0, tint=(1, 1, 1), lift=(0, 0, 0)):
    if sat != 1.0:
        lum = (arr @ np.array([0.299, 0.587, 0.114], np.float32))[..., None]
        arr = lum + (arr - lum) * sat
    if contrast != 1.0:
        arr = (arr - 118) * contrast + 118
    arr = arr * np.array(tint, np.float32) + np.array(lift, np.float32)
    return arr


# ------------------------------------------------------------- characters
def chaikin(pts, it=2):
    for _ in range(it):
        out = []
        n = len(pts)
        for i in range(n):
            (x0, y0), (x1, y1) = pts[i], pts[(i + 1) % n]
            out.append((0.75 * x0 + 0.25 * x1, 0.75 * y0 + 0.25 * y1))
            out.append((0.25 * x0 + 0.75 * x1, 0.25 * y0 + 0.75 * y1))
        pts = out
    return pts


class Sil:
    """Silhouette drawing helper on a supersampled local canvas."""

    SS = 2

    def __init__(self, s, facing=1, wmul=1.3, hmul=1.5, foot=1.40):
        self.s, self.f = s, facing
        self.cw, self.ch = int(s * wmul), int(s * hmul)
        self.fx, self.fy = self.cw / 2, s * foot
        self.m = Image.new("L", (self.cw * self.SS, self.ch * self.SS), 0)
        self.d = ImageDraw.Draw(self.m)

    def p(self, x, y):
        k = self.SS
        return ((self.fx + self.f * x * self.s) * k, (self.fy + y * self.s) * k)

    def poly(self, pts, sharp=False):
        q = [self.p(*a) for a in pts]
        if not sharp:
            q = chaikin(q, 2)
        self.d.polygon(q, fill=255)

    def ell(self, cx, cy, rx, ry):
        X, Y = self.p(cx, cy)
        k = self.SS * self.s
        self.d.ellipse([X - rx * k, Y - ry * k, X + rx * k, Y + ry * k], fill=255)

    def line(self, a, b, w):
        self.d.line([self.p(*a), self.p(*b)], fill=255, width=max(2, int(w * self.s * self.SS)))

    def mask(self):
        return self.m.resize((self.cw, self.ch), Image.LANCZOS)

    def abs(self, x, y):
        """local-canvas coordinates (not supersampled) of a relative point"""
        return (self.fx + self.f * x * self.s, self.fy + y * self.s)


def king_shape(S, arm="torch"):
    # long robe with a train trailing behind, slight waist, folds at the hem
    S.poly([(-0.12, -0.80), (0.12, -0.80), (0.135, -0.62), (0.12, -0.48), (0.15, -0.30), (0.19, -0.10),
            (0.215, -0.01), (0.17, 0.0), (0.12, -0.012), (0.06, 0.0), (0.0, -0.01), (-0.08, 0.0),
            (-0.20, 0.0), (-0.34, 0.004), (-0.40, -0.004), (-0.30, -0.03), (-0.21, -0.10), (-0.16, -0.32),
            (-0.13, -0.55)])
    # heavy fur mantle / collar
    S.poly([(-0.20, -0.74), (-0.17, -0.80), (-0.09, -0.835), (-0.03, -0.845), (0.05, -0.845), (0.11, -0.83),
            (0.18, -0.80), (0.215, -0.74), (0.20, -0.70), (0.16, -0.72), (0.12, -0.69), (0.07, -0.72),
            (0.02, -0.69), (-0.04, -0.72), (-0.09, -0.69), (-0.14, -0.72), (-0.18, -0.69)])
    # neck + head + beard + nose
    S.poly([(-0.025, -0.84), (0.04, -0.84), (0.035, -0.87), (-0.02, -0.87)])
    S.ell(0.012, -0.888, 0.048, 0.06)
    S.poly([(0.0, -0.87), (0.06, -0.872), (0.072, -0.845), (0.055, -0.80), (0.02, -0.795), (-0.02, -0.83)])
    S.poly([(0.052, -0.905), (0.076, -0.885), (0.056, -0.876)], sharp=True)
    # crown
    S.poly([(-0.042, -0.928), (0.068, -0.928), (0.07, -0.955), (-0.044, -0.955)], sharp=True)
    for k in range(5):
        x0 = -0.044 + k * 0.0228
        S.poly([(x0, -0.952), (x0 + 0.0114, -0.985 - 0.006 * (k % 2)), (x0 + 0.0228, -0.952)], sharp=True)
    flame = None
    if arm == "torch":
        S.poly([(0.04, -0.77), (0.12, -0.75), (0.17, -0.64), (0.27, -0.62), (0.27, -0.58), (0.20, -0.58),
                (0.13, -0.62), (0.08, -0.70)])
        S.ell(0.265, -0.60, 0.026, 0.028)
        S.line((0.255, -0.53), (0.282, -0.80), 0.014)
        S.poly([(0.268, -0.80), (0.298, -0.80), (0.294, -0.77), (0.272, -0.77)], sharp=True)
        flame = S.abs(0.283, -0.805)
    elif arm == "reach":
        S.poly([(0.04, -0.78), (0.12, -0.775), (0.25, -0.76), (0.37, -0.75), (0.37, -0.715), (0.24, -0.715),
                (0.10, -0.68)])
        S.ell(0.37, -0.733, 0.026, 0.022)
        S.poly([(-0.10, -0.74), (-0.15, -0.60), (-0.15, -0.46), (-0.11, -0.46), (-0.10, -0.60)])
        S.line((-0.13, -0.42), (-0.16, -0.70), 0.014)
        flame = S.abs(-0.162, -0.705)
    return flame


def guard_shape(S, crouch=0.0):
    c = crouch
    # legs (wrapped boots)
    S.poly([(-0.068, -0.30), (-0.012, -0.30), (-0.016, -0.03), (-0.008, 0.0), (-0.09, 0.0), (-0.075, -0.03)])
    S.poly([(0.012, -0.30), (0.068, -0.30), (0.075, -0.03), (0.095, 0.0), (0.02, 0.0), (0.018, -0.03)])
    # thin cloak with ragged hem, hunched shoulders
    S.poly([(-0.085, -0.765 + c), (0.075, -0.775 + c), (0.10, -0.70 + c), (0.11, -0.50), (0.125, -0.27),
            (0.10, -0.24), (0.07, -0.265), (0.03, -0.22), (-0.01, -0.255), (-0.05, -0.215), (-0.09, -0.25),
            (-0.13, -0.235), (-0.115, -0.45), (-0.11, -0.66 + c)])
    S.ell(-0.01, -0.765 + c, 0.095, 0.034)
    # head, hooded neck, nose
    S.poly([(-0.03, -0.78 + c), (0.035, -0.78 + c), (0.03, -0.83 + c), (-0.025, -0.83 + c)])
    S.ell(0.01, -0.853 + c, 0.043, 0.052)
    S.poly([(0.045, -0.866 + c), (0.064, -0.85 + c), (0.046, -0.842 + c)], sharp=True)
    # chapel-de-fer helmet: drooping brim + pointed dome
    S.poly([(-0.10, -0.875 + c), (-0.06, -0.895 + c), (0.06, -0.895 + c), (0.10, -0.875 + c),
            (0.095, -0.868 + c), (-0.095, -0.868 + c)])
    S.poly([(-0.052, -0.89 + c), (-0.047, -0.925 + c), (-0.02, -0.952 + c), (0.0, -0.962 + c),
            (0.02, -0.952 + c), (0.047, -0.925 + c), (0.052, -0.89 + c)])
    # spear
    S.line((0.16, 0.0), (0.16, -1.22), 0.009)
    S.poly([(0.16, -1.33), (0.174, -1.26), (0.168, -1.215), (0.152, -1.215), (0.146, -1.26)], sharp=True)
    # arm holding the spear, other arm wrapped around the body (cold)
    S.poly([(0.03, -0.75 + c), (0.09, -0.735 + c), (0.12, -0.64), (0.17, -0.575), (0.145, -0.535),
            (0.09, -0.60), (0.05, -0.68)])
    S.ell(0.158, -0.555, 0.02, 0.024)
    return S.abs(0.058, -0.858 + c)  # mouth


def guard_dead_shape(S):
    S.poly([(0.0, -0.20), (0.30, -0.11), (0.42, -0.06), (0.45, 0.0), (0.0, 0.0)])
    S.ell(0.45, -0.045, 0.03, 0.045)
    S.poly([(-0.07, -0.01), (0.12, -0.01), (0.10, -0.40), (-0.08, -0.46)])
    S.ell(0.01, -0.44, 0.10, 0.04)
    S.ell(0.09, -0.455, 0.045, 0.052)
    S.ell(0.115, -0.49, 0.052, 0.04)
    S.poly([(0.03, -0.50), (0.19, -0.455), (0.19, -0.435), (0.03, -0.478)])
    S.poly([(0.05, -0.41), (0.10, -0.39), (0.21, -0.16), (0.17, -0.13)])
    S.ell(0.19, -0.14, 0.025, 0.022)
    S.line((-0.30, 0.0), (0.95, -0.02), 0.010)
    S.poly([(0.95, -0.035), (1.05, -0.022), (0.95, -0.005)])


def throne_shape(S):
    S.poly([(-0.21, 0.36), (-0.21, -0.80), (-0.19, -0.86), (-0.16, -0.95), (-0.13, -0.86), (-0.07, -0.86),
            (-0.04, -0.95), (-0.01, -0.86), (0.01, -0.80), (0.01, 0.36), (-0.03, 0.36), (-0.03, 0.06),
            (-0.17, 0.06), (-0.17, 0.36)], sharp=True)
    S.poly([(-0.17, -0.01), (0.27, -0.01), (0.27, 0.06), (-0.17, 0.06)], sharp=True)
    S.line((0.245, 0.05), (0.245, 0.36), 0.03)


def king_seated_shape(S):
    S.poly([(-0.12, 0.02), (0.10, 0.02), (0.11, -0.25), (0.09, -0.42), (-0.10, -0.44), (-0.13, -0.2)])
    S.poly([(-0.05, -0.10), (0.30, -0.09), (0.33, -0.02), (0.31, 0.34), (0.20, 0.36), (0.19, 0.05), (-0.05, 0.05)])
    S.poly([(-0.16, -0.40), (-0.10, -0.46), (0.0, -0.475), (0.09, -0.46), (0.15, -0.40), (0.12, -0.36),
            (0.06, -0.38), (0.0, -0.36), (-0.06, -0.38), (-0.12, -0.36)])
    S.ell(0.02, -0.53, 0.048, 0.058)
    S.poly([(0.01, -0.51), (0.07, -0.505), (0.075, -0.48), (0.055, -0.44), (0.015, -0.44), (-0.02, -0.47)])
    S.poly([(0.06, -0.545), (0.083, -0.527), (0.062, -0.517)], sharp=True)
    S.poly([(-0.03, -0.57), (0.075, -0.57), (0.077, -0.597), (-0.032, -0.597)], sharp=True)
    for k in range(5):
        x0 = -0.032 + k * 0.0218
        S.poly([(x0, -0.594), (x0 + 0.0109, -0.625), (x0 + 0.0218, -0.594)], sharp=True)
    S.poly([(0.03, -0.41), (0.09, -0.40), (0.13, -0.22), (0.25, -0.31), (0.27, -0.28), (0.12, -0.17), (0.07, -0.20)])
    S.poly([(0.233, -0.385), (0.297, -0.385), (0.282, -0.335), (0.248, -0.335)], sharp=True)
    S.line((0.265, -0.335), (0.265, -0.30), 0.008)
    S.poly([(0.245, -0.30), (0.285, -0.30), (0.285, -0.288), (0.245, -0.288)], sharp=True)


def sil_layer(mask, fill, rims, tex_seed=None):
    m = np.asarray(mask, np.float32) / 255.0
    h, w = m.shape
    rgb = np.zeros((h, w, 3), np.float32) + np.array(fill, np.float32)
    if tex_seed is not None:
        rgb *= (0.8 + 0.4 * fbm(w, h, tex_seed, 5, 6))[..., None]
    for (lx, ly), wd, col, stg, bl in rims:
        sh = np.roll(m, (int(round(-ly * wd)), int(round(-lx * wd))), (0, 1))
        e = np.clip(m - sh, 0, 1)
        e = blur_arr(e, bl) * m
        rgb += e[..., None] * np.array(col, np.float32) * stg
    out = np.dstack([np.clip(rgb, 0, 255), m * 255]).astype(np.uint8)
    return Image.fromarray(out, "RGBA")


def paste_sprite(base, spr, x, y):
    base.paste(spr, (int(round(x)), int(round(y))), spr)


# ------------------------------------------------------------- fx sprites
def flame_sprite(size, t, seed, strength=1.0):
    cw, ch = int(size * 2.2), int(size * 3.4)
    img = Image.new("RGBA", (cw, ch), (0, 0, 0, 0))
    if strength <= 0.02:
        return img, (cw / 2, ch * 0.85)
    d = ImageDraw.Draw(img)
    fl = 0.82 + 0.13 * math.sin(t * 13 + seed) + 0.08 * math.sin(t * 31 + seed * 2.3) + 0.05 * math.sin(t * 57 + seed)
    sway = size * 0.18 * math.sin(t * 7.3 + seed) + size * 0.07 * math.sin(t * 17 + seed)
    bx, by = cw / 2, ch * 0.85
    d.ellipse([bx - size * 0.95, by - size * 1.5, bx + size * 0.95, by + size * 0.4], fill=(255, 110, 30, 50))
    for k, col in [(1.0, (255, 85, 10, 170)), (0.76, (255, 140, 25, 215)), (0.52, (255, 200, 80, 240)), (0.3, (255, 246, 205, 255))]:
        w = size * 0.5 * k * strength ** 0.5
        hh = size * 2.0 * k * fl * strength
        pts = [(bx - w, by), (bx - w * 0.8, by - hh * 0.4), (bx + sway * k * 0.6, by - hh * 0.8), (bx + sway * k, by - hh),
               (bx + w * 0.8, by - hh * 0.42), (bx + w, by)]
        d.polygon(pts, fill=col)
        d.ellipse([bx - w, by - w * 0.9, bx + w, by + w * 0.55], fill=col)
    img = img.filter(BLUR(max(1.0, size * 0.1)))
    return img, (bx, by)


def draw_flame(base, x, y, size, t, seed, strength=1.0):
    spr, (bx, by) = flame_sprite(size, t, seed, strength)
    paste_sprite(base, spr, x - bx, y - by)


def flicker(t, seed, amt=0.18):
    return 1.0 + amt * (0.55 * math.sin(t * 11 + seed) + 0.3 * math.sin(t * 23.7 + seed * 1.7) + 0.15 * math.sin(t * 41 + seed * 3.1))


def draw_puffs(base, mouth, t, period, offset, direction, scale, seed=0):
    """breath vapour puffs drawn onto RGBA base (world)."""
    mx, my = mouth
    k = (t - offset) / period
    for n in range(int(math.floor(k)) - 1, int(math.floor(k)) + 1):
        if n < 0:
            continue
        a = (t - offset - n * period) / 1.5
        if not (0 <= a < 1):
            continue
        r = scale * (0.02 + 0.07 * a)
        cx = mx + direction * scale * (0.03 + 0.16 * a)
        cy = my - scale * 0.05 * a + scale * 0.01
        size = int(r * 2.6) + 4
        spr = Image.new("RGBA", (size * 2, size * 2), (0, 0, 0, 0))
        ImageDraw.Draw(spr).ellipse([size - r, size - r * 0.75, size + r, size + r * 0.75],
                                    fill=(225, 232, 245, int(120 * (1 - a) ** 1.4)))
        spr = spr.filter(BLUR(r * 0.45 + 2))
        paste_sprite(base, spr, cx - size, cy - size)


def draw_smoke(base, x, y, t, scale, alpha=70):
    for i in range(7):
        a = ((t * 0.35 + i / 7.0) % 1.0)
        r = scale * (0.02 + 0.06 * a)
        cx = x + math.sin(t * 1.2 + i * 1.9) * scale * 0.03 * a * 3 + a * scale * 0.08
        cy = y - a * scale * 0.55
        size = int(r * 2.5) + 4
        spr = Image.new("RGBA", (size * 2, size * 2), (0, 0, 0, 0))
        ImageDraw.Draw(spr).ellipse([size - r, size - r, size + r, size + r], fill=(160, 165, 175, int(alpha * (1 - a))))
        spr = spr.filter(BLUR(r * 0.5 + 2))
        paste_sprite(base, spr, cx - size, cy - size)


class Snow:
    def __init__(self, seed, n=(260, 140, 26), wind=70, speed=1.0, color=(225, 232, 248)):
        r = np.random.default_rng(seed)
        self.layers = []
        specs = [(n[0], (1.6, 3.0), (70, 120), 130, False),
                 (n[1], (3.2, 5.8), (150, 230), 200, False),
                 (n[2], (10, 18), (340, 520), 150, True)]
        for cnt, (smin, smax), (vmin, vmax), alpha, near in specs:
            self.layers.append(dict(x=r.random(cnt) * W * 1.4 - 0.2 * W, y=r.random(cnt) * (H + 60),
                                    sz=r.uniform(smin, smax, cnt), v=r.uniform(vmin, vmax, cnt) * speed,
                                    ph=r.random(cnt) * 6.28, alpha=alpha, near=near))
        self.wind, self.color = wind, color

    def draw(self, img, t, intensity=1.0, wind_mul=1.0):
        ov = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        d = ImageDraw.Draw(ov)
        nr = Image.new("RGBA", (W // 2, H // 2), (0, 0, 0, 0))
        dn = ImageDraw.Draw(nr)
        c = self.color
        for L in self.layers:
            cnt = int(len(L["x"]) * min(1.0, intensity))
            v = L["v"][:cnt]
            ys = (L["y"][:cnt] + v * t) % (H + 60) - 30
            xs = (L["x"][:cnt] + self.wind * wind_mul * (v / 150.0) * t + 22 * np.sin(t * 1.3 + L["ph"][:cnt])) % (W * 1.4) - 0.2 * W
            sz = L["sz"][:cnt]
            stretch = 1.0 + 0.6 * wind_mul * (self.wind / 150.0)
            for x, y, s in zip(xs, ys, sz):
                if L["near"]:
                    x, y, s = x / 2, y / 2, s / 2
                    dn.ellipse([x - s * stretch / 2, y - s / 2, x + s * stretch / 2, y + s / 2], fill=c + (L["alpha"],))
                else:
                    d.ellipse([x - s * stretch / 2, y - s / 2, x + s * stretch / 2, y + s / 2], fill=c + (L["alpha"],))
        nr = nr.filter(BLUR(2.2)).resize((W, H), Image.BILINEAR)
        ov = Image.alpha_composite(ov, nr)
        base = img.convert("RGBA")
        base.alpha_composite(ov)
        return base.convert("RGB")


# --------------------------------------------------------------- post fx
_POST = {}


def post_init():
    if _POST:
        return
    y, x = np.ogrid[:H, :W]
    r = np.sqrt(((x - W / 2) / (W / 2)) ** 2 * 0.9 + ((y - H / 2) / (H / 2)) ** 2 * 0.75)
    _POST["vig"] = np.clip(1 - 0.45 * r ** 2.6, 0.3, 1)[..., None].astype(np.float32)
    rng = np.random.default_rng(7)
    _POST["grain"] = [rng.normal(0, 1, (H // 2, W // 2)).astype(np.float32) for _ in range(6)]


def post(img, fi, grain=7.0, bloom=0.55, vig=1.0, sat=1.0, contrast=1.0, tint=(1, 1, 1), lift=(0, 0, 0)):
    post_init()
    arr = np.asarray(img, np.float32)
    small = img.resize((W // 8, H // 8), Image.BILINEAR)
    b = np.clip(np.asarray(small, np.float32) - 150, 0, None) * 1.5
    bimg = to_img(b).filter(BLUR(7)).resize((W, H), Image.BILINEAR)
    arr = arr + np.asarray(bimg, np.float32) * bloom
    arr = grade(arr, sat, contrast, tint, lift)
    if vig:
        arr = arr * (1 - vig + vig * _POST["vig"])
    g = _POST["grain"][fi % 6]
    g = np.asarray(Image.fromarray(g).resize((W, H), Image.BILINEAR), np.float32)
    arr += g[..., None] * grain
    return to_img(arr)


def camera(world, z, cx, cy):
    vw = WW / z
    vh = vw * H / W
    if vh > WH:
        vh = WH
        vw = vh * W / H
    x0 = min(max(cx - vw / 2, 0), WW - vw)
    y0 = min(max(cy - vh / 2, 0), WH - vh)
    return world.resize((W, H), Image.BICUBIC, box=(x0, y0, x0 + vw, y0 + vh))


# ---------------------------------------------------------------- captions
_TXT = {}

STYLES = {
    "narr": dict(font=F_MONT, size=54, color=(255, 255, 255), maxw=880, cy=1290, spacing=1.18),
    "quote": dict(font=F_GAR_I, size=86, color=(255, 214, 150), maxw=900, cy=1270, spacing=1.08),
    "hook": dict(font=F_GAR_B, size=98, color=(255, 255, 255), maxw=920, cy=900, spacing=1.12),
    "end": dict(font=F_GAR_B, size=96, color=(255, 240, 220), maxw=920, cy=880, spacing=1.12),
    "endsub": dict(font=F_MONT, size=40, color=(210, 200, 185), maxw=900, cy=1140, spacing=1.2),
}


def text_sprite(text, style):
    key = (text, style)
    if key in _TXT:
        return _TXT[key]
    st = STYLES[style]
    font = ImageFont.truetype(st["font"], st["size"])
    lines = []
    for para in text.split("\n"):
        cur = ""
        for wd in para.split(" "):
            test = (cur + " " + wd).strip()
            if font.getlength(test) <= st["maxw"] or not cur:
                cur = test
            else:
                lines.append(cur)
                cur = wd
        lines.append(cur)
    asc, desc = font.getmetrics()
    lh = int((asc + desc) * st["spacing"])
    tw = int(max(font.getlength(l) for l in lines))
    th = lh * len(lines)
    pad = 50
    size = (tw + 2 * pad, th + 2 * pad)
    txt = Image.new("RGBA", size, (0, 0, 0, 0))
    sh = Image.new("L", size, 0)
    dt, ds = ImageDraw.Draw(txt), ImageDraw.Draw(sh)
    for i, l in enumerate(lines):
        x = pad + (tw - font.getlength(l)) / 2
        y = pad + i * lh
        ds.text((x, y + 5), l, font=font, fill=255, stroke_width=6, stroke_fill=255)
        dt.text((x, y), l, font=font, fill=st["color"])
    sh = sh.filter(BLUR(12)).point(lambda v: int(v * 0.85))
    shadow = Image.new("RGBA", size, (0, 0, 0, 0))
    shadow.putalpha(sh)
    out = Image.alpha_composite(shadow, txt)
    _TXT[key] = out
    return out


def draw_captions(img, tg):
    for (a, b, style, text) in CAPTIONS:
        if not (a <= tg < b):
            continue
        k = min(1.0, (tg - a) / 0.25, (b - tg) / 0.25)
        k = smooth(k)
        spr = text_sprite(text, style)
        st = STYLES[style]
        x = (W - spr.width) / 2
        y = st["cy"] - spr.height / 2 + (1 - k) * 18
        alpha = spr.getchannel("A").point(lambda v: int(v * k))
        img.paste(spr.convert("RGB"), (int(x), int(y)), alpha)
    return img


# ================================================================ SCENES
class Scene:
    post_kw = {}

    def __init__(self):
        pass

    def frame(self, t, dur):
        raise NotImplementedError


# ---- shared backgrounds --------------------------------------------------
def night_sky(w, h, horizon, seed, moon=(0.72, 0.13)):
    sky = vgrad(w, h, [(0, (5, 8, 18)), (horizon * 0.6, (14, 21, 38)), (horizon, (38, 48, 70)), (1, (38, 48, 70))])
    if moon:
        mx, my = moon[0] * w, moon[1] * h
        g = glow_map(w, h, mx, my, w * 0.16)
        sky += g[..., None] * np.array([60, 70, 95], np.float32)
        y, x = np.ogrid[:h, :w]
        disc = np.clip((w * 0.045 - np.sqrt((x - mx) ** 2 + (y - my) ** 2)) / 2.5, 0, 1)
        sky = sky * (1 - disc[..., None]) + disc[..., None] * np.array([215, 222, 235], np.float32)
    cl = fbm(w, h, seed, 7, 2)
    cl = np.clip((cl - 0.45) * 2.2, 0, 1)
    sky = sky * (1 - 0.65 * cl[..., None]) + cl[..., None] * np.array([22, 27, 40], np.float32) * 0.65
    return sky


def dawn_sky(w, h, horizon, seed):
    sky = vgrad(w, h, [(0, (58, 70, 92)), (horizon * 0.55, (110, 118, 135)), (horizon * 0.9, (196, 168, 160)),
                       (horizon, (222, 190, 172)), (1, (222, 190, 172))])
    cl = fbm(w, h, seed, 7, 2)
    cl = np.clip((cl - 0.5) * 2.0, 0, 1)
    sky = sky * (1 - 0.35 * cl[..., None]) + cl[..., None] * np.array([150, 150, 165], np.float32) * 0.35
    return sky


def mountains(arr, base_y, amp, seed, color, snow_col=None):
    h, w, _ = arr.shape
    r = np.random.default_rng(seed)
    pts = r.random(18)
    xs = np.linspace(0, w, 18)
    ridge = np.interp(np.arange(w), xs, pts)
    fine = np.interp(np.arange(w), np.linspace(0, w, 90), r.random(90))
    ridge = base_y - amp * (0.75 * ridge + 0.25 * fine)
    yy = np.arange(h)[:, None]
    m = np.clip(yy - ridge[None, :], 0, 1.5) / 1.5
    col = np.array(color, np.float32)
    if snow_col is not None:
        depth = np.clip((yy - ridge[None, :]) / (amp * 0.5), 0, 1)
        c2 = np.array(snow_col, np.float32)
        layer = c2 * (1 - depth[..., None]) + col * depth[..., None]
    else:
        layer = col
    return arr * (1 - m[..., None]) + layer * m[..., None]


class Rampart(Scene):
    """Side view along the snowy castle wall walk."""

    def __init__(self, s, gy, palette="night", tower=False, door="open", torch_x=None, seed=11):
        self.s, self.gy, self.palette = s, gy, palette
        w, h = WW, WH
        self.torch_x = torch_x
        horizon = (gy - 0.55 * s) / h
        if palette == "night":
            sky = night_sky(w, h, horizon, seed)
            sky = mountains(sky, gy - 0.50 * s, 0.35 * s, seed + 1, (22, 28, 42), (70, 80, 100))
            sky = mountains(sky, gy - 0.48 * s, 0.14 * s, seed + 2, (14, 18, 26))
            wall_base, snow_col, floor_cols = (54, 58, 70), (150, 165, 195), ((40, 47, 64), (78, 88, 112))
        else:
            sky = dawn_sky(w, h, horizon, seed)
            sky = mountains(sky, gy - 0.50 * s, 0.35 * s, seed + 1, (90, 98, 118), (190, 190, 205))
            sky = mountains(sky, gy - 0.48 * s, 0.14 * s, seed + 2, (62, 68, 84))
            wall_base, snow_col, floor_cols = (92, 94, 104), (215, 218, 228), ((130, 135, 150), (196, 200, 214))
        arr = sky
        # parapet wall with merlons
        top = int(gy - 0.62 * s)
        mer = int(0.22 * s)
        stone = stone_wall(w, h, seed + 5, block_h=max(30, int(s * 0.11)), block_w=(int(s * 0.18), int(s * 0.32)),
                           base=wall_base)
        wm = Image.new("L", (w, h), 0)
        dw = ImageDraw.Draw(wm)
        dw.rectangle([0, top, w, gy + 4], fill=255)
        step = int(s * 0.46)
        for x in range(-int(step * 0.3), w, step):
            dw.rectangle([x, top - mer, x + int(step * 0.6), top], fill=255)
        wmask = np.asarray(wm, np.float32) / 255
        snowm = np.clip(wmask - np.roll(wmask, int(s * 0.03), 0), 0, 1)
        snowm = blur_arr(np.maximum(snowm, np.roll(snowm, int(s * 0.012), 0)), 2.5) * wmask
        wall = stone * (0.85 + 0.15 * np.linspace(0.6, 1.0, h)[:, None, None])
        wall = wall * (1 - snowm[..., None]) + snowm[..., None] * np.array(snow_col, np.float32)
        arr = arr * (1 - wmask[..., None]) + wall * wmask[..., None]
        # tower + door on the left
        self.door_pos = None
        if tower:
            tx1 = int(0.25 * w)
            tstone = stone_wall(w, h, seed + 9, block_h=max(30, int(s * 0.12)),
                                block_w=(int(s * 0.2), int(s * 0.34)), base=tuple(int(c * 0.85) for c in wall_base))
            arr[:gy, :tx1] = tstone[:gy, :tx1]
            edge = np.linspace(1, 0.55, tx1)[None, :, None]
            arr[:gy, :tx1] *= edge
            dcx, dw_ = int(0.125 * w), int(0.14 * w)
            dtop = int(gy - 0.62 * s)
            dm = Image.new("L", (w, h), 0)
            ImageDraw.Draw(dm).rectangle([dcx - dw_ // 2, dtop + dw_ // 2, dcx + dw_ // 2, gy], fill=255)
            ImageDraw.Draw(dm).ellipse([dcx - dw_ // 2, dtop, dcx + dw_ // 2, dtop + dw_], fill=255)
            dmask = np.asarray(dm, np.float32) / 255
            frame = blur_arr(np.clip(np.asarray(dm.filter(ImageFilter.MaxFilter(15)), np.float32) / 255 - dmask, 0, 1), 1)
            arr = arr * (1 - frame[..., None] * 0.7)
            if door == "open":
                inside = vgrad(w, h, [(0, (190, 110, 50)), (1, (150, 75, 30))])
                arr = arr * (1 - dmask[..., None]) + inside * dmask[..., None]
            else:
                wood = (np.array([46, 30, 20], np.float32) * (0.7 + 0.5 * fbm(w, h, seed + 3, 4, 40)[..., None]))
                for k in range(-3, 4):
                    xx = dcx + k * dw_ // 7
                    wood[:, max(0, xx - 2):xx + 2] *= 0.5
                arr = arr * (1 - dmask[..., None]) + wood * dmask[..., None]
                # light leaking at the bottom + tiny window
                arr[gy - 6:gy, dcx - dw_ // 2 + 6:dcx + dw_ // 2 - 6] = (255, 170, 80)
                wx, wy = dcx, dtop + dw_ // 2 + int(0.06 * s)
                arr[wy - 14:wy + 14, wx - 10:wx + 10] = (255, 175, 90)
            self.door_pos = (dcx, dtop, dw_, door)
        # floor (snow covered walkway)
        fl = vgrad(w, h - gy, [(0, floor_cols[0]), (1, floor_cols[1])])
        fl *= (0.82 + 0.3 * fbm(w, h - gy, seed + 4, 6, 6))[..., None]
        arr[gy:] = fl
        lip = blur_arr(np.exp(-((np.arange(h) - gy) / 6.0) ** 2).astype(np.float32)[:, None].repeat(w, 1), 1)
        arr = arr + lip[..., None] * 25
        # torch pole
        if torch_x is not None:
            pole = Image.new("L", (w, h), 0)
            dp = ImageDraw.Draw(pole)
            dp.rectangle([torch_x - int(0.012 * s), int(gy - 0.92 * s), torch_x + int(0.012 * s), gy], fill=255)
            dp.polygon([(torch_x - 0.035 * s, gy - 0.92 * s), (torch_x + 0.035 * s, gy - 0.92 * s),
                        (torch_x + 0.02 * s, gy - 0.86 * s), (torch_x - 0.02 * s, gy - 0.86 * s)], fill=255)
            pm = np.asarray(pole, np.float32)[..., None] / 255
            arr = arr * (1 - pm) + pm * np.array([18, 14, 12], np.float32)
            self.flame_pos = (torch_x, gy - 0.92 * s)
        self.bg = arr
        self.fog = fbm(w * 2, int(h * 0.6), seed + 20, 6, 3)

    def add_fog(self, arr, t, strength, color):
        h = self.fog.shape[0]
        off = int(t * 40) % WW
        f = self.fog[:, off:off + WW]
        y0 = int(self.gy - h * 0.75)
        y0c = max(0, y0)
        f = f[y0c - y0:min(h, WH - y0)]
        arr[y0c:y0c + f.shape[0]] += (np.clip(f - 0.35, 0, 1) * (strength / 100.0))[..., None] * np.array(color, np.float32)
        return arr


def light(arr, cx, cy, r, color, k):
    if k <= 0:
        return arr
    g = glow_map(WW, WH, cx, cy, r)
    return arr + g[..., None] * (np.array(color, np.float32) * k)


class GlowCache:
    def __init__(self):
        self.c = {}

    def get(self, cx, cy, r):
        key = (int(cx) // 6, int(cy) // 6, int(r))
        if key not in self.c:
            if len(self.c) > 40:
                self.c.clear()
            self.c[key] = glow_map(WW, WH, cx, cy, r)[..., None]
        return self.c[key]


GC = GlowCache()


def add_light(arr, cx, cy, r, color, k):
    if k <= 0:
        return arr
    return arr + GC.get(cx, cy, r) * (np.array(color, np.float32) * k)


def floor_light(arr, gy, cx, r, color, k):
    """elliptical warm pool on the snowy floor"""
    if k <= 0:
        return arr
    key = ("floor", int(cx) // 6, gy, int(r))
    if key not in GC.c:
        y, x = np.ogrid[:WH, :WW]
        d2 = ((x - cx) / r) ** 2 + ((y - gy - r * 0.08) / (r * 0.18)) ** 2
        g = (1.0 / (1.0 + d2 * 2.0)).astype(np.float32)
        g[:gy] = 0
        GC.c[key] = g[..., None]
    return arr + GC.c[key] * (np.array(color, np.float32) * k)


class LightMap:
    """Multiplicative lighting: surfaces = albedo * (ambient + sum lights) + a little air glow."""

    def __init__(self, ambient=1.0):
        self.ambient, self.L, self.air = ambient, None, None

    def _acc(self, g, color, k, gain, air):
        c = np.array(color, np.float32)
        term = g * (c / 255.0 * (k * gain))
        self.L = term if self.L is None else self.L + term
        if air > 0:
            a = (g * g) * (c * (k * air))
            self.air = a if self.air is None else self.air + a

    def point(self, cx, cy, r, color, k, gain=2.4, air=0.16):
        if k > 0:
            self._acc(GC.get(cx, cy, r), color, k, gain, air)

    def floor(self, gy, cx, r, color, k, gain=2.0):
        if k <= 0:
            return
        key = ("floor", int(cx) // 6, gy, int(r))
        if key not in GC.c:
            y, x = np.ogrid[:WH, :WW]
            d2 = ((x - cx) / r) ** 2 + ((y - gy - r * 0.08) / (r * 0.18)) ** 2
            g = (1.0 / (1.0 + d2 * 2.0)).astype(np.float32)
            g[:gy] = 0
            GC.c[key] = g[..., None]
        self._acc(GC.c[key], color, k, gain, 0)

    def apply(self, bg):
        amb = np.asarray(self.ambient, np.float32)
        out = bg * amb if self.L is None else bg * (amb + self.L)
        if self.air is not None:
            out = out + self.air
        return out


TORCH = (255, 130, 45)


def make_king(s, arm, facing, rim_dir, seed=3):
    S = Sil(s, facing)
    flame = king_shape(S, arm)
    rims = [(rim_dir, s * 0.009, (255, 150, 70), 1.5, s * 0.004),
            ((0, -1), s * 0.006, (90, 110, 150), 0.6, 2)]
    spr = sil_layer(S.mask(), (14, 13, 17), rims, tex_seed=seed)
    # crown glint
    return spr, S, flame


def make_guard(s, facing, rim_dir, crouch=0.0, seed=4):
    S = Sil(s, facing)
    mouth = guard_shape(S, crouch)
    rims = [(rim_dir, s * 0.009, (255, 150, 70), 1.4, s * 0.004),
            ((0, -1), s * 0.006, (90, 110, 150), 0.6, 2)]
    spr = sil_layer(S.mask(), (16, 16, 19), rims, tex_seed=seed)
    return spr, S, mouth


# ---- 1. HOOK & 9. INSCRIPTION ------------------------------------------
def build_wall_text_world(seed=31):
    w, h = WW, WH
    wall = stone_wall(w, h, seed, block_h=170, block_w=(260, 420), base=(88, 88, 94), var=14)
    font_size = 118
    font = ImageFont.truetype(F_GAR_I, font_size)
    lines = WALL_TEXT
    while max(font.getlength(l) for l in lines) > w * 0.82:
        font_size -= 4
        font = ImageFont.truetype(F_GAR_I, font_size)
    asc, desc = font.getmetrics()
    lh = int((asc + desc) * 1.05)
    y0 = int(h * 0.30)
    dark = Image.new("L", (w, h), 0)
    hi = Image.new("L", (w, h), 0)
    boxes = []
    rng = np.random.default_rng(seed)
    for i, l in enumerate(lines):
        lw = font.getlength(l)
        x = (w - lw) / 2 + rng.uniform(-25, 25)
        y = y0 + i * lh + rng.uniform(-8, 8)
        layer = Image.new("L", (w, h), 0)
        ImageDraw.Draw(layer).text((x, y), l, font=font, fill=255, stroke_width=1, stroke_fill=255)
        layer = layer.rotate(rng.uniform(-2.2, 2.2), resample=Image.BICUBIC, center=(x + lw / 2, y + lh / 2))
        dark = Image.fromarray(np.maximum(np.asarray(dark), np.asarray(layer)))
        boxes.append((x - 10, y - 10, x + lw + 10, y + lh + 10))
    hi = dark.transform(dark.size, Image.AFFINE, (1, 0, -3, 0, 1, -4))
    rough = fbm(w, h, seed + 2, 4, 120)
    dm = np.asarray(dark, np.float32) / 255 * (0.75 + 0.5 * rough)
    hm = np.clip(np.asarray(hi, np.float32) / 255 - dm, 0, 1)
    # frost
    fr = fbm(w, h, seed + 7, 7, 3)
    y, x = np.ogrid[:h, :w]
    edge = np.clip(np.sqrt(((x - w / 2) / (w / 2)) ** 2 + ((y - h / 2) / (h / 2)) ** 2) - 0.55, 0, 1) * 1.8
    frost = np.clip((fr * 0.7 + edge - 0.62) * 1.5, 0, 0.85)
    sparkle = (np.random.default_rng(5).random((h, w)) > 0.9985).astype(np.float32)
    frost = np.maximum(frost, blur_arr(sparkle, 1.2) * 2.5)
    # snow ledge at the bottom
    ledge = np.clip((y - (h * 0.86 + 30 * np.sin(x / 90.0) + 18 * np.sin(x / 33.0))) / 6, 0, 1).astype(np.float32)
    return dict(wall=wall, dark=dm, hi=hm, frost=frost, ledge=ledge, boxes=boxes)


def compose_wall(D, reveal_mask=None, palette="night"):
    if palette == "neutral":
        base = D["wall"] * 1.0
        frost_col, snow_col = np.array([200, 205, 215], np.float32), np.array([190, 195, 205], np.float32)
    elif palette == "night":
        base = D["wall"] * np.array([0.55, 0.6, 0.78], np.float32)
        frost_col, snow_col = np.array([170, 190, 225], np.float32), np.array([150, 165, 200], np.float32)
    else:
        base = D["wall"] * np.array([0.95, 0.98, 1.08], np.float32)
        frost_col, snow_col = np.array([225, 232, 245], np.float32), np.array([228, 232, 242], np.float32)
    dm, hm = D["dark"], D["hi"]
    if reveal_mask is not None:
        dm, hm = dm * reveal_mask, hm * reveal_mask
    arr = base * (1 - 0.88 * dm[..., None]) + hm[..., None] * 70
    f = D["frost"][..., None]
    arr = arr * (1 - f * 0.75) + frost_col * f * 0.75
    l = D["ledge"][..., None]
    arr = arr * (1 - l) + snow_col * l
    return arr


class Hook(Scene):
    post_kw = dict(sat=0.9, contrast=1.08, grain=8, bloom=0.25)

    def __init__(self):
        self.D = build_wall_text_world()
        arr = compose_wall(self.D, None, "neutral")
        self.base = np.asarray(to_img(arr).filter(BLUR(5)), np.float32)
        self.snow = Snow(101, n=(160, 90, 18), wind=110)

    def frame(self, t, dur):
        k = flicker(t, 1.3, 0.22)
        LM = LightMap((0.30, 0.36, 0.52))
        LM.point(WW * 0.10, WH * 0.82, WW * 0.6, (255, 120, 50), 0.9 * k, gain=1.6, air=0.08)
        arr = LM.apply(self.base)
        img = to_img(arr)
        z = lerp(1.0, 1.12, smooth(t / dur))
        out = camera(img, z, WW * 0.5, WH * 0.47)
        out = self.snow.draw(out, t, 0.9)
        return out


class Inscription(Scene):
    post_kw = dict(sat=0.8, contrast=1.15, grain=6, tint=(0.97, 1.0, 1.05), bloom=0.08)

    def __init__(self, reveal_start, reveal_end):
        self.D = build_wall_text_world()
        self.rs, self.re = reveal_start, reveal_end
        self.snow = Snow(202, n=(120, 60, 10), wind=40, speed=0.6)
        lens = [b[2] - b[0] for b in self.D["boxes"]]
        self.lens = np.array(lens) / sum(lens)

    def frame(self, t, dur):
        p = smooth((t - self.rs) / (self.re - self.rs)) if t > self.rs else 0.0
        m = Image.new("L", (WW, WH), 0)
        d = ImageDraw.Draw(m)
        acc = 0.0
        for (x0, y0, x1, y1), L in zip(self.D["boxes"], self.lens):
            if p >= acc + L:
                d.rectangle([x0 - 20, y0 - 4, x1 + 20, y1 + 4], fill=255)
            elif p > acc:
                xx = x0 + (x1 - x0) * (p - acc) / L
                d.rectangle([x0 - 20, y0 - 4, xx, y1 + 4], fill=255)
            acc += L
        mask = np.asarray(m.filter(BLUR(10)), np.float32) / 255
        arr = compose_wall(self.D, mask, "dawn")
        LM = LightMap((0.55, 0.58, 0.66))
        LM.point(WW * 1.0, WH * 0.05, WW * 1.1, (235, 215, 205), 0.6, gain=1.3, air=0.0)
        arr = LM.apply(arr)
        img = to_img(arr)
        z = lerp(1.0, 1.09, smooth(t / dur))
        out = camera(img, z, WW * 0.5, WH * 0.45)
        return self.snow.draw(out, t, 0.7)


# ---- 2. CASTLE ESTABLISHING ----------------------------------------------
class Castle(Scene):
    post_kw = dict(sat=0.9, contrast=1.1, grain=7)

    def __init__(self, seed=21):
        w, h = WW, WH
        horizon = 0.56
        arr = night_sky(w, h, horizon, seed, moon=(0.74, 0.14))
        arr = mountains(arr, h * 0.56, h * 0.12, seed + 1, (24, 30, 46), (85, 95, 120))
        # hill
        xs = np.arange(w)
        hill = h * 0.62 - h * 0.05 * np.exp(-((xs - w * 0.5) / (w * 0.35)) ** 2) + 10 * np.sin(xs / 37.0)
        yy = np.arange(h)[:, None]
        hm = np.clip(yy - hill[None, :], 0, 2) / 2
        hcol = vgrad(w, h, [(0, (120, 135, 165)), (0.6, (110, 125, 155)), (1, (55, 65, 90))])
        hcol *= (0.75 + 0.35 * fbm(w, h, seed + 2, 6, 5))[..., None]
        arr = arr * (1 - hm[..., None]) + hcol * hm[..., None]
        # castle silhouette
        cm = Image.new("L", (w, h), 0)
        d = ImageDraw.Draw(cm)
        em = Image.new("L", (w, h), 0)
        de = ImageDraw.Draw(em)
        base = h * 0.60

        def crenel(x0, x1, ytop, size):
            x = x0
            while x < x1:
                d.rectangle([x, ytop - size, min(x1, x + size * 0.6), ytop], fill=255)
                x += size * 1.1

        # curtain wall
        d.rectangle([w * 0.10, h * 0.485, w * 0.90, base + 40], fill=255)
        crenel(w * 0.10, w * 0.90, h * 0.485, w * 0.022)
        # side towers
        for cx in (0.13, 0.87):
            x0, x1 = w * (cx - 0.055), w * (cx + 0.055)
            d.rectangle([x0, h * 0.385, x1, base + 40], fill=255)
            d.polygon([(x0 - 10, h * 0.385), (x1 + 10, h * 0.385), (w * cx, h * 0.305)], fill=255)
            for wy in (0.42, 0.47):
                de.rectangle([w * cx - 7, h * wy, w * cx + 7, h * wy + 22], fill=255)
        # inner towers
        for cx in (0.30, 0.70):
            x0, x1 = w * (cx - 0.04), w * (cx + 0.04)
            d.rectangle([x0, h * 0.42, x1, base], fill=255)
            crenel(x0, x1, h * 0.42, w * 0.018)
            de.rectangle([w * cx - 6, h * 0.44, w * cx + 6, h * 0.44 + 18], fill=255)
        # keep
        d.rectangle([w * 0.38, h * 0.32, w * 0.62, base], fill=255)
        crenel(w * 0.38, w * 0.62, h * 0.32, w * 0.02)
        for cx in (0.40, 0.60):
            d.rectangle([w * (cx - 0.025), h * 0.25, w * (cx + 0.025), h * 0.32], fill=255)
            d.polygon([(w * (cx - 0.032), h * 0.25), (w * (cx + 0.032), h * 0.25), (w * cx, h * 0.19)], fill=255)
        d.rectangle([w * 0.47, h * 0.22, w * 0.53, h * 0.32], fill=255)
        d.polygon([(w * 0.462, h * 0.22), (w * 0.538, h * 0.22), (w * 0.5, h * 0.15)], fill=255)
        d.line([(w * 0.5, h * 0.15), (w * 0.5, h * 0.125)], fill=255, width=4)
        for row, ys in enumerate((0.345, 0.385, 0.425)):
            for cx in (0.43, 0.5, 0.57):
                if (row + int(cx * 10)) % 3 == 2:
                    continue
                de.rectangle([w * cx - 9, h * ys, w * cx + 9, h * ys + 30], fill=255)
                de.ellipse([w * cx - 9, h * ys - 9, w * cx + 9, h * ys + 9], fill=255)
        de.rectangle([w * 0.47, h * 0.535, w * 0.53, h * 0.60], fill=255)  # gate light
        cmask = np.asarray(cm.filter(BLUR(0.8)), np.float32) / 255
        emask = np.asarray(em, np.float32) / 255
        ccol = np.array([16, 18, 28], np.float32) * (0.7 + 0.6 * fbm(w, h, seed + 4, 5, 20))[..., None]
        top = np.clip(cmask - np.roll(cmask, 7, 0), 0, 1)
        top = blur_arr(top, 2)
        right = blur_arr(np.clip(cmask - np.roll(cmask, -4, 1), 0, 1), 1.5)
        ccol = ccol + top[..., None] * np.array([150, 165, 200], np.float32) + right[..., None] * np.array([60, 70, 95], np.float32)
        arr = arr * (1 - cmask[..., None]) + ccol * cmask[..., None]
        arr = arr * (1 - emask[..., None]) + emask[..., None] * np.array([255, 180, 95], np.float32)
        wg = blur_arr(emask, 28)
        arr += wg[..., None] * np.array([255, 140, 60], np.float32) * 2.2
        # foreground pines on both sides, bigger towards the bottom
        tm = Image.new("L", (w, h), 0)
        dt = ImageDraw.Draw(tm)
        rng = np.random.default_rng(seed + 30)
        trees = []
        for side in (0, 1):
            for k in range(9):
                yb = h * (0.66 + 0.045 * k) + rng.uniform(-20, 20)
                th = h * (0.10 + 0.022 * k) * rng.uniform(0.85, 1.15)
                spread = w * (0.30 - 0.012 * k)
                x = rng.uniform(0, spread) if side == 0 else w - rng.uniform(0, spread)
                trees.append((yb, x, th))
        for yb, x, th in sorted(trees):
            tiers = 7
            for i in range(tiers):
                ty = yb - th * (i / tiers) * 0.95
                tw = th * 0.32 * (1 - i / tiers) + th * 0.04
                pts = [(x - tw, ty), (x - tw * 0.55, ty - th * 0.06), (x, ty - th * 0.24), (x + tw * 0.55, ty - th * 0.06), (x + tw, ty)]
                dt.polygon(pts, fill=255)
            dt.rectangle([x - th * 0.02, yb - th * 0.05, x + th * 0.02, yb + th * 0.03], fill=255)
        tmask = np.asarray(tm.filter(BLUR(0.8)), np.float32) / 255
        ttop = blur_arr(np.clip(tmask - np.roll(tmask, 6, 0), 0, 1), 1.5)
        tcol = np.array([10, 14, 20], np.float32) + ttop[..., None] * np.array([140, 155, 185], np.float32)
        arr = arr * (1 - tmask[..., None]) + tcol * tmask[..., None]
        # winding path of torches up to the gate
        self.path_torches = [(w * (0.5 + 0.10 * math.sin(i * 1.3)), h * (0.66 + 0.06 * i)) for i in range(5)]
        self.bg = arr
        self.torches = [(w * x, h * 0.485 - w * 0.03) for x in (0.18, 0.26, 0.36, 0.64, 0.74, 0.82)]
        self.fog = fbm(w * 2, h, seed + 9, 6, 3)
        self.snow = Snow(303, n=(420, 230, 40), wind=260, speed=1.2)

    def frame(self, t, dur):
        arr = self.bg.copy()
        for i, (x, y) in enumerate(self.torches):
            arr = add_light(arr, x, y, WW * 0.035, TORCH, 0.35 * flicker(t, i * 2.1))
        for i, (x, y) in enumerate(self.path_torches):
            arr = add_light(arr, x, y, WW * (0.04 + 0.01 * i), TORCH, 0.35 * flicker(t, i * 3.3 + 1))
        off = int(t * 70) % WW
        f = np.clip(self.fog[:, off:off + WW] - 0.4, 0, 1)
        arr += f[..., None] * np.array([90, 100, 125], np.float32) * 0.55
        img = to_img(arr).convert("RGBA")
        for i, (x, y) in enumerate(self.torches):
            draw_flame(img, x, y + 4, 9, t, i * 2.1)
        for i, (x, y) in enumerate(self.path_torches):
            draw_flame(img, x, y, 10 + 3 * i, t, i * 3.3 + 1)
        img = img.convert("RGB")
        p = smooth(t / dur)
        out = camera(img, lerp(1.0, 1.32, p), WW * 0.5, lerp(WH * 0.47, WH * 0.43, p))
        return self.snow.draw(out, t, 1.0, 1.0)


# ---- 3. APPROACH ---------------------------------------------------------
class Approach(Rampart):
    post_kw = dict(sat=0.95, contrast=1.08, grain=7)

    def __init__(self):
        s, gy = int(WH * 0.33), int(WH * 0.78)
        super().__init__(s, gy, "night", tower=True, door="open", torch_x=int(WW * 0.88))
        self.guard, self.gS, self.mouth = make_guard(s, -1, (1, 0))
        self.king, self.kS, self.kflame = make_king(s, "torch", 1, (1, 0))
        self.gx = WW * 0.70
        self.snow = Snow(404, n=(300, 160, 26), wind=150)

    def king_x(self, t):
        return lerp(WW * 0.10, WW * 0.42, smooth(min(1, t / 4.6)) * 0.85 + min(1, t / 4.6) * 0.15)

    def frame(self, t, dur):
        s, gy = self.s, self.gy
        kx = self.king_x(t)
        walking = t < 4.6
        bob = -abs(math.sin(t * 5.5)) * s * 0.012 if walking else 0
        tk = flicker(t, 0.7)
        fx, fy = kx - self.kS.fx + self.kflame[0], gy - self.kS.fy + self.kflame[1] + bob
        LM = LightMap()
        dcx, dtop, dw_, _ = self.door_pos
        LM.point(dcx, gy - 0.3 * s, s * 0.9, (255, 150, 70), 0.55)
        LM.floor(gy, dcx + s * 0.15, s * 0.8, (255, 150, 70), 0.9)
        LM.point(self.flame_pos[0], self.flame_pos[1], s * 0.75, TORCH, 0.75 * flicker(t, 2.2))
        LM.floor(gy, self.flame_pos[0], s * 0.55, TORCH, 0.8 * flicker(t, 2.2))
        LM.point(fx, fy, s * 0.7, TORCH, 0.75 * tk)
        LM.floor(gy, fx, s * 0.5, TORCH, 0.7 * tk)
        arr = LM.apply(self.bg)
        arr = self.add_fog(arr, t, 45, (110, 120, 150))
        img = to_img(arr).convert("RGBA")
        shiver = s * 0.003 * math.sin(t * 50) + s * 0.002 * math.sin(t * 79)
        paste_sprite(img, self.guard, self.gx - self.gS.fx + shiver, gy - self.gS.fy)
        paste_sprite(img, self.king, kx - self.kS.fx, gy - self.kS.fy + bob)
        draw_flame(img, fx, fy, s * 0.035, t, 0.7)
        draw_flame(img, self.flame_pos[0], self.flame_pos[1], s * 0.04, t, 2.2)
        gm = (self.gx - self.gS.fx + self.mouth[0], gy - self.gS.fy + self.mouth[1])
        draw_puffs(img, gm, t, 2.1, 0.4, -1, s)
        img = img.convert("RGB")
        p = smooth(t / dur)
        out = camera(img, lerp(1.0, 1.10, p), lerp(WW * 0.5, WW * 0.56, p), WH * 0.55)
        return self.snow.draw(out, t, 0.9)


# ---- 4/5. DIALOG & PROMISE -----------------------------------------------
class TwoShot(Rampart):
    post_kw = dict(sat=0.95, contrast=1.1, grain=7)

    def __init__(self, mode):
        s, gy = int(WH * 0.52), int(WH * 0.90)
        super().__init__(s, gy, "night", tower=False, torch_x=int(WW * 1.02), seed=13)
        self.mode = mode
        self.kx, self.gx = WW * 0.25, WW * 0.75
        self.guard, self.gS, self.mouth = make_guard(s, -1, (-1, 0))
        self.k_torch = make_king(s, "torch", 1, (1, 0))
        self.k_reach = make_king(s, "reach", 1, (1, 0))
        self.k_walk = make_king(s, "torch", -1, (-1, 0))
        self.snow = Snow(505, n=(260, 140, 24), wind=140)

    def frame(self, t, dur):
        s, gy = self.s, self.gy
        kx, facing, spr = self.kx, 1, self.k_torch
        bob = 0
        if self.mode == "promise":
            if t < 3.0:
                spr = self.k_reach
            elif t >= 3.4:
                spr = self.k_walk
                q = (t - 3.4) / 2.9
                kx = lerp(self.kx, -WW * 0.45, q ** 1.3)
                bob = -abs(math.sin(t * 5.5)) * s * 0.01
            else:
                spr = self.k_torch
        king, kS, kfl = spr
        fx, fy = kx - kS.fx + kfl[0], gy - kS.fy + kfl[1] + bob
        tk = flicker(t, 0.7)
        LM = LightMap()
        LM.point(self.flame_pos[0], self.flame_pos[1], s * 0.6, TORCH, 0.6 * flicker(t, 2.2))
        LM.point(fx, fy, s * 0.55, TORCH, 0.9 * tk)
        LM.floor(gy, fx, s * 0.45, TORCH, 0.6 * tk)
        arr = LM.apply(self.bg)
        arr = self.add_fog(arr, t, 40, (110, 120, 150))
        img = to_img(arr).convert("RGBA")
        amp = 1.0 if self.mode == "dialog" else 0.7
        shiver = s * 0.0035 * amp * (math.sin(t * 50) + 0.6 * math.sin(t * 79))
        paste_sprite(img, self.guard, self.gx - self.gS.fx + shiver, gy - self.gS.fy)
        paste_sprite(img, king, kx - kS.fx, gy - kS.fy + bob)
        draw_flame(img, fx, fy, s * 0.035, t, 0.7)
        gm = (self.gx - self.gS.fx + self.mouth[0] + shiver, gy - self.gS.fy + self.mouth[1])
        km = (kx - kS.fx + kS.abs(0.07, -0.86)[0], gy - kS.fy + kS.abs(0.07, -0.86)[1] + bob)
        if self.mode == "dialog":
            draw_puffs(img, km, t, 3.4, 0.0, 1, s)
            draw_puffs(img, gm, t, 2.0, 1.1, -1, s)
        else:
            draw_puffs(img, km, t, 3.0, 0.3, 1 if t < 3.4 else -1, s)
            draw_puffs(img, gm, t, 1.9, 0.8, -1, s)
        img = img.convert("RGB")
        p = smooth(t / dur)
        if self.mode == "dialog":
            # slow push towards the guard's face for "Alisigim kralim"
            z = lerp(1.0, 1.28, p)
            cx = lerp(WW * 0.5, WW * 0.62, p)
            cy = lerp(WH * 0.52, WH * 0.47, p)
        else:
            z = lerp(1.12, 1.0, p)
            cx = lerp(WW * 0.5, WW * 0.55, p)
            cy = WH * 0.52
        out = camera(img, z, cx, cy)
        return self.snow.draw(out, t, 0.85)


# ---- 6. GREAT HALL -------------------------------------------------------
class Hall(Scene):
    post_kw = dict(sat=1.08, contrast=1.08, grain=6, tint=(1.04, 1.0, 0.92))

    def __init__(self, seed=41):
        w, h = WW, WH
        arr = stone_wall(w, h, seed, block_h=95, block_w=(170, 280), base=(78, 58, 44), var=14)
        fy0 = int(h * 0.80)
        floor = vgrad(w, h - fy0, [(0, (52, 34, 24)), (1, (30, 20, 14))])
        floor *= (0.8 + 0.4 * fbm(w, h - fy0, seed + 1, 5, 8))[..., None]
        arr[fy0:] = floor
        # window with blizzard outside
        wx0, wx1, wy0, wy1 = int(w * 0.08), int(w * 0.36), int(h * 0.20), int(h * 0.46)
        wm = Image.new("L", (w, h), 0)
        dwm = ImageDraw.Draw(wm)
        dwm.rectangle([wx0, wy0 + (wx1 - wx0) // 2, wx1, wy1], fill=255)
        dwm.ellipse([wx0, wy0, wx1, wy0 + (wx1 - wx0)], fill=255)
        wmask = np.asarray(wm, np.float32) / 255
        outside = vgrad(w, h, [(0, (14, 22, 44)), (1, (30, 42, 70))])
        arr = arr * (1 - wmask[..., None]) + outside * wmask[..., None]
        bars = Image.new("L", (w, h), 0)
        db = ImageDraw.Draw(bars)
        cx = (wx0 + wx1) // 2
        db.line([(cx, wy0), (cx, wy1)], fill=255, width=10)
        db.line([(wx0, int(h * 0.36)), (wx1, int(h * 0.36))], fill=255, width=10)
        frame = np.clip(np.asarray(wm.filter(ImageFilter.MaxFilter(21)), np.float32) / 255 - wmask, 0, 1)
        bm = np.maximum(np.asarray(bars, np.float32) / 255 * wmask, frame)
        arr = arr * (1 - bm[..., None]) + bm[..., None] * np.array([22, 15, 11], np.float32)
        self.win = (wx0, wx1, wy0, wy1, wmask)
        # banners
        for bx in (0.47, 0.60):
            x0, x1 = int(w * bx), int(w * (bx + 0.085))
            y0, y1 = int(h * 0.10), int(h * 0.42)
            bm2 = Image.new("L", (w, h), 0)
            ImageDraw.Draw(bm2).polygon([(x0, y0), (x1, y0), (x1, y1), ((x0 + x1) / 2, y1 + 50), (x0, y1)], fill=255)
            m = np.asarray(bm2, np.float32) / 255
            col = np.array([120, 18, 20], np.float32) * (0.7 + 0.5 * fbm(w, h, seed + int(bx * 100), 4, 30))[..., None]
            folds = 0.75 + 0.25 * np.sin(np.arange(w) / 9.0)[None, :, None]
            col = col * folds
            arr = arr * (1 - m[..., None]) + col * m[..., None]
            gold = np.clip(np.asarray(bm2, np.float32) / 255 - np.asarray(bm2.filter(ImageFilter.MinFilter(9)), np.float32) / 255, 0, 1)
            arr = arr * (1 - gold[..., None]) + gold[..., None] * np.array([190, 140, 60], np.float32)
        # fireplace
        fx0, fx1, fy_top = int(w * 0.58), int(w * 1.02), int(h * 0.52)
        fm = Image.new("L", (w, h), 0)
        ImageDraw.Draw(fm).rectangle([fx0, fy_top, fx1, fy0], fill=255)
        surround = np.asarray(fm, np.float32) / 255
        sc = stone_wall(w, h, seed + 7, block_h=60, block_w=(90, 150), base=(110, 92, 76), var=12)
        arr = arr * (1 - surround[..., None]) + sc * surround[..., None]
        om = Image.new("L", (w, h), 0)
        ox0, ox1 = fx0 + 60, fx1 - 20
        ImageDraw.Draw(om).rectangle([ox0, fy_top + 140, ox1, fy0], fill=255)
        ImageDraw.Draw(om).ellipse([ox0, fy_top + 60, ox1, fy_top + 240], fill=255)
        opening = np.asarray(om.filter(BLUR(2)), np.float32) / 255
        inner = vgrad(w, h, [(0, (10, 6, 5)), (0.75, (40, 18, 8)), (1, (90, 40, 12))])
        arr = arr * (1 - opening[..., None]) + inner * opening[..., None]
        mant = Image.new("L", (w, h), 0)
        ImageDraw.Draw(mant).rectangle([fx0 - 30, fy_top - 20, fx1, fy_top + 25], fill=255)
        mm = np.asarray(mant, np.float32)[..., None] / 255
        arr = arr * (1 - mm) + mm * np.array([60, 46, 36], np.float32)
        self.fire = ((ox0 + ox1) / 2, fy0 - 50, ox1 - ox0)
        self.bg = arr
        # king on throne (silhouette, rim lit from the fire on the right)
        s = int(h * 0.42)
        T = Sil(s, 1, wmul=1.0, hmul=1.5, foot=1.05)
        throne_shape(T)
        self.throne = sil_layer(T.mask(), (58, 34, 20), [((1, 0), s * 0.01, (255, 160, 70), 1.6, 3),
                                                         ((0, -1), s * 0.006, (200, 120, 50), 0.6, 2)], tex_seed=12)
        S = Sil(s, 1, wmul=1.0, hmul=1.5, foot=1.05)
        king_seated_shape(S)
        rims = [((1, 0), s * 0.012, (255, 160, 70), 2.4, s * 0.004), ((0, -1), s * 0.006, (255, 130, 60), 0.8, 2)]
        self.king = sil_layer(S.mask(), (20, 12, 10), rims, tex_seed=8)
        self.kS = S
        self.kpos = (w * 0.34, fy0 - 0.36 * s)
        rng = np.random.default_rng(seed + 50)
        self.embers = [(rng.uniform(-0.4, 0.4), rng.uniform(0, 1), rng.uniform(0.6, 1.4)) for _ in range(28)]
        self.wsnow = [(rng.uniform(wx0, wx1), rng.uniform(0, 1), rng.uniform(80, 200), rng.uniform(2, 5)) for _ in range(120)]

    def frame(self, t, dur):
        k = flicker(t, 0.3, 0.12)
        fx, fy, fw = self.fire
        LM = LightMap(0.42)
        LM.point(fx, fy - 60, WW * 0.75, (255, 140, 60), 1.0 * k, gain=2.0, air=0.05)
        LM.point(fx, fy - 40, WW * 0.25, (255, 175, 90), 0.8 * k, gain=1.6, air=0.12)
        arr = LM.apply(self.bg)
        img = to_img(arr).convert("RGBA")
        wx0, wx1, wy0, wy1, wmask = self.win
        d = ImageDraw.Draw(img)
        for x, y0, v, sz in self.wsnow:
            y = wy0 + ((y0 * (wy1 - wy0) + v * t) % (wy1 - wy0))
            xx = x + (t * 90 + y0 * 400) % (wx1 - wx0) - (wx1 - wx0) / 2
            xx = wx0 + (xx - wx0) % (wx1 - wx0)
            if wmask[int(y), int(xx)] > 0.5:
                d.ellipse([xx - sz / 2, y - sz / 2, xx + sz / 2, y + sz / 2], fill=(200, 210, 235, 170))
        # fire: several flame tongues
        for i in range(9):
            ox = fx + (i - 4) * fw * 0.085
            size = fw * (0.13 + 0.05 * math.sin(i * 1.7)) * (1.0 - 0.35 * abs(i - 4) / 4)
            draw_flame(img, ox, fy + 10, size, t, i * 1.37 + 0.5)
        logs = ImageDraw.Draw(img)
        logs.rounded_rectangle([fx - fw * 0.38, fy + 4, fx + fw * 0.38, fy + 34], 14, fill=(30, 16, 10, 255))
        for ex, ey, sp in self.embers:
            a = (t * 0.45 * sp + ey) % 1.0
            x = fx + ex * fw + math.sin(t * 3 + ey * 9) * 12
            y = fy - a * WH * 0.25
            r = 2.5 * (1 - a) + 1
            logs.ellipse([x - r, y - r, x + r, y + r], fill=(255, 190, 90, int(255 * (1 - a))))
        paste_sprite(img, self.throne, self.kpos[0] - self.kS.fx, self.kpos[1] - self.kS.fy)
        paste_sprite(img, self.king, self.kpos[0] - self.kS.fx, self.kpos[1] - self.kS.fy)
        img = img.convert("RGB")
        p = smooth(t / dur)
        out = camera(img, lerp(1.06, 1.22, p), lerp(WW * 0.46, WW * 0.42, p), WH * 0.56)
        return out


# ---- 7. WAITING ----------------------------------------------------------
class Waiting(Rampart):
    post_kw = dict(sat=0.85, contrast=1.1, grain=8)

    def __init__(self):
        s, gy = int(WH * 0.33), int(WH * 0.78)
        super().__init__(s, gy, "night", tower=True, door="closed", torch_x=int(WW * 0.86), seed=17)
        self.guard, self.gS, self.mouth = make_guard(s, -1, (1, 0))
        self.guard2, _, self.mouth2 = make_guard(s, -1, (1, 0), crouch=0.04)
        self.gx = WW * 0.64
        self.snow = Snow(606, n=(460, 250, 44), wind=280, speed=1.3)

    def frame(self, t, dur):
        s, gy = self.s, self.gy
        q = t / dur
        torch = max(0.0, 1.0 - q * 1.25) * (0.6 + 0.4 * abs(math.sin(t * 9))) if q < 0.8 else 0.0
        torch = max(torch, 0) * (1 if q < 0.55 else 0.7)
        dim = lerp(1.0, 0.62, q)
        dcx = self.door_pos[0]
        LM = LightMap(dim)
        LM.point(dcx, gy - 0.25 * s, s * 0.45, (255, 150, 70), 0.3)
        LM.point(self.flame_pos[0], self.flame_pos[1], s * 0.75, TORCH, 0.75 * torch)
        LM.floor(gy, self.flame_pos[0], s * 0.55, TORCH, 0.8 * torch)
        arr = LM.apply(self.bg)
        arr = self.add_fog(arr, t * 1.6, 70, (120, 130, 160))
        img = to_img(arr).convert("RGBA")
        spr, mouth = (self.guard, self.mouth) if q < 0.6 else (self.guard2, self.mouth2)
        amp = lerp(1.0, 2.4, q)
        shiver = s * 0.0035 * amp * (math.sin(t * 50) + 0.6 * math.sin(t * 79))
        paste_sprite(img, spr, self.gx - self.gS.fx + shiver, gy - self.gS.fy)
        if torch > 0.02:
            draw_flame(img, self.flame_pos[0], self.flame_pos[1], s * 0.04, t, 2.2, strength=max(0.25, torch))
        else:
            draw_smoke(img, self.flame_pos[0], self.flame_pos[1], t, s, 60)
        gm = (self.gx - self.gS.fx + mouth[0], gy - self.gS.fy + mouth[1])
        draw_puffs(img, gm, t, lerp(2.0, 3.2, q), 0.3, -1, s)
        img = img.convert("RGB")
        p = smooth(q)
        out = camera(img, lerp(1.0, 1.35, p), lerp(WW * 0.5, WW * 0.60, p), lerp(WH * 0.55, WH * 0.58, p))
        return self.snow.draw(out, t, lerp(0.7, 1.0, q), lerp(1.0, 1.4, q))


# ---- 8. DAWN -------------------------------------------------------------
class Dawn(Rampart):
    post_kw = dict(sat=0.62, contrast=1.08, grain=7, tint=(0.97, 1.0, 1.06), bloom=0.12)

    def __init__(self):
        s, gy = int(WH * 0.33), int(WH * 0.78)
        super().__init__(s, gy, "dawn", tower=True, door="closed", torch_x=int(WW * 0.86), seed=19)
        S = Sil(s, 1, wmul=1.6, hmul=1.0, foot=0.9)
        guard_dead_shape(S)
        rims = [((0, -1), s * 0.025, (232, 236, 246), 1.0, s * 0.006), ((1, 0), s * 0.006, (200, 170, 160), 0.5, 2)]
        self.dead = sil_layer(S.mask(), (34, 34, 40), rims, tex_seed=6)
        self.dS = S
        self.dx = WW * 0.40
        self.sold = []
        for x, seed in ((0.15, 8), (0.25, 9)):
            Sg = Sil(s, 1)
            guard_shape(Sg)
            spr = sil_layer(Sg.mask(), (40, 40, 48), [((0, -1), s * 0.008, (220, 225, 240), 0.8, 2)], tex_seed=seed)
            self.sold.append((spr, Sg, WW * x))
        self.snow = Snow(707, n=(150, 70, 10), wind=40, speed=0.55, color=(240, 242, 248))

    def frame(self, t, dur):
        s, gy = self.s, self.gy
        arr = self.bg.copy()
        arr = self.add_fog(arr, t * 0.5, 55, (200, 200, 215))
        img = to_img(arr).convert("RGBA")
        for spr, Sg, x in self.sold:
            paste_sprite(img, spr, x - Sg.fx, gy - Sg.fy)
        paste_sprite(img, self.dead, self.dx - self.dS.fx, gy - self.dS.fy)
        draw_smoke(img, self.flame_pos[0], self.flame_pos[1], t, s, 45)
        img = img.convert("RGB")
        p = smooth(t / dur)
        out = camera(img, lerp(1.0, 1.42, p), lerp(WW * 0.5, WW * 0.52, p), lerp(WH * 0.56, WH * 0.62, p))
        return self.snow.draw(out, t, 0.8)


# ---- 10. END CARD --------------------------------------------------------
class End(Scene):
    post_kw = dict(grain=6, bloom=0.2)

    def __init__(self):
        self.snow = Snow(808, n=(140, 60, 8), wind=30, speed=0.4, color=(200, 205, 220))
        self.bg = vgrad(W, H, [(0, (4, 5, 9)), (1, (10, 12, 18))])

    def frame(self, t, dur):
        img = to_img(self.bg)
        return self.snow.draw(img, t, 0.8)


SCENE_CLASSES = {
    "hook": lambda: Hook(),
    "castle": lambda: Castle(),
    "approach": lambda: Approach(),
    "dialog": lambda: TwoShot("dialog"),
    "promise": lambda: TwoShot("promise"),
    "hall": lambda: Hall(),
    "waiting": lambda: Waiting(),
    "dawn": lambda: Dawn(),
    "inscription": lambda: Inscription(2.3, 7.6),
    "end": lambda: End(),
}


def scene_by_time(tg):
    for sc in SCENES:
        if sc[1] <= tg < sc[2]:
            return sc
    return SCENES[-1]


def render_frame(scene_obj, sc, fi_global, tg):
    name, a, b, fin, fout = sc
    t, dur = tg - a, b - a
    img = scene_obj.frame(t, dur)
    img = post(img, fi_global, **scene_obj.post_kw)
    k = 1.0
    if fin > 0 and t < fin:
        k = min(k, smooth(t / fin))
    if fout > 0 and t > dur - fout:
        k = min(k, smooth((dur - t) / fout))
    if k < 1.0:
        img = to_img(np.asarray(img, np.float32) * k)
    return draw_captions(img, tg)


def render_scene(name):
    sc = [s for s in SCENES if s[0] == name][0]
    _, a, b, _, _ = sc
    f0, f1 = round(a * FPS), round(b * FPS)
    os.makedirs(BUILD, exist_ok=True)
    out = os.path.join(BUILD, f"{SCENES.index(sc):02d}_{name}.mp4")
    obj = SCENE_CLASSES[name]()
    cmd = ["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
           "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-preset", "medium", "-crf", "17",
           "-pix_fmt", "yuv420p", "-r", str(FPS), out]
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    for fi in range(f0, f1):
        img = render_frame(obj, sc, fi, fi / FPS)
        proc.stdin.write(img.tobytes())
    proc.stdin.close()
    proc.wait()
    return out


def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else "render"
    if mode == "preview":
        os.makedirs(os.path.join(HERE, "preview"), exist_ok=True)
        cache = {}
        for ts in sys.argv[2:]:
            tg = float(ts)
            sc = scene_by_time(tg)
            if sc[0] not in cache:
                cache[sc[0]] = SCENE_CLASSES[sc[0]]()
            img = render_frame(cache[sc[0]], sc, int(tg * FPS), tg)
            p = os.path.join(HERE, "preview", f"t{tg:05.1f}_{sc[0]}.jpg")
            img.resize((540, 960), Image.LANCZOS).save(p, quality=88)
            print(p)
    else:
        names = sys.argv[2:] or [s[0] for s in SCENES]
        with Pool(min(4, len(names))) as pool:
            for out in pool.imap_unordered(render_scene, names):
                print("done", out, flush=True)


if __name__ == "__main__":
    main()
