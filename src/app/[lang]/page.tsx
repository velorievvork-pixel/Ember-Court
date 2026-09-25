import Link from "next/link";
import {
  ArrowRight, ArrowUpRight, Browsers, FilmSlate, MagnifyingGlass, Megaphone, PaperPlaneTilt, Robot, TelegramLogo,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";
import Close from "@/components/Close";
import EmberMark from "@/components/EmberMark";
import Fire from "@/components/Fire";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Magnetic from "@/components/Magnetic";
import Marquee from "@/components/Marquee";
import { Reveal, RevealItem } from "@/components/Reveal";
import { btnGhost, btnPrimary, eyebrow, h2, lede, wrap } from "@/components/ui";
import { auditLink, contacts, descriptions, getT, href, langLabel, SITE, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/meta";

export async function generateMetadata({ params }: PageProps<"/[lang]">) {
  return pageMetadata((await params).lang as Locale, "index");
}

type Svc = { key: string; anchor: string; icon: Icon; className: string; badge?: boolean; tags: string[] };

// Bento: outbound is the core offer and gets the large cell; the two new services carry a badge.
const SERVICES: Svc[] = [
  { key: "outbound", anchor: "outbound", icon: PaperPlaneTilt, className: "md:col-span-2 md:row-span-2", tags: ["t1", "t2", "t3"] },
  { key: "sites", anchor: "sites", icon: Browsers, className: "", tags: ["t1", "t2", "t3"] },
  { key: "video", anchor: "video", icon: FilmSlate, className: "", tags: ["t1", "t2", "t3"] },
  { key: "smm", anchor: "smm", icon: Megaphone, className: "md:col-span-2", tags: ["t1", "t2", "t3"] },
  { key: "audit", anchor: "audit", icon: MagnifyingGlass, className: "", badge: true, tags: ["t1", "t2", "t3"] },
  { key: "auto", anchor: "automation", icon: Robot, className: "md:col-span-3", badge: true, tags: ["t1", "t2", "t3"] },
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

  return (
    <>
      <Header lang={lang} page="index" labels={{ home: t("nav.home"), services: t("nav.services"), clients: t("nav.clients"), cta: t("nav.cta"), lang: langLabel[lang] }} />
      <main>
        {/* Hero: left-aligned message, the coal and its fire on the right. */}
        <section className="relative isolate overflow-hidden">
          <Fire className="-z-10 opacity-90 [mask-image:linear-gradient(to_top,#000_35%,transparent_85%)]" />
          <div className={`${wrap} grid min-h-[calc(100dvh-4rem)] items-center gap-12 py-16 md:grid-cols-12 md:py-20`}>
            <Reveal stagger className="md:col-span-9">
              <RevealItem as="div">
                <h1 className="pb-1 font-display text-[clamp(2.4rem,4.6vw,3.9rem)] font-medium leading-[1.1] tracking-[-0.015em]">
                  {t("hero.h1a")}{" "}
                  <em className="italic text-ember">{t("hero.h1b")}</em>
                </h1>
              </RevealItem>
              <RevealItem as="div">
                <p className="mt-7 max-w-[46ch] text-[18px] leading-relaxed text-ink-soft">{t("hero.sub")}</p>
              </RevealItem>
              <RevealItem as="div">
                <div className="mt-10 flex flex-wrap items-center gap-4">
                  <Magnetic href={contacts.telegram} className={btnPrimary} external>
                    <TelegramLogo size={18} weight="fill" /> {t("hero.cta")}
                  </Magnetic>
                  <a href={auditLink(lang)} className={btnGhost} target="_blank" rel="noopener noreferrer">
                    <MagnifyingGlass size={18} weight="light" /> {t("hero.audit")}
                  </a>
                </div>
              </RevealItem>
            </Reveal>
            <div className="relative hidden justify-center md:col-span-3 md:flex">
              <EmberMark glow className="h-64 w-64 animate-flicker drop-shadow-[0_0_60px_rgba(255,122,51,0.25)]" />
            </div>
          </div>
        </section>

        <Marquee items={Array.from({ length: 10 }, (_, i) => t(`tk.${i + 1}`))} />

        {/* Situation: the problem in the founder's words, then three facts. */}
        <section className={`${wrap} py-28 sm:py-36`}>
          <Reveal>
            <p className={eyebrow}>{t("situation.eyebrow")}</p>
            <h2 className={`${h2} mt-5 max-w-[22ch]`}>{t("situation.heading")}</h2>
          </Reveal>
          <Reveal stagger className="mt-12 grid gap-10 md:grid-cols-2 md:gap-16">
            <RevealItem><p className="text-[17px] leading-relaxed text-ink-soft">{t("situation.body1")}</p></RevealItem>
            <RevealItem><p className="text-[17px] leading-relaxed text-ink">{t("situation.body2")}</p></RevealItem>
          </Reveal>
          <Reveal stagger as="div" className="mt-16 grid grid-cols-1 gap-8 border-t border-rule pt-10 sm:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <RevealItem key={n}>
                <p className="font-display text-[34px] font-medium leading-none text-ember-core">{t(`hero.stat${n}.n`)}</p>
                <p className="mt-2 text-[14px] text-ink-faint">{t(`hero.stat${n}.l`)}</p>
              </RevealItem>
            ))}
          </Reveal>
        </section>

        {/* Services bento. */}
        <section className={`${wrap} pb-28 sm:pb-36`}>
          <Reveal>
            <h2 className={`${h2} max-w-[24ch]`}>{t("svc.heading")}</h2>
          </Reveal>
          <Reveal stagger className="mt-12 grid auto-rows-[minmax(220px,auto)] grid-cols-1 gap-3 md:grid-cols-3">
            {SERVICES.map(({ key, anchor, icon: I, className, badge, tags }) => {
              const big = key === "outbound";
              return (
                <RevealItem key={key} className={className}>
                  <Link
                    href={href(lang, "services", `#${anchor}`)}
                    className={`group relative flex h-full flex-col gap-4 overflow-hidden rounded-[2px] border border-rule p-7 transition-colors hover:border-ember/40 ${
                      big ? "bg-[radial-gradient(ellipse_90%_70%_at_20%_100%,rgba(255,107,53,0.22),transparent_65%)] bg-panel sm:p-10" : "bg-panel/60"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <I size={big ? 40 : 30} weight="light" className="text-ember" />
                      {badge && (
                        <span className="rounded-full bg-ember/15 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ember">
                          {t(`svc.${key}.badge`)}
                        </span>
                      )}
                    </div>
                    <h3 className={`font-display font-medium leading-tight text-ink ${big ? "mt-auto text-[clamp(2rem,3.6vw,2.8rem)]" : "text-[26px]"}`}>
                      {t(`svc.${key}.title`)}
                    </h3>
                    <p className={`leading-relaxed text-ink-soft ${big ? "max-w-[48ch] text-[16px]" : "text-[14.5px]"}`}>{t(`svc.${key}.body`)}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {tags.map((tg) => (
                        <span key={tg} className="rounded-full border border-rule px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-faint">
                          {t(`svc.${key}.${tg}`)}
                        </span>
                      ))}
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-[14px] text-ember transition-transform group-hover:translate-x-1">
                      {t("svc.more").replace(/\s*→$/, "")} <ArrowRight size={14} />
                    </span>
                  </Link>
                </RevealItem>
              );
            })}
          </Reveal>
        </section>

        {/* How we work: a horizontal three-step line, not cards. */}
        <section className="border-y border-rule bg-panel/40">
          <div className={`${wrap} py-24 sm:py-28`}>
            <Reveal>
              <p className={eyebrow}>{t("flow.eyebrow")}</p>
              <h2 className={`${h2} mt-5 max-w-[26ch]`}>{t("flow.heading")}</h2>
            </Reveal>
            <Reveal stagger as="ol" className="mt-14 grid gap-10 md:grid-cols-3 md:gap-0">
              {[1, 2, 3].map((n) => (
                <RevealItem as="li" key={n} className="relative md:pr-10">
                  <div className="mb-6 flex items-center gap-4">
                    <span className="grid h-10 w-10 place-items-center rounded-full border border-ember/50 font-display text-[18px] text-ember">{n}</span>
                    {n < 3 && <span aria-hidden className="hidden h-px flex-1 bg-gradient-to-r from-ember/40 to-rule md:block" />}
                  </div>
                  <h3 className="font-display text-[24px] font-medium text-ink">{t(`flow.${n}.h`)}</h3>
                  <p className="mt-3 max-w-[34ch] text-[15px] leading-relaxed text-ink-soft">{t(`flow.${n}.p`)}</p>
                </RevealItem>
              ))}
            </Reveal>
          </div>
        </section>

        {/* Free audit: its own intent, its own band. */}
        <section className={`${wrap} py-24 sm:py-28`}>
          <Reveal className="relative overflow-hidden rounded-[2px] border border-ember/30 bg-[linear-gradient(120deg,rgba(255,107,53,0.12),rgba(18,16,13,0.6)_55%)] p-8 sm:p-14">
            <div className="grid items-center gap-8 md:grid-cols-[1fr_auto]">
              <div>
                <h2 className="font-display text-[clamp(1.9rem,3.6vw,2.8rem)] font-medium leading-tight">{t("audit.band.h")}</h2>
                <p className={`${lede} mt-4`}>{t("audit.band.p")}</p>
              </div>
              <Magnetic href={auditLink(lang)} className={btnPrimary} external>
                <MagnifyingGlass size={18} weight="bold" /> {t("hero.audit")}
              </Magnetic>
            </div>
          </Reveal>
        </section>

        {/* Clients teaser. */}
        <section className={`${wrap} pb-28 sm:pb-36`}>
          <Reveal className="grid gap-8 border-t border-rule pt-12 md:grid-cols-12">
            <h2 className="font-display text-[clamp(1.8rem,3.2vw,2.5rem)] font-medium leading-tight md:col-span-5">{t("clientsteaser.heading")}</h2>
            <div className="md:col-span-7">
              <p className="text-[17px] leading-relaxed text-ink-soft">{t("clientsteaser.body")}</p>
              <Link href={href(lang, "clients")} className="mt-6 inline-flex items-center gap-1.5 text-[15px] text-ember hover:text-ember-core">
                {t("clientsteaser.link").replace(/\s*→$/, "")} <ArrowUpRight size={16} />
              </Link>
            </div>
          </Reveal>
        </section>

        <Close heading={t("close.heading")} line={t("close.line")} alt={t("close.alt")} />
      </main>
      <Footer tag={t("footer.tag")} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
