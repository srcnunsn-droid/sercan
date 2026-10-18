"""Videonun sesi: müzik, gök gürültüsü, darbe, yarasa... hepsi numpy ile sentezlenir."""
import math
import wave

import numpy as np

from timeline import BEAT, CUTS, DURATION, FIGHT, IMPACTS, LIGHTNING, beat

SR = 44100
N = int(SR * DURATION)


# ---------------------------------------------------------------- yardımcılar

def t_axis(n):
    return np.arange(n) / SR


def norm(x, peak=1.0):
    m = np.max(np.abs(x))
    return x * (peak / m) if m > 0 else x


def filt(x, lo=None, hi=None, order=2):
    """FFT ile Butterworth genlik yanıtı (dairesel sarmayı önlemek için dolgulu)."""
    n = len(x)
    pad = n + SR // 4
    X = np.fft.rfft(x, pad)
    f = np.fft.rfftfreq(pad, 1 / SR)
    h = np.ones_like(f)
    if hi:
        h /= np.sqrt(1 + (f / hi) ** (2 * order))
    if lo:
        h /= np.sqrt(1 + (lo / np.maximum(f, 1e-3)) ** (2 * order))
    return np.fft.irfft(X * h, pad)[:n]


def saw(freq, t, phase=0.0):
    return 2.0 * ((freq * t + phase) % 1.0) - 1.0


def midi(name):
    notes = {"C": 0, "C#": 1, "D": 2, "D#": 3, "E": 4, "F": 5, "F#": 6, "G": 7, "G#": 8, "A": 9, "A#": 10, "B": 11}
    return 440.0 * 2 ** ((notes[name[:-1]] + 12 * (int(name[-1]) + 1) - 69) / 12)


def sweep_noise(dur, f0, f1, bw_oct, rng):
    """Merkez frekansı f0'dan f1'e kayan bant geçiren gürültü (STFT ile)."""
    n = int(dur * SR)
    win, hop = 1024, 256
    x = rng.standard_normal(n + win)
    out = np.zeros(n + win)
    w = np.hanning(win)
    freqs = np.maximum(np.fft.rfftfreq(win, 1 / SR), 1.0)
    for start in range(0, n, hop):
        fc = f0 * (f1 / f0) ** (start / n)
        g = np.exp(-0.5 * (np.log2(freqs / fc) / bw_oct) ** 2)
        out[start:start + win] += np.fft.irfft(np.fft.rfft(x[start:start + win] * w) * g, win) * w
    return out[:n]


class Mix:
    def __init__(self):
        self.dry = np.zeros((N, 2))
        self.wet = np.zeros((N, 2))

    def add(self, sig, t, gain=1.0, pan=0.0, send=0.25):
        sig = np.asarray(sig, dtype=np.float64)
        if sig.ndim == 1:
            a = (pan + 1) * math.pi / 4
            sig = np.stack([sig * math.cos(a), sig * math.sin(a)], 1) * math.sqrt(2)
        i0 = int(round(t * SR))
        if i0 < 0:
            sig, i0 = sig[-i0:], 0
        m = min(len(sig), N - i0)
        if m <= 0:
            return
        self.dry[i0:i0 + m] += sig[:m] * gain
        self.wet[i0:i0 + m] += sig[:m] * gain * send


def reverb(x, seconds=2.6, seed=3):
    rng = np.random.default_rng(seed)
    n = int(seconds * SR)
    t = t_axis(n)
    pre = int(0.025 * SR)
    out = np.zeros_like(x)
    size = 1 << int(math.ceil(math.log2(len(x) + n + pre)))
    for ch in range(2):
        ir = filt(rng.standard_normal(n), hi=4500) * np.exp(-t * 6.9 / seconds)
        ir = np.concatenate([np.zeros(pre), ir])
        ir /= np.sqrt(np.sum(ir ** 2))
        out[:, ch] = np.fft.irfft(np.fft.rfft(x[:, ch], size) * np.fft.rfft(ir, size), size)[:len(x)]
    return out


# ---------------------------------------------------------------- sesler

def thunder(rng, dur=3.8, close=1.0):
    n = int(dur * SR)
    t = t_axis(n)
    k = int(dur * 14)
    bumps = np.interp(t, np.linspace(0, dur, k), rng.uniform(0.25, 1.0, k) ** 2)
    env = np.clip(t / 0.03, 0, 1) * np.exp(-t / (dur * 0.3)) * bumps
    out = np.zeros((n, 2))
    for ch in range(2):
        w = rng.standard_normal(n)
        out[:, ch] = (norm(filt(w, hi=110)) + 0.45 * norm(filt(w, lo=110, hi=700))) * env
    nc = int(0.3 * SR)
    crack = norm(filt(rng.standard_normal(nc), lo=1200)) * np.exp(-t_axis(nc) / 0.06)
    out[:nc] += crack[:, None] * 0.55 * close
    return norm(out)


def organ_note(freq, dur):
    n = int((dur + 0.3) * SR)
    t = t_axis(n)
    sig = np.zeros(n)
    for det in (1.0, 1.0035):
        for h, a in ((0.5, 0.55), (1, 1.0), (2, 0.7), (3, 0.3), (4, 0.4), (6, 0.16), (8, 0.14)):
            f = freq * h * det
            if f < SR / 2.5:
                sig += a * np.sin(2 * np.pi * f * t + h)
    env = np.clip(t / 0.012, 0, 1) * np.where(t < dur, 1.0, np.exp(-(t - dur) / 0.07))
    return sig * env


def toccata():
    """Bach, Toccata ve Füg re minör — açılış motifi (kamu malı)."""
    seq = [(0.00, 0.09, "A4"), (0.09, 0.09, "G4"), (0.18, 0.52, "A4"),
           (0.76, 0.08, "G4"), (0.84, 0.08, "F4"), (0.92, 0.08, "E4"), (1.00, 0.08, "D4"),
           (1.08, 0.20, "C#4"), (1.28, 0.50, "D4")]
    out = np.zeros(int(2.4 * SR))
    for start, dur, name in seq:
        note = organ_note(midi(name), dur)
        i = int(start * SR)
        out[i:i + len(note)] += note[:len(out) - i]
    pedal = organ_note(midi("D2"), 0.55)
    i = int(1.28 * SR)
    out[i:i + len(pedal)] += 0.8 * pedal[:len(out) - i]
    return norm(out)


def electric(rng, dur=0.9):
    n = int(dur * SR)
    t = t_axis(n)
    buzz = norm(filt(saw(110, t) + 0.6 * saw(165.3, t), lo=150, hi=5000))
    gate = np.repeat(rng.random(int(dur * 70) + 1) > 0.35, SR // 70 + 1)[:n].astype(float)
    sparks = (rng.random(n) < 0.004) * rng.standard_normal(n)
    sparks = norm(filt(sparks, lo=1800))
    env = np.clip(t / 0.005, 0, 1) * np.exp(-t / (dur * 0.45))
    return norm((buzz * gate * 0.7 + sparks) * env)


def growl(rng, dur=1.5):
    n = int(dur * SR)
    t = t_axis(n)
    rough = norm(filt(rng.standard_normal(n), hi=35))
    f = 68 + 6 * np.sin(2 * np.pi * 5.5 * t) + 6 * rough
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.5 * np.sin(4 * np.pi * np.cumsum(f) / SR)
    breath = norm(filt(rng.standard_normal(n), lo=250, hi=1100)) * (0.6 + 0.4 * rough)
    env = np.clip(t / 0.25, 0, 1) * np.clip((dur - t) / 0.5, 0, 1)
    return norm((body * (1 + 0.5 * rough) + 0.6 * breath) * env)


def hiss(rng, dur=0.8):
    n = int(dur * SR)
    t = t_axis(n)
    env = np.clip(t / 0.06, 0, 1) * np.clip((dur - t) / 0.35, 0, 1)
    return norm(filt(rng.standard_normal(n), lo=2500, hi=9000) * env)


def thump(f0=62, f1=40, dur=0.35, decay=0.09):
    n = int(dur * SR)
    t = t_axis(n)
    f = f1 + (f0 - f1) * np.exp(-t / 0.04)
    return norm(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / decay))


def taiko(rng):
    n = int(0.9 * SR)
    t = t_axis(n)
    f = 52 + 75 * np.exp(-t / 0.025)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.26)
    skin = norm(filt(rng.standard_normal(n), hi=900)) * np.exp(-t / 0.035)
    return norm(body + 0.45 * skin)


def impact(rng, size=1.0):
    n = int(2.0 * SR)
    t = t_axis(n)
    f = 32 + 70 * np.exp(-t / 0.06)
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / (0.35 + 0.4 * size))
    crunch = norm(filt(rng.standard_normal(n), lo=250, hi=3500)) * np.exp(-t / 0.09)
    crack = norm(filt(rng.standard_normal(n), lo=3000)) * np.exp(-t / 0.018)
    return norm(sub + 0.55 * crunch + 0.35 * crack)


def braam(dur=2.2):
    n = int(dur * SR)
    t = t_axis(n)
    sig = np.zeros(n)
    for name, a in (("D1", 1.0), ("D2", 0.8), ("A2", 0.6), ("D3", 0.35)):
        for det in (0.996, 1.0, 1.004):
            sig += a * saw(midi(name) * det, t, det * 7)
    env = np.clip(t / 0.04, 0, 1) * np.exp(-t / (dur * 0.4))
    return norm(filt(sig, hi=420, order=3) * env)


def whoosh(rng, dur, f0=250, f1=3500):
    t = t_axis(int(dur * SR))
    env = np.sin(np.pi * np.clip(t / dur, 0, 1) ** 1.6) ** 2
    return norm(sweep_noise(dur, f0, f1, 0.7, rng) * env)


def riser(rng, dur=1.0):
    n = int(dur * SR)
    t = t_axis(n)
    air = norm(sweep_noise(dur, 300, 7000, 1.0, rng))
    f = 80 * (4.0 ** (t / dur))
    tone = norm(filt(saw(f, t) + saw(f * 1.5, t), hi=2500))
    return norm((air + 0.5 * tone) * (t / dur) ** 2.2)


def bats_sound(rng, dur):
    n = int(dur * SR)
    t = t_axis(n)
    out = np.zeros((n, 2))
    for _ in range(7):
        fr = rng.uniform(9, 15)
        am = (0.5 + 0.5 * np.sin(2 * np.pi * fr * t + rng.uniform(0, 6.3))) ** 3
        layer = norm(filt(rng.standard_normal(n), lo=1500, hi=6500)) * am
        p = rng.uniform(-0.9, 0.9)
        a = (p + 1) * math.pi / 4
        out[:, 0] += layer * math.cos(a)
        out[:, 1] += layer * math.sin(a)
    for _ in range(26):
        cn = int(0.035 * SR)
        ct = t_axis(cn)
        f = 9500 - 4500 * ct / 0.035
        chirp = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * ct / 0.035)
        i = int(rng.uniform(0, dur - 0.05) * SR)
        ch = int(rng.integers(0, 2))
        out[i:i + cn, ch] += chirp * 0.8
    env = np.clip(t / 0.15, 0, 1) * np.clip((dur - t) / 0.4, 0, 1)
    return norm(out * env[:, None])


def pad(names, dur, cutoff, rng, swell=1.0):
    n = int(dur * SR)
    t = t_axis(n)
    out = np.zeros((n, 2))
    for ch in range(2):
        sig = np.zeros(n)
        for name in names:
            for det in (0.995, 1.0, 1.006):
                sig += saw(midi(name) * det, t, rng.random())
        trem = 1 + 0.12 * np.sin(2 * np.pi * (0.35 + 0.1 * ch) * t)
        out[:, ch] = filt(sig, hi=cutoff, order=2) * trem
    env = np.clip(t / swell, 0, 1) * np.clip((dur - t) / 0.6, 0, 1)
    return norm(out * env[:, None])


def ostinato(rng, start, end):
    """Dövüş boyunca sekizlik notalarla alçak yaylı ostinato."""
    pattern = [0, 0, 0, 0, 0, 0, -2, 0, 0, 0, 0, 0, -4, -4, -2, -2]
    step = BEAT / 2
    n = int((end - start + 0.5) * SR)
    sig = np.zeros(n)
    nn = int(0.2 * SR)
    nt = t_axis(nn)
    env = np.clip(nt / 0.004, 0, 1) * np.exp(-nt / 0.09)
    k = 0
    while start + k * step < end - 1e-6:
        f = midi("D2") * 2 ** (pattern[k % 16] / 12)
        note = (saw(f, nt) + 0.6 * saw(2 * f, nt) + 0.4 * saw(f * 1.004, nt)) * env
        i = int(k * step * SR)
        sig[i:i + nn] += note
        k += 1
    return norm(filt(sig, hi=1300))


# ---------------------------------------------------------------- miks

def render(path):
    rng = np.random.default_rng(1931)
    mix = Mix()

    # Yağmur + rüzgar yatağı (dış mekân planlarında daha yüksek)
    bed = np.zeros((N, 2))
    for ch in range(2):
        w = rng.standard_normal(N)
        bed[:, ch] = norm(filt(w, lo=900, hi=9000, order=1)) + 0.5 * norm(filt(w, lo=150, hi=700))
    t = t_axis(N)
    keys_t = [0, 2.5, 2.7, 6.0, 6.4, 16.8, 17.2, 20]
    keys_g = [0.16, 0.16, 0.06, 0.06, 0.10, 0.10, 0.17, 0.17]
    bed *= np.interp(t, keys_t, keys_g)[:, None]
    mix.add(norm(bed), 0, gain=0.55, send=0.0)

    # Gök gürültüleri
    for i, (tl, s) in enumerate(LIGHTNING):
        mix.add(thunder(np.random.default_rng(100 + i), close=s), tl + 0.05, gain=0.42 * s, send=0.15)

    # Müzik: karanlık drone -> dövüş ostinatosu -> final akoru
    mix.add(pad(["D2", "A2", "D3"], FIGHT + 0.6, 650, rng, swell=2.5), 0, gain=0.16, send=0.3)
    mix.add(pad(["D3", "F3", "A3"], 17.0 - FIGHT + 0.3, 1500, rng, swell=0.8), FIGHT, gain=0.10, send=0.3)
    mix.add(ostinato(rng, FIGHT, 17.0), FIGHT, gain=0.20, send=0.15)
    mix.add(pad(["D2", "A2", "D3", "F3", "A3", "D4"], 3.0, 2200, rng, swell=0.15), 17.0, gain=0.24, send=0.5)

    # Dracula: org + tıslama ; Canavar: elektrik + hırıltı
    mix.add(toccata(), 2.62, gain=0.30, pan=0.25, send=0.7)
    mix.add(hiss(np.random.default_rng(7)), 3.3, gain=0.12, pan=0.3)
    mix.add(electric(np.random.default_rng(8)), 4.4, gain=0.30, pan=-0.3)
    mix.add(growl(np.random.default_rng(9)), 4.6, gain=0.40, pan=-0.25, send=0.3)

    # Yüzleşme: hızlanan kalp atışı
    for tb in (6.35, 7.05, 7.65, 8.15):
        mix.add(thump(), tb, gain=0.55, send=0.1)
        mix.add(thump(), tb + 0.2, gain=0.33, send=0.1)

    # Dövüş: davullar vuruşlarda, son ölçüde trampet gibi sıklaşır
    for k in range(20):
        accent = k % 4 == 0
        mix.add(taiko(np.random.default_rng(200 + k)), beat(k), gain=0.55 if accent else 0.32, send=0.25)
        if k >= 10:
            mix.add(taiko(np.random.default_rng(300 + k)), beat(k) + BEAT / 2, gain=0.22, send=0.25)
    for k in range(16):
        mix.add(taiko(np.random.default_rng(400 + k)), beat(16) + k * BEAT / 4, gain=0.12 + 0.02 * k, send=0.25)

    # Hareket sesleri
    mix.add(whoosh(np.random.default_rng(10), 0.7), FIGHT - 0.1, gain=0.45, pan=-0.2)
    mix.add(whoosh(np.random.default_rng(11), 0.32, 400, 5000), beat(4) - 0.3, gain=0.40, pan=0.2)
    mix.add(whoosh(np.random.default_rng(12), 0.6, 600, 4000), beat(9) - 0.05, gain=0.40)
    mix.add(bats_sound(np.random.default_rng(13), CUTS["bats"][1] - CUTS["bats"][0] + 0.3),
            CUTS["bats"][0], gain=0.30, send=0.2)
    mix.add(hiss(np.random.default_rng(14), 0.9), beat(15) + 0.05, gain=0.14, pan=0.2)
    mix.add(electric(np.random.default_rng(15), 1.2), beat(14) + 0.1, gain=0.22, pan=-0.2)
    mix.add(riser(np.random.default_rng(16), 0.95), 16.05, gain=0.35, send=0.2)

    # Darbeler
    for i, (ti, s) in enumerate(IMPACTS):
        mix.add(impact(np.random.default_rng(500 + i), s), ti, gain=0.85 * s, send=0.3)
        mix.add(braam(), ti, gain=0.45 * s, send=0.35)

    master = mix.dry + 0.45 * reverb(mix.wet)
    master = np.tanh(1.5 * norm(master))  # yumuşak limiter
    fade = np.ones(N)
    fade[:int(0.05 * SR)] = np.linspace(0, 1, int(0.05 * SR))
    fo = int(0.8 * SR)
    fade[-fo:] = np.linspace(1, 0, fo) ** 2
    master = norm(master * fade[:, None], 0.92)

    pcm = (master * 32767).astype(np.int16)
    with wave.open(path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


if __name__ == "__main__":
    import sys
    render(sys.argv[1] if len(sys.argv) > 1 else "soundtrack.wav")
