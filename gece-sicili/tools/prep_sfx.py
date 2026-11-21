#!/usr/bin/env python3
"""Prepare Higgsfield SFX (audio/sfx_hf/*.mp3) for the mix: trim leading silence so the sound lands on its cue,
normalise peak to -3 dBFS, 48 kHz stereo WAV into audio/sfx/. The ambience is looped with crossfades to 121 s.
Procedural fallbacks (tools/make_sfx.py) live in audio/sfx_proc/."""
import os, glob, subprocess
R = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
os.makedirs(f"{R}/audio/sfx", exist_ok=True)
for f in sorted(glob.glob(f"{R}/audio/sfx_hf/*.mp3")):
    n = os.path.basename(f)[:-4]
    out = f"{R}/audio/sfx/{n}.wav"
    if n.startswith("amb_"):
        # loop a 20 s bed to 121 s with 2 s crossfades, gentle EQ (no hiss), normalise
        segs = 7
        cmd = ["ffmpeg", "-v", "error", "-y"]
        for _ in range(segs): cmd += ["-i", f]
        fc = "".join(f"[{i}:a]aresample=48000,aformat=channel_layouts=stereo[a{i}];" for i in range(segs))
        cur = "a0"
        for i in range(1, segs):
            fc += f"[{cur}][a{i}]acrossfade=d=2:c1=tri:c2=tri[x{i}];"
            cur = f"x{i}"
        fc += f"[{cur}]lowpass=f=6000,atrim=0:121,afade=t=in:d=0.01,dynaudnorm=f=500:g=31,volume=1[out]"
        subprocess.run(cmd + ["-filter_complex", fc, "-map", "[out]", "-c:a", "pcm_s16le", out], check=True)
    else:
        af = "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.02,aresample=48000,aformat=channel_layouts=stereo"
        tmp = out + ".tmp.wav"
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", f, "-af", af, tmp], check=True)
        r = subprocess.run(["ffmpeg", "-hide_banner", "-i", tmp, "-af", "astats=metadata=0", "-f", "null", "-"], capture_output=True, text=True).stderr
        peak = float([l for l in r.splitlines() if "Peak level dB" in l][-1].split()[-1])
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", tmp, "-af", f"volume={-3 - peak:.2f}dB", "-c:a", "pcm_s16le", out], check=True)
        os.remove(tmp)
    d = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", out], capture_output=True, text=True).stdout.strip()
    print(f"{n:15s} {d}s")
