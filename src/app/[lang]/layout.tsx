import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Analytics } from "@vercel/analytics/next";
import InViewObserver from "@/components/InViewObserver";
import VisitBeacon from "@/components/VisitBeacon";
import { Golos_Text, PT_Serif } from "next/font/google";
import { isLocale, locales, SITE } from "@/lib/i18n";
import "../globals.css";

const golos = Golos_Text({ subsets: ["latin", "cyrillic"], variable: "--font-golos" });
// Serif is only the letter and the founder's note, which ink in after load: not preloaded, so the
// four serif files never compete with the headline font on a slow connection.
const ptSerif = PT_Serif({ subsets: ["latin", "cyrillic"], weight: ["400"], style: ["normal", "italic"], variable: "--font-pt-serif" });

export const dynamicParams = false;
export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  icons: { icon: "/favicon.svg" },
  openGraph: { type: "website", siteName: "Ember Court" },
  twitter: { card: "summary_large_image" },
  // Google Search Console ownership tag (HTML-tag method); set GOOGLE_SITE_VERIFICATION in Vercel.
  ...(process.env.GOOGLE_SITE_VERIFICATION ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION.trim() } } : {}),
};

export const viewport: Viewport = { themeColor: "#121a2b", colorScheme: "dark" };

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return (
    <html lang={lang} className={`${golos.variable} ${ptSerif.variable}`} suppressHydrationWarning>
      <head>
        {/* Entrance animations hide content only when JS will reveal it again (see globals.css). */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body className="min-h-[100dvh]">
        {children}
        <InViewObserver />
        {/* Which invited company reads which page: no cookies, only visitors with ?r= from our emails. */}
        <VisitBeacon />
        {/* Vercel Web Analytics: page views, no cookies. */}
        <Analytics />
      </body>
    </html>
  );
}
