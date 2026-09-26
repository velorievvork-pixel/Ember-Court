import Link from "next/link";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import LeadForm from "@/components/LeadForm";
import Letter from "@/components/Letter";
import { btnAccent, btnGhost, h2l, wide } from "@/components/ui";
import { auditLink, contacts, descriptions, getT, href, langLabel, SITE, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/meta";

export async function generateMetadata({ params }: PageProps<"/[lang]">) {
  return pageMetadata((await params).lang as Locale, "index");
}

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

  const jsonLd = {
    "@context": "https://schema.org", "@type": "ProfessionalService", name: "Ember Court",
    url: `${SITE}${href(lang, "index")}`, image: `${SITE}/og.png`, logo: `${SITE}/favicon.svg`,
    email: contacts.email, telephone: "+393290890590", description: descriptions[lang].index,
    sameAs: [contacts.telegram], areaServed: "Worldwide", availableLanguage: ["ru", "en", "uk"],
  };
  const faq = [1, 2, 3, 4, 5].map((n) => ({ q: t(`l.q${n}`), a: t(`l.a${n}`) }));
  const faqLd = {
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: faq.map(({ q, a }) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
  };

  return (
    <>
      <Header lang={lang} page="index" labels={{ home: t("nav.home"), services: t("nav.services"), clients: t("nav.clients"), cta: t("nav.cta"), lang: langLabel[lang] }} />
      <main>
        {/* Hero: text only. No fake UI, no glow; the offer has to carry itself. */}
        <section className={`${wide} pb-16 pt-16 sm:pb-24 sm:pt-24`}>
          <h1 className="max-w-[18ch] text-[clamp(2.4rem,5.2vw,4rem)] font-semibold leading-[1.06] tracking-[-0.03em]">
            {t("l.h1a")} {t("l.h1b")}
          </h1>
          <p className="mt-6 max-w-[36rem] text-[18px] leading-[1.6] text-ink-muted">{t("l.sub")}</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a href={auditLink(lang)} className={btnAccent}>{t("l.cta")}</a>
            <a href={contacts.telegram} className={btnGhost}>{t("l.cta2")}</a>
          </div>
          <p className="mt-5 text-[14.5px] text-ink-muted">{t("l.badge")}.</p>
        </section>

        <section className="border-y border-rule">
          <div className={`${wide} grid gap-8 py-12 md:grid-cols-3 md:gap-12`}>
            {[1, 2, 3].map((n) => (
              <div key={n}>
                <h3 className="text-[17px] font-semibold">{t(`l.why${n}.h`)}</h3>
                <p className="mt-1.5 text-[15px] leading-[1.55] text-ink-muted">{t(`l.why${n}.p`)}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Services: one list, not six identical cards. */}
        <section className={`${wide} py-20 sm:py-24`}>
          <h2 className={h2l}>{t("l.svc.h")}</h2>
          <ul className="mt-10 border-b border-rule">
            {SERVICES.map(({ key, anchor, isNew }) => (
              <li key={key} className="border-t border-rule">
                <Link href={href(lang, "services", `#${anchor}`)} className="group grid gap-2 py-6 md:grid-cols-12 md:items-baseline md:gap-8">
                  <span className="text-[20px] font-semibold md:col-span-4">
                    {t(`svc.${key}.title`)}
                    {isNew && <span className="ml-2 text-[13px] font-medium text-ember">{t("svc.new")}</span>}
                  </span>
                  <span className="text-[16px] leading-[1.55] text-ink-muted md:col-span-6">{t(`l.svc.${key}`)}</span>
                  <span className="text-[14.5px] text-ink-muted underline decoration-ink/25 underline-offset-4 group-hover:text-ink group-hover:decoration-ink md:col-span-2 md:text-right">{t("l.svc.more")}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Steps: a real sequence, so numbers are information here. */}
        <section className="border-t border-rule">
          <div className={`${wide} py-20 sm:py-24`}>
            <h2 className={h2l}>{t("l.steps.h")}</h2>
            <ol className="mt-10 grid gap-8 md:grid-cols-4 md:gap-8">
              {[1, 2, 3, 4].map((n) => (
                <li key={n} className="border-t border-rule pt-5">
                  <span className="text-[14px] font-semibold text-ink-muted tabular-nums">0{n}</span>
                  <h3 className="mt-2 text-[18px] font-semibold">{t(`l.s${n}.h`)}</h3>
                  <p className="mt-1.5 text-[15px] leading-[1.55] text-ink-muted">{t(`l.s${n}.p`)}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Case next to the kind of message we actually send. */}
        <section className="border-t border-rule">
          <div className={`${wide} grid gap-12 py-20 sm:py-24 lg:grid-cols-2`}>
            <div>
              <p className="text-[14.5px] text-ink-muted">{t("l.case.label")}</p>
              <h2 className="mt-2 text-[clamp(1.6rem,2.6vw,2.1rem)] font-semibold leading-[1.15] tracking-[-0.02em]">{t("l.case.h")}</h2>
              <p className="mt-4 max-w-[34rem] text-[16px] leading-[1.6] text-ink-muted">{t("l.case.p")}</p>
              <dl className="mt-8">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="grid gap-1 border-t border-rule py-4 sm:grid-cols-[10rem_1fr] sm:gap-6">
                    <dt className="text-[14.5px] text-ink-muted">{t(`l.case.k${n}`)}</dt>
                    <dd className="text-[15.5px]">{t(`l.case.v${n}`)}</dd>
                  </div>
                ))}
              </dl>
              <Link href={href(lang, "clients")} className="mt-4 inline-block text-[15px] underline decoration-ink/30 underline-offset-4 hover:decoration-ink">
                {t("clientsteaser.link")}
              </Link>
            </div>
            <div>
              <p className="mb-4 text-[14.5px] text-ink-muted">{t("l.letter.h")}</p>
              <Letter greeting={t("letter.greeting")} paragraphs={[1, 2, 3, 4].map((n) => t(`letter.p${n}`))}
                notes={[1, 2, 3, 4].map((n) => t(`letter.n${n}`))} caption={t("letter.caption")} signature="Ember Court" />
            </div>
          </div>
        </section>

        {/* Plans */}
        <section className="border-t border-rule">
          <div className={`${wide} py-20 sm:py-24`}>
            <h2 className={h2l}>{t("l.plans.h")}</h2>
            <div className="mt-10 grid gap-px overflow-hidden rounded-[10px] border border-rule bg-rule lg:grid-cols-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="flex flex-col bg-paper p-7 sm:p-8">
                  <h3 className="text-[19px] font-semibold">{t(`l.p${n}.h`)}</h3>
                  <p className="mt-2 text-[26px] font-semibold leading-none tracking-tight">{n === 1 ? t("l.plans.free") : t(`l.p${n}.price`)}</p>
                  {n !== 1 && <p className="mt-1.5 text-[14px] text-ink-muted">{t(`l.p${n}.sub`)}</p>}
                  <ul className="mt-6 grid flex-1 content-start gap-2.5">
                    {t(`l.p${n}.i`).split("|").map((it) => (
                      <li key={it} className="border-t border-rule pt-2.5 text-[15px] text-ink">{it}</li>
                    ))}
                  </ul>
                  <a href={n === 1 ? auditLink(lang) : "#lead"} className={`${n === 1 ? btnAccent : btnGhost} mt-8 w-full`}>{n === 1 ? t("l.cta") : t("l.plans.cta")}</a>
                </div>
              ))}
            </div>
            <p className="mt-5 text-[14px] text-ink-muted">{t("l.plans.note")}</p>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t border-rule">
          <div className={`${wide} grid gap-10 py-20 sm:py-24 lg:grid-cols-[0.8fr_1.2fr]`}>
            <h2 className={h2l}>{t("l.faq.h")}</h2>
            <div className="border-b border-rule">
              {faq.map(({ q, a }) => (
                <details key={q} className="group border-t border-rule">
                  <summary className="flex cursor-pointer items-center justify-between gap-4 py-5 text-[17px] font-medium">
                    {q}<span aria-hidden className="text-[22px] leading-none text-ink-muted transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="pb-5 text-[15.5px] leading-[1.6] text-ink-muted">{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Lead form */}
        <section id="lead" className="scroll-mt-20 border-t border-rule bg-paper-deep">
          <div className={`${wide} grid gap-12 py-20 sm:py-24 lg:grid-cols-2`}>
            <div>
              <h2 className={h2l}>{t("l.form.h")}</h2>
              <p className="mt-5 max-w-[30rem] text-[17px] leading-[1.6] text-ink-muted">{t("l.form.p")}</p>
              <p className="mt-8 text-[15px] leading-[1.8] text-ink-muted">
                {t("l.form.or")}{" "}
                <a className="text-ink underline decoration-ink/30 underline-offset-4" href={`mailto:${contacts.email}`}>{contacts.email}</a>
                <br />WhatsApp <a className="text-ink underline decoration-ink/30 underline-offset-4" href={contacts.whatsapp}>{contacts.whatsappLabel}</a>
              </p>
            </div>
            <LeadForm telegram={contacts.telegram} labels={{
              name: t("l.form.name"), site: t("l.form.site"), need: t("l.form.need"),
              options: t("l.form.opt").split("|"), send: t("l.form.send"), msg: t("l.form.msg"),
            }} />
          </div>
        </section>
      </main>
      <Footer tag={t("footer.tag")} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
    </>
  );
}
