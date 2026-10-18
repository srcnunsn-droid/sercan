#!/usr/bin/env python3
"""Dracula vs Frankenstein: 20 saniyelik dövüş videosu.

Görseller Higgsfield ile üretildi (bkz. higgsfield_images.json). Kamera
hareketi, kurgu, yağmur / şimşek / yarasa / kıvılcım efektleri, yazılar ve ses
tamamen bu kodla üretilir; video için Higgsfield kullanılmaz.

    python3 video/fetch_images.py                 # görselleri indir
    python3 video/make_video.py                   # 1920x1080 @30fps
    python3 video/make_video.py --preview         # 960x540 hızlı önizleme
    python3 video/make_video.py --stills 3,10.3   # seçili anların PNG'leri
"""
import argparse
import math
import os
import subprocess
import sys
import tempfile
import time
from multiprocessing import Pool

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

import soundtrack
from timeline import BEAT, CUTS, DURATION, FIGHT, FLASH_CUTS, FPS, IMPACTS, LIGHTNING, TITLE_T, beat

ROOT = os.path.dirname(os.path.abspath(__file__))


def find_font(*names):
    for n in names:
        for d in ("liberation", "dejavu", "freefont"):
            p = f"/usr/share/fonts/truetype/{d}/{n}"
            if os.path.exists(p):
                return p
    return None


FONT_BOLD = find_font("LiberationSerif-Bold.ttf", "DejaVuSerif-Bold.ttf", "FreeSerifBold.ttf")
FONT_ITALIC = find_font("LiberationSerif-Italic.ttf", "FreeSerifItalic.ttf", "DejaVuSerif.ttf")

# Planlar. zoom: (başlangıç, bitiş); c0/c1: görsel içindeki kamera merkezi (0..1);
# grade: (kontrast, doygunluk, RGB tonu). Kıvılcım ve ark konumları görsel koordinatındadır,
# kamerayla birlikte hareket ederler.
SHOTS = [
    dict(name="castle", img="00_castle.jpg", zoom=(1.0, 1.18), c0=(0.55, 0.50), c1=(0.62, 0.36),
         ease="out", grade=(1.06, 0.85, (0.92, 0.97, 1.10)), rain=1.0, bats="far"),
    dict(name="dracula", img="01_dracula.jpg", zoom=(1.04, 1.26), c0=(0.62, 0.46), c1=(0.67, 0.36),
         ease="inout", grade=(1.08, 0.95, (1.04, 0.96, 0.96))),
    dict(name="monster", img="02_monster.jpg", zoom=(1.04, 1.24), c0=(0.38, 0.46), c1=(0.33, 0.38),
         ease="inout", grade=(1.08, 0.92, (0.95, 1.00, 1.07)), electric=True,
         arcs=[(0.16, 0.43, 0.11, 0.30), (0.16, 0.43, 0.22, 0.48), (0.16, 0.44, 0.12, 0.54),
               (0.31, 0.62, 0.32, 0.72)]),
    dict(name="faceoff", img="03_faceoff.jpg", zoom=(1.0, 1.14), c0=(0.50, 0.56), c1=(0.52, 0.46),
         ease="inout", grade=(1.06, 0.9, (0.95, 0.98, 1.06)), rain=0.6, fog=0.5, xfade=0.4),
    dict(name="lunge", img="04_lunge.jpg", zoom=(1.0, 1.5), c0=(0.50, 0.52), c1=(0.58, 0.32),
         ease="in", grade=(1.08, 0.95, (1.0, 0.97, 1.0)), rain=0.6, blur=True),
    dict(name="punch", img="05_punch.jpg", zoom=(1.26, 1.06), c0=(0.64, 0.45), c1=(0.55, 0.48),
         ease="out", grade=(1.1, 0.95, (0.98, 0.98, 1.04)), rain=0.5, electric=True,
         sparks=[(beat(4), (0.68, 0.44), 120, "mixed")],
         arcs=[(0.40, 0.46, 0.66, 0.44), (0.46, 0.64, 0.62, 0.55), (0.12, 0.27, 0.08, 0.18)]),
    dict(name="bats", img="06_bats.jpg", zoom=(1.12, 1.24), c0=(0.40, 0.55), c1=(0.56, 0.36),
         ease="inout", grade=(1.06, 0.9, (0.96, 0.97, 1.05)), rain=0.3, bats="swarm"),
    dict(name="grab", img="07_grab.jpg", zoom=(1.0, 1.2), c0=(0.48, 0.50), c1=(0.55, 0.36),
         ease="inout", grade=(1.08, 0.9, (0.94, 0.98, 1.08)), rain=0.9, electric=True,
         sparks=[(beat(15), (0.68, 0.30), 60, "blue")],
         arcs=[(0.47, 0.57, 0.64, 0.38), (0.43, 0.60, 0.57, 0.68), (0.62, 0.40, 0.68, 0.48),
               (0.22, 0.47, 0.17, 0.52)]),
    dict(name="rooftop", img="08_rooftop.jpg", zoom=(1.32, 1.02), c0=(0.48, 0.20), c1=(0.50, 0.40),
         ease="out", grade=(1.06, 0.88, (0.94, 0.97, 1.08)), rain=0.9, bats="circle", moon=(0.485, 0.11)),
]
for _i, _s in enumerate(SHOTS):
    _s["t0"], _s["t1"] = CUTS[_s["name"]]
    _s["seed"] = _i

SHAKES = [(ti, 34 * s, 6.0) for ti, s in IMPACTS] + [(FIGHT, 12, 3.5), (beat(9), 10, 4.0), (beat(14), 8, 4.0)]
RAIN_ANGLE = 0.15
G = {}


# ---------------------------------------------------------------- yardımcılar

def clamp01(x):
    return min(max(x, 0.0), 1.0)


def smooth(x):
    x = clamp01(x)
    return x * x * (3 - 2 * x)


def ease(p, kind):
    p = clamp01(p)
    if kind == "in":
        return p ** 3
    if kind == "out":
        return 1 - (1 - p) ** 3
    return smooth(p)


def lerp(a, b, w):
    return a + (b - a) * w


def grade(im, contrast, sat, tint):
    a = np.asarray(im, np.float32) / 255
    lum = (a @ np.array([0.299, 0.587, 0.114], np.float32))[..., None]
    a = lum + (a - lum) * sat
    a = (a - 0.45) * contrast + 0.45
    a = a * np.array(tint, np.float32)
    return Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8))


def text_layer(text, size, color, font, tracking=0.0, glow=None, glow_r=0):
    """Harf aralıklı, isteğe bağlı parıltılı RGBA (float) yazı katmanı."""
    f = ImageFont.truetype(font, size)
    widths = [f.getlength(ch) for ch in text]
    asc, desc = f.getmetrics()
    pad = int(glow_r * 3) + 4
    w = int(sum(widths) + tracking * size * (len(text) - 1)) + 2 * pad
    h = asc + desc + 2 * pad
    mask = Image.new("L", (w, h), 0)
    d = ImageDraw.Draw(mask)
    x = pad
    for ch, cw in zip(text, widths):
        d.text((x, pad), ch, font=f, fill=255)
        x += cw + tracking * size
    a = np.asarray(mask, np.float32)[..., None] / 255
    rgb = np.broadcast_to(np.array(color, np.float32), (h, w, 3))
    if glow is None:
        return np.concatenate([rgb, a], 2)
    g = np.asarray(mask.filter(ImageFilter.GaussianBlur(glow_r)), np.float32)[..., None] / 255 * 0.9
    out_a = a + g * (1 - a)
    out_rgb = (rgb * a + np.array(glow, np.float32) * g * (1 - a)) / np.maximum(out_a, 1e-4)
    return np.concatenate([out_rgb, out_a], 2)


def hstack_layers(layers, gap):
    h = max(l.shape[0] for l in layers)
    w = sum(l.shape[1] for l in layers) + gap * (len(layers) - 1)
    out = np.zeros((h, w, 4), np.float32)
    x = 0
    for l in layers:
        y = (h - l.shape[0]) // 2
        out[y:y + l.shape[0], x:x + l.shape[1]] = l
        x += l.shape[1] + gap
    return out


def overlay_rgba(frame, layer, x, y, opacity=1.0):
    H, W = frame.shape[:2]
    h, w = layer.shape[:2]
    x0, y0, x1, y1 = max(x, 0), max(y, 0), min(x + w, W), min(y + h, H)
    if x1 <= x0 or y1 <= y0 or opacity <= 0:
        return
    sub = layer[y0 - y:y1 - y, x0 - x:x1 - x]
    a = sub[..., 3:4] * opacity
    frame[y0:y1, x0:x1] = frame[y0:y1, x0:x1] * (1 - a) + sub[..., :3] * a


def bat_points(x, y, s, phase, ang=0.0):
    """Kanat çırpan yarasa silueti; s = yarım kanat açıklığı (px)."""
    wy = -0.5 * math.sin(phase)
    half = [(0.0, -0.10), (0.05, -0.24), (0.09, -0.08), (0.16, -0.04),
            (0.45, -0.18 + 0.6 * wy), (0.78, -0.22 + wy), (1.0, -0.10 + wy),
            (0.86, 0.06 + 0.85 * wy), (0.72, 0.0 + 0.7 * wy), (0.58, 0.14 + 0.55 * wy),
            (0.42, 0.06 + 0.4 * wy), (0.28, 0.18 + 0.2 * wy), (0.14, 0.10), (0.06, 0.30), (0.0, 0.36)]
    pts = half + [(-px, py) for px, py in reversed(half[1:-1])]
    c, sn = math.cos(ang), math.sin(ang)
    return [(x + s * (px * c - py * sn), y + s * (px * sn + py * c)) for px, py in pts]


def jagged(p0, p1, rng, depth=5, rough=0.25):
    pts = [p0, p1]
    for _ in range(depth):
        out = [pts[0]]
        for a, b in zip(pts, pts[1:]):
            mx, my = (a[0] + b[0]) / 2, (a[1] + b[1]) / 2
            dx, dy = b[0] - a[0], b[1] - a[1]
            off = rng.normal(0, rough) * math.hypot(dx, dy)
            out += [(mx - dy / (math.hypot(dx, dy) + 1e-6) * off, my + dx / (math.hypot(dx, dy) + 1e-6) * off), b]
        pts = out
    return pts


# ---------------------------------------------------------------- worker hazırlığı

def make_rain(W, H, U, n, length, width, bright, blur, seed):
    rng = np.random.default_rng(seed)
    im = Image.new("L", (W, H), 0)
    d = ImageDraw.Draw(im)
    tx = math.tan(RAIN_ANGLE)
    for _ in range(n):
        x, y = rng.uniform(0, W), rng.uniform(0, H)
        L = rng.uniform(*length) * U
        b = int(rng.uniform(*bright))
        for oy in (-H, 0, H):
            for ox in (-W, 0, W):
                d.line([(x + ox, y + oy), (x + ox + tx * L, y + oy + L)], fill=b, width=max(1, round(width * U)))
    if blur:
        im = im.filter(ImageFilter.GaussianBlur(blur * U))
    return np.asarray(im, np.float32) / 255


def init_worker(W, H, img_dir):
    U = W / 1920
    G.update(W=W, H=H, U=U, bar=round(H * 0.105))
    G["imgs"] = {}
    for s in SHOTS:
        im = Image.open(os.path.join(img_dir, s["img"])).convert("RGB")
        tw = min(im.width, int(W * 1.6))
        if im.width > tw:
            im = im.resize((tw, round(im.height * tw / im.width)), Image.LANCZOS)
        G["imgs"][s["name"]] = grade(im, *s["grade"])

    G["rain_far"] = make_rain(W, H, U, 1500, (18, 42), 1, (50, 130), 0.6, 1)
    G["rain_near"] = make_rain(W, H, U, 260, (60, 120), 2, (90, 190), 1.3, 2)

    rng = np.random.default_rng(5)
    fog = np.zeros((H, 2 * W), np.float32)
    for cells, amp in ((6, 0.65), (14, 0.35)):
        low = (rng.random((cells, cells * 4)) * 255).astype(np.uint8)
        low = np.concatenate([low, low[:, :1]], 1)  # yatayda dikişsiz kaydırma için
        up = Image.fromarray(low).resize((2 * W + 2 * W // (cells * 4), H), Image.BICUBIC)
        fog += np.asarray(up, np.float32)[:, :2 * W] / 255 * amp
    ys = np.linspace(0, 1, H, dtype=np.float32)[:, None]
    G["fog"] = np.clip(fog - 0.3, 0, 1) * np.clip((ys - 0.45) / 0.4, 0, 1)

    yy, xx = np.mgrid[-1:1:H * 1j, -1:1:W * 1j].astype(np.float32)
    G["vignette"] = (1 - 0.42 * ((xx ** 2 + yy ** 2) / 2) ** 1.3)[..., None]
    G["shade"] = (np.clip((ys - 0.5) / 0.4, 0, 1) ** 1.5)[..., None]

    grain = rng.standard_normal((8, (H + 1) // 2, (W + 1) // 2)).astype(np.float32)
    G["grain"] = grain.repeat(2, 1).repeat(2, 2)[:, :H, :W]

    red, green, bone = (0.86, 0.08, 0.06), (0.55, 0.86, 0.42), (0.92, 0.9, 0.85)
    T = {}
    T["place"] = text_layer("TRANSİLVANYA · GECE YARISI", int(34 * U), bone, FONT_BOLD, 0.35)
    T["drac"] = text_layer("KONT DRACULA", int(76 * U), red, FONT_BOLD, 0.12, glow=(0.6, 0.0, 0.0), glow_r=10 * U)
    T["drac_sub"] = text_layer("Karanlığın Efendisi", int(36 * U), bone, FONT_ITALIC, 0.05)
    T["mon"] = text_layer("FRANKENSTEIN'IN CANAVARI", int(70 * U), green, FONT_BOLD, 0.1, glow=(0.1, 0.45, 0.1), glow_r=10 * U)
    T["mon_sub"] = text_layer("Ölümden Doğan", int(36 * U), bone, FONT_ITALIC, 0.05)
    title = hstack_layers([
        text_layer("DRACULA", int(118 * U), red, FONT_BOLD, 0.08, glow=(0.7, 0.0, 0.0), glow_r=16 * U),
        text_layer("VS", int(70 * U), bone, FONT_BOLD, 0.1, glow=(0.6, 0.6, 0.7), glow_r=10 * U),
        text_layer("FRANKENSTEIN", int(118 * U), green, FONT_BOLD, 0.08, glow=(0.1, 0.5, 0.1), glow_r=16 * U),
    ], int(10 * U))
    T["title"] = Image.fromarray((np.clip(title, 0, 1) * 255).astype(np.uint8), "RGBA")
    T["tag"] = text_layer("KİM KAZANACAK?", int(40 * U), bone, FONT_BOLD, 0.45)
    G["text"] = T


# ---------------------------------------------------------------- kamera

def shake(t):
    dx = dy = rot = 0.0
    for t0, amp, decay in SHAKES:
        if t < t0 or t > t0 + 1.5:
            continue
        k = amp * G["U"] * math.exp(-(t - t0) * decay)
        dx += k * (0.6 * math.sin(t * 97 + t0 * 13) + 0.4 * math.sin(t * 61.3 + t0 * 7))
        dy += k * 0.6 * (0.6 * math.sin(t * 83.1 + t0 * 3) + 0.4 * math.sin(t * 47.9 + t0 * 11))
        rot += k / G["U"] * 0.00022 * math.sin(t * 71.7 + t0)
    return dx, dy, rot


def cam_params(s, t):
    U = G["U"]
    e = ease((t - s["t0"]) / (s["t1"] - s["t0"]), s["ease"])
    z = lerp(*s["zoom"], e) * 1.07
    cx = lerp(s["c0"][0], s["c1"][0], e)
    cy = lerp(s["c0"][1], s["c1"][1], e)
    for ti, st in IMPACTS:
        if ti <= t < ti + 1.2:
            z *= 1 + 0.08 * st * math.exp(-(t - ti) * 7)
    dx, dy, rot = shake(t)
    dx += 5 * U * math.sin(t * 1.3 + s["seed"])
    dy += 4 * U * math.sin(t * 1.7 + 2 * s["seed"])
    return z, cx, cy, dx, dy, rot


def cam_geom(s, t):
    """Ölçek, görseldeki kamera merkezi (px) ve dönüş."""
    W, H = G["W"], G["H"]
    sw, sh = G["imgs"][s["name"]].size
    z, cx, cy, dx, dy, rot = cam_params(s, t)
    S = max(W / sw, H / sh) * z
    hw, hh = W / (2 * S), (H / 2 - G["bar"]) / S  # sinemaskop bantları arasındaki görünür alan
    m = 0.03 * min(sw, sh)  # sarsıntı payı
    px = min(max(cx * sw, hw + m), sw - hw - m) if sw - 2 * hw > 2 * m else sw / 2
    py = min(max(cy * sh, hh + m), sh - hh - m) if sh - 2 * hh > 2 * m else sh / 2
    px = min(max(px - dx / S, hw), sw - hw)
    py = min(max(py - dy / S, hh), sh - hh)
    return S, px, py, rot, sw, sh


def to_screen(geom, x, y):
    S, px, py, rot, sw, sh = geom
    ix, iy = x * sw - px, y * sh - py
    c, sn = math.cos(rot), math.sin(rot)
    return G["W"] / 2 + S * (c * ix - sn * iy), G["H"] / 2 + S * (sn * ix + c * iy)


def camera_view(img, W, H, geom):
    S, px, py, rot = geom[:4]
    c, sn = math.cos(rot), math.sin(rot)
    a, b, d, e = c / S, sn / S, -sn / S, c / S
    return img.transform((W, H), Image.AFFINE,
                         (a, b, px - a * W / 2 - b * H / 2, d, e, py - d * W / 2 - e * H / 2),
                         resample=Image.BICUBIC)


def render_base(s, t):
    img, W, H = G["imgs"][s["name"]], G["W"], G["H"]
    if not s.get("blur"):
        return np.asarray(camera_view(img, W, H, cam_geom(s, t)), np.float32) / 255
    # hızlı hamle: 180° obtüratörlü hareket bulanıklığı
    acc = np.zeros((H, W, 3), np.float32)
    n = 4
    for k in range(n):
        tk = t + (k / (n - 1) - 0.5) * 0.5 / FPS
        acc += np.asarray(camera_view(img, W, H, cam_geom(s, tk)), np.float32)
    return acc / (255 * n)


# ---------------------------------------------------------------- plan efektleri

def add_rain(frame, s, t, L):
    W, H, U = G["W"], G["H"], G["U"]
    tx = math.tan(RAIN_ANGLE)
    out = np.zeros((H, W), np.float32)
    for key, speed, gain in (("rain_far", 1300, 0.22), ("rain_near", 2600, 0.38)):
        oy = t * speed * U
        out += np.roll(G[key], (int(oy) % H, int(oy * tx) % W), axis=(0, 1)) * gain
    k = s["rain"] * (1 + 1.6 * L)
    frame += out[..., None] * (k * np.array([0.72, 0.8, 0.95], np.float32))


def add_fog(frame, s, t):
    W = G["W"]
    off = int(t * 38 * G["U"]) % (2 * W)
    fog = np.roll(G["fog"], -off, axis=1)[:, :W] * s["fog"]
    col = np.array([0.55, 0.6, 0.72], np.float32)
    frame[:] = 1 - (1 - frame) * (1 - fog[..., None] * col)


def add_bats(frame, ov, s, t, geom):
    kind = s["bats"]
    W, H, U = G["W"], G["H"], G["U"]
    tl = t - s["t0"]
    rng = np.random.default_rng({"far": 21, "swarm": 22, "circle": 23}[kind])
    mask = Image.new("L", (W, H), 0)
    d = ImageDraw.Draw(mask)
    eyes = []
    if kind == "far":
        for _ in range(9):
            x0, y0 = rng.uniform(0, 1.2), rng.uniform(0.14, 0.42)
            vx, size = rng.uniform(0.04, 0.09), rng.uniform(5, 10) * U
            fr, ph = rng.uniform(5, 8), rng.uniform(0, 6.3)
            x = ((x0 + vx * tl) % 1.2 - 0.1) * W
            y = (y0 + 0.015 * math.sin(tl * 2 + ph)) * H
            d.polygon(bat_points(x, y, size, 2 * math.pi * fr * tl + ph), fill=255)
    elif kind == "swarm":
        cx, cy = (0.5 + 0.04 * math.sin(tl * 1.3)) * W, 0.45 * H
        for _ in range(85):
            a0, om = rng.uniform(0, 2 * math.pi), rng.uniform(1.2, 3.0) * rng.choice([-1, 1])
            z0, vz = rng.random(), rng.uniform(0.25, 0.5)
            fr, ph = rng.uniform(6, 10), rng.uniform(0, 6.3)
            z = (z0 + vz * tl) % 1.0
            r = (0.06 + 0.7 * z ** 1.5) * W
            ang = a0 + om * tl
            x, y = cx + r * math.cos(ang), cy + 0.55 * r * math.sin(ang)
            size = (5 + 115 * z ** 2.2) * U
            d.polygon(bat_points(x, y, size, 2 * math.pi * fr * tl + ph, 0.35 * math.sin(ang)), fill=255)
            if size > 30 * U:
                eyes.append((x, y, size, 0.35 * math.sin(ang)))
    else:  # ayın etrafında dönenler
        mx, my = to_screen(geom, *s["moon"])
        for _ in range(16):
            rx, a0 = rng.uniform(0.18, 0.46) * W, rng.uniform(0, 2 * math.pi)
            om, size = rng.uniform(0.5, 1.1) * rng.choice([-1, 1]), rng.uniform(7, 18) * U
            fr, ph = rng.uniform(5, 8), rng.uniform(0, 6.3)
            ang = a0 + om * tl
            x, y = mx + rx * math.cos(ang), my + 0.3 * rx * math.sin(ang)
            d.polygon(bat_points(x, y, size, 2 * math.pi * fr * tl + ph), fill=255)
    m = np.asarray(mask.filter(ImageFilter.GaussianBlur(0.8 * U)), np.float32)[..., None] / 255
    frame *= 1 - 0.95 * m
    od = ImageDraw.Draw(ov)
    for x, y, size, ang in eyes:
        r = max(1.0, 0.022 * size)
        for ex in (-0.035, 0.035):
            px = x + size * (ex * math.cos(ang) + 0.05 * math.sin(ang))
            py = y + size * (ex * math.sin(ang) - 0.05 * math.cos(ang))
            od.ellipse([px - r, py - r, px + r, py + r], fill=(255, 30, 10))


def add_sparks(ov, s, t, geom):
    W, H, U = G["W"], G["H"], G["U"]
    d = ImageDraw.Draw(ov)
    palettes = {"mixed": [(1.0, 0.62, 0.22), (1.0, 0.85, 0.5), (0.6, 0.8, 1.0)], "blue": [(0.6, 0.8, 1.0), (0.85, 0.95, 1.0)]}
    for bi, (tb, (ox, oy), n, pal) in enumerate(s.get("sparks", [])):
        dt = t - tb
        if not 0 <= dt < 1.2:
            continue
        rng = np.random.default_rng(1000 + 10 * s["seed"] + bi)
        cols = palettes[pal]
        sx, sy = to_screen(geom, ox, oy)
        for _ in range(n):
            ang, spd = rng.uniform(0, 2 * math.pi), rng.uniform(250, 1500) * U
            life, col = rng.uniform(0.25, 1.0), cols[int(rng.integers(len(cols)))]
            if dt > life:
                continue
            vx, vy = math.cos(ang) * spd, math.sin(ang) * spd
            g = 1500 * U

            def pos(tt):
                drag = (1 - math.exp(-2.5 * tt)) / 2.5
                return sx + vx * drag, sy + vy * drag + 0.5 * g * tt * tt

            fade = (1 - dt / life) ** 1.5
            d.line([pos(max(dt - 0.03, 0)), pos(dt)], fill=tuple(int(c * 255 * fade) for c in col),
                   width=max(1, round(3 * U)))


def add_arcs(ov, s, t, i, geom):
    """Rastgele kareliklerde titreyen elektrik arkları."""
    rng = np.random.default_rng(7000 + i)
    if rng.random() > 0.55:
        return 0.0
    U = G["U"]
    d = ImageDraw.Draw(ov)
    for (x0, y0, x1, y1) in s.get("arcs", []):
        if rng.random() < 0.3:
            continue
        j = rng.normal(0, 0.012, 2)
        pts = jagged(to_screen(geom, x0, y0), to_screen(geom, x1 + j[0], y1 + j[1]), rng)
        d.line(pts, fill=(150, 200, 255), width=max(1, round(3 * U)))
        d.line(pts, fill=(235, 245, 255), width=max(1, round(1 * U)))
    return rng.uniform(0.4, 1.0)


def render_shot(s, t, i, L):
    frame = render_base(s, t)
    ov = None
    if s.get("rain"):
        add_rain(frame, s, t, L)
    if s.get("fog"):
        add_fog(frame, s, t)
    if s.get("bats") or s.get("sparks") or s.get("electric"):
        ov = Image.new("RGB", (G["W"], G["H"]), 0)
        geom = cam_geom(s, t)
    if s.get("bats"):
        add_bats(frame, ov, s, t, geom)
    if s.get("sparks"):
        add_sparks(ov, s, t, geom)
    if s.get("electric"):
        flick = add_arcs(ov, s, t, i, geom)
        frame *= 1 + flick * np.array([0.02, 0.08, 0.22], np.float32)
    if ov is not None:
        o = np.asarray(ov, np.float32) / 255
        if o.max() > 0:
            small = ov.resize((G["W"] // 4, G["H"] // 4), Image.BILINEAR).filter(ImageFilter.GaussianBlur(3))
            glow = np.asarray(small.resize((G["W"], G["H"]), Image.BILINEAR), np.float32) / 255
            frame += o + 2.2 * glow
    return frame


# ---------------------------------------------------------------- genel efektler

def lightning_level(t):
    v = 0.0
    for tl, s in LIGHTNING:
        for off, a in ((0, 1.0), (0.09, 0.5), (0.2, 0.8)):
            dt = t - tl - off
            if 0 <= dt < 0.6:
                v += s * a * math.exp(-dt * 20)
    return min(v, 1.6)


def lt_alpha(t, t_in, t_out):
    return smooth((t - t_in) / 0.4) * smooth((t_out - t) / 0.35)


def lower_third(frame, layers, x, y, t, t_in, t_out, align):
    U = G["U"]
    a = lt_alpha(t, t_in, t_out)
    if a <= 0:
        return
    slide = (1 - smooth((t - t_in) / 0.7)) * 70 * U * (-1 if align == "left" else 1)
    for layer, dy in layers:
        lx = x + slide if align == "left" else x - layer.shape[1] + slide
        overlay_rgba(frame, layer, int(lx), int(y + dy), a)


def add_text(frame, t):
    W, H, U, bar, T = G["W"], G["H"], G["U"], G["bar"], G["text"]
    base = H - bar - int(40 * U)
    # okunabilirlik için yazıların altını hafifçe karart
    shade = max(0.5 * lt_alpha(t, 0.9, 2.5), lt_alpha(t, 2.85, 4.3), lt_alpha(t, 4.65, 6.1),
                smooth((t - TITLE_T) / 0.6))
    if shade > 0:
        frame *= 1 - 0.55 * shade * G["shade"]
    lower_third(frame, [(T["place"], -T["place"].shape[0])], 90 * U, base, t, 0.9, 2.5, "left")
    lower_third(frame, [(T["drac"], -T["drac"].shape[0] - 48 * U), (T["drac_sub"], -T["drac_sub"].shape[0])],
                90 * U, base, t, 2.85, 4.3, "left")
    lower_third(frame, [(T["mon"], -T["mon"].shape[0] - 48 * U), (T["mon_sub"], -T["mon_sub"].shape[0])],
                W - 90 * U, base, t, 4.65, 6.1, "right")
    if t >= TITLE_T:
        p = clamp01((t - TITLE_T) / 0.6)
        sc = lerp(1.18, 1.0, ease(p, "out"))
        im = T["title"]
        sc *= min(1.0, 0.86 * W / im.width)
        im = im.resize((max(1, int(im.width * sc)), max(1, int(im.height * sc))), Image.BICUBIC)
        layer = np.asarray(im, np.float32) / 255
        cy = H - bar - int(175 * U)
        overlay_rgba(frame, layer, (W - layer.shape[1]) // 2, cy - layer.shape[0] // 2, smooth(p * 1.4))
        a = smooth((t - TITLE_T - 0.7) / 0.5)
        tag = T["tag"]
        overlay_rgba(frame, tag, (W - tag.shape[1]) // 2, H - bar - int(85 * U), a)


def apply_global(frame, t, i):
    W, H, U = G["W"], G["H"], G["U"]
    L = lightning_level(t)
    if L > 0.01:
        frame += L * (0.75 * frame + 0.08) * np.array([0.85, 0.93, 1.15], np.float32)
    for tc, s in FLASH_CUTS:
        dt = t - tc + 1 / FPS
        if 0 <= dt < 0.45:
            f = s * math.exp(-dt * 13)
            frame += f * (1 - frame)
    for ti, s in IMPACTS:
        dt = t - ti
        if 0 <= dt < 0.6:
            sh = int(16 * U * s * math.exp(-dt * 8))
            if sh >= 1:
                frame[..., 0] = np.roll(frame[..., 0], sh, axis=1)
                frame[..., 2] = np.roll(frame[..., 2], -sh, axis=1)
    frame *= G["vignette"]
    add_text(frame, t)
    frame += G["grain"][i % 8][..., None] * 0.016
    bar = G["bar"]
    frame[:bar] = 0
    frame[H - bar:] = 0
    frame *= smooth(t / 0.7) * (1 - smooth((t - 19.35) / 0.65))
    return frame


def shot_index(t):
    for k, s in enumerate(SHOTS):
        if s["t0"] <= t < s["t1"]:
            return k
    return len(SHOTS) - 1


def render_frame_array(i):
    t = i / FPS
    L = lightning_level(t)
    k = shot_index(t)
    s = SHOTS[k]
    frame = render_shot(s, t, i, L)
    nxt = SHOTS[k + 1] if k + 1 < len(SHOTS) else None
    if s.get("xfade") and k > 0 and t < s["t0"] + s["xfade"] / 2:
        w = smooth((t - s["t0"] + s["xfade"] / 2) / s["xfade"])
        frame = render_shot(SHOTS[k - 1], t, i, L) * (1 - w) + frame * w
    elif nxt is not None and nxt.get("xfade") and t >= nxt["t0"] - nxt["xfade"] / 2:
        w = smooth((t - nxt["t0"] + nxt["xfade"] / 2) / nxt["xfade"])
        frame = frame * (1 - w) + render_shot(nxt, t, i, L) * w
    frame = apply_global(frame, t, i)
    return (np.clip(frame, 0, 1) * 255 + 0.5).astype(np.uint8)


def render_frame(i):
    return render_frame_array(i).tobytes()


# ---------------------------------------------------------------- ana akış

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--preview", action="store_true", help="960x540 hızlı önizleme")
    ap.add_argument("--images", default=os.path.join(ROOT, "images"))
    ap.add_argument("--out", default=None)
    ap.add_argument("--stills", default=None, help="virgülle ayrılmış saniyeler; PNG kaydeder")
    ap.add_argument("--jobs", type=int, default=os.cpu_count())
    args = ap.parse_args()

    W, H = (960, 540) if args.preview else (1920, 1080)
    missing = [s["img"] for s in SHOTS if not os.path.exists(os.path.join(args.images, s["img"]))]
    if missing:
        sys.exit(f"Eksik görseller ({args.images}): {', '.join(missing)}\nÖnce: python3 video/fetch_images.py")

    if args.stills:
        init_worker(W, H, args.images)
        out_dir = args.out or os.path.join(ROOT, "stills")
        os.makedirs(out_dir, exist_ok=True)
        for ts in args.stills.split(","):
            i = int(round(float(ts) * FPS))
            path = os.path.join(out_dir, f"frame_{float(ts):05.2f}.png")
            Image.fromarray(render_frame_array(i)).save(path)
            print(path)
        return

    out = args.out or os.path.join(ROOT, "dracula_vs_frankenstein" + ("_preview" if args.preview else "") + ".mp4")
    n_frames = int(round(DURATION * FPS))
    with tempfile.TemporaryDirectory() as tmp:
        wav = os.path.join(tmp, "soundtrack.wav")
        t0 = time.time()
        soundtrack.render(wav)
        print(f"ses hazır ({time.time() - t0:.1f}s)")
        cmd = ["ffmpeg", "-y", "-loglevel", "error",
               "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
               "-i", wav,
               "-c:v", "libx264", "-preset", "slow", "-crf", "23", "-maxrate", "10M", "-bufsize", "20M", "-pix_fmt", "yuv420p",
               "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", "-shortest", out]
        proc = subprocess.Popen(cmd, stdin=subprocess.PIPE)
        t0 = time.time()
        with Pool(args.jobs, initializer=init_worker, initargs=(W, H, args.images)) as pool:
            for i, buf in enumerate(pool.imap(render_frame, range(n_frames), chunksize=2)):
                proc.stdin.write(buf)
                if i % 60 == 0:
                    print(f"kare {i}/{n_frames}  ({time.time() - t0:.0f}s)", flush=True)
        proc.stdin.close()
        if proc.wait() != 0:
            sys.exit("ffmpeg başarısız oldu")
    print(f"tamam -> {out}")


if __name__ == "__main__":
    main()
