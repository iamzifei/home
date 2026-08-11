#!/usr/bin/env python3
"""Compose the featured-card screenshots.

Raw screenshots come in whatever shape the app happens to be — ClipStack's
switcher is a wide window, AudioSwitch's panel is a tall strip. Dropping both
into equal-width cards makes the grid ragged, so each one is centred on a fixed
1600x1000 (16:10) gradient with a soft shadow. The cards then crop identically.

    python3 scripts/make-cards.py
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
W, H = 1600, 1000

# (source, output, gradient top, gradient bottom, how much of the canvas to fill)
CARDS = [
    ("assets/clipstack.png", "assets/clipstack-card.jpg", (34, 36, 58), (18, 18, 30), 0.86),
    ("assets/audioswitch.png", "assets/audioswitch-card.jpg", (46, 62, 120), (26, 24, 66), 0.90),
]


def gradient(top, bottom):
    strip = Image.new("RGB", (1, H))
    for y in range(H):
        t = y / (H - 1)
        strip.putpixel((0, y), tuple(round(top[i] + (bottom[i] - top[i]) * t) for i in range(3)))
    return strip.resize((W, H), Image.BILINEAR)


def compose(src, out, top, bottom, scale):
    shot = Image.open(ROOT / src).convert("RGBA")
    canvas = gradient(top, bottom).convert("RGBA")

    ratio = min(W * scale / shot.width, H * scale / shot.height)
    size = (round(shot.width * ratio), round(shot.height * ratio))
    shot = shot.resize(size, Image.LANCZOS)
    x, y = (W - size[0]) // 2, (H - size[1]) // 2

    shadow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(shadow).rectangle(
        [x + 6, y + 14, x + size[0] + 6, y + size[1] + 14], fill=(0, 0, 0, 90)
    )
    canvas = Image.alpha_composite(canvas, shadow.filter(ImageFilter.GaussianBlur(28)))
    canvas.paste(shot, (x, y), shot)
    canvas.convert("RGB").save(ROOT / out, quality=92, optimize=True)
    print(f"{out}  {W}x{H}")


if __name__ == "__main__":
    for card in CARDS:
        compose(*card)
