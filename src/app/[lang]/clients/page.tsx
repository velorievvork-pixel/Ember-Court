import Contacts from "@/components/Contacts";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { body, h1, h2, muted, section, wrap } from "@/components/ui";
import { getT, langLabel, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/meta";

export async function generateMetadata({ params }: PageProps<"/[lang]/clients">) {
  return pageMetadata((await params).lang as Locale, "clients");
}

export default async function Clients({ params }: PageProps<"/[lang]/clients">) {
  const lang = (await params).lang as Locale;
  const t = getT(lang, "clients");
  const ti = getT(lang, "index");

  return (
    <>
      <Header lang={lang} page="clients" labels={{ home: t("nav.home"), services: t("nav.services"), clients: t("nav.clients"), cta: t("nav.cta"), lang: langLabel[lang] }} />
      <main>
        <section className={`${wrap} pb-12 pt-12 sm:pb-16 sm:pt-20`}>
          <h1 className={`${h1} max-w-[22ch]`}>{t("ph.heading")}</h1>
          <p className={`${muted} mt-6 max-w-[64ch]`}>{t("ph.lede")}</p>
        </section>

        <section className={`border-t border-rule ${section}`}>
          <div className={`${wrap} grid gap-10 md:grid-cols-12`}>
            <div className="md:col-span-5">
              <h2 className="text-[clamp(2.25rem,4vw,3rem)] font-semibold tracking-[-0.025em]">Camirix</h2>
              <p className="mt-1 text-[15px] font-medium text-ink-muted">{t("camirix.tag")}</p>
              <p className={`${muted} mt-5`}>{t("camirix.about")}</p>
            </div>
            <div className="md:col-span-7">
              <dl>
                {(["what", "icp", "deliver"] as const).map((k) => (
                  <div key={k} className="grid gap-1 border-t border-rule py-5 sm:grid-cols-[9rem_1fr] sm:gap-6">
                    <dt className="text-[15px] font-semibold text-ink-muted">{t(`camirix.scope.${k}.k`)}</dt>
                    <dd className={`${body} text-[16px]`}>{t(`camirix.scope.${k}.v`)}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-4 border-t border-rule pt-5 text-[15px] leading-[1.6] text-ink-muted">{t("camirix.note")}</p>
            </div>
          </div>
        </section>

        <section className={`bg-paper-deep ${section}`}>
          <div className={wrap}>
            <h2 className={h2}>{t("fit.heading")}</h2>
            <div className="mt-10 grid gap-10 md:grid-cols-2">
              {([["yes", 4], ["no", 3]] as const).map(([col, n]) => (
                <div key={col}>
                  <h3 className="text-[18px] font-semibold">{t(`fit.${col}.h`)}</h3>
                  <ul className="mt-4 grid gap-3">
                    {Array.from({ length: n }, (_, i) => (
                      <li key={i} className={`border-t border-rule pt-3 ${col === "yes" ? body : muted} text-[16px]`}>{t(`fit.${col}.${i + 1}`)}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Contacts heading={t("close.heading")} line={t("close.line")} alt={t("close.alt")} cta={ti("hero.cta")} or={ti("contacts.or")} />
      </main>
      <Footer tag={t("footer.tag")} />
    </>
  );
}
