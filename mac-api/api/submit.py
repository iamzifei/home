"""POST /api/submit — publish or update one jamesai.dev/mac profile.

Body: {"profile": {...}, "token": "<edit token, omit on first publish>"}
200 → {"ok": true, "handle", "url", "new", "token"?}
409 → handle taken (no or wrong token)   422 → validation errors
Called by mac/scan.py's local server, not by browsers: no CORS headers,
so other websites can't make visitors' browsers claim handles.
"""
import json
import os
import sys
from http.server import BaseHTTPRequestHandler

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from macapi.blob import Blob  # noqa: E402
from macapi.service import SubmitError, submit  # noqa: E402

MAX_BODY = 128 * 1024


class handler(BaseHTTPRequestHandler):
    def _send(self, status, obj):
        body = json.dumps(obj, ensure_ascii=False).encode()
        self.send_response(status)
        self.send_header("content-type", "application/json; charset=utf-8")
        self.send_header("cache-control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self):
        try:
            n = int(self.headers.get("content-length") or 0)
            if n <= 0 or n > MAX_BODY:
                return self._send(413, {"ok": False, "error": "too_large"})
            payload = json.loads(self.rfile.read(n))
            self._send(200, submit(Blob(), payload))
        except SubmitError as e:
            self._send(e.status, {"ok": False, "error": e.code, "detail": e.detail})
        except ValueError:
            self._send(400, {"ok": False, "error": "bad_json"})
        except Exception as e:  # noqa: BLE001
            print("submit failed:", repr(e))
            self._send(500, {"ok": False, "error": "server_error"})
