"""Site form endpoint: POST /lead (JSON or form) → the same delivery as Telegram leads.

The token sits in the site's page, so anyone can read it: it only stops random scanners.
Real spam protection is the honeypot field, the per-IP limit and the field length caps.
"""
from __future__ import annotations

import hmac
import logging
import time
from collections import defaultdict, deque

from aiogram import Bot
from aiohttp import web

from .core import Lead, Settings, deliver

log = logging.getLogger(__name__)

MAX_LEN = 500
MAX_BODY = 16 * 1024
HONEYPOT = "website"          # hidden input; people leave it empty, bots fill it in
RATE = (5, 10 * 60)           # at most 5 leads per IP per 10 minutes


class RateLimit:
    def __init__(self, limit: int, window: float):
        self.limit, self.window = limit, window
        self.hits: dict[str, deque] = defaultdict(deque)

    def allow(self, key: str, now: float | None = None) -> bool:
        now = time.time() if now is None else now
        q = self.hits[key]
        while q and now - q[0] > self.window:
            q.popleft()
        if len(q) >= self.limit:
            return False
        q.append(now)
        return True


def lead_from_form(data: dict) -> Lead | None:
    """None if there is no way to contact the person: such a lead is useless to the owner."""
    get = lambda k: str(data.get(k) or "").strip()[:MAX_LEN]
    contact = get("contact") or get("phone") or get("email")
    if not contact:
        return None
    return Lead(source="site", name=get("name"), contact=contact, service=get("service"),
                comment=get("comment") or get("message"), page=get("page"))


def build_app(bot: Bot, s: Settings) -> web.Application:
    origin = str(s.web.get("allowed_origin") or "*")
    limit = RateLimit(*RATE)
    trust_proxy = bool(s.web.get("trust_proxy"))   # only behind nginx/Caddy: otherwise the header is forged freely

    def cors(resp: web.StreamResponse) -> web.StreamResponse:
        resp.headers["Access-Control-Allow-Origin"] = origin
        resp.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        resp.headers["Access-Control-Allow-Headers"] = "Content-Type, X-Lead-Token"
        return resp

    def reply(status: int, **body) -> web.Response:
        return cors(web.json_response({"ok": status < 400, **body}, status=status))

    async def preflight(_: web.Request) -> web.Response:
        return cors(web.Response(status=204))

    async def post_lead(req: web.Request) -> web.Response:
        if not hmac.compare_digest(req.headers.get("X-Lead-Token", ""), s.lead_token):
            return reply(403, error="bad token")
        fwd = req.headers.get("X-Forwarded-For", "").split(",")[0].strip() if trust_proxy else ""
        ip = fwd or (req.remote or "")
        if not limit.allow(ip):
            return reply(429, error="too many requests")
        if (req.content_length or 0) > MAX_BODY:
            return reply(413, error="too large")
        try:
            data = await req.json() if req.content_type == "application/json" else dict(await req.post())
        except web.HTTPRequestEntityTooLarge:   # chunked bodies have no Content-Length to check above
            return reply(413, error="too large")
        except (ValueError, UnicodeDecodeError):
            return reply(400, error="bad body")
        if not isinstance(data, dict):
            return reply(400, error="bad body")
        if str(data.get(HONEYPOT) or "").strip():
            return reply(200)   # a bot: answer as if accepted, deliver nothing
        lead = lead_from_form(data)
        if lead is None:
            return reply(422, error="contact is required")
        failed = await deliver(bot, s, lead)
        if len(failed) == len(s.owners) + sum(1 for k in ("csv", "google_sheets_webhook", "webhook")
                                              if s.sinks.get(k)):
            return reply(502, error="not delivered")   # every sink failed: tell the site to show an error
        return reply(200)

    app = web.Application(client_max_size=MAX_BODY)
    app.router.add_post("/lead", post_lead)
    app.router.add_route("OPTIONS", "/lead", preflight)
    async def health(_: web.Request) -> web.Response:
        return web.Response(text="ok")

    app.router.add_get("/health", health)
    return app
