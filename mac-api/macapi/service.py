"""Submit logic, kept free of HTTP so it can be unit-tested with a fake store.

Ownership without accounts: the first submission for a handle claims
owners/<handle>.txt (no-overwrite, so only one claimant wins) and gets a random
edit token back. The scanner saves it on that Mac (~/.config/jamesai/mac.json)
and sends it with later submissions; the store keeps only its sha256, as the
name of keys/<handle>/<sha256>. Anyone
without the token gets "handle taken" and picks another name.
"""
import hashlib
import json
import secrets
import time
import urllib.error
from concurrent.futures import ThreadPoolExecutor

from .blob import BlobExists
from .build_index import build
from .validate import check

SITE = "https://jamesai.dev/mac/u/?h="
MAX_HANDLES = 5000  # hard ceiling on pages until there is real rate limiting


class SubmitError(Exception):
    def __init__(self, status, code, detail=None):
        super().__init__(code)
        self.status, self.code, self.detail = status, code, detail


def profile_versions(store, handle):
    """Stored versions of one profile, newest last. Each write goes to a new
    path u/<handle>/<ms>.json, so no reader ever gets a stale or cached-404 copy."""
    return sorted((b for b in store.list(f"u/{handle}/") if b["pathname"].endswith(".json")),
                  key=lambda b: b["pathname"])


def latest_profile(store, handle):
    """The newest stored profile dict for handle, or None."""
    v = profile_versions(store, handle)
    return json.loads(store.get(v[-1]["url"])) if v else None


def _hash(token):
    return hashlib.sha256(token.encode()).hexdigest()


def rebuild_index(store, fresh=None):
    """Rebuild index.json from every stored profile. `fresh` (the profile just
    written) is used as given, since the store may serve it stale for up to a
    minute; the others may lag by that window."""
    skip = fresh["handle"] if fresh else None
    newest = {}  # handle -> newest version blob
    for b in store.list("u/"):
        parts = b["pathname"].split("/")
        if len(parts) == 3 and parts[2].endswith(".json") and parts[1] != skip:
            if parts[1] not in newest or b["pathname"] > newest[parts[1]]["pathname"]:
                newest[parts[1]] = b
    blobs = list(newest.values())

    def load(b):
        # A read failure raises and aborts the rebuild, keeping the previous
        # index, so a transient error never silently drops someone from the hub.
        # Only content that is permanently bad (not JSON / invalid) is skipped.
        try:
            raw = store.get(b["url"])
        except urllib.error.HTTPError as e:
            if e.code == 404:  # deleted (or a cached 404): not a transient failure
                return None
            raise
        try:
            p = json.loads(raw)
        except ValueError:
            return None
        return p if not check(p) else None

    with ThreadPoolExecutor(max_workers=16) as pool:
        profiles = [p for p in pool.map(load, blobs) if p]
    if fresh:
        profiles.append(fresh)
    store.put("index.json", json.dumps(build(profiles), ensure_ascii=False).encode())


def remove(store, handle):
    """Admin: delete a profile and its claim, then rebuild the index."""
    urls = [b["url"] for b in store.list(f"u/{handle}/") + store.list(f"owners/{handle}.txt") + store.list(f"keys/{handle}/")
            if b["pathname"] == f"owners/{handle}.txt" or b["pathname"].startswith((f"u/{handle}/", f"keys/{handle}/"))]
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

    try:
        # Serialize before claiming anything: a value that can't be stored
        # (e.g. a lone surrogate) must fail here, not after the handle is taken.
        body = json.dumps(profile, ensure_ascii=False).encode("utf-8")
    except (UnicodeEncodeError, ValueError):
        raise SubmitError(422, "invalid", ["text contains characters that can't be stored"])

    # --- ownership -----------------------------------------------------------
    # The key's hash lives in the *pathname* (keys/<handle>/<sha256>), so
    # checking it needs only the list API, which is never CDN-cached. Reading
    # a blob's body through its public URL can return a cached 404 for a path
    # that was deleted and re-created (seen in production 2026-11-26).
    keys = [b["pathname"].rsplit("/", 1)[1] for b in store.list(f"keys/{handle}/")]
    token, new = payload.get("token"), False
    if keys:
        if not (isinstance(token, str) and any(secrets.compare_digest(_hash(token), k) for k in keys)):
            raise SubmitError(409, "handle_taken")
    else:
        if len(store.list("owners/")) >= MAX_HANDLES:
            raise SubmitError(503, "full")
        token, new = secrets.token_urlsafe(32), True
        try:
            # No overwrite: if two people claim the same new handle at once,
            # only the first write succeeds.
            store.put(f"owners/{handle}.txt", b"claimed", "text/plain", overwrite=False)
        except BlobExists:
            raise SubmitError(409, "handle_taken")
        store.put(f"keys/{handle}/{_hash(token)}", b"", "text/plain")

    old = profile_versions(store, handle)
    try:
        # Time-ordered and unique: two writes in the same millisecond must not
        # share a path, or the cleanup below would delete the new one.
        new_path = f"u/{handle}/{int(time.time() * 1000):013d}-{secrets.token_hex(4)}.json"
        store.put(new_path, body)
    except Exception:
        if new:  # roll the claim back so a retry can claim it again
            store.delete([b["url"] for b in store.list(f"owners/{handle}.txt") + store.list(f"keys/{handle}/")
                          if b["pathname"] == f"owners/{handle}.txt" or b["pathname"].startswith(f"keys/{handle}/")])
        raise

    try:
        store.delete([b["url"] for b in old if b["pathname"] != new_path])  # keep only the newest
    except Exception as e:  # noqa: BLE001
        print("old version cleanup failed:", repr(e))

    # The page is stored; from here on the client must get its token back,
    # so a failed index rebuild is logged, not returned as an error.
    try:
        rebuild_index(store, fresh=profile)
    except Exception as e:  # noqa: BLE001
        print("index rebuild failed:", repr(e))

    out = {"ok": True, "handle": handle, "url": SITE + handle, "new": new}
    if new:
        out["token"] = token
    return out
