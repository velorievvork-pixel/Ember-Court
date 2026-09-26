import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Analytics } from "@vercel/analytics/next";
import { Golos_Text, PT_Serif } from "next/font/google";
import { isLocale, locales, SITE } from "@/lib/i18n";
import "../globals.css";

const golos = Golos_Text({ subsets: ["latin", "cyrillic"], variable: "--font-golos" });
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
    <html lang={lang} className={`${golos.variable} ${ptSerif.variable}`}>
      <body className="min-h-[100dvh]">
        {children}
        {/* Vercel Web Analytics: page views, no cookies. */}
        <Analytics />
      </body>
    </html>
  );
}
