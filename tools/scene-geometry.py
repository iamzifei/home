#!/usr/bin/env python3
"""Measure each cabin scene photograph and emit the geometry the page needs.

    python3 tools/scene-geometry.py
    cwebp -q 82 -m 6 assets/src/scene-wide.png -o assets/scene-wide.webp
    cwebp -q 80 -m 6 assets/src/scene-tall.png -o assets/scene-tall.webp

Reads  assets/src/scene-wide.png, assets/src/scene-tall.png
Writes assets/scene-geometry.css

WHY THE SCENE IS WHOLE AGAIN
----------------------------
The objects were cut apart for a while, so a phone could re-arrange them instead
of cropping a fixed composition. It does not work for this scene, and the reason
is worth keeping: SOME OBJECTS ARE ONLY THEMSELVES IN CONTEXT. A tray table with
the seat cut away from behind it is a grey slab — it read as a closed laptop. A
window with the wall dissolved around it is a hoop floating in the dark, and a
real sidewall does not stop in mid-air, it runs off the edge of the frame.

Give each piece enough context to stay recognisable and the pieces overlap until
together they are the photograph again. So the photograph is the unit.

WHAT SURVIVED FROM THE CUTTING EXPERIMENT, AND IS THE POINT OF THIS FILE
-----------------------------------------------------------------------
1. GEOMETRY IS MEASURED AND EXPORTED, never chosen by eye on the page. Placing
   things by eye in unrelated units is what made the sizes, proportions and
   distances wrong before.
2. THE TRAY'S SURFACE IS A PLANE, expressed as the projective map from a unit
   square onto its four measured corners. An affine fit misses the fourth corner
   by 6% and 10% of the frame — the surface really is in perspective — which is
   why a page laid on it with a rotation picked by eye always looked pasted on.
   With the plane matrix the page LIES on the tray, exactly, at every viewport.

TWO SCENES, NOT ONE CROP. A phone is about 1:2 and a laptop about 2:1; no single
frame survives both. Each orientation gets its own photograph and its own
geometry, and the page's placement follows whichever is showing.
"""

import json
import pathlib

import numpy as np
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
PLANE_PX = 1000.0
TYPE_REF = 92.0        # tuned once on the wide scene; see block()

# The tray's four corners in each frame, clockwise from the far left, read off a
# grid drawn over the photograph itself.
SCENES = {
    "wide": dict(src="scene-wide.png",
                 tray=[(0.328, 0.428), (0.935, 0.470), (0.918, 0.672), (0.312, 0.700)]),
    "tall": dict(src="scene-tall.png",
                 tray=[(0.200, 0.430), (0.960, 0.505), (0.905, 0.800), (0.085, 0.625)]),
}


def plane_matrix(corners, aspect):
    """Projective map from a unit square onto the tray's surface.

    x is a fraction of the frame's WIDTH and y a fraction of its HEIGHT, so y is
    converted into width units first — sharing one uniform scale between them
    without that squashes the plane by the frame's aspect.
    """
    pts = [(x * PLANE_PX, y / aspect * PLANE_PX) for x, y in corners]
    src = [(0, 0), (PLANE_PX, 0), (PLANE_PX, PLANE_PX), (0, PLANE_PX)]
    A, b = [], []
    for (u, v), (x, y) in zip(src, pts):
        A.append([u, v, 1, 0, 0, 0, -u * x, -v * x]); b.append(x)
        A.append([0, 0, 0, u, v, 1, -u * y, -v * y]); b.append(y)
    h = list(np.linalg.solve(np.array(A, float), np.array(b, float))) + [1.0]
    err = max(abs(np.dot(h[0:3], (u, v, 1)) / np.dot(h[6:9], (u, v, 1)) - x)
              for (u, v), (x, y) in zip(src, pts))
    return [round(v, 8) for v in h], err


def block(name, cfg):
    im = Image.open(ROOT / "assets" / "src" / cfg["src"])
    w, h = im.size
    aspect = round(w / h, 5)
    m, err = plane_matrix(cfg["tray"], aspect)
    xs = [p[0] for p in cfg["tray"]]; ys = [p[1] for p in cfg["tray"]]
    print("%-5s %dx%d  aspect %.4f   tray spans x %.3f-%.3f y %.3f-%.3f   plane fit %.4f px"
          % (name, w, h, aspect, min(xs), max(xs), min(ys), max(ys), err))
    # The plane's own scale differs per scene (0.93 wide against 0.49 tall), so a
    # single font-size inside it renders at twice the size in one and half in the
    # other. The type size is derived from the matrix instead of set by hand.
    local = (m[0] ** 2 + m[3] ** 2) ** 0.5
    # TYPE_REF is set once, by eye, on the wide scene — then every other scene
    # inherits it through its own plane scale, so the title reads the same size
    # in both orientations without a second judgement call.
    type_px = round(TYPE_REF / local)
    print("      plane scale %.3f  ->  --desk-type: %dpx" % (local, type_px))
    return ["  --scene-aspect: %s;" % aspect,
            "  --desk-type: %dpx;" % type_px,
            "  --scene-src: url(\"../../assets/scene-%s.webp\");" % name,
            "  --scene-lit: url(\"../../assets/scene-%s-lit.webp\");" % name,
            "  --tray-plane: matrix3d(%s, %s, 0, %s, %s, %s, 0, %s, 0, 0, 1, 0, %s, %s, 0, 1);"
            % (m[0], m[3], m[6], m[1], m[4], m[7], m[2], m[5])]


def main():
    out = ["/* Written by tools/scene-geometry.py — do not edit by hand. */",
           ":root {", "  --plane-px: %.0fpx;" % PLANE_PX]
    out += block("wide", SCENES["wide"])
    out += ["}", "", "@media (max-aspect-ratio: 9 / 8) {", "  :root {"]
    out += ["  " + line for line in block("tall", SCENES["tall"])]
    out += ["  }", "}"]
    (ROOT / "assets" / "scene-geometry.css").write_text("\n".join(out) + "\n")
    print("wrote assets/scene-geometry.css")


if __name__ == "__main__":
    main()
