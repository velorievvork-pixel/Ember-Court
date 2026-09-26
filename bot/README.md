# Telegram-бот нарезки подкастов

Бот поверх [`clipper`](../clipper): пользователь присылает подкаст и получает обратно вертикальные клипы с субтитрами.

- Видео принимается файлом (до 20 МБ через обычный Bot API, до 2 ГБ со своим Bot API сервером) или прямой ссылкой.
- Ролик с подписью «референс» сохраняется как образец: с него берутся темп, цвет и длина клипов.
- `/style` — стиль субтитров (bold / minimal / hype).
- Бесплатно: 1 видео, 3 клипа. Подписка в **Telegram Stars** на 30 дней с автопродлением: 30 видео в месяц, до 8 клипов с каждого. Все значения настраиваются в `.env`.
- Очередь заданий, прогресс в одном сообщении, при ошибке попытка возвращается.
- `/stats` для администратора: пользователи, подписчики, задания, выручка в Stars.
- `/terms` и `/paysupport` обязательны по правилам Telegram для платных ботов.

## Запуск
1. Создайте бота у [@BotFather](https://t.me/BotFather) и получите токен.
2. `cp .env.example .env` и впишите `BOT_TOKEN`, свой Telegram ID в `ADMIN_IDS`, цены и лимиты.
3. Запустите одним из способов.

**Docker** (из корня репозитория):
```bash
docker build -f bot/Dockerfile -t clipbot .
docker run -d --name clipbot --restart=always --env-file bot/.env -v clipbot-data:/data clipbot
```

**Без Docker** (Ubuntu VPS):
```bash
sudo apt install -y ffmpeg python3-venv
python3 -m venv .venv && .venv/bin/pip install -r bot/requirements.txt
cd bot && ../.venv/bin/python -m clipbot
```
Для автозапуска после перезагрузки есть пример `clipbot.service` для systemd.

## Сервер
| Нагрузка | Что нужно |
|---|---|
| Тест и первые пользователи | VPS 2–4 vCPU, 4–8 ГБ RAM, `WHISPER=small`, ~$10–40/мес |
| Десятки видео в день | 8+ vCPU или GPU-сервер, `WHISPER=medium`, `WORKERS=2–4` |

Часовой подкаст на 4 vCPU с `WHISPER=small` обрабатывается примерно 10–20 минут, на GPU — 2–5 минут.

## Большие файлы
Обычный Bot API отдаёт ботам файлы только до 20 МБ. Варианты:
- пользователи присылают ссылку (Google Drive с открытым доступом, Яндекс Диск, Dropbox);
- поднять свой [Telegram Bot API server](https://github.com/tdlib/telegram-bot-api) и указать его адрес в `TELEGRAM_API_URL` — лимит вырастает до 2 ГБ.

## Выбор моментов через Claude
Если задан `ANTHROPIC_API_KEY`, лучшие моменты выбирает Claude: он понимает смысл и пишет хуки. Это стоит примерно $0,05–0,30 за час подкаста. Без ключа работает локальная оценка, бесплатно.
