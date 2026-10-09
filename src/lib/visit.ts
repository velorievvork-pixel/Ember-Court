/**
 * Company visits without cookies. Each outreach email links to the site with its own `?r=<slug>`;
 * the slug is read once from the address and kept in this module for the rest of the tab (client-side
 * navigation keeps JS state), so nothing is stored on the visitor's device.
 */
export const RECIPIENTS: Record<string, string> = {
  itp: "ITP KZ (IT Planet)",
  boyard: "BOYARD",
  complex: "COMPLEX DC",
  enelectronics: "EN Electronics",
  tenderbot: "Tenderbot (Smart Bridge)",
  lamper: "Lamper",
  ecolos: "Ecolos Engineering",
  wellsun: "WellSun",
  unitedexpo: "United Expo",
  bexpert: "B-expert (Бизнес-Эксперт Консалт)",
  shanyraqstudy: "Shanyraq Study",
};

let recipient: string | null = null;

/** Reads `?r=` once per tab; unknown slugs are ignored. */
export function captureRecipient(search: string) {
  if (recipient) return recipient;
  const r = new URLSearchParams(search).get("r")?.toLowerCase().trim() ?? "";
  if (r && Object.hasOwn(RECIPIENTS, r)) recipient = r;
  return recipient;
}

export const currentRecipient = () => recipient;

/** Company name for a slug; plain `RECIPIENTS[x]` would also answer for "constructor" and friends. */
export const recipientName = (slug: string) => (Object.hasOwn(RECIPIENTS, slug) ? RECIPIENTS[slug] : "");
