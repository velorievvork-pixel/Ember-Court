"""Entry point: python -m leadbot (from automation/leadbot)."""
from __future__ import annotations

import asyncio
import logging

from aiogram import Bot, Dispatcher
from aiogram.client.default import DefaultBotProperties
from aiogram.types import BotCommand
from aiohttp import web

from .core import load_settings
from .dialog import build_router
from .web import build_app

log = logging.getLogger("leadbot")


async def main() -> None:
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
    s = load_settings()
    bot = Bot(s.token, default=DefaultBotProperties(parse_mode="HTML"))
    dp = Dispatcher()
    dp.include_router(build_router(s))
    await bot.set_my_commands([BotCommand(command="start", description="Оставить заявку"),
                               BotCommand(command="faq", description="Частые вопросы")])

    runner = None
    if s.web.get("enabled"):
        if not s.lead_token:
            # An empty token would accept POSTs from anyone who finds the port.
            raise SystemExit("web.enabled, но не задан LEAD_TOKEN (см. .env.example)")
        runner = web.AppRunner(build_app(bot, s))
        await runner.setup()
        port = int(s.web.get("port") or 8080)
        await web.TCPSite(runner, "0.0.0.0", port).start()
        log.info("site endpoint: POST http://0.0.0.0:%s/lead", port)
    try:
        await dp.start_polling(bot)
    finally:
        if runner:
            await runner.cleanup()
        await bot.session.close()


if __name__ == "__main__":
    asyncio.run(main())
