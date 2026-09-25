"""Offline tests for tools/lead-research: local fixture sites and a mocked Claude API.

Run: python3 -m unittest discover tools/tests
"""
import functools
import http.server
import importlib.util
import json
import os
import sys
import tempfile
import threading
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("lead_research", ROOT / "lead-research" / "research.py")
research = importlib.util.module_from_spec(spec)
sys.modules["lead_research"] = research
spec.loader.exec_module(research)

HIRING = {
    "index.html": """<!doctype html><html lang="en"><head><title>Acmefield | CRM for logistics</title>
<meta name="description" content="CRM for logistics companies."></head><body>
<h1>Logistics CRM</h1><p>We're hiring and growing fast.</p>
<a href="/careers">Careers</a> <a href="mailto:hello@acmefield.test">Email us</a> <a href="https://t.me/acmefield">Telegram</a>
</body></html>""",
    "careers/index.html": """<html><body><h2>Head of Sales</h2><h2>Backend Engineer</h2></body></html>""",
}
SILENT = {
    "index.html": """<!doctype html><html lang="ru"><head><title>Складской учёт Плюс</title></head>
<body><h1>Учёт на складе</h1><p>Программа для складов.</p></body></html>""",
}


def serve(files: dict) -> tuple[http.server.ThreadingHTTPServer, str]:
    d = tempfile.mkdtemp()
    for name, body in files.items():
        p = Path(d) / name
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(body, encoding="utf-8")
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a):
            pass

    handler = functools.partial(Quiet, directory=d)
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv, f"http://127.0.0.1:{srv.server_port}/"


class LeadResearchTest(unittest.TestCase):
    def test_hiring_signal_gives_outbound_draft_in_site_language(self):
        srv, url = serve(HIRING)
        try:
            lead = research.research(url, run_audit=False)
        finally:
            srv.shutdown()
            srv.server_close()
        self.assertEqual(lead.name, "Acmefield")
        self.assertIn("Head of Sales", lead.open_roles)
        self.assertNotIn("Backend Engineer", lead.open_roles)
        self.assertEqual(lead.service, "outbound")
        self.assertIn("hello@acmefield.test", lead.emails)
        self.assertIn("telegram", lead.channels)
        draft = research.draft_template(lead)
        self.assertTrue(draft.startswith("Hi!"), draft)
        self.assertIn("Head of Sales", draft)
        self.assertGreaterEqual(lead.score, 6)  # hiring (+4) and growth words (+2)

    def test_no_contacts_no_hook_means_no_invented_draft(self):
        srv, url = serve(SILENT)
        try:
            lead = research.research(url, run_audit=False)
        finally:
            srv.shutdown()
            srv.server_close()
        self.assertEqual(lead.language, "ru")
        self.assertTrue(any("Нет ни формы" in s for s in lead.signals))
        self.assertEqual(research.draft_template(lead), "")
        self.assertIn("найдите его вручную", research.card(lead))

    def test_business_hook_skips_technical_findings(self):
        issues = ["🟡 Адрес с http:// не перенаправляется на https://", "🟡 Не видно цен или хотя бы «от …»"]
        self.assertEqual(research.business_hook(issues, "en", "x.test"), "there are no prices on the site, so people leave to compare")
        self.assertEqual(research.business_hook(["🟡 Тяжёлый HTML: 900 КБ"], "ru", "x.test"), "")

    def test_claude_draft_uses_structured_output(self):
        seen = {}

        class Mock(http.server.BaseHTTPRequestHandler):
            def do_POST(self):
                seen.update(json.loads(self.rfile.read(int(self.headers["content-length"]))))
                text = json.dumps({"observation": "you're hiring a Head of Sales", "message": "Hi! Saw the Head of Sales opening..."})
                body = json.dumps({"id": "m", "type": "message", "role": "assistant", "model": seen["model"], "stop_reason": "end_turn",
                                   "stop_sequence": None, "usage": {"input_tokens": 1, "output_tokens": 1},
                                   "content": [{"type": "text", "text": text}]}).encode()
                self.send_response(200)
                self.send_header("content-type", "application/json")
                self.send_header("content-length", str(len(body)))
                self.end_headers()
                self.wfile.write(body)

            def log_message(self, *a):
                pass

        try:
            import anthropic  # noqa: F401
        except ImportError:
            self.skipTest("anthropic SDK not installed")
        api = http.server.HTTPServer(("127.0.0.1", 0), Mock)
        threading.Thread(target=api.serve_forever, daemon=True).start()
        env = {"ANTHROPIC_API_KEY": "test", "ANTHROPIC_BASE_URL": f"http://127.0.0.1:{api.server_port}"}
        old = {k: os.environ.get(k) for k in env}
        os.environ.update(env)
        try:
            lead = research.Lead(url="https://x.test", domain="x.test", name="X", open_roles=["Head of Sales"], service="outbound")
            research.draft_claude([lead])
        finally:
            api.shutdown()
            api.server_close()
            for k, v in old.items():
                os.environ.pop(k, None) if v is None else os.environ.__setitem__(k, v)
        self.assertEqual(lead.draft_by, "claude")
        self.assertIn("Head of Sales", lead.draft)
        self.assertEqual(seen["model"], "claude-opus-5")
        self.assertEqual(seen["thinking"], {"type": "adaptive"})
        self.assertIn("format", seen["output_config"])


if __name__ == "__main__":
    unittest.main()
