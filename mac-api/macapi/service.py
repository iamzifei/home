"""Submit logic, kept free of HTTP so it can be unit-tested with a fake store.

Ownership without accounts: the first submission for a handle gets a random
edit token back. The scanner saves it on that Mac (~/.config/jamesai/mac.json)
and sends it with later submissions; the store keeps only its sha256. Anyone
without the token gets "handle taken" and picks another name.
"""
import hashlib
import json
import secrets
from concurrent.futures import ThreadPoolExecutor

from .build_index import build
from .validate import check

SITE = "https://jamesai.dev/mac/u/?h="


class SubmitError(Exception):
    def __init__(self, status, code, detail=None):
        super().__init__(code)
        self.status, self.code, self.detail = status, code, detail


def _hash(token):
    return hashlib.sha256(token.encode()).hexdigest()


def rebuild_index(store, fresh=None):
    """Rebuild index.json from every stored profile. `fresh` (the profile just
    written) is used as given, since the store may serve it stale for up to a
    minute; the others may lag by that window."""
    skip = f"u/{fresh['handle']}.json" if fresh else None
    blobs = [b for b in store.list("u/") if b["pathname"].endswith(".json") and b["pathname"] != skip]

    def load(b):
        try:
            p = json.loads(store.get(b["url"]))
            return p if not check(p) else None
        except Exception:  # noqa: BLE001 — one unreadable profile must not block a submit
            return None

    with ThreadPoolExecutor(max_workers=16) as pool:
        profiles = [p for p in pool.map(load, blobs) if p]
    if fresh:
        profiles.append(fresh)
    store.put("index.json", json.dumps(build(profiles), ensure_ascii=False).encode())


def remove(store, handle):
    """Admin: delete a profile and its claim, then rebuild the index."""
    urls = [b["url"] for b in store.list(f"u/{handle}.json") + store.list(f"owners/{handle}.txt")
            if b["pathname"] in (f"u/{handle}.json", f"owners/{handle}.txt")]
    store.delete(urls)
    rebuild_index(store)
    return len(urls)


def submit(store, payload):
    """payload = {"profile": {...}, "token": optional str}. Returns a dict for the client."""
    if not isinstance(payload, dict):
        raise SubmitError(400, "bad_request")
    profile = payload.get("profile")
    if isinstance(profile, dict) and isinstance(profile.get("handle"), str):
        profile["handle"] = profile["handle"].strip().lower()
    errs = check(profile)
    if errs:
        raise SubmitError(422, "invalid", errs)
    handle = profile["handle"]

    # --- ownership -----------------------------------------------------------
    owner = [b for b in store.list(f"owners/{handle}.txt") if b["pathname"] == f"owners/{handle}.txt"]
    token, new = payload.get("token"), False
    if owner:
        stored = store.get(owner[0]["url"]).decode().strip()
        if not (isinstance(token, str) and secrets.compare_digest(_hash(token), stored)):
            raise SubmitError(409, "handle_taken")
    else:
        token, new = secrets.token_urlsafe(32), True
        try:
            # No overwrite: if two people claim the same new handle at once,
            # only the first write succeeds.
            store.put(f"owners/{handle}.txt", _hash(token).encode(), "text/plain", overwrite=False)
        except Exception:  # noqa: BLE001
            raise SubmitError(409, "handle_taken")

    store.put(f"u/{handle}.json", json.dumps(profile, ensure_ascii=False).encode())

    rebuild_index(store, fresh=profile)

    out = {"ok": True, "handle": handle, "url": SITE + handle, "new": new}
    if new:
        out["token"] = token
    return out
