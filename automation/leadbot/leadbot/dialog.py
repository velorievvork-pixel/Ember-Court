"""Telegram dialogue: service → name → contact → comment → confirm → deliver."""
from __future__ import annotations

import html
import time

from aiogram import F, Router
from aiogram.filters import Command, CommandStart
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.types import (
    CallbackQuery,
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    KeyboardButton,
    Message,
    ReplyKeyboardMarkup,
    ReplyKeyboardRemove,
)

from .core import Lead, Settings, deliver

MAX_LEN = 500              # per field: a lead is a few lines, not an essay
REPEAT_WINDOW = 10 * 60    # after a lead, new free text within this window is an addition, not a new lead


class Form(StatesGroup):
    service = State()
    name = State()
    contact = State()
    comment = State()
    confirm = State()


def _kb(rows: list[list[tuple[str, str]]]) -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(inline_keyboard=[[InlineKeyboardButton(text=t, callback_data=d) for t, d in row]
                                                 for row in rows])


def _clip(text: str | None) -> str:
    return (text or "").strip()[:MAX_LEN]


def _tg_user(m: Message | CallbackQuery) -> str:
    u = m.from_user
    return f"@{u.username}" if u and u.username else str(u.id if u else "")


def build_router(s: Settings) -> Router:
    r = Router()
    last_sent: dict[int, float] = {}   # user id → time of the last delivered lead

    def services_kb() -> InlineKeyboardMarkup:
        rows = [[(name, f"svc:{i}")] for i, name in enumerate(s.services)]
        if s.faq:
            rows.append([(s.text("faq_title").rstrip(":"), "faq")])
        return _kb(rows)

    async def ask_service(m: Message, state: FSMContext) -> None:
        await state.clear()
        if s.services:
            await state.set_state(Form.service)
            await m.answer(s.text("ask_service"), reply_markup=services_kb())
        else:
            await state.set_state(Form.name)
            await m.answer(s.text("ask_name"))

    @r.message(CommandStart())
    async def start(m: Message, state: FSMContext):
        await m.answer(s.text("start"), reply_markup=ReplyKeyboardRemove())
        await ask_service(m, state)

    @r.message(Command("faq"))
    async def faq_cmd(m: Message):
        await m.answer(faq_text())

    def faq_text() -> str:
        items = "\n\n".join(f"<b>{html.escape(str(q['q']))}</b>\n{html.escape(str(q['a']))}" for q in s.faq)
        return f"{s.text('faq_title')}\n\n{items}" if items else s.text("faq_title")

    @r.callback_query(F.data == "faq")
    async def faq_cb(c: CallbackQuery):
        await c.answer()
        await c.message.answer(faq_text())

    @r.callback_query(Form.service, F.data.startswith("svc:"))
    async def got_service(c: CallbackQuery, state: FSMContext):
        i = int(c.data.split(":", 1)[1])
        if not 0 <= i < len(s.services):
            await c.answer()
            return
        await state.update_data(service=s.services[i])
        await state.set_state(Form.name)
        await c.answer()
        await c.message.answer(s.text("ask_name"))

    @r.message(Form.service)
    async def service_as_text(m: Message, state: FSMContext):
        # Someone typed instead of pressing a button: take the text as the service.
        await state.update_data(service=_clip(m.text))
        await state.set_state(Form.name)
        await m.answer(s.text("ask_name"))

    @r.message(Form.name, F.text)
    async def got_name(m: Message, state: FSMContext):
        await state.update_data(name=_clip(m.text))
        await state.set_state(Form.contact)
        kb = ReplyKeyboardMarkup(keyboard=[[KeyboardButton(text=s.text("share_phone"), request_contact=True)]],
                                 resize_keyboard=True, one_time_keyboard=True)
        await m.answer(s.text("ask_contact"), reply_markup=kb)

    @r.message(Form.contact, F.contact)
    async def got_phone(m: Message, state: FSMContext):
        await state.update_data(contact=m.contact.phone_number)
        await ask_comment(m, state)

    @r.message(Form.contact, F.text)
    async def got_contact_text(m: Message, state: FSMContext):
        await state.update_data(contact=_clip(m.text))
        await ask_comment(m, state)

    async def ask_comment(m: Message, state: FSMContext) -> None:
        await state.set_state(Form.comment)
        await m.answer(s.text("ask_comment"), reply_markup=ReplyKeyboardRemove())
        await m.answer("⬇️", reply_markup=_kb([[(s.text("skip"), "skip")]]))

    @r.callback_query(Form.comment, F.data == "skip")
    async def skip_comment(c: CallbackQuery, state: FSMContext):
        await c.answer()
        await state.update_data(comment="")
        await show_confirm(c.message, state, _tg_user(c))

    @r.message(Form.comment, F.text)
    async def got_comment(m: Message, state: FSMContext):
        await state.update_data(comment=_clip(m.text))
        await show_confirm(m, state, _tg_user(m))

    async def show_confirm(m: Message, state: FSMContext, tg_user: str) -> None:
        await state.update_data(tg_user=tg_user)
        await state.set_state(Form.confirm)
        lead = Lead(source="telegram", **(await state.get_data()))
        await m.answer(lead.summary(s.text("confirm")), parse_mode="HTML",
                       reply_markup=_kb([[(s.text("send"), "send"), (s.text("restart"), "restart")]]))

    @r.callback_query(Form.confirm, F.data == "restart")
    async def restart(c: CallbackQuery, state: FSMContext):
        await c.answer()
        await ask_service(c.message, state)

    @r.callback_query(Form.confirm, F.data == "send")
    async def send(c: CallbackQuery, state: FSMContext):
        await c.answer()
        lead = Lead(source="telegram", **(await state.get_data()))
        await state.clear()   # before delivery: a double tap must not send the lead twice
        await deliver(c.bot, s, lead)
        last_sent[c.from_user.id] = time.time()
        await c.message.edit_reply_markup(reply_markup=None)
        await c.message.answer(s.text("done"))

    @r.message(F.text)
    async def free_text(m: Message, state: FSMContext):
        # Outside the form. Right after a lead: pass the text to the owners as an addition.
        # Otherwise: start the form, so a client who just says "hi" still ends up leaving a lead.
        if time.time() - last_sent.get(m.from_user.id, 0) < REPEAT_WINDOW:
            lead = Lead(source="telegram", service=s.cfg.get("texts", {}).get("addition", "Дополнение к заявке"),
                        comment=_clip(m.text), tg_user=_tg_user(m))
            await deliver(m.bot, s, lead)
            await m.answer(s.text("too_fast"))
            return
        await ask_service(m, state)

    return r
