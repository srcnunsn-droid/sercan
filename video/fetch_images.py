#!/usr/bin/env python3
"""Higgsfield'da üretilen görselleri indirip video/images/ altına JPG olarak kaydeder."""
import io
import json
import os
import sys
import urllib.request

from PIL import Image

ROOT = os.path.dirname(os.path.abspath(__file__))


def main():
    with open(os.path.join(ROOT, "higgsfield_images.json"), encoding="utf-8") as f:
        manifest = json.load(f)
    out_dir = os.path.join(ROOT, "images")
    os.makedirs(out_dir, exist_ok=True)
    failed = []
    for item in manifest["images"]:
        dst = os.path.join(out_dir, item["file"])
        if os.path.exists(dst):
            print(f"var  {item['file']}")
            continue
        try:
            with urllib.request.urlopen(item["url"], timeout=60) as r:
                data = r.read()
        except Exception as e:  # ağ politikası vb.
            print(f"HATA {item['file']}: {e}")
            failed.append(item["file"])
            continue
        Image.open(io.BytesIO(data)).convert("RGB").save(dst, quality=93, subsampling=0)
        print(f"ok   {item['file']}")
    if failed:
        sys.exit(f"{len(failed)} görsel indirilemedi: {', '.join(failed)}")


if __name__ == "__main__":
    main()
