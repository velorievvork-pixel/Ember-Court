import type { Metadata } from "next";
import { descriptions, getT, href, locales, type Locale, type Page } from "./i18n";

const titles: Record<Page, (t: (k: string) => string) => string> = {
  index: (t) => t("meta.title"),
  services: (t) => `${t("nav.services")} | Ember Court`,
  clients: (t) => `${t("nav.clients")} | Ember Court`,
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
    openGraph: { title, description, url: href(lang, page), locale: lang },
  };
}
