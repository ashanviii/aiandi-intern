import contextlib
import io
import json
import http.client
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
import urllib.error

import classify_comments as moderator


ANSWER = {"choice": "acceptable", "probabilities": {"acceptable": 0.8, "toxic": 0.1, "spam": 0.1}, "confidence": 0.7}


class ModeratorTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.data = {"course": "Test", "forum": "Forum", "comments": [
            {"id": i, "author": "Student", "thread": "Doubts", "posted_at": "2026-10-27",
             "comment": '<script>alert("x")</script> Hindi: हिंदी ₹ 🙂'} for i in (1, 2)]}
        self.source = self.root / "comments.json"
        self.source.write_text(json.dumps(self.data), encoding="utf-8")
        self.results = self.root / "results.json"
        self.report = self.root / "report.html"
        self.argv = ["classify_comments.py", "--input", str(self.source), "--results", str(self.results), "--html", str(self.report)]

    def run_main(self, extra=()):
        with patch("sys.argv", self.argv + list(extra)), contextlib.redirect_stdout(io.StringIO()):
            moderator.main()

    def test_interrupted_run_resumes_without_reclassifying(self):
        with patch.object(moderator, "credentials", return_value=("account", "token")), patch.object(moderator, "classify", side_effect=[ANSWER, ValueError("offline")]):
            with self.assertRaisesRegex(ValueError, "offline"):
                self.run_main()
        self.assertEqual(set(moderator.read_json(self.results)["results"]), {"1"})
        self.assertIn('class="badge pending"', self.report.read_text(encoding="utf-8"))
        with patch.object(moderator, "credentials", return_value=("account", "token")), patch.object(moderator, "classify", return_value=ANSWER) as api:
            self.run_main()
            self.assertEqual(api.call_count, 1)
            self.assertEqual(api.call_args.args[1]["id"], 2)
        with patch.object(moderator, "credentials", side_effect=AssertionError("unneeded credentials")):
            self.run_main()

    def test_preview_escapes_html_and_preserves_unicode(self):
        self.run_main(["--render-only"])
        output = self.report.read_text(encoding="utf-8")
        self.assertNotIn('<script>alert', output)
        self.assertIn('&lt;script&gt;', output)
        self.assertIn('हिंदी ₹ 🙂', output)
        self.assertEqual(output.count('<article '), 2)
        self.assertIn('0 / 2 classified', output)
        self.assertFalse(self.results.exists())

    def test_changed_input_rejects_saved_results(self):
        cache = {"model": "clef-flash", "fingerprint": "old", "results": {}}
        moderator.save_json(self.results, cache)
        with self.assertRaisesRegex(ValueError, "different input"):
            self.run_main(["--render-only"])

    def test_duplicate_ids_rejected(self):
        self.data["comments"][1]["id"] = 1
        self.source.write_text(json.dumps(self.data), encoding="utf-8")
        with self.assertRaisesRegex(ValueError, "Duplicate"):
            moderator.load_comments(self.source)

    def test_invalid_answers_rejected(self):
        for answer in ({**ANSWER, "choice": "unknown"}, {**ANSWER, "confidence": float("nan")},
                       {**ANSWER, "probabilities": {"acceptable": 0.2, "toxic": 0.1, "spam": 0.1}}):
            with self.subTest(answer=answer), self.assertRaises(ValueError):
                moderator.validate_answer(answer)

    def test_rate_limit_retries_and_checks_payload(self):
        response = io.BytesIO(json.dumps({"success": True, "result": {"answers": {"moderation": ANSWER}}}).encode())
        error = urllib.error.HTTPError("https://example.test", 429, "rate limited", {"Retry-After": "2"}, None)
        with patch.object(moderator.urllib.request, "urlopen", side_effect=[error, response]) as api, patch.object(moderator.time, "sleep") as sleep, contextlib.redirect_stdout(io.StringIO()):
            result = moderator.classify(self.data, self.data["comments"][0], "account", "token", "clef-flash")
        self.assertEqual(result, ANSWER)
        self.assertEqual(api.call_count, 2)
        sleep.assert_called_once_with(2)
        payload = json.loads(api.call_args.args[0].data)
        self.assertEqual(set(payload["questions"]["moderation"]["criteria"]), set(moderator.LABELS))

    def test_unauthorized_does_not_retry_or_expose_token(self):
        error = urllib.error.HTTPError("https://example.test", 401, "secret-token", {}, None)
        with patch.object(moderator.urllib.request, "urlopen", side_effect=error) as api:
            with self.assertRaises(ValueError) as caught:
                moderator.classify(self.data, self.data["comments"][0], "account", "secret-token", "clef-flash")
        self.assertEqual(api.call_count, 1)
        self.assertNotIn("secret-token", str(caught.exception))

    def test_outputs_cannot_overwrite_input_credentials_or_each_other(self):
        credential_file = self.root / "credentials.sh"
        credential_file.write_text('private-placeholder', encoding="utf-8")
        original = self.source.read_bytes()
        cases = (["--html", str(self.source)], ["--results", str(self.source)],
                 ["--credentials", str(credential_file), "--html", str(credential_file)],
                 ["--html", str(self.results)])
        for options in cases:
            with self.subTest(options=options), self.assertRaisesRegex(ValueError, "different file"):
                self.run_main([*options, "--render-only"])
        self.assertEqual(self.source.read_bytes(), original)
        self.assertEqual(credential_file.read_text(), 'private-placeholder')

    def test_malformed_cache_has_clear_error(self):
        self.results.write_text('[]', encoding="utf-8")
        with self.assertRaisesRegex(ValueError, "JSON object"):
            self.run_main(["--render-only"])

    def test_failed_save_does_not_appear_as_saved_prediction(self):
        with patch.object(moderator, "credentials", return_value=("account", "token")), patch.object(moderator, "classify", return_value=ANSWER), patch.object(moderator, "save_json", side_effect=OSError("disk full")):
            with self.assertRaisesRegex(OSError, "disk full"):
                self.run_main()
        self.assertIn('0 / 2 classified', self.report.read_text(encoding="utf-8"))
        self.assertFalse(self.results.exists())

    def test_failed_replace_preserves_previous_file_and_cleans_temporary(self):
        self.results.write_text('previous content', encoding="utf-8")
        with patch.object(Path, "replace", side_effect=OSError("locked")):
            with self.assertRaisesRegex(OSError, "locked"):
                moderator.save_json(self.results, {"new": "content"})
        self.assertEqual(self.results.read_text(), 'previous content')
        self.assertEqual(list(self.root.glob('*.tmp')), [])

    def test_nested_output_directory_is_created(self):
        target = self.root / "nested" / "report.html"
        self.run_main(["--html", str(target), "--render-only"])
        self.assertIn('0 / 2 classified', target.read_text(encoding="utf-8"))

    def test_empty_input_and_invalid_context_rejected(self):
        for data in ({"comments": []}, {**self.data, "course": {"unexpected": "object"}}):
            self.source.write_text(json.dumps(data), encoding="utf-8")
            with self.subTest(data=data), self.assertRaises(ValueError):
                self.run_main(["--render-only"])

    def test_connection_closed_mid_response_is_retried(self):
        response = io.BytesIO(json.dumps({"success": True, "result": {"answers": {"moderation": ANSWER}}}).encode())
        with patch.object(moderator.urllib.request, "urlopen", side_effect=[http.client.IncompleteRead(b'partial'), response]), patch.object(moderator.time, "sleep"), contextlib.redirect_stdout(io.StringIO()):
            self.assertEqual(moderator.classify(self.data, self.data["comments"][0], "account", "token", "clef-flash"), ANSWER)

    def test_unsuccessful_api_response_is_not_a_prediction(self):
        for payload in ({"success": False, "errors": [{"message": "failure"}]}, {"success": True, "result": {}}, []):
            response = io.BytesIO(json.dumps(payload).encode())
            with self.subTest(payload=payload), patch.object(moderator.urllib.request, "urlopen", return_value=response):
                with self.assertRaises(ValueError):
                    moderator.classify(self.data, self.data["comments"][0], "account", "token", "clef-flash")

    def test_credentials_environment_overrides_file_without_executing_it(self):
        path = self.root / 'local.sh'
        path.write_text('export CLOUDFLARE_ACCOUNT_ID="' + 'a' * 32 + '"\nexport CLOUDFLARE_API_TOKEN="file-token"\n', encoding="utf-8")
        with patch.dict(moderator.os.environ, {"CLOUDFLARE_ACCOUNT_ID": 'b' * 32, "CLOUDFLARE_API_TOKEN": "env-token"}):
            self.assertEqual(moderator.credentials(path), ('b' * 32, 'env-token'))

    def test_unknown_cached_ids_and_changed_criteria_rejected(self):
        base = {"model": "clef-flash", "fingerprint": moderator.fingerprint(self.data, "clef-flash"), "question": moderator.QUESTION, "results": {}}
        for cache in ({**base, "results": {"99": ANSWER}}, {**base, "question": {}}):
            moderator.save_json(self.results, cache)
            with self.subTest(cache=cache), self.assertRaises(ValueError):
                self.run_main(["--render-only"])


if __name__ == "__main__":
    unittest.main()
