#!/usr/bin/env python3
"""Generate the desktop the demo windows sit on.

    python3 tools/wallpaper.py [out.png] [W] [H]

WHY NOT A REAL WALLPAPER
------------------------
The obvious move is a macOS system wallpaper, and it is wrong here. The site is
a printed object — pale substrate, two inks, no photograph outside the porthole
— and dropping a photographic desktop behind four thumbnails puts two visual
languages on one page. The windows would look pasted in.

So the desktop is built from the SAME two inks: cobalt as the field, one
terracotta bloom as the accent, no third colour. It reads as a desktop because
of its shape (a soft diagonal light, a vignette) rather than because of what it
is a picture of.

WHAT IS IN IT
  * a diagonal ramp from deep cobalt to the ink's own mid density
  * two radial blooms — a cool one upper-left, a terracotta one lower-right at
    low weight, so the accent is present and never a second field
  * a wide, very low-contrast diagonal sweep, the thing that makes an abstract
    wallpaper read as lit rather than as a gradient
  * grain, at the same amplitude the paper uses, so a window's edge does not
    sit on a mathematically flat plane
"""

import sys
import numpy as np
from PIL import Image, ImageFilter

DEEP = np.array([0x0A, 0x14, 0x38], dtype=np.float32)   # cobalt, pooled
MID = np.array([0x21, 0x48, 0xB8], dtype=np.float32)    # cobalt at full
COOL = np.array([0x6E, 0x93, 0xE0], dtype=np.float32)   # cobalt, thinned
WARM = np.array([0xC6, 0x5F, 0x38], dtype=np.float32)   # terracotta


def radial(xx, yy, cx, cy, r):
    d = np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2) / r
    return np.clip(1 - d, 0, 1) ** 2


def main():
    out = sys.argv[1] if len(sys.argv) > 1 else "assets/src/desk.png"
    W = int(sys.argv[2]) if len(sys.argv) > 2 else 3200
    H = int(sys.argv[3]) if len(sys.argv) > 3 else 2000

    y, x = np.mgrid[0:H, 0:W].astype(np.float32)
    xx, yy = x / W, y / H

    # the field: a diagonal ramp, deep at the bottom right
    t = np.clip(0.35 * xx + 0.85 * yy, 0, 1)[..., None]
    img = DEEP * t + MID * (1 - t)

    # a cool bloom upper left — where the light comes from
    b1 = radial(xx, yy, 0.18, 0.12, 0.95)[..., None]
    img = img + (COOL - img) * (b1 * 0.55)

    # one terracotta bloom, kept low: an accent, never a second field
    b2 = radial(xx, yy, 0.92, 0.88, 0.72)[..., None]
    img = img + (WARM - img) * (b2 * 0.22)

    # the sweep. A soft band across the diagonal at a couple of percent is what
    # separates "lit surface" from "gradient".
    band = np.exp(-(((xx - yy) * 1.6 - 0.15) ** 2) / 0.06)[..., None]
    img = img + (255 - img) * (band * 0.06)

    # vignette, so a window placed anywhere has something to sit against
    vig = radial(xx, yy, 0.5, 0.5, 1.25)[..., None]
    img = img * (0.80 + 0.20 * vig)

    im = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8))
    im = im.filter(ImageFilter.GaussianBlur(1.2))

    rng = np.random.default_rng(20260901)
    a = np.asarray(im).astype(np.int16) + rng.integers(-4, 5, size=(H, W, 1))
    Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).save(out)
    print("%s  %dx%d" % (out, W, H))


if __name__ == "__main__":
    main()
