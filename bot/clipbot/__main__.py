"""Entry point and handlers: python -m clipbot"""
from __future__ import annotations

import asyncio
import json
import logging
import re
import time
from pathlib import Path

from aiogram import Bot, Dispatcher, F, Router
from aiogram.client.default import DefaultBotProperties
from aiogram.client.session.aiohttp import AiohttpSession
from aiogram.client.telegram import TelegramAPIServer
from aiogram.filters import Command, CommandStart
from aiogram.types import (BotCommand, CallbackQuery, InlineKeyboardButton, InlineKeyboardMarkup, LabeledPrice,
                           Message, PreCheckoutQuery)

from . import texts
from .config import Config, load
from .db import DB
from .worker import Job, Worker, download_url, run_clipper

URL_RE = re.compile(r"https?://\S+")
REF_RE = re.compile(r"\b(референс|реф|ref|reference)\b", re.I)
SUB_PERIOD = 30 * 24 * 3600  # the only period Telegram Stars subscriptions accept


def _fmt_date(ts: int) -> str:
    return time.strftime("%d.%m.%Y", time.localtime(ts))


def build_router(cfg: Config, db: DB, worker: Worker) -> Router:
    r = Router()

    @r.message(CommandStart())
    async def start(m: Message):
        db.user(m.from_user.id, m.from_user.username)
        await m.answer(texts.START.format(tg_limit=cfg.tg_file_limit_mb, free_runs=cfg.free_runs,
                                          free_clips=cfg.free_clips) + "\n\n" + texts.HELP)

    @r.message(Command("help"))
    async def help_(m: Message):
        await m.answer(texts.HELP)

    @r.message(Command("terms"))
    async def terms(m: Message):
        await m.answer(texts.TERMS)

    @r.message(Command("paysupport"))
    async def paysupport(m: Message):
        await m.answer(texts.PAYSUPPORT)

    # ---------- style ----------
    @r.message(Command("style"))
    async def style(m: Message):
        kb = InlineKeyboardMarkup(inline_keyboard=[[InlineKeyboardButton(text=v, callback_data=f"style:{k}")]
                                                   for k, v in texts.STYLES.items()])
        await m.answer(texts.STYLE_ASK, reply_markup=kb)

    @r.callback_query(F.data.startswith("style:"))
    async def style_set(q: CallbackQuery):
        key = q.data.split(":", 1)[1]
        if key in texts.STYLES:
            db.user(q.from_user.id)
            db.set_style(q.from_user.id, key)
            await q.message.edit_text(texts.STYLE_SET.format(name=texts.STYLES[key]))
        await q.answer()

    # ---------- reference ----------
    @r.message(Command("reference"))
    async def reference(m: Message):
        await m.answer(texts.REFERENCE_HOWTO)

    @r.message(Command("noreference"))
    async def noreference(m: Message):
        u = db.user(m.from_user.id)
        if u.reference_path:
            Path(u.reference_path).unlink(missing_ok=True)
        db.set_reference(u.id, None)
        await m.answer(texts.REFERENCE_CLEARED)

    async def save_reference(m: Message, file_id: str | None, url: str | None):
        dest = cfg.data_dir / "refs" / f"{m.from_user.id}.mp4"
        dest.parent.mkdir(parents=True, exist_ok=True)
        note = await m.answer("Разбираю референс…")
        try:
            if file_id:
                await m.bot.download(file_id, destination=dest)
            else:
                await download_url(url, dest, min(cfg.max_url_mb, 500))
            a = json.loads(await run_clipper(["analyze", str(dest)]))["analysis"]
        except Exception as e:
            dest.unlink(missing_ok=True)
            await note.edit_text(f"Не получилось прочитать референс: {str(e)[:200]}")
            return
        db.set_reference(m.from_user.id, str(dest))
        info = f"{a['duration']:.0f} с, {a['aspect']}, склейка каждые {a['avg_shot_seconds']} с"
        await note.edit_text(texts.REFERENCE_SAVED.format(info=info))

    # ---------- subscription (Telegram Stars) ----------
    @r.message(Command("plan", "subscribe"))
    async def plan(m: Message):
        u = db.user(m.from_user.id, m.from_user.username)
        left, paid = db.runs_left(u, cfg.monthly_runs, cfg.free_runs)
        if paid:
            await m.answer(texts.PLAN_SUB.format(until=_fmt_date(u.sub_until), left=left, runs=cfg.monthly_runs))
            return
        link = await m.bot.create_invoice_link(
            title=texts.INVOICE_TITLE,
            description=texts.INVOICE_DESC.format(runs=cfg.monthly_runs, clips=cfg.sub_clips),
            payload=f"sub:{u.id}", currency="XTR", prices=[LabeledPrice(label="30 дней", amount=cfg.price_stars)],
            subscription_period=SUB_PERIOD,
        )
        kb = InlineKeyboardMarkup(inline_keyboard=[[InlineKeyboardButton(
            text=texts.PAY_BUTTON.format(price=cfg.price_stars), url=link)]])
        await m.answer(texts.PLAN_FREE.format(left=left, price=cfg.price_stars, runs=cfg.monthly_runs,
                                              clips=cfg.sub_clips), reply_markup=kb)

    @r.pre_checkout_query()
    async def pre_checkout(q: PreCheckoutQuery):
        await q.answer(ok=q.payload.startswith("sub:") and q.currency == "XTR")

    @r.message(F.successful_payment)
    async def paid(m: Message):
        p = m.successful_payment
        until = p.subscription_expiration_date or int(time.time()) + SUB_PERIOD
        db.user(m.from_user.id, m.from_user.username)
        db.add_payment(p.telegram_payment_charge_id, m.from_user.id, p.total_amount, until)
        await m.answer(texts.PAID.format(until=_fmt_date(until)))

    @r.message(Command("stats"))
    async def stats(m: Message):
        if m.from_user.id in cfg.admin_ids:
            await m.answer("\n".join(f"{k}: {v}" for k, v in db.stats().items()))

    # ---------- incoming videos ----------
    @r.message(F.video | F.document | F.text)
    async def incoming(m: Message):
        u = db.user(m.from_user.id, m.from_user.username)
        media = m.video or (m.document if m.document and (m.document.mime_type or "").startswith("video/") else None)
        text = m.caption or m.text or ""
        url_match = URL_RE.search(text) if not media else None
        if not media and not url_match:
            if m.document:
                await m.answer(texts.NOT_VIDEO)
            elif m.text and not m.text.startswith("/"):
                await m.answer(texts.NOT_VIDEO)
            return
        if media and media.file_size and media.file_size > cfg.tg_file_limit_mb * 1024 * 1024:
            await m.answer(texts.TOO_BIG.format(size=media.file_size // (1024 * 1024), limit=cfg.tg_file_limit_mb))
            return
        file_id, url = (media.file_id, None) if media else (None, url_match.group(0))

        if REF_RE.search(text):
            await save_reference(m, file_id, url)
            return

        if db.active_jobs(u.id):
            await m.answer(texts.BUSY)
            return
        left, is_paid = db.runs_left(u, cfg.monthly_runs, cfg.free_runs)
        if left <= 0:
            await m.answer(texts.NO_RUNS_SUB.format(runs=cfg.monthly_runs) if is_paid
                           else texts.NO_RUNS_FREE.format(runs=cfg.monthly_runs, clips=cfg.sub_clips))
            return
        db.consume(u.id, is_paid)
        jid = db.new_job(u.id, file_id or url, is_paid)
        status = await m.answer("⏳")
        pos = worker.submit(Job(id=jid, user_id=u.id, chat_id=m.chat.id, status_msg_id=status.message_id,
                                paid=is_paid, clips=cfg.sub_clips if is_paid else cfg.free_clips,
                                style=u.style, reference=u.reference_path, file_id=file_id, url=url))
        await status.edit_text(texts.QUEUED.format(pos=pos))

    return r


async def main() -> None:
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
    cfg = load()
    session = AiohttpSession(api=TelegramAPIServer.from_base(cfg.api_url, is_local=True)) if cfg.api_url else None
    bot = Bot(cfg.token, session=session, default=DefaultBotProperties())
    db = DB(cfg.data_dir / "bot.sqlite3")
    worker = Worker(bot, db, cfg)
    dp = Dispatcher()
    dp.include_router(build_router(cfg, db, worker))
    await bot.set_my_commands([
        BotCommand(command="start", description="Как пользоваться"),
        BotCommand(command="style", description="Стиль субтитров"),
        BotCommand(command="reference", description="Референс «хочу так»"),
        BotCommand(command="plan", description="Подписка и остаток"),
        BotCommand(command="paysupport", description="Вопросы по оплате"),
    ])
    workers = [asyncio.create_task(worker.run()) for _ in range(cfg.workers)]
    try:
        await dp.start_polling(bot)
    finally:
        for w in workers:
            w.cancel()


if __name__ == "__main__":
    asyncio.run(main())
