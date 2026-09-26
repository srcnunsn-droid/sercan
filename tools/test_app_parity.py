#!/usr/bin/env python3
"""Check that the web app's JavaScript composer produces exactly the same markdown
as tools/seedance_compose.py for every scene x fitting cast x version x style.

Needs node on PATH. Exit code 0 = identical everywhere.
"""
import json
import os
import shutil
import subprocess
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import seedance_compose as sc  # noqa: E402

JS = r"""
const C = require(process.argv[1]);
const data = JSON.parse(require('fs').readFileSync(0, 'utf8'));
const out = data.jobs.map(j => {
  const scene = data.scenes[j.scene];
  try {
    const cast = C.resolveCast(scene, data.chars, j.cast);
    return C.renderMarkdown(C.compose(scene, cast, data.lib, j.version, j.style, true));
  } catch (e) { return 'ERROR ' + e.message; }
});
process.stdout.write(JSON.stringify(out));
"""


def main():
    if not shutil.which("node"):
        print("node not found — parity check skipped")
        return 0
    lib, chars, scenes = sc.load_all()
    jobs, expected = [], []
    styles = [None] + list(lib["style_prefixes"])
    for sid, s in scenes.items():
        casts = [dict(s["default_cast"])]
        for role in s["roles"]:
            for ch in sc.fitting_characters(s, role, chars):
                c = dict(s["default_cast"])
                c[role] = ch["id"]
                if len(set(c.values())) == len(c):
                    casts.append(c)
        for i, c in enumerate(casts):
            for version in ("2.0", "2.5"):
                style = styles[i % len(styles)]
                cast = sc.resolve_cast(s, chars, c)
                expected.append(sc.render_markdown(sc.compose(s, cast, lib, version, style, True)))
                jobs.append({"scene": sid, "cast": c, "version": version, "style": style})
    payload = json.dumps({"lib": lib, "chars": chars, "scenes": scenes, "jobs": jobs})
    composer = os.path.join(sc.ROOT, "app", "src", "composer.js")
    run = subprocess.run(["node", "-e", JS, composer], input=payload, capture_output=True, text=True, check=True)
    got = json.loads(run.stdout)
    bad = [(j, e, g) for j, e, g in zip(jobs, expected, got) if e != g]
    print(f"app parity: {len(jobs) - len(bad)}/{len(jobs)} identical")
    for j, e, g in bad[:3]:
        print("MISMATCH", j)
        for a, b in zip(e.splitlines(), g.splitlines()):
            if a != b:
                print("  py:", a[:200])
                print("  js:", b[:200])
                break
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
