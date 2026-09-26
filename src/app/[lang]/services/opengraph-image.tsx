import { getT, type Locale } from "@/lib/i18n";
import { ogCard, ogSize } from "@/lib/og";

export const size = ogSize;
export const contentType = "image/png";
export const alt = "Ember Court";

export default async function Image({ params }: { params: Promise<{ lang: string }> }) {
  const t = getT((await params).lang as Locale, "services");
  return ogCard({ title: t("s2.h1"), note: t("og.note") });
}
