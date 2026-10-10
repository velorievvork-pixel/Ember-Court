/**
 * Stripe events → the owner's Telegram. This is the fulfilment step: the owner starts work when the
 * message "Оплата получена" arrives, never because someone saw the return page.
 * Every request is verified with the endpoint's signing secret (STRIPE_WEBHOOK_SECRET) before use.
 * If Telegram fails we answer 500, so Stripe retries the event later instead of the news being lost.
 */

import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { sendToOwner } from "@/lib/telegram";

const money = (amount: number | null, currency: string | null) =>
  amount == null ? "—" : `${(amount / 100).toLocaleString("ru-RU", { maximumFractionDigits: 2 })} ${(currency ?? "").toUpperCase()}`;

const offerName: Record<string, string> = { pilot: "Пилот outbound на 2 недели", flow: "Поток outbound, подписка" };

function sessionText(s: Stripe.Checkout.Session, head: string) {
  const d = s.customer_details;
  const taxIds = d?.tax_ids?.map((x) => `${x.type}: ${x.value}`).join(", ");
  return [
    head,
    `Что: ${offerName[s.metadata?.offer ?? ""] ?? s.metadata?.offer ?? "—"}`,
    `Сумма: ${money(s.amount_total, s.currency)}`,
    `Плательщик: ${d?.business_name || d?.name || "—"}`,
    `Почта: ${d?.email || "—"}`,
    taxIds ? `Налоговый номер: ${taxIds}` : "",
    `Страна: ${d?.address?.country || "—"}`,
    `Stripe: https://dashboard.stripe.com/${s.livemode ? "" : "test/"}checkout/sessions/${s.id}`,
  ].filter(Boolean).join("\n");
}

function invoiceText(i: Stripe.Invoice, head: string) {
  return [
    head,
    `Сумма: ${money(i.amount_due, i.currency)}`,
    `Клиент: ${i.customer_name || i.customer_email || "—"}`,
    i.hosted_invoice_url ? `Счёт: ${i.hosted_invoice_url}` : "",
  ].filter(Boolean).join("\n");
}

/** The Telegram text for an event, or null when the event needs no message. */
function message(event: Stripe.Event): string | null {
  switch (event.type) {
    case "checkout.session.completed": {
      const s = event.data.object;
      // Delayed methods complete the session while still unpaid; the async events below settle them.
      return s.payment_status === "unpaid" ? sessionText(s, "Оформлена оплата, ждём поступления денег") : sessionText(s, "Оплата получена ✅");
    }
    case "checkout.session.async_payment_succeeded":
      return sessionText(event.data.object, "Оплата получена ✅");
    case "checkout.session.async_payment_failed":
      return sessionText(event.data.object, "Оплата не прошла ❌");
    case "invoice.paid": {
      const i = event.data.object;
      // The first invoice of a subscription is already reported by checkout.session.completed.
      return i.billing_reason === "subscription_create" ? null : invoiceText(i, "Оплачен счёт / продление подписки ✅");
    }
    case "invoice.payment_failed":
      return invoiceText(event.data.object, "Не прошла оплата по счёту или подписке ❌ Stripe повторит попытку сам");
    case "customer.subscription.updated": {
      const sub = event.data.object;
      const prev = event.data.previous_attributes as Partial<Stripe.Subscription> | undefined;
      return sub.cancel_at_period_end && prev?.cancel_at_period_end === false ? `Клиент отменил подписку, она закончится в конце оплаченного периода\nStripe: ${sub.id}` : null;
    }
    case "customer.subscription.deleted":
      return `Подписка закончилась\nStripe: ${event.data.object.id}`;
    case "charge.dispute.created":
      return `Спор по платежу (chargeback) — ответить в Stripe в срок\nСумма: ${money(event.data.object.amount, event.data.object.currency)}`;
    default:
      return null;
  }
}

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  const signature = request.headers.get("stripe-signature");
  if (!secret || !signature) return new Response(null, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(await request.text(), signature, secret);
  } catch {
    return new Response(null, { status: 400 });   // not from Stripe, or tampered with
  }

  const text = message(event);
  if (!text) return Response.json({ received: true });
  const sent = await sendToOwner(text + (event.livemode ? "" : "\n(тестовый режим)"));
  return sent.ok ? Response.json({ received: true }) : new Response(null, { status: 500 });
}
