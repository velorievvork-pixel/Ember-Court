/**
 * Pay buttons post a plain form here (no JS needed); we create a Stripe Checkout Session and send the
 * visitor to Stripe's hosted page with a 303. Fulfilment is not done here or on the return page:
 * the webhook (/api/stripe/webhook) tells the owner when money has actually arrived.
 */

import { foreignOrigin } from "@/lib/telegram";
import { contacts, href, isLocale, SITE, type Locale } from "@/lib/i18n";
import { isOffer, OFFERS, stripe, stripeReady } from "@/lib/stripe";

const checkoutLocale = { ru: "ru", en: "en", uk: "auto" } as const;   // Checkout has no Ukrainian; "auto" follows the browser

/** Tags sessions in the Dashboard so this flow can be told apart from invoices; 8 random letters as Stripe asks. */
const integrationId = () => `ec-site-${Array.from({ length: 8 }, () => String.fromCharCode(97 + Math.floor(Math.random() * 26))).join("")}`;

export async function POST(request: Request) {
  if (foreignOrigin(request)) return new Response(null, { status: 403 });

  const form = await request.formData().catch(() => null);
  const offer = form?.get("offer");
  const langRaw = String(form?.get("lang") ?? "ru");
  const lang: Locale = isLocale(langRaw) ? langRaw : "ru";
  if (!isOffer(offer)) return new Response(null, { status: 400 });

  // Without a key (or if Stripe is unreachable) the visitor still reaches the owner instead of an error page.
  // x-ec-reason carries only Stripe's error type/code (never keys or buyer data), so a failure can be diagnosed.
  const fallback = (reason: string) => new Response(null, { status: 303, headers: { location: contacts.telegram, "x-ec-reason": reason } });
  if (!stripeReady()) return fallback("no_key");

  const { lookupKey, mode } = OFFERS[offer];
  try {
    const client = stripe();
    const prices = await client.prices.list({ lookup_keys: [lookupKey], active: true, limit: 1 });
    const price = prices.data[0];
    if (!price) {
      console.error("checkout: no active price for", lookupKey);
      return fallback(`no_price:${lookupKey}`);
    }
    const session = await client.checkout.sessions.create({
      mode,
      line_items: [{ price: price.id, quantity: 1 }],
      // No payment_method_types: Stripe picks the methods turned on in the Dashboard for each buyer.
      locale: checkoutLocale[lang],
      tax_id_collection: { enabled: true },             // companies enter their BIN/VAT id; it lands on the invoice
      billing_address_collection: "required",
      ...(mode === "payment" ? { invoice_creation: { enabled: true }, customer_creation: "always" as const } : {}),
      metadata: { offer, lang },
      integration_identifier: integrationId(),
      success_url: `${SITE}${href(lang, "paid")}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE}${href(lang, "pilot")}`,
    });
    return session.url ? Response.redirect(session.url, 303) : fallback("no_url");
  } catch (e) {
    console.error("checkout: stripe error", e instanceof Error ? e.message.slice(0, 200) : e);
    const err = e as { type?: string; code?: string; param?: string; message?: string };
    const msg = (err.message ?? "").replace(/\b(sk|rk|pk|whsec)_[A-Za-z0-9_*]+/g, "[key]").replace(/[^\x20-\x7E]/g, " ");
    return fallback(`stripe:${err.type ?? "unknown"}:${err.code ?? ""}:${err.param ?? ""}:${msg}`.slice(0, 240));
  }
}
