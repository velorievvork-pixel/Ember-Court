/**
 * Watches wagate (the WhatsApp gateway on Render). A GitHub Actions schedule opens this every ~10 minutes;
 * if wagate does not answer, or WhatsApp is no longer authorized, the owner gets a Telegram message
 * from the site bot. The check itself is harmless, so the route is public; alerts are throttled.
 */

const WAGATE_HEALTH = "https://wagate-y5px.onrender.com/health";
const OWNER_CHAT_ID = "8569333234";
export const maxDuration = 60;   // a sleeping Render service can take ~50 s to wake

let lastAlert = 0;   // per instance: one alert per 5 minutes at most, whoever calls the route

async function check(): Promise<string | null> {
  try {
    const res = await fetch(WAGATE_HEALTH, { cache: "no-store", signal: AbortSignal.timeout(55_000) });
    if (!res.ok) return `wagate отвечает ${res.status}`;
    const body = await res.json().catch(() => ({}));
    if (body.state !== "authorized") return `WhatsApp не авторизован (state: ${body.state ?? "нет"}). Нужно заново привязать телефон.`;
    return null;
  } catch (e) {
    return e instanceof Error && e.name === "TimeoutError" ? "wagate не ответил за 55 секунд" : "wagate недоступен";
  }
}

export async function GET() {
  const problem = await check();
  if (!problem) return Response.json({ ok: true });

  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  if (token && Date.now() - lastAlert > 5 * 60e3) {
    lastAlert = Date.now();
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: OWNER_CHAT_ID, text: `⚠️ wagate: ${problem}\nПроверка: ${WAGATE_HEALTH}`, disable_web_page_preview: true }),
      signal: AbortSignal.timeout(8000),
    }).catch(() => undefined);
  }
  return Response.json({ ok: false, problem }, { status: 503 });
}
