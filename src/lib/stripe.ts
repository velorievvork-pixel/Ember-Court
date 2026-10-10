import Stripe from "stripe";

/**
 * Stripe on the server only. The key lives in the server env (STRIPE_SECRET_KEY, a restricted key `rk_…`
 * with the permissions listed in docs/stripe.md) and never reaches the browser; payment happens on
 * Stripe-hosted Checkout, so the site itself still sets no cookies and loads no Stripe script.
 */
let client: Stripe | null = null;

/**
 * Payments are on only when the owner switches them on (PAYMENTS_ENABLED=1) and a key is set. Pay buttons are
 * decided at build time, so the site never shows a button that cannot work; checkout refuses while it is off.
 */
export const stripeReady = () => process.env.PAYMENTS_ENABLED?.trim() === "1" && Boolean(process.env.STRIPE_SECRET_KEY?.trim());

export function stripe() {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  client ??= new Stripe(key, { maxNetworkRetries: 2, timeout: 10_000, appInfo: { name: "ember-court-site" } });
  return client;
}

/**
 * What can be bought on the site: fixed-price offers only. Prices live in Stripe under these lookup keys
 * (created by scripts/stripe-catalog.mjs), so amounts change in the Dashboard, not in code.
 * Quoted work ("from $…") is billed with a Stripe invoice after the quote, not from the site.
 */
export const OFFERS = {
  pilot: { lookupKey: "ec_pilot_2w", mode: "payment" },
  flow: { lookupKey: "ec_flow_monthly", mode: "subscription" },
} as const satisfies Record<string, { lookupKey: string; mode: Stripe.Checkout.SessionCreateParams.Mode }>;

export type Offer = keyof typeof OFFERS;
export const isOffer = (v: unknown): v is Offer => typeof v === "string" && Object.hasOwn(OFFERS, v);
