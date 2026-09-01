import base64, json, os, sys, urllib.request, uuid
key=None
for line in open(os.path.expanduser("~/.env")):
    if line.startswith("OPENAI_API_KEY"): key=line.split("=",1)[1].strip().strip('"').strip("'")

PROMPT = """Exactly the same photograph, from exactly the same camera position, with
NOTHING moved: the same seat, the same tray table in the same place, the same
window, the same fold of every piece of fabric. Do not re-frame, do not re-pose,
do not change any object's position or shape.

The ONLY change: the overhead READING LIGHT is now switched on. A warm pool of
about 3000K light falls from above onto the tray table and spills a little onto
the seat back around it. The tray is clearly lit; the seat fabric nearest the
pool picks up some warmth; everything outside the pool stays as dark as it was.

The view through the window is UNCHANGED — it is a hole to the night outside,
not a surface, so the reading light does not brighten it at all.

Keep the cool grey-blue of the cabin materials: the lamp warms them slightly, it
does not turn them tan or beige."""

src, out = sys.argv[1], sys.argv[2]
boundary = uuid.uuid4().hex
parts = []
def field(name, value):
    parts.append(("--%s\r\nContent-Disposition: form-data; name=\"%s\"\r\n\r\n%s\r\n" % (boundary, name, value)).encode())
field("model", "gpt-image-2")
field("prompt", PROMPT)
field("size", "1536x1024" if "wide" in src else "1024x1536")
field("quality", "high")
parts.append(("--%s\r\nContent-Disposition: form-data; name=\"image\"; filename=\"s.png\"\r\nContent-Type: image/png\r\n\r\n" % boundary).encode())
parts.append(open(src,"rb").read()); parts.append(b"\r\n")
parts.append(("--%s--\r\n" % boundary).encode())
body = b"".join(parts)

req = urllib.request.Request("https://api.openai.com/v1/images/edits", data=body,
  headers={"Authorization":"Bearer "+key, "Content-Type":"multipart/form-data; boundary="+boundary})
res = json.load(urllib.request.urlopen(req, timeout=900))
open(out,"wb").write(base64.b64decode(res["data"][0]["b64_json"]))
print("wrote", out)
