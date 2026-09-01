#!/usr/bin/env python3
"""Generate one mono-color plate from a prompt file.

    python3 tools/gen-plate.py <prompt.txt> <out.png> [ratio]

The plates on this site have never been "an image with an effect applied" —
there is no source photograph anywhere in the pipeline. Each one is written as
a prompt in the mono-color skill's five parts (canvas and inks / composition /
subject / text / material and prohibitions) and generated from nothing.

WHAT COMES BACK, AND WHY tools/mono-plate.py EXISTS
The model returns the plate as a PHOTOGRAPH OF A SHEET lying on a grey desk,
with a cast shadow — exactly the mockup the skill forbids. Re-rolling did not
fix it last time and cost four calls; cropping the sheet out afterwards is
deterministic. So this script only fetches, and mono-plate.py does the crop.
"""
import base64
import json
import os
import pathlib
import sys
import urllib.request

MODEL = "gemini-3-pro-image-preview"          # the house default, see ~/.claude/CLAUDE.md


def key():
    for line in open(os.path.expanduser("~/.env")):
        if line.startswith("GEMINI_API_KEY"):
            return line.split("=", 1)[1].strip().strip('"').strip("'")
    raise SystemExit("GEMINI_API_KEY not in ~/.env")


def main():
    prompt = pathlib.Path(sys.argv[1]).read_text()
    out = pathlib.Path(sys.argv[2])
    ratio = sys.argv[3] if len(sys.argv) > 3 else "3:2"

    body = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"responseModalities": ["IMAGE"],
                             "imageConfig": {"aspectRatio": ratio}},
    }
    url = ("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s"
           % (MODEL, key()))
    req = urllib.request.Request(url, data=json.dumps(body).encode(),
                                 headers={"Content-Type": "application/json"})
    try:
        res = json.load(urllib.request.urlopen(req, timeout=300))
    except urllib.error.HTTPError as e:
        print(e.read().decode()[:900], file=sys.stderr)
        raise SystemExit(1)

    for part in res["candidates"][0]["content"]["parts"]:
        if "inlineData" in part:
            out.write_bytes(base64.b64decode(part["inlineData"]["data"]))
            print("%s  %s  %d KB" % (out, ratio, out.stat().st_size // 1024))
            return
    print(json.dumps(res)[:900], file=sys.stderr)
    raise SystemExit("no image in response")


if __name__ == "__main__":
    main()
