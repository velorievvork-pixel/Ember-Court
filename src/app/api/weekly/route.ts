/**
 * Monday report to the owner's Telegram (opened by .github/workflows/weekly-report.yml):
 * is wagate up, how many requests came this week (from the leads sheet, if connected),
 * and which site settings are still waiting to be switched on. Throttled: one report per 6 hours.
 */

const WAGATE_HEALTH = "https://wagate-y5px.onrender.com/health";
const OWNER_CHAT_ID = "8569333234";
export const maxDuration = 60;

let lastReport = 0;

async function wagate() {
  try {
    const res = await fetch(WAGATE_HEALTH, { cache: "no-store", signal: AbortSignal.timeout(55_000) });
    const body = await res.json().catch(() => ({}));
    return res.ok && body.state === "authorized" ? "✅ работает, WhatsApp привязан" : `⚠️ ${res.status}, state: ${body.state ?? "нет"}`;
  } catch {
    return "⚠️ не отвечает";
  }
}

async function leads() {
  const url = process.env.LEADS_SHEET_URL?.trim();
  if (!url) return "таблица не подключена (LEADS_SHEET_URL)";
  try {
    const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(15_000) });
    const body = await res.json();
    if (typeof body.week !== "number") return "таблица ответила без счётчика: обнови скрипт из docs/leads-sheet.md";
    return `${body.week} за неделю, ${body.total} всего`;
  } catch {
    return "таблица не ответила";
  }
}

export async function GET() {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  if (!token) return Response.json({ ok: false, reason: "no_token" }, { status: 503 });
  if (Date.now() - lastReport < 6 * 3600e3) return Response.json({ ok: true, skipped: "sent recently" });
  lastReport = Date.now();

  const [wa, count] = await Promise.all([wagate(), leads()]);
  const todo = [
    ["LEADS_SHEET_URL", "таблица лидов"],
    ["GOOGLE_SITE_VERIFICATION", "Google Search Console"],
    ["NEXT_PUBLIC_CAL_URL", "запись на звонок (Cal.com)"],
  ].filter(([k]) => !process.env[k]?.trim()).map(([, v]) => `• ${v}`);

  const text = [
    "Отчёт за неделю — Ember Court",
    "",
    `Сайт: ✅ работает`,
    `wagate: ${wa}`,
    `Заявки с сайта: ${count}`,
    "Посещения: Vercel → ember-court → Analytics (страница /thanks.html = отправленные заявки)",
    ...(todo.length ? ["", "Ещё не включено:", ...todo] : []),
  ].join("\n");

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: OWNER_CHAT_ID, text, disable_web_page_preview: true }),
    signal: AbortSignal.timeout(8000),
  }).catch(() => null);
  return Response.json({ ok: !!res?.ok }, { status: res?.ok ? 200 : 503 });
}
