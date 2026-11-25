"""GET /api/u?h=<handle> — the newest version of one profile.

The profile page reads through here instead of a fixed Blob URL: the newest
version is found with the (uncached) list API, and each version lives at a
path that has never been requested before, so a page that was opened before
it was published — or deleted and re-created — never shows a cached 404.
"""
import json
import os
import re
import sys
from http.server import BaseHTTPRequestHandler
from urllib.parse import parse_qs, urlparse

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from macapi.blob import Blob  # noqa: E402
from macapi.service import latest_profile  # noqa: E402

HANDLE = re.compile(r"[a-z0-9](?:[a-z0-9-]{0,38})")


class handler(BaseHTTPRequestHandler):
    def _send(self, status, obj, cache):
        body = json.dumps(obj, ensure_ascii=False).encode()
        self.send_response(status)
        self.send_header("content-type", "application/json; charset=utf-8")
        # Public, read-only data: any page may read it.
        self.send_header("access-control-allow-origin", "*")
        self.send_header("cache-control", cache)
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        h = (parse_qs(urlparse(self.path).query).get("h") or [""])[0].lower()
        if not HANDLE.fullmatch(h):
            return self._send(404, {"ok": False}, "no-store")
        try:
            p = latest_profile(Blob(), h)
        except Exception as e:  # noqa: BLE001
            print("read failed:", repr(e))
            return self._send(502, {"ok": False}, "no-store")
        if p is None:
            return self._send(404, {"ok": False}, "no-store")
        # A few seconds of edge caching absorbs traffic spikes; updates show
        # up within that window.
        self._send(200, p, "public, s-maxage=5, stale-while-revalidate=30")
