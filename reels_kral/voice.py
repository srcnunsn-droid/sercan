#!/usr/bin/env python3
"""Turkish voice-over with local Piper voices (piper-tts), fitted to the caption timeline.

Voices (CC0, rhasspy/piper via k2-fsa/sherpa-onnx releases):
  narrator -> tr_TR-fahrettin-medium   (pitched down slightly, slow, warm)
  king     -> tr_TR-fettah-medium      (deep, calm)
  guard    -> tr_TR-fettah-medium      (higher, shivering tremolo; wall text with echo)

Env VOICE_DIR = folder containing the extracted vits-piper-tr_TR-* model folders.
Writes build/voice.wav (48 kHz mono) and build/voice_lines.json (measured timings).
"""
import json
import os
import subprocess
import sys

import numpy as np
from piper import PiperVoice, SynthesisConfig
from scipy.io import wavfile

from timeline import DURATION

HERE = os.path.dirname(os.path.abspath(__file__))
BUILD = os.path.join(HERE, "build")
VDIR = os.environ.get("VOICE_DIR", os.path.join(HERE, "voices"))
SR = 48000
PAUSE = 0.55  # seconds of silence at "..."
FILL = 0.93  # target share of the caption window the line should occupy

# start, window_end, role, text
LINES = [
    (0.35, 4.4, "narrator", "Verilen bir söz... bir insanı öldürebilir mi?"),
    (4.85, 7.7, "narrator", "Dondurucu bir kış gecesiydi."),
    (7.8, 10.9, "narrator", "Kral, surlarda nöbet tutan muhafızın yanına geldi."),
    (11.6, 13.5, "narrator", "Ona sordu:"),
    (13.75, 16.9, "king", "Üşüyor musun?"),
    (17.2, 19.3, "narrator", "Muhafız titreyerek cevap verdi:"),
    (19.45, 22.4, "guard", "Alışığım, kralım."),
    (22.45, 23.5, "narrator", "Kral gülümsedi:"),
    (23.55, 27.95, "king", "Olsun. Sana sıcak tutacak bir elbise getirmelerini emredeceğim."),
    (28.0, 28.95, "narrator", "Ve gitti."),
    (29.4, 32.3, "narrator", "Ama sıcacık sarayına girdiğinde..."),
    (32.4, 35.3, "narrator", "verdiği emri unuttu."),
    (35.9, 39.0, "narrator", "Muhafız bütün gece o kapıyı bekledi."),
    (39.1, 42.2, "narrator", "Umutla... ve soğukla."),
    (43.0, 45.4, "narrator", "Ertesi sabah..."),
    (45.5, 48.4, "narrator", "onu duvarın dibinde donmuş buldular."),
    (48.8, 50.7, "narrator", "Duvarda şu yazıyordu:"),
    (50.85, 56.9, "wall", "Soğuğa alışkındım... fakat senin sıcak elbise vaadin... beni öldürdü."),
    (57.65, 61.6, "narrator", "Tutamayacağın sözü... kimseye verme."),
]

ROLE = {
    # model, base speed, light ffmpeg chain (no pitch shifting / tremolo: they made the voice sound synthetic)
    "narrator": ("fahrettin", 0.97, "highpass=f=70,acompressor=threshold=-20dB:ratio=2.5:attack=10:release=150"),
    "king": ("fettah", 0.97, "highpass=f=70,acompressor=threshold=-20dB:ratio=2.5"),
    "guard": ("fettah", 0.97, "highpass=f=80,acompressor=threshold=-20dB:ratio=2.5"),
    "wall": ("fettah", 0.95, "highpass=f=80,aecho=0.8:0.5:60:0.12,acompressor=threshold=-20dB:ratio=2.5"),
}


def tts_engine(name):
    d = os.path.join(VDIR, f"vits-piper-tr_TR-{name}-medium")
    return PiperVoice.load(os.path.join(d, f"tr_TR-{name}-medium.onnx"),
                           config_path=os.path.join(d, f"tr_TR-{name}-medium.onnx.json"))


def synth(engine, text, speed):
    cfg = SynthesisConfig(length_scale=1.0 / speed, noise_scale=0.667, noise_w_scale=0.8)
    parts, sr = [], 22050
    pieces = [p.strip() for p in text.split("...") if p.strip()]
    for k, piece in enumerate(pieces):
        chunks = list(engine.synthesize(piece, syn_config=cfg))
        sr = chunks[0].sample_rate
        for j, c in enumerate(chunks):
            parts.append(trim(c.audio_float_array.astype(np.float32), sr))
            if j < len(chunks) - 1:
                parts.append(np.zeros(int(sr * 0.22 / speed), np.float32))
        if k < len(pieces) - 1:
            parts.append(np.zeros(int(sr * PAUSE / speed), np.float32))
    return np.concatenate(parts), sr


def trim(x, sr, thr=0.012):
    idx = np.where(np.abs(x) > thr)[0]
    if len(idx) == 0:
        return x
    a = max(0, idx[0] - int(0.02 * sr))
    b = min(len(x), idx[-1] + int(0.08 * sr))
    return x[a:b]


def process(x, sr, chain, tag):
    os.makedirs(os.path.join(BUILD, "vo"), exist_ok=True)
    src = os.path.join(BUILD, "vo", f"{tag}_raw.wav")
    dst = os.path.join(BUILD, "vo", f"{tag}.wav")
    wavfile.write(src, sr, (np.clip(x, -1, 1) * 32767).astype(np.int16))
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", src, "-af", chain + f",aresample={SR}",
                    "-ac", "1", dst], check=True)
    y = wavfile.read(dst)[1].astype(np.float32) / 32767
    return y


def main():
    engines = {n: tts_engine(n) for n in {r[0] for r in ROLE.values()}}
    track = np.zeros(int(DURATION * SR) + SR, np.float32)
    report = []
    for i, (start, wend, role, text) in enumerate(LINES):
        model, base, chain = ROLE[role]
        window = wend - start
        lo, hi = 0.93, 1.15  # keep close to the natural speaking rate
        # rubberband pitch shift keeps duration, so fit the speed on the raw take
        speed = 1.0
        for _ in range(4):
            raw, sr = synth(engines[model], text, speed)
            dur = len(raw) / sr
            target = window * FILL
            new = min(hi, max(lo, speed * dur / target))
            if abs(new - speed) < 0.02:
                break
            speed = new
        raw, sr = synth(engines[model], text, speed)
        y = process(raw, sr, chain, f"{i:02d}_{role}")
        y = trim(y, SR, 0.004) if role != "wall" else y
        dur = len(y) / SR
        rms = np.sqrt(np.mean(y ** 2)) + 1e-9
        target = 10 ** ((-15.0 if role == "wall" else -13.5) / 20)
        gain = min(target / rms, 0.95 / (np.max(np.abs(y)) + 1e-9))
        y = y * gain
        a = int(start * SR)
        track[a:a + len(y)] += y[:len(track) - a]
        report.append(dict(i=i, role=role, start=start, end=round(start + dur, 2), window_end=wend,
                           speed=round(speed, 3), text=text))
        flag = "  OVER!" if start + dur > wend + 0.15 else ""
        print(f"{i:02d} {role:8s} {start:5.2f}-{start + dur:5.2f} (win {wend:5.2f}) speed {speed:.2f}{flag}  {text}")
    track = track[:int(DURATION * SR)]
    out = os.path.join(BUILD, "voice.wav")
    wavfile.write(out, SR, (np.clip(track, -1, 1) * 32767).astype(np.int16))
    json.dump(report, open(os.path.join(BUILD, "voice_lines.json"), "w"), ensure_ascii=False, indent=1)
    print("wrote", out)


if __name__ == "__main__":
    sys.exit(main())
