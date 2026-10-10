// Creates the site's fixed-price offers in Stripe (once; safe to re-run).
// Usage: STRIPE_SECRET_KEY=rk_test_… node scripts/stripe-catalog.mjs   (then again with the live key)
// Keys come from the environment only; never paste them into this file.
import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;
if (!key) throw new Error("Set STRIPE_SECRET_KEY");
const stripe = new Stripe(key);

// One Product per offer; amounts in cents. Change prices later in the Dashboard by moving the lookup key.
const catalog = [
  { lookup_key: "ec_pilot_2w", name: "Пилот outbound на 2 недели / 2-week outbound pilot", unit_amount: 25000 },
  { lookup_key: "ec_flow_monthly", name: "Поток outbound / Outbound flow (monthly)", unit_amount: 49000, recurring: { interval: "month" } },
];

for (const item of catalog) {
  const existing = await stripe.prices.list({ lookup_keys: [item.lookup_key], limit: 1 });
  if (existing.data[0]) { console.log("exists:", item.lookup_key, existing.data[0].id); continue; }
  const product = await stripe.products.create({ name: item.name });
  const price = await stripe.prices.create({
    product: product.id, currency: "usd", unit_amount: item.unit_amount, lookup_key: item.lookup_key,
    ...(item.recurring ? { recurring: item.recurring } : {}),
  });
  console.log("created:", item.lookup_key, price.id);
}
