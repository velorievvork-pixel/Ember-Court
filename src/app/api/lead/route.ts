/**
 * The lead form posts here; the request is forwarded to the owner's Telegram by the site's bot.
 * The token lives only in the server environment (TELEGRAM_BOT_TOKEN) and never reaches the browser.
 * The owner's chat id is not a secret, so it is kept here (the owner asked for it this way). Any failure answers 503 so the form can fall back to opening Telegram itself.
 */

const OWNER_CHAT_ID = "8569333234";

const LIMIT = { name: 80, site: 160, contact: 120, need: 80 };
const seen = new Map<string, number[]>();   // best effort per instance: a few requests per IP per 10 min

function tooMany(ip: string) {
  const now = Date.now();
  const recent = (seen.get(ip) ?? []).filter((t) => now - t < 10 * 60e3);
  recent.push(now);
  seen.set(ip, recent);
  if (seen.size > 5000) seen.clear();
  return recent.length > 5;
}

const clean = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "");

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }

  // Spam traps: a hidden field people never see, and a form filled faster than a person can type.
  const elapsed = Number(body.elapsed);
  if (clean(body.website, 200) || !(elapsed > 2500)) return Response.json({ ok: true });

  const lead = {
    name: clean(body.name, LIMIT.name),
    site: clean(body.site, LIMIT.site),
    contact: clean(body.contact, LIMIT.contact),
    need: clean(body.need, LIMIT.need),
    lang: clean(body.lang, 2),
  };
  if (!lead.name || !lead.site || !lead.contact) return Response.json({ ok: false }, { status: 400 });

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (tooMany(ip)) return Response.json({ ok: false }, { status: 429 });

  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chat = OWNER_CHAT_ID;
  // The reason is safe to show (no values) and lets the owner see which setting is missing.
  if (!token) return Response.json({ ok: false, reason: "no_token" }, { status: 503 });

  // Plain text, no parse mode: whatever a visitor types is shown as typed, never as markup.
  const text = [
    "Новая заявка с сайта",
    `Имя: ${lead.name}`,
    `Компания: ${lead.site}`,
    `Связь: ${lead.contact}`,
    `Нужно: ${lead.need || "—"}`,
    `Язык сайта: ${lead.lang || "—"}`,
  ].join("\n");

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: chat, text, disable_web_page_preview: true }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      const answer = await res.json().catch(() => ({}));
      const detail = typeof answer.description === "string" ? answer.description.slice(0, 120) : "";
      console.error("lead: telegram answered", res.status, detail);
      // Telegram's own wording ("chat not found", "bot can't initiate conversation…") names the fix; it holds no secrets.
      return Response.json({ ok: false, reason: `telegram_${res.status}`, detail }, { status: 503 });
    }
  } catch (e) {
    console.error("lead: telegram unreachable", e instanceof Error ? e.name : e);
    return Response.json({ ok: false }, { status: 503 });
  }
  return Response.json({ ok: true });
}
