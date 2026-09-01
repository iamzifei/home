#!/usr/bin/env python3
"""Drive one application through a scripted demo and film it.

    python3 tools/drive-demo.py <app> <out.mov> [--probe]

`--probe` opens the app's panel and saves a still instead of recording, which is
how the coordinates below were measured rather than guessed.

WHY THE EVENTS GO WHERE THEY GO
-------------------------------
Two different delivery paths, because the apps are in two different situations:

  * Inkstone is a normal window and may be on another Space, so its keys go to
    its pid with CGEventPostToPid — which is addressed to a process rather than
    to whatever is frontmost, and therefore works while the window is covered.
  * The three menu-bar panels only exist while they have focus, and they close
    the moment something else takes it. Their events go to the HID tap, i.e. to
    the front, because that is what they are.

ClipStack's status item is parked off-screen by Ice (x = -3409), so clicking it
opens the panel off-screen too. It is summoned with its global hotkey instead,
which centres the panel on screen.

COORDINATES
-----------
Window POINTS, origin at the window's top-left. Screen coordinates are resolved
at run time from the live window bounds, so the script survives the panel
opening somewhere else.
"""

import pathlib
import subprocess
import sys
import threading
import time

import numpy as np
import Quartz
from PIL import Image

FLAGS = {"cmd": Quartz.kCGEventFlagMaskCommand, "shift": Quartz.kCGEventFlagMaskShift,
         "option": Quartz.kCGEventFlagMaskAlternate, "ctrl": Quartz.kCGEventFlagMaskControl}


# --- event plumbing ------------------------------------------------------
def post(ev, pid=None):
    if pid is None:
        Quartz.CGEventPost(Quartz.kCGHIDEventTap, ev)
    else:
        Quartz.CGEventPostToPid(pid, ev)


def move(x, y, pid=None):
    post(Quartz.CGEventCreateMouseEvent(None, Quartz.kCGEventMouseMoved, (x, y), 0), pid)


def click(x, y, pid=None):
    move(x, y, pid)
    time.sleep(0.12)
    for k in (Quartz.kCGEventLeftMouseDown, Quartz.kCGEventLeftMouseUp):
        post(Quartz.CGEventCreateMouseEvent(None, k, (x, y), Quartz.kCGMouseButtonLeft), pid)
        time.sleep(0.05)


def drag(x0, y0, x1, y1, seconds=0.8, pid=None):
    """Held, and moved in steps. One jump from start to end is not a drag: the
    control snaps and the film shows nothing happening."""
    move(x0, y0, pid)
    time.sleep(0.1)
    post(Quartz.CGEventCreateMouseEvent(None, Quartz.kCGEventLeftMouseDown, (x0, y0),
                                        Quartz.kCGMouseButtonLeft), pid)
    steps = max(2, int(seconds * 40))
    for i in range(1, steps + 1):
        u = i / steps
        p = (x0 + (x1 - x0) * u, y0 + (y1 - y0) * u)
        post(Quartz.CGEventCreateMouseEvent(None, Quartz.kCGEventLeftMouseDragged, p,
                                            Quartz.kCGMouseButtonLeft), pid)
        time.sleep(seconds / steps)
    post(Quartz.CGEventCreateMouseEvent(None, Quartz.kCGEventLeftMouseUp, (x1, y1),
                                        Quartz.kCGMouseButtonLeft), pid)


def key(code, *mods, pid=None):
    flags = 0
    for m in mods:
        flags |= FLAGS[m]
    for down in (True, False):
        e = Quartz.CGEventCreateKeyboardEvent(None, code, down)
        Quartz.CGEventSetFlags(e, flags)
        post(e, pid)
        time.sleep(0.012)


def text(s, delay=0.05, pid=None):
    for ch in s:
        for down in (True, False):
            e = Quartz.CGEventCreateKeyboardEvent(None, 0, down)
            Quartz.CGEventKeyboardSetUnicodeString(e, len(ch), ch)
            post(e, pid)
            time.sleep(0.008)
        time.sleep(delay)


# --- windows -------------------------------------------------------------
def windows(owner, onscreen=True):
    opt = (Quartz.kCGWindowListOptionOnScreenOnly if onscreen
           else Quartz.kCGWindowListOptionAll) | Quartz.kCGWindowListExcludeDesktopElements
    out = []
    for w in Quartz.CGWindowListCopyWindowInfo(opt, Quartz.kCGNullWindowID) or []:
        if w.get("kCGWindowOwnerName") == owner and w.get("kCGWindowAlpha", 1) > 0.5:
            b = w["kCGWindowBounds"]
            out.append(dict(id=int(w["kCGWindowNumber"]), pid=int(w["kCGWindowOwnerPID"]),
                            x=int(b["X"]), y=int(b["Y"]),
                            w=int(b["Width"]), h=int(b["Height"])))
    return sorted(out, key=lambda d: -d["w"] * d["h"])


def wait_window(owner, min_w, min_h, timeout=6):
    end = time.time() + timeout
    while time.time() < end:
        for w in windows(owner):
            if w["w"] >= min_w and w["h"] >= min_h:
                return w
        time.sleep(0.2)
    raise SystemExit("no on-screen window for %s" % owner)


def already_open(owner, min_w, min_h):
    """A status item TOGGLES. Clicking it when the panel is already up closes
    it, and the recorder then films a dead window id — which returns black
    frames of the right size rather than nothing, so it looks like a capture
    bug. Cost: one wasted run and twenty minutes. Check first."""
    for w in windows(owner):
        if w["w"] >= min_w and w["h"] >= min_h:
            return w
    return None


def ax_click_status(proc, menu_bar=1):
    subprocess.run(["osascript", "-e",
                    'tell application "System Events" to tell process "%s" '
                    'to click menu bar item 1 of menu bar %d' % (proc, menu_bar)],
                   capture_output=True)


# --- the demos -----------------------------------------------------------
def open_audioswitch():
    return (already_open("AudioSwitch", 300, 600)
            or (ax_click_status("AudioSwitch", 1) or wait_window("AudioSwitch", 300, 600)))


def open_candela():
    return (already_open("Candela", 340, 600)
            or (ax_click_status("Candela", 2) or wait_window("Candela", 340, 600)))


def open_clipstack():
    w = already_open("ClipStack", 700, 400)
    if w:
        return w
    key(9, "cmd", "shift")          # the global hotkey, not the hidden status item
    return wait_window("ClipStack", 700, 400)


def open_inkstone():
    return wait_window("Inkstone", 1200, 800)


OPENERS = {"audioswitch": open_audioswitch, "candela": open_candela,
           "clipstack": open_clipstack, "inkstone": open_inkstone}
OWNERS = {"audioswitch": "AudioSwitch", "candela": "Candela",
          "clipstack": "ClipStack", "inkstone": "Inkstone"}
# How much of the capture to keep. The rule is arithmetic: the tightest camera
# crop must still be at least as wide as the output. Inkstone's window is
# 3840px and its tightest crop is ~0.44 of that, so 0.62 leaves ~1050px for a
# 1024px frame; the panels are already smaller than the output and are kept 1:1.
SRC_SCALE = {}          # full resolution: the resize was costing half the capture rate


def app_owner(app):
    return OWNERS[app]


# --- capture --------------------------------------------------------------
# `screencapture -v -l<id>` records BLACK on this macOS: verified on Chrome and
# on Candela, while full-display video records fine — so it is window-targeted
# video that is broken here, not a permission. `-R<rect>` does work, but it
# films whatever is at those coordinates, and around a rounded panel that is the
# desktop behind it: the test recording had real customer text visible in the
# corners.
#
# CGWindowListCreateImage has neither problem. It returns the window's own
# pixels WITH its alpha, so nothing behind the window can ever appear, and it
# runs at ~20fps in-process. Frames go to disk raw because raw costs 0.9ms to
# write and PNG costs 11 — and dropping frames to save disk on a machine with a
# terabyte free would be the wrong trade.
def grab(wid):
    img = Quartz.CGWindowListCreateImage(
        Quartz.CGRectNull, Quartz.kCGWindowListOptionIncludingWindow, wid,
        Quartz.kCGWindowImageBoundsIgnoreFraming)
    if img is None:
        return None
    w, h = Quartz.CGImageGetWidth(img), Quartz.CGImageGetHeight(img)
    bpr = Quartz.CGImageGetBytesPerRow(img)
    data = Quartz.CGDataProviderCopyData(Quartz.CGImageGetDataProvider(img))
    buf = np.frombuffer(data, dtype=np.uint8)[: bpr * h].reshape(h, bpr // 4, 4)[:, :w]
    return buf[..., [2, 1, 0, 3]]          # BGRA -> RGBA


class Recorder(threading.Thread):
    def __init__(self, wid, out, fps=20, scale=1.0):
        super().__init__(daemon=True)
        self.wid, self.out, self.dt, self.scale = wid, pathlib.Path(out), 1.0 / fps, scale
        self.stop = threading.Event()
        self.frames = 0

    def run(self):
        idx = self.out.with_suffix(".idx").open("w")
        with self.out.open("wb") as fh:
            t0 = time.monotonic()
            nxt = 0.0
            while not self.stop.is_set():
                now = time.monotonic() - t0
                if now < nxt:
                    time.sleep(min(0.004, nxt - now))
                    continue
                nxt += self.dt
                a = grab(self.wid)
                if a is None:
                    continue
                if self.scale != 1.0:
                    im = Image.fromarray(a, "RGBA")
                    im = im.resize((round(im.width * self.scale), round(im.height * self.scale)),
                                   Image.LANCZOS)
                    a = np.asarray(im)
                fh.write(a.tobytes())
                idx.write("%.4f %d %d\n" % (now, a.shape[1], a.shape[0]))
                self.frames += 1
        idx.close()


def run(app, out, secs, script):
    win = OPENERS[app]()
    ox, oy, pid = win["x"], win["y"], win["pid"]
    print("window %s  %dx%d @ (%d,%d)" % (win["id"], win["w"], win["h"], ox, oy))

    def S(px, py):
        return (ox + px, oy + py)

    scale = SRC_SCALE.get(app, 1.0)
    rec = Recorder(win["id"], out, fps=20, scale=scale)
    rec.start()
    t0 = time.monotonic()

    def at(t):
        while time.monotonic() - t0 < t:
            time.sleep(0.01)

    script(S, pid, at)
    at(secs)
    rec.stop.set()
    rec.join()
    # The window is re-read at the end: if the panel had closed halfway the
    # frames after that point are of nothing, and it is better to be told than
    # to find it in the finished film.
    still = [w for w in windows(app_owner(app)) if w["id"] == win["id"]]
    print("recorded %s  %d frames  %.1fs  scale %.2f  window %s"
          % (out, rec.frames, secs, scale, "still open" if still else "CLOSED EARLY"))


if __name__ == "__main__":
    app, out = sys.argv[1], pathlib.Path(sys.argv[2])
    if "--probe" in sys.argv:
        w = OPENERS[app]()
        subprocess.run(["screencapture", "-o", "-x", "-l%d" % w["id"], str(out)])
        print("%s  %dx%d @ (%d,%d)" % (out, w["w"], w["h"], w["x"], w["y"]))
        raise SystemExit(0)
    import demo_scripts  # noqa
    secs, script = demo_scripts.SCRIPTS[app]
    run(app, out, secs, script)
