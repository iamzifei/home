#!/usr/bin/env python3
"""Print a mono-color plate on dark stock.

    python3 tools/plate-night.py <plate.webp> [more.webp ...]

Writes `<stem>-night.webp` beside each input.

WHY NOT GENERATE A SECOND SET
The plates are two inks on paper. A dark page does not want a different
picture, it wants THE SAME picture on a different stock — same drawing, same
halftone, same registration. Generating a second set from the model would give
none of those: every call returns a different composition, and the day and
night versions of one plate would visibly disagree about what they show.

So the run is re-inked instead. For every pixel the script solves how much ink
is on the paper and which of the two inks it is, then lays that same coverage
down on the dark ground with the night inks. Paper becomes near-black, the
halftone becomes light dots on dark, and nothing about the drawing moves.

  paper  #F5F1E8 -> #14161C
  cobalt #2148B8 -> #6E93E0   (the same ink, opened up to read on dark stock)
  terra  #C65F38 -> #E0784B

The choice of ink per pixel is by RESIDUAL, not by hue angle: a pale tint of
cobalt and a pale tint of terracotta are both "warm-ish light" and hue is
unstable there, while the distance to each ink's own paper-to-ink line is not.
"""

import pathlib
import sys
import numpy as np
from PIL import Image

DAY_PAPER = np.array([0xF5, 0xF1, 0xE8], dtype=np.float32)
DAY_COBALT = np.array([0x21, 0x48, 0xB8], dtype=np.float32)
DAY_TERRA = np.array([0xC6, 0x5F, 0x38], dtype=np.float32)

NIGHT_PAPER = np.array([0x14, 0x16, 0x1C], dtype=np.float32)
NIGHT_COBALT = np.array([0x6E, 0x93, 0xE0], dtype=np.float32)
NIGHT_TERRA = np.array([0xE0, 0x78, 0x4B], dtype=np.float32)


def coverage(px, ink):
    """How much of `ink` is on the paper, and how well that explains the pixel."""
    # An explicit weighted sum rather than `@`: numpy's matmul on a
    # (H,W,3)·(3,) of this size routes through BLAS and emits divide-by-zero,
    # overflow and invalid warnings here. The result was correct either way,
    # but a tool that always prints warnings is a tool whose warnings get
    # ignored — including the next real one.
    d = (ink - DAY_PAPER).astype(np.float64)
    a = np.clip(((px.astype(np.float64) - DAY_PAPER) * d).sum(-1) / float((d * d).sum()),
                0.0, 1.0)
    fit = DAY_PAPER + a[..., None] * d
    return a, np.linalg.norm(px - fit, axis=-1)


def reink(im):
    px = np.asarray(im.convert("RGB"), dtype=np.float32)
    a_c, r_c = coverage(px, DAY_COBALT)
    a_t, r_t = coverage(px, DAY_TERRA)
    use_terra = (r_t < r_c)[..., None]

    a = np.where(use_terra[..., 0], a_t, a_c)[..., None]
    ink = np.where(use_terra, NIGHT_TERRA, NIGHT_COBALT)
    out = NIGHT_PAPER + a * (ink - NIGHT_PAPER)
    return Image.fromarray(np.clip(out, 0, 255).astype(np.uint8))


def main():
    for src in sys.argv[1:]:
        p = pathlib.Path(src)
        out = p.with_name(p.stem + "-night.webp")
        im = reink(Image.open(p))
        im.save(out, "WEBP", quality=86, method=6)
        print("%-22s -> %-28s %dx%d  %dKB"
              % (p.name, out.name, im.width, im.height, out.stat().st_size // 1024))


if __name__ == "__main__":
    main()
