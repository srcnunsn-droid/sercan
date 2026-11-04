#!/usr/bin/env python3
"""Kral ve Muhafız — ses tasarımı (yalnızca NumPy, tamamen yerel sentez).

Ortak zaman çizelgesini (src/timeline.js) ve iskelet çözücüsünden türetilen adım zamanlarını
(out/cues.json) okur; rüzgâr, kar/taş adımları, kapı gıcırtısı, şömine, kömür sürtünmesi ve
düşük seviyeli bir müzik pedi üretir. audio/vo.wav varsa anlatımı ekler ve müziği altında kısar.
Çıktı: out/kral_ve_muhafiz_ses.wav (48 kHz, 16 bit, stereo)
"""
import json, os, re, wave
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000
rng = np.random.default_rng(7)


def load_timeline():
    src = open(os.path.join(ROOT, 'src', 'timeline.js'), encoding='utf-8').read()
    body = src[src.index('{', src.index('TIMELINE =')):]
    body = body[: body.rindex('};') + 1]
    return json.loads(body)


TL = load_timeline()
DUR = TL['duration']
N = int(DUR * SR) + SR
cues = json.load(open(os.path.join(ROOT, 'out', 'cues.json')))


# ---------- yardımcılar ----------
def t2i(t):
    return int(round(t * SR))


def fft_filter(x, lo=None, hi=None, slope=4):
    """Yumuşak kenarlı FFT bant filtresi (lo/hi Hz)."""
    n = len(x)
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(n, 1 / SR)
    H = np.ones_like(f)
    if lo:
        H *= 1 / (1 + (lo / np.maximum(f, 1e-3)) ** slope)
    if hi:
        H *= 1 / (1 + (f / hi) ** slope)
    return np.fft.irfft(X * H, n)


def pink(n):
    w = rng.standard_normal(n)
    X = np.fft.rfft(w)
    f = np.fft.rfftfreq(n, 1 / SR)
    X /= np.sqrt(np.maximum(f, 20))
    y = np.fft.irfft(X, n)
    return y / (np.abs(y).max() + 1e-9)


def env_from_keys(keys, n, smooth=0.05):
    """[(t, v), ...] → örnek başına zarf (doğrusal + yumuşatma)."""
    ts = np.array([k[0] for k in keys]); vs = np.array([k[1] for k in keys])
    tt = np.arange(n) / SR
    e = np.interp(tt, ts, vs)
    if smooth:
        k = int(smooth * SR)
        ker = np.ones(k) / k
        e = np.convolve(e, ker, mode='same')
    return e


def slow_noise(n, rate_hz, seed):
    r = np.random.default_rng(seed)
    pts = int(DUR * rate_hz) + 4
    v = r.standard_normal(pts)
    tt = np.arange(n) / SR
    return np.interp(tt * rate_hz, np.arange(pts), v)


def add(buf, sig, t, gain=1.0, pan=0.0):
    i = t2i(t)
    if i >= len(buf):
        return
    sig = sig[: len(buf) - i]
    l = np.cos((pan + 1) * np.pi / 4); r = np.sin((pan + 1) * np.pi / 4)
    buf[i:i + len(sig), 0] += sig * gain * l * 1.414
    buf[i:i + len(sig), 1] += sig * gain * r * 1.414


def reverb_ir(seconds, damp=3000, seed=1):
    r = np.random.default_rng(seed)
    n = int(seconds * SR)
    ir = r.standard_normal(n) * np.exp(-np.arange(n) / (n / 5.0))
    ir = fft_filter(ir, hi=damp)
    ir[0] = 0
    return ir / np.sqrt((ir ** 2).sum())


def convolve(x, ir):
    n = len(x) + len(ir)
    m = 1 << (n - 1).bit_length()
    return np.fft.irfft(np.fft.rfft(x, m) * np.fft.rfft(ir, m), m)[: len(x)]


def scene_env(name):
    """Plan setine göre 0/1 maskesi (yumuşak geçişli)."""
    keys = []
    for s in TL['shots']:
        v = 1.0 if s['set'] == name else 0.0
        keys += [(s['start'], v), (s['end'] - 1e-3, v)]
    return env_from_keys(keys, N, smooth=0.04)


# ---------- ses kaynakları ----------
def crunch(dur=0.16, heavy=1.0, seed=0):
    r = np.random.default_rng(seed)
    n = int(dur * SR)
    out = np.zeros(n)
    grains = int(40 * heavy)
    for _ in range(grains):
        p = int(r.uniform(0, 0.75) * n)
        L = int(r.uniform(0.0008, 0.004) * SR)
        g = r.standard_normal(L) * np.exp(-np.linspace(0, 6, L)) * r.uniform(0.3, 1)
        out[p:p + L] += g[: n - p]
    out = fft_filter(out, lo=900, hi=7000, slope=2)
    thump = np.sin(2 * np.pi * 70 * np.arange(n) / SR) * np.exp(-np.arange(n) / (0.03 * SR)) * 0.5 * heavy
    out = out / (np.abs(out).max() + 1e-9) + thump
    return out * np.exp(-np.arange(n) / (dur * SR * 0.6))


def stone_step(seed=0):
    r = np.random.default_rng(seed)
    n = int(0.25 * SR)
    tt = np.arange(n) / SR
    click = r.standard_normal(n) * np.exp(-tt / 0.006)
    click = fft_filter(click, lo=1200, hi=6000)
    thud = np.sin(2 * np.pi * 95 * tt) * np.exp(-tt / 0.035)
    s = click / (np.abs(click).max() + 1e-9) * 0.5 + thud * 0.8
    return s


def creak(dur, seed=0, f0=28, f1=55):
    r = np.random.default_rng(seed)
    n = int(dur * SR)
    tt = np.arange(n) / SR
    rate = f0 + (f1 - f0) * (0.5 - 0.5 * np.cos(np.pi * tt / dur)) + 6 * np.sin(2 * np.pi * 1.3 * tt)
    phase = np.cumsum(rate / SR)
    imp = np.zeros(n)
    idx = np.where(np.diff(np.floor(phase)) > 0)[0]
    imp[idx] = r.uniform(0.5, 1.0, len(idx))
    k = int(0.03 * SR); kt = np.arange(k) / SR
    ker = (np.sin(2 * np.pi * 420 * kt) * 1.0 + np.sin(2 * np.pi * 910 * kt) * 0.6 + np.sin(2 * np.pi * 1530 * kt) * 0.35) * np.exp(-kt / 0.006)
    s = np.convolve(imp, ker)[:n]
    e = np.minimum(1, tt / 0.08) * np.minimum(1, (dur - tt) / 0.25)
    return s / (np.abs(s).max() + 1e-9) * e


def thud(seed=0):
    n = int(0.9 * SR); tt = np.arange(n) / SR
    r = np.random.default_rng(seed)
    low = np.sin(2 * np.pi * 52 * tt) * np.exp(-tt / 0.12) + np.sin(2 * np.pi * 85 * tt) * np.exp(-tt / 0.07) * 0.6
    nb = fft_filter(r.standard_normal(n) * np.exp(-tt / 0.05), hi=900) * 0.4
    metal = sum(np.sin(2 * np.pi * f * tt) * np.exp(-tt / d) * a for f, d, a in [(1240, 0.18, 0.08), (2310, 0.12, 0.05), (3170, 0.08, 0.03)])
    s = low + nb / (np.abs(nb).max() + 1e-9) * 0.3 + metal
    return s / np.abs(s).max()


def clank(seed=0):
    n = int(1.2 * SR); tt = np.arange(n) / SR
    s = sum(np.sin(2 * np.pi * f * tt) * np.exp(-tt / d) * a for f, d, a in [(640, 0.3, 0.4), (1530, 0.22, 0.3), (2210, 0.15, 0.2), (3020, 0.1, 0.15)])
    s += fft_filter(np.random.default_rng(seed).standard_normal(n) * np.exp(-tt / 0.01), lo=500, hi=3000) * 0.05
    s = fft_filter(s, hi=2500)
    return s / np.abs(s).max()


def noise_burst(dur, lo, hi, attack=0.05, release=0.2, seed=0, am=None):
    r = np.random.default_rng(seed)
    n = int(dur * SR); tt = np.arange(n) / SR
    s = fft_filter(r.standard_normal(n), lo=lo, hi=hi, slope=3)
    e = np.minimum(1, tt / attack) * np.minimum(1, np.maximum(0, dur - tt) / release)
    if am:
        e *= 0.55 + 0.45 * np.abs(np.sin(np.pi * am * tt))
    return s / (np.abs(s).max() + 1e-9) * e


def charcoal(dur, seed=0):
    r = np.random.default_rng(seed)
    n = int(dur * SR); out = np.zeros(n)
    t = 0.0
    while t < dur - 0.1:
        L = r.uniform(0.09, 0.28)
        seg = noise_burst(L, 1800, 7500, attack=0.015, release=0.05, seed=int(r.integers(1e6)))
        seg *= 1 + 0.6 * (r.standard_normal(len(seg)) > 1.6)  # pürüzlü takılmalar
        i = int(t * SR); seg = seg[: n - i]
        out[i:i + len(seg)] += seg * r.uniform(0.5, 1.0)
        t += L + r.uniform(0.03, 0.12)
    return out


def fire_layer(n, seed=3):
    r = np.random.default_rng(seed)
    roar = fft_filter(r.standard_normal(n), hi=300) * 0.6
    roar /= np.abs(roar).max() + 1e-9
    pops = np.zeros(n)
    cnt = int(n / SR * 9)
    for p in r.integers(0, n - 2000, cnt):
        L = int(r.uniform(0.002, 0.012) * SR)
        pops[p:p + L] += r.standard_normal(L) * np.exp(-np.linspace(0, 5, L)) * r.uniform(0.2, 1)
    pops = fft_filter(pops, lo=1500, hi=9000)
    pops /= np.abs(pops).max() + 1e-9
    return roar * 0.5 + pops * 0.6


# ---------- miks ----------
mix = np.zeros((N, 2))
fx = np.zeros((N, 2))

# Rüzgâr: iki kanal, bağımsız gürültü, yavaş değişen şiddet
gust = 0.65 + 0.35 * np.tanh(slow_noise(N, 0.35, 11))
for ch, sd in [(0, 21), (1, 22)]:
    base = pink(N)
    low = fft_filter(base, lo=40, hi=380)
    mid = fft_filter(rng.standard_normal(N), lo=500, hi=2400, slope=2)
    mid /= np.abs(mid).max() + 1e-9
    low /= np.abs(low).max() + 1e-9
    whistle = fft_filter(rng.standard_normal(N), lo=760, hi=860, slope=8)
    whistle /= np.abs(whistle).max() + 1e-9
    wind = low * 0.7 + mid * 0.22 * (gust ** 2) + whistle * 0.12 * np.clip(gust - 0.7, 0, 1) * 3
    mix[:, ch] += wind * gust
amb_keys = [(k[0], k[2]) for k in TL['ambience']]
amb = env_from_keys(amb_keys, N, smooth=0.0)
ext = scene_env('ext') + scene_env('morning')
inside = scene_env('int')
wind_gain = 0.28 * amb * ext + 0.0
mix *= wind_gain[:, None]
# içeride boğuk rüzgâr (kalın duvar arkası)
muff = fft_filter(pink(N), hi=160) * 0.6
mix[:, 0] += muff * inside * 0.05
mix[:, 1] += muff * inside * 0.05

# Şömine (içeride) ve meşale (dışarıda, gece) sesi
fire = fire_layer(N)
mix[:, 0] += fire * inside * 0.12; mix[:, 1] += fire * inside * 0.14
torch_k = np.interp(np.arange(N) / SR, [0, 37, 46, 50, 56, 56.01, DUR], [1, 0.95, 0.62, 0.45, 0.4, 0, 0])
torch = fft_filter(rng.standard_normal(N), lo=60, hi=500) * (0.6 + 0.4 * slow_noise(N, 3, 5))
torch /= np.abs(torch).max() + 1e-9
mix[:, 1] += torch * torch_k * scene_env('ext') * 0.025
mix[:, 0] += torch * torch_k * scene_env('ext') * 0.018

# Adımlar (iskeletten türetilmiş zamanlar)
for i, s in enumerate(cues['steps']):
    if s['surface'] == 'snow':
        sig = crunch(0.17, 1.0, seed=i)
    else:
        sig = stone_step(seed=i)
    pan = -0.2 if s['who'] in ('king',) else 0.25
    add(fx, sig, s['t'] - 0.01, gain=s['gain'] * 1.1, pan=pan)

# Efekt kuyrukları
for i, c in enumerate(TL['sfx']):
    t, d, g, ty = c['t'], c['dur'], c['gain'], c['type']
    if ty == 'doorCreak': sig = creak(d, seed=i)
    elif ty == 'doorThud': sig = thud(seed=i)
    elif ty == 'distantClank': sig = fft_filter(clank(seed=i), hi=1800) * 0.6
    elif ty == 'stamp': sig = crunch(0.2, 1.6, seed=100 + i)
    elif ty == 'handRub': sig = noise_burst(d, 600, 4000, 0.1, 0.3, seed=i, am=6.4)
    elif ty == 'cloth': sig = noise_burst(d, 400, 3500, 0.08, 0.25, seed=i)
    elif ty == 'paper':
        sig = noise_burst(d, 2500, 9000, 0.02, 0.2, seed=i) * (np.random.default_rng(i).random(int(d * SR)) > 0.55)
    elif ty == 'kneelSnow': sig = crunch(0.35, 2.4, seed=200 + i)
    elif ty == 'pebble': sig = stone_step(seed=i) * 0.4
    elif ty == 'charcoal': sig = charcoal(d, seed=i)
    else: continue
    add(fx, sig, t, gain=g * 0.6, pan=0.1)
# avuçlarına üfleme
add(fx, noise_burst(0.5, 300, 2500, 0.05, 0.3, seed=99), 43.75, gain=0.12)

# Yankı (dışarıda geniş, içeride sıcak oda)
ir_ext = reverb_ir(1.1, damp=2600, seed=3)
ir_int = reverb_ir(0.7, damp=3500, seed=4)
for ch in range(2):
    wet = convolve(fx[:, ch], ir_ext) * (ext + 0.0) * 0.35 + convolve(fx[:, ch], ir_int) * inside * 0.28
    fx[:, ch] += wet
mix += fx

# ---------- Müzik pedi ----------
NOTES = {'d2': 73.42, 'f2': 87.31, 'g2': 98.0, 'a2': 110.0, 'bb2': 116.54, 'c3': 130.81, 'cs3': 138.59, 'd3': 146.83, 'e3': 164.81, 'f3': 174.61,
         'g3': 196.0, 'a3': 220.0, 'bb3': 233.08, 'c4': 261.63, 'd4': 293.66}
CHORDS = {'dm': ['d3', 'f3', 'a3', 'd4'], 'bb': ['bb2', 'd3', 'f3', 'bb3'], 'f': ['f2', 'c3', 'f3', 'a3'], 'gm': ['g2', 'd3', 'g3', 'bb3'], 'a': ['a2', 'e3', 'a3', 'cs3']}
music = np.zeros(N)
tt = np.arange(N) / SR
harm = TL['musicHarmony'] + [[DUR + 2, None]]
for (t0, ch), (t1, _) in zip(harm[:-1], harm[1:]):
    a0, a1 = t0 - 1.2, t1 + 1.2
    i0, i1 = max(0, t2i(a0)), min(N, t2i(a1))
    seg_t = tt[i0:i1]
    e = np.clip((seg_t - a0) / 2.4, 0, 1) * np.clip((a1 - seg_t) / 2.4, 0, 1)
    e = np.sin(e * np.pi / 2)
    for k, nm in enumerate(CHORDS[ch]):
        f = NOTES[nm]
        voice = np.zeros_like(seg_t)
        for det in (-0.12, 0.0, 0.13):
            ff = f * (1 + det / 100) * (1 + 0.0015 * np.sin(2 * np.pi * (0.17 + k * 0.05) * seg_t))
            for h in range(1, 6):
                voice += np.sin(2 * np.pi * ff * h * seg_t + h * k) / (h ** 1.6)
        music[i0:i1] += voice * e * (0.6 if k == 0 else 0.42)
# alçak bordun
music += np.sin(2 * np.pi * NOTES['d2'] * tt) * 0.35 * (0.8 + 0.2 * np.sin(2 * np.pi * 0.07 * tt))
music = fft_filter(music, lo=50, hi=1400, slope=2)
music /= np.abs(music).max() + 1e-9
mus_env = env_from_keys([(k[0], k[1]) for k in TL['music']], N, smooth=0.2)

# Anlatım (varsa) ve müziği altında kısma
vo_path = os.path.join(ROOT, 'audio', 'vo.wav')
vo = None
if os.path.exists(vo_path):
    with wave.open(vo_path) as w:
        sr, ch, sw = w.getframerate(), w.getnchannels(), w.getsampwidth()
        raw = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float64) / 32768
        raw = raw.reshape(-1, ch).mean(axis=1)
        if sr != SR:
            raw = np.interp(np.arange(int(len(raw) * SR / sr)) / SR, np.arange(len(raw)) / sr, raw)
        vo = np.zeros(N); vo[: min(N, len(raw))] = raw[:N]
        vo_env = np.convolve(np.abs(vo), np.ones(int(0.3 * SR)) / (0.3 * SR), mode='same')
        mus_env = mus_env * (1 - 0.6 * np.clip(vo_env / (vo_env.max() + 1e-9) * 4, 0, 1))
music_rev = convolve(music, reverb_ir(2.5, damp=2200, seed=9)) * 0.5 + music
mix[:, 0] += music_rev * mus_env * 0.32
mix[:, 1] += np.roll(music_rev, 240) * mus_env * 0.32
if vo is not None:
    mix[:, 0] += vo * 0.9; mix[:, 1] += vo * 0.9

# başlangıç/son yumuşak
fade = np.ones(N)
fi = int(0.6 * SR); fade[:fi] = np.linspace(0, 1, fi)
fo0 = t2i(DUR - 0.8); fade[fo0:] = np.linspace(1, 0, N - fo0) ** 1.5
mix *= fade[:, None]
mix = mix[: int(DUR * SR)]
for ch in range(2):
    mix[:, ch] = fft_filter(mix[:, ch], lo=28, slope=4)
peak = np.abs(mix).max()
mix = mix / peak * 0.89
os.makedirs(os.path.join(ROOT, 'out'), exist_ok=True)
outp = os.path.join(ROOT, 'out', 'kral_ve_muhafiz_ses.wav')
with wave.open(outp, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix * 32767).astype(np.int16).tobytes())
print('yazıldı:', outp, f'{DUR:.1f} s', 'anlatım:', 'var' if vo is not None else 'yok')
