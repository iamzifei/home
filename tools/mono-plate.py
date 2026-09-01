#!/usr/bin/env python3
"""Turn a mono-color generation into a page-ready plate.

    python3 tools/mono-plate.py <in.png> <out-stem> <width>

WHY THIS EXISTS
---------------
The image model returns the plate as a PHOTOGRAPH OF A SHEET on a grey surface,
complete with a cast shadow — which the mono-color skill explicitly forbids
("flat, front-facing paper canvas with no mockup, frame, desk, or cast shadow")
and which is useless as a web asset, because the page needs ink and paper edge
to edge. Regenerating did not fix it on the first pass and would have cost four
more calls; cropping to the sheet is deterministic and takes milliseconds.

HOW THE SHEET IS FOUND
----------------------
Not by brightness. The surround is a NEUTRAL grey and the substrate is a WARM
beige, so the two are close in luminance and far apart in R−B:

    pale beige #F5F1E8  ->  R−B = +13
    neutral surround    ->  R−B ≈  0

So the mask is `R - B > WARM`, which is invariant to how brightly the sheet was
lit — the same reason the porthole matte keyed on chroma ratio rather than on
distance from the background. The bounding box then uses a 0.5% percentile on
each axis so a few stray warm pixels in the surround cannot drag an edge out.

SUBSTRATE NORMALISATION
-----------------------
The photographed sheet is never exactly #F5F1E8. The paper is shifted onto the
exact substrate so that every plate on the page shares one ground and the CSS
can butt against it without a seam.
"""

import sys
import pathlib
import numpy as np
from PIL import Image

SUBSTRATE = (0xF5, 0xF1, 0xE8)   # design-system/colors.json :: substrate_pale_beige
WARM = 6                         # R−B above this is paper, not surround
TRIM = 0.005                     # percentile trimmed off each axis of the mask


def crop_to_sheet(im):
    a = np.asarray(im.convert("RGB")).astype(np.int16)
    warm = (a[:, :, 0] - a[:, :, 2]) > WARM
    if warm.mean() < 0.15:                     # no mockup: the plate fills the frame
        return im, False
    ys, xs = np.where(warm)
    y0, y1 = np.quantile(ys, [TRIM, 1 - TRIM]).astype(int)
    x0, x1 = np.quantile(xs, [TRIM, 1 - TRIM]).astype(int)
    return im.crop((x0, y0, x1, y1)), True


def normalise(im):
    """Shift the paper onto the exact substrate without touching the ink.

    The correction is a single offset taken from the paper's own mode, applied
    to the whole image — a per-channel scale would drag the cobalt with it.
    """
    a = np.asarray(im.convert("RGB")).astype(np.float32)
    warm = (a[:, :, 0] - a[:, :, 2]) > WARM
    light = warm & (a[:, :, 0] > 180)
    if light.sum() < 500:
        return im
    paper = np.array([np.median(a[:, :, c][light]) for c in range(3)])
    a = np.clip(a + (np.array(SUBSTRATE) - paper), 0, 255)
    return Image.fromarray(a.astype(np.uint8))


def main():
    src, stem, width = sys.argv[1], sys.argv[2], int(sys.argv[3])
    im = Image.open(src)
    im, cropped = crop_to_sheet(im)
    im = normalise(im)
    h = round(im.height * width / im.width)
    im = im.resize((width, h), Image.LANCZOS)
    out = pathlib.Path("assets") / (stem + ".webp")
    im.save(out, "WEBP", quality=86, method=6)
    print("%-14s %s  %dx%d  %dKB%s"
          % (stem, out, width, h, out.stat().st_size // 1024,
             "  (cropped off the mockup)" if cropped else ""))


if __name__ == "__main__":
    main()
