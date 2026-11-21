#!/usr/bin/env python3
"""Procedural, deterministic SFX + ambience for Gece Sicili (no credits, no copyrighted audio).
Writes 48 kHz stereo WAVs into audio/sfx/. Re-run any time; output is identical (seeded).
Each sound is a small recipe; swap any file later (audio/cues-XX.md lists where each is used)."""
import numpy as np, wave, os, sys

SR = 48000
OUT = os.path.join(os.path.dirname(__file__), "..", "audio", "sfx")
os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(1)


def t(d):
    return np.arange(int(SR * d)) / SR


def env(n, a=0.002, d=0.3, curve=4.0):
    x = np.arange(n) / SR
    e = np.minimum(1, x / max(a, 1e-4)) * np.exp(-curve * np.maximum(0, x - a) / max(d, 1e-4))
    return e


def noise(d):
    return rng.standard_normal(int(SR * d))


def lp(x, fc):
    # one-pole lowpass, run twice
    a = np.exp(-2 * np.pi * fc / SR)
    y = np.empty_like(x)
    for _ in range(2):
        s = 0.0
        for i in range(len(x)):
            s = (1 - a) * x[i] + a * s
            y[i] = s
        x = y.copy()
    return y


def lp_fast(x, fc):
    # FFT brickwall-ish lowpass with soft roll (fast for long signals)
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 / (1 + (f / fc) ** 4)
    return np.fft.irfft(X, len(x))


def bp_fast(x, lo, hi):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= (1 / (1 + (f / hi) ** 4)) * (1 / (1 + (lo / np.maximum(f, 1)) ** 4))
    return np.fft.irfft(X, len(x))


def norm(x, peak_db=-3):
    m = np.max(np.abs(x)) or 1
    return x / m * 10 ** (peak_db / 20)


def save(name, x, width=0.25, peak_db=-3):
    x = norm(np.asarray(x, dtype=np.float64), peak_db)
    # light stereo: tiny decorrelated delay on the right channel
    dly = int(SR * 0.0007)
    r = np.concatenate([np.zeros(dly), x[:-dly] if dly else x])
    st = np.stack([x, (1 - width) * x + width * r], axis=1)
    st = np.clip(st, -1, 1)
    p = os.path.join(OUT, name + ".wav")
    with wave.open(p, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((st * 32767).astype("<i2").tobytes())
    print("wrote", p, f"{len(x)/SR:.2f}s")


def metal(d, freqs, decay):
    tt = t(d)
    x = sum(np.sin(2 * np.pi * f * tt + i) * np.exp(-tt * decay * (1 + i * 0.35)) / (1 + i * 0.4) for i, f in enumerate(freqs))
    return x


# --- tray clang: metal impact + bounce
d = 1.6
x = metal(d, [523, 1187, 1760, 2390, 3150, 4410], 3.2)
x += 0.6 * noise(d) * env(len(t(d)), 0.001, 0.03, 6)
b = int(SR * 0.22)
x[b:] += 0.45 * metal(d - 0.22, [530, 1201, 1790, 2420], 6)[: len(x) - b]
save("tray_clang", x * env(len(x), 0.001, 0.9, 2.5))

# --- cloth + grip (rustle burst)
d = 0.7
x = bp_fast(noise(d), 800, 5000) * env(len(t(d)), 0.06, 0.25, 3)
save("cloth_grip", x, peak_db=-8)

# --- alarm cord rustle (light cord movement)
d = 0.5
x = bp_fast(noise(d), 1500, 7000) * env(len(t(d)), 0.03, 0.15, 4)
save("cord_rustle", x, peak_db=-12)

# --- blood drop (small wet tick)
d = 0.35
tt = t(d)
f = 1400 * np.exp(-tt * 18) + 300
x = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(tt), 0.001, 0.05, 5)
x += 0.2 * bp_fast(noise(d), 2000, 6000) * env(len(tt), 0.001, 0.02, 6)
save("blood_drop", x, peak_db=-10)

# --- cart wheels in corridor (rumble + periodic squeak/clicks, passes by)
d = 2.6
tt = t(d)
rum = lp_fast(noise(d), 180) * 3
clicks = np.zeros_like(tt)
for k in np.arange(0.05, d, 0.19):
    i = int(k * SR)
    seg = np.exp(-np.arange(1200) / 140.0) * np.sin(2 * np.pi * 900 * np.arange(1200) / SR)
    clicks[i : i + 1200] += seg[: len(clicks) - i]
sq = 0.15 * np.sin(2 * np.pi * (1900 + 60 * np.sin(2 * np.pi * 3 * tt)) * tt) * (np.sin(2 * np.pi * 0.8 * tt) > 0.6)
pass_env = np.sin(np.pi * np.clip(tt / d, 0, 1)) ** 1.5
x = (rum + 0.5 * clicks + sq) * pass_env
save("cart_wheels", lp_fast(x, 2500), peak_db=-6)

# --- package thud on steel
d = 0.6
tt = t(d)
x = np.sin(2 * np.pi * (90 + 40 * np.exp(-tt * 30)) * tt) * env(len(tt), 0.002, 0.12, 4)
x += 0.3 * metal(d, [740, 1630], 9) + 0.25 * lp_fast(noise(d), 1200) * env(len(tt), 0.001, 0.05, 6)
save("package_thud", x, peak_db=-5)

# --- glass ampule roll + clink
d = 1.2
tt = t(d)
roll = bp_fast(noise(d), 2500, 9000) * 0.25 * (0.6 + 0.4 * np.sin(2 * np.pi * 11 * tt)) * np.clip(1 - tt / 0.8, 0, 1)
cl = np.zeros_like(tt)
for k, a in [(0.82, 1.0), (0.93, 0.4)]:
    i = int(k * SR)
    seg = metal(0.35, [3120, 4710, 6230], 14)
    cl[i : i + len(seg)] += a * seg[: len(cl) - i]
save("ampule_clink", roll + cl, peak_db=-8)

# --- paper slide
d = 0.6
x = bp_fast(noise(d), 1800, 8000) * env(len(t(d)), 0.08, 0.3, 3)
save("paper_slide", x, peak_db=-12)

# --- register pulled from shelf + dust
d = 1.0
tt = t(d)
x = lp_fast(noise(d), 900) * env(len(tt), 0.05, 0.35, 3) + 0.4 * np.sin(2 * np.pi * 70 * tt) * env(len(tt), 0.4, 0.15, 6)
x += 0.25 * bp_fast(noise(d), 3000, 9000) * env(len(tt), 0.3, 0.5, 2)
save("register_pull", x, peak_db=-7)

# --- page flips (3 quick flips)
d = 0.9
x = np.zeros(int(SR * d))
for k in [0.0, 0.22, 0.42]:
    i = int(k * SR)
    seg = bp_fast(noise(0.2), 1500, 7000) * env(int(SR * 0.2), 0.01, 0.06, 4)
    x[i : i + len(seg)] += seg[: len(x) - i]
save("page_flips", x, peak_db=-10)

# --- knee thud on tiles
d = 0.6
tt = t(d)
x = np.sin(2 * np.pi * (65 + 50 * np.exp(-tt * 40)) * tt) * env(len(tt), 0.001, 0.15, 4) + 0.4 * lp_fast(noise(d), 600) * env(len(tt), 0.001, 0.05, 5)
save("knee_thud", x, peak_db=-4)

# --- sheet slide (cloth sliding off and settling)
d = 1.0
tt = t(d)
x = bp_fast(noise(d), 400, 3500) * np.sin(np.pi * np.clip(tt / 0.9, 0, 1)) ** 2
save("sheet_slide", x, peak_db=-10)

# --- door handle click (lever down)
d = 0.4
tt = t(d)
x = metal(d, [2100, 3400, 5100], 40) * env(len(tt), 0.0005, 0.04, 6)
i = int(0.09 * SR)
x[i:] += 0.7 * (metal(d - 0.09, [1500, 2600], 35) * env(len(tt) - i, 0.0005, 0.03, 6))
x += 0.3 * np.sin(2 * np.pi * 160 * tt) * env(len(tt), 0.001, 0.06, 5)
save("handle_click", x, peak_db=-5)

# --- cord dropped (cord swings + ring taps wall)
d = 0.8
tt = t(d)
x = bp_fast(noise(d), 2000, 7000) * env(len(tt), 0.02, 0.2, 3) * 0.5
i = int(0.25 * SR)
x[i:] += metal(d - 0.25, [1800, 2900], 25)
save("cord_drop", x, peak_db=-12)

# --- morgue drawer rumble (steel tray on rollers)
d = 1.6
tt = t(d)
x = lp_fast(noise(d), 260) * 3 * (0.7 + 0.3 * np.sin(2 * np.pi * 23 * tt)) * np.sin(np.pi * np.clip(tt / 1.5, 0, 1)) ** 0.6
x += 0.2 * metal(d, [610, 1340], 1.5) * np.sin(np.pi * np.clip(tt / 1.5, 0, 1))
i = int(1.45 * SR)
x[i:] += 0.6 * metal(d - 1.45, [480, 1120, 1960], 12)[: len(x) - i]
save("drawer_rumble", x, peak_db=-5)

# --- drawer lid slide + close
d = 2.4
tt = t(d)
x = lp_fast(noise(d), 400) * 2 * np.sin(np.pi * np.clip(tt / 1.8, 0, 1)) ** 0.8
i = int(1.9 * SR)
x[i:] += metal(d - 1.9, [400, 980, 1700, 2600], 9)[: len(x) - i] + 0.8 * (np.sin(2 * np.pi * 70 * tt[: len(x) - i]) * env(len(x) - i, 0.001, 0.12, 4))
save("lid_close", x, peak_db=-4)

# --- outer door opens + corridor hum swell
d = 2.4
tt = t(d)
creak = 0.35 * np.sin(2 * np.pi * np.cumsum(220 + 90 * np.sin(2 * np.pi * 1.3 * tt)) / SR) * np.exp(-tt * 1.4) * (tt < 1.2)
latch = metal(d, [1300, 2700], 30) * env(len(tt), 0.0005, 0.03, 6)
hum = (0.25 * np.sin(2 * np.pi * 100 * tt) + 0.12 * np.sin(2 * np.pi * 200 * tt) + 0.2 * lp_fast(noise(d), 500)) * np.clip(tt / 1.0, 0, 1)
save("door_open", latch + creak + hum, peak_db=-5)

# --- AMBIENCE: morgue room tone 120 s (drone + faint fluorescent buzz), seamless enough for one episode
d = 121.0
tt = t(d)
drone = lp_fast(noise(d), 120) * 2.2
drone *= 0.85 + 0.15 * np.sin(2 * np.pi * 0.05 * tt)
buzz = (np.sin(2 * np.pi * 120 * tt) + 0.5 * np.sin(2 * np.pi * 240 * tt + 1) + 0.25 * np.sin(2 * np.pi * 360 * tt + 2)) * 0.035
hiss = bp_fast(noise(d), 3000, 9000) * 0.02
save("amb_morgue", drone + buzz + hiss, width=0.6, peak_db=-6)
