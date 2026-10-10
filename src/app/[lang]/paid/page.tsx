import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { PenCheck } from "@/components/Pen";
import { btnAccent, btnGhost, wide } from "@/components/ui";
import { briefHref, clockText, contacts, getT, langLabel, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/meta";

export async function generateMetadata({ params }: PageProps<"/[lang]/paid">) {
  return pageMetadata((await params).lang as Locale, "paid");
}

// Stripe's no-code customer portal login link (Dashboard → Settings → Billing → Customer portal). Optional.
const portal = process.env.NEXT_PUBLIC_STRIPE_PORTAL_URL?.trim() || "";

/**
 * Where Stripe Checkout returns after payment. It only thanks the visitor: the owner learns about the
 * payment from the webhook, because a buyer may never reach this page.
 */
export default async function Paid({ params }: PageProps<"/[lang]/paid">) {
  const lang = (await params).lang as Locale;
  const t = getT(lang, "paid");
  return (
    <>
      <Header lang={lang} page="paid" labels={{ home: t("nav.home"), services: t("nav.services"), clients: t("nav.clients"), cta: t("nav.cta"), lang: langLabel[lang] }} />
      <main id="main">
        <section className={`${wide} pb-20 pt-16 sm:pb-28 sm:pt-24`}>
          <PenCheck className="h-12 w-12" />
          <h1 className="mt-6 text-balance text-[clamp(2.3rem,4.8vw,3.75rem)] font-semibold leading-[1.05] tracking-[-0.035em]">{t("pd.h1")}</h1>
          <p className="mt-6 max-w-[38rem] text-pretty font-letter text-[19px] leading-[1.65] text-ink">{t("pd.p")}</p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a href={briefHref(lang)} className={btnAccent}>{t("pd.brief")}</a>
            {portal && <a href={portal} className={btnGhost}>{t("pd.portal")}</a>}
            <a href={contacts.telegram} className={btnGhost}>{t("pd.q")}: {contacts.telegramHandle}</a>
          </div>
        </section>
      </main>
      <Footer tag={t("footer.tag")} clock={clockText(lang)} />
    </>
  );
}
