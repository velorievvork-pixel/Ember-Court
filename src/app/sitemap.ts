import type { MetadataRoute } from "next";
import { href, locales, SITE, type Page } from "@/lib/i18n";

const pages: Page[] = ["index", "services", "clients"];

export default function sitemap(): MetadataRoute.Sitemap {
  return pages.flatMap((page) =>
    locales.map((lang) => ({
      url: SITE + href(lang, page),
      alternates: { languages: Object.fromEntries(locales.map((l) => [l, SITE + href(l, page)])) },
      priority: page === "index" ? 1 : 0.8,
    })),
  );
}
