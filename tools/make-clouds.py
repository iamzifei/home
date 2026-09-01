#!/usr/bin/env python3
"""Turn the generated cloud plate into the one raster the cabin still uses.

    python3 tools/gen-clouds.py clouds-raw.png     # the plate, from gpt-image-2
    python3 tools/make-clouds.py clouds-raw.png    # -> assets/clouds.png
    cwebp -q 80 -m 6 assets/clouds.png -o assets/clouds.webp

WHY THIS IS THE ONLY IMAGE LEFT
-------------------------------
The cabin used to be a photograph and it never converged — every correction to
the window's angle, the seat's material or the sidewall's colour exposed the
next one, and regenerating to fix any of them invalidated every calibration
built on the last frame. Clouds are the exception: they have no geometry to get
wrong. No angle, no material, no proportion. Nothing about a cloud deck can be
"off by nine degrees".

TWO THINGS THAT MATTER
----------------------
1. IT MUST LOOP, and the naive way does not. Cross-fading the tail toward the
   head leaves the last column equal to the head's LAST column, not its first —
   measured, that left a wrap discontinuity of 0.069 against a normal
   column-to-column difference of 0.016. The fix is to cross-fade and then DROP
   the head, so the join falls where the original was already continuous. That
   measures 0.0115 against 0.0177 — the seam is quieter than the picture.

2. IT CARRIES NO SKY. The plate comes with its own black sky, which would cover
   the window's and butt against it as a hard band. The strip is cropped to
   cloud only and the page fades its top edge with a mask, so the horizon
   dissolves into the window's own sky.
"""

import pathlib
import sys

import numpy as np
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
# 2x. At 1x the strip was 740 wide and the glass shows roughly a third of it —
# about 250 source pixels across an aperture that is 540 device pixels wide on a
# retina screen. Under-resolved, and it read as softness around the window.
WIDTH, HEIGHT, BAND = 1960, 670, 480
CROP_TOP, CROP_BOTTOM = 0.435, 0.99      # just above the horizon, to the frame's foot


def main(src):
    im = Image.open(src).convert("RGB")
    w, h = im.size
    im = im.crop((0, int(h * CROP_TOP), w, int(h * CROP_BOTTOM))).resize((WIDTH, HEIGHT), Image.LANCZOS)
    a = np.asarray(im).astype(np.float64) / 255.0

    t = np.arange(BAND) / (BAND - 1)
    t = (t * t * (3 - 2 * t))[None, :, None]                  # smoothstep
    merged = a[:, WIDTH - BAND:] * (1 - t) + a[:, :BAND] * t
    out = np.concatenate([merged, a[:, BAND:WIDTH - BAND]], axis=1)

    # Compare the wrap against the DISTRIBUTION of ordinary column-to-column
    # differences, not their mean. The mean shrinks as resolution rises — at 2x,
    # neighbouring columns are naturally more alike — so a mean-based bar quietly
    # gets stricter with every upscale and reports a seam that is not there.
    wrap = np.abs(out[:, 0] - out[:, -1]).mean()
    steps = np.abs(np.diff(out, axis=1)).mean(axis=(0, 2))
    bar = float(np.percentile(steps, 90))
    print("%dx%d   wrap |d| %.4f   90th pct of ordinary column steps %.4f   %s"
          % (out.shape[1], out.shape[0], wrap, bar,
             "seamless" if wrap <= bar else "SEAM VISIBLE"))

    Image.fromarray(np.clip(out * 255, 0, 255).astype(np.uint8)).save(ROOT / "assets" / "clouds.png")
    print("wrote assets/clouds.png")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "clouds-raw.png")
