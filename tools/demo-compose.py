#!/usr/bin/env python3
"""Set a screen recording on the desk, and move the camera over it.

    python3 tools/demo-compose.py <in.mov> <stem> \
        --kf "0:-.12,-.12,1.12,1.12  2.0:.02,.05,.52,.40  5.5:same ..." \
        [--w 1024] [--trim 1.2] [--secs 12] [--fps 30]

WHY THERE IS A CAMERA AT ALL
----------------------------
The recording is real: the app is really being driven, and what is on screen is
what the app really does. But a 1920pt window played back in a 473px row is a
5x reduction and 13pt text lands at 2-3px — the same arithmetic that made the
first set of stills useless. A demo nobody can read is not a demo.

So the frame follows the action. Wide when the point is "this is an application
window sitting on a desk", tight when the point is a slider, a list row or a
paragraph. The keyframes are written by hand against the driver script's own
timings, which is possible because the driver is what produced the events —
the timeline is known, not guessed.

COORDINATES
-----------
Keyframe rectangles are FRACTIONS OF THE WINDOW, not pixels: `0,0,1,1` is the
window exactly, `-.12,-.12,1.12,1.12` pulls back onto the desk around it. Two
reasons: the same keyframes survive a re-record at a different window size, and
"a bit outside the window" is a thing you can write down.

Every rectangle is fitted to 16:10 by growing its short side, never by cutting:
the rectangle was chosen for what is inside it.
"""

import math
import pathlib
import subprocess
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

AR = 16 / 10
RADIUS = 14
DESK_FILL = 0.80          # window's share of the desk at full pull-back


def ease(t):
    return 0.5 - 0.5 * math.cos(math.pi * t)


def parse_kf(spec):
    out = []
    for chunk in spec.replace("\n", " ").split():
        t, rect = chunk.split(":")
        out.append((float(t), [float(v) for v in rect.split(",")]))
    return sorted(out, key=lambda k: k[0])


def at(kfs, t):
    if t <= kfs[0][0]:
        return kfs[0][1]
    if t >= kfs[-1][0]:
        return kfs[-1][1]
    for i in range(len(kfs) - 1):
        (t0, a), (t1, b) = kfs[i], kfs[i + 1]
        if t0 <= t <= t1:
            u = ease((t - t0) / (t1 - t0)) if t1 > t0 else 0
            return [a[j] + (b[j] - a[j]) * u for j in range(4)]
    return kfs[-1][1]


def fit(rect, bounds):
    """Grow the short side to 16:10, then slide back inside the plate."""
    x0, y0, x1, y1 = rect
    W, H = bounds
    w, h = x1 - x0, y1 - y0
    if w / h < AR:
        w = h * AR
    else:
        h = w / AR
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    x0, x1, y0, y1 = cx - w / 2, cx + w / 2, cy - h / 2, cy + h / 2
    if x0 < 0: x1, x0 = x1 - x0, 0
    if y0 < 0: y1, y0 = y1 - y0, 0
    if x1 > W: x0, x1 = x0 - (x1 - W), W
    if y1 > H: y0, y1 = y0 - (y1 - H), H
    return (max(0.0, x0), max(0.0, y0), min(float(W), x1), min(float(H), y1))


def read_index(raw):
    """(t, w, h, offset) per captured frame.

    The capture runs as fast as the window server will hand frames over — about
    20/s — and the output is a constant 30. Rather than resample the pictures,
    every output frame picks the nearest captured one BY TIME. The content then
    updates at capture rate while the CAMERA still moves at 30, which is the
    right way round: a jerky pan is far more visible than a UI that redraws at
    20Hz, because a UI mostly is not redrawing at all."""
    idx, off = [], 0
    for line in pathlib.Path(raw).with_suffix(".idx").read_text().split("\n"):
        if not line.strip():
            continue
        t, w, h = line.split()
        w, h = int(w), int(h)
        idx.append((float(t), w, h, off))
        off += w * h * 4
    return idx


def main():
    a = sys.argv[1:]
    src, stem = a[0], a[1]
    kfs = parse_kf(a[a.index("--kf") + 1])
    OUT_W = int(a[a.index("--w") + 1]) if "--w" in a else 1024
    secs = float(a[a.index("--secs") + 1]) if "--secs" in a else 12.0
    fps = int(a[a.index("--fps") + 1]) if "--fps" in a else 30
    OUT_H = round(OUT_W / AR)

    idx = read_index(src)
    if not idx:
        raise SystemExit("no frames in %s" % src)
    # The desk is sized from the LARGEST frame: Candela's panel grows when you
    # open a display's own page, and a plate sized from frame 0 would clip it.
    vw = max(f[1] for f in idx)
    vh = max(f[2] for f in idx)
    blob = pathlib.Path(src).open("rb")

    # The desk: big enough that the window is DESK_FILL of it at full pull-back.
    pw = max(vw / DESK_FILL, (vh / DESK_FILL) * AR)
    pw, ph = int(round(pw)), int(round(pw / AR))
    ox, oy = (pw - vw) // 2, (ph - vh) // 2

    desk = Image.open("assets/src/desk.png").convert("RGB").resize((pw, ph), Image.LANCZOS)

    # The window's shadow never moves, so it is painted into the desk once.
    blur, alpha = 34, 120
    pad = blur * 3
    sh = Image.new("RGBA", (vw + pad * 2, vh + pad * 2), (0, 0, 0, 0))
    ImageDraw.Draw(sh).rounded_rectangle([pad, pad, pad + vw, pad + vh],
                                         radius=RADIUS, fill=(4, 8, 26, alpha))
    sh = sh.filter(ImageFilter.GaussianBlur(blur))
    desk = desk.convert("RGBA")
    desk.alpha_composite(sh, (ox - pad, oy - pad + 26))
    desk = desk.convert("RGB")

    n_frames = int(round(secs * fps))

    out_mp4 = pathlib.Path("assets") / (stem + ".mp4")
    enc = subprocess.Popen(
        ["ffmpeg", "-y", "-v", "error", "-f", "rawvideo", "-pix_fmt", "rgb24",
         "-s", "%dx%d" % (OUT_W, OUT_H), "-framerate", str(fps), "-i", "-",
         "-c:v", "libx264", "-profile:v", "high", "-pix_fmt", "yuv420p",
         "-crf", "23", "-preset", "slow", "-movflags", "+faststart", "-an",
         str(out_mp4)], stdin=subprocess.PIPE)

    first = None
    made = 0
    cursor = 0
    for i in range(n_frames):
        t = i / fps
        while cursor + 1 < len(idx) and abs(idx[cursor + 1][0] - t) <= abs(idx[cursor][0] - t):
            cursor += 1
        ft, fw, fh, off = idx[cursor]
        blob.seek(off)
        shot = Image.frombuffer("RGBA", (fw, fh), blob.read(fw * fh * 4), "raw", "RGBA", 0, 1)
        plate = desk.copy()
        # The window carries its OWN alpha — rounded corners, and the empty
        # margin the window server includes. Compositing through it is why
        # nothing that was behind the window can ever appear in the film.
        plate.paste(shot, (ox, oy), shot)
        rect = at(kfs, t)
        px = [ox + rect[0] * vw, oy + rect[1] * vh, ox + rect[2] * vw, oy + rect[3] * vh]
        frame = plate.resize((OUT_W, OUT_H), Image.LANCZOS, box=fit(px, (pw, ph)))
        if first is None:
            first = frame.copy()
        enc.stdin.write(frame.tobytes())
        made += 1

    enc.stdin.close()
    enc.wait()
    blob.close()

    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(out_mp4),
                    "-c:v", "libvpx-vp9", "-crf", "34", "-b:v", "0", "-row-mt", "1",
                    "-pix_fmt", "yuv420p", "-an",
                    str(pathlib.Path("assets") / (stem + ".webm"))], check=True)
    first.save(pathlib.Path("assets") / (stem + ".webp"), "WEBP", quality=90, method=6)

    webm = pathlib.Path("assets") / (stem + ".webm")
    print("%-20s %dx%d  %d frames  mp4 %dKB  webm %dKB"
          % (stem, OUT_W, OUT_H, made, out_mp4.stat().st_size // 1024,
             webm.stat().st_size // 1024))


if __name__ == "__main__":
    main()
