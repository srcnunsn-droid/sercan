"""Kedi F1 ses bandı: motor, sollamalar, efektler, ritim. Çıktı: audio.wav (48 kHz stereo)."""
import numpy as np
import wave

SR, DUR = 48000, 30.0
N = int(SR * DUR)
t = np.arange(N) / SR
rng = np.random.default_rng(7)
L = np.zeros(N)
Rt = np.zeros(N)


def ss(a, b, x):
    k = np.clip((x - a) / (b - a), 0, 1)
    return k * k * (3 - 2 * k)


def kf(x, pts):
    out = np.full_like(x, pts[0][1], dtype=float)
    for (a, va), (b, vb) in zip(pts, pts[1:]):
        m = (x > a)
        out[m] = (va + (vb - va) * ss(a, b, x))[m]
    return out


def add(sig, pan=0.0, start=0):
    end = min(N, start + len(sig))
    s = sig[: end - start]
    L[start:end] += s * np.sqrt(0.5 * (1 - pan))
    Rt[start:end] += s * np.sqrt(0.5 * (1 + pan))


def band(n, lo, hi):
    x = rng.standard_normal(n)
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(n, 1 / SR)
    X[(f < lo) | (f > hi)] = 0
    y = np.fft.irfft(X, n)
    return y / (np.abs(y).max() + 1e-9)


def engine(freq, bright=1.0):
    ph = 2 * np.pi * np.cumsum(freq) / SR
    s = sum(np.sin(k * ph) / k ** (1.1 / bright) for k in range(1, 12))
    s += 0.35 * np.sign(np.sin(ph * 0.5)) * band(len(freq), 80, 4000) * 0.5
    return np.tanh(s * 1.4)


# --- oyuncu motoru (sahne.js'deki hız profiliyle aynı)
v = kf(t, [(3.4, 0), (4.6, 6000), (6.2, 10000), (10, 12500), (15.6, 12800), (16.6, 8800), (19.2, 9800), (21, 13000), (26, 13600), (27.4, 14600), (28.4, 9000), (30, 4000)])
gear = np.clip(np.floor(v / 1900), 0, 7)
rpm = np.where(v < 50, 0.15, (v - gear * 1900) / 1900)
idle = 95 + 230 * sum(np.exp(-((t - b) / 0.12) ** 2) for b in (1.0, 1.9, 2.75)) + 160 * ss(2.8, 3.35, t)
f_run = 170 + 330 * rpm + 18 * gear
freq = np.where(t < 3.4, idle, f_run)
vol = (0.32 + 0.1 * ss(3.3, 3.6, t)) * kf(t, [(0, 0.8), (11, 0.8), (11.05, 1.0), (12.3, 1.0), (12.31, 0.55), (13.1, 0.55), (13.11, 1.0), (15, 1.0), (15.05, 0.8), (21, 0.8), (21.05, 0.45), (26, 0.45), (26.05, 0.8), (27.6, 0.8), (28.5, 0.35), (30, 0.1)])
add(engine(freq) * vol * 0.6)

# --- sollamalar (Doppler)
for p, pan in [(6.6, 0.6), (8.6, -0.6), (10.5, 0.3), (13.6, -0.2), (17.3, -0.6), (19.6, 0.6), (23.3, 0.2)]:
    a, b = int((p - 2.5) * SR), int((p + 2.0) * SR)
    tt = t[a:b] - p
    f = 300 * (1 + 0.12 * np.tanh(-tt * 3))
    env = 1 / (1 + (tt * 2.2) ** 2)
    add(engine(f, 0.9) * env * 0.33, pan=pan * np.tanh(tt * 2) if False else pan, start=a)

# --- yan çekimde sarı rakip
a = int(11 * SR); n = int(4 * SR); tt = t[a:a + n] - 11
add(engine(310 + 40 * np.sin(tt * 2.2)) * (0.22 * (1 - ss(2.6, 3.6, tt))) * np.where((tt > 1.3) & (tt < 2.1), 0.4, 1), pan=-0.3, start=a)

# --- ışıklar: bip, ışıklar sönünce bas vuruşu
for b in (0.7, 1.2, 1.7, 2.2, 2.7):
    n = int(0.16 * SR); tt = np.arange(n) / SR
    add(np.sin(2 * np.pi * 880 * tt) * np.exp(-tt * 18) * 0.25, start=int(b * SR))
n = int(0.8 * SR); tt = np.arange(n) / SR
add(np.sin(2 * np.pi * (55 + 60 * np.exp(-tt * 10)) * tt) * np.exp(-tt * 4) * 0.8, start=int(3.4 * SR))

# --- geçiş "whoosh"ları
for c in (4.0, 11.0, 15.0, 21.0, 26.0, 27.6):
    n = int(0.5 * SR); tt = np.arange(n) / SR
    add(band(n, 600, 7000) * np.exp(-((tt - 0.25) / 0.09) ** 2) * 0.35, pan=0.4, start=int((c - 0.25) * SR))

# --- tıslama
n = int(0.75 * SR); tt = np.arange(n) / SR
add(band(n, 3000, 11000) * ss(0, 0.1, tt) * (1 - ss(0.5, 0.75, tt)) * 0.42, start=int(12.4 * SR))

# --- turbo
n = int(1.2 * SR); tt = np.arange(n) / SR
add(band(n, 200, 3000) * np.exp(-tt * 2.5) * ss(0, 0.05, tt) * 0.4, start=int(13.1 * SR))


# --- miyav (formant sentezi)
def meow(dur, f0s, start, amp):
    n = int(dur * SR); tt = np.arange(n) / SR; k = tt / dur
    f0 = np.interp(k, np.linspace(0, 1, len(f0s)), f0s)
    F1 = np.interp(k, [0, 0.35, 1], [700, 1100, 550]); F2 = np.interp(k, [0, 0.35, 1], [1900, 1500, 1000])
    ph = 2 * np.pi * np.cumsum(f0) / SR
    s = np.zeros(n)
    for h in range(1, 18):
        fh = h * f0
        s += (np.exp(-((fh - F1) / 260) ** 2) + 0.6 * np.exp(-((fh - F2) / 380) ** 2)) * np.sin(h * ph)
    env = ss(0, 0.06, k) * (1 - ss(0.75, 1, k)) * (1 + 0.15 * np.sin(tt * 40))
    add(s / np.abs(s).max() * env * amp, start=int(start * SR))


meow(0.35, [500, 650, 520], 0.35, 0.3)   # başlangıçta kısa "mrrp"
meow(0.95, [480, 760, 820, 520, 380], 28.0, 0.55)  # zafer miyavı

# --- kalabalık
crowd = band(N, 300, 3500) * (0.6 + 0.4 * np.abs(band(N, 0.5, 4)))
add(crowd * (0.05 + 0.03 * ss(3.3, 3.6, t) + 0.25 * ss(27.2, 27.8, t) * (1 - ss(29.4, 30, t))) * 0.8)

# --- fanfar
for i, f in enumerate([523.25, 659.25, 783.99, 1046.5]):
    n = int((1.6 - i * 0.12) * SR); tt = np.arange(n) / SR
    ph = 2 * np.pi * f * tt
    s = sum(np.sin(k * ph) / k for k in range(1, 8))
    add(s * ss(0, 0.03, tt) * np.exp(-tt * 1.2) * 0.09, pan=(i - 1.5) * 0.3, start=int((27.75 + i * 0.12) * SR))

# --- ritim (150 bpm), 3.4 → 27.6
beat = 60 / 150
b0 = 3.4
k = 0
while b0 + k * beat < 27.5:
    bt = b0 + k * beat
    n = int(0.35 * SR); tt = np.arange(n) / SR
    add(np.sin(2 * np.pi * (48 + 90 * np.exp(-tt * 30)) * tt) * np.exp(-tt * 9) * 0.32, start=int(bt * SR))
    if k % 2 == 1:
        n = int(0.2 * SR); tt = np.arange(n) / SR
        add(band(n, 1500, 8000) * np.exp(-tt * 22) * 0.16, start=int(bt * SR))
    for hh in (0.5,):
        n = int(0.05 * SR); tt = np.arange(n) / SR
        add(band(n, 7000, 14000) * np.exp(-tt * 80) * 0.06, pan=0.3, start=int((bt + hh * beat) * SR))
    k += 1
bass_notes = [55, 55, 65.4, 49]
for bar in range(int((27.5 - 3.4) / (beat * 4)) + 1):
    f = bass_notes[bar % 4]
    for s8 in range(8):
        bt = 3.4 + bar * beat * 4 + s8 * beat / 2
        if bt > 27.4:
            break
        n = int(beat / 2 * SR); tt = np.arange(n) / SR
        saw = 2 * ((f * tt) % 1) - 1
        add(saw * np.exp(-tt * 6) * 0.07, start=int(bt * SR))

# --- miks
mx = np.stack([L, Rt], 1)
mx *= (1 - ss(29.6, 30, t))[:, None]
mx = np.tanh(mx * 1.1) * 0.9
mx /= np.abs(mx).max() / 0.92
with wave.open('audio.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mx * 32767).astype('<i2').tobytes())
print('audio.wav yazıldı')
