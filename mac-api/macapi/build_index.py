"""Build the hub's index (people + app ranking + skill ranking) from profiles.

  people  one summary row per profile, most apps first
  apps    every app anyone shared, ranked by how many people use it, then by
          total launches across those people
  skills  the same, for Claude Code skills
"""
from datetime import datetime, timezone

OWNER = "iamzifei"


def build(profiles):
    """`profiles`: iterable of already-validated profile dicts."""
    people, apps, skills = [], {}, {}
    for p in profiles:
        mine = sorted(p.get("apps", []), key=lambda a: -(a.get("uses") or 0))
        people.append({
            "handle": p["handle"], "name": p.get("name") or p["handle"], "bio": p.get("bio"),
            "github": p.get("github"),
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
            if s.get("url") and p["handle"] == OWNER:
                r["url"] = s["url"]

    def rank(r):
        return (-r["people"], -r["uses"])

    people.sort(key=lambda r: (-r["apps"], r["handle"]))
    return {
        "builtAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "people": people,
        "apps": sorted(apps.values(), key=rank),
        "skills": sorted(skills.values(), key=rank),
    }
