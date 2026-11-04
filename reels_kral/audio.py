#!/usr/bin/env python3
"""Procedural sound design for 'Kral ve Muhafiz' (48 kHz stereo).

Writes build/ambience.wav : wind, fire, footsteps, door, heartbeat, impacts, pad + piano.
The narrator voice is recorded separately and laid on top (see anlatici_metni.md).
"""
import os

import numpy as np
from scipy import signal
from scipy.io import wavfile

from timeline import DURATION

SR = 48000
N = int(DURATION * SR)
rng = np.random.default_rng(42)
HERE = os.path.dirname(os.path.abspath(__file__))
t = np.arange(N) / SR


def env(points):
    """piecewise-linear envelope from [(time, value), ...]"""
    xs, ys = zip(*points)
    return np.interp(t, xs, ys)


def bp(x, lo, hi, order=2):
    sos = signal.butter(order, [lo, hi], btype="band", fs=SR, output="sos")
    return signal.sosfilt(sos, x)


def lp(x, f, order=2):
    return signal.sosfilt(signal.butter(order, f, btype="low", fs=SR, output="sos"), x)


def hp(x, f, order=2):
    return signal.sosfilt(signal.butter(order, f, btype="high", fs=SR, output="sos"), x)


def place(buf, x, at, gain=1.0):
    i = int(at * SR)
    if i >= len(buf):
        return
    n = min(len(x), len(buf) - i)
    buf[i:i + n] += x[:n] * gain


def norm(x):
    return x / (np.max(np.abs(x)) + 1e-9)


# ------------------------------------------------------------------ wind
def wind_layer(seed):
    r = np.random.default_rng(seed)
    white = r.normal(0, 1, N)
    pink = lp(white, 900, 1)
    body = norm(bp(pink, 120, 1400))
    gust = lp(r.normal(0, 1, N), 0.35, 2)
    gust = 0.55 + 0.45 * norm(gust)
    howl = np.zeros(N)
    for fc, amt in ((420, 1.0), (610, 0.7), (880, 0.45)):
        wob = fc * (1 + 0.12 * norm(lp(r.normal(0, 1, N), 0.2, 2)))
        # narrow resonant band with drifting centre approximated by two fixed bands crossfaded
        a = bp(white, fc * 0.92, fc * 0.98, 2)
        b = bp(white, fc * 1.02, fc * 1.10, 2)
        mix = (wob - fc * 0.88) / (fc * 0.24)
        howl += amt * (a * (1 - np.clip(mix, 0, 1)) + b * np.clip(mix, 0, 1))
    howl = norm(howl)
    return body * gust * 0.8 + howl * gust ** 2 * 0.35


wind_l, wind_r = wind_layer(1), wind_layer(2)
wind_amt = env([(0, 0.35), (4.4, 0.4), (4.5, 1.0), (10.8, 0.95), (11.0, 0.65), (28.6, 0.6), (29.0, 0.07),
                (35.3, 0.08), (35.5, 0.7), (42.0, 1.25), (42.5, 0.18), (48.5, 0.15), (57.0, 0.08), (62, 0.0)])
wind_muffle = lp(wind_l + wind_r, 260, 2) * env([(0, 0), (28.9, 0), (29.2, 1.6), (35.2, 1.6), (35.5, 0), (62, 0)])

# ------------------------------------------------------------------ fire
def crackle(rate, seed, bright=1.0):
    r = np.random.default_rng(seed)
    out = np.zeros(N)
    times = np.cumsum(r.exponential(1.0 / rate, int(rate * DURATION * 1.3)))
    times = times[times < DURATION - 0.05]
    for ti in times:
        ln = int(SR * r.uniform(0.002, 0.012))
        burst = r.normal(0, 1, ln) * np.exp(-np.linspace(0, 6, ln)) * r.uniform(0.2, 1.0) ** 2
        place(out, burst, ti)
    out = hp(out, 1200 * bright)
    rumble = lp(r.normal(0, 1, N), 220, 2)
    rumble = norm(rumble) * (0.6 + 0.4 * norm(lp(r.normal(0, 1, N), 2.0, 2)))
    return norm(out) * 0.7 + rumble * 0.45


fire = crackle(26, 5)
fire_amt = env([(0, 0.12), (4.4, 0.12), (4.5, 0.0), (11.0, 0.0), (11.3, 0.16), (28.7, 0.16), (29.0, 0.9),
                (35.3, 0.85), (35.5, 0.14), (40.0, 0.04), (41.0, 0.0), (62, 0)])

# ----------------------------------------------------------- footsteps/door
steps = np.zeros(N)


def crunch(seed):
    r = np.random.default_rng(seed)
    ln = int(SR * 0.16)
    x = r.normal(0, 1, ln) * np.exp(-np.linspace(0, 5, ln))
    grains = (r.random(ln) > 0.97) * r.normal(0, 3, ln)
    return hp(bp(x + grains, 300, 5000), 250) * 0.9


for i, ts in enumerate(np.arange(11.25, 15.6, 0.55)):
    place(steps, crunch(100 + i), ts, 0.55 + 0.1 * (i % 2))
for i, ts in enumerate(np.arange(25.95, 28.6, 0.5)):
    place(steps, crunch(200 + i), ts, 0.5 * (1 - (ts - 25.9) / 3.2) + 0.1)


def thud(freq=62, dur=0.9, seed=7):
    r = np.random.default_rng(seed)
    ln = int(SR * dur)
    tt = np.arange(ln) / SR
    body = np.sin(2 * np.pi * freq * tt * (1 - 0.25 * tt)) * np.exp(-tt * 7)
    knock = lp(r.normal(0, 1, ln), 1800, 2) * np.exp(-tt * 35)
    return body * 0.9 + knock * 0.8


door = np.zeros(N)
place(door, thud(70, 1.2, 9), 28.85, 0.9)

# --------------------------------------------------------------- impacts
def boom(dur=4.0, f0=75, f1=30, seed=3):
    r = np.random.default_rng(seed)
    ln = int(SR * dur)
    tt = np.arange(ln) / SR
    f = f1 + (f0 - f1) * np.exp(-tt * 2.5)
    ph = 2 * np.pi * np.cumsum(f) / SR
    sub = np.sin(ph) * np.exp(-tt * 1.4)
    nz = lp(r.normal(0, 1, ln), 500, 2) * np.exp(-tt * 4)
    return sub + nz * 0.5


impacts = np.zeros(N)
place(impacts, boom(3.0, 60, 32, 1), 0.0, 0.5)
place(impacts, boom(4.0, 80, 30, 2), 4.5, 1.0)
place(impacts, boom(4.5, 70, 28, 3), 42.5, 1.0)
place(impacts, boom(3.5, 55, 30, 4), 57.0, 0.6)

# --------------------------------------------------------------- heartbeat
heart = np.zeros(N)
beat_t, bpm = 35.6, 72.0
while beat_t < 41.9:
    for off, g in ((0.0, 1.0), (0.17, 0.7)):
        ln = int(SR * 0.18)
        tt = np.arange(ln) / SR
        thump = np.sin(2 * np.pi * 48 * tt) * np.exp(-tt * 28) + 0.4 * np.sin(2 * np.pi * 96 * tt) * np.exp(-tt * 40)
        place(heart, thump, beat_t + off, g * (0.55 + 0.45 * (beat_t - 35.6) / 6.3))
    beat_t += 60.0 / bpm
    bpm = max(38.0, bpm - 5.5)

# ---------------------------------------------------------------- music
def note_freq(n):
    names = {"C": -9, "D": -7, "E": -5, "F": -4, "G": -2, "A": 0, "B": 2, "Bb": 1, "Eb": -6}
    nm, octv = n[:-1], int(n[-1])
    return 440.0 * 2 ** ((names[nm] + 12 * (octv - 4)) / 12)


def pad_chord(notes, start, end, gain, attack=2.5, release=2.5):
    out = np.zeros(N)
    i0, i1 = int(start * SR), min(N, int((end + release) * SR))
    tt = t[i0:i1] - start
    e = np.clip(tt / attack, 0, 1) * np.clip((end + release - start - tt) / release, 0, 1)
    for k, n in enumerate(notes):
        f = note_freq(n)
        for det in (-0.18, 0.21):
            ph = rng.uniform(0, 6.28)
            w = np.sin(2 * np.pi * (f + det) * tt + ph) + 0.3 * np.sin(2 * np.pi * 2 * (f + det) * tt + ph)
            out[i0:i1] += w * e * (0.9 ** k)
    return lp(out, 1600, 2) * gain


music = np.zeros(N)
music += pad_chord(["D2", "A2", "D3", "F3"], 0.0, 11.0, 0.10, 1.0, 2.0)
music += pad_chord(["Bb1", "F2", "D3", "F3"], 11.0, 22.5, 0.09, 2.0, 2.0)
music += pad_chord(["G2", "D3", "G3", "Bb3"], 22.5, 29.0, 0.08, 2.0, 1.5)
music += pad_chord(["F2", "C3", "A3", "C4"], 29.0, 35.5, 0.07, 1.0, 1.0)  # warm, deceptive
music += pad_chord(["D2", "A2", "D3", "Eb3"], 35.5, 42.3, 0.10, 2.0, 0.4)  # tension (b9)
music += pad_chord(["D2", "A2", "F3"], 46.0, 62.0, 0.07, 3.0, 2.0)


def piano(f, dur=3.5):
    ln = int(SR * dur)
    tt = np.arange(ln) / SR
    x = np.zeros(ln)
    for h, a in ((1, 1.0), (2, 0.45), (3, 0.22), (4, 0.12), (5, 0.06)):
        fh = f * h * (1 + 0.0004 * h * h)
        x += a * np.sin(2 * np.pi * fh * tt) * np.exp(-tt * (1.2 + 0.9 * h))
    att = np.clip(tt / 0.004, 0, 1)
    return x * att


melody = [("A3", 48.6), ("D4", 49.5), ("F4", 50.4), ("E4", 51.6), ("D4", 52.8), ("C4", 53.7), ("A3", 54.9),
          ("Bb3", 56.1), ("A3", 57.2), ("F3", 58.4), ("D4", 59.2), ("D3", 59.2)]
pno = np.zeros(N)
for n, ts in melody:
    place(pno, piano(note_freq(n)), ts, 0.22)
# a lone high note on the hook
place(pno, piano(note_freq("D5"), 4.0), 0.25, 0.12)
place(pno, piano(note_freq("A4"), 4.0), 1.6, 0.08)

# ---------------------------------------------------------------- reverb
def reverb(x, secs=3.2, seed=11, damp=3500):
    r = np.random.default_rng(seed)
    ln = int(SR * secs)
    tt = np.arange(ln) / SR
    ir = r.normal(0, 1, ln) * np.exp(-tt * 6.9 / secs)
    ir = lp(ir, damp, 1)
    ir[:int(SR * 0.012)] = 0
    ir /= np.sqrt(np.sum(ir ** 2))
    return signal.fftconvolve(x, ir)[:len(x)]


send = music + pno + impacts * 0.6 + door * 0.4
wet_l = reverb(send, 3.4, 11)
wet_r = reverb(send, 3.4, 12)

# ----------------------------------------------------------------- mix
pan = 0.15
L = (wind_l * wind_amt * 0.30 + wind_muffle * 0.10 + fire * fire_amt * 0.35 * (1 + pan) + steps * 0.30 +
     door * 0.55 + impacts * 0.55 + heart * 0.55 + music * 1.0 + pno * 0.9 + wet_l * 0.5)
R = (wind_r * wind_amt * 0.30 + wind_muffle * 0.10 + fire * fire_amt * 0.35 * (1 - pan) + steps * 0.30 +
     door * 0.55 + impacts * 0.55 + heart * 0.55 + music * 1.0 + pno * 0.9 + wet_r * 0.5)
fade = np.clip((DURATION - t) / 1.5, 0, 1)
L, R = L * fade, R * fade
mix = np.stack([L, R], 1)
mix = hp(mix.T, 28, 2).T
peak = np.max(np.abs(mix))
mix = mix / peak * 10 ** (-3 / 20)  # -3 dBFS peak: leaves headroom for the narrator

os.makedirs(os.path.join(HERE, "build"), exist_ok=True)
out = os.path.join(HERE, "build", "ambience.wav")
wavfile.write(out, SR, (mix * 32767).astype(np.int16))
print("wrote", out, f"{DURATION:.1f}s")
