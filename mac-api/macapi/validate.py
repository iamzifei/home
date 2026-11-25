"""Shape and limit checks for a jamesai.dev/mac profile.

Used by the submit API (api/submit.py) before anything is stored, and by the
tests. The numbers themselves are taken on trust (James, 2026-11-26: honesty
first, no third-party verification); this only guarantees every field is the
type and size the pages expect, so nothing a visitor submits can break or
inject into the site.
"""
import re
from datetime import datetime

# Handles are lowercase so "Alice" and "alice" can never be two pages.
HANDLE = re.compile(r"[a-z0-9](?:[a-z0-9-]{0,38})")
APP_ID = re.compile(r"[A-Za-z0-9._\- ]{1,200}")
SKILL = re.compile(r"[\w.\-]+(?::[\w.\-]+)?")
X_HANDLE = re.compile(r"[A-Za-z0-9_]{1,15}")
GITHUB = re.compile(r"[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})")
# Ids that would hit Object.prototype when the pages look them up.
RESERVED_IDS = {"__proto__", "constructor", "prototype", "hasOwnProperty", "toString", "valueOf"}
CATS = {"ai", "dev", "web", "chat", "work", "media", "files", "mine", "other"}
LANGS = {"zh-Hans", "zh-Hant", "en"}

TOP_KEYS = {"v", "handle", "name", "bio", "x", "github", "scannedAt", "skillsDays", "apps", "skills"}
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


def check(p):
    """Return a list of problems with profile dict `p`; empty means valid."""
    if not isinstance(p, dict):
        return ["top level must be an object"]
    errs = []
    extra = set(p) - TOP_KEYS
    if extra:
        errs.append(f"unknown fields: {sorted(extra)}")
    if p.get("v") != 1 or isinstance(p.get("v"), bool):
        errs.append("v must be 1")
    if not (isinstance(p.get("handle"), str) and HANDLE.fullmatch(p["handle"])):
        errs.append("handle: 1-39 lowercase letters, digits or -")
    if not text_ok(p.get("name", ""), 40):
        errs.append("name: string, max 40 chars")
    if "bio" in p and not text_ok(p["bio"], 160):
        errs.append("bio: string, max 160 chars")
    if "x" in p and not (isinstance(p["x"], str) and X_HANDLE.fullmatch(p["x"])):
        errs.append("x: X/Twitter handle without @")
    if "github" in p and not (isinstance(p["github"], str) and GITHUB.fullmatch(p["github"])):
        errs.append("github: GitHub username")
    if not is_iso(p.get("scannedAt", "")):
        errs.append("scannedAt must be an ISO date")
    if "skillsDays" in p and not (type(p["skillsDays"]) is int and 1 <= p["skillsDays"] <= 365):
        errs.append("skillsDays: 1-365")

    apps = p.get("apps")
    if not isinstance(apps, list) or not 1 <= len(apps) <= 60:
        errs.append("apps: list of 1-60")
        apps = []
    seen = set()
    for i, a in enumerate(apps):
        w = f"apps[{i}]"
        if not isinstance(a, dict):
            errs.append(f"{w}: must be an object")
            continue
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
        if u is not None and not (isinstance(u, int) and not isinstance(u, bool) and 0 <= u <= 10_000_000):
            errs.append(f"{w}: uses must be 0-10,000,000 or null")
        if a.get("last") is not None and not is_iso(a["last"]):
            errs.append(f"{w}: last must be ISO or null")
        if "cat" in a and a["cat"] not in CATS:
            errs.append(f"{w}: cat must be one of {sorted(CATS)}")
        if "note" in a and not (isinstance(a["note"], str) and len(a["note"]) <= 140):
            errs.append(f"{w}: note max 140 chars")

    skills = p.get("skills", [])
    if not isinstance(skills, list) or len(skills) > 50:
        errs.append("skills: list of at most 50")
        skills = []
    for i, s in enumerate(skills):
        w = f"skills[{i}]"
        if not isinstance(s, dict) or set(s) - SKILL_KEYS:
            errs.append(f"{w}: object with {sorted(SKILL_KEYS)}")
            continue
        if not (isinstance(s.get("name"), str) and len(s["name"]) <= 80 and SKILL.fullmatch(s["name"])):
            errs.append(f"{w}: bad name")
        if not (isinstance(s.get("uses"), int) and not isinstance(s.get("uses"), bool) and 0 <= s["uses"] <= 1_000_000):
            errs.append(f"{w}: uses 0-1,000,000")
        if "note" in s and not (isinstance(s["note"], str) and len(s["note"]) <= 140):
            errs.append(f"{w}: note max 140 chars")
        if "url" in s and not (isinstance(s["url"], str) and s["url"].startswith("https://github.com/")):
            errs.append(f"{w}: url must start with https://github.com/")
    return errs
