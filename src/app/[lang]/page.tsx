import Link from "next/link";
import Contacts from "@/components/Contacts";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Letter from "@/components/Letter";
import { body, btnPrimary, btnSecondary, h1, h2, link, muted, section, wrap } from "@/components/ui";
import { auditLink, contacts, descriptions, getT, href, langLabel, SITE, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/meta";

export async function generateMetadata({ params }: PageProps<"/[lang]">) {
  return pageMetadata((await params).lang as Locale, "index");
}

// Order follows the offer: outbound first, then what supports it. `isNew` marks the two newest services.
const SERVICES = [
  { key: "outbound", anchor: "outbound" },
  { key: "sites", anchor: "sites" },
  { key: "video", anchor: "video" },
  { key: "smm", anchor: "smm" },
  { key: "audit", anchor: "audit", isNew: true },
  { key: "auto", anchor: "automation", isNew: true },
];

export default async function Home({ params }: PageProps<"/[lang]">) {
  const lang = (await params).lang as Locale;
  const t = getT(lang, "index");
  const tc = getT(lang, "clients");

  const jsonLd = {
    "@context": "https://schema.org", "@type": "ProfessionalService", name: "Ember Court",
    url: `${SITE}${href(lang, "index")}`, image: `${SITE}/og.png`, logo: `${SITE}/favicon.svg`,
    email: contacts.email, telephone: "+393290890590", description: descriptions[lang].index,
    sameAs: [contacts.telegram], areaServed: "Worldwide", availableLanguage: ["ru", "en", "uk"],
  };

  return (
    <>
      <Header lang={lang} page="index" labels={{ home: t("nav.home"), services: t("nav.services"), clients: t("nav.clients"), cta: t("nav.cta"), lang: langLabel[lang] }} />
      <main>
        <section className={`${wrap} grid items-start gap-12 pb-16 pt-12 sm:pt-20 md:grid-cols-12 md:pb-24`}>
          <div className="md:col-span-5 md:pt-6">
            <h1 className={h1}>{t("hero.h1a")} {t("hero.h1b")}</h1>
            <p className={`${muted} mt-6 max-w-[40ch]`}>{t("hero.sub")}</p>
            <div className="mt-8 flex flex-wrap gap-2">
              <a href={contacts.telegram} className={`${btnPrimary} px-4`}>{t("hero.cta")}</a>
              <a href={auditLink(lang)} className={`${btnSecondary} px-4`}>{t("hero.audit")}</a>
            </div>
          </div>
          <div className="md:col-span-7">
            <Letter
              greeting={t("letter.greeting")}
              paragraphs={[1, 2, 3, 4].map((n) => t(`letter.p${n}`))}
              notes={[1, 2, 3, 4].map((n) => t(`letter.n${n}`))}
              caption={t("letter.caption")}
              signature="Ember Court"
            />
          </div>
        </section>

        <section className={`border-t border-rule ${section}`}>
          <div className={`${wrap} grid gap-8 md:grid-cols-12`}>
            <h2 className={`${h2} md:col-span-5`}>{t("situation.heading")}</h2>
            <div className="grid max-w-[64ch] gap-5 md:col-span-7">
              <p className={muted}>{t("situation.body1")}</p>
              <p className={body}>{t("situation.body2")}</p>
            </div>
          </div>
        </section>

        <section className={`border-t border-rule ${section}`}>
          <div className={wrap}>
            <h2 className={`${h2} max-w-[30ch]`}>{t("svc.heading")}</h2>
            <ul className="mt-10">
              {SERVICES.map(({ key, anchor, isNew }) => (
                <li key={key} className="grid gap-3 border-t border-rule py-7 md:grid-cols-12 md:gap-8">
                  <h3 className="text-[22px] font-semibold tracking-[-0.01em] md:col-span-4">
                    {t(`svc.${key}.title`)}
                    {isNew && <span className="ml-2 align-middle text-[13px] font-medium text-pen">{t("svc.new")}</span>}
                  </h3>
                  <div className="md:col-span-7">
                    <p className={muted}>{t(`svc.${key}.body`)}</p>
                    <Link href={href(lang, "services", `#${anchor}`)} className={`${link} mt-3 inline-block text-[15px] font-medium`}>
                      {t("svc.more")}
                      <span className="sr-only">: {t(`svc.${key}.title`)}</span>
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className={`border-t border-rule ${section}`}>
          <div className={wrap}>
            <h2 className={`${h2} max-w-[30ch]`}>{t("flow.heading")}</h2>
            <ol className="mt-10 grid gap-8 md:grid-cols-3 md:gap-10">
              {[1, 2, 3].map((n) => (
                <li key={n}>
                  <p className="text-[15px] font-semibold text-ink-muted tabular-nums">{n}</p>
                  <h3 className="mt-2 text-[20px] font-semibold">{t(`flow.${n}.h`)}</h3>
                  <p className={`${muted} mt-2 text-[16px]`}>{t(`flow.${n}.p`)}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className={`${wrap} pb-16 sm:pb-24`}>
          <div className="grid gap-6 rounded-[4px] border border-ink/20 p-7 sm:p-10 md:grid-cols-12 md:items-center">
            <div className="md:col-span-8">
              <h2 className={h2}>{t("audit.band.h")}</h2>
              <p className={`${muted} mt-3 max-w-[56ch]`}>{t("audit.band.p")}</p>
            </div>
            <div className="md:col-span-4 md:justify-self-end">
              <a href={auditLink(lang)} className={btnPrimary}>{t("hero.audit")}</a>
            </div>
          </div>
        </section>

        <section className={`bg-paper-deep ${section}`}>
          <div className={wrap}>
            <h2 className={h2}>{tc("fit.heading")}</h2>
            <div className="mt-10 grid gap-10 md:grid-cols-2">
              {([["yes", 4], ["no", 3]] as const).map(([col, n]) => (
                <div key={col}>
                  <h3 className="text-[18px] font-semibold">{tc(`fit.${col}.h`)}</h3>
                  <ul className="mt-4 grid gap-3">
                    {Array.from({ length: n }, (_, i) => (
                      <li key={i} className={`border-t border-rule pt-3 ${col === "yes" ? body : muted} text-[16px]`}>
                        {tc(`fit.${col}.${i + 1}`)}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={section}>
          <div className={`${wrap} grid gap-6 md:grid-cols-12`}>
            <h2 className={`${h2} md:col-span-5`}>{t("clientsteaser.heading")}</h2>
            <div className="max-w-[60ch] md:col-span-7">
              <p className={muted}>{t("clientsteaser.body")}</p>
              <Link href={href(lang, "clients")} className={`${link} mt-4 inline-block text-[15px] font-medium`}>{t("clientsteaser.link")}</Link>
            </div>
          </div>
        </section>

        <Contacts heading={t("close.heading")} line={t("close.line")} alt={t("close.alt")} cta={t("hero.cta")} or={t("contacts.or")} />
      </main>
      <Footer tag={t("footer.tag")} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
