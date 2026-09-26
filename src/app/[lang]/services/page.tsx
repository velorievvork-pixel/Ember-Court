import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { PenCheck, StruckLine } from "@/components/Pen";
import { MethodSteps, Reveal } from "@/components/Reveal";
import { btnAccent, btnGhost, h2l, wide } from "@/components/ui";
import { clockText, contacts, getT, href, langLabel, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/meta";

export async function generateMetadata({ params }: PageProps<"/[lang]/services">) {
  return pageMetadata((await params).lang as Locale, "services");
}

// Anchors keep the old public URLs (/services.html#sites …) working.
const MORE = [
  { id: "sites", p: "ws" },
  { id: "automation", p: "at" },
  { id: "audit", p: "au" },
  { id: "video", p: "vd" },
];

export default async function Services({ params }: PageProps<"/[lang]/services">) {
  const lang = (await params).lang as Locale;
  const t = getT(lang, "services");
  const steps = [1, 2, 3, 4].map((n) => ({ h: t(`s2.ob.s${n}.h`), p: t(`s2.ob.s${n}.p`) }));
  const channels = ["wa", "em", "call"] as const;

  return (
    <>
      <Header lang={lang} page="services" labels={{ home: t("nav.home"), services: t("nav.services"), clients: t("nav.clients"), cta: t("nav.cta"), lang: langLabel[lang] }} />
      <main id="main">
        <section className={`${wide} pb-14 pt-14 sm:pb-20 sm:pt-20`}>
          <h1 className="max-w-[20ch] text-balance text-[clamp(2.3rem,4.8vw,3.75rem)] font-semibold leading-[1.05] tracking-[-0.035em]">{t("s2.h1")}</h1>
          <p className="mt-6 max-w-[40rem] text-pretty text-[18px] leading-[1.6] text-ink-muted">{t("s2.lede")}</p>
          <nav aria-label={t("nav.services")} className="mt-10">
            <ul className="flex flex-wrap gap-2.5">
              {[["outbound", "ob"], ...MORE.map((m) => [m.id, m.p])].map(([id, p]) => (
                <li key={id}>
                  <a href={`#${id}`} className="inline-flex min-h-10 items-center rounded-full border border-rule px-4 text-[15px] text-ink-muted transition-colors duration-200 hover:border-ink/40 hover:text-ink">
                    {t(`s2.nav.${p}`)}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </section>

        {/* Outbound: the product. Method, channels, the bar, how we write, the price. */}
        <section id="outbound" className="scroll-mt-20 border-t border-rule">
          <div className={`${wide} py-20 sm:py-28`}>
            <h2 className={`${h2l} max-w-[22ch] text-balance`}>{t("s2.ob.h")}</h2>
            <p className="mt-4 max-w-[40rem] text-pretty text-[18px] leading-[1.6] text-ink-muted">{t("s2.ob.lede")}</p>
            <MethodSteps steps={steps} />

            <div className="mt-20 grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
              <h3 className="text-[24px] font-semibold tracking-[-0.02em]">{t("s2.ob.ch.h")}</h3>
              <dl className="border-b border-rule">
                {channels.map((c, i) => (
                  <Reveal key={c} delay={i * 0.05}>
                    <div className="grid gap-1 border-t border-rule py-5 sm:grid-cols-[9rem_1fr] sm:gap-6">
                      <dt className="text-[17px] font-semibold">{t(`s2.ob.ch.${c}.h`)}</dt>
                      <dd className="text-[16px] leading-[1.6] text-ink-muted">{t(`s2.ob.ch.${c}.p`)}</dd>
                    </div>
                  </Reveal>
                ))}
              </dl>
            </div>

            <div className="mt-16 grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
              <div>
                <h3 className="text-[24px] font-semibold tracking-[-0.02em]">{t("s2.ob.sel.h")}</h3>
                <p className="mt-3 max-w-[30rem] text-[16px] leading-[1.6] text-ink-muted">{t("s2.ob.sel.p")}</p>
              </div>
              <ul className="grid content-start gap-3">
                {[1, 2, 3, 4].map((n, i) => (
                  <li key={n} className="text-[16.5px] leading-[1.55]"><StruckLine text={t(`ob.std.excl.${n}`)} delay={i * 0.12} /></li>
                ))}
              </ul>
            </div>

            <div className="mt-16 grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
              <h3 className="text-[24px] font-semibold tracking-[-0.02em]">{t("s2.ob.tx.h")}</h3>
              <div className="grid gap-10 sm:grid-cols-2">
                <div>
                  <p className="mb-4 text-[14.5px] text-ink-muted">{t("s2.ob.tx.no")}</p>
                  <ul className="grid gap-3">
                    {[1, 2, 3, 4].map((n, i) => (
                      <li key={n} className="text-[16px] leading-[1.55]"><StruckLine text={t(`ob.wr.avoid.${n}`)} delay={i * 0.1} /></li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="mb-4 text-[14.5px] text-ink-muted">{t("s2.ob.tx.yes")}</p>
                  <ul className="grid gap-3">
                    {[1, 2, 3, 4].map((n, i) => (
                      <li key={n} className="flex gap-3 text-[16px] leading-[1.55]"><PenCheck delay={0.4 + i * 0.1} className="mt-[-1px] h-5 w-5" />{t(`ob.wr.instead.${n}`)}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-16 flex flex-col gap-5 rounded-[14px] border border-ember/60 bg-sheet p-7 sm:flex-row sm:items-center sm:justify-between sm:p-8">
              <p className="max-w-[34rem] text-[19px] font-semibold leading-[1.4] tracking-[-0.01em]">{t("s2.ob.price")}</p>
              <a href={href(lang, "index", "#lead")} className={btnAccent}>{t("s2.ob.cta")}</a>
            </div>
          </div>
        </section>

        {/* What follows once the conversation has started. */}
        <section className="border-t border-rule">
          <div className={`${wide} py-20 sm:py-28`}>
            <h2 className={`${h2l} max-w-[20ch] text-balance`}>{t("s2.more.h")}</h2>
            <div className="mt-12 border-b border-rule">
              {MORE.map(({ id, p }) => (
                <article key={id} id={id} className="grid scroll-mt-20 gap-8 border-t border-rule py-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
                  <header>
                    <h3 className="text-[26px] font-semibold tracking-[-0.02em]">{t(`s2.${p}.h`)}</h3>
                    <p className="mt-1.5 text-[17px] font-semibold text-ember tabular-nums">{t(`s2.${p}.price`)}</p>
                  </header>
                  <div>
                    <p className="max-w-[40rem] text-pretty text-[17px] leading-[1.6] text-ink">{t(`s2.${p}.p`)}</p>
                    <div className="mt-7 grid gap-8 sm:grid-cols-[1.3fr_1fr]">
                      <div>
                        <p className="mb-3 text-[14.5px] text-ink-muted">{t("s2.inc")}</p>
                        <ul className="grid gap-2.5">
                          {t(`s2.${p}.i`).split("|").map((it, i) => (
                            <li key={it} className="flex gap-3 text-[15.5px] leading-[1.5]"><PenCheck delay={i * 0.1} className="mt-[-1px] h-5 w-5" />{it}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="mb-3 text-[14.5px] text-ink-muted">{t("s2.refuse")}</p>
                        <p className="text-[15.5px] leading-[1.5]"><StruckLine text={t(`s2.${p}.no`)} delay={0.3} /></p>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="border-t border-rule bg-paper-deep">
          <div className={`${wide} grid gap-8 py-20 sm:py-24 lg:grid-cols-[1fr_auto] lg:items-end`}>
            <div>
              <h2 className={h2l}>{t("s2.close.h")}</h2>
              <p className="mt-4 max-w-[36rem] text-[17px] leading-[1.6] text-ink-muted">{t("s2.close.p")}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a href={href(lang, "index", "#lead")} className={btnAccent}>{t("s2.ob.cta")}</a>
              <a href={contacts.telegram} className={btnGhost}>Telegram {contacts.telegramHandle}</a>
            </div>
          </div>
        </section>
      </main>
      <Footer tag={t("footer.tag")} clock={clockText(lang)} />
    </>
  );
}
