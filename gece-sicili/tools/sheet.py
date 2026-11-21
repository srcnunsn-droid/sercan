#!/usr/bin/env python3
"""Contact sheet: python3 tools/sheet.py dir out.png [cols] [label]"""
import sys, glob, os
from PIL import Image, ImageDraw
d, out = sys.argv[1], sys.argv[2]
cols = int(sys.argv[3]) if len(sys.argv) > 3 else 6
fs = sorted(glob.glob(os.path.join(d, "t*.png")))
ims = [Image.open(f).convert("RGB") for f in fs]
w, h = ims[0].size
rows = (len(ims) + cols - 1) // cols
S = Image.new("RGB", (w * cols, (h + 28) * rows), (20, 20, 28))
dr = ImageDraw.Draw(S)
for i, (f, im) in enumerate(zip(fs, ims)):
    x, y = (i % cols) * w, (i // cols) * (h + 28)
    S.paste(im, (x, y + 28))
    dr.text((x + 6, y + 6), os.path.basename(f)[1:-4] + " s", fill=(220, 240, 240))
S.save(out)
print(S.size)
