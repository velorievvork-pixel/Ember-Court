import { Check, Minus } from "@phosphor-icons/react/dist/ssr";
import Close from "@/components/Close";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Reveal, RevealItem } from "@/components/Reveal";
import { eyebrow, h2, lede, wrap } from "@/components/ui";
import { getT, langLabel, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/meta";

export async function generateMetadata({ params }: PageProps<"/[lang]/clients">) {
  return pageMetadata((await params).lang as Locale, "clients");
}

export default async function Clients({ params }: PageProps<"/[lang]/clients">) {
  const lang = (await params).lang as Locale;
  const t = getT(lang, "clients");

  return (
    <>
      <Header lang={lang} page="clients" labels={{ home: t("nav.home"), services: t("nav.services"), clients: t("nav.clients"), cta: t("nav.cta"), lang: langLabel[lang] }} />
      <main>
        <section className={`${wrap} pb-20 pt-20 sm:pt-28`}>
          <Reveal>
            <p className={eyebrow}>{t("ph.eyebrow")}</p>
            <h1 className="mt-5 max-w-[20ch] font-display text-[clamp(2.2rem,5vw,4rem)] font-medium leading-[1.05] tracking-[-0.01em]">{t("ph.heading")}</h1>
            <p className={`${lede} mt-7`}>{t("ph.lede")}</p>
          </Reveal>
        </section>

        {/* The client: one large editorial block rather than a card grid. */}
        <section className="border-t border-rule">
          <div className={`${wrap} grid gap-12 py-24 md:grid-cols-12 sm:py-28`}>
            <Reveal className="md:col-span-5">
              <span className="rounded-full bg-ember/15 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-ember">{t("camirix.tag")}</span>
              <h2 className="mt-6 font-display text-[clamp(3rem,7vw,5.5rem)] font-medium leading-none">Camirix</h2>
              <p className="mt-6 text-[16.5px] leading-relaxed text-ink-soft">{t("camirix.about")}</p>
            </Reveal>
            <div className="md:col-span-7">
              <Reveal stagger as="div" className="grid">
                {(["what", "icp", "deliver"] as const).map((k) => (
                  <RevealItem key={k} className="grid gap-2 border-t border-rule py-6 sm:grid-cols-[140px_1fr] sm:gap-8">
                    <h3 className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-faint sm:pt-1">{t(`camirix.scope.${k}.k`)}</h3>
                    <p className="text-[16px] leading-relaxed text-ink">{t(`camirix.scope.${k}.v`)}</p>
                  </RevealItem>
                ))}
              </Reveal>
              <Reveal className="mt-6 rounded-[2px] border-l-2 border-ember/60 bg-panel px-6 py-5 text-[15px] leading-relaxed text-ink-soft">
                {t("camirix.note")}
              </Reveal>
            </div>
          </div>
        </section>

        <section className="border-t border-rule bg-panel/40">
          <div className={`${wrap} py-24 sm:py-28`}>
            <Reveal>
              <p className={eyebrow}>{t("fit.eyebrow")}</p>
              <h2 className={`${h2} mt-5`}>{t("fit.heading")}</h2>
            </Reveal>
            <Reveal stagger className="mt-12 grid gap-12 md:grid-cols-2">
              {([["yes", 4], ["no", 3]] as const).map(([col, n]) => (
                <RevealItem key={col}>
                  <h3 className="font-display text-[24px] font-medium">{t(`fit.${col}.h`)}</h3>
                  <ul className="mt-6 grid gap-4">
                    {Array.from({ length: n }, (_, i) => (
                      <li key={i} className="grid grid-cols-[22px_1fr] gap-3 text-[16px] leading-relaxed text-ink-soft">
                        {col === "yes"
                          ? <Check size={18} weight="bold" className="mt-[3px] text-ember" />
                          : <Minus size={18} weight="bold" className="mt-[3px] text-ink-faint" />}
                        {t(`fit.${col}.${i + 1}`)}
                      </li>
                    ))}
                  </ul>
                </RevealItem>
              ))}
            </Reveal>
          </div>
        </section>

        <Close heading={t("close.heading")} line={t("close.line")} alt={t("close.alt")} />
      </main>
      <Footer tag={t("footer.tag")} />
    </>
  );
}
