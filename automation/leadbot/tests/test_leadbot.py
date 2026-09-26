"""Offline tests for the lead bot: no Telegram, no network.

Run from automation/leadbot: python3 -m unittest discover tests
"""
import asyncio
import csv
import datetime as dt
import logging
import sys
import tempfile
import unittest
from pathlib import Path

from aiogram import Bot, Dispatcher
from aiogram.client.session.base import BaseSession
from aiogram.methods import SendMessage
from aiogram.types import CallbackQuery, Chat, Contact, Message, Update, User
from aiohttp.test_utils import TestClient, TestServer

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from leadbot.core import Lead, Settings, csv_safe, deliver
from leadbot.dialog import build_router
from leadbot.web import RateLimit, build_app, lead_from_form

OWNER = 111
CLIENT = User(id=222, is_bot=False, first_name="Анна", username="anna")
CHAT = Chat(id=222, type="private")
logging.disable(logging.CRITICAL)   # failed sinks are logged with tracebacks on purpose


class FakeSession(BaseSession):
    """Records every Bot API call instead of sending it."""

    def __init__(self):
        super().__init__()
        self.calls = []

    async def make_request(self, bot, method, timeout=None):
        self.calls.append(method)
        if isinstance(method, SendMessage):
            return Message(message_id=len(self.calls), date=dt.datetime.now(dt.timezone.utc), text=method.text,
                           chat=Chat(id=method.chat_id, type="private"))
        return True

    async def stream_content(self, *a, **kw):
        yield b""

    async def close(self):
        pass

    def sent(self, chat_id=None):
        return [c.text for c in self.calls if isinstance(c, SendMessage) and (chat_id is None or c.chat_id == chat_id)]


def settings(base: Path, **cfg) -> Settings:
    conf = {"company": "Тест", "texts": {"new_lead": "Новая заявка", "done": "Спасибо!", "ask_name": "Имя?",
                                         "ask_contact": "Контакт?", "ask_comment": "Задача?", "confirm": "Проверьте:",
                                         "ask_service": "Что нужно?", "too_fast": "Уже отправили"},
            "services": ["Внедрение", "Поддержка"], "sinks": {"csv": "data/leads.csv"}}
    conf.update(cfg)
    return Settings(token="42:TEST", owners=[OWNER], lead_token="secret", cfg=conf, base=base)


class TestCore(unittest.TestCase):
    def test_csv_safe_blocks_formulas(self):
        self.assertEqual(csv_safe("=HYPERLINK(\"x\")"), "'=HYPERLINK(\"x\")")
        self.assertEqual(csv_safe("@SUM(1)"), "'@SUM(1)")
        self.assertEqual(csv_safe("Анна"), "Анна")

    def test_summary_escapes_html_and_skips_empty(self):
        text = Lead(source="site", name="<b>x</b>", contact="a@b.c").summary("Новая заявка")
        self.assertIn("&lt;b&gt;x&lt;/b&gt;", text)
        self.assertNotIn("Комментарий", text)

    def test_deliver_notifies_owner_and_writes_csv(self):
        with tempfile.TemporaryDirectory() as d:
            s, session = settings(Path(d)), FakeSession()
            bot = Bot("42:TEST", session=session)
            failed = asyncio.run(deliver(bot, s, Lead(source="site", name="=cmd", contact="+7 700 000 00 00")))
            self.assertEqual(failed, [])
            self.assertIn("Новая заявка", session.sent(OWNER)[0])
            with open(Path(d) / "data/leads.csv", encoding="utf-8") as f:
                rows = list(csv.DictReader(f))
            self.assertEqual(rows[0]["name"], "'=cmd")

    def test_deliver_reports_broken_webhook_but_still_notifies(self):
        with tempfile.TemporaryDirectory() as d:
            s, session = settings(Path(d), sinks={"webhook": "http://127.0.0.1:9/nowhere"}), FakeSession()
            failed = asyncio.run(deliver(Bot("42:TEST", session=session), s, Lead(source="site", contact="x")))
            self.assertEqual(failed, ["webhook"])
            self.assertEqual(len(session.sent(OWNER)), 1)


class TestWeb(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.session = FakeSession()
        self.s = settings(Path(self.tmp.name))
        self.client = TestClient(TestServer(build_app(Bot("42:TEST", session=self.session), self.s)))
        await self.client.start_server()

    async def asyncTearDown(self):
        await self.client.close()
        self.tmp.cleanup()

    async def post(self, data, token="secret", headers=None):
        return await self.client.post("/lead", json=data, headers={"X-Lead-Token": token, **(headers or {})})

    async def test_accepts_lead(self):
        r = await self.post({"name": "Анна", "phone": "+77001234567", "page": "https://x.kz/"})
        self.assertEqual(r.status, 200)
        self.assertIn("+77001234567", self.session.sent(OWNER)[0])
        self.assertEqual(r.headers["Access-Control-Allow-Origin"], "*")

    async def test_form_encoded(self):
        r = await self.client.post("/lead", data={"email": "a@b.c"}, headers={"X-Lead-Token": "secret"})
        self.assertEqual(r.status, 200)

    async def test_wrong_token(self):
        self.assertEqual((await self.post({"phone": "1"}, token="nope")).status, 403)
        self.assertEqual(self.session.sent(), [])

    async def test_requires_contact(self):
        self.assertEqual((await self.post({"name": "Анна"})).status, 422)

    async def test_honeypot_is_silent(self):
        r = await self.post({"phone": "1", "website": "http://spam"})
        self.assertEqual(r.status, 200)
        self.assertEqual(self.session.sent(), [])

    async def test_preflight(self):
        r = await self.client.options("/lead")
        self.assertEqual(r.status, 204)
        self.assertIn("X-Lead-Token", r.headers["Access-Control-Allow-Headers"])

    async def test_rate_limit_ignores_forged_forwarded_for(self):
        codes = [(await self.post({"phone": "1"}, headers={"X-Forwarded-For": f"10.0.0.{i}"})).status
                 for i in range(6)]
        self.assertEqual(codes[-1], 429)   # trust_proxy is off: all requests are from one IP

    async def test_rate_limit_per_forwarded_ip_behind_proxy(self):
        self.s.cfg["web"] = {"trust_proxy": True}
        client = TestClient(TestServer(build_app(Bot("42:TEST", session=self.session), self.s)))
        await client.start_server()
        try:
            codes = [(await client.post("/lead", json={"phone": "1"}, headers={
                "X-Lead-Token": "secret", "X-Forwarded-For": f"10.0.0.{i}"})).status for i in range(6)]
        finally:
            await client.close()
        self.assertEqual(codes, [200] * 6)

    async def test_too_large(self):
        r = await self.post({"phone": "1", "comment": "x" * 20000})
        self.assertEqual(r.status, 413)
        self.assertEqual(self.session.sent(), [])

    async def test_bad_json(self):
        r = await self.client.post("/lead", data="{", headers={"X-Lead-Token": "secret",
                                                               "Content-Type": "application/json"})
        self.assertEqual(r.status, 400)


class TestHelpers(unittest.TestCase):
    def test_rate_limit_window(self):
        rl = RateLimit(2, 60)
        self.assertTrue(rl.allow("a", 0) and rl.allow("a", 1))
        self.assertFalse(rl.allow("a", 2))
        self.assertTrue(rl.allow("a", 62))

    def test_lead_from_form_trims_and_caps(self):
        lead = lead_from_form({"contact": "  x  ", "message": "y" * 900})
        self.assertEqual(lead.contact, "x")
        self.assertEqual(len(lead.comment), 500)
        self.assertIsNone(lead_from_form({"contact": "   "}))


class TestDialog(unittest.IsolatedAsyncioTestCase):
    """The whole form through aiogram's dispatcher, as Telegram would deliver it."""

    async def asyncSetUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.session = FakeSession()
        self.bot = Bot("42:TEST", session=self.session)
        self.dp = Dispatcher()
        self.dp.include_router(build_router(settings(Path(self.tmp.name))))
        self.n = 0

    async def asyncTearDown(self):
        self.tmp.cleanup()

    async def text(self, text=None, **kw):
        self.n += 1
        msg = Message(message_id=self.n, date=dt.datetime.now(dt.timezone.utc), chat=CHAT, from_user=CLIENT, text=text, **kw)
        await self.dp.feed_update(self.bot, Update(update_id=self.n, message=msg))

    async def press(self, data):
        self.n += 1
        msg = Message(message_id=self.n, date=dt.datetime.now(dt.timezone.utc), chat=CHAT, text="…")
        cb = CallbackQuery(id=str(self.n), from_user=CLIENT, chat_instance="c", data=data, message=msg)
        await self.dp.feed_update(self.bot, Update(update_id=self.n, callback_query=cb))

    async def test_full_form_with_phone_button(self):
        await self.text("/start")
        await self.press("svc:1")
        await self.text("Анна")
        await self.text(contact=Contact(phone_number="+77001234567", first_name="Анна"))
        await self.text("Нужна поддержка 1С")
        await self.press("send")
        owner = self.session.sent(OWNER)
        self.assertEqual(len(owner), 1)
        for part in ("Поддержка", "Анна", "+77001234567", "Нужна поддержка 1С", "@anna"):
            self.assertIn(part, owner[0])
        self.assertEqual(self.session.sent(CHAT.id)[-1], "Спасибо!")

    async def test_double_send_delivers_once(self):
        await self.text("/start")
        await self.press("svc:0")
        await self.text("Анна")
        await self.text("anna@example.com")
        await self.press("skip")
        await self.press("send")
        await self.press("send")
        self.assertEqual(len(self.session.sent(OWNER)), 1)

    async def test_text_after_lead_is_forwarded_as_addition(self):
        await self.text("/start")
        await self.press("svc:0")
        await self.text("Анна")
        await self.text("anna@example.com")
        await self.press("skip")
        await self.press("send")
        await self.text("Забыла: нас 40 человек")
        owner = self.session.sent(OWNER)
        self.assertEqual(len(owner), 2)
        self.assertIn("Дополнение", owner[1])
        self.assertIn("40 человек", owner[1])

    async def test_hello_starts_the_form(self):
        await self.text("Здравствуйте")
        self.assertEqual(self.session.sent(CHAT.id)[-1], "Что нужно?")

    async def test_restart_clears_answers(self):
        await self.text("/start")
        await self.press("svc:0")
        await self.text("Анна")
        await self.text("anna@example.com")
        await self.press("skip")
        await self.press("restart")
        self.assertEqual(self.session.sent(CHAT.id)[-1], "Что нужно?")
        await self.press("send")   # confirm state is gone: nothing is delivered
        self.assertEqual(self.session.sent(OWNER), [])


if __name__ == "__main__":
    unittest.main()
