import Link from "next/link";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import LeadForm from "@/components/LeadForm";
import { MethodSteps, Reveal } from "@/components/Reveal";
import Letter from "@/components/Letter";
import { btnAccent, btnGhost, h2l, wide } from "@/components/ui";
import { auditLink, contacts, descriptions, getT, href, langLabel, SITE, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/meta";

export async function generateMetadata({ params }: PageProps<"/[lang]">) {
  return pageMetadata((await params).lang as Locale, "index");
}

// The home page sells outbound; these are what follows once a conversation has started.
const SERVICES = [
  { key: "sites", anchor: "sites" },
  { key: "auto", anchor: "automation" },
  { key: "audit", anchor: "audit" },
  { key: "video", anchor: "video" },
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
  const faq = [
    ...[1, 2].map((n) => ({ q: t(`l.q${n}`), a: t(`l.a${n}`) })),
    { q: t("h.q6"), a: t("h.a6") }, { q: t("h.q7"), a: t("h.a7") },
    ...[3, 4].map((n) => ({ q: t(`l.q${n}`), a: t(`l.a${n}`) })),
  ];
  const faqLd = {
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: faq.map(({ q, a }) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
  };

  const steps = [1, 2, 3, 4].map((n) => ({ h: t(`h.m${n}.h`), p: t(`h.m${n}.p`) }));
  const rows = [1, 2, 3, 4].map((n) => ({ h: t(`h.pr.r${n}.h`), price: t(`h.pr.r${n}.price`), p: t(`h.pr.r${n}.p`) }));

  return (
    <>
      <Header lang={lang} page="index" labels={{ home: t("nav.home"), services: t("nav.services"), clients: t("nav.clients"), cta: t("nav.cta"), lang: langLabel[lang] }} />
      <main id="main">
        {/* Hero: the offer on the left, the product itself (an annotated first message) on the right. */}
        <section className={`${wide} grid gap-14 pb-16 pt-14 sm:pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:pb-24`}>
          <div>
            <p className="text-[15px] font-medium text-ember">{t("h.kicker")}</p>
            <h1 className="mt-4 max-w-[16ch] text-balance text-[clamp(2.5rem,5.4vw,4.25rem)] font-semibold leading-[1.02] tracking-[-0.035em]">
              {t("h.h1")}
            </h1>
            <p className="mt-6 max-w-[34rem] text-pretty text-[18px] leading-[1.6] text-ink-muted">{t("h.sub")}</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a href="#lead" className={btnAccent}>{t("h.cta")}</a>
              <a href={auditLink(lang)} className={btnGhost}>{t("h.cta2")}</a>
            </div>
            <p className="mt-5 text-[14.5px] text-ink-muted">{t("h.note")}</p>
          </div>
          <div className="lg:-mr-6">
            <Letter greeting={t("letter.greeting")} paragraphs={[1, 2, 3, 4].map((n) => t(`letter.p${n}`))}
              notes={[1, 2, 3, 4].map((n) => t(`letter.n${n}`))} caption={t("letter.caption")} signature="Ember Court" />
          </div>
        </section>

        {/* Facts we actually enforce, not promises. */}
        <section className="border-y border-rule bg-paper-deep/60">
          <dl className={`${wide} grid grid-cols-2 gap-x-6 gap-y-8 py-10 lg:grid-cols-4`}>
            {[1, 2, 3, 4].map((n, i) => (
              <Reveal key={n} delay={i * 0.06}>
                <dt className="text-[clamp(1.6rem,2.6vw,2.1rem)] font-semibold leading-none tracking-[-0.025em] tabular-nums">{t(`h.f${n}.n`)}</dt>
                <dd className="mt-2 max-w-[16rem] text-[14.5px] leading-[1.45] text-ink-muted">{t(`h.f${n}.l`)}</dd>
              </Reveal>
            ))}
          </dl>
        </section>

        {/* Method: the differentiator, told as a sequence. */}
        <section className={`${wide} py-20 sm:py-28`}>
          <Reveal>
            <h2 className={`${h2l} text-balance`}>{t("h.m.h")}</h2>
            <p className="mt-4 max-w-[38rem] text-pretty text-[18px] leading-[1.6] text-ink-muted">{t("h.m.lead")}</p>
          </Reveal>
          <MethodSteps steps={steps} />
        </section>

        {/* Case. */}
        <section className="border-t border-rule">
          <div className={`${wide} grid gap-10 py-20 sm:py-24 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16`}>
            <Reveal>
              <p className="text-[14.5px] text-ink-muted">{t("l.case.label")}</p>
              <h2 className="mt-2 text-balance text-[clamp(1.7rem,2.8vw,2.3rem)] font-semibold leading-[1.12] tracking-[-0.025em]">{t("l.case.h")}</h2>
              <p className="mt-4 max-w-[34rem] text-pretty text-[16.5px] leading-[1.6] text-ink-muted">{t("l.case.p")}</p>
              <Link href={href(lang, "clients")} className="mt-6 inline-block text-[15px] underline decoration-ink/30 underline-offset-4 transition-colors hover:decoration-ink">
                {t("clientsteaser.link")}
              </Link>
            </Reveal>
            <Reveal delay={0.08}>
              <dl className="border-b border-rule">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="grid gap-1 border-t border-rule py-5 sm:grid-cols-[11rem_1fr] sm:gap-6">
                    <dt className="text-[14.5px] text-ink-muted">{t(`l.case.k${n}`)}</dt>
                    <dd className="text-[16.5px]">{t(`l.case.v${n}`)}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
        </section>

        {/* Pricing: one recommended entry point, the rest as a ruled list. */}
        <section id="pricing" className="scroll-mt-20 border-t border-rule">
          <div className={`${wide} py-20 sm:py-28`}>
            <Reveal>
              <h2 className={`${h2l} text-balance`}>{t("h.pr.h")}</h2>
              <p className="mt-4 max-w-[38rem] text-pretty text-[18px] leading-[1.6] text-ink-muted">{t("h.pr.lead")}</p>
            </Reveal>
            <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-14">
              <Reveal>
                <div className="relative overflow-hidden rounded-[14px] border border-ember/60 bg-sheet p-7 sm:p-9">
                  <p className="text-[14px] font-medium text-ember">{t("h.pr.pilot.tag")}</p>
                  <h3 className="mt-2 text-[22px] font-semibold tracking-[-0.015em]">{t("h.pr.pilot.h")}</h3>
                  <p className="mt-5 flex items-baseline gap-3">
                    <span className="text-[clamp(3rem,6vw,4rem)] font-semibold leading-none tracking-[-0.04em] tabular-nums">{t("h.pr.pilot.price")}</span>
                    <span className="text-[14.5px] text-ink-muted">{t("h.pr.pilot.local")}</span>
                  </p>
                  <ul className="mt-7 grid gap-3">
                    {t("h.pr.pilot.i").split("|").map((it) => (
                      <li key={it} className="flex gap-3 text-[15.5px] leading-[1.5]">
                        <span aria-hidden className="mt-[0.55em] h-[6px] w-[6px] shrink-0 rounded-full bg-ember" />{it}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-7 border-l-2 border-pen pl-4 text-[15px] leading-[1.5] text-ink">{t("h.pr.pilot.g")}</p>
                  <a href="#lead" className={`${btnAccent} mt-8 w-full`}>{t("h.pr.pilot.cta")}</a>
                </div>
              </Reveal>
              <div>
                <ul className="border-b border-rule">
                  {rows.map((r, i) => (
                    <li key={r.h} className="border-t border-rule">
                      <Reveal delay={i * 0.05} className="grid grid-cols-[1fr_auto] gap-x-6 gap-y-1 py-6">
                        <h3 className="text-[18px] font-semibold">{r.h}</h3>
                        <p className="text-right text-[18px] font-semibold tabular-nums">{r.price}</p>
                        <p className="col-span-2 text-[15px] leading-[1.5] text-ink-muted">{r.p}</p>
                      </Reveal>
                    </li>
                  ))}
                </ul>
                <p className="mt-6 text-[14px] leading-[1.55] text-ink-muted">{t("l.plans.note")}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Secondary services. */}
        <section className="border-t border-rule">
          <div className={`${wide} grid gap-10 py-20 sm:py-24 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16`}>
            <Reveal>
              <h2 className={`${h2l} text-balance`}>{t("h.more.h")}</h2>
              <p className="mt-4 max-w-[26rem] text-pretty text-[17px] leading-[1.6] text-ink-muted">{t("h.more.lead")}</p>
            </Reveal>
            <ul className="border-b border-rule">
              {SERVICES.map(({ key, anchor }, i) => (
                <li key={key} className="border-t border-rule">
                  <Reveal delay={i * 0.04}>
                    <Link href={href(lang, "services", `#${anchor}`)} className="group grid gap-1 py-5 sm:grid-cols-[12rem_1fr_auto] sm:items-baseline sm:gap-6">
                      <span className="text-[18px] font-semibold">{t(`svc.${key}.title`)}</span>
                      <span className="text-[15.5px] leading-[1.5] text-ink-muted">{t(`l.svc.${key}`)}</span>
                      <span aria-hidden className="hidden text-ink-muted transition-transform duration-200 group-hover:translate-x-1 group-hover:text-ink sm:block">→</span>
                    </Link>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* FAQ: questions and answers side by side, nothing hidden behind a click. */}
        <section className="border-t border-rule">
          <div className={`${wide} py-20 sm:py-24`}>
            <Reveal><h2 className={h2l}>{t("l.faq.h")}</h2></Reveal>
            <dl className="mt-10 border-b border-rule">
              {faq.map(({ q, a }, i) => (
                <Reveal key={q} delay={i * 0.03}>
                  <div className="grid gap-2 border-t border-rule py-6 md:grid-cols-[0.8fr_1.2fr] md:gap-16">
                    <dt className="text-[17.5px] font-semibold leading-[1.4]">{q}</dt>
                    <dd className="max-w-[40rem] text-[16px] leading-[1.6] text-ink-muted">{a}</dd>
                  </div>
                </Reveal>
              ))}
            </dl>
          </div>
        </section>

        {/* Lead form */}
        <section id="lead" className="scroll-mt-20 border-t border-rule bg-paper-deep">
          <div className={`${wide} grid gap-12 py-20 sm:py-24 lg:grid-cols-2`}>
            <Reveal>
              <h2 className={h2l}>{t("l.form.h")}</h2>
              <p className="mt-5 max-w-[30rem] text-[17px] leading-[1.6] text-ink-muted">{t("l.form.p")}</p>
              <p className="mt-8 text-[15px] leading-[1.8] text-ink-muted">
                {t("l.form.or")}{" "}
                <a className="text-ink underline decoration-ink/30 underline-offset-4" href={`mailto:${contacts.email}`}>{contacts.email}</a>
                <br />WhatsApp <a className="text-ink underline decoration-ink/30 underline-offset-4" href={contacts.whatsapp}>{contacts.whatsappLabel}</a>
              </p>
            </Reveal>
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
