#!/usr/bin/env python3
"""Build the standalone Seedance Stüdyo web app.

Embeds seedance/*.json and app/src/composer.js into app/src/app.html and writes:
  app/seedance-studio.html   full HTML document — double-click to open, works offline
  --page-only PATH           optional: the same page without the document wrapper
                             (used when publishing it as a hosted page)
"""
import argparse
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import seedance_compose as sc  # noqa: E402

APP = os.path.join(sc.ROOT, "app")


def build_page():
    lib, chars, scenes = sc.load_all()
    cats = sc.load_json(os.path.join(sc.SEEDANCE, "characters.json"))["meta"]["categories"]
    for s in scenes.values():
        s.pop("_file", None)
    data = json.dumps({"lib": lib, "chars": chars, "scenes": scenes, "categories": cats},
                      ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
    with open(os.path.join(APP, "src", "composer.js"), encoding="utf-8") as f:
        composer = f.read().replace("</script", "<\\/script")
    with open(os.path.join(APP, "src", "app.html"), encoding="utf-8") as f:
        page = f.read()
    assert "__DATA__" in page and "__COMPOSER__" in page
    return page.replace("__DATA__", data, 1).replace("__COMPOSER__", composer, 1)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--page-only", metavar="PATH")
    args = ap.parse_args()
    page = build_page()
    doc = ('<!doctype html>\n<html lang="tr">\n<head>\n<meta charset="utf-8">\n'
           '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
           '</head>\n<body>\n' + page + '\n</body>\n</html>\n')
    out = os.path.join(APP, "seedance-studio.html")
    with open(out, "w", encoding="utf-8") as f:
        f.write(doc)
    print(f"wrote {os.path.relpath(out, sc.ROOT)} ({len(doc.encode()) // 1024} KB)")
    if args.page_only:
        with open(args.page_only, "w", encoding="utf-8") as f:
            f.write(page)
        print(f"wrote {args.page_only}")


if __name__ == "__main__":
    main()
