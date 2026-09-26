import { foreignOrigin, sendToOwner } from "@/lib/telegram";

/** The pilot questionnaire (/brief.html) → the owner's Telegram. Same spam traps as the lead form. */

const QUESTIONS = ["Компания и сайт", "Что продают", "Лучшие клиенты", "Кто решает", "Повод", "Кому не писать", "География", "Связь"];
const seen = new Map<string, number[]>();

const clean = (v: unknown) => (typeof v === "string" ? v.replace(/[ \t]+/g, " ").trim().slice(0, 450) : "");

export async function POST(request: Request) {
  if (foreignOrigin(request)) return Response.json({ ok: false }, { status: 403 });
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }
  // A person needs well over 8 seconds for eight questions; bots fill the hidden field.
  if (clean(body.website) || !(Number(body.elapsed) > 8000)) return Response.json({ ok: true });

  const answers = QUESTIONS.map((_, i) => clean(body[`q${i + 1}`]));
  if (!answers[0] || !answers[7]) return Response.json({ ok: false }, { status: 400 });

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const now = Date.now();
  const recent = (seen.get(ip) ?? []).filter((t) => now - t < 30 * 60e3);
  recent.push(now);
  seen.set(ip, recent);
  if (recent.length > 3) return Response.json({ ok: false }, { status: 429 });

  const text = ["Анкета для пилота", `Язык сайта: ${clean(body.lang) || "—"}`, "",
    ...QUESTIONS.map((q, i) => `${q}: ${answers[i] || "—"}`)].join("\n");
  const sent = await sendToOwner(text);
  return sent.ok ? Response.json({ ok: true }) : Response.json({ ok: false, reason: sent.reason }, { status: 503 });
}
