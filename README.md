# Ember Court

Сайт агентства: [ember-court.vercel.app](https://ember-court.vercel.app). Три страницы (главная, услуги, клиенты) на русском, английском и украинском.

## Стек
Next.js 16 (App Router, статическая генерация) · TypeScript · Tailwind CSS 4 · Motion · Lenis · Phosphor Icons · Vercel.
Дизайн-система и правила — в [`DESIGN.md`](DESIGN.md).

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
| `src/components/` | Шапка, подвал, блок контактов, секции услуг, анимации, эффект огня |
| `src/lib/i18n.ts` | Языки, адреса страниц, контакты, описания для поисковиков |
| `src/lib/blaze.js` | WebGL-огонь (Canvas UI, David Haz, MIT + Commons Clause) |
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
