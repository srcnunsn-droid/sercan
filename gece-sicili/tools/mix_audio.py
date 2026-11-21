#!/usr/bin/env python3
"""Final soundtrack mix for one episode (CLAUDE.md §10.2).
voices (trimmed, placed at line starts) + SFX (data sfx cues) + ambience,
SFX ducked ~-8 dB and ambience ~-12 dB under speech (sidechain), loudness -14 LUFS, true peak <= -1.5 dB.
Also writes audio/cues-XX.md from the same data. Usage: python3 tools/mix_audio.py 01"""
import sys, os, json, subprocess, re

EP = sys.argv[1] if len(sys.argv) > 1 else "01"
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DUR = 120.0

# read episode data via node (the data file is JS)
js = f"""
global.window = {{ GS: {{ MORGUE: {{}} }} }};
require('{ROOT}/sets/morgue.js'.replace(/.*/, '{ROOT}/lib/core.js'));
"""
node = f"""
const vm=require('vm'),fs=require('fs');
const ctx={{window:{{}},document:{{createElementNS:()=>({{setAttribute(){{}},appendChild(){{}}}}),createElement:()=>({{}}),head:{{appendChild(){{}}}}}},console}};
ctx.window.window=ctx.window; vm.createContext(ctx);
for (const f of ['lib/core.js','sets/morgue.js','data/ep-{EP}-voice.js','data/ep-{EP}.js']) vm.runInContext(fs.readFileSync('{ROOT}/'+f,'utf8').replace(/window\\.GS = window\\.GS \\|\\| \\{{\\}}/,'window.GS = window.GS || {{}}'),ctx,{{filename:f}});
// morgue.js only defines GS.SET.morgue lazily; MORGUE constants are set when SET.morgue runs, so compute them here
const W=ctx.window;
console.log(JSON.stringify({{lines:W.GS_EP.lines,sfx:W.GS_EP.sfx,amb:W.GS_EP.ambience,voice:W.GS_VOICE}}));
"""
# GS_EP references GS.MORGUE at load: run morgue builder stub first
node = node.replace("for (const f of", "ctx.window.GS={}; vm.runInContext(fs.readFileSync('" + ROOT + "/lib/core.js','utf8'),ctx); const _m=fs.readFileSync('" + ROOT + "/sets/morgue.js','utf8'); const _mm=_m.match(/const M = \\(GS\\.MORGUE = (\\{[\\s\\S]*?\\n  \\})\\);/); ctx.window.GS.MORGUE=vm.runInContext('('+_mm[1]+')',ctx);\nfor (const f of")
node = node.replace("['lib/core.js','sets/morgue.js',", "[")
D = json.loads(subprocess.run(["node", "-e", node], capture_output=True, text=True, check=True).stdout)

inputs, filters, vlabels, slabels = [], [], [], []
def add_input(path):
    inputs.extend(["-i", path])
    return len(inputs) // 2 - 1

# ambience
ai = add_input(f"{ROOT}/audio/sfx/{D['amb']}.wav")
filters.append(f"[{ai}:a]atrim=0:{DUR},asetpts=N/SR/TB,volume=-17dB[amb]")
# voices
for ln in D["lines"]:
    v = D["voice"][str(ln["n"])]
    i = add_input(f"{ROOT}/{v['file']}")
    ms = int(round(ln["start"] * 1000))
    filters.append(f"[{i}:a]aformat=sample_rates=48000:channel_layouts=stereo,adelay={ms}|{ms},volume=0dB[v{ln['n']}]")
    vlabels.append(f"[v{ln['n']}]")
# sfx
for k, (t, name, gain) in enumerate(D["sfx"]):
    i = add_input(f"{ROOT}/audio/sfx/{name}.wav")
    ms = int(round(t * 1000))
    filters.append(f"[{i}:a]aformat=sample_rates=48000:channel_layouts=stereo,adelay={ms}|{ms},volume={gain - 6}dB[s{k}]")
    slabels.append(f"[s{k}]")

filters.append(f"{''.join(vlabels)}amix=inputs={len(vlabels)}:normalize=0,apad=whole_dur={DUR}[vox]")
filters.append(f"{''.join(slabels)}amix=inputs={len(slabels)}:normalize=0,apad=whole_dur={DUR}[sfx]")
filters.append("[vox]asplit=3[voxA][voxK1][voxK2]")
# ducking: ambience ~-12 dB, sfx ~-8 dB while someone speaks
filters.append("[amb][voxK1]sidechaincompress=threshold=0.02:ratio=8:attack=40:release=500:makeup=1[ambd]")
filters.append("[sfx][voxK2]sidechaincompress=threshold=0.03:ratio=4:attack=20:release=300:makeup=1[sfxd]")
filters.append(f"[voxA][sfxd][ambd]amix=inputs=3:normalize=0,atrim=0:{DUR},asetpts=N/SR/TB[pre]")

os.makedirs(f"{ROOT}/audio/mix", exist_ok=True)
pre = f"{ROOT}/audio/mix/ep{EP}-pre.wav"
subprocess.run(["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", ";".join(filters), "-map", "[pre]", "-ar", "48000", "-ac", "2", "-c:a", "pcm_s24le", pre], check=True)

# two-pass loudnorm to -14 LUFS / -1.5 dBTP
r = subprocess.run(["ffmpeg", "-hide_banner", "-i", pre, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"], capture_output=True, text=True)
m = json.loads(re.findall(r"\{[^{}]*\"input_i\"[^{}]*\}", r.stderr)[-1])
af = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}"
      f":measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true,aresample=48000,atrim=0:{DUR},apad=whole_dur={DUR}")
out = f"{ROOT}/audio/mix/ep{EP}-mix.wav"
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", pre, "-af", af, "-ar", "48000", "-ac", "2", "-c:a", "pcm_s16le", out], check=True)
os.remove(pre)
r = subprocess.run(["ffmpeg", "-hide_banner", "-i", out, "-af", "loudnorm=I=-14:TP=-1.5:print_format=json", "-f", "null", "-"], capture_output=True, text=True)
m2 = json.loads(re.findall(r"\{[^{}]*\"input_i\"[^{}]*\}", r.stderr)[-1])
dur = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", out], capture_output=True, text=True).stdout.strip()
print(f"mix: {out}  duration {dur}s  integrated {m2['input_i']} LUFS  true peak {m2['input_tp']} dBTP")

# cue sheet
desc = {
    "cloth_grip": "cloth + grip (hand clamps the wrist)", "tray_clang": "metal tray hits the floor", "cord_rustle": "alarm cord rustle",
    "blood_drop": "blood drop on tile", "cart_wheels": "hearse-cart wheels pass in the corridor", "package_thud": "cloth package lands on steel",
    "ampule_clink": "glass ampule rolls + clink", "paper_slide": "paper strip slides", "register_pull": "old register pulled from the shelf + dust",
    "page_flips": "page flips", "knee_thud": "knee hits the floor", "sheet_slide": "sheet slides / is pushed", "handle_click": "outer door handle goes down",
    "cord_drop": "alarm cord released, ring taps", "drawer_rumble": "morgue drawer rumble", "lid_close": "drawer lid slides shut", "door_open": "outer door opens + corridor hum",
}
with open(f"{ROOT}/audio/cues-{EP}.md", "w") as f:
    f.write(f"# Sound cues — Bölüm {EP}\n\nAll SFX are procedural (tools/make_sfx.py, no credits, royalty-free). Swap any file in `audio/sfx/` with the same name and re-run `python3 tools/mix_audio.py {EP}`.\n\n")
    f.write(f"Ambience (whole episode): `{D['amb']}.wav` — low drone + faint fluorescent buzz, ducked ~-12 dB under speech.\n\n| Time (s) | File | Gain (dB) | Description |\n|---|---|---|---|\n")
    for t, name, gain in D["sfx"]:
        f.write(f"| {t:.2f} | `{name}.wav` | {gain} | {desc.get(name, '')} |\n")
    f.write("\n## Voice lines\n\n| Line | Speaker | Start (s) | Length (s) | File |\n|---|---|---|---|---|\n")
    for ln in D["lines"]:
        v = D["voice"][str(ln["n"])]
        f.write(f"| {ln['n']} | {ln['speaker']} | {ln['start']:.2f} | {v['dur']:.2f} | `{v['file']}` |\n")
print("wrote", f"{ROOT}/audio/cues-{EP}.md")
