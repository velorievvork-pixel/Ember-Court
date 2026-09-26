# Как всё устроено — Ember Court

Коротко: что где живёт, какие настройки где лежат и что делать, если что-то сломалось.
Секретов в этом файле нет, только их имена и места.

## Карта

| Что | Где | Кто это видит |
|---|---|---|
| Сайт | ember-court.vercel.app, код — этот репозиторий (`main` → Vercel сам выкатывает за ~1 мин) | все |
| Заявки с сайта | форма → `/api/lead` → бот @Embercourtbot пишет Ярославу в Telegram; копия в Google Таблицу, если подключена | Ярослав |
| Страница «Спасибо» | `/thanks.html` — её просмотры в Vercel Analytics = число отправленных заявок | Ярослав |
| Аналитика | Vercel → проект ember-court → Analytics (без cookies) | Ярослав |
| Мониторинг wagate | GitHub Actions «Watch wagate» каждые ~10 мин → `/api/watch` → бот пишет, если wagate не отвечает или WhatsApp отвязан | Ярослав |
| Отчёт за неделю | GitHub Actions «Weekly report», понедельник 09:03 по Астане → `/api/weekly` → бот | Ярослав |
| WhatsApp-шлюз wagate | Render (сервис wagate), база — Neon Postgres; код — репозиторий SaaS, папка `wagate/` | — |
| Агент Camirix | репозиторий SaaS, папка `camirix/`; правила — `camirix/agent/policy.yaml`, уроки — `lessons.md` | — |

## Настройки (Vercel → ember-court → Settings → Environment Variables)

| Имя | Что это | Без неё |
|---|---|---|
| `TELEGRAM_BOT_TOKEN` | токен бота @Embercourtbot (секрет) | форма открывает Telegram посетителю с готовым текстом; мониторинг и отчёт молчат |
| `LEADS_SHEET_URL` | адрес Apps Script таблицы лидов (секрет: по нему можно дописывать строки) — см. `docs/leads-sheet.md` | заявки только в Telegram |
| `GOOGLE_SITE_VERIFICATION` | код подтверждения Search Console (не секрет) | Search Console не подтверждён |
| `NEXT_PUBLIC_CAL_URL` | ссылка Cal.com на 15-минутный звонок (не секрет) | кнопки «Записаться на звонок» нет |

Chat id владельца для бота прописан в коде (`src/app/api/lead/route.ts` и соседних), по просьбе владельца.
После любой правки переменных: Deployments → ⋯ → **Redeploy**, иначе сайт их не увидит.

## Если что-то сломалось

**Заявки перестали приходить в Telegram.** Открой в браузере консоль или любой HTTP-клиент и
отправь POST на `/api/lead` — в ответе будет `reason`:
- `no_token` — нет `TELEGRAM_BOT_TOKEN` в Vercel;
- `telegram_401` — токен отозван или неверный (взять новый в @BotFather → API Token);
- `telegram_403` + `detail` — Telegram не пускает к чату: чаще всего бот заблокирован в личке (нажать Start у @Embercourtbot).
Посетитель в это время не теряется: форма сама открывает ему Telegram с готовым текстом.

**Пришло «⚠️ wagate: …».**
- «не отвечает» / «не ответил за 55 секунд» — Render → wagate → Logs; если сервис упал, Manual Deploy.
- «WhatsApp не авторизован» — телефон отвязался: привязать заново по коду из логов wagate.

**Сайт не обновился после мержа.** Vercel → Deployments: последний деплой красный — открыть лог сборки.

## Проверки перед публикацией

`npx tsc --noEmit && npx eslint src && npm run build` — все три должны пройти.
Контент на трёх языках лежит в `src/content/{ru,en,uk}.json`; новый ключ добавлять во все три.
