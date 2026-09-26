#!/usr/bin/env python3
"""Validate the whole prompt pool.

1. Every JSON file in the repo parses.
2. Characters and scenes carry every required field, ids are unique, references resolve.
3. Every scene is composed with its default cast AND with every character that fits each
   role, on Seedance 2.0 and 2.5, and each prompt is checked against the house rules:
   spine order, runtime and reference ceilings, CRITICAL cap, no leftover placeholders,
   no aspect ratio, no CJK characters, no character labels or tool names in the body,
   NO BGM present, every cast member acting in ACTION TIMING.

Exit code 0 = clean. Warnings do not fail the run.
"""
import glob
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import seedance_compose as sc  # noqa: E402

errors, warnings = [], []
ASPECT_RE = re.compile(r"\b(16|9|4|3|1|21|2\.39|2\.35)\s*:\s*(9|16|3|4|1|5)\b")
CJK_RE = re.compile(r"[぀-ヿ㐀-䶿一-鿿가-힯]")
CHAR_FIELDS = ["id", "category", "label_en", "label_tr", "viral_tr", "pronoun", "human", "descriptor", "permanent", "asset"]
SCENE_FIELDS = ["id", "label_en", "label_tr", "hook_tr", "platforms", "roles", "default_cast", "critical",
                "location_label", "location", "geometry", "first_frame", "shots", "camera", "light", "colour",
                "atmosphere", "physics", "acting", "audio", "locks_chain"]
BANNED_IN_BODY = ["Seedance", "Higgsfield", "aspect ratio"]


def err(msg):
    errors.append(msg)


def warn(msg):
    warnings.append(msg)


def check_json_files():
    for path in glob.glob(os.path.join(sc.ROOT, "**", "*.json"), recursive=True):
        if "/.git/" in path:
            continue
        try:
            with open(path, encoding="utf-8") as f:
                json.load(f)
        except Exception as e:  # noqa: BLE001
            err(f"{os.path.relpath(path, sc.ROOT)}: invalid JSON — {e}")


def check_characters(chars, lib):
    descs = {}
    for cid, c in chars.items():
        for f in CHAR_FIELDS:
            if f not in c:
                err(f"character {cid}: missing field '{f}'")
        if c.get("pronoun") not in sc.PRONOUNS:
            err(f"character {cid}: pronoun must be one of {list(sc.PRONOUNS)}")
        words = len(c.get("asset", "").split())
        if not 45 <= words <= 110:
            err(f"character {cid}: asset has {words} words, target 45–110")
        d = c.get("descriptor", "")
        if not d.startswith("the "):
            err(f"character {cid}: descriptor should start with 'the '")
        if d in descs:
            err(f"character {cid}: descriptor duplicates {descs[d]}")
        descs[d] = cid
        if "{" in c.get("asset", ""):
            err(f"character {cid}: asset contains a placeholder")
        if c.get("category") not in json.load(open(os.path.join(sc.SEEDANCE, "characters.json"), encoding="utf-8"))["meta"]["categories"]:
            err(f"character {cid}: unknown category {c.get('category')}")


def check_scene_static(s, chars, lib):
    sid = s.get("id", "?")
    for f in SCENE_FIELDS:
        if f not in s:
            err(f"scene {sid}: missing field '{f}'")
    if s.get("style", "large_format") not in lib["style_prefixes"]:
        err(f"scene {sid}: unknown style {s.get('style')}")
    if s["camera"]["register"] not in lib["camera_registers"]:
        err(f"scene {sid}: unknown camera register")
    if s["atmosphere"]["mode"] not in ("air", "clean", "fog"):
        err(f"scene {sid}: unknown atmosphere mode")
    if s.get("lens_defense") and s["lens_defense"] not in lib["lens_defense"]:
        err(f"scene {sid}: unknown lens_defense")
    for c in s["critical"]:
        if "lib" in c and c["lib"] not in lib["critical_library"]:
            err(f"scene {sid}: unknown critical lib block {c['lib']}")
    if len(s["critical"]) > 4:
        err(f"scene {sid}: {len(s['critical'])} CRITICAL blocks, cap is 4")
    for role, cid in s["default_cast"].items():
        if role not in s["roles"]:
            err(f"scene {sid}: default_cast role {role} not in roles")
        if cid not in chars:
            err(f"scene {sid}: default_cast {role} -> unknown character {cid}")
    for role, spec in s["roles"].items():
        for oid in spec.get("only", []):
            if oid not in chars:
                err(f"scene {sid}: role {role} 'only' names unknown character {oid}")
    blob = json.dumps(s, ensure_ascii=False)
    for m in sc.TOKEN_RE.finditer(blob):
        if m.group(1) not in s["roles"]:
            err(f"scene {sid}: token {m.group(0)} refers to an undefined role")
    ladder = {step["fov"] for step in lib["lens_ladder"]}
    for i, sh in enumerate(s["shots"], 1):
        fov = sh["lens"].split(" ")[0]
        if fov not in ladder:
            err(f"scene {sid}: shot {i} FOV {fov} is off the lens ladder")
        if "(" not in sh["lens"] or "mm" not in sh["lens"] and "fisheye" not in sh["lens"]:
            err(f"scene {sid}: shot {i} lens must be 'FOV° (NNmm) name'")
        if "beat" not in sh and "beats" not in sh:
            err(f"scene {sid}: shot {i} has no beat")
    total = sum(sh["dur"] for sh in s["shots"])
    if total > 15:
        warn(f"scene {sid}: {total}s only fits Seedance 2.5")
    if s.get("slowmo"):
        if not (0 <= s["slowmo"]["start"] < s["slowmo"]["end"] <= total):
            err(f"scene {sid}: slowmo window outside the runtime")
    if s.get("lipsync") and not s.get("audio_ref"):
        err(f"scene {sid}: lipsync scene needs audio_ref")


def check_prompt(label, res, scene, cast, lib, version):
    p = res["prompt"]
    prof = lib["version_profiles"][version]
    pos = -1
    for marker in sc.SPINE_MARKERS:
        i = p.find(marker)
        if i == -1:
            err(f"{label}: spine slot '{marker}' missing")
            continue
        if i < pos:
            err(f"{label}: spine slot '{marker}' out of order")
        pos = i
    if not p.startswith(("1 continuous shot", f"{len(scene['shots'])} shots")):
        err(f"{label}: header must open the prompt")
    if res["runtime"] > prof["max_runtime_s"]:
        err(f"{label}: runtime {res['runtime']}s over the {version} ceiling")
    if res["image_refs"] > prof["max_image_refs"]:
        err(f"{label}: {res['image_refs']} image refs over the {version} ceiling")
    if re.search(r"\{[A-Za-z_.]+\}", p):
        err(f"{label}: unreplaced placeholder {re.search(r'{[A-Za-z_.]+}', p).group(0)}")
    if ASPECT_RE.search(p):
        err(f"{label}: aspect ratio found '{ASPECT_RE.search(p).group(0)}'")
    if CJK_RE.search(p):
        err(f"{label}: CJK characters in the prompt body")
    if re.search(r"\bno music\b", p, re.I):
        err(f"{label}: write NO BGM, not 'no music'")
    if "NO BGM" not in p:
        err(f"{label}: NO BGM missing")
    for word in BANNED_IN_BODY:
        if word.lower() in p.lower():
            err(f"{label}: '{word}' must not appear in the prompt body")
    for ch in cast.values():
        if re.search(r"\b" + re.escape(ch["label_en"]) + r"\b", p):
            err(f"{label}: character label '{ch['label_en']}' leaks into the prompt body")
    action = p[p.find("ACTION TIMING:"):p.find("PHYSICS:")]
    for role, ch in cast.items():
        if ch["descriptor"] not in action and sc.cap_first(ch["descriptor"]) not in action:
            err(f"{label}: {ch['descriptor']} ({role}) has no action in ACTION TIMING")
    if re.search(r"\b(she|he|it) (she|he|it)\b", p):
        err(f"{label}: doubled pronoun")
    words = res["words"]
    if words > 1800:
        warn(f"{label}: {words} words — long, check for duplication")
    if words < 700:
        warn(f"{label}: {words} words — short")


def main():
    check_json_files()
    lib, chars, scenes = sc.load_all()
    check_characters(chars, lib)
    combos = 0
    for sid, s in scenes.items():
        check_scene_static(s, chars, lib)
        casts = [dict(s["default_cast"])]
        for role in s["roles"]:
            for ch in sc.fitting_characters(s, role, chars):
                c = dict(s["default_cast"])
                c[role] = ch["id"]
                if len(set(c.values())) == len(c):
                    casts.append(c)
        seen = set()
        for c in casts:
            key = tuple(sorted(c.items()))
            if key in seen:
                continue
            seen.add(key)
            for version in ("2.0", "2.5"):
                label = f"{sid} [{version}] cast={','.join(f'{k}={v}' for k, v in sorted(c.items()))}"
                try:
                    cast = sc.resolve_cast(s, chars, c)
                    res = sc.compose(s, cast, lib, version=version, negative=True)
                except Exception as e:  # noqa: BLE001
                    err(f"{label}: compose failed — {e}")
                    continue
                check_prompt(label, res, s, cast, lib, version)
                combos += 1
    manifest = json.load(open(os.path.join(sc.ROOT, "manifest.json"), encoding="utf-8"))
    listed = {u.split("/main/", 1)[1] for u in manifest["data_urls"].values()}
    for path in glob.glob(os.path.join(sc.SEEDANCE, "**", "*.json"), recursive=True):
        rel = os.path.relpath(path, sc.ROOT)
        if rel not in listed:
            err(f"manifest.json does not list {rel}")
    for rel in listed:
        if not os.path.exists(os.path.join(sc.ROOT, rel)):
            err(f"manifest.json lists missing file {rel}")
    unused = set(chars) - {cid for s in scenes.values() for cid in s["default_cast"].values()}
    if unused:
        warn(f"characters not in any default cast: {sorted(unused)}")

    print(f"characters: {len(chars)}  scenes: {len(scenes)}  composed prompts checked: {combos}")
    for w in warnings:
        print("WARN ", w)
    for e in errors:
        print("ERROR", e)
    import subprocess
    parity = subprocess.run([sys.executable, os.path.join(sc.ROOT, "tools", "test_app_parity.py")], capture_output=True, text=True)
    print(parity.stdout.strip())
    if parity.returncode != 0:
        err("web app composer output differs from tools/seedance_compose.py — see tools/test_app_parity.py")
    app = os.path.join(sc.ROOT, "app", "seedance-studio.html")
    if os.path.exists(app):
        import build_app
        with open(app, encoding="utf-8") as f:
            if build_app.build_page() not in f.read():
                err("app/seedance-studio.html is out of date — run python3 tools/build_app.py")
    print("OK" if not errors else f"{len(errors)} error(s)")
    sys.exit(1 if errors else 0)


if __name__ == "__main__":
    main()
