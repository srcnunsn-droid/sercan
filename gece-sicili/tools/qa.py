#!/usr/bin/env python3
"""QA for a rendered episode (CLAUDE.md §12): ffprobe checks + frames at block boundaries, every cut,
start and middle of every dialogue line, assembled into 4 contact sheets (one per 30 s block).
Usage: python3 tools/qa.py out/gece-sicili-bolum-01.mp4 01 [outdir]"""
import sys, os, json, subprocess
from PIL import Image, ImageDraw
mp4, EP = sys.argv[1], sys.argv[2]
OUT = sys.argv[3] if len(sys.argv) > 3 else os.path.join(os.path.dirname(mp4), f"qa-{os.path.basename(mp4)[:-4]}")
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
os.makedirs(OUT, exist_ok=True)
pr = json.loads(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "stream=codec_type,width,height,r_frame_rate,nb_frames,duration,pix_fmt,codec_name,channels", "-show_entries", "format=duration", "-of", "json", mp4], capture_output=True, text=True).stdout)
v = [s for s in pr["streams"] if s["codec_type"] == "video"][0]
a = [s for s in pr["streams"] if s["codec_type"] == "audio"]
print(f"video {v['codec_name']} {v['width']}x{v['height']} {v['r_frame_rate']} {v.get('pix_fmt')} frames={v.get('nb_frames')} dur={v.get('duration')}")
print("audio", [(s['codec_name'], s.get('channels'), s.get('duration')) for s in a])
print("container duration", pr["format"]["duration"])
ok = abs(float(v["duration"]) - 120.0) <= 1 / 30 + 1e-6 and a and abs(float(a[0]["duration"]) - 120.0) < 0.05
print("DURATION/AUDIO CHECK:", "PASS" if ok else "FAIL")
r = subprocess.run(["ffmpeg", "-hide_banner", "-i", mp4, "-af", "loudnorm=I=-14:TP=-1.5:print_format=json", "-f", "null", "-"], capture_output=True, text=True)
import re
m = json.loads(re.findall(r"\{[^{}]*\"input_i\"[^{}]*\}", r.stderr)[-1])
print(f"loudness {m['input_i']} LUFS, true peak {m['input_tp']} dBTP")
# times from the storyboard data
node = r"""
const vm=require('vm'),fs=require('fs');const R=process.argv[1],EP=process.argv[2];
const ctx={window:{},console};ctx.window.window=ctx.window;vm.createContext(ctx);vm.runInContext('window.GS={};',ctx);
const m=fs.readFileSync(R+'/sets/morgue.js','utf8').match(/const M = \(GS\.MORGUE = (\{[\s\S]*?\n  \})\);/);
ctx.window.GS.MORGUE=vm.runInContext('('+m[1]+')',ctx);
for(const f of ['data/ep-'+EP+'-voice.js','data/ep-'+EP+'.js'])vm.runInContext(fs.readFileSync(R+'/'+f,'utf8'),ctx);
const E=ctx.window.GS_EP,V=ctx.window.GS_VOICE;
console.log(JSON.stringify({shots:E.shots.map(s=>[s.id,s.t0,s.t1]),lines:E.lines.map(l=>[l.n,l.start,V[l.n].dur])}));
"""
D = json.loads(subprocess.run(["node", "-e", node, ROOT, EP], capture_output=True, text=True, check=True).stdout)
times = {}
for b in (0, 30, 60, 90):
    times[round(b + 0.05, 2)] = f"block {b}"
times[119.95] = "last frame"
for sid, t0, t1 in D["shots"]:
    times.setdefault(round(t0 + 0.1, 2), f"cut {sid}")
for n, st, du in D["lines"]:
    times[round(st + 0.15, 2)] = f"line {n} start"
    times[round(st + du / 2, 2)] = f"line {n} mid"
W = 270 if v["width"] < v["height"] else 480
for blk in range(4):
    ts = sorted(t for t in times if blk * 30 <= t < blk * 30 + 30 or (blk == 3 and t >= 119))
    ims = []
    for t in ts:
        f = os.path.join(OUT, f"f{t:07.2f}.png")
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{t:.3f}", "-i", mp4, "-frames:v", "1", "-vf", f"scale={W}:-1", f], check=True)
        ims.append((t, Image.open(f).convert("RGB")))
    cols = 8 if W == 270 else 5
    w, h = ims[0][1].size
    rows = (len(ims) + cols - 1) // cols
    S = Image.new("RGB", (w * cols, (h + 22) * rows), (16, 16, 24))
    d = ImageDraw.Draw(S)
    for i, (t, im) in enumerate(ims):
        x, y = (i % cols) * w, (i // cols) * (h + 22)
        S.paste(im, (x, y + 22))
        d.text((x + 4, y + 4), f"{t:.2f}s {times[t]}", fill=(225, 240, 240))
    p = os.path.join(OUT, f"contact-block{blk + 1}.png")
    S.save(p)
    print("contact sheet", p, len(ims), "frames")
