#!/usr/bin/env python3
"""Set an application screenshot on a mono-color card.

    python3 tools/app-card.py <shot.png> <stem>

WHY A CARD AND NOT A TREATMENT
------------------------------
The screenshots themselves are left completely alone. They are the evidence
that these applications exist and look like this; a halftone or duotone map
destroys the one thing a product shot is for, and it is why the page exempts
them from the two-ink rule along with the window and the departures board.

What IS mono-color is the card the shot lies on: the substrate, its grain, and
one cobalt hairline. The page stays one printed object and the windows stay
four real windows lying on it.

GEOMETRY
--------
Every card is 1600x1000. The raw panels are wildly different shapes — a 780x460
clipboard panel, a 346x680 menu-bar strip — and dropping them straight into
equal cards makes a ragged grid, so each is scaled to a fixed fraction of the
card and set on the same optical centre. The page then crops all four the same.
"""

import sys
import pathlib
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

W, H = 1600, 1000
SUBSTRATE = (0xF5, 0xF1, 0xE8)          # design-system/colors.json
COBALT = (0x21, 0x48, 0xB8)
GRAIN = 5
FILL = 0.82


def paper(seed=20260901):
    """The substrate with a little fibre. Deterministic, so re-running the
    script reproduces the same card rather than a fresh grain pattern."""
    rng = np.random.default_rng(seed)
    a = np.zeros((H, W, 3), dtype=np.int16) + np.array(SUBSTRATE, dtype=np.int16)
    return Image.fromarray(
        np.clip(a + rng.integers(-GRAIN, GRAIN + 1, size=(H, W, 1)), 0, 255).astype(np.uint8))


def shadow(size, blur=26, alpha=54):
    """Tinted to the ink, not to black: a warm page under a neutral black
    shadow reads as a composite rather than as an object lying on paper."""
    w, h = size
    pad = blur * 3
    layer = Image.new("RGBA", (w + pad * 2, h + pad * 2), (0, 0, 0, 0))
    ImageDraw.Draw(layer).rounded_rectangle(
        [pad, pad, pad + w, pad + h], radius=14, fill=(18, 37, 94, alpha))
    return layer.filter(ImageFilter.GaussianBlur(blur)), pad


def main():
    src, stem = sys.argv[1], sys.argv[2]
    shot = Image.open(src).convert("RGBA")
    scale = (H * FILL) / shot.height
    if shot.width * scale > W * 0.88:
        scale = (W * 0.88) / shot.width
    shot = shot.resize((round(shot.width * scale), round(shot.height * scale)), Image.LANCZOS)

    card = paper().convert("RGBA")
    x, y = (W - shot.width) // 2, (H - shot.height) // 2
    sh, pad = shadow(shot.size)
    card.alpha_composite(sh, (x - pad, y - pad + 18))
    card.alpha_composite(shot, (x, y))
    ImageDraw.Draw(card).line([(0, H - 2), (W, H - 2)], fill=COBALT + (255,), width=3)

    out = pathlib.Path("assets") / (stem + ".webp")
    card.convert("RGB").save(out, "WEBP", quality=88, method=6)
    print("%-20s %dx%d  %dKB" % (stem, W, H, out.stat().st_size // 1024))


if __name__ == "__main__":
    main()
