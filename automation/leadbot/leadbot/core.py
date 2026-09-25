"""Config, the lead record, and delivery to every configured sink."""
from __future__ import annotations

import csv
import html
import logging
import os
import time
from dataclasses import asdict, dataclass, field
from pathlib import Path

import aiohttp
import yaml
from aiogram import Bot

log = logging.getLogger(__name__)


@dataclass
class Settings:
    token: str
    owners: list[int]
    lead_token: str
    cfg: dict
    base: Path

    def text(self, key: str) -> str:
        return self.cfg.get("texts", {}).get(key, key)

    @property
    def services(self) -> list[str]:
        return list(self.cfg.get("services") or [])

    @property
    def faq(self) -> list[dict]:
        return list(self.cfg.get("faq") or [])

    @property
    def sinks(self) -> dict:
        return self.cfg.get("sinks") or {}

    @property
    def web(self) -> dict:
        return self.cfg.get("web") or {}


def _load_dotenv(path: Path) -> None:
    if path.exists():
        for line in path.read_text(encoding="utf-8").splitlines():
            if "=" in line and not line.lstrip().startswith("#"):
                k, v = line.split("=", 1)
                os.environ.setdefault(k.strip(), v.strip())


def load_settings(base: Path | None = None) -> Settings:
    base = base or Path(__file__).resolve().parent.parent
    _load_dotenv(base / ".env")
    cfg_path = base / os.environ.get("CONFIG", "config.yaml")
    if not cfg_path.exists():
        raise SystemExit(f"Нет файла настроек {cfg_path}. Скопируйте config.example.yaml в config.yaml.")
    token = os.environ.get("BOT_TOKEN", "")
    if not token:
        raise SystemExit("Не задан BOT_TOKEN (см. .env.example)")
    owners = [int(x) for x in os.environ.get("OWNER_CHAT_IDS", "").replace(" ", "").split(",") if x]
    if not owners:
        raise SystemExit("Не задан OWNER_CHAT_IDS: некому отправлять заявки")
    return Settings(token=token, owners=owners, lead_token=os.environ.get("LEAD_TOKEN", ""),
                    cfg=yaml.safe_load(cfg_path.read_text(encoding="utf-8")) or {}, base=base)


@dataclass
class Lead:
    source: str                      # "telegram" or "site"
    name: str = ""
    contact: str = ""
    service: str = ""
    comment: str = ""
    tg_user: str = ""                # @username or id for Telegram leads
    page: str = ""                   # page URL for site leads
    created_at: str = field(default_factory=lambda: time.strftime("%Y-%m-%d %H:%M:%S"))

    def summary(self, title: str) -> str:
        """HTML message for the owner's chat."""
        rows = [("Имя", self.name), ("Контакт", self.contact), ("Услуга", self.service), ("Комментарий", self.comment),
                ("Telegram", self.tg_user), ("Страница", self.page), ("Источник", self.source)]
        body = "\n".join(f"<b>{k}:</b> {html.escape(v)}" for k, v in rows if v)
        return f"<b>{html.escape(title)}</b>\n{body}"


def csv_safe(value: str) -> str:
    """Excel and Google Sheets run cells that start with = + - @ as formulas; site leads come from anyone."""
    return "'" + value if value[:1] in ("=", "+", "-", "@", "\t", "\r") else value


async def deliver(bot: Bot, s: Settings, lead: Lead, session: aiohttp.ClientSession | None = None) -> list[str]:
    """Sends the lead everywhere it is configured to go. Returns the sinks that failed (empty = all good).

    Owners are notified first: even if a spreadsheet or CRM is down, a person sees the lead.
    """
    failed: list[str] = []
    for chat in s.owners:
        try:
            await bot.send_message(chat, lead.summary(s.text("new_lead")), parse_mode="HTML")
        except Exception:
            log.exception("owner notify failed for %s", chat)
            failed.append(f"telegram:{chat}")

    if path := s.sinks.get("csv"):
        try:
            p = (s.base / path) if not Path(path).is_absolute() else Path(path)
            p.parent.mkdir(parents=True, exist_ok=True)
            new = not p.exists()
            with p.open("a", newline="", encoding="utf-8") as f:
                w = csv.DictWriter(f, fieldnames=list(asdict(lead)))
                if new:
                    w.writeheader()
                w.writerow({k: csv_safe(v) for k, v in asdict(lead).items()})
        except Exception:
            log.exception("csv sink failed")
            failed.append("csv")

    urls = [("google_sheets", s.sinks.get("google_sheets_webhook")), ("webhook", s.sinks.get("webhook"))]
    if any(u for _, u in urls):
        own = session is None
        session = session or aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=15))
        try:
            for name, url in urls:
                if not url:
                    continue
                try:
                    async with session.post(url, json={"company": s.cfg.get("company", ""), **asdict(lead)}) as r:
                        if r.status >= 400:
                            raise RuntimeError(f"HTTP {r.status}")
                except Exception:
                    log.exception("%s sink failed", name)
                    failed.append(name)
        finally:
            if own:
                await session.close()
    return failed
