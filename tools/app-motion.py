#!/usr/bin/env python3
"""Animate one application shot: the detail, then the whole thing, and back.

    python3 tools/app-motion.py <raw.png> <stem> <x0,y0,x1,y1> [--w 800] [--secs 7]

WHAT THIS IS FOR
----------------
The still on the homepage can answer one question and it answers the right one
— "what does this thing do" — by showing a region close enough to read. What it
cannot show is what the region is a region OF. A 640px crop of a menu-bar panel
and a 1650px crop of a note editor look like the same kind of object in a row of
identical frames, and they are not: one is a popover and the other is a window.

So the frame holds on the readable detail, pulls back until the whole
application is on the card, holds there, and pushes back in. Both questions get
answered by the same 473px box, and the loop closes on the frame it opened with.

WHY NOT REMOTION
----------------
Remotion is a React renderer for video and this is a pan over one still: no
composition, no sequencing, no text. It would add a node project and a headless
Chromium to a site whose whole claim is that it has no dependencies. ffmpeg does
the encode; the frames are cut here, from the same paper and shadow the stills
use, so a still and the first frame of its video are the same picture.

HOW THE MOVE IS BUILT
---------------------
Two images, not one:

  the PLATE    paper, with the whole application window on it — rounded, with
               its shadow. Built once at capture resolution.
  the MAT      the card itself: paper, grain, a rounded aperture at 94%, the
               cobalt hairline. Constant for every frame.

Every frame is a rectangle cut out of the PLATE and set in the MAT's aperture.
At t=0 that rectangle is the detail box, so frame 0 is byte-for-byte the picture
app-crop.py would have made. At t=1 it is the whole plate. Nothing is ever
scaled up past the plate's own resolution, and PIL's `box=` takes floats, so the
travel is sub-pixel rather than stepping a pixel at a time.
"""

import math
import pathlib
import shutil
import subprocess
import sys
import tempfile

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

# app-crop.py has a hyphen in it, like every other tool in here, so it cannot be
# imported by name. Loaded by path rather than renamed or symlinked: the paper,
# the shadow, the corner radius and the aspect fit have to be the SAME code as
# the stills, or a still and the first frame of its video drift apart in ways
# nobody will spot until they are side by side.
def _load_crop():
    import importlib.util
    path = pathlib.Path(__file__).resolve().parent / "app-crop.py"
    spec = importlib.util.spec_from_file_location("app_crop", path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


_crop = _load_crop()
COBALT, MARGIN, RADIUS = _crop.COBALT, _crop.MARGIN, _crop.RADIUS
fit_aspect, paper, round_corners, shadow = (
    _crop.fit_aspect, _crop.paper, _crop.round_corners, _crop.shadow)

AR = 16 / 10
FPS = 30
# The window sits at this fraction of the plate at the widest point of the move.
# Not 1.0: a window that touches the edge of the paper reads as a screenshot
# pasted on, and the point of pulling back is to show the object ON something.
# A tall menu-bar popover in a 16:10 frame leaves paper either side no matter
# what these are — that gap is the truthful part of the shot, it is how small
# the thing actually is.
FILL_W, FILL_H = 0.88, 0.92


def build_plate(raw):
    """Paper, with the whole window on it, rounded and with a shadow.

    The capture's own alpha is the window's shape — macOS已经把圆角烘进去了 — so
    the window is its ALPHA BOUNDING BOX, not the file's dimensions, and the
    corner mask is not reapplied. Getting this wrong is visible immediately and
    was: `round_corners` replaces the alpha channel outright, which turned the
    transparent margin around Candela's 776x1342 capture into an opaque black
    slab, and the pull-back showed a black band down one side of the paper.
    """
    alpha = raw.getchannel("A")
    bbox = alpha.getbbox()
    if bbox and bbox != (0, 0, raw.width, raw.height):
        raw = raw.crop(bbox)
    ww, wh = raw.size
    pw = max(ww / FILL_W, (wh / FILL_H) * AR)
    ph = pw / AR
    pw, ph = int(round(pw)), int(round(ph))
    ox, oy = (pw - ww) // 2, (ph - wh) // 2

    # No grain on the plate. It is paper the same colour as the mat's, but the
    # plate MOVES: grain that scales and slides is dense noise the encoder has to
    # pay for on every frame, and it measured as most of the file. The mat keeps
    # its grain because the mat never moves and costs one keyframe.
    plate = paper(pw, ph, grain=0).convert("RGBA")
    sh, pad = shadow(raw.size)
    plate.alpha_composite(sh, (ox - pad, oy - pad + 10))
    plate.alpha_composite(raw, (ox, oy))
    return plate.convert("RGB"), (ox, oy), bbox or (0, 0, 0, 0)


def build_mat(w, h):
    """The card: paper, the aperture's shadow, the hairline. No content."""
    mat = paper(w, h).convert("RGBA")
    iw, ih = round(w * (1 - MARGIN * 2)), round(h * (1 - MARGIN * 2))
    x, y = (w - iw) // 2, (h - ih) // 2
    sh, pad = shadow((iw, ih))
    mat.alpha_composite(sh, (x - pad, y - pad + 10))
    ImageDraw.Draw(mat).line([(0, h - 2), (w, h - 2)], fill=COBALT + (255,), width=3)

    # The aperture is punched as a mask rather than drawn, so the content can be
    # pasted straight through it and keep the rounded corner.
    hole = Image.new("L", (iw, ih), 0)
    ImageDraw.Draw(hole).rounded_rectangle([0, 0, iw - 1, ih - 1], radius=RADIUS, fill=255)
    return mat, (x, y, iw, ih), hole


def ease(t):
    """Cosine in-out. A linear zoom reads as a machine move; this one settles."""
    return 0.5 - 0.5 * math.cos(math.pi * t)


def timeline(total):
    """hold detail · out · hold whole · in · hold detail.

    The trailing hold is what makes the loop invisible: the last frame and the
    first are the same framing, so the cut has nothing to show."""
    plan = [("hold", 0.0, 0.26), ("out", 0.0, 0.20),
            ("hold", 1.0, 0.28), ("in", 0.0, 0.20), ("hold", 0.0, 0.06)]
    out = []
    for kind, at, share in plan:
        n = max(1, round(total * share))
        for i in range(n):
            if kind == "hold":
                out.append(at)
            elif kind == "out":
                out.append(ease(i / n))
            else:
                out.append(1 - ease(i / n))
    return out[:total] if len(out) >= total else out + [out[-1]] * (total - len(out))


def main():
    a = sys.argv[1:]
    src, stem, box = a[0], a[1], [int(v) for v in a[2].split(",")]
    W = int(a[a.index("--w") + 1]) if "--w" in a else 800
    secs = float(a[a.index("--secs") + 1]) if "--secs" in a else 7.0
    H = round(W / AR)

    raw = Image.open(src).convert("RGBA")
    plate, (ox, oy), bbox = build_plate(raw)
    # The detail box was authored against the untrimmed capture, so it moves with
    # the trim before it moves onto the plate.
    ox, oy = ox - bbox[0], oy - bbox[1]
    mat, (mx, my, iw, ih), hole = build_mat(W, H)

    detail = fit_aspect([box[0] + ox, box[1] + oy, box[2] + ox, box[3] + oy], AR, plate.size)
    whole = [0, 0, plate.width, plate.height]

    frames = timeline(int(round(secs * FPS)))
    tmp = pathlib.Path(tempfile.mkdtemp(prefix="motion-"))
    try:
        for n, t in enumerate(frames):
            rect = [detail[i] + (whole[i] - detail[i]) * t for i in range(4)]
            view = plate.resize((iw, ih), Image.LANCZOS, box=tuple(rect))
            frame = mat.copy()
            frame.paste(view, (mx, my), hole)
            frame.convert("RGB").save(tmp / ("%05d.png" % n))

        out_mp4 = pathlib.Path("assets") / (stem + ".mp4")
        out_webm = pathlib.Path("assets") / (stem + ".webm")
        common = ["ffmpeg", "-y", "-loglevel", "error", "-framerate", str(FPS),
                  "-i", str(tmp / "%05d.png")]
        # -tune stillimage: the picture is a slow pan over flat UI, which is what
        # that tune is for. yuv420p because anything else will not play on iOS.
        # crf 21, not 18: measured on the worst case (ClipStack's dark list, the
        # densest text in the set) the two differ by at most 23/255 on any
        # channel and by nothing a reader can see, for 27% of the bytes.
        subprocess.run(common + [
            "-c:v", "libx264", "-profile:v", "high", "-pix_fmt", "yuv420p",
            "-crf", "21", "-preset", "slow", "-tune", "stillimage",
            "-movflags", "+faststart", "-an", str(out_mp4)], check=True)
        subprocess.run(common + [
            "-c:v", "libvpx-vp9", "-crf", "34", "-b:v", "0", "-row-mt", "1",
            "-pix_fmt", "yuv420p", "-an", str(out_webm)], check=True)

        # Frame 0 IS the poster. Generating it here rather than reusing the
        # still guarantees there is no jump when the video takes over.
        first = Image.open(tmp / "00000.png").convert("RGB")
        first.save(pathlib.Path("assets") / (stem + ".webp"), "WEBP", quality=90, method=6)
    finally:
        shutil.rmtree(tmp, ignore_errors=True)

    print("%-20s %dx%d  %d frames  mp4 %dKB  webm %dKB"
          % (stem, W, H, len(frames), out_mp4.stat().st_size // 1024,
             out_webm.stat().st_size // 1024))


if __name__ == "__main__":
    main()
