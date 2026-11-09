# -*- coding: utf-8 -*-
"""Yerel ses üretimi: müzik (music.wav), atmosfer + efekt (sfx_ambience.wav) ve otomatik kısma (ducking) ile miks.
Tüm sesler bu betikte sentezlenir; dış örnek veya başka yapımın müziği kullanılmaz. Deterministiktir (sabit tohum).
Olay zamanları src/ altındaki animasyonla aynı formüllerle work/timeline.json'dan hesaplanır.
"""
import json, os, wave
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000
TL = json.load(open(os.path.join(ROOT, 'work', 'timeline.json')))
DUR = TL['duration']
FRAMES = int(round(DUR * 30))  # Remotion kompozisyonuyla aynı kare sayısı
N = FRAMES * (SR // 30)  # ses uzunluğu = video uzunluğu
SEG = {s['id']: s for s in TL['segments']}
S = lambda i: SEG[i]['start']
E = lambda i: SEG[i]['end']
rng = np.random.default_rng(1896)

def zeros():
    return np.zeros((N, 2), np.float32)

def env_adsr(n, a, r, sustain=True):
    e = np.ones(n, np.float32)
    na = max(1, int(a * SR)); nr = max(1, int(r * SR))
    e[:na] = np.linspace(0, 1, na)
    e[-nr:] *= np.linspace(1, 0, nr)
    return e

def add(buf, x, t0, gain=1.0, pan=0.0):
    i0 = int(t0 * SR)
    if i0 >= N: return
    if x.ndim == 1:
        l = np.sqrt(0.5 * (1 - pan)); r = np.sqrt(0.5 * (1 + pan))
        x = np.stack([x * l * 1.414, x * r * 1.414], 1)
    if i0 < 0:
        x = x[-i0:]; i0 = 0
    n = min(len(x), N - i0)
    buf[i0:i0 + n] += x[:n] * gain

def lowpass(x, fc):
    a = np.exp(-2 * np.pi * fc / SR)
    y = np.empty_like(x); acc = 0.0
    # vektörel tek kutuplu filtre (lfilter yok): blok yaklaşımı yerine scipy'siz döngü
    from itertools import accumulate
    y = np.array(list(accumulate(x * (1 - a), lambda p, v: p * a + v)), dtype=np.float32)
    return y

def lp_fast(x, fc):
    # FFT tabanlı yumuşak alçak geçiren
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 / np.sqrt(1 + (f / fc) ** 4)
    return np.fft.irfft(X, len(x)).astype(np.float32)

def bp_fast(x, lo, hi):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= (1 / np.sqrt(1 + (f / hi) ** 4)) * (1 / np.sqrt(1 + (lo / np.maximum(f, 1)) ** 4))
    return np.fft.irfft(X, len(x)).astype(np.float32)

def tone(freq, dur, harm=(1, 0.5, 0.25, 0.12), detune=0.0, vib=0.0):
    t = np.arange(int(dur * SR)) / SR
    y = np.zeros_like(t)
    for k, a in enumerate(harm, 1):
        y += a * np.sin(2 * np.pi * freq * k * (1 + detune) * t + vib * np.sin(2 * np.pi * 0.2 * t))
    return y.astype(np.float32)

NOTE = lambda n: 440.0 * 2 ** ((n - 69) / 12)  # MIDI → Hz

# ------------------------------------------------------------------ MÜZİK
music = zeros()

def pad(t0, t1, notes, gain, bright=1200, pan_spread=0.5):
    dur = t1 - t0
    for j, n in enumerate(notes):
        f = NOTE(n)
        for d, p in ((-0.003, -pan_spread), (0.003, pan_spread)):
            y = tone(f, dur, harm=(1, 0.42, 0.24, 0.12, 0.06), detune=d, vib=0.6)
            y = lp_fast(y, bright)
            y *= env_adsr(len(y), min(2.5, dur * 0.4), min(2.5, dur * 0.4))
            add(music, y, t0, gain / len(notes), p)

def drone(t0, t1, n, gain, fc=400):
    y = tone(NOTE(n), t1 - t0, harm=(1, 0.6, 0.3, 0.2, 0.1))
    y += 0.5 * tone(NOTE(n - 12), t1 - t0, harm=(1, 0.3))
    y = lp_fast(y, fc) * env_adsr(len(y), 2.0, 2.0)
    add(music, y, t0, gain)

def pluck(t, n, gain, decay=0.6, pan=0.0, bright=2000):
    d = decay * 4
    tt = np.arange(int(d * SR)) / SR
    y = (np.sin(2 * np.pi * NOTE(n) * tt) + 0.35 * np.sin(2 * np.pi * NOTE(n) * 2 * tt) + 0.12 * np.sin(2 * np.pi * NOTE(n) * 3.01 * tt)) * np.exp(-tt / decay)
    y = lp_fast(y.astype(np.float32), bright)
    a = int(0.004 * SR); y[:a] *= np.linspace(0, 1, a)
    add(music, y, t, gain, pan)

def bell(t, n, gain, decay=2.5, pan=0.0):
    tt = np.arange(int(decay * 3 * SR)) / SR
    f = NOTE(n)
    y = sum(a * np.sin(2 * np.pi * f * r * tt) * np.exp(-tt / (decay * dd)) for r, a, dd in ((1, 1, 1), (2.01, 0.4, 0.6), (2.76, 0.25, 0.4), (5.4, 0.1, 0.2)))
    a = int(0.003 * SR); y[:a] *= np.linspace(0, 1, a)
    add(music, y.astype(np.float32), t, gain, pan)

Dm, Bb, F, C_, Gm, A_ = [50, 57, 62, 65], [46, 53, 58, 62], [41, 53, 57, 60], [48, 55, 60, 64], [43, 55, 58, 62], [45, 52, 57, 61]

# Açılış (0–26): pes D dronu, ~80 BPM hissi veren yumuşak nabız, ince metal rezonansı
drone(0.0, 27.0, 38, 0.16, fc=300)
for k in range(int(25 / 0.75)):
    t = 0.4 + k * 0.75
    if t > 24.5: break
    pluck(t, 38 if k % 4 else 50, 0.10 if k % 4 else 0.14, decay=0.25, bright=500)
pad(10.0, 18.5, [50, 53, 57, 58], 0.10, bright=900)  # 1 SAATTEN KISA: gerilim (minör + yarım ton)
# Bağlam (26–132): seyrek yaylı benzeri doku, anlatıcıya geniş yer
prog_ctx = [Dm, Bb, F, C_, Dm, Gm, Bb, A_]
t = 26.0; k = 0
while t < 131.0:
    ch = prog_ctx[k % len(prog_ctx)]
    pad(t, min(t + 8.6, 132.5), ch, 0.12, bright=1000)
    if k % 2 == 0: pluck(t + 0.05, ch[0] - 12, 0.08, decay=1.2, bright=600)
    t += 8.0; k += 1
# Ültimatom (132–189): ritmik yoğunluk artar (≈96→104 BPM), süre dolmadan önce boşluk
drone(132.0, E('s36') + 0.3, 38, 0.17, fc=380)
t = 133.0
while t < E('s36') - 0.6:
    bpm = 92 + 12 * min(1, max(0, (t - 133) / (E('s36') - 134)))
    step = 60 / bpm / 2
    i = int((t - 133) / step)
    pat = [38, 38, 41, 38, 38, 43, 41, 38]
    if t > S('s31'):
        pluck(t, pat[i % 8], 0.12 + 0.05 * min(1, (t - S('s31')) / 25), decay=0.18, bright=900, pan=(-0.3 if i % 2 else 0.3))
    elif i % 2 == 0:
        pluck(t, 38, 0.09, decay=0.2, bright=700)
    t += step
pad(S('s31'), E('s36') - 0.6, [50, 53, 56, 62], 0.09, bright=1400)
# Güç farkı (189–232): yavaş nabız ve bekleyiş; son saniyeler neredeyse sessiz
drone(189.0, E('s43') + 0.5, 37, 0.13, fc=300)
for k in range(int((E('s43') - 189.5) / 1.0)):
    pluck(189.5 + k * 1.0, 38, 0.11, decay=0.3, bright=380)
pad(195.0, E('s43') + 0.3, [50, 53, 57, 61], 0.07, bright=800)
# Bombardıman (232–264): müzik geri çekilir; yalnızca düşük drone
drone(S('s45') + 0.2, E('s51') + 0.5, 36, 0.12, fc=260)
# Kayıplar: kısa sessizlik, sonra seyrek çanlar
for i, (tt, n) in enumerate([(S('s53') + 0.4, 62), (S('s54') + 0.6, 57), (S('s55') + 0.2, 60), (S('s55') + 3.2, 58), (S('s56') + 0.2, 57)]):
    bell(tt, n, 0.10, decay=2.8, pan=(-0.2 if i % 2 else 0.2))
pad(S('s54'), E('s56') + 1.0, [38, 50, 57], 0.06, bright=700)
# Yönetim (290–344): ağır, sıcak akorlar
prog_rule = [Bb, F, Gm, Dm, Bb, C_, Dm]
t = 290.6; k = 0
while t < 344.0:
    pad(t, min(t + 8.6, 345.0), prog_rule[k % len(prog_rule)], 0.11, bright=1100)
    t += 8.0; k += 1
# Final (344–394): müzikal çözülme; abonelik çağrısının altında kısa kapanış
for (a, b, ch) in [(344.6, 353.6, Dm), (353.0, 361.6, Bb), (361.0, 369.6, Gm), (369.0, 378.6, A_), (378.0, 393.5, [38, 50, 57, 62, 64])]:
    pad(a, b, ch, 0.12 if a < 378 else 0.09, bright=1000)
for i, n in enumerate([62, 65, 69, 74]):
    bell(S('s72') + 0.3 + i * 0.55, n, 0.07, decay=2.2, pan=-0.3 + 0.2 * i)

# ------------------------------------------------------------------ EFEKT + ATMOSFER
sfx = zeros()

def noise(dur):
    return rng.standard_normal(int(dur * SR)).astype(np.float32)

def tick(t, gain=0.25, pitch=1.0, pan=0.0):
    tt = np.arange(int(0.12 * SR)) / SR
    y = (np.sin(2 * np.pi * 3200 * pitch * tt) * 0.5 + np.sin(2 * np.pi * 1700 * pitch * tt) * 0.5) * np.exp(-tt / 0.012)
    y += bp_fast(noise(0.12), 1500, 6000) * np.exp(-tt / 0.006) * 0.6
    add(sfx, y.astype(np.float32), t, gain, pan)

def whoosh(t, dur=1.2, gain=0.18, lo=200, hi=2500):
    y = bp_fast(noise(dur), lo, hi)
    tt = np.linspace(0, 1, len(y))
    y *= np.sin(np.pi * tt) ** 2
    add(sfx, y, t, gain, 0.0)

def boom(t, gain=0.6, sub=False, pan=-0.3, dist=1.0):
    d = 2.6
    tt = np.arange(int(d * SR)) / SR
    y = lp_fast(noise(d), 900 / dist) * np.exp(-tt / (0.35 * dist)) * 0.9
    y += np.sin(2 * np.pi * (55 + 35 * np.exp(-tt / 0.08)) * tt) * np.exp(-tt / (0.45 if sub else 0.22)) * (1.2 if sub else 0.5)
    a = int(0.003 * SR); y[:a] *= np.linspace(0, 1, a)
    add(sfx, y.astype(np.float32), t, gain, pan)

def impact(t, gain=0.35, pan=0.4):
    d = 1.8
    tt = np.arange(int(d * SR)) / SR
    y = bp_fast(noise(d), 120, 3000) * np.exp(-tt / 0.18)
    y += bp_fast(noise(d), 2000, 7000) * np.exp(-tt / 0.5) * 0.15 * (rng.random(len(tt)) > 0.97)  # döküntü
    add(sfx, y.astype(np.float32), t, gain, pan)

def metal(t, dur=4.0, gain=0.12, f0=220):
    tt = np.arange(int(dur * SR)) / SR
    y = sum(a * np.sin(2 * np.pi * f0 * r * tt + rr) for r, a, rr in ((1, 1, 0), (2.72, 0.5, 1), (4.1, 0.3, 2), (6.8, 0.15, 3)))
    y *= np.exp(-tt / (dur * 0.4)) * (1 - np.exp(-tt / 0.3))
    add(sfx, y.astype(np.float32), t, gain, 0.2)

def sea(t0, t1, gain):
    d = t1 - t0
    y = lp_fast(noise(d), 500) * 0.6 + bp_fast(noise(d), 800, 3000) * 0.15
    tt = np.arange(len(y)) / SR
    y *= (0.65 + 0.35 * np.sin(2 * np.pi * 0.11 * tt) * np.sin(2 * np.pi * 0.047 * tt + 1)) * env_adsr(len(y), 1.5, 1.5)
    y2 = np.roll(y, 9000)
    add(sfx, np.stack([y, y2], 1), t0, gain)

def crackle(t0, t1, gain):
    d = t1 - t0
    y = bp_fast(noise(d), 1500, 6000) * (rng.random(int(d * SR)) > 0.996) * 4
    y += lp_fast(noise(d), 200) * 0.5
    y *= env_adsr(len(y), 2, 3)
    add(sfx, y.astype(np.float32), t0, gain, 0.4)

# atmosfer
sea(0.0, 26.5, 0.10)
sea(57.0, 132.5, 0.07)
sea(132.0, 189.5, 0.09)
sea(232.0, 291.5, 0.09)
sea(290.5, 345.0, 0.04)
sea(344.0, DUR, 0.10)
crackle(S('s46'), 292.0, 0.08)

# açılış
metal(0.25, 5.0, 0.10, 196)
for k in range(int(23 / 1.5)):
    tick(0.6 + k * 1.5, 0.10)
for tt in (5.8, 10.0, 12.2, 14.6, 16.0, 17.3):
    whoosh(tt - 0.35, 0.8, 0.10)
boom(10.15, 0.35, sub=True, pan=0.0, dist=2.0)  # "1 SAATTEN KISA"
metal(10.2, 4.0, 0.08, 147)
for k in range(5): tick(16.0 + k * 0.26, 0.28, 1.0)
whoosh(19.0, 2.4, 0.10, 1500, 8000)
whoosh(21.2, 1.6, 0.09, 300, 3000)
for k in range(14): tick(23.0 + k * 0.16, 0.18, 1.15)  # tarih halkası geri döner (cırcır)
# harita
whoosh(26.3, 3.0, 0.07, 2000, 9000)
for tt in (35.9, 43.0, 51.5, 55.4): whoosh(tt, 2.2, 0.08)
whoosh(S('s12') - 1.0, 2.0, 0.10, 150, 1800)
# taht
boom(S('s18') + 1.8, 0.18, pan=0.3, dist=3)  # mühür
whoosh(S('s20') - 0.2, 1.8, 0.12, 100, 1500)
impact(S('s25') + 3.0, 0.18, 0.0)  # kopan bağ
# ültimatom
for k in range(6): whoosh(S('s29') + k * 0.6, 1.4, 0.04, 60, 400)
t = S('s31') + 1.0; k = 0
while t < E('s36') - 0.8:
    bpm = 90 + 15 * min(1, (t - S('s31')) / (E('s36') - S('s31')))
    tick(t, 0.12 + 0.12 * min(1, (t - S('s31')) / 30), 1.0)
    t += 60 / bpm; k += 1
metal(E('s36') - 0.85, 5.0, 0.16, 110)  # 09.00
for k in range(3): tick(E('s36') + 0.4 + k * 1.0, 0.26, 0.95)  # bekleyiş: belirgin saat sesi
# güç farkı
for k in range(int((232.0 - 189.6) / 1.0)):
    tick(189.6 + k * 1.0, 0.10 if 189.6 + k < E('s43') else 0.24, 0.95)
whoosh(S('s37') - 0.6, 2.2, 0.10, 200, 3000)
# bombardıman (src/scenes/Bombard.tsx ile aynı çizelge)
T0 = E('s45') + 0.05
SALVOS = [(T0, [2, 3, 4]), (T0 + 1.3, [1]), (T0 + 2.5, [0, 2]), (T0 + 3.6, [3, 4]), (T0 + 4.8, [1, 2]), (T0 + 5.8, [0]),
          (S('s48') + 3.2, [0]), (S('s48') + 4.0, [0, 1]), (S('s49') + 0.2, [2, 3]), (S('s49') + 1.6, [1, 4]), (S('s49') + 3.0, [0, 2]),
          (S('s50') + 0.1, [3]), (S('s50') + 0.9, [4])]
SEL = {round(T0, 2)}
GLASGOW_FIRE = S('s48') + 1.6
GLASGOW_HIT = S('s48') + 3.6
FLAG_FALL = S('s50') + 1.5
for (st, ships) in SALVOS:
    for j, i in enumerate(ships):
        at = st + j * 0.12
        boom(at, 0.42 if i == 0 else 0.34, sub=(round(st, 2) in SEL and j == 0), pan=-0.6 + i * 0.15, dist=1.0 + 0.2 * i)
        impact(at + 0.5, 0.20, 0.5)
# klip B sırasında uzak atışlar
for tt in (S('s47') - 1.2, S('s47') + 0.9, S('s47') + 2.8, S('s47') + 4.6):
    boom(tt, 0.18, pan=-0.4, dist=2.5)
boom(GLASGOW_FIRE, 0.22, pan=0.4, dist=1.6)  # Glasgow'un topu (daha küçük)
boom(GLASGOW_HIT, 0.4, sub=True, pan=0.3)
whoosh(GLASGOW_HIT + 0.4, 3.5, 0.10, 80, 900)  # batış / su
impact(FLAG_FALL, 0.16, 0.3)
whoosh(FLAG_FALL + 0.1, 1.0, 0.08, 1500, 6000)
# kayıplar / yönetim / final
whoosh(S('s54') + 0.2, 4.0, 0.04, 80, 500)
whoosh(E('s59') + 0.2, 1.8, 0.08)
whoosh(S('s68') - 0.4, 1.6, 0.07)
WAN_C_B = S('s70') + 1.6 + 2.4
for k in range(int(3.0 / 0.75)): tick(WAN_C_B + 0.1 + k * 0.75, 0.16)
tick(WAN_C_B + 3.0, 0.22, 0.9)  # saat durur; sonrasında yalnızca deniz ve rüzgâr
metal(WAN_C_B + 4.8, 3.0, 0.06, 330)  # isim levhası

# ------------------------------------------------------------------ MİKS
def read_wav(p):
    with wave.open(p) as w:
        sr, ch, sw, n = w.getframerate(), w.getnchannels(), w.getsampwidth(), w.getnframes()
        b = np.frombuffer(w.readframes(n), np.uint8)
    assert sr == SR and sw == 3
    b = b.reshape(-1, 3).astype(np.int32)
    v = (b[:, 0] | (b[:, 1] << 8) | (b[:, 2] << 16))
    v = np.where(v >= 2 ** 23, v - 2 ** 24, v)
    return (v / 2 ** 23).astype(np.float32)

def write_wav16(p, x):
    """Teslim katmanları: 16-bit (depo dosya boyutu sınırı için)."""
    x = np.clip(x, -1, 1)
    pcm = (x * 32767).astype('<i2')
    with wave.open(p, 'wb') as w:
        w.setnchannels(x.shape[1]); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())

def write_wav(p, x):
    x = np.clip(x, -1, 1)
    if x.ndim == 1: x = x[:, None]
    pcm = (x * (2 ** 23 - 1)).astype(np.int32).reshape(-1)
    b = np.zeros((len(pcm), 3), np.uint8)
    b[:, 0] = pcm & 255; b[:, 1] = (pcm >> 8) & 255; b[:, 2] = (pcm >> 16) & 255
    with wave.open(p, 'wb') as w:
        w.setnchannels(x.shape[1]); w.setsampwidth(3); w.setframerate(SR); w.writeframes(b.tobytes())

nar = read_wav(os.path.join(ROOT, 'work', 'narration_raw.wav'))
nar = np.pad(nar, (0, max(0, N - len(nar))))[:N]
# konuşma zarfı → otomatik kısma
hop = 480
r = np.sqrt(np.add.reduceat(nar ** 2, np.arange(0, N, hop)) / hop)
on = (r > 0.02).astype(np.float32)
env = np.zeros_like(on); a_up, a_dn = 0.5, 0.06
for i in range(1, len(on)):
    env[i] = env[i - 1] + (on[i] - env[i - 1]) * (a_up if on[i] > env[i - 1] else a_dn)
env = np.repeat(env, hop)[:N]
music_d = music * (1 - 0.62 * env)[:, None]
sfx_d = sfx * (1 - 0.45 * env)[:, None]

out = ROOT
os.makedirs(out, exist_ok=True)
def norm_peak(x, db):
    return x / (np.abs(x).max() + 1e-9) * 10 ** (db / 20)
write_wav16(os.path.join(out, 'music.wav'), norm_peak(music, -3))
write_wav16(os.path.join(out, 'sfx_ambience.wav'), norm_peak(sfx, -3))
# miks: anlatım önde
mix = np.stack([nar, nar], 1) * 0.92 + music_d * 0.75 + sfx_d * 0.85
write_wav(os.path.join(ROOT, 'work', 'mix_premaster.wav'), mix * 0.8)
print('ok', DUR, 'music peak', np.abs(music).max(), 'sfx peak', np.abs(sfx).max(), 'mix peak', np.abs(mix).max())
