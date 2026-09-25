import Link from "next/link";
import { ArrowRight, Bot, Check, ChevronDown, Clapperboard, Clock, Globe, Languages, Megaphone, SearchCheck, Send, ShieldCheck, Sparkles, Target, Zap } from "lucide-react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import HeroChat from "@/components/HeroChat";
import LeadForm from "@/components/LeadForm";
import Letter from "@/components/Letter";
import { btnAccent, btnGhost, card, h2l, wide } from "@/components/ui";
import { auditLink, contacts, descriptions, getT, href, langLabel, SITE, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/meta";

export async function generateMetadata({ params }: PageProps<"/[lang]">) {
  return pageMetadata((await params).lang as Locale, "index");
}

const SERVICES = [
  { key: "outbound", icon: Send, anchor: "outbound" },
  { key: "sites", icon: Globe, anchor: "sites" },
  { key: "video", icon: Clapperboard, anchor: "video" },
  { key: "smm", icon: Megaphone, anchor: "smm" },
  { key: "audit", icon: SearchCheck, anchor: "audit", isNew: true },
  { key: "auto", icon: Bot, anchor: "automation", isNew: true },
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
  const trust = [[ShieldCheck, "l.trust1"], [Clock, "l.trust2"], [Languages, "l.trust3"]] as const;
  const why = [[Target, 1], [Zap, 2], [Sparkles, 3]] as const;

  return (
    <>
      <Header lang={lang} page="index" labels={{ home: t("nav.home"), services: t("nav.services"), clients: t("nav.clients"), cta: t("nav.cta"), lang: langLabel[lang] }} />
      <main>
        {/* Hero */}
        <section className="hero-glow relative overflow-hidden">
          <div className="grid-lines pointer-events-none absolute inset-0" />
          <div className={`${wide} relative grid items-center gap-14 pb-20 pt-14 sm:pt-20 lg:grid-cols-[1.1fr_0.9fr] lg:pb-28`}>
            <div>
              <a href={auditLink(lang)} className="inline-flex items-center gap-2 rounded-full border border-ember/30 bg-ember/10 px-3.5 py-1.5 text-[13.5px] font-medium text-ember hover:border-ember/60">
                <Sparkles size={15} /> {t("l.badge")}
              </a>
              <h1 className="mt-6 text-[clamp(2.4rem,5.4vw,4.25rem)] font-bold leading-[1.04] tracking-[-0.035em]">
                {t("l.h1a")}{" "}
                <span className="bg-gradient-to-r from-pen to-ember bg-clip-text text-transparent">{t("l.h1b")}</span>
              </h1>
              <p className="mt-6 max-w-[34rem] text-[18px] leading-[1.6] text-ink-muted">{t("l.sub")}</p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <a href={auditLink(lang)} className={btnAccent}>{t("l.cta")} <ArrowRight size={18} /></a>
                <a href={contacts.telegram} className={btnGhost}><Send size={17} /> {t("l.cta2")}</a>
              </div>
              <ul className="mt-9 grid gap-3 text-[14.5px] text-ink-muted sm:grid-cols-3">
                {trust.map(([Icon, k]) => (
                  <li key={k} className="flex items-start gap-2"><Icon size={17} className="mt-0.5 shrink-0 text-ember" />{t(k)}</li>
                ))}
              </ul>
            </div>
            <HeroChat name={t("l.chat.name")} us={t("l.chat.us")} reply={t("l.chat.reply")} meta={t("l.chat.meta")} />
          </div>
        </section>

        {/* Why us */}
        <section className="border-y border-rule bg-paper-deep/60">
          <div className={`${wide} grid gap-8 py-14 md:grid-cols-3`}>
            {why.map(([Icon, n]) => (
              <div key={n} className="flex gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] bg-gradient-to-br from-pen/25 to-ember/10 text-ember"><Icon size={20} /></span>
                <div>
                  <h3 className="text-[17px] font-semibold">{t(`l.why${n}.h`)}</h3>
                  <p className="mt-1 text-[15px] leading-[1.55] text-ink-muted">{t(`l.why${n}.p`)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Services */}
        <section className={`${wide} py-20 sm:py-28`}>
          <h2 className={h2l}>{t("l.svc.h")}</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map(({ key, icon: Icon, anchor, isNew }) => (
              <Link key={key} href={href(lang, "services", `#${anchor}`)}
                className={`${card} group relative flex flex-col p-6 transition-colors hover:border-ember/40 hover:bg-sheet`}>
                <div className="flex items-center justify-between">
                  <span className="grid h-12 w-12 place-items-center rounded-[12px] border border-rule bg-paper text-ember"><Icon size={22} /></span>
                  {isNew && <span className="rounded-full bg-pen/15 px-2.5 py-1 text-[12px] font-semibold text-pen">{t("svc.new")}</span>}
                </div>
                <h3 className="mt-5 text-[19px] font-semibold">{t(`svc.${key}.title`)}</h3>
                <p className="mt-2 text-[15px] leading-[1.55] text-ink-muted">{t(`l.svc.${key}`)}</p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-[14px] font-medium text-ember">
                  {t("l.svc.more")} <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Steps */}
        <section className="border-y border-rule bg-paper-deep/60">
          <div className={`${wide} py-20 sm:py-24`}>
            <h2 className={h2l}>{t("l.steps.h")}</h2>
            <ol className="mt-12 grid gap-8 md:grid-cols-4 md:gap-6">
              {[1, 2, 3, 4].map((n) => (
                <li key={n} className="relative">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-pen to-ember text-[15px] font-bold text-paper">{n}</span>
                    {n < 4 && <span className="hidden h-px flex-1 bg-gradient-to-r from-ember/50 to-rule md:block" />}
                  </div>
                  <h3 className="mt-5 text-[18px] font-semibold">{t(`l.s${n}.h`)}</h3>
                  <p className="mt-1.5 text-[15px] leading-[1.55] text-ink-muted">{t(`l.s${n}.p`)}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Case + letter */}
        <section className={`${wide} grid gap-6 py-20 sm:py-28 lg:grid-cols-2`}>
          <div className={`${card} relative overflow-hidden p-8 sm:p-10`}>
            <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-pen/15 blur-3xl" />
            <span className="relative rounded-full bg-ember/10 px-3 py-1 text-[13px] font-medium text-ember">{t("l.case.label")}</span>
            <h2 className="relative mt-5 text-[clamp(1.6rem,2.6vw,2.1rem)] font-bold leading-[1.15] tracking-[-0.02em]">{t("l.case.h")}</h2>
            <p className="relative mt-4 text-[16px] leading-[1.6] text-ink-muted">{t("l.case.p")}</p>
            <dl className="relative mt-8 grid gap-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="flex items-start gap-3 rounded-[12px] border border-rule bg-paper/60 p-4">
                  <Check size={18} className="mt-0.5 shrink-0 text-ember" />
                  <div><dt className="text-[13px] text-ink-muted">{t(`l.case.k${n}`)}</dt><dd className="mt-0.5 text-[15.5px] font-medium">{t(`l.case.v${n}`)}</dd></div>
                </div>
              ))}
            </dl>
            <Link href={href(lang, "clients")} className="relative mt-7 inline-flex items-center gap-1.5 text-[14.5px] font-medium text-ember">
              {t("clientsteaser.link")} <ArrowRight size={15} />
            </Link>
          </div>
          <div>
            <h2 className="mb-5 text-[20px] font-semibold">{t("l.letter.h")}</h2>
            <Letter greeting={t("letter.greeting")} paragraphs={[1, 2, 3, 4].map((n) => t(`letter.p${n}`))}
              notes={[1, 2, 3, 4].map((n) => t(`letter.n${n}`))} caption={t("letter.caption")} signature="Ember Court" />
          </div>
        </section>

        {/* Plans */}
        <section className="border-y border-rule bg-paper-deep/60">
          <div className={`${wide} py-20 sm:py-28`}>
            <h2 className={h2l}>{t("l.plans.h")}</h2>
            <div className="mt-12 grid gap-5 lg:grid-cols-3">
              {[1, 2, 3].map((n) => {
                const hot = n === 2;
                return (
                  <div key={n} className={`relative flex flex-col rounded-[18px] p-8 ${hot ? "border border-ember/50 bg-sheet shadow-[0_30px_60px_-30px_rgba(240,118,107,0.45)]" : "border border-rule bg-sheet/60"}`}>
                    {hot && <span className="absolute -top-3 left-8 rounded-full bg-gradient-to-r from-pen to-ember px-3 py-1 text-[12px] font-semibold text-paper">{t("l.plans.popular")}</span>}
                    <h3 className="text-[20px] font-semibold">{t(`l.p${n}.h`)}</h3>
                    <p className={`mt-3 text-[24px] font-bold leading-tight tracking-[-0.02em] ${n === 1 ? "text-ember" : ""}`}>{n === 1 ? t("l.plans.free") : t("l.plans.quote")}</p>
                    <ul className="mt-6 grid flex-1 content-start gap-3">
                      {t(`l.p${n}.i`).split("|").map((it) => (
                        <li key={it} className="flex items-start gap-2.5 text-[15px] text-ink-muted"><Check size={17} className="mt-0.5 shrink-0 text-ember" />{it}</li>
                      ))}
                    </ul>
                    <a href={n === 1 ? auditLink(lang) : "#lead"} className={`${hot ? btnAccent : btnGhost} mt-8 w-full`}>{n === 1 ? t("l.cta") : t("l.plans.cta")}</a>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className={`${wide} grid gap-10 py-20 sm:py-28 lg:grid-cols-[0.8fr_1.2fr]`}>
          <h2 className={h2l}>{t("l.faq.h")}</h2>
          <div className="grid gap-3">
            {faq.map(({ q, a }) => (
              <details key={q} className={`${card} group`}>
                <summary className="flex cursor-pointer items-center justify-between gap-4 px-6 py-5 text-[16.5px] font-semibold">
                  {q}<ChevronDown size={20} className="shrink-0 text-ink-muted transition-transform group-open:rotate-180" />
                </summary>
                <p className="px-6 pb-5 text-[15.5px] leading-[1.6] text-ink-muted">{a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Lead form */}
        <section id="lead" className="hero-glow scroll-mt-20 border-t border-rule">
          <div className={`${wide} grid gap-12 py-20 sm:py-28 lg:grid-cols-2`}>
            <div>
              <h2 className={h2l}>{t("l.form.h")}</h2>
              <p className="mt-5 max-w-[30rem] text-[17px] leading-[1.6] text-ink-muted">{t("l.form.p")}</p>
              <div className="mt-8 grid gap-2 text-[15px] text-ink-muted">
                <span>{t("l.form.or")}</span>
                <a className="text-ink hover:text-ember" href={`mailto:${contacts.email}`}>{contacts.email}</a>
                <a className="text-ink hover:text-ember" href={contacts.whatsapp}>WhatsApp {contacts.whatsappLabel}</a>
              </div>
            </div>
            <div className={`${card} bg-sheet p-6 sm:p-8`}>
              <LeadForm telegram={contacts.telegram} labels={{
                name: t("l.form.name"), site: t("l.form.site"), need: t("l.form.need"),
                options: t("l.form.opt").split("|"), send: t("l.form.send"), msg: t("l.form.msg"),
              }} />
            </div>
          </div>
        </section>
      </main>
      <Footer tag={t("footer.tag")} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
    </>
  );
}
