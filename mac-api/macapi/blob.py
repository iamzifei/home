"""Minimal Vercel Blob client over its REST API (stdlib only).

Layout in the store (all public-read, written only by this API):
  u/<handle>.json        a profile
  owners/<handle>.txt    sha256 of that handle's edit token (never overwritten)
  index.json             the hub's rankings, rebuilt on every submit

Reads of an overwritten path can be served stale by the CDN for up to
CACHE_SECONDS; a path written for the first time is fresh immediately.
"""
import json
import os
import urllib.request

API = "https://blob.vercel-storage.com"
CACHE_SECONDS = 60


class Blob:
    def __init__(self, token=None):
        self.token = token or os.environ["BLOB_READ_WRITE_TOKEN"]

    def _req(self, method, url, body=None, headers=None):
        h = {"authorization": f"Bearer {self.token}", "x-api-version": "7"}
        h.update(headers or {})
        req = urllib.request.Request(url, data=body, method=method, headers=h)
        with urllib.request.urlopen(req, timeout=20) as r:
            return json.loads(r.read() or b"null")

    def put(self, path, data: bytes, content_type="application/json", overwrite=True):
        """Write a blob. overwrite=False fails if the path exists (an atomic claim)."""
        return self._req("PUT", f"{API}/{path}", data, {
            "x-content-type": content_type,
            "x-add-random-suffix": "0",
            "x-allow-overwrite": "1" if overwrite else "0",
            "x-cache-control-max-age": str(CACHE_SECONDS),
        })["url"]

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
