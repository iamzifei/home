#!/usr/bin/env python3
"""Bake the cabin's reading light into the frames the page crossfades.

    python3 tools/bake-cabin-light.py
    cwebp -q 86 -m 6 assets/<name>.png -o assets/<name>.webp

Reads  assets/src/cabin-raw.png           landscape, every light off
       assets/src/cabin-raw-portrait.png  the same scene shot for phones
Writes assets/cabin-off / -on             night, and the lamp on
       assets/cabin-tall-off / -on        the portrait pair

WHY THIS IS BAKED AND NOT DRAWN IN CSS
--------------------------------------
A radial gradient laid over the photograph lights whatever is underneath it,
including the empty air behind the seat where there is nothing to reflect. The
result reads as a coloured circle, not as a lamp. So the light is computed per
pixel from the same expression a renderer would use:

    E = I * h / (s^2 + h^2)^(3/2)

which carries the inverse-square falloff and the cosine of incidence on a flat
surface in one term, multiplied by an albedo read from the frame's own
luminance. Light then appears only where there is a surface to catch it.

SIX THINGS THAT WERE WRONG HERE, AND WILL GO WRONG AGAIN ON A NEW SOURCE FRAME
------------------------------------------------------------------------------
1. LAMP HEIGHT IS THE MAIN CONTROL, not gain. A real reading lamp sits about
   60 cm above a 40 cm tray, so height and pool radius are the same order. Set
   far smaller and the pool collapses into a hard hotspot; far larger and the
   whole cabin lifts. Both were shipped before the ratio was.

2. THE POOL HAS TO BE BIGGER THAN THE PAGE. Obvious said out loud, invisible in
   the numbers: on the portrait frame the lamp lit 0.68 of the width while the
   page covered 0.76, so the page's own edges lay in the dark and it read as a
   card floating over the seat rather than a page under a lamp.

3. THE ALBEDO REFERENCE MUST COME FROM CABIN PIXELS ONLY. Taken over the whole
   frame, the moonlit cloud deck — the brightest thing present and not a cabin
   surface at all — set the scale, and the tray baked to 0.195 where it needed
   0.7. Note that fixing the window mask MOVES this reference, so the gain has
   to be re-measured after any change to the aperture.

4. ALBEDO IS PER CHANNEL, because a surface reflects its own colour. Taken from
   luminance alone, the light added to every pixel carries the LAMP's colour and
   nothing of the material's — so a warm lamp turns a grey-blue cabin panel tan.
   Measured on the frame that shipped with the scalar version: the sidewall sat
   at R-B -0.067 unlit and flipped to +0.039 lit, a cool panel crossing all the
   way past neutral into khaki. That is what "the colour is wrong" looks like.
   With per-channel albedo the panel keeps its own hue and only brightens.

6. THE WINDOW IS A REGION, NOT A COLOUR. Two colour heuristics were tried and
   both were wrong in opposite directions. Blueness alone caught the tray as
   well (its B-R is 0.037 against the sky's 0.128) and cut 92% off the albedo of
   the one surface the lamp is pointed at. Adding a brightness term fixed the
   tray and then failed on the CLOUD DECK, which is white — B-R near zero — so
   the mask averaged 0.537 over the glass and the view outside rose 0.247 ->
   0.334 with the lamp on, quietly arguing it was not really night out there.

   The aperture is a shape, so it is found as a shape: threshold inside a box,
   then fill each row between its first and last bright pixel. The window's
   frame and reveal are dark and stay outside the mask, which is right — they
   are surfaces and the lamp should catch them. Only the glass is a hole.

5. THE FRAME IS EXTENDED SO THE TRAY CAN BE CENTRED. The reading text belongs in
   the middle of the page, but in any view of your own tray the tray is in the
   lower half and off to one side — and on a wide viewport `cover` shows a
   horizontal slice, so putting the tray mid-slice means cropping away
   everything more than half a slice above it, which is exactly where the window
   is. Measured: pinning the crop to the bottom put the tray at 0.55 and kept
   73% of the window.

   Growing the frame into the dark cabin instead moves the tray's centre in the
   ASSET's own coordinates, so no crop has to do it, and a plain
   `background-position: 50% 50%` then works. Measured across viewport ratios
   1.20 to 2.10, the tray's centre lands within 1.2% of the middle with the
   window whole. The added rows and columns are the cabin's own edge colour
   falling off to black, which is what a cabin does past the lamp.

7. THE NIGHT GRADE FLATTENS THE SOURCE'S GRADIENTS. Multiplying the cabin down
   to a real night level compresses its levels, and WebP then quantises the dark
   areas into visible blocks — 52% of 8x8 blocks in the seat came out perfectly
   flat at q82. A little noise before quantisation fixes it, with a fixed seed so
   rebuilds are byte-identical.

Sizes and pads are per-variant in VARIANTS below. After changing ANY of them,
re-measure: the tray's lit level, the glass before/after (it must not move), the
clipped fraction, and where the tray's centre lands.
"""

import pathlib
import numpy as np
from PIL import Image, ImageFilter

ROOT = pathlib.Path(__file__).resolve().parent.parent

# About 3000K, which is what a cabin reading light actually is. Warmer than this
# and the tint starts deciding the colour of everything it touches.
LAMP_TINT = np.array([1.00, 0.93, 0.84])

# How warm a cabin surface is allowed to be, as R-B per unit luminance. Negative
# means blue-dominant. Nothing inside a night cabin is warmer than this.
CABIN_MAX_WARMTH = -0.30
LIT_MAX_WARMTH = -0.16

# The generated sky reads closer to dusk than to 03:12. Cool it and take it
# down; the window is the same in both frames because a reading lamp does not
# change what is outside it.
NIGHT_GAIN = np.array([0.52, 0.60, 0.74])

# The page's own background behind the photograph. The pads fade to THIS, not to
# black: fading to zero left a step of 0.027 against the hull at the outer edge —
# invisible on most screens, a faint line in a dark room, which is exactly where
# this page is read.
HULL = np.array([6, 7, 10]) / 255.0

APERTURE_LUM = 0.14        # the view outside is the only large bright area
APERTURE_MIN_RUN = 40      # rejects stray specular highlights on the sidewall

# TWO FRAMINGS, NOT ONE CROP.
#
# A phone is about 1:2. Cropping the landscape frame to that throws away 70% of
# its width, and the window and the tray are on opposite sides of it — so every
# crop that keeps the tray loses the window, which was the complaint that made
# the window bigger in the first place. Cropping is the wrong tool: the scene is
# reshot for portrait instead, window above and tray below, both whole.
#
# lamp: (x, y, height, y-squash) in SOURCE pixels. The camera looks down at
#   about 60 degrees, so a round pool projects as an ellipse stretched
#   vertically — that is what y_squash is for. Height and the pool radius are
#   the same order (a real reading lamp is ~60cm over a ~40cm tray), so height
#   is set from the tray's half width, not tuned by eye.
# aperture: the box to look for the window in, as fractions of the frame.
VARIANTS = {
    "cabin": dict(
        src="cabin-raw.png", out_w=1760,
        lamp=(799.0, 573.0, 440.0, 1.5), gain=0.80, night=0.52,
        pad_left=0.076, pad_x=0.120, pad_top=0.000, pad=0.120,
        aperture=(0.00, 0.00, 0.30, 0.62),      # window is at the left
    ),
    "cabin-tall": dict(
        src="cabin-raw-portrait.png", out_w=1400,
        # 650, not 400: on a phone the page fills most of the width, and a pool
        # narrower than the page you are reading is not a reading lamp. Measured
        # at the lamp's own row, 400 lit 0.68 of the frame against the 0.76 the
        # page needs; 650 lights 0.83 with nothing clipped.
        lamp=(500.0, 955.0, 640.0, 1.5), gain=0.66, night=0.62,
        pad_left=0.292, pad_x=0.270, pad_top=-0.030, pad=0.214,
        aperture=(0.02, 0.00, 0.32, 0.45),      # window is at the upper left
    ),
}


def smoothstep(v, lo, hi):
    t = np.clip((v - lo) / (hi - lo), 0.0, 1.0)
    return t * t * (3.0 - 2.0 * t)


def extend(frame, pad_right, pad_bottom, pad_left=0.0, pad_top=0.0):
    """Grow the frame into darkness — see note 5 in the docstring.

    The pads exist to move the tray's centre in the ASSET's own coordinates so
    that no crop has to do it, and to give `cover` something to eat before it
    reaches the subject.

    TWO THINGS MAKE THE JOIN VISIBLE, and neither is a luminance step — measured
    across every seam here, the step is 0.0000.

    1. A DERIVATIVE DISCONTINUITY. Inside the photograph the brightness is
       roughly flat; if the pad starts falling immediately, the kink at the join
       shows up as a Mach band — a hard shadow edge with nothing behind it. The
       falloff is a smoothstep, whose slope is zero where it meets the photo.

    2. NO TEXTURE. A flat gradient beside a grained photograph reads as two
       different materials however smoothly they meet. The pad is the adjacent
       strip MIRRORED outward, so the weave and the grain carry on across the
       join, and only then fades.
    """

    def soften(line, axis):
        """Blur the edge sample ALONG the edge, so the extension does not stripe."""
        img = Image.fromarray(np.clip(line * 255, 0, 255).astype(np.uint8))
        return np.asarray(img.filter(ImageFilter.GaussianBlur(28))).astype(np.float64) / 255.0

    def falloff(n):
        t = np.arange(n) / max(n - 1, 1)
        return 1.0 - (3.0 * t * t - 2.0 * t * t * t)      # slope 0 at t = 0

    def grow(frame, n, axis, at_start):
        """Extend `n` rows/cols out from one edge and fade them to black.

        Not a mirror: mirroring carried recognisable objects outward — the
        armrest came back flipped, and it read as a fold in the picture. What
        goes out is the edge sample alone, softened ALONG the edge so it does
        not stripe, then faded with a smoothstep whose slope is zero at the join.
        """
        if n <= 0:
            return frame
        if axis == 1:
            edge = frame[:, :6].mean(axis=1) if at_start else frame[:, -6:].mean(axis=1)
            edge = soften(edge[:, None, :], 0)
            edge = np.repeat(edge, n, axis=1)
            ramp = falloff(n)[None, :, None]
            r = ramp[:, ::-1] if at_start else ramp
            block = edge * r + HULL[None, None, :] * (1.0 - r)
            return np.concatenate([block, frame], axis=1) if at_start \
                else np.concatenate([frame, block], axis=1)
        edge = frame[:6].mean(axis=0) if at_start else frame[-6:].mean(axis=0)
        edge = soften(edge[None, :, :], 1)
        edge = np.repeat(edge, n, axis=0)
        ramp = falloff(n)[:, None, None]
        r = ramp[::-1] if at_start else ramp
        block = edge * r + HULL[None, None, :] * (1.0 - r)
        return np.concatenate([block, frame], axis=0) if at_start \
            else np.concatenate([frame, block], axis=0)

    if pad_left > 0:
        frame = grow(frame, int(round(frame.shape[1] * pad_left)), 1, True)
    if pad_right > 0:
        frame = grow(frame, int(round(frame.shape[1] * pad_right)), 1, False)
    if pad_top > 0:
        frame = grow(frame, int(round(frame.shape[0] * pad_top)), 0, True)
    elif pad_top < 0:
        # A NEGATIVE TOP PAD CROPS instead of padding, and the difference is not
        # cosmetic. Both move the tray to the frame's middle, but padding the
        # bottom makes the frame TALLER, and on a portrait viewport `cover`
        # scales by height — so every extra row shrinks everything on screen.
        # Measured: padding the bottom left the tray filling 67% of a phone's
        # width; cropping the same amount off the top puts it at 88%.
        frame = frame[int(round(frame.shape[0] * -pad_top)):]
    if pad_bottom > 0:
        frame = grow(frame, int(round(frame.shape[0] * pad_bottom)), 0, False)
    return frame


def cool_floor(frame, window, limit):
    """Cap how warm a cabin surface may be — see note 5 in the docstring.

    One-way: it only cools what is warmer than the floor, never warms anything,
    and leaves anything already bluer than the floor exactly as it was. The
    window is excluded; what is outside has its own colour.
    """
    lum = 0.2126 * frame[..., 0] + 0.7152 * frame[..., 1] + 0.0722 * frame[..., 2]
    excess = np.maximum((frame[..., 0] - frame[..., 2]) - limit * lum, 0.0) * (1.0 - window)
    out = frame.copy()
    out[..., 0] -= 0.5 * excess
    out[..., 2] += 0.5 * excess
    return np.clip(out, 0.0, 1.0)


def aperture(lum, box):
    """The glass, as a filled region — see note 3 in the module docstring.

    Inside `box` the view outside is the only large bright area, so a threshold
    finds its pixels; filling each row between its first and last bright pixel
    closes the cloud deck's own dark gaps, which is what a colour test could
    never do. The box exists because the LIT tray is bright too, and it is not
    a window.
    """
    h, w = lum.shape
    x0, y0, x1, y1 = box
    bright = np.zeros(lum.shape, bool)
    sl = (slice(int(h * y0), int(h * y1)), slice(int(w * x0), int(w * x1)))
    bright[sl] = lum[sl] > APERTURE_LUM
    mask = np.zeros_like(lum)
    for y in range(h):
        xs = np.flatnonzero(bright[y])
        if xs.size < APERTURE_MIN_RUN:
            continue
        mask[y, xs[0]:xs[-1] + 1] = 1.0
    return blur(mask, 10)                              # soften the bezel, nothing more


def blur(mask, radius):
    img = Image.fromarray((mask * 255).astype(np.uint8))
    return np.asarray(img.filter(ImageFilter.GaussianBlur(radius))).astype(np.float64) / 255.0


def bake(name, cfg):
    src = Image.open(ROOT / "assets" / "src" / cfg["src"]).convert("RGB")
    a = np.asarray(src).astype(np.float64) / 255.0
    h, w, _ = a.shape
    lum = 0.2126 * a[..., 0] + 0.7152 * a[..., 1] + 0.0722 * a[..., 2]

    window = aperture(lum, cfg["aperture"])

    # Cool and darken the view outside, and take the cabin itself down to a real
    # night level, in both frames. The renders come back lit generously enough
    # that the lamp had nowhere to go: the same gain that baked the old tray to
    # 0.68 pushed these to 0.89 and 0.99, clipping 4.5% and 10.2% of the frame.
    a = a * (1.0 - window[..., None]) * cfg["night"] + a * window[..., None] * NIGHT_GAIN
    lum = 0.2126 * a[..., 0] + 0.7152 * a[..., 1] + 0.0722 * a[..., 2]

    # ONE HUE FAMILY FOR THE CABIN. The generated interiors do not come back as
    # one material: measured on this frame, the seat fabric sits at R-B -0.71 per
    # unit luminance and the sidewall at only -0.24 — a near-neutral panel beside
    # navy cloth. Neutral next to blue reads as warm, and once the lamp's own warm
    # light lands on it, it reads as taupe.
    #
    # So cabin pixels get a one-way floor on how warm they may be. It only cools
    # what is warmer than the floor; it never warms anything, and anything already
    # bluer than the floor is left exactly as it was — the seat and tray are
    # untouched by it. The window is excluded: what is outside has its own colour.
    a = cool_floor(a, window, CABIN_MAX_WARMTH)
    lum = 0.2126 * a[..., 0] + 0.7152 * a[..., 1] + 0.0722 * a[..., 2]

    # Albedo: how much of the light landing on a pixel comes back — PER CHANNEL,
    # because a surface reflects its own colour, not the lamp's. Read from the
    # frame's own RGB, normalised against the brightest CABIN pixel.
    reference = np.percentile(lum[window < 0.30], 99.0)
    albedo = np.clip(a / max(reference, 1e-6), 0.0, 1.0) ** 0.5
    albedo = np.dstack([blur(albedo[..., c], 3) for c in range(3)])
    # The 0.05 floor is for cabin surfaces that are almost black but still
    # reflect something. It must NOT survive inside the window: left at 0.93
    # suppression the glass still rose 0.247 -> 0.334 with the lamp on, a 35%
    # lift that quietly argues it is not really night out there.
    albedo = (0.05 + 0.95 * albedo) * (1.0 - 0.995 * window)[..., None]

    lamp_x, lamp_y, lamp_h, y_squash = cfg["lamp"]
    ys, xs = np.mgrid[0:h, 0:w].astype(np.float64)
    dx, dy = xs - lamp_x, (ys - lamp_y) / y_squash
    E = lamp_h / np.power(dx * dx + dy * dy + lamp_h * lamp_h, 1.5)
    E /= E.max()

    lit = np.clip(a + E[..., None] * albedo * LAMP_TINT * cfg["gain"], 0.0, 1.0)
    # And again after the lamp: a warm source dilutes the blue of whatever it
    # lights most, so the brightest surfaces were the ones drifting to neutral —
    # the tray came out at only -0.06 per unit luminance. The lit floor is looser
    # than the unlit one, so the pool still reads warm, just never past neutral.
    lit = cool_floor(lit, window, LIT_MAX_WARMTH)

    out_w = cfg["out_w"]
    written = []
    for frame, state in ((a, "off"), (lit, "on")):
        frame = extend(frame, cfg.get("pad_x", 0.0), cfg["pad"],
                       cfg.get("pad_left", 0.0), cfg.get("pad_top", 0.0))
        # Take BOTH dimensions from the padded frame. Reusing the pre-pad `w`
        # here silently stretched the picture: the relative positions the crop
        # maths depends on all still measured correctly, so nothing in the
        # numbers gave it away.
        h, w = frame.shape[0], frame.shape[1]
        rng = np.random.default_rng(7)          # fixed, so rebuilds are identical
        noisy = frame + rng.normal(0.0, 0.7 / 255.0, frame.shape)
        img = Image.fromarray(np.clip(noisy * 255, 0, 255).astype(np.uint8))
        img = img.resize((out_w, round(out_w * h / w)), Image.LANCZOS)
        path = ROOT / "assets" / ("%s-%s.png" % (name, state))
        img.save(path)
        written.append(path.name)
    return written


def main():
    for name, cfg in VARIANTS.items():
        for f in bake(name, cfg):
            print("wrote assets/" + f)
    print("encode with:  cwebp -q 82 -m 6 assets/<name>.png -o assets/<name>.webp")


if __name__ == "__main__":
    main()
