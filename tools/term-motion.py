#!/usr/bin/env python3
"""Set a RECORDED terminal session on the same card the stills use.

    python3 tools/term-motion.py <frames dir> <stem> <x0,y0,x1,y1> [--secs 9] [--w 1000]

WHY THIS EXISTS ALONGSIDE app-motion.py
---------------------------------------
app-motion.py pans over one still, and for an application that is exactly
right: the thing being shown is a window, and the question a reader has is
"what am I looking at". AI KEY is not a window. It is text arriving in a
terminal, and the only honest picture of it is the text arriving. A slow zoom
over a finished transcript shows a wall of Chinese moving sideways and says
nothing the still did not already say.

So this one takes REAL frames — `screencapture -l<window>` in a loop while a
real `/key` question runs — and lays each one on the same paper, with the same
shadow, the same aperture and the same cobalt hairline that app-crop.py draws.
A still and a frame of the video are the same object; only the contents move.

TIME IS NOT LINEAR, AND THAT IS THE POINT
-----------------------------------------
The capture is ~5fps of a session that took two minutes, and most of those
frames are identical: the model thinks for a long while with only a spinner
moving. Playing them back evenly would give eight seconds of a blinking cursor
and half a second of the answer.

So frames are kept by CHANGE, not by clock. Consecutive frames whose cropped
region differs by less than THRESHOLD mean levels are dropped, and what is left
is resampled evenly to the target count. The result runs at the speed the
CONTENT changes, which is the speed a reader cares about. It is a time-lapse
and it is labelled as one on the page rather than passed off as real time.

The last frame is then held for TAIL of the duration, because the final state
is the one worth reading and a loop that snaps away from it is a loop nobody
can read.
"""

import importlib.util
import pathlib
import shutil
import subprocess
import sys
import tempfile

import numpy as np
from PIL import Image


def _load(name):
    """app-crop.py / app-motion.py have hyphens, so they load by path."""
    path = pathlib.Path(__file__).resolve().parent / (name + ".py")
    spec = importlib.util.spec_from_file_location(name.replace("-", "_"), path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


_motion = _load("app-motion")
build_mat = _motion.build_mat
FPS = _motion.FPS
AR = _motion.AR

# Mean absolute difference, in levels out of 255, below which two consecutive
# frames count as the same picture. 0.35 was measured on this capture: the
# spinner alone moves ~0.1, one new line of text moves ~0.6.
THRESHOLD = 0.35
TAIL = 0.18          # share of the running time spent holding the last frame
# ...and the same frame again at the very start. Frame 0 is the poster, and the
# poster is the whole picture for a reader with prefers-reduced-motion set, so
# it has to be the FINISHED answer rather than the empty screen the session
# actually began on. It costs nothing in the loop: the clip already wraps from
# the last frame to the first, and with both of them being the same frame the
# wrap has nothing to show — what a viewer sees is the result, then a replay of
# how it arrived.
HEAD = 0.10


def keyframes(paths, box):
    """The frames where something actually changed, in order."""
    kept, prev = [], None
    for p in paths:
        arr = np.asarray(Image.open(p).convert("L").crop(box), dtype=np.int16)
        if prev is None or np.abs(arr - prev).mean() >= THRESHOLD:
            kept.append(p)
            prev = arr
    return kept


def main():
    a = sys.argv[1:]
    src, stem, box = pathlib.Path(a[0]), a[1], tuple(int(v) for v in a[2].split(","))
    secs = float(a[a.index("--secs") + 1]) if "--secs" in a else 9.0
    W = int(a[a.index("--w") + 1]) if "--w" in a else 1000
    # Both dimensions even: libx264 refuses an odd height under yuv420p, and
    # 1000/1.6 is 625. Rounded down so the card never grows past what was asked.
    W -= W % 2
    H = round(W / AR)
    H -= H % 2

    paths = sorted(src.glob("*.png"))
    if not paths:
        sys.exit("❌ %s 里没有帧" % src)

    kept = keyframes(paths, box)
    # Frame 0 is the poster — what a reader sees before the video plays, and the
    # whole picture under prefers-reduced-motion. The opening of a real session
    # is a blank screen and a couple of tool-call lines with local paths in
    # them, which is a bad first picture and none of a reader's business, so the
    # clip starts at the frame the answer starts on.
    skip = int(a[a.index("--skip") + 1]) if "--skip" in a else 0
    if skip:
        kept = kept[skip:] or kept[-1:]
    total = int(round(secs * FPS))
    head = int(round(total * HEAD))
    tail = int(round(total * TAIL))
    moving = max(1, total - head - tail)
    # Hold the end, replay, hold the end again.
    picks = [kept[-1]] * head
    picks += [kept[min(len(kept) - 1, int(i * len(kept) / moving))] for i in range(moving)]
    picks += [kept[-1]] * tail

    mat, (mx, my, iw, ih), hole = build_mat(W, H)
    tmp = pathlib.Path(tempfile.mkdtemp(prefix="term-"))
    try:
        cache = {}
        for n, p in enumerate(picks):
            if p not in cache:
                view = Image.open(p).convert("RGB").crop(box).resize((iw, ih), Image.LANCZOS)
                frame = mat.copy()
                frame.paste(view, (mx, my), hole)
                cache[p] = frame.convert("RGB")
            cache[p].save(tmp / ("%05d.png" % n))

        out_mp4 = pathlib.Path("assets") / (stem + ".mp4")
        out_webm = pathlib.Path("assets") / (stem + ".webm")
        common = ["ffmpeg", "-y", "-loglevel", "error", "-framerate", str(FPS),
                  "-i", str(tmp / "%05d.png")]
        # Same settings as app-motion.py, minus `-tune stillimage`: this one is
        # not a slow pan over flat UI, it is text appearing, and the tune's
        # long keyframe interval smeared the moment a paragraph lands.
        subprocess.run(common + [
            "-c:v", "libx264", "-profile:v", "high", "-pix_fmt", "yuv420p",
            "-crf", "21", "-preset", "slow",
            "-movflags", "+faststart", "-an", str(out_mp4)], check=True)
        subprocess.run(common + [
            "-c:v", "libvpx-vp9", "-crf", "34", "-b:v", "0", "-row-mt", "1",
            "-pix_fmt", "yuv420p", "-an", str(out_webm)], check=True)

        # Frame 0 IS the poster, as in app-motion.py: whatever the reader sees
        # before the video starts is the frame the video starts on.
        Image.open(tmp / "00000.png").convert("RGB").save(
            pathlib.Path("assets") / (stem + ".webp"), "WEBP", quality=90, method=6)
    finally:
        shutil.rmtree(tmp, ignore_errors=True)

    print("%-20s %dx%d  %d captured -> %d changed -> %d frames  mp4 %dKB  webm %dKB"
          % (stem, W, H, len(paths), len(kept), len(picks),
             out_mp4.stat().st_size // 1024, out_webm.stat().st_size // 1024))


if __name__ == "__main__":
    main()
