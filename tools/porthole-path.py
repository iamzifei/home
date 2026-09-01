#!/usr/bin/env python3
"""Emit the superellipse paths the porthole is drawn from.

    python3 tools/porthole-path.py            # prints every path

SHAPE — measured off photographs, not reasoned about
----------------------------------------------------
Looked at real cabin windows (Bing image search, straight-on interior shots)
before touching the numbers. Two things the previous n=4.6 ring got wrong:

  1. A real window is much ROUNDER than a squircle. The corner radii are close
     to half the width; the sides are barely straight at all. n≈3 reads right;
     n≈4.6 reads as a rounded rectangle.
  2. It is not symmetric top to bottom. Cabin windows are EGG-shaped, fat end
     up: the bottom is narrower and more tightly curved than the top.

So the shape is a superellipse with two modifications, both applied in the
parameter t so the outline stays smooth (no curvature kink anywhere):

  · n is blended from N_BOT at the bottom to N_TOP at the top
  · x is scaled by a factor that falls from 1 at the top to 1-TAPER at the
    bottom

THE THREE RINGS
---------------
    outer   inset 0.0    the bezel's outer silhouette, against the cabin wall
    inner   inset 5.5    where the bezel face rolls over into the throat
    ap      inset 10.5   the glass; the opening is 79% of the frame width

`outer`+`inner` is the bezel face, `inner`+`ap` is the throat ring, each drawn
as ONE `fill-rule="evenodd"` path so the hole is real transparency.

Two more paths come out renormalised into a 0..1 box, for
`clipPathUnits="objectBoundingBox"` on the HTML layers between the SVGs:

    clipThroat   keeps the sliding shade inside the tunnel
    clipAp       keeps the sky inside the glass

clipAp is load-bearing, not tidiness. Because the outline tapers, an inset
rectangle is WIDER than the window near the bottom, and its two bottom corners
show as square tabs on the page — they are outside `outer` down there, so no
amount of ring fill covers them.

WHY NOT border-radius
---------------------
A CSS rounded rectangle's corner is a CIRCULAR ARC: curvature jumps from zero
along the straight side to a constant the instant the arc begins. Any window
outline built that way reads as a rounded rectangle no matter how the radius
is tuned, because the radius is not what is wrong. It also cannot taper.

Drawing it as vector rather than baking a render also removes the ragged edge:
the old frame was a soft render scaled up, and the softness showed at the
aperture.

    |x/a|^n + |y/b|^n = 1
"""

import math

W, H = 100.0, 141.0
N_TOP = 3.4       # the top half: slightly squarer
N_BOT = 2.7       # the bottom half: rounder
TAPER = 0.10      # the bottom is 10% narrower than the top
NODES = 32        # Bezier nodes; deviation from the true curve is checked below

RINGS = [("outer", 0.0), ("inner", 5.5), ("ap", 10.5)]


def egg(cx, cy, a, b, steps=2000):
    """Superellipse with a smoothly blended exponent and a vertical taper.

    t runs anticlockwise from the right. sin(t) > 0 is taken as the TOP half
    (SVG y grows downward, so the y term is negated), and the exponent and the
    taper are both driven by sin(t), which is C-infinity in t — that is what
    keeps the outline free of curvature kinks where the two halves meet.
    """
    pts = []
    for i in range(steps):
        t = 2 * math.pi * i / steps
        ct, st = math.cos(t), math.sin(t)
        up = (st + 1.0) / 2.0                     # 1 at the top, 0 at the bottom
        n = N_BOT + (N_TOP - N_BOT) * up
        x = a * math.copysign(abs(ct) ** (2.0 / n), ct)
        y = -b * math.copysign(abs(st) ** (2.0 / n), st)
        x *= 1.0 - TAPER * (1.0 - up)             # narrow the bottom
        pts.append((cx + x, cy + y))
    return pts


def resample(pts, n):
    """Re-space samples evenly along ARC LENGTH.

    Uniform steps in t bunch up on the flat parts of a superellipse and thin
    out exactly at the corners, which is where a Bezier fit needs nodes most —
    fitting the raw t-samples was off by 1.14 viewBox units. Re-spacing by
    length puts the nodes where the curvature is.
    """
    seg = [math.hypot(pts[(i + 1) % len(pts)][0] - pts[i][0],
                      pts[(i + 1) % len(pts)][1] - pts[i][1])
           for i in range(len(pts))]
    total = sum(seg)
    acc, out, k, run = 0.0, [], 0, 0.0
    for i in range(n):
        target = total * i / n
        while run + seg[k] < target:
            run += seg[k]; k = (k + 1) % len(pts)
        f = (target - run) / seg[k]
        p0, p1 = pts[k], pts[(k + 1) % len(pts)]
        out.append((p0[0] + (p1[0] - p0[0]) * f, p0[1] + (p1[1] - p0[1]) * f))
    return out


def to_path(pts, prec=3):
    """Closed Catmull-Rom through the samples, emitted as cubic Beziers.

    A polyline of the raw samples would need hundreds of points to look smooth
    and would weigh tens of KB inlined; 24 nodes as cubics is about 1 KB per
    ring and is within a fifth of a viewBox unit of the true curve (checked by
    `deviation()` below, which is why the node count can be trusted).
    """
    n = len(pts)
    f = "%%.%df" % prec
    d = ("M " + f + " " + f) % pts[0]
    for i in range(n):
        p0, p1 = pts[i], pts[(i + 1) % n]
        pm, pp = pts[(i - 1) % n], pts[(i + 2) % n]
        c1 = (p0[0] + (p1[0] - pm[0]) / 6.0, p0[1] + (p1[1] - pm[1]) / 6.0)
        c2 = (p1[0] - (pp[0] - p0[0]) / 6.0, p1[1] - (pp[1] - p0[1]) / 6.0)
        d += (" C " + f + " " + f + " " + f + " " + f + " " + f + " " + f) % (
            c1[0], c1[1], c2[0], c2[1], p1[0], p1[1])
    return d + " Z"


def deviation(cx, cy, a, b):
    """Largest distance from the emitted Beziers to the true curve, in viewBox
    units. Reported by main() so the node count is a measurement, not a hope."""
    # Uniform in ARC LENGTH, not in t: sampled uniformly in t the reference
    # polyline is sparse exactly at the corners, and the measurement then
    # reports its own sampling gap (~0.3 units) instead of the fit error.
    dense = resample(egg(cx, cy, a, b, steps=20000), 20000)
    pts = resample(dense, NODES)
    n = len(pts)
    worst = 0.0
    for i in range(n):
        p0, p1 = pts[i], pts[(i + 1) % n]
        pm, pp = pts[(i - 1) % n], pts[(i + 2) % n]
        c1 = (p0[0] + (p1[0] - pm[0]) / 6.0, p0[1] + (p1[1] - pm[1]) / 6.0)
        c2 = (p1[0] - (pp[0] - p0[0]) / 6.0, p1[1] - (pp[1] - p0[1]) / 6.0)
        for k in range(1, 40):
            t = k / 40.0
            u = 1 - t
            bx = u*u*u*p0[0] + 3*u*u*t*c1[0] + 3*u*t*t*c2[0] + t*t*t*p1[0]
            by = u*u*u*p0[1] + 3*u*u*t*c1[1] + 3*u*t*t*c2[1] + t*t*t*p1[1]
            worst = max(worst, min(math.hypot(bx - dx, by - dy) for dx, dy in dense))
    return worst


def main():
    out = {}
    for name, i in RINGS:
        out[name] = resample(egg(W / 2, H / 2, W / 2 - i, H / 2 - i * (H / W),
                                 steps=2000), NODES)

    for name, i in RINGS:
        print("/* %s  inset %.1f */\n%s\n" % (name, i, to_path(out[name])))

    # Two rings renormalised into their own 0..1 bounding box, for the
    # clipPaths that shape the HTML layers sandwiched between the SVGs:
    #   clipThroat  keeps the sliding shade inside the tunnel
    #   clipAp      keeps the sky inside the glass. This one is NOT optional:
    #               the outline tapers, so near the bottom a plain inset
    #               rectangle pokes out past the whole window, and its corners
    #               show as two blue tabs on the page. Covering them with the
    #               ring fills does not work — down there they are outside
    #               `outer` as well.
    for name, label in (("inner", "clipThroat"), ("ap", "clipAp")):
        pts = out[name]
        xs = [q[0] for q in pts]; ys = [q[1] for q in pts]
        x0, x1, y0, y1 = min(xs), max(xs), min(ys), max(ys)
        norm = [((x - x0) / (x1 - x0), (y - y0) / (y1 - y0)) for x, y in pts]
        print("/* %s  (%s, objectBoundingBox) */\n%s\n"
              % (label, name, to_path(norm, prec=5)))

    print("worst deviation from the true curve: %.3f viewBox units (%d nodes)"
          % (deviation(W / 2, H / 2, W / 2, H / 2), NODES))
    ap = RINGS[-1][1]
    print("aperture inset %.1f%%  ->  opening is %d%% of the frame width"
          % (ap, round(100 - ap * 2)))
    print("bottom is %d%% narrower than the top; n runs %.1f (bottom) -> %.1f (top)"
          % (round(TAPER * 100), N_BOT, N_TOP))


if __name__ == "__main__":
    main()
