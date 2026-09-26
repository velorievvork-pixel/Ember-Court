import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { PenCheck, StruckLine } from "@/components/Pen";
import { Reveal } from "@/components/Reveal";
import { btnAccent, btnGhost, h2l, wide } from "@/components/ui";
import { clockText, contacts, getT, href, langLabel, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/meta";

export async function generateMetadata({ params }: PageProps<"/[lang]/clients">) {
  return pageMetadata((await params).lang as Locale, "clients");
}

export default async function Clients({ params }: PageProps<"/[lang]/clients">) {
  const lang = (await params).lang as Locale;
  const t = getT(lang, "clients");
  const ts = getT(lang, "services");

  return (
    <>
      <Header lang={lang} page="clients" labels={{ home: t("nav.home"), services: t("nav.services"), clients: t("nav.clients"), cta: t("nav.cta"), lang: langLabel[lang] }} />
      <main id="main">
        <section className={`${wide} pb-14 pt-14 sm:pb-20 sm:pt-20`}>
          <h1 className="max-w-[18ch] text-balance text-[clamp(2.3rem,4.8vw,3.75rem)] font-semibold leading-[1.05] tracking-[-0.035em]">{t("c2.h1")}</h1>
          <p className="mt-6 max-w-[38rem] text-pretty text-[18px] leading-[1.6] text-ink-muted">{t("c2.lede")}</p>
        </section>

        {/* The one client, with the numbers the client agreed to publish. */}
        <section className="border-t border-rule">
          <div className={`${wide} grid gap-10 py-20 sm:py-24 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16`}>
            <div>
              <h2 className="text-[clamp(2.4rem,4.4vw,3.4rem)] font-semibold leading-none tracking-[-0.035em]">Camirix</h2>
              <p className="mt-3 text-[15px] font-medium text-ember">{t("c2.cam.tag")}</p>
              <p className="mt-5 max-w-[30rem] text-pretty text-[17px] leading-[1.6] text-ink-muted">{t("c2.cam.about")}</p>
            </div>
            <dl className="border-b border-rule">
              {[1, 2, 3, 4, 5].map((n, i) => (
                <Reveal key={n} delay={i * 0.05}>
                  <div className="grid gap-1 border-t border-rule py-5 sm:grid-cols-[10rem_1fr] sm:gap-6">
                    <dt className="text-[14.5px] text-ink-muted">{t(`c2.cam.k${n}`)}</dt>
                    <dd className={`text-[16.5px] leading-[1.55] ${n === 4 ? "font-semibold" : ""}`}>{t(`c2.cam.v${n}`)}</dd>
                  </div>
                </Reveal>
              ))}
            </dl>
          </div>
        </section>

        {/* Fit: the pen ticks what fits and strikes what does not. */}
        <section className="border-t border-rule bg-paper-deep/60">
          <div className={`${wide} py-20 sm:py-24`}>
            <h2 className={h2l}>{t("c2.fit.h")}</h2>
            <div className="mt-10 grid gap-12 md:grid-cols-2">
              <div>
                <h3 className="text-[18px] font-semibold">{t("c2.yes.h")}</h3>
                <ul className="mt-5 grid gap-4">
                  {[1, 2, 3, 4].map((n, i) => (
                    <li key={n} className="flex gap-3 text-[16.5px] leading-[1.5]"><PenCheck delay={i * 0.12} className="mt-[-1px]" />{t(`c2.yes.${n}`)}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-[18px] font-semibold">{t("c2.no.h")}</h3>
                <ul className="mt-5 grid gap-4">
                  {[1, 2, 3].map((n, i) => (
                    <li key={n} className="text-[16.5px] leading-[1.5]"><StruckLine text={t(`c2.no.${n}`)} delay={0.3 + i * 0.12} /></li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="border-t border-rule">
          <div className={`${wide} grid gap-8 py-20 sm:py-24 lg:grid-cols-[1fr_auto] lg:items-end`}>
            <div>
              <h2 className={h2l}>{t("c2.close.h")}</h2>
              <p className="mt-4 max-w-[36rem] text-[17px] leading-[1.6] text-ink-muted">{t("c2.close.p")}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a href={href(lang, "index", "#lead")} className={btnAccent}>{ts("s2.ob.cta")}</a>
              <a href={contacts.telegram} className={btnGhost}>Telegram {contacts.telegramHandle}</a>
            </div>
          </div>
        </section>
      </main>
      <Footer tag={t("footer.tag")} clock={clockText(lang)} />
    </>
  );
}
