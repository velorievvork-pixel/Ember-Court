import type { MetadataRoute } from "next";
import { href, locales, NICHES, nicheHref, SITE, type Niche, type Page } from "@/lib/i18n";

const pages: Page[] = ["index", "services", "clients", "examples", "pilot"];

export default function sitemap(): MetadataRoute.Sitemap {
  const niches = (Object.keys(NICHES) as Niche[]).flatMap((n) =>
    locales.map((lang) => ({
      url: SITE + nicheHref(lang, n),
      alternates: { languages: Object.fromEntries(locales.map((l) => [l, SITE + nicheHref(l, n)])) },
      priority: 0.7,
    })),
  );
  return [...niches, ...pages.flatMap((page) =>
    locales.map((lang) => ({
      url: SITE + href(lang, page),
      alternates: { languages: Object.fromEntries(locales.map((l) => [l, SITE + href(l, page)])) },
      priority: page === "index" ? 1 : 0.8,
    })),
  )];
}
