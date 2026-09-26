import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { PenCheck, StruckLine } from "@/components/Pen";
import { MethodSteps } from "@/components/Reveal";
import { btnAccent, btnGhost, wide } from "@/components/ui";
import { briefHref, clockText, contacts, getT, langLabel, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/meta";

export async function generateMetadata({ params }: PageProps<"/[lang]/pilot">) {
  return pageMetadata((await params).lang as Locale, "pilot");
}

/** What the pilot is, for someone who replied "send details". Also printed to /ember-court-pilot-<lang>.pdf. */
export default async function Pilot({ params }: PageProps<"/[lang]/pilot">) {
  const lang = (await params).lang as Locale;
  const t = getT(lang, "pilot");
  const steps = [1, 2, 3, 4].map((n) => ({ h: t(`p.s${n}.h`), p: t(`p.s${n}.p`) }));
  const row = "grid gap-4 border-t border-rule py-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16";
  const h3 = "text-[24px] font-semibold tracking-[-0.02em]";

  return (
    <>
      <Header lang={lang} page="pilot" labels={{ home: t("nav.home"), services: t("nav.services"), clients: t("nav.clients"), cta: t("nav.cta"), lang: langLabel[lang] }} />
      <main id="main">
        <section className={`${wide} pb-14 pt-14 sm:pb-16 sm:pt-20`}>
          <h1 className="max-w-[22ch] text-balance text-[clamp(2.2rem,4.6vw,3.6rem)] font-semibold leading-[1.06] tracking-[-0.035em]">{t("p.h1")}</h1>
          <p className="mt-6 max-w-[42rem] text-pretty text-[18px] leading-[1.6] text-ink-muted">{t("p.lede")}</p>
          <div className="no-print mt-8 flex flex-col gap-3 sm:flex-row">
            <a href={briefHref(lang)} className={btnAccent}>{t("p.cta")}</a>
            <a href={`/ember-court-pilot-${lang}.pdf`} download className={btnGhost}>{t("p.pdf")}</a>
          </div>
        </section>

        <section className={`${wide} pb-16`}>
          <div className={row}>
            <h2 className={h3}>{t("p.inc.h")}</h2>
            <ul className="grid gap-3">
              {t("h.pr.pilot.i").split("|").map((it, i) => (
                <li key={it} className="flex gap-3 text-[17px] leading-[1.55]"><PenCheck delay={i * 0.1} className="mt-[-1px]" />{it}</li>
              ))}
            </ul>
          </div>
          <div className="border-t border-rule py-10">
            <h2 className={h3}>{t("p.plan.h")}</h2>
            <MethodSteps steps={steps} />
          </div>
          <div className={row}>
            <h2 className={h3}>{t("p.need.h")}</h2>
            <p className="max-w-[40rem] text-[17px] leading-[1.6] text-ink">{t("p.need.p")}</p>
          </div>
          <div className={row}>
            <h2 className={h3}>{t("p.no.h")}</h2>
            <ul className="grid gap-3">
              {[1, 2, 3].map((n, i) => (
                <li key={n} className="text-[17px] leading-[1.55]"><StruckLine text={t(`p.no.${n}`)} delay={i * 0.12} /></li>
              ))}
            </ul>
          </div>
          <div className={row}>
            <h2 className={h3}>{t("p.price.h")}</h2>
            <div>
              <p className="text-[34px] font-semibold tracking-[-0.02em] text-ember tabular-nums">$250 <span className="text-[16px] font-normal text-ink-muted">{t("h.pr.pilot.local")}</span></p>
              <p className="mt-2 max-w-[40rem] text-[17px] leading-[1.6] text-ink">{t("p.price.p")}</p>
            </div>
          </div>
          <div className={`${row} border-b`}>
            <h2 className={h3}>{t("p.g.h")}</h2>
            <p className="max-w-[40rem] text-[17px] leading-[1.6] text-ink">{t("h.pr.pilot.g")}</p>
          </div>
        </section>

        <section className="border-t border-rule bg-paper-deep">
          <div className={`${wide} flex flex-col gap-3 py-16 sm:flex-row sm:items-center`}>
            <a href={briefHref(lang)} className={`${btnAccent} no-print`}>{t("p.cta")}</a>
            <a href={contacts.telegram} className={btnGhost}>Telegram {contacts.telegramHandle}</a>
            <span className="print-only text-[15px] text-ink-muted">ember-court.vercel.app · {contacts.email}</span>
          </div>
        </section>
      </main>
      <Footer tag={t("footer.tag")} clock={clockText(lang)} />
    </>
  );
}
