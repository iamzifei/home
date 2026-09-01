"""What each demo does, and when.

Two things are written down here per app: the ACTIONS on a clock, and the
CAMERA on the same clock. They have to agree, and they only can because the
actions are driven rather than performed — `at(4.0)` really is four seconds
after the first frame, so a keyframe at 4.0 really is looking at the thing that
just happened.

Timings start at t=0 = the first frame demo-compose.py keeps (the 1.2s of
screencapture lead-in is trimmed off both here and there).

Coordinates are window POINTS, measured off `--probe` stills, never guessed.

WHAT IS DELIBERATELY NOT TOUCHED
  Dark Mode and Night Shift (Candela) change the whole system's appearance.
  They are the two most demo-able buttons on that panel and they are left
  alone: a screen recording is not worth changing somebody's display settings.
  What IS touched — one monitor's brightness, the output audio device — is read
  first and put back after; see RESTORE in drive-demo.py's caller.
"""

import time
import importlib.util
import pathlib

_spec = importlib.util.spec_from_file_location(
    "drive_demo", pathlib.Path(__file__).resolve().parent / "drive-demo.py")
_d = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_d)
click, drag, key, text, move = _d.click, _d.drag, _d.key, _d.text, _d.move


# ---------------------------------------------------------------- Candela
# Coordinates re-measured after the panel moved displays between takes: the
# cards are ordered by display, so which one is on top is not a constant. The
# probe still is taken immediately before the record for this reason.
#   M28U card      header y=37  badge y=72  slider y=94 (knob x=250)  chevron (320,43)
#   VX1622-4K card header y=141 slider y=182 volume y=211            chevron (320,148)
#   Combined       slider y=277
# Dark Mode (127,334) and Night Shift (259,334) are deliberately never clicked.
def candela(S, pid, at):
    at(0.8)
    move(*S(200, 300))
    at(1.6);  drag(*S(250, 94), *S(160, 94), 0.9)      # dim the first display
    at(3.4);  drag(*S(160, 94), *S(250, 94), 0.9)      # and put it back
    at(5.4);  click(*S(320, 43))                       # into that display's own page
    at(9.8);  move(*S(200, 300))


CANDELA_KF = ("0:-.05,-.05,1.05,1.05  1.2:.03,.005,.97,.18  4.8:.03,.005,.97,.18 "
              "5.8:.03,.0,.97,.28  8.0:.03,.24,.97,.58  9.6:-.05,-.05,1.05,1.05")


# ------------------------------------------------------------ AudioSwitch
# NO DEVICE IS SWITCHED IN THIS FILM, on purpose.
#
# Picking a device is what the app is for, and picking one DISMISSES the panel —
# correct behaviour, and fatal to a recording: a hidden window id keeps
# returning frames, they are just black, so the middle of the take was a black
# flash. Re-opening works (the panel reuses window id 2404, checked) but then
# the loop shows the panel vanishing and returning, which reads as a glitch.
#
# The alternative was to drop the closed frames in post and pretend the panel
# stayed up. That is fabricating a UI that did not happen, so: the film shows
# the volume, the live input meter, the microphone kill switch and the device
# locks — every one of them real, and the full device list is on screen the
# whole time. Nothing here changes which device anything is playing to.
#
#   Output header y=39   volume knob x=76 y=62
#   devices        y=97 · 125 · 153 · 181 · 209 · 237      (x≈130)
#   Input header  y=281  mic knob x=243 y=303  level meter y=325
#   toggles       Disable Mic y=498 · Lock Output y=529 · Lock Input y=553  (x=295)
def audioswitch(S, pid, at):
    at(0.8);  move(*S(150, 120))
    at(1.4);  drag(*S(76, 62), *S(150, 62), 0.8)     # output volume, down
    at(2.8);  drag(*S(150, 62), *S(76, 62), 0.8)     # and back to where it was
    at(4.4);  move(*S(200, 310))                     # the live input meter
    at(6.0);  click(*S(295, 498))                    # microphone off — a hard switch
    at(7.2);  click(*S(295, 498))                    # and on again
    at(8.0);  click(*S(295, 529))                    # lock the output device
    at(8.8);  click(*S(295, 529))                    # and unlock it
    at(9.8);  move(*S(170, 300))


# The input beat is framed narrow on purpose. A wider crop reaches the row
# labelled "iPhone 15 Pro Microphone" — a device name, not personal data, but it
# names the owner's phone and costs nothing to leave out of frame.
AUDIOSWITCH_KF = ("0:-.05,-.05,1.05,1.05  1.0:.03,.03,.97,.38  3.9:.03,.03,.97,.38 "
                  "4.5:.10,.40,.75,.56  5.5:.10,.40,.75,.56 "
                  "6.0:.03,.64,.97,.94  9.2:.03,.64,.97,.94  9.8:-.05,-.05,1.05,1.05")


# -------------------------------------------------------------- ClipStack
# The store is swapped for demo data before this runs and put back after — the
# real history had a customer conversation, a token and a WeChat handle in it,
# which is exactly the sort of thing a clipboard manager is full of and exactly
# why it cannot be filmed. See the plan file for the swap.
#
#   search field y=19          item count (740,19)
#   rows         y=60,102,144,186,228,270,312,354,396   (pitch 42, x≈150)
#   preview pane x 330..770    footer y=443
#
# Return is never pressed: in ClipStack that copies the entry AND pastes it into
# whatever is in front, which during a recording is not a thing to find out.
def clipstack(S, pid, at):
    at(0.8);  move(*S(150, 90))
    at(1.4);  key(125)                # down the list — the preview follows
    at(2.2);  key(125)
    at(3.4);  key(125)
    at(4.2);  key(125)
    at(5.4);  text("brew", 0.16)      # search filters as you type
    at(8.0)
    for _ in range(4):
        key(51); time.sleep(0.14)     # backspace, and the list comes back
    at(9.6);  move(*S(480, 220))


CLIPSTACK_KF = ("0:-.06,-.10,1.06,1.10  1.0:.0,.0,.44,.52  3.0:.0,.0,.44,.52 "
                "3.6:.38,.03,1.0,.48  5.0:.38,.03,1.0,.48 "
                "5.5:.0,-.03,.55,.42  8.8:.0,-.03,.55,.42  9.4:-.06,-.10,1.06,1.10")


# --------------------------------------------------------------- Inkstone
# The only one of the four that is a real window rather than a menu-bar panel,
# and the only one driven entirely from the keyboard — every beat here is a
# menu command with a shortcut, so nothing depends on a coordinate:
#   ⌘O quick switcher · ⌘⌥G whole-vault graph · ⌘⇧D today's daily note
# Events go to the pid, not the front, so the take survives the window being
# covered or on another Space.
#
# It is filmed in dark mode because the system is in dark mode, and because the
# other three products are dark panels: four thumbnails in one row should look
# like one set. The detail-page stills are re-cut from these same frames for the
# same reason.
def inkstone(S, pid, at):
    at(0.6);  key(31, "cmd", pid=pid)                 # quick switcher
    at(1.2);  text("Measure", 0.10, pid=pid)
    at(2.8);  key(36, pid=pid)                        # open the note
    at(6.2);  key(5, "cmd", "option", pid=pid)        # the whole-vault graph
    at(9.4);  key(2, "cmd", "shift", pid=pid)         # today's daily note


# No keyframe for the quick switcher, and not by choice: it is a child window,
# and CGWindowListCreateImage of the parent does not include it — measured, the
# frames at t=1.8 show an empty editor while the switcher was demonstrably on
# screen (the note it opened appears a second later). So the film opens wide on
# the desk and pushes in as the note lands.
INKSTONE_KF = ("0:-.03,-.06,1.03,1.06  2.6:-.03,-.06,1.03,1.06  3.3:.26,.02,.78,.58 "
               "5.8:.26,.02,.78,.58  6.4:.04,.0,.96,.78  9.0:.04,.0,.96,.78 "
               "9.6:.26,.02,.78,.58  11.8:.26,.02,.78,.58 "
               "12.2:-.03,-.06,1.03,1.06")


SCRIPTS = {
    "candela":     (12.5, candela),
    "audioswitch": (11.5, audioswitch),
    "clipstack":   (12.0, clipstack),
    "inkstone":    (14.0, inkstone),
}
KEYFRAMES = {
    "candela": CANDELA_KF, "audioswitch": AUDIOSWITCH_KF,
    "clipstack": CLIPSTACK_KF, "inkstone": INKSTONE_KF,
}
DURATION = {"candela": 10.8, "audioswitch": 10.6, "clipstack": 11.0, "inkstone": 12.8}
