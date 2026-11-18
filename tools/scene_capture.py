"""Film a STAGED SCENE: a fixed screen rectangle, but only the windows of the
apps that belong in it.

    import scene_capture as sc
    rec = sc.SceneRecorder(rect=(x, y, w, h), owners={"TextEdit", "ClipStack"},
                           out="take.raw")
    rec.start(); ...drive the demo...; rec.stop.set(); rec.join()

WHY THIS EXISTS NEXT TO drive-demo.py
-------------------------------------
drive-demo.py films ONE window by id. That was right for "here is the panel",
and wrong for "here is the feature taking effect", which almost always involves
a second window: ClipStack pastes INTO a document, Candela's Dark Mode changes
the windows AROUND it. A single-window capture cannot show either.

`screencapture -R` would show both, and everything else at those coordinates
too (the desktop, other apps' windows — the 2026-09-01 test leaked customer
text that way). CGWindowListCreateImageFromArray is the scene version of the
same trick drive-demo.py uses: it composites ONLY the window ids it is given,
with their own alpha and their own shadows, into the rectangle. Anything not in
the list is transparent, so it cannot appear in the film by construction.

The window list is re-read EVERY frame, because the interesting windows come
and go: a popup, an autocomplete list, a panel that opens mid-take.

Frames are written in drive-demo.py's raw RGBA + .idx format, so
demo-compose.py (with --scene) composes them unchanged.
"""

import pathlib
import threading
import time

import numpy as np
import Quartz


def scene_ids(owners, exclude=(), min_alpha=0.01):
    """On-screen window ids of `owners`, front to back (the order the window
    server reports, which is the order CreateImageFromArray composites in)."""
    opt = Quartz.kCGWindowListOptionOnScreenOnly | Quartz.kCGWindowListExcludeDesktopElements
    ids = []
    for w in Quartz.CGWindowListCopyWindowInfo(opt, Quartz.kCGNullWindowID) or []:
        if w.get("kCGWindowOwnerName") not in owners:
            continue
        if w.get("kCGWindowAlpha", 1) < min_alpha:
            continue
        # Layer 25 holds the menu bar's status items, which are never part of a
        # staged scene — but some apps (AudioSwitch) put their PANEL on layer
        # 25 too, so the test is "status-item sized", not the layer alone.
        if (int(w.get("kCGWindowLayer", 0)) in (24, 25)
                and w["kCGWindowBounds"]["Height"] < 50):
            continue
        wid = int(w["kCGWindowNumber"])
        if wid not in exclude:
            ids.append(wid)
    return ids


def grab_scene(rect, ids):
    """RGBA array of just `ids`, clipped to rect (points). Shadows included —
    they are real, and they are what makes a window sit on the desk."""
    x, y, w, h = rect
    img = Quartz.CGWindowListCreateImageFromArray(
        Quartz.CGRectMake(x, y, w, h), ids, Quartz.kCGWindowImageBestResolution)
    if img is None:
        return None
    W, H = Quartz.CGImageGetWidth(img), Quartz.CGImageGetHeight(img)
    bpr = Quartz.CGImageGetBytesPerRow(img)
    data = Quartz.CGDataProviderCopyData(Quartz.CGImageGetDataProvider(img))
    buf = np.frombuffer(data, dtype=np.uint8)[: bpr * H].reshape(H, bpr // 4, 4)[:, :W]
    return buf[..., [2, 1, 0, 3]]          # BGRA -> RGBA


class SceneRecorder(threading.Thread):
    def __init__(self, rect, owners, out, fps=20, exclude=()):
        super().__init__(daemon=True)
        self.rect, self.owners, self.exclude = rect, set(owners), set(exclude)
        self.out, self.dt = pathlib.Path(out), 1.0 / fps
        self.stop = threading.Event()
        self.frames = 0
        self.size = None
        self.t0 = None

    def run(self):
        idx = self.out.with_suffix(".idx").open("w")
        with self.out.open("wb") as fh:
            self.t0 = t0 = time.monotonic()
            nxt = 0.0
            while not self.stop.is_set():
                now = time.monotonic() - t0
                if now < nxt:
                    time.sleep(min(0.004, nxt - now))
                    continue
                nxt += self.dt
                ids = scene_ids(self.owners, self.exclude)
                a = grab_scene(self.rect, ids) if ids else None
                if a is None:
                    if self.size is None:
                        continue
                    # Nothing of ours on screen (e.g. every window closed):
                    # an empty, fully transparent frame is the truth.
                    a = np.zeros((self.size[1], self.size[0], 4), np.uint8)
                if self.size is None:
                    self.size = (a.shape[1], a.shape[0])
                if (a.shape[1], a.shape[0]) != self.size:
                    continue
                fh.write(np.ascontiguousarray(a).tobytes())
                idx.write("%.4f %d %d\n" % (now, a.shape[1], a.shape[0]))
                self.frames += 1
        idx.close()
