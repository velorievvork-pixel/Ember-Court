import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Golos_Text, PT_Serif } from "next/font/google";
import { isLocale, locales, SITE } from "@/lib/i18n";
import "../globals.css";

const golos = Golos_Text({ subsets: ["latin", "cyrillic"], variable: "--font-golos" });
const ptSerif = PT_Serif({ subsets: ["latin", "cyrillic"], weight: ["400"], variable: "--font-pt-serif" });

export const dynamicParams = false;
export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  icons: { icon: "/favicon.svg" },
  openGraph: { type: "website", siteName: "Ember Court", images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = { themeColor: "#f2f3ef", colorScheme: "light" };

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return (
    <html lang={lang} className={`${golos.variable} ${ptSerif.variable}`}>
      <body className="min-h-[100dvh]">
        {children}
      </body>
    </html>
  );
}
