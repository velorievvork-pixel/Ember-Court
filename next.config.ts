import type { NextConfig } from "next";

// The static site lived at /, /services.html and /clients.html. Those URLs are indexed,
// so they stay public; the app routes under /[lang] are served behind them.
const pages = ["services", "clients", "thanks", "pilot", "brief", "examples"];
const niches = { it: "outbound-it", pr: "outbound-production" };   // same as NICHES in src/lib/i18n.ts

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      beforeFiles: [
        { source: "/", destination: "/ru" },
        { source: "/index.html", destination: "/ru" },
        ...pages.map((p) => ({ source: `/${p}.html`, destination: `/ru/${p}` })),
        ...["en", "uk"].flatMap((l) => pages.map((p) => ({ source: `/${l}/${p}.html`, destination: `/${l}/${p}` }))),
        // Niche landing pages: /outbound-it.html → /ru/o/it (src/lib/i18n.ts NICHES).
        ...Object.entries(niches).flatMap(([slug, file]) => [
          { source: `/${file}.html`, destination: `/ru/o/${slug}` },
          ...["en", "uk"].map((l) => ({ source: `/${l}/${file}.html`, destination: `/${l}/o/${slug}` })),
        ]),
      ],
      afterFiles: [],
      fallback: [],
    };
  },
  async redirects() {
    return [
      { source: "/ru", destination: "/", permanent: true },
      ...pages.map((p) => ({ source: `/ru/${p}`, destination: `/${p}.html`, permanent: true })),
      ...pages.map((p) => ({ source: `/${p}`, destination: `/${p}.html`, permanent: true })),
      ...["en", "uk"].flatMap((l) => pages.map((p) => ({ source: `/${l}/${p}`, destination: `/${l}/${p}.html`, permanent: true }))),
      ...Object.entries(niches).flatMap(([slug, file]) =>
        ["ru", "en", "uk"].map((l) => ({ source: `/${l}/o/${slug}`, destination: `${l === "ru" ? "" : `/${l}`}/${file}.html`, permanent: true }))),
    ];
  },
};

export default nextConfig;
