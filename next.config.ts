import type { NextConfig } from "next";

// The static site lived at /, /services.html and /clients.html. Those URLs are indexed,
// so they stay public; the app routes under /[lang] are served behind them.
const pages = ["services", "clients"];

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      beforeFiles: [
        { source: "/", destination: "/ru" },
        { source: "/index.html", destination: "/ru" },
        ...pages.map((p) => ({ source: `/${p}.html`, destination: `/ru/${p}` })),
        ...["en", "uk"].flatMap((l) => pages.map((p) => ({ source: `/${l}/${p}.html`, destination: `/${l}/${p}` }))),
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
    ];
  },
};

export default nextConfig;
