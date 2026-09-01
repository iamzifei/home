#!/usr/bin/env python3
"""Pull one frame out of a drive-demo.py capture.

    python3 tools/raw-frame.py <in.raw> <t-seconds> <out.png>

The detail-page stills are cut from the same take as the video, so the two
cannot disagree about what the application looks like.
"""
import pathlib
import sys
from PIL import Image

raw, t_want, out = sys.argv[1], float(sys.argv[2]), sys.argv[3]
idx, off = [], 0
for line in pathlib.Path(raw).with_suffix(".idx").read_text().split("\n"):
    if line.strip():
        t, w, h = line.split()
        idx.append((float(t), int(w), int(h), off))
        off += int(w) * int(h) * 4
t, w, h, o = min(idx, key=lambda f: abs(f[0] - t_want))
with open(raw, "rb") as fh:
    fh.seek(o)
    Image.frombuffer("RGBA", (w, h), fh.read(w * h * 4), "raw", "RGBA", 0, 1).save(out)
print("%s  t=%.2f  %dx%d" % (out, t, w, h))
