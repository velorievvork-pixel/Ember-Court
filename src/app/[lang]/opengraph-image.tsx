import { getT, type Locale } from "@/lib/i18n";
import { ogCard, ogSize } from "@/lib/og";

export const size = ogSize;
export const contentType = "image/png";
export const alt = "Ember Court";

export default async function Image({ params }: { params: Promise<{ lang: string }> }) {
  const t = getT((await params).lang as Locale, "index");
  return ogCard({ title: t("h.h1a"), mark: t("h.h1b"), note: t("og.note") });
}
