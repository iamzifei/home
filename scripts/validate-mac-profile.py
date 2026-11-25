#!/usr/bin/env python3
"""Validate submitted profiles under mac/u/ before they can be merged.

Usage:
    python3 scripts/validate-mac-profile.py mac/u/alice.json [...]
    PR_AUTHOR=alice python3 scripts/validate-mac-profile.py mac/u/alice.json

Checks shape and limits only. The numbers themselves are taken on trust
(decided 2026-11-26: honesty first, no third-party verification). The one
identity check: a pull request may only add or change the file named after
its own GitHub account, unless the author is the site owner.
"""
import json
import os
import re
import sys
from typing import Optional
from datetime import datetime
from pathlib import Path

OWNER = "iamzifei"
HANDLE = re.compile(r"^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$")
APP_ID = re.compile(r"^[A-Za-z0-9._\- ]{1,200}$")
SKILL = re.compile(r"^[\w.\-]+(?::[\w.\-]+)?$")
X_HANDLE = re.compile(r"^[A-Za-z0-9_]{1,15}$")
RESERVED_IDS = {"__proto__", "constructor", "prototype", "hasOwnProperty", "toString", "valueOf"}
CATS = {"ai", "dev", "web", "chat", "work", "media", "files", "mine", "other"}
LANGS = {"zh-Hans", "zh-Hant", "en"}

TOP_KEYS = {"v", "handle", "name", "bio", "x", "scannedAt", "skillsDays", "apps", "skills"}
APP_KEYS = {"id", "name", "uses", "last", "cat", "note"}
SKILL_KEYS = {"name", "uses", "note", "url"}


def is_iso(v):
    try:
        datetime.fromisoformat(str(v).replace("Z", "+00:00"))
        return True
    except ValueError:
        return False


def text_ok(v, limit):
    """A plain string, or a {lang: string} object (used by the owner's own profile)."""
    if isinstance(v, str):
        return len(v) <= limit
    if isinstance(v, dict):
        return set(v) <= LANGS and all(isinstance(s, str) and len(s) <= limit for s in v.values())
    return False


def check(path: Path, author: Optional[str]):
    errs = []
    try:
        p = json.loads(path.read_text(encoding="utf-8"))
    except Exception as e:  # noqa: BLE001
        return [f"not valid JSON: {e}"]
    if not isinstance(p, dict):
        return ["top level must be an object"]
    extra = set(p) - TOP_KEYS
    if extra:
        errs.append(f"unknown fields: {sorted(extra)}")
    if p.get("v") != 1:
        errs.append("v must be 1")
    h = p.get("handle")
    if not isinstance(h, str) or not HANDLE.fullmatch(h):
        errs.append("handle must be a GitHub username")
    elif path.stem != h:
        errs.append(f"file must be named {h}.json")
    elif author and author.lower() not in (h.lower(), OWNER):
        errs.append(f"@{author} can only submit mac/u/{author}.json")
    if not text_ok(p.get("name", ""), 40):
        errs.append("name: string, max 40 chars")
    if "bio" in p and not text_ok(p["bio"], 160):
        errs.append("bio: string, max 160 chars")
    if "x" in p and not (isinstance(p["x"], str) and X_HANDLE.fullmatch(p["x"])):
        errs.append("x: X/Twitter handle without @")
    if not is_iso(p.get("scannedAt", "")):
        errs.append("scannedAt must be an ISO date")
    if "skillsDays" in p and not (isinstance(p["skillsDays"], int) and 1 <= p["skillsDays"] <= 365):
        errs.append("skillsDays: 1-365")

    apps = p.get("apps")
    if not isinstance(apps, list) or not 1 <= len(apps) <= 60:
        errs.append("apps: list of 1-60")
        apps = []
    seen = set()
    for i, a in enumerate(apps):
        w = f"apps[{i}]"
        if not isinstance(a, dict):
            errs.append(f"{w}: must be an object"); continue
        if set(a) - APP_KEYS:
            errs.append(f"{w}: unknown fields {sorted(set(a) - APP_KEYS)}")
        if not (isinstance(a.get("id"), str) and APP_ID.fullmatch(a["id"])) or a.get("id") in RESERVED_IDS:
            errs.append(f"{w}: bad id")
        elif a["id"] in seen:
            errs.append(f"{w}: duplicate id {a['id']}")
        seen.add(a.get("id"))
        if not (isinstance(a.get("name"), str) and 1 <= len(a["name"]) <= 60):
            errs.append(f"{w}: name 1-60 chars")
        u = a.get("uses")
        if u is not None and not (isinstance(u, int) and 0 <= u <= 10_000_000):
            errs.append(f"{w}: uses must be 0-10,000,000 or null")
        if a.get("last") is not None and not is_iso(a["last"]):
            errs.append(f"{w}: last must be ISO or null")
        if "cat" in a and a["cat"] not in CATS:
            errs.append(f"{w}: cat must be one of {sorted(CATS)}")
        if "note" in a and not (isinstance(a["note"], str) and len(a["note"]) <= 140):
            errs.append(f"{w}: note max 140 chars")

    skills = p.get("skills", [])
    if not isinstance(skills, list) or len(skills) > 50:
        errs.append("skills: list of at most 50"); skills = []
    for i, s in enumerate(skills):
        w = f"skills[{i}]"
        if not isinstance(s, dict) or set(s) - SKILL_KEYS:
            errs.append(f"{w}: object with {sorted(SKILL_KEYS)}"); continue
        if not (isinstance(s.get("name"), str) and len(s["name"]) <= 80 and SKILL.fullmatch(s["name"])):
            errs.append(f"{w}: bad name")
        if not (isinstance(s.get("uses"), int) and 0 <= s["uses"] <= 1_000_000):
            errs.append(f"{w}: uses 0-1,000,000")
        if "note" in s and not (isinstance(s["note"], str) and len(s["note"]) <= 140):
            errs.append(f"{w}: note max 140 chars")
        if "url" in s and not (isinstance(s["url"], str) and s["url"].startswith("https://github.com/")):
            errs.append(f"{w}: url must start with https://github.com/")
    return errs


def main():
    # --deleted <path>…: files this PR removes. Only the owner may remove others'.
    args = sys.argv[1:]
    author = os.environ.get("PR_AUTHOR") or None
    if args and args[0] == "--deleted":
        bad = [a for a in args[1:] if author and author.lower() not in (Path(a).stem.lower(), OWNER)]
        for a in bad:
            print(f"FAIL {a}\n     - @{author} cannot delete someone else's profile")
        sys.exit(1 if bad else 0)
    author = os.environ.get("PR_AUTHOR") or None
    failed = False
    for arg in args:
        path = Path(arg)
        if not path.exists():
            print(f"FAIL {path}\n     - file not found")
            failed = True
            continue
        errs = check(path, author)
        print(("FAIL " if errs else "ok   ") + str(path))
        for e in errs:
            print("     - " + e)
        failed |= bool(errs)
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
