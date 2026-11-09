"""TTS segmentlerini kırpar, bölüme göre hafif tempo uygular, duraklamalarla birleştirir.
Çıktı: narration_tr.wav (48 kHz mono 24-bit) + work/timeline.json (segment zamanları)."""
import json, subprocess, numpy as np, os, wave
SR = 48000
segs = json.load(open('work/segments.json'))
# Bölüm tempoları (rubberband, perdeyi korur). 1.0 = doğal.
TEMPO = {"ultimatom": 1.04, "bomba": 1.065, "final": 1.0, "cta": 1.02}
BASE_TEMPO = 1.02
PAUSE_SCALE = {"bomba": 0.8, "ultimatom": 0.85}
PAUSE_BASE = 0.9
LEAD_IN = 0.55   # anlatım 0.55 sn'de başlar
TAIL = 7.0       # son cümleden sonra bitiş ekranı ve kapanış müziği

def load(path, tempo):
    af = ['aresample=48000']
    if abs(tempo-1) > 1e-3:
        af.append(f'rubberband=tempo={tempo}:pitchq=quality:formant=preserved')
    raw = subprocess.run(['ffmpeg','-v','error','-i',path,'-af',','.join(af),'-ac','1','-ar',str(SR),'-f','f32le','-'],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).copy()

def trim(x, thr_db=-45, pre=0.03, post=0.08):
    win = int(0.01*SR)
    n = len(x)//win
    rms = np.sqrt((x[:n*win].reshape(n, win)**2).mean(1) + 1e-12)
    db = 20*np.log10(rms)
    idx = np.where(db > thr_db)[0]
    a = max(0, idx[0]*win - int(pre*SR)); b = min(len(x), (idx[-1]+1)*win + int(post*SR))
    y = x[a:b].copy()
    f = int(0.008*SR); y[:f] *= np.linspace(0,1,f); y[-f:] *= np.linspace(1,0,f)
    return y

out = [np.zeros(int(LEAD_IN*SR), np.float32)]
t = LEAD_IN; tl = []
for i, s in enumerate(segs):
    tempo = TEMPO.get(s["section"], BASE_TEMPO)
    y = trim(load(f"work/tts_final/{s['id']}.mp3", tempo))
    start = t; t += len(y)/SR
    tl.append(dict(id=s['id'], section=s['section'], text=s['text'], start=round(start,3), end=round(t,3)))
    out.append(y)
    p = s["pause"]*PAUSE_SCALE.get(s["section"], PAUSE_BASE)
    out.append(np.zeros(int(p*SR), np.float32)); t += int(p*SR)/SR
out.append(np.zeros(int(TAIL*SR), np.float32))
x = np.concatenate(out)
# loudness normalisation target ~ -16 LUFS later in mix; here peak-normalise to -1 dBFS
x = x / (np.abs(x).max()+1e-9) * 10**(-1/20)
pcm = (np.clip(x,-1,1)*(2**23-1)).astype(np.int32)
b = np.zeros((len(pcm),3), np.uint8)
b[:,0]=pcm&255; b[:,1]=(pcm>>8)&255; b[:,2]=(pcm>>16)&255
with wave.open('work/narration_raw.wav','wb') as w:
    w.setnchannels(1); w.setsampwidth(3); w.setframerate(SR); w.writeframes(b.tobytes())
json.dump(dict(duration=round(len(x)/SR,3), lead_in=LEAD_IN, segments=tl), open('work/timeline.json','w'), ensure_ascii=False, indent=1)
print('duration', len(x)/SR, 'speech end', t)
secs = {}
for d in tl: secs.setdefault(d['section'], [d['start'], d['end']]); secs[d['section']][1] = d['end']
for k,v in secs.items(): print(f"{k:10s} {v[0]:7.2f} -> {v[1]:7.2f}  ({v[1]-v[0]:.1f}s)")
