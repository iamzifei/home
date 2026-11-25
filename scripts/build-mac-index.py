#!/usr/bin/env python3
"""Build mac/index.json — the hub's data — from every mac/u/<handle>.json.

  people  one summary row per profile, most apps first
  apps    every app anyone shared, ranked by how many people use it, then by
          total launches across those people
  skills  the same, for Claude Code skills

Runs in CI after each merge (.github/workflows/mac-profiles.yml) and can be
run locally:  python3 scripts/build-mac-index.py
"""
import importlib.util
import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PROFILES = ROOT / "mac" / "u"
OUT = ROOT / "mac" / "index.json"
OWNER = "iamzifei"

# Reuse the PR validator so a malformed file that slipped past review is
# skipped here instead of breaking or polluting the hub.
_spec = importlib.util.spec_from_file_location("validate", ROOT / "scripts" / "validate-mac-profile.py")
validate = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(validate)


def main():
    people, apps, skills = [], {}, {}
    for f in sorted(PROFILES.glob("*.json")):
        errs = validate.check(f, None)
        if errs:  # one bad file must not stop the index
            print(f"skip {f.name}: {errs[0]}")
            continue
        p = json.loads(f.read_text())
        mine = sorted(p.get("apps", []), key=lambda a: -(a.get("uses") or 0))
        people.append({
            "handle": p["handle"], "name": p.get("name") or p["handle"], "bio": p.get("bio"),
            "apps": len(mine), "skills": len(p.get("skills", [])),
            "top": [a["id"] for a in mine[:6]], "scannedAt": p.get("scannedAt"),
        })
        for a in mine:
            r = apps.setdefault(a["id"], {"id": a["id"], "name": a.get("name"), "people": 0, "uses": 0})
            r["people"] += 1
            r["uses"] += a.get("uses") or 0
        for s in p.get("skills", []):
            r = skills.setdefault(s["name"], {"name": s["name"], "people": 0, "uses": 0})
            r["people"] += 1
            r["uses"] += s.get("uses") or 0
            # Skill links come only from the site owner's profile: otherwise any
            # contributor could repoint a shared skill name to their own repo.
            if s.get("url") and p["handle"].lower() == OWNER:
                r["url"] = s["url"]
    rank = lambda r: (-r["people"], -r["uses"])  # noqa: E731
    people.sort(key=lambda r: (-r["apps"], r["handle"].lower()))
    out = {
        "builtAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "people": people,
        "apps": sorted(apps.values(), key=rank),
        "skills": sorted(skills.values(), key=rank),
    }
    OUT.write_text(json.dumps(out, ensure_ascii=False, indent=1) + "\n")
    print(f"index: {len(people)} people · {len(apps)} apps · {len(skills)} skills")


if __name__ == "__main__":
    main()
