import type { Locale } from "@/lib/i18n";
import type { Offer } from "@/lib/stripe";
import { btnAccent, btnGhost } from "./ui";

/** A plain form to /api/checkout, which sends the visitor to Stripe's hosted page. Works without JS. */
export default function PayButton({ lang, offer, label, ghost = false }: { lang: Locale; offer: Offer; label: string; ghost?: boolean }) {
  return (
    <form action="/api/checkout" method="POST" className="no-print">
      <input type="hidden" name="offer" value={offer} />
      <input type="hidden" name="lang" value={lang} />
      <button type="submit" className={ghost ? btnGhost : btnAccent}>{label}</button>
    </form>
  );
}
