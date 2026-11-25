"""Tests for the jamesai.dev/mac profile pipeline.

Run:  python3 -m unittest discover -s tests
"""
import importlib.util
import json
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def load(name, rel):
    spec = importlib.util.spec_from_file_location(name, ROOT / rel)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


validate = load("validate", "scripts/validate-mac-profile.py")
index = load("index", "scripts/build-mac-index.py")


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
    def run_check(self, p, filename=None, author=None):
        with tempfile.TemporaryDirectory() as d:
            f = Path(d) / (filename or f"{p.get('handle', 'x')}.json")
            f.write_text(json.dumps(p))
            return validate.check(f, author)

    def test_valid_profile_passes(self):
        self.assertEqual(self.run_check(profile(), author="alice"), [])

    def test_owner_may_edit_anyone(self):
        self.assertEqual(self.run_check(profile(), author="iamzifei"), [])

    def test_other_author_rejected(self):
        errs = self.run_check(profile(), author="mallory")
        self.assertTrue(any("can only submit" in e for e in errs))

    def test_filename_must_match_handle(self):
        errs = self.run_check(profile(), filename="bob.json")
        self.assertTrue(any("must be named" in e for e in errs))

    def test_unknown_field_rejected(self):
        errs = self.run_check(profile(website="https://spam.example"))
        self.assertTrue(any("unknown fields" in e for e in errs))

    def test_app_limits(self):
        too_many = [{"id": f"a.{i}", "name": "x", "uses": 1, "last": None} for i in range(61)]
        self.assertTrue(self.run_check(profile(apps=too_many)))
        self.assertTrue(self.run_check(profile(apps=[{"id": "a", "name": "x", "uses": -1}])))
        self.assertTrue(self.run_check(profile(apps=[{"id": "a", "name": "x", "note": "y" * 141}])))

    def test_duplicate_app_rejected(self):
        a = {"id": "a", "name": "x", "uses": 1}
        errs = self.run_check(profile(apps=[a, dict(a)]))
        self.assertTrue(any("duplicate" in e for e in errs))

    def test_skill_url_must_be_github(self):
        errs = self.run_check(profile(skills=[{"name": "x", "uses": 1, "url": "https://evil.example"}]))
        self.assertTrue(any("github.com" in e for e in errs))

    def test_trailing_newline_handle_rejected(self):
        errs = self.run_check(profile(x="ab\n"))
        self.assertTrue(any("x:" in e for e in errs))

    def test_prototype_id_rejected(self):
        errs = self.run_check(profile(apps=[{"id": "__proto__", "name": "x", "uses": 1}]))
        self.assertTrue(any("bad id" in e for e in errs))

    def test_missing_file_is_failure(self):
        import subprocess, sys
        r = subprocess.run([sys.executable, str(ROOT / "scripts/validate-mac-profile.py"), "mac/u/does-not-exist.json"],
                           capture_output=True, text=True)
        self.assertEqual(r.returncode, 1)

    def test_cannot_delete_others_profile(self):
        import os, subprocess, sys
        cmd = [sys.executable, str(ROOT / "scripts/validate-mac-profile.py"), "--deleted", "mac/u/bob.json"]
        env = dict(os.environ, PR_AUTHOR="mallory")
        self.assertEqual(subprocess.run(cmd, env=env, capture_output=True).returncode, 1)
        env["PR_AUTHOR"] = "bob"
        self.assertEqual(subprocess.run(cmd, env=env, capture_output=True).returncode, 0)

    def test_owner_profile_on_disk_is_valid(self):
        f = ROOT / "mac" / "u" / "iamzifei.json"
        self.assertEqual(validate.check(f, "iamzifei"), [])


class IndexTest(unittest.TestCase):
    def test_ranks_by_people_then_uses(self):
        with tempfile.TemporaryDirectory() as d:
            u = Path(d) / "u"
            u.mkdir()
            a = profile(handle="alice", apps=[{"id": "x", "name": "X", "uses": 5}, {"id": "y", "name": "Y", "uses": 900}])
            b = profile(handle="bob", apps=[{"id": "x", "name": "X", "uses": 7}])
            (u / "alice.json").write_text(json.dumps(a))
            (u / "bob.json").write_text(json.dumps(b))
            index.PROFILES, index.OUT = u, Path(d) / "index.json"
            index.main()
            out = json.loads(index.OUT.read_text())
        self.assertEqual([r["id"] for r in out["apps"]], ["x", "y"])  # 2 people beats 900 launches
        self.assertEqual(out["apps"][0], {"id": "x", "name": "X", "people": 2, "uses": 12})
        self.assertEqual(out["skills"][0]["people"], 2)
        self.assertEqual(out["people"][0]["handle"], "alice")  # more apps first

    def test_skill_url_only_from_owner(self):
        with tempfile.TemporaryDirectory() as d:
            u = Path(d) / "u"
            u.mkdir()
            evil = profile(handle="mallory", skills=[{"name": "commit", "uses": 1, "url": "https://github.com/mallory/x"}])
            (u / "mallory.json").write_text(json.dumps(evil))
            index.PROFILES, index.OUT = u, Path(d) / "index.json"
            index.main()
            out = json.loads(index.OUT.read_text())
        self.assertNotIn("url", out["skills"][0])

    def test_invalid_profile_skipped_not_fatal(self):
        with tempfile.TemporaryDirectory() as d:
            u = Path(d) / "u"
            u.mkdir()
            (u / "broken.json").write_text("{not json")
            (u / "alice.json").write_text(json.dumps(profile()))
            index.PROFILES, index.OUT = u, Path(d) / "index.json"
            index.main()
            out = json.loads(index.OUT.read_text())
        self.assertEqual([p["handle"] for p in out["people"]], ["alice"])


if __name__ == "__main__":
    unittest.main()
