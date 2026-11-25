"""Minimal Vercel Blob client over its REST API (stdlib only).

Layout in the store (all public-read, written only by this API):
  u/<handle>/<ms>.json   a profile; every write is a new path, older ones deleted
  owners/<handle>.txt    the claim on a handle (written once, no overwrite)
  keys/<handle>/<sha256> the edit token's hash, as the blob's NAME
  index.json             the hub's rankings, rebuilt on every submit

Reads of an overwritten path can be served stale by the CDN for up to
CACHE_SECONDS; a path written for the first time is fresh immediately.
"""
import json
import os
import urllib.error
import urllib.parse
import urllib.request

API = "https://blob.vercel-storage.com"
CACHE_SECONDS = 60
# v11 is needed for "x-allow-overwrite: 0" to be enforced (v7 silently
# overwrites — measured 2026-11-26), and it takes the pathname as a query.
API_VERSION = "11"


class BlobExists(Exception):
    """A no-overwrite put hit an existing path."""


class Blob:
    def __init__(self, token=None):
        self.token = token or os.environ["BLOB_READ_WRITE_TOKEN"]

    def _req(self, method, url, body=None, headers=None):
        h = {"authorization": f"Bearer {self.token}", "x-api-version": API_VERSION}
        h.update(headers or {})
        req = urllib.request.Request(url, data=body, method=method, headers=h)
        with urllib.request.urlopen(req, timeout=20) as r:
            return json.loads(r.read() or b"null")

    def put(self, path, data: bytes, content_type="application/json", overwrite=True):
        """Write a blob. overwrite=False fails if the path exists (an atomic claim)."""
        try:
            return self._req("PUT", f"{API}/?pathname={urllib.parse.quote(path)}", data, {
                "x-content-type": content_type,
                "x-add-random-suffix": "0",
                "x-allow-overwrite": "1" if overwrite else "0",
                "x-cache-control-max-age": str(CACHE_SECONDS),
            })["url"]
        except urllib.error.HTTPError as e:
            body = e.read().decode(errors="ignore")
            if not overwrite and "already exists" in body:
                raise BlobExists(path) from None
            raise

    def list(self, prefix):
        """All blobs under prefix (the list endpoint itself is not CDN-cached)."""
        out, cursor = [], None
        while True:
            q = f"{API}?prefix={prefix}&limit=1000" + (f"&cursor={cursor}" if cursor else "")
            page = self._req("GET", q)
            out.extend(page["blobs"])
            if not page.get("hasMore"):
                return out
            cursor = page["cursor"]

    def delete(self, urls):
        if urls:
            self._req("POST", f"{API}/delete", json.dumps({"urls": urls}).encode(),
                      {"content-type": "application/json"})

    @staticmethod
    def get(url):
        with urllib.request.urlopen(url, timeout=20) as r:
            return r.read()
