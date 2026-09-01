#!/usr/bin/env python3
"""Turn a rendered porthole into a frame asset with a real hole in it.

    python3 tools/porthole-asset.py <in.png> <out.webp> <ground-hex> <contrast>

WHY THE RENDER IS SHOT AGAINST KEYS
-----------------------------------
The first version of this tool keyed the background by "how far is this pixel
from the corner colour". That works on a dark subject and fails completely on
a light one: a cream frame on a cream ground is only a few levels from the
background, so the frame's own body scored as background and was cut away.
Measured, the day asset came out transparent across its entire centre row.

So the render is shot against saturated keys instead - magenta ground, cyan
pane - and the matte becomes exact rather than inferred. Nothing about the
frame's own colour can collide with either key.

THREE STEPS
  1. Matte the ground.  Magenta-ness -> alpha, with the key's contribution
     removed from the surviving pixels so no magenta fringe is left behind.
  2. Find the pane and punch it.  The cyan region gives the opening's box; the
     hole itself is cut as a superellipse on the same curve family the rest of
     the site uses, so the live sky behind lines up exactly with the frame.
  3. RECOLOUR TO THE PAGE.  The render is shot in neutral grey and its
     luminance is remapped onto a ramp built from the page's own ground
     colour. This is what makes the window seamless instead of pasted: the
     frame is not a colour that happens to go with the page, it is the page's
     colour at a different brightness, and one render therefore produces a
     perfectly matched asset for every theme the site has.
  4. Despill and downscale.
"""
import sys
import numpy as np
from PIL import Image

N = 4.6          # the superellipse exponent used everywhere on this site
TARGET_W = 640   # the window is at most 300 CSS px wide


def magenta_key(a, lo=0.16, hi=0.40):
    """Alpha from magenta CHROMA RATIO, not from distance to the key colour.

    Euclidean distance fails on the one case that matters: the frame casts a
    soft shadow onto the key, and a darkened magenta is far from pure magenta
    in RGB while still being entirely background. Keying on distance left that
    shadow opaque and it showed as a dark rectangular halo around the object.

    The ratio (min(R,B) - G) / max(R,B) is unchanged by how dark the pixel is,
    so shadowed key and lit key score the same and both matte out.
    """
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    mx = np.maximum(np.maximum(r, b), 1.0)
    ratio = (np.minimum(r, b) - g) / mx
    return np.clip((ratio - lo) / (hi - lo), 0.0, 1.0)


def superellipse_alpha(w, h, box, feather=1.6):
    x0, x1, y0, y1 = box
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    a, b = (x1 - x0) / 2, (y1 - y0) / 2
    xs = np.arange(w)[None, :] - cx
    ys = np.arange(h)[:, None] - cy
    f = (np.abs(xs / a) ** N + np.abs(ys / b) ** N) ** (1.0 / N)
    return np.clip(0.5 - (f - 1.0) * ((a + b) / 2) / feather, 0.0, 1.0)


def main():
    src, out = sys.argv[1], sys.argv[2]
    gh = sys.argv[3].lstrip("#")
    ground = np.array([int(gh[i:i + 2], 16) for i in (0, 2, 4)], dtype=float)
    contrast = float(sys.argv[4])
    im = Image.open(src).convert("RGB")
    a = np.asarray(im).astype(float)
    h, w, _ = a.shape

    r, g, b = a[..., 0], a[..., 1], a[..., 2]

    # --- 1. the ground -----------------------------------------------------
    key = magenta_key(a)   # not `ground`: that name is the page colour

    # --- 2. the pane -------------------------------------------------------
    cyan_ish = (b - r > 40) & (g - r > 40)
    ys, xs = np.where(cyan_ish)
    if len(xs) < 500:
        raise SystemExit("no pane found: the opening is not cyan enough to key")
    box = (float(np.percentile(xs, 0.5)), float(np.percentile(xs, 99.5)),
           float(np.percentile(ys, 0.5)), float(np.percentile(ys, 99.5)))
    print("  pane  x %.0f-%.0f  y %.0f-%.0f  = %.2f%% %.2f%% %.2f%% %.2f%%"
          % (box[0], box[1], box[2], box[3],
             100 * box[0] / w, 100 * box[2] / h,
             100 * (box[1] - box[0]) / w, 100 * (box[3] - box[2]) / h))
    hole = superellipse_alpha(w, h, box)

    alpha = np.clip(1.0 - np.maximum(key, hole), 0.0, 1.0)
    # Floor the residue. The key never resolves to exactly zero and a 3-7%
    # veil over the whole surround is a visible tint on a dark page.
    alpha = np.clip((alpha - 0.10) / 0.90, 0.0, 1.0)

    # --- 3. recolour to the page -------------------------------------------
    # Normalise the frame's own luminance to 0..1 over its actual range, then
    # lerp a ramp centred on the page ground. Centring on the ground is the
    # whole point: the frame's mean lands on the page's own colour, so the
    # object reads as the wall it is set into rather than as a thing placed
    # on top of it.
    body = alpha > 0.5
    lum = a.mean(axis=2)
    if body.sum() < 1000:
        raise SystemExit("matte produced no frame body")
    lo_l, hi_l = np.percentile(lum[body], 2), np.percentile(lum[body], 98)
    t = np.clip((lum - lo_l) / max(hi_l - lo_l, 1.0), 0.0, 1.0)

    # Anchor the ramp on the frame's own mean, so the mean lands EXACTLY on
    # the page ground rather than near it. Centring on the ground's midpoint
    # instead left the day frame 11 levels dark, which is the difference
    # between a window set into the wall and one stuck onto it.
    span = contrast * 1.62
    t_mean = float(t[body].mean())
    dark = np.clip(ground - span * t_mean, 0, 255)
    rgb = dark + span * t[..., None]

    # --- 4. despill --------------------------------------------------------
    # No despill step is needed any more: the frame's colour is rebuilt from
    # the page ramp rather than carried over from the render, so neither key
    # can leave a fringe in the output.
    rgb = np.clip(rgb, 0, 255)

    img = Image.fromarray(
        np.dstack([rgb, alpha * 255.0]).astype(np.uint8), "RGBA")
    if w > TARGET_W:
        img = img.resize((TARGET_W, round(h * TARGET_W / w)), Image.LANCZOS)
    img.save(out, "WEBP", quality=84, method=6, exact=True)

    mean_body = rgb[body].mean(axis=0)
    print("  %s  %dx%d   frame mean #%02x%02x%02x vs ground #%02x%02x%02x  (delta %d)"
          % (out, img.width, img.height, *mean_body.astype(int), *ground.astype(int),
             int(np.abs(mean_body - ground).max())))
    return box


if __name__ == "__main__":
    main()
