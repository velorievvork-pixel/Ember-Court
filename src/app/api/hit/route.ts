/**
 * A company from the outreach list is reading the site (VisitBeacon). The owner gets one Telegram line
 * per page, at most once per company and page every 30 minutes. Unknown slugs and foreign origins are
 * dropped silently so the endpoint can't be used to spam the owner.
 */
import { foreignOrigin, sendToOwner } from "@/lib/telegram";
import { recipientName } from "@/lib/visit";

const recent = new Map<string, number>();   // best effort per instance
const BOTS = /bot|crawl|spider|preview|headless|scanner|slurp|facebookexternalhit|python|curl|wget/i;

export async function POST(request: Request) {
  if (foreignOrigin(request)) return new Response(null, { status: 403 });
  if (BOTS.test(request.headers.get("user-agent") ?? "")) return new Response(null, { status: 204 });
  let body: { r?: unknown; path?: unknown; ref?: unknown };
  try {
    body = JSON.parse(await request.text());
  } catch {
    return new Response(null, { status: 400 });
  }
  const r = typeof body.r === "string" ? body.r : "";
  const name = recipientName(r);
  const path = typeof body.path === "string" ? body.path.slice(0, 120) : "";
  if (!name || !path.startsWith("/")) return new Response(null, { status: 204 });

  const key = `${r} ${path}`;
  const now = Date.now();
  if (now - (recent.get(key) ?? 0) < 30 * 60e3) return new Response(null, { status: 204 });
  recent.set(key, now);
  if (recent.size > 2000) recent.clear();

  await sendToOwner(`${name} читает сайт: ${path === "/" ? "главная" : path}`);
  return new Response(null, { status: 204 });
}
