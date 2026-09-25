import Link from "next/link";
import Contacts from "@/components/Contacts";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Letter from "@/components/Letter";
import { btnPrimary, btnSecondary, h2, lead, link, muted, section, wrap } from "@/components/ui";
import { auditLink, contacts, descriptions, getT, href, langLabel, SITE, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/meta";

export async function generateMetadata({ params }: PageProps<"/[lang]">) {
  return pageMetadata((await params).lang as Locale, "index");
}

// Outbound first, then what supports it. `isNew` marks the two newest services.
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

  const facts: [string, React.ReactNode][] = [
    [t("facts.what.k"), t("facts.what.v")],
    [t("facts.who.k"), t("facts.who.v")],
    [t("facts.clients.k"), <Link key="c" href={href(lang, "clients")} className={link}>{t("facts.clients.v")}</Link>],
    [t("facts.lang.k"), t("facts.lang.v")],
    [t("facts.reply.k"), t("facts.reply.v")],
    [t("facts.contact.k"), (
      <span key="x">
        <a className={link} href={contacts.telegram}>Telegram {contacts.telegramHandle}</a>
        <br /><a className={link} href={`mailto:${contacts.email}`}>{contacts.email}</a>
        <br /><a className={link} href={contacts.whatsapp}>WhatsApp {contacts.whatsappLabel}</a>
      </span>
    )],
  ];

  return (
    <>
      <Header lang={lang} page="index" labels={{ home: t("nav.home"), services: t("nav.services"), clients: t("nav.clients"), cta: t("nav.cta"), lang: langLabel[lang] }} />
      <main>
        {/* One column of large text, like a letter to the founder; ink for the point, grey for the explanation. */}
        <section className={`${wrap} pb-14 pt-16 sm:pt-24`}>
          <h1 className="text-[clamp(1.875rem,4vw,3rem)] font-semibold leading-[1.15] tracking-[-0.025em]">
            {t("hero.h1a")} {t("hero.h1b")}{" "}
            <span className="font-medium text-ink-muted">{t("hero.sub")}</span>
          </h1>
          <div className="mt-10 flex flex-wrap gap-2">
            <a href={contacts.telegram} className={btnPrimary}>{t("hero.cta")}</a>
            <a href={auditLink(lang)} className={btnSecondary}>{t("hero.audit")}</a>
          </div>
        </section>

        <section className={`${wrap} pb-20 sm:pb-28`}>
          <Letter
            greeting={t("letter.greeting")}
            paragraphs={[1, 2, 3, 4].map((n) => t(`letter.p${n}`))}
            notes={[1, 2, 3, 4].map((n) => t(`letter.n${n}`))}
            caption={t("letter.caption")}
            signature="Ember Court"
          />
        </section>

        <section className={`${wrap} pb-20 sm:pb-28`}>
          <p className={`${lead} text-ink-muted`}>
            <span className="text-ink">{t("situation.heading")}</span> {t("situation.body1")}
          </p>
          <p className={`${lead} mt-8`}>{t("situation.body2")}</p>
        </section>

        <section className={`${wrap} pb-20 sm:pb-28`}>
          <p className={`${lead} text-ink-muted`}>{t("svc.lead")}</p>
          <ul className="mt-6 flex flex-wrap gap-x-[0.45em] gap-y-1">
            {SERVICES.map(({ key, anchor, isNew }, i) => (
              <li key={key} className={lead}>
                <Link href={href(lang, "services", `#${anchor}`)} className="underline decoration-ink/20 decoration-2 underline-offset-[6px] transition-colors hover:decoration-pen">
                  {t(`svc.${key}.title`)}
                </Link>
                {isNew && <sup className="ml-1 text-[13px] font-medium text-pen">{t("svc.new")}</sup>}
                {i < SERVICES.length - 1 ? "," : "."}
              </li>
            ))}
          </ul>
          <dl className="mt-12 grid gap-x-10 gap-y-8 sm:grid-cols-2">
            {SERVICES.map(({ key }) => (
              <div key={key}>
                <dt className="text-[16px] font-semibold">{t(`svc.${key}.title`)}</dt>
                <dd className="mt-1 text-[15px] leading-[1.55] text-ink-muted">{t(`svc.${key}.body`)}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className={`${wrap} pb-20 sm:pb-28`}>
          <p className={`${lead} text-ink-muted`}>{t("flow.lead")}</p>
          <ol className="mt-6 grid gap-6">
            {[1, 2, 3].map((n) => (
              <li key={n} className="grid grid-cols-[2rem_1fr] border-t border-rule pt-5">
                <span className="text-[15px] font-semibold text-ink-muted tabular-nums">{n}</span>
                <p className="text-[17px] leading-[1.6]">
                  <span className="font-semibold">{t(`flow.${n}.h`)}.</span> <span className="text-ink-muted">{t(`flow.${n}.p`)}</span>
                </p>
              </li>
            ))}
          </ol>
        </section>

        {/* Facts, key-value (tinloof.com reference): what a founder checks before writing. */}
        <section className={`border-t border-rule ${section}`}>
          <div className={wrap}>
            <h2 className={h2}>{t("facts.h")}</h2>
            <dl className="mt-8 text-[15.5px]">
              {facts.map(([k, v]) => (
                <div key={k} className="grid gap-1 border-t border-rule py-3.5 sm:grid-cols-[11rem_1fr] sm:gap-6">
                  <dt className="text-ink-muted">{k}</dt>
                  <dd className="text-ink">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className={`bg-paper-deep ${section}`}>
          <div className={wrap}>
            <h2 className={h2}>{tc("fit.heading")}</h2>
            <div className="mt-8 grid gap-10 sm:grid-cols-2">
              {([["yes", 4], ["no", 3]] as const).map(([col, n]) => (
                <div key={col}>
                  <h3 className="text-[17px] font-semibold">{tc(`fit.${col}.h`)}</h3>
                  <ul className="mt-3 grid gap-2.5">
                    {Array.from({ length: n }, (_, i) => (
                      <li key={i} className={`border-t border-rule pt-2.5 text-[15.5px] leading-[1.55] ${col === "yes" ? "text-ink" : "text-ink-muted"}`}>
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
          <div className={wrap}>
            <h2 className={h2}>{t("audit.band.h")}</h2>
            <p className={`${muted} mt-3 max-w-[56ch]`}>{t("audit.band.p")}</p>
            <a href={auditLink(lang)} className={`${btnSecondary} mt-6`}>{t("hero.audit")}</a>
          </div>
        </section>

        <Contacts heading={t("close.heading")} line={t("close.line")} alt={t("close.alt")} cta={t("hero.cta")} or={t("contacts.or")} />
      </main>
      <Footer tag={t("footer.tag")} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
