#!/usr/bin/env python3
"""Map a screenshot onto the site's two printing plates.

    python3 tools/mono-duotone.py assets/inkstone-card.jpg inkstone-card

WHY NOT REGENERATE THESE
------------------------
The mono-color skill allows a supplied image to be cropped, isolated, enlarged,
simplified or screened — the reproduction is mechanical, the subject is not
replaced. These four are real screenshots of James's applications: they are the
EVIDENCE that the products exist and look like that. Converting them to coarse
halftone would destroy the one thing a product shot is for, and regenerating
them would be inventing a user interface. So they are separated onto the plates
and nothing else is done to them.

THE SEPARATION
--------------
Luminance is mapped onto a ramp from the substrate at white to Cobalt at black,
so the paper shows through the highlights exactly as it does on every other
plate. Terracotta is NOT used here: the accent plate has one job on this site
(signal — current state, emphasis) and a screenshot is not a signal. Spending
the accent on decoration is the failure the skill's plate-role rule exists to
prevent.

Screening is deliberately clean rather than coarse: `image_treatment` for
contemporary work is "clean plate separation", and a 12px UI label under a
60-line-per-inch dot is not a product shot, it is a texture.
"""

import sys
import pathlib
import numpy as np
from PIL import Image

SUBSTRATE = np.array([0xF5, 0xF1, 0xE8], dtype=np.float32)   # paper
INK = np.array([0x21, 0x48, 0xB8], dtype=np.float32)         # Cobalt
DEEP = np.array([0x12, 0x25, 0x5E], dtype=np.float32)        # where the ink pools

# Rec.709 luma, then a mild S-curve: screenshots are mostly mid-grey UI and a
# straight map leaves them flat and unreadable once the hue is gone.
GAMMA = 0.86


def duotone(im):
    a = np.asarray(im.convert("RGB")).astype(np.float32) / 255.0
    y = 0.2126 * a[:, :, 0] + 0.7152 * a[:, :, 1] + 0.0722 * a[:, :, 2]
    y = np.clip(y, 0, 1) ** GAMMA
    y = y[:, :, None]
    # paper -> cobalt -> deep, so shadows read as pooled ink rather than as a
    # flat colour wash
    mid = np.where(y > 0.5, SUBSTRATE * (2 * y - 1) + INK * (2 - 2 * y),
                            INK * (2 * y) + DEEP * (1 - 2 * y))
    return Image.fromarray(np.clip(mid, 0, 255).astype(np.uint8))


def main():
    src, stem = sys.argv[1], sys.argv[2]
    im = duotone(Image.open(src))
    out = pathlib.Path("assets") / (stem + ".webp")
    im.save(out, "WEBP", quality=88, method=6)
    print("%-20s %dx%d  %dKB" % (stem, im.width, im.height, out.stat().st_size // 1024))


if __name__ == "__main__":
    main()
