import base64, json, os, sys, urllib.request
key=None
for line in open(os.path.expanduser("~/.env")):
    if line.startswith("OPENAI_API_KEY"): key=line.split("=",1)[1].strip().strip('"').strip("'")

# The light bible: every object is generated under the SAME light, or they cannot
# be composited together. See docs/plans/20260829-photoreal-rebuild.md.
LIGHT = """
LIGHTING, identical for every object in this set:
* KEY: an overhead reading light, warm about 3000K, coming from ABOVE AND
  SLIGHTLY RIGHT. It is the only strong light.
* FILL: weak, cool moonlight from a cabin window off to the LEFT.
* Everything outside the key light's pool falls away into near-darkness.
* CAMERA: the eye height of a seated passenger, looking DOWN about 30 degrees.
* PALETTE: cool grey-blue airline materials. Apart from the key light's own pool,
  no surface is warmer than neutral. NOTHING here is beige, tan or champagne.

THIS IS NOT A PRODUCT SHOT. Do not light it like one. It is one object noticed in
a DARK CABIN AT NIGHT: most of it sits in shadow, and only the edges nearest the
reading light are picked out. If the whole object is evenly lit and glowing
against black, it is wrong. Think of a photograph taken in a dark room at ISO
3200, not a catalogue render on a sweep.

DELIVERY: the object alone on a FULLY TRANSPARENT background. No floor, no wall,
no backdrop, no cast shadow on any surface underneath it — the object is cut out.
Photorealistic, sharp, f/8, fine material texture. No text, no logos, no people.
"""

OBJECTS = {
 "porthole": """A single aircraft cabin window, cut out as one object.

It is a WINDOW WELL: a deep oval recess about 10cm into the curved fuselage wall,
with the plastic bezel around it and the acrylic pane deep inside. Seen from
about 30 degrees to its right and a little above, so the oval is clearly
foreshortened and slightly slanted, and you can see INTO the well: its inner
surface shows as a wide band down the RIGHT side and along the LOWER edge, and
is hidden on the upper left. The pane sits deep and appears pushed toward the
UPPER LEFT of the opening.

Include a GENEROUS collar of the fuselage sidewall all around the bezel — enough
that the window is plainly set INTO a wall rather than floating — and let that
collar fall away into darkness at the edges of the cut-out.

The pane itself is BLACK and empty: no sky, no clouds, no reflection. It will be
filled in separately.""",
}

name = sys.argv[1]; out = sys.argv[2]
req=urllib.request.Request("https://api.openai.com/v1/images/generations",
  data=json.dumps({"model":"gpt-image-2","prompt":OBJECTS[name]+LIGHT,
                   "size":"1024x1536","quality":"high","background":"transparent",
                   "output_format":"png","n":1}).encode(),
  headers={"Authorization":"Bearer "+key,"Content-Type":"application/json"})
res=json.load(urllib.request.urlopen(req,timeout=900))
open(out,"wb").write(base64.b64decode(res["data"][0]["b64_json"]))
print("wrote",out)
