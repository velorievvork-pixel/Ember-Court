import type { Metadata } from "next";
import { descriptions, getT, href, locales, type Locale, type Page } from "./i18n";

const titles: Record<Page, (t: (k: string) => string) => string> = {
  index: (t) => t("meta.title"),
  services: (t) => `${t("nav.services")} | Ember Court`,
  clients: (t) => `${t("nav.clients")} | Ember Court`,
  thanks: (t) => t("ty.title"),
  pilot: (t) => t("p.title"),
};

/** Title, description, canonical and hreflang alternates for one page in one language. */
export function pageMetadata(lang: Locale, page: Page): Metadata {
  const t = getT(lang, page);
  const title = titles[page](t);
  const description = descriptions[lang][page];
  return {
    title,
    description,
    alternates: {
      canonical: href(lang, page),
      languages: { ...Object.fromEntries(locales.map((l) => [l, href(l, page)])), "x-default": href("ru", page) },
    },
    ...(page === "thanks" ? { robots: { index: false, follow: true } } : {}),
    openGraph: { type: "website", siteName: "Ember Court", title, description, url: href(lang, page), locale: lang },
  };
}
