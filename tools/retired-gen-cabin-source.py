import base64, json, os, sys, urllib.request

key = None
for line in open(os.path.expanduser("~/.env")):
    if line.startswith("OPENAI_API_KEY"):
        key = line.split("=", 1)[1].strip().strip('"').strip("'")

# Shared: the room, the light, the materials. Only framing differs per variant.
SCENE = """Photorealistic photograph taken inside a wide-body airliner cabin at night,
seat 1A, every cabin light switched off and the reading light OFF, so the whole
interior is dark and lit only by moonlight coming through the window.

THE GEOMETRY OF THE SEAT, which must be obeyed: the cabin window is in the
fuselage wall to the passenger's LEFT. The tray table is IN FRONT of the
passenger, folded down from the seat back ahead. The window and the tray are
therefore at ninety degrees to each other - the window is ALWAYS seen off to the
side and at a sharp angle, NEVER flat-on and NEVER directly behind or above the
tray.

THE WINDOW, in detail:
* It is seen from well off to one side, so its oval is STRONGLY foreshortened and
  visibly SLANTED - a leaning ellipse, clearly narrower than it is tall, the way
  a porthole looks when you are not sitting square to it. It is emphatically not
  an upright symmetrical oval.
* It is a WINDOW WELL: a deep recess about 10cm into the CURVED fuselage wall.
  The inner surface of that well is plainly visible as a wide band down the side
  of the opening nearer the camera and along its lower edge, and hidden on the
  far side.
* The glass sits deep inside and appears pushed toward the far side of the
  opening. The glass's own outline is the SAME slanted oval as the opening, just
  smaller and offset - a smooth curve all the way round, never a straight edge.
* Beyond it, a moonlit deck of clouds far below under a very dark blue night sky.
* The wall it sits in is the curved side of the fuselage, leaning away at the
  top, its curvature readable in the highlight running down it.

THE SEAT, in detail: the seat back and the seat cushion are SHARPLY IN FOCUS and
made of real woven airline upholstery - a visible weave, stitched seams and
piping along the panel edges, the vertical seam channel down the middle of the
back, the slight sag and creasing of used foam, the plastic seat-back shell and
the elastic literature pocket. They are furniture with structure, not a soft
dark mass.

The tray table is completely empty: no cup, no phone, no papers, no objects.

Muted grey-blue airline interior, matte plastics, fine realistic texture, deep
shadows. Cinematic, quiet, lonely. Shot on a full-frame camera at 35mm and f/8 -
DEEP depth of field, everything from the window frame to the seat fabric to the
tray edge crisply in focus. No motion blur, no soft background.

No text, no lettering, no logos, no people, no hands."""

LANDSCAPE = """
FRAMING - landscape, and both of these must be true at once:
- The window is at the LEFT, whole and completely inside the frame with cabin
  wall visible on all sides of it, vertically centred, and large - about the left
  quarter of the picture.
- The camera is HIGH, looking down at the tray from above, so the tray sits in
  the MIDDLE BAND of the picture, not low in it: the exact middle of the image
  falls on its flat empty top surface, with roughly as much picture above the
  tray as below it. It reads as a foreshortened trapezoid.
- Seat back and literature pocket above and right of the tray; seat cushion and
  footwell below, filling the bottom of the frame and falling into darkness."""

PORTRAIT = """
FRAMING - vertical/portrait, and all of these must be true at once:
- The window is at the UPPER LEFT, on the side wall, seen at a sharp angle, and
  it is LARGE: the camera is close to it and its glass alone is about a third of
  the picture's width. It is whole and completely inside the frame with a band of
  cabin wall visible above it and to its left. It is NOT centred, NOT flat-on,
  and NOT directly above the tray.
- The open tray table is CENTRED IN THE PICTURE and fills most of its width: the
  exact middle of the image falls on its flat empty top surface.
- Above and to the right of the tray, the seat back and its literature pocket.
  Below the tray, the seat cushion, the footwell and the cabin floor falling away
  into near-total darkness."""

variant, out = sys.argv[1], sys.argv[2]
size = "1536x1024" if variant == "landscape" else "1024x1536"
prompt = SCENE + (LANDSCAPE if variant == "landscape" else PORTRAIT)

req = urllib.request.Request(
    "https://api.openai.com/v1/images/generations",
    data=json.dumps({"model": "gpt-image-2", "prompt": prompt,
                     "size": size, "quality": "high", "n": 1}).encode(),
    headers={"Authorization": "Bearer " + key, "Content-Type": "application/json"})
res = json.load(urllib.request.urlopen(req, timeout=900))
open(out, "wb").write(base64.b64decode(res["data"][0]["b64_json"]))
print("wrote", out)
