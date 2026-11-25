"""Tests for the jamesai.dev/mac submit pipeline (mac-api/macapi).

Run:  python3 -m unittest discover -s tests
"""
import json
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "mac-api"))

from macapi.blob import BlobExists  # noqa: E402
from macapi.build_index import build  # noqa: E402
from macapi.service import SubmitError, latest_profile, profile_versions, remove, submit  # noqa: E402
from macapi.validate import check  # noqa: E402


class FakeStore:
    """In-memory stand-in for macapi.blob.Blob."""

    def __init__(self, fail_on=()):
        self.files = {}
        self.fail_on = set(fail_on)

    def put(self, path, data, content_type="application/json", overwrite=True):
        if not overwrite and path in self.files:
            raise BlobExists(path)
        if any(path.startswith(f) for f in self.fail_on):
            raise OSError("blob 503")
        self.files[path] = data
        return "mem://" + path

    def list(self, prefix):
        return [{"pathname": p, "url": "mem://" + p} for p in sorted(self.files) if p.startswith(prefix)]

    def delete(self, urls):
        for u in urls:
            self.files.pop(u[len("mem://"):], None)

    def get(self, url):
        return self.files[url[len("mem://"):]]

    def json(self, path):
        return json.loads(self.files[path])


def profile(**over):
    p = {
        "v": 1, "handle": "alice", "name": "Alice", "scannedAt": "2026-11-26T00:00:00+00:00",
        "skillsDays": 30,
        "apps": [{"id": "com.google.Chrome", "name": "Google Chrome", "uses": 12, "last": "2026-11-25T00:00:00+00:00"}],
        "skills": [{"name": "humanizer-zh", "uses": 3}],
    }
    p.update(over)
    return p


class ValidateTest(unittest.TestCase):
    def test_valid_profile_passes(self):
        self.assertEqual(check(profile()), [])

    def test_uppercase_handle_rejected(self):
        self.assertTrue(check(profile(handle="Alice")))

    def test_unknown_field_rejected(self):
        self.assertTrue(any("unknown fields" in e for e in check(profile(website="https://spam.example"))))

    def test_app_limits(self):
        too_many = [{"id": f"a.{i}", "name": "x", "uses": 1, "last": None} for i in range(61)]
        self.assertTrue(check(profile(apps=too_many)))
        self.assertTrue(check(profile(apps=[{"id": "a", "name": "x", "uses": -1}])))
        self.assertTrue(check(profile(apps=[{"id": "a", "name": "x", "uses": True}])))
        self.assertTrue(check(profile(apps=[{"id": "a", "name": "x", "note": "y" * 141}])))

    def test_duplicate_and_prototype_ids_rejected(self):
        a = {"id": "a", "name": "x", "uses": 1}
        self.assertTrue(any("duplicate" in e for e in check(profile(apps=[a, dict(a)]))))
        self.assertTrue(any("bad id" in e for e in check(profile(apps=[{"id": "__proto__", "name": "x"}]))))

    def test_bool_numbers_rejected(self):
        self.assertTrue(check(profile(v=True)))
        self.assertTrue(check(profile(skillsDays=True)))

    def test_trailing_newline_rejected(self):
        self.assertTrue(check(profile(x="ab\n")))
        self.assertTrue(check(profile(handle="alice\n")))

    def test_skill_url_must_be_github(self):
        self.assertTrue(check(profile(skills=[{"name": "x", "uses": 1, "url": "javascript:alert(1)"}])))


class SubmitTest(unittest.TestCase):
    def test_first_submit_claims_handle_and_returns_token(self):
        s = FakeStore()
        r = submit(s, {"profile": profile()})
        self.assertTrue(r["new"])
        self.assertGreater(len(r["token"]), 30)
        self.assertEqual(latest_profile(s, "alice")["name"], "Alice")
        stored = [p for p in s.files if p.startswith("keys/alice/")]
        self.assertEqual(len(stored), 1)
        self.assertNotIn(r["token"], stored[0])  # only the hash is stored
        self.assertEqual(s.json("index.json")["people"][0]["handle"], "alice")

    def test_handle_is_lowercased(self):
        s = FakeStore()
        self.assertEqual(submit(s, {"profile": profile(handle="  Alice ")})["handle"], "alice")

    def test_update_needs_the_token(self):
        s = FakeStore()
        tok = submit(s, {"profile": profile()})["token"]
        with self.assertRaises(SubmitError) as e:
            submit(s, {"profile": profile(name="Mallory")})
        self.assertEqual(e.exception.code, "handle_taken")
        with self.assertRaises(SubmitError):
            submit(s, {"profile": profile(name="Mallory"), "token": "guess"})
        r = submit(s, {"profile": profile(name="Alice 2"), "token": tok})
        self.assertFalse(r["new"])
        self.assertNotIn("token", r)
        self.assertEqual(latest_profile(s, "alice")["name"], "Alice 2")
        self.assertEqual(len(profile_versions(s, "alice")), 1)  # old version deleted

    def test_invalid_profile_stores_nothing(self):
        s = FakeStore()
        with self.assertRaises(SubmitError) as e:
            submit(s, {"profile": profile(apps=[])})
        self.assertEqual(e.exception.status, 422)
        self.assertEqual(s.files, {})

    def test_index_counts_everyone(self):
        s = FakeStore()
        submit(s, {"profile": profile(handle="alice")})
        submit(s, {"profile": profile(handle="bob", apps=[{"id": "com.google.Chrome", "name": "C", "uses": 5}])})
        idx = s.json("index.json")
        self.assertEqual(idx["apps"][0], {"id": "com.google.Chrome", "name": "Google Chrome", "people": 2, "uses": 17})
        self.assertEqual(len(idx["people"]), 2)

    def test_corrupt_stored_profile_skipped(self):
        s = FakeStore()
        s.files["u/broken/0000000000001.json"] = b"{not json"
        submit(s, {"profile": profile()})
        self.assertEqual([p["handle"] for p in s.json("index.json")["people"]], ["alice"])

    def test_unstorable_text_rejected_before_claim(self):
        s = FakeStore()
        with self.assertRaises(SubmitError) as e:
            submit(s, {"profile": profile(name="\ud800")})
        self.assertEqual(e.exception.status, 422)
        self.assertEqual(s.files, {})  # handle not claimed

    def test_failed_profile_write_releases_claim(self):
        s = FakeStore(fail_on={"u/alice/"})
        with self.assertRaises(OSError):
            submit(s, {"profile": profile()})
        self.assertNotIn("owners/alice.txt", s.files)
        self.assertFalse([p for p in s.files if p.startswith("keys/")])
        s.fail_on.clear()
        self.assertTrue(submit(s, {"profile": profile()})["new"])  # retry can claim it

    def test_failed_index_still_returns_token(self):
        s = FakeStore(fail_on={"index.json"})
        r = submit(s, {"profile": profile()})
        self.assertIn("token", r)
        self.assertIsNotNone(latest_profile(s, "alice"))

    def test_unreadable_profile_keeps_old_index(self):
        s = FakeStore()
        submit(s, {"profile": profile(handle="bob")})
        old = s.files["index.json"]
        real_get = s.get
        s.get = lambda url: (_ for _ in ()).throw(OSError("blob 500")) if "/u/bob/" in url else real_get(url)
        submit(s, {"profile": profile(handle="carol")})
        self.assertEqual(s.files["index.json"], old)  # rebuild aborted, nobody dropped

    def test_remove(self):
        s = FakeStore()
        submit(s, {"profile": profile()})
        self.assertEqual(remove(s, "alice"), 3)
        self.assertEqual(s.json("index.json")["people"], [])


class IndexTest(unittest.TestCase):
    def test_ranks_by_people_then_uses(self):
        a = profile(handle="alice", apps=[{"id": "x", "name": "X", "uses": 5}, {"id": "y", "name": "Y", "uses": 900}])
        b = profile(handle="bob", apps=[{"id": "x", "name": "X", "uses": 7}])
        out = build([a, b])
        self.assertEqual([r["id"] for r in out["apps"]], ["x", "y"])  # 2 people beats 900 launches
        self.assertEqual(out["people"][0]["handle"], "alice")  # more apps first

    def test_skill_url_only_from_owner(self):
        evil = profile(handle="mallory", skills=[{"name": "commit", "uses": 1, "url": "https://github.com/mallory/x"}])
        self.assertNotIn("url", build([evil])["skills"][0])
        own = profile(handle="iamzifei", skills=[{"name": "commit", "uses": 1, "url": "https://github.com/iamzifei/x"}])
        self.assertEqual(build([own])["skills"][0]["url"], "https://github.com/iamzifei/x")


class ScannerTest(unittest.TestCase):
    """The scanner and the API must agree on which app ids are valid."""

    def test_valid_id_rule_matches_validator(self):
        import importlib.util
        spec = importlib.util.spec_from_file_location("scan", ROOT / "mac" / "scan.py")
        scan = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(scan)
        from macapi import validate
        self.assertEqual(scan.VALID_ID.pattern, validate.APP_ID.pattern)


if __name__ == "__main__":
    unittest.main()
