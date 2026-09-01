#!/usr/bin/env python3
"""Set a REGION of an application screenshot on a mono-color card.

    python3 tools/app-crop.py <raw.png> <stem> <x0,y0,x1,y1> [--w 1600] [--ar 16:10]

WHY REGIONS AND NOT WHOLE WINDOWS
---------------------------------
Arithmetic, not taste. A row thumbnail on the homepage is ~300 CSS px wide,
which is 600 device px on a retina screen. A 1920pt window captured at 2x is
3840px, so it arrives downscaled 6.4x and 13pt body text lands at 2px. The
picture then proves one thing — "this is a macOS window" — and nothing else.

To read a 13pt line at 13 CSS px inside a 300px box the source region has to be
about 600px wide, i.e. ~300pt of interface. That is three list rows, or one
slider group, or a table. So each shot is chosen as ONE such region that answers
one question about the product, and the region is what gets set on the card.

WHAT IS MONO-COLOR HERE
-----------------------
The card only: substrate, its grain, and one cobalt hairline at the foot. The
pixels of the application are never touched — a halftone or duotone map would
destroy the one thing a product shot is for. Same exemption the window and the
departures board have.

GEOMETRY
--------
The card is `--w` wide and `--ar` tall. The region is scaled to fill the card
minus a 3% paper margin, so the thumbnail is very nearly 1:1 with the capture
and the margin is what makes it read as printed rather than pasted.

Author the region at the card's aspect ratio. `--ar` is enforced by expanding
the SHORT side of the given box around its own centre (never by cutting), so a
box that is close to the aspect keeps everything it was given.
"""

import sys
import pathlib
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

SUBSTRATE = (0xF5, 0xF1, 0xE8)          # design-system/colors.json
COBALT = (0x21, 0x48, 0xB8)
GRAIN = 5
MARGIN = 0.03
RADIUS = 12


def paper(w, h, seed=20260901, grain=GRAIN):
    """Deterministic fibre, so re-running reproduces the same card.

    `grain=0` gives flat substrate — used by app-motion.py for the plate, which
    moves; see the note there."""
    a = np.zeros((h, w, 3), dtype=np.int16) + np.array(SUBSTRATE, dtype=np.int16)
    if grain:
        rng = np.random.default_rng(seed)
        a = a + rng.integers(-grain, grain + 1, size=(h, w, 1))
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))


def shadow(size, blur=20, alpha=48):
    """Tinted to the ink. A neutral black shadow over warm paper reads as a
    composite rather than as an object lying on it."""
    w, h = size
    pad = blur * 3
    layer = Image.new("RGBA", (w + pad * 2, h + pad * 2), (0, 0, 0, 0))
    ImageDraw.Draw(layer).rounded_rectangle(
        [pad, pad, pad + w, pad + h], radius=RADIUS, fill=(18, 37, 94, alpha))
    return layer.filter(ImageFilter.GaussianBlur(blur)), pad


def round_corners(im, radius=RADIUS):
    mask = Image.new("L", im.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, im.width - 1, im.height - 1],
                                           radius=radius, fill=255)
    im = im.convert("RGBA")
    im.putalpha(mask)
    return im


def fit_aspect(box, ar, bounds):
    """Grow the short side around the box's centre until the box is `ar`.

    Growing, never cutting: the box was chosen because of what is inside it, so
    trimming it to the ratio would silently drop the thing the shot is for. If
    growing would run past the edge of the capture the box slides back inside
    instead, and only clamps when the capture itself is too small.
    """
    x0, y0, x1, y1 = box
    W, H = bounds
    w, h = x1 - x0, y1 - y0
    if w / h < ar:
        w = h * ar
    else:
        h = w / ar
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    x0, x1 = cx - w / 2, cx + w / 2
    y0, y1 = cy - h / 2, cy + h / 2
    if x0 < 0: x1, x0 = x1 - x0, 0
    if y0 < 0: y1, y0 = y1 - y0, 0
    if x1 > W: x0, x1 = x0 - (x1 - W), W
    if y1 > H: y0, y1 = y0 - (y1 - H), H
    return [round(max(0, x0)), round(max(0, y0)), round(min(W, x1)), round(min(H, y1))]


def main():
    a = sys.argv[1:]
    src, stem, box = a[0], a[1], [int(v) for v in a[2].split(",")]
    ar_s = a[a.index("--ar") + 1] if "--ar" in a else "16:10"
    # `auto` keeps the box exactly as authored. Used for the detail-page shots,
    # where nothing downstream imposes a shape — only the homepage row does,
    # and that one wants 16:10 so CSS `object-fit: cover` has nothing to cut.
    if ar_s == "auto":
        ar = (box[2] - box[0]) / (box[3] - box[1])
    else:
        an, ad = (float(v) for v in ar_s.split(":"))
        ar = an / ad

    raw = Image.open(src).convert("RGB")
    box = fit_aspect(box, ar, raw.size)
    # Default card width = the region's own width, so the capture is set at 1:1
    # and never resampled up. Upscaling a screenshot is the one thing that
    # cannot be recovered later, and it is exactly what a fixed 1600 would do
    # to a 640px region.
    W = int(a[a.index("--w") + 1]) if "--w" in a else \
        min(1800, round((box[2] - box[0]) / (1 - MARGIN * 2) / 2) * 2)
    H = round(W / ar)
    region = raw.crop(box)

    inner_w = round(W * (1 - MARGIN * 2))
    inner_h = round(H * (1 - MARGIN * 2))
    region = region.resize((inner_w, inner_h), Image.LANCZOS)
    region = round_corners(region)

    card = paper(W, H).convert("RGBA")
    x, y = (W - inner_w) // 2, (H - inner_h) // 2
    sh, pad = shadow(region.size)
    card.alpha_composite(sh, (x - pad, y - pad + 10))
    card.alpha_composite(region, (x, y))
    ImageDraw.Draw(card).line([(0, H - 2), (W, H - 2)], fill=COBALT + (255,), width=3)

    out = pathlib.Path("assets") / (stem + ".webp")
    card.convert("RGB").save(out, "WEBP", quality=90, method=6)
    scale = inner_w / (box[2] - box[0])
    print("%-24s %dx%d  box=%s  scale=%.2f  %dKB"
          % (stem, W, H, box, scale, out.stat().st_size // 1024))


if __name__ == "__main__":
    main()
