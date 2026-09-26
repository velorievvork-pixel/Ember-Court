/** Messages to the owner's Telegram from the site bot. Token in the server env only; chat id is not secret. */
export const OWNER_CHAT_ID = "8569333234";

export async function sendToOwner(text: string): Promise<{ ok: true } | { ok: false; reason: string; detail?: string }> {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  if (!token) return { ok: false, reason: "no_token" };
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      // Plain text, no parse mode: whatever a visitor types is shown as typed, never as markup.
      body: JSON.stringify({ chat_id: OWNER_CHAT_ID, text: text.slice(0, 4000), disable_web_page_preview: true }),
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok) return { ok: true };
    const answer = await res.json().catch(() => ({}));
    const detail = typeof answer.description === "string" ? answer.description.slice(0, 120) : "";
    console.error("telegram answered", res.status, detail);
    return { ok: false, reason: `telegram_${res.status}`, detail };
  } catch (e) {
    console.error("telegram unreachable", e instanceof Error ? e.name : e);
    return { ok: false, reason: "telegram_unreachable" };
  }
}

/** Only our own pages post to the form APIs; a browser on another site always sends its Origin. */
export function foreignOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  const preview = origin.startsWith("https://ember-court") && origin.endsWith(".vercel.app");
  return origin !== "https://ember-court.vercel.app" && origin !== "http://localhost:3000" && !preview;
}
