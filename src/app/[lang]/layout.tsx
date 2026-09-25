import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Cormorant, Geist, Geist_Mono } from "next/font/google";
import SmoothScroll from "@/components/SmoothScroll";
import { isLocale, locales, SITE } from "@/lib/i18n";
import "../globals.css";

const cormorant = Cormorant({ subsets: ["latin", "cyrillic"], weight: ["500", "600"], style: ["normal", "italic"], variable: "--font-cormorant" });
const geist = Geist({ subsets: ["latin", "cyrillic"], variable: "--font-geist" });
const geistMono = Geist_Mono({ subsets: ["latin", "cyrillic"], variable: "--font-geist-mono" });

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

export const viewport: Viewport = { themeColor: "#0b0a09", colorScheme: "dark" };

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return (
    <html lang={lang} className={`${cormorant.variable} ${geist.variable} ${geistMono.variable}`}>
      <body className="grain min-h-[100dvh] antialiased">
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
