import type { Metadata } from "next";
import BriefForm from "@/components/BriefForm";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { wide } from "@/components/ui";
import { briefHref, clockText, getT, langLabel, locales, type Locale } from "@/lib/i18n";

export async function generateMetadata({ params }: PageProps<"/[lang]/brief">): Promise<Metadata> {
  const lang = (await params).lang as Locale;
  const t = getT(lang, "pilot");
  return {
    title: t("b.title"),
    description: t("b.desc"),
    robots: { index: false, follow: true },
    alternates: { canonical: briefHref(lang), languages: Object.fromEntries(locales.map((l) => [l, briefHref(l)])) },
  };
}

/** The pilot questionnaire: sent to people who said yes, so the pilot can start the next business day. */
export default async function Brief({ params }: PageProps<"/[lang]/brief">) {
  const lang = (await params).lang as Locale;
  const t = getT(lang, "pilot");
  return (
    <>
      <Header lang={lang} page="pilot" langHrefs={Object.fromEntries(locales.map((l) => [l, briefHref(l)])) as Record<Locale, string>}
        labels={{ home: t("nav.home"), services: t("nav.services"), clients: t("nav.clients"), cta: t("nav.cta"), lang: langLabel[lang] }} />
      <main id="main">
        <section className={`${wide} grid gap-10 pb-20 pt-14 sm:pt-20 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16`}>
          <div>
            <h1 className="text-balance text-[clamp(2.2rem,4.6vw,3.4rem)] font-semibold leading-[1.06] tracking-[-0.035em]">{t("b.h1")}</h1>
            <p className="mt-6 max-w-[30rem] text-pretty text-[17px] leading-[1.6] text-ink-muted">{t("b.lede")}</p>
          </div>
          <BriefForm lang={lang} questions={[1, 2, 3, 4, 5, 6, 7, 8].map((n) => t(`b.q${n}`))}
            labels={{ send: t("b.send"), sending: t("b.sending"), ok: t("b.ok"), fail: t("b.fail") }} />
        </section>
      </main>
      <Footer tag={t("footer.tag")} clock={clockText(lang)} />
    </>
  );
}
