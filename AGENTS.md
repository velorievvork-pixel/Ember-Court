<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Ember Court — what this repository is

Ember Court is a one-person outbound B2B agency for Kazakhstan and the CIS, run by Yaroslav. It finds
companies that are hiring right now for work the client's product covers, checks each company in the
official registry, and writes to the first person (CEO/owner) by WhatsApp and email. The client gets
replies from interested companies, not a contact list. The first client is Camirix (automation over 1C
for wholesale and production firms). Its outreach agent lives in a separate private repo
(velorievvork-pixel/SaaS, see that repo's AGENTS.md).

This repo holds:

| Path | What it is |
|---|---|
| `src/` | The agency site, https://ember-court.vercel.app (Next.js 16 App Router, TypeScript, Tailwind 4, static generation, Vercel) |
| `docs/` | How the agency operates: `operations.md`, `outbound.md`, `prospects.md` (who we wrote to, solvency check), `replies-playbook.md`, `pilot-offer.md`, `client-report-template.md`, competitor scan |
| `tools/lead-research/` | Site → lead card with signals, contacts and a first-message draft (optional Claude API call) |
| `tools/site-audit/` | Free site audit used as an outreach hook (stdlib Python) |
| `automation/leadbot/` | Template Telegram lead bot sold as the "automation" service |
| `clipper/`, `bot/` | Podcast → vertical clips tool and its Telegram bot (side product) |
| `.github/workflows/` | `watch-wagate.yml` (every 10 min: pings the WhatsApp gateway health, alerts in Telegram), `weekly-report.yml` (Monday report to Telegram) |

Only `src/` and `public/` are built and deployed; the Python folders are ignored by Vercel.

## The site

- Pages live in `src/app/[lang]/…` for `ru`, `en`, `uk`. Public URLs keep the old static names:
  `/`, `/services.html`, `/clients.html`, `/pilot.html`, `/brief.html`, `/thanks.html`, niche pages
  `/outbound-it.html`, `/outbound-production.html`; `en`/`uk` get a `/en`, `/uk` prefix. The mapping is
  rewrites/redirects in `next.config.ts` — keep it when adding a page.
- All copy is in `src/content/{ru,en,uk}.json`; a text change is a JSON change in all three languages.
  `src/lib/i18n.ts` has locales, page paths, contacts and SEO metadata.
- Motion is CSS-only: `[data-inview]` with `InViewObserver`, `.reveal`, the `.pen-*` classes and the
  scroll-driven timelines in `src/app/globals.css`. The `motion` library was removed for page speed
  (home Lighthouse 80 → 94), so skill advice that reaches for Motion or GSAP does not apply here.
- Server routes in `src/app/api/`: `lead` and `brief` (forms → owner's Telegram via the site bot),
  `hit` (an invited company is reading the site, see below), `watch` and `weekly` (called by the
  GitHub workflows). Telegram helper: `src/lib/telegram.ts`. The bot token is only in the server env
  (`TELEGRAM_BOT_TOKEN`); optional env: `LEADS_SHEET_URL`, `GOOGLE_SITE_VERIFICATION`, `NEXT_PUBLIC_CAL_URL`.
- Card payments: Stripe Checkout (`/api/checkout`, webhook `/api/stripe/webhook`, return page `/paid.html`).
  Pay buttons render only when the build has `STRIPE_SECRET_KEY` (a restricted `rk_` key); the webhook needs
  `STRIPE_WEBHOOK_SECRET`. Setup and the event list: `docs/stripe.md`.
- Company visits without cookies: every outreach email links to `https://ember-court.vercel.app/?r=<slug>`.
  The slug must be listed in `RECIPIENTS` in `src/lib/visit.ts`. After 5 s on screen the page posts to
  `/api/hit` and the owner gets "<company> is reading: <page>" in Telegram. No cookies or storage by
  design (no consent banner); do not add them.
- Analytics: Vercel Web Analytics (cookieless).

Check before pushing: `npm run lint` and `npm run build`.

## How work ships

Develop on a feature branch, push, open a PR into `main`, merge; Vercel deploys `main` in about a
minute. Commit messages and PR text never name the AI model.

## Rules that are business decisions, not style

- Contacts only from the company's own site or registry filings; no leak databases, no bought lists.
- A company is written to only if it is solvent: last year's taxes from 10 M ₸ or revenue from 300 M ₸
  (Russia: revenue from 100 M ₽), no tax debt, bankruptcy or high tax-risk status. Record the check in
  `docs/prospects.md`. Exception (owner, 07.10): Ember Court's own clients are small firms with
  last year's taxes from 1 to 4 M ₸, still without tax debt, bankruptcy or high tax-risk status.
- No prices in a first message. In replies the published site prices may be named. Camirix prices are
  never named by us — only Artem, on a call.
- No invented cases or numbers: there is one client (Camirix); only figures already on the site.
- "Are you a bot?" is answered honestly; the assistant is never denied.
- "Don't write to us" ends all contact.
- Names and phone numbers from real conversations never go into tests, examples or reports.
- Secrets live only in environment settings (Vercel, GitHub secrets), never in code or chat.

Sending emails and WhatsApp messages, answering replies and weekly reports are run by scheduled Claude
Code routines. Do not send outreach from another tool in parallel: it would double-contact people.
