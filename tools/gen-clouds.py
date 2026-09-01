import base64, json, os, sys, urllib.request
key=None
for line in open(os.path.expanduser("~/.env")):
    if line.startswith("OPENAI_API_KEY"): key=line.split("=",1)[1].strip().strip('"').strip("'")
PROMPT = """A deck of moonlit stratocumulus cloud seen from very high above at night,
photographed looking down and out from an aircraft at cruising altitude.

The clouds fill the LOWER TWO THIRDS of the frame as a soft rolling carpet
stretching to a flat horizon. Above them, PURE BLACK — no stars, no gradient, no
moon, nothing at all. The horizon line is straight and level.

The clouds are lit from above by a low moon: cool blue-white on their tops, deep
blue-grey in their hollows. Soft, quiet, no drama, no storm, no towering
cumulus. Fine photographic grain.

No text, no lettering, no aircraft, no wing, no land, no water."""
req=urllib.request.Request("https://api.openai.com/v1/images/generations",
  data=json.dumps({"model":"gpt-image-2","prompt":PROMPT,"size":"1536x1024","quality":"high","n":1}).encode(),
  headers={"Authorization":"Bearer "+key,"Content-Type":"application/json"})
out=json.load(urllib.request.urlopen(req,timeout=900))
open(sys.argv[1],"wb").write(base64.b64decode(out["data"][0]["b64_json"]))
print("wrote",sys.argv[1])
