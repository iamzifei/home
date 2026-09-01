#!/usr/bin/env python3
"""Turn a raw "reading light on" edit into the frame the page crossfades to.

    python3 tools/gen-lit.py  assets/src/scene-wide.png  /tmp/lit-wide-raw.png
    python3 tools/make-lit.py wide

Reads  assets/src/scene-<name>.png        the unlit exposure
       assets/src/scene-<name>-lit-raw.png  the same frame, lamp on, from the
                                            images EDIT endpoint
Writes assets/scene-<name>-lit.webp source PNG

WHY THE LIGHT IS PHOTOGRAPHED AND NOT COMPUTED
----------------------------------------------
It used to be baked per pixel from an inverse-square model, and that took eight
rounds: the pool's size, the albedo reference, the window mask, the colour the
lamp gave every surface. Asking the image model to re-expose the SAME frame with
the lamp on gets all of that for free and correct, because it is one photograph
of a lit room rather than a model of one.

TWO THINGS THE RAW EDIT GETS WRONG, BOTH FIXED HERE
---------------------------------------------------
1. THE WINDOW MUST NOT CHANGE. It is a hole, and a reading lamp cannot alter
   what is outside it — but the edit re-draws it slightly (the moon moved, once
   it vanished). Any difference at all shows up as a flicker in the crossfade.
   So the unlit frame's window is pasted back in, which makes the two frames
   byte-identical there and removes the question.

2. THE LAMP OVER-WARMS EVERYTHING. Measured on the raw edit, the tray went from
   R-B -0.073 unlit to +0.237 lit — a cool grey-blue panel turned tan. A warm
   lamp does warm what it lights, but not across neutral into another material.
   The same one-way floor the old baking pipeline used caps it: it only cools
   what is warmer than the floor, never warms anything, and leaves whatever is
   already bluer untouched.
"""

import pathlib
import sys

import numpy as np
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
LIT_MAX_WARMTH = -0.05      # R-B per unit luminance; the lit pool may approach
                            # neutral but never cross it

# The window aperture in each frame: centre and radii as fractions, plus how far
# the paste-back feathers out.
WINDOW = {
    "wide": dict(cx=0.128, cy=0.290, rx=0.105, ry=0.275, feather=0.30),
    "tall": dict(cx=0.163, cy=0.205, rx=0.130, ry=0.170, feather=0.34),
}


def smoothstep(x):
    x = np.clip(x, 0.0, 1.0)
    return x * x * (3.0 - 2.0 * x)


def window_mask(h, w, cx, cy, rx, ry, feather):
    ys, xs = np.mgrid[0:h, 0:w].astype(np.float64)
    r = np.sqrt(((xs / w - cx) / rx) ** 2 + ((ys / h - cy) / ry) ** 2)
    return smoothstep((1.0 + feather - r) / feather)


def cool_floor(frame, limit):
    """Cap how warm a surface may be. One-way: it only cools."""
    lum = 0.2126 * frame[..., 0] + 0.7152 * frame[..., 1] + 0.0722 * frame[..., 2]
    excess = np.maximum((frame[..., 0] - frame[..., 2]) - limit * lum, 0.0)
    out = frame.copy()
    out[..., 0] -= 0.5 * excess
    out[..., 2] += 0.5 * excess
    return np.clip(out, 0.0, 1.0)


def rb(frame, box):
    h, w, _ = frame.shape
    p = frame[int(box[1] * h):int(box[3] * h), int(box[0] * w):int(box[2] * w)].reshape(-1, 3).mean(0)
    lum = 0.2126 * p[0] + 0.7152 * p[1] + 0.0722 * p[2]
    return lum, p[0] - p[2]


def main(name):
    src = ROOT / "assets" / "src"
    off = np.asarray(Image.open(src / ("scene-%s.png" % name)).convert("RGB")).astype(np.float64) / 255
    raw = Image.open(src / ("scene-%s-lit-raw.png" % name)).convert("RGB")
    if raw.size != (off.shape[1], off.shape[0]):
        raw = raw.resize((off.shape[1], off.shape[0]), Image.LANCZOS)
    lit = np.asarray(raw).astype(np.float64) / 255
    h, w, _ = off.shape

    # Order matters: the floor runs FIRST, then the window is pasted back over
    # it. Done the other way round the floor touches the pasted window too, and
    # the two frames stop being identical there — which is the whole point of
    # pasting it.
    lit = cool_floor(lit, LIT_MAX_WARMTH)
    m = window_mask(h, w, **WINDOW[name])[..., None]
    lit = lit * (1 - m) + off * m                     # the window is a hole: unchanged

    for label, box in {"tray": (.40, .47, .85, .65), "seat back": (.45, .10, .75, .32),
                       "window glass": (.06, .12, .18, .45)}.items():
        lo, ro = rb(off, box); ln, rn = rb(lit, box)
        print("   %-13s lum %.3f -> %.3f    R-B %+0.3f -> %+0.3f" % (label, lo, ln, ro, rn))
    # Check only where the paste is FULL. A >0.98 threshold also catches the
    # feather, where the two frames are meant to be blended — reporting that as
    # a failure is the check being wrong, not the paste.
    full = window_mask(h, w, **WINDOW[name]) >= 1.0
    print("   window: %d px fully pasted, max difference there %.1e   (feathered edge blends by design)"
          % (full.sum(), float(np.abs(lit[full] - off[full]).max())))

    out = src / ("scene-%s-lit.png" % name)
    Image.fromarray((lit * 255).astype(np.uint8)).save(out)
    print("wrote", out.relative_to(ROOT))


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "wide")
