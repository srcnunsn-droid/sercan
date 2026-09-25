#!/usr/bin/env python3
"""Seedance cinematic prompt composer.

Assembles a full 16-slot Seedance prompt from:
  seedance/library.json      invariant spine blocks
  seedance/characters.json   character identity locks
  seedance/scenes/*.json     viral scene recipes

Examples:
  python3 tools/seedance_compose.py --list-scenes
  python3 tools/seedance_compose.py --list-characters --category turkiye
  python3 tools/seedance_compose.py --scene rooftop_gap_jump
  python3 tools/seedance_compose.py --scene rooftop_gap_jump --cast A=fan_01 --version 2.5 --negative
  python3 tools/seedance_compose.py --fits rooftop_gap_jump
  python3 tools/seedance_compose.py --random 5 --seed 7
  python3 tools/seedance_compose.py --build-examples
"""
import argparse
import glob
import json
import os
import random
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SEEDANCE = os.path.join(ROOT, "seedance")

PRONOUNS = {
    "she": {"sub": "she", "obj": "her", "pos": "her", "ref": "herself"},
    "he": {"sub": "he", "obj": "him", "pos": "his", "ref": "himself"},
    "it": {"sub": "it", "obj": "it", "pos": "its", "ref": "itself"},
}
TOKEN_RE = re.compile(r"\{([A-D])(?:\.(sub|obj|pos|ref|Sub|Obj|Pos|Ref))?\}")
SPINE_MARKERS = [
    "NO ON-SCREEN TEXT — CRITICAL",
    "GEOMETRY MAP:",
    "FIRST FRAME:",
    "OPTICS:",
    "CAMERA:",
    "LIGHT:",
    "COLOUR:",
    "ATMOSPHERE:",
    "ACTION TIMING:",
    "PHYSICS:",
    "ACTING:",
    "AUDIO:",
    "LOCKS:",
]


def load_json(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def load_all():
    lib = load_json(os.path.join(SEEDANCE, "library.json"))
    chars = {c["id"]: c for c in load_json(os.path.join(SEEDANCE, "characters.json"))["characters"]}
    scenes = {}
    for path in sorted(glob.glob(os.path.join(SEEDANCE, "scenes", "*.json"))):
        data = load_json(path)
        for s in data["scenes"]:
            s["_file"] = os.path.basename(path)
            s["_category"] = data.get("category", "")
            scenes[s["id"]] = s
    return lib, chars, scenes


def fmt_t(x):
    return f"{x:.1f}"


def fmt_total(x):
    return str(int(x)) if float(x).is_integer() else f"{x:.1f}"


def cap_first(s):
    return s[:1].upper() + s[1:] if s else s


def fix_sentence_caps(text):
    """Capitalise a descriptor or pronoun that lands at the start of a sentence."""
    return re.sub(r"(^|[.!?]\s+|\n)(the|she|he|it|her|his|its)\b",
                  lambda m: m.group(1) + cap_first(m.group(2)), text)


def substitute(text, cast):
    def repl(m):
        role, form = m.group(1), m.group(2)
        if role not in cast:
            raise KeyError(f"role {role} used but not cast")
        ch = cast[role]
        if form is None:
            return ch["descriptor"]
        val = PRONOUNS[ch["pronoun"]][form.lower()]
        return cap_first(val) if form[0].isupper() else val
    return fix_sentence_caps(TOKEN_RE.sub(repl, text))


def cast_list_phrase(descs):
    if len(descs) == 1:
        return descs[0]
    return ", ".join(descs[:-1]) + " and " + descs[-1]


def parse_cast_arg(arg):
    out = {}
    if not arg:
        return out
    for part in arg.split(","):
        role, _, cid = part.partition("=")
        out[role.strip().upper()] = cid.strip()
    return out


def resolve_cast(scene, chars, overrides=None):
    cast_ids = dict(scene["default_cast"])
    if overrides:
        cast_ids.update(overrides)
    cast = {}
    for role in sorted(scene["roles"]):
        cid = cast_ids.get(role)
        if cid not in chars:
            raise KeyError(f"scene {scene['id']}: role {role} -> unknown character '{cid}'")
        cast[role] = chars[cid]
    ids = [c["id"] for c in cast.values()]
    if len(set(ids)) != len(ids):
        raise ValueError(f"scene {scene['id']}: two roles share one character, pick distinct characters")
    return cast


def role_fits(scene, role, ch):
    spec = scene["roles"][role]
    need = spec.get("needs", "human")
    if need == "human" and not ch["human"]:
        return False
    if need == "creature" and ch["human"]:
        return False
    if "only" in spec:
        return ch["id"] in spec["only"]
    fit = spec.get("fit", ["any"])
    return "any" in fit or ch["category"] in fit or ch["id"] in fit


def compose(scene, cast, lib, version="2.0", style=None, negative=False):
    prof = lib["version_profiles"][version]
    S = lambda t: substitute(t, cast)
    humans = [c for c in cast.values() if c["human"]]
    shots = scene["shots"]
    n = len(shots)
    total = round(sum(sh["dur"] for sh in shots), 3)
    if total > prof["max_runtime_s"]:
        raise ValueError(f"{scene['id']}: {total}s exceeds the {version} ceiling of {prof['max_runtime_s']}s — split into two prompts")
    long_form = total > 15

    # ---------- reference list ----------
    refs, tags, idx = [], {}, 1
    for role in sorted(cast):
        ch = cast[role]
        k = prof["refs_per_human"] if ch["human"] else prof["refs_per_creature"]
        if k == 1:
            kinds = ["identity reference"]
        elif ch["human"]:
            kinds = ["front identity plate", "profile plate", "wardrobe and detail plate"][:k]
        else:
            kinds = ["front plate", "side plate"][:k]
        role_tags = []
        for kind in kinds:
            refs.append(f"@Image {idx} — {ch['label_en']} ({kind})")
            role_tags.append(f"@Image {idx}")
            idx += 1
        tags[role] = role_tags
    extra_lines = []
    for ex in scene.get("extra_assets", []):
        refs.append(f"@Image {idx} — {ex['label_en']}")
        extra_lines.append(f"@Image {idx} = {S(ex['asset'])}")
        idx += 1
    loc_tag = f"@Image {idx}"
    refs.append(f"{loc_tag} — location: {scene['location_label']}")
    image_count = idx
    audio_tag = None
    if scene.get("audio_ref"):
        audio_tag = "@Audio 1"
        refs.append(f"{audio_tag} — {scene['audio_ref']}")
    if image_count > prof["max_image_refs"]:
        raise ValueError(f"{scene['id']}: {image_count} image refs exceed the {version} ceiling of {prof['max_image_refs']}")

    # ---------- 1 HEADER ----------
    slow = scene.get("slowmo")
    if n == 1:
        header = f"1 continuous shot. Total {fmt_total(total)} seconds, no cuts, no transitions."
    else:
        t, parts = 0.0, []
        for i, sh in enumerate(shots, 1):
            parts.append(f"shot {i} runs {fmt_t(t)}–{fmt_t(t + sh['dur'])}s")
            t += sh["dur"]
        budget = f"{n} shots across {fmt_total(total)} seconds" if long_form else f"{n} shots"
        header = f"{budget}. Total {fmt_total(total)} seconds — " + ", ".join(parts) + ". Hard cuts between them, no transitions, no dissolves."
        if scene.get("lipsync"):
            header += " The cuts fall between words and never inside a word."
    if slow:
        header += f" Brief slow motion on {slow['what']} only, {fmt_t(slow['start'])}–{fmt_t(slow['end'])}s. All other footage real-time, no overcranking, no ramping, no other speed change."
    elif n == 1:
        header += " Real-time throughout, no slow motion, no speed change."
    else:
        header += " All shots real-time, no slow motion, no overcranking, no ramping, no speed change anywhere in this sequence."
    if scene.get("header_nobgm"):
        header += " " + lib["audio"]["nobgm_header"]

    # ---------- 2 STYLE PREFIX ----------
    sp = lib["style_prefixes"][style or scene.get("style", "large_format")]
    technical = lib["style_shared"]["technical"]
    if scene.get("strobe"):
        technical += " " + lib["style_shared"]["strobe_quarantine"]
    skin = lib["style_shared"]["skin"] if humans else lib["style_shared"]["skin_creature"]
    style_block = "\n\n".join([lib["style_shared"]["style"], sp["operating_style"], sp["texture"], skin, technical])

    # ---------- 4 CRITICAL ----------
    crit = []
    for c in scene.get("critical", []):
        if "lib" in c:
            text = lib["critical_library"][c["lib"]]["text"]
            text = text.replace("{CAST_LIST}", cast_list_phrase([ch["descriptor"] for ch in cast.values()] + c.get("also", [])))
            for key, val in c.get("vars", {}).items():
                text = text.replace("{" + key + "}", val)
            crit.append(S(text))
        else:
            crit.append(S(f"{c['title']} — CRITICAL: {c['text']}"))
    if len(crit) > 4:
        raise ValueError(f"{scene['id']}: {len(crit)} CRITICAL blocks, cap is 4")

    # ---------- 5 ASSETS ----------
    assets = []
    for role in sorted(cast):
        ch = cast[role]
        tag = " + ".join(tags[role])
        this_scene = S(scene["roles"][role]["this_scene"])
        match = "100% match to the reference." if len(tags[role]) == 1 else "100% match to the references — front, profile and detail agree."
        anchor = f" {tags[role][0]} is the anchor reference for this figure in every beat." if long_form else ""
        assets.append(f"{tag} = {ch['asset']} THIS SCENE: {cap_first(this_scene)} {match}{anchor}")
    assets.extend(extra_lines)
    assets.append(f"{loc_tag} = the location — {S(scene['location'])}")

    # ---------- 6 / 7 ----------
    geometry = "GEOMETRY MAP: " + S(scene["geometry"])
    first = "FIRST FRAME: " + S(scene["first_frame"]) + " No empty establishing frame, no static hold before the action starts."

    # ---------- 8 OPTICS ----------
    optics = ["OPTICS: " + scene.get("optics", lib["optics_default"])]
    for i, sh in enumerate(shots, 1):
        label = "LENS LOCK" if n == 1 else f"LENS LOCK SHOT {i}"
        optics.append(f"{label} = {sh['lens']}, {S(sh['lens_note'])}.")
    optics.append("No focal drift mid-shot.")
    if scene.get("lens_defense"):
        optics.append(lib["lens_defense"][scene["lens_defense"]])
    optics = "\n".join(optics)

    # ---------- 9 CAMERA ----------
    reg = scene["camera"]["register"]
    camera = lib["camera_registers"][reg]["text"]
    if scene["camera"].get("extra"):
        camera += " " + S(scene["camera"]["extra"])
    if reg != "locked":
        camera += " " + lib["camera_never_settles"]

    # ---------- 10 LIGHT & COLOUR ----------
    light = "LIGHT: " + S(scene["light"])
    colour = "COLOUR: " + S(scene["colour"])

    # ---------- 11 ATMOSPHERE ----------
    atm = scene["atmosphere"]
    atmosphere = lib["atmosphere"][atm["mode"]].replace("{PLANES}", S(atm["planes"]))
    if atm["mode"] != "clean":
        if atm.get("source"):
            atmosphere += " " + lib["atmosphere"]["source_close"].replace("{SOURCE}", S(atm["source"]))
        else:
            atmosphere += " " + lib["atmosphere"]["no_source_close"]

    # ---------- 12 ACTION TIMING ----------
    lines, t = ["ACTION TIMING:"], 0.0
    for i, sh in enumerate(shots, 1):
        beats = sh.get("beats") or [{"dur": sh["dur"], "text": sh["beat"]}]
        if abs(sum(b["dur"] for b in beats) - sh["dur"]) > 1e-6:
            raise ValueError(f"{scene['id']}: shot {i} beat durations do not sum to the shot duration")
        for j, b in enumerate(beats):
            lens_tag = f"LENS {sh['lens'].split(' (')[0]}, " if long_form else ""
            label = f"SHOT {i}, {sh['name']}" if n > 1 else sh["name"]
            if j > 0:
                label = f"{label}, continuing"
            lines.append(f"{fmt_t(t)}–{fmt_t(t + b['dur'])}s ({lens_tag}{label}): {S(b['text'])}")
            t += b["dur"]
        if i < n:
            lines.append(f"{fmt_t(t)}s HARD CUT")
    action = "\n".join(lines)

    # ---------- 13 / 14 ----------
    physics = "PHYSICS: " + S(scene["physics"])
    if humans:
        acting = lib["acting_base"] + " " + S(scene["acting"])
    else:
        acting = lib["acting_base_creature"] + " " + S(scene["acting"])

    # ---------- 15 AUDIO ----------
    if audio_tag:
        audio = lib["audio"]["attached_track"].replace("{AUDIO_TAG}", audio_tag)
    else:
        audio = "AUDIO: " + S(scene["audio"])
        if scene.get("nobgm", True):
            audio += " " + lib["audio"]["nobgm"]

    # ---------- 16 LOCKS ----------
    ls = lib["locks_standard"]
    locks = ["LOCKS: " + S(scene["locks_chain"]), ls["identity"], ls["wardrobe"]]
    markers = []
    for ch in cast.values():
        markers.append(f"{ch['descriptor']} — " + "; ".join(ch["permanent"]))
    locks.append("Permanent markers hold in every frame: " + " | ".join(markers) + ".")
    if n > 1:
        locks.append(ls["angles"])
    if not scene.get("light_changes"):
        locks.append(ls["light"])
    locks.append(ls["air"] if atm["mode"] != "clean" else "The air stays clean throughout.")
    if long_form:
        locks.append("The lens lock of each beat holds for that beat; the staging of the geometry map holds for the whole sequence.")
    if humans:
        locks.append(lib["skin_protection"])
    locks.append(lib["negation_tail_locked"] if reg == "locked" else lib["negation_tail"])
    locks = " ".join(locks)

    blocks = [header, style_block, lib["no_text_block"]] + crit + ["\n\n".join(assets), geometry, first,
                                                                   optics, camera, light + "\n" + colour,
                                                                   atmosphere, action, physics, acting, audio, locks]
    prompt = "\n\n".join(blocks)

    neg = None
    if negative:
        groups = dict(lib["negative_prompt"])
        if scene.get("negative_extra"):
            groups["scene"] = scene["negative_extra"]
        if scene.get("lipsync") or scene.get("strobe") or scene.get("slowmo"):
            groups["motion"] = [m for m in groups["motion"] if m != "slow motion unless stated"]
        neg = "\n".join(f"{k}: " + ", ".join(v) for k, v in groups.items())

    title = f"**{scene['label_en']} — {fmt_total(total)}s**"
    return {
        "title": title,
        "refs": refs,
        "prompt": prompt,
        "negative": neg,
        "words": len(prompt.split()),
        "image_refs": image_count,
        "runtime": total,
        "conflict": scene.get("conflict_note"),
    }


def render_markdown(res):
    out = []
    if res["conflict"]:
        out.append(res["conflict"])
        out.append("")
    out.append(res["title"])
    out.append("")
    for i, r in enumerate(res["refs"], 1):
        out.append(f"{i}. {r}")
    out.append("")
    out.append("```")
    out.append(res["prompt"])
    out.append("```")
    if res["negative"]:
        out.append("")
        out.append("```")
        out.append("NEGATIVE PROMPT")
        out.append(res["negative"])
        out.append("```")
    return "\n".join(out) + "\n"


def fitting_characters(scene, role, chars):
    return [c for c in chars.values() if role_fits(scene, role, c)]


def random_cast(scene, chars, rng):
    cast, used = {}, set()
    for role in sorted(scene["roles"]):
        pool = [c for c in fitting_characters(scene, role, chars) if c["id"] not in used]
        if not pool:
            pool = [chars[scene["default_cast"][role]]]
        pick = rng.choice(pool)
        cast[role] = pick["id"]
        used.add(pick["id"])
    return cast


def build_examples(lib, chars, scenes):
    index = ["# Hazır Seedance Promptları", "",
             "Bu klasör `tools/seedance_compose.py --build-examples` ile otomatik üretilir. Elle düzenlemeyin; sahne veya karakter JSON'unu düzenleyip yeniden üretin.", "",
             "| Sahne | Kategori | Süre | Oyuncu(lar) | 2.0 | 2.5 |", "|---|---|---|---|---|---|"]
    for version in ("2.0", "2.5"):
        os.makedirs(os.path.join(ROOT, "prompts", version), exist_ok=True)
    for sid, scene in scenes.items():
        cast = resolve_cast(scene, chars)
        for version in ("2.0", "2.5"):
            res = compose(scene, cast, lib, version=version, negative=True)
            with open(os.path.join(ROOT, "prompts", version, f"{sid}.md"), "w", encoding="utf-8") as f:
                f.write(render_markdown(res))
        who = ", ".join(c["label_tr"] for c in cast.values())
        index.append(f"| {scene['label_tr']} | {scene['_category']} | {fmt_total(res['runtime'])}s | {who} | [2.0](2.0/{sid}.md) | [2.5](2.5/{sid}.md) |")
    with open(os.path.join(ROOT, "prompts", "README.md"), "w", encoding="utf-8") as f:
        f.write("\n".join(index) + "\n")
    build_catalog(chars, scenes)
    return len(scenes)


def build_catalog(chars, scenes):
    cats = load_json(os.path.join(SEEDANCE, "characters.json"))["meta"]["categories"]
    out = ["# Seedance Katalog", "",
           "Otomatik üretilir (`tools/seedance_compose.py --build-examples`). Karakter veya sahne eklediğinde yeniden üret.", "",
           f"**{len(chars)} karakter · {len(scenes)} sahne**", "", "## Karakterler", ""]
    for cat, cat_tr in cats.items():
        out += [f"### {cat_tr} (`{cat}`)", "", "| ID | Karakter | Neden viral | Kalıcı işaretler |", "|---|---|---|---|"]
        for c in chars.values():
            if c["category"] == cat:
                out.append(f"| `{c['id']}` | {c['label_tr']} | {c['viral_tr']} | {'; '.join(c['permanent'])} |")
        out.append("")
    out += ["## Sahneler", "", "| ID | Sahne | Süre | Kamera | Hook | Rol → uygun karakterler |", "|---|---|---|---|---|---|"]
    for s in scenes.values():
        total = fmt_total(sum(sh["dur"] for sh in s["shots"]))
        roles = "<br>".join(f"**{r}**: " + ", ".join(f"`{c['id']}`" for c in fitting_characters(s, r, chars)) for r in sorted(s["roles"]))
        out.append(f"| `{s['id']}` | {s['label_tr']} | {total}s | {s['camera']['register']} | {s['hook_tr']} | {roles} |")
    with open(os.path.join(SEEDANCE, "KATALOG.md"), "w", encoding="utf-8") as f:
        f.write("\n".join(out) + "\n")


def main():
    ap = argparse.ArgumentParser(description="Seedance cinematic prompt composer")
    ap.add_argument("--scene")
    ap.add_argument("--cast", help="role overrides, e.g. A=fan_01,B=his_02")
    ap.add_argument("--version", default="2.0", choices=["2.0", "2.5"])
    ap.add_argument("--style", help="style prefix id from library.json")
    ap.add_argument("--negative", action="store_true", help="append the grouped NEGATIVE PROMPT block")
    ap.add_argument("--out", help="write markdown to this file")
    ap.add_argument("--list-scenes", action="store_true")
    ap.add_argument("--list-characters", action="store_true")
    ap.add_argument("--category")
    ap.add_argument("--fits", metavar="SCENE", help="list characters that fit each role of a scene")
    ap.add_argument("--random", type=int, metavar="N", help="compose N random scene + fitting cast combinations")
    ap.add_argument("--seed", type=int)
    ap.add_argument("--build-examples", action="store_true")
    args = ap.parse_args()

    lib, chars, scenes = load_all()

    if args.list_scenes:
        for s in scenes.values():
            if args.category and s["_category"] != args.category:
                continue
            total = sum(sh["dur"] for sh in s["shots"])
            print(f"{s['id']:<28} {s['_category']:<11} {fmt_total(total):>4}s  {s['label_tr']}")
        return
    if args.list_characters:
        for c in chars.values():
            if args.category and c["category"] != args.category:
                continue
            print(f"{c['id']:<8} {c['category']:<10} {c['label_tr']}")
        return
    if args.fits:
        scene = scenes[args.fits]
        for role in sorted(scene["roles"]):
            ids = [c["id"] for c in fitting_characters(scene, role, chars)]
            print(f"{role}: {', '.join(ids)}")
        return
    if args.build_examples:
        count = build_examples(lib, chars, scenes)
        print(f"wrote {count} scenes x 2 versions to prompts/")
        return
    if args.random:
        rng = random.Random(args.seed)
        pool = [s for s in scenes.values() if not args.category or s["_category"] == args.category]
        chunks = []
        for _ in range(args.random):
            scene = rng.choice(pool)
            cast = resolve_cast(scene, chars, random_cast(scene, chars, rng))
            chunks.append(render_markdown(compose(scene, cast, lib, args.version, args.style, args.negative)))
        text = "\n---\n\n".join(chunks)
    elif args.scene:
        if args.scene not in scenes:
            sys.exit(f"unknown scene '{args.scene}' — run --list-scenes")
        scene = scenes[args.scene]
        overrides = parse_cast_arg(args.cast)
        cast = resolve_cast(scene, chars, overrides)
        for role, ch in cast.items():
            if not role_fits(scene, role, ch):
                print(f"warning: {ch['id']} is outside the suggested fit for role {role}", file=sys.stderr)
        text = render_markdown(compose(scene, cast, lib, args.version, args.style, args.negative))
    else:
        ap.print_help()
        return
    if args.out:
        with open(args.out, "w", encoding="utf-8") as f:
            f.write(text)
        print(f"wrote {args.out}")
    else:
        print(text)


if __name__ == "__main__":
    main()
