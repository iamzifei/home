#!/usr/bin/env python3
"""Re-ink the 19 Sep poster into the site's two inks.

    python3 tools/poster-reink.py <poster.png> [--night] [-o out.png]

WHY RE-INK AND NOT RE-GENERATE
The poster is a `gemini-3-pro-image-preview` render and it took ten versions to
get one James approved — the tenth is the first that says what the class
teaches. Its own recipe warns that a re-render has to be proof-read character
by character, because an earlier version printed the word "microtype:" from the
prompt into the artwork. Asking the model again to change two hex values is
paying that whole risk for an ink change.

So the sheet is re-inked instead. Every pixel is solved for how much ink is on
the paper and which of the two inks it is, then the same coverage is laid down
with the new inks. The layout does not move, the halftone does not move, and
not one Chinese character is re-rendered.

  paper    #F0ECE0 -> #F5F1E8   (the site's substrate)
  charcoal #010000 -> #12255E in type, #2148B8 in the image band
  red      #A03F36 -> #C65F38   (signal only)

TWO COBALTS, BECAUSE THE SITE USES TWO
The site does not set text in #2148B8. #2148B8 is the plate — the ink the
halftone imagery is printed in — and running text is #12255E, a denser mix of
the same ink. Re-inking the whole sheet to #2148B8 was tried first and the
small explanatory lines came out visibly weaker than the near-black they
replaced, which is a real cost on a poster whose job is to be read as a
thumbnail in a WeChat feed. So the steel rule gets the plate ink and every
character gets the text ink.

WHERE THE IMAGE BAND IS, MEASURED
Row ink-coverage was profiled across the sheet. The rule occupies rows
463-703; the subtitle above it ends at 405 and the fact line below starts at
760, so rows 450-715 contain the rule and nothing else. The band is stated in
FRACTIONS of the sheet height, not pixels, so a re-render at another size
still lands on it — but it is a measurement of THIS artwork and has to be
re-profiled if the poster is ever regenerated.

WHICH INK A PIXEL IS, IS DECIDED BY RESIDUAL, NOT BY HUE
A pale tint of charcoal and a pale tint of red are both "warm-ish light" and
the hue angle is unstable down there. The distance from the pixel to each
ink's own paper-to-ink line is not. Same rule as tools/plate-night.py.

THE PAPER FIBRE IS KEPT
The sheet is not flat: its modal value is #F0ECE0 but it runs up to #FAF8F3.
Solving against the modal value would read every fibre highlight as negative
ink, clamp it to zero, and hand back a dead flat sheet. Anything brighter than
the paper reference keeps its distance above it and is carried onto the new
substrate.
"""

import argparse
import pathlib
import numpy as np
from PIL import Image

# Measured off the render, not copied from the prompt — the model printed the
# dark plate at near-black rather than at the #30343A the prompt asked for.
SRC_PAPER = np.array([0xF0, 0xEC, 0xE0], dtype=np.float64)
SRC_DARK = np.array([0x01, 0x00, 0x00], dtype=np.float64)
SRC_RED = np.array([0xA0, 0x3F, 0x36], dtype=np.float64)

DAY = dict(paper=[0xF5, 0xF1, 0xE8], text=[0x12, 0x25, 0x5E],
           plate=[0x21, 0x48, 0xB8], red=[0xC6, 0x5F, 0x38])
NIGHT = dict(paper=[0x14, 0x16, 0x1C], text=[0xEC, 0xE8, 0xDF],
             plate=[0x6E, 0x93, 0xE0], red=[0xE0, 0x78, 0x4B])

# The steel-rule band, as a fraction of sheet height. See the note above.
BAND = (450 / 1200.0, 715 / 1200.0)


def coverage(px, ink):
    """Ink coverage 0..1, and how well that coverage explains the pixel."""
    d = ink - SRC_PAPER
    a = np.clip(((px - SRC_PAPER) * d).sum(-1) / (d * d).sum(), 0.0, 1.0)
    fit = SRC_PAPER + a[..., None] * d
    return a, np.linalg.norm(px - fit, axis=-1)


def reink(im, target):
    px = np.asarray(im.convert("RGB"), dtype=np.float64)
    a_d, r_d = coverage(px, SRC_DARK)
    a_r, r_r = coverage(px, SRC_RED)

    use_red = (r_r < r_d)[..., None]
    a = np.where(use_red[..., 0], a_r, a_d)[..., None]

    h = px.shape[0]
    band = np.zeros(h, dtype=bool)
    band[int(BAND[0] * h):int(BAND[1] * h)] = True
    in_band = np.repeat(band[:, None], px.shape[1], axis=1)[..., None]

    paper = np.array(target["paper"], dtype=np.float64)
    dark = np.where(in_band,
                    np.array(target["plate"], dtype=np.float64),
                    np.array(target["text"], dtype=np.float64))
    ink = np.where(use_red, np.array(target["red"], dtype=np.float64), dark)
    out = paper + a * (ink - paper)

    # Carry the fibre: whatever the sheet was ABOVE its paper reference is
    # brightness the solve threw away, and on a dark stock it has to be
    # subtracted rather than added, or the grain glows.
    over = np.clip(px - SRC_PAPER, 0, None) * (a < 0.02)
    sign = 1.0 if sum(target["paper"]) > 3 * 128 else -1.0
    out = out + sign * over

    return Image.fromarray(np.clip(out, 0, 255).astype(np.uint8))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("src")
    ap.add_argument("--night", action="store_true")
    ap.add_argument("-o", "--out")
    a = ap.parse_args()

    p = pathlib.Path(a.src)
    im = reink(Image.open(p), NIGHT if a.night else DAY)
    out = pathlib.Path(a.out) if a.out else p.with_name(
        p.stem + ("-night" if a.night else "-press") + p.suffix)
    if out.suffix.lower() in (".jpg", ".jpeg"):
        im.save(out, quality=92)
    elif out.suffix.lower() == ".webp":
        im.save(out, "WEBP", quality=88, method=6)
    else:
        im.save(out)
    print("%-30s -> %-34s %dx%d  %dKB"
          % (p.name, out.name, im.width, im.height, out.stat().st_size // 1024))


if __name__ == "__main__":
    main()
