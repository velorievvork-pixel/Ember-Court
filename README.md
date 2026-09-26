# Ember Court

Сайт агентства: [ember-court.vercel.app](https://ember-court.vercel.app). Три страницы (главная, услуги, клиенты) на русском, английском и украинском.

## Стек
Next.js 16 (App Router, статическая генерация), TypeScript, Tailwind CSS 4, Motion, Vercel.
Шрифты: Golos Text и PT Serif (Paratype).

Дизайн-система описана в [`DESIGN.md`](DESIGN.md) в формате скилла anydesign. Рядом лежат `design-tokens.json` (токены в формате DTCG) и `design-a11y.md` (проверка контраста).

## Запуск
```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # проверка перед публикацией
npm run lint
```

## Где что лежит
| Путь | Что там |
|---|---|
| `src/content/{ru,en,uk}.json` | Все тексты сайта. Правка текста = правка этих файлов |
| `src/app/[lang]/` | Страницы: `page.tsx` (главная), `services/`, `clients/` |
| `src/components/` | Шапка, подвал, блок контактов, секции услуг, письмо с пометками (`Letter.tsx`) |
| `src/lib/i18n.ts` | Языки, адреса страниц, контакты, описания для поисковиков |
| `next.config.ts` | Старые адреса `/services.html`, `/clients.html` сохранены через rewrites |

Адреса: `/`, `/services.html`, `/clients.html`; английская и украинская версии — с префиксом `/en`, `/uk`.

## Другие проекты в репозитории
| Папка | Что это |
|---|---|
| `clipper/` | Нарезка подкастов в Reels/Shorts |
| `bot/` | Telegram-бот нарезки с подпиской в Stars |
| `tools/site-audit/` | Аудит сайтов для outbound |
| `docs/` | План развития и шаблоны outbound |

Они не попадают в сборку сайта (`.vercelignore`).
