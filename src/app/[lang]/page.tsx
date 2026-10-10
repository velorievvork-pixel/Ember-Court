import Link from "next/link";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import LeadForm from "@/components/LeadForm";
import MobileCta from "@/components/MobileCta";
import TrackedLink from "@/components/TrackedLink";
import type { CSSProperties } from "react";
import { StruckLine } from "@/components/Pen";
import { Reveal } from "@/components/Reveal";
import { btnAccent, h2l, wide } from "@/components/ui";
import { contacts, descriptions, getT, href, langLabel, SITE, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/meta";

export async function generateMetadata({ params }: PageProps<"/[lang]">) {
  return pageMetadata((await params).lang as Locale, "index");
}

// The page gives the result first: a free list of 10 companies for the visitor's site.
// Everything else (prices, the case) sits below as the next step, not as a pitch to read first.
export default async function Home({ params }: PageProps<"/[lang]">) {
  const lang = (await params).lang as Locale;
  const t = getT(lang, "index");
  const ts = getT(lang, "services");
  // The four services next to outbound, each straight to its sample on the examples page.
  const chips: [string, string][] = [[t("chips.ob"), "outbound"], [ts("s2.ws.h"), "sites"], [ts("s2.at.h"), "assistant"], [ts("s2.au.h"), "audit"], [ts("s2.vd.h"), "video"]];
  const te = getT(lang, "examples");
  // Fictional sample rows from the examples page: what one week of the list looks like.
  const rows = ["o.r1", "o.r2", "o.r3"].map((k) => te(k).split("|"));
  const ticker = ["o.tag", "s.tag", "a.tag", "i.tag", "au.tag", "v.tag", "sm.tag"].map((k) => te(k));
  const d = (s: number) => ({ "--d": `${s}s` }) as CSSProperties;
  const four: [string, string, string][] = [["s2.ws.h", "four.ws", "sites"], ["s2.at.h", "four.at", "assistant"], ["s2.au.h", "four.au", "audit"], ["s2.vd.h", "four.vd", "video"]];

  const jsonLd = {
    "@context": "https://schema.org", "@type": "ProfessionalService", name: "Ember Court",
    url: `${SITE}${href(lang, "index")}`, image: `${SITE}/og.png`, logo: `${SITE}/favicon.svg`,
    email: contacts.email, telephone: "+393290890590", description: descriptions[lang].index,
    sameAs: [contacts.telegram], areaServed: "Worldwide", availableLanguage: ["ru", "en", "uk"],
  };
  const clock = { open: t("clock.open"), closed: t("clock.closed"), morning: t("clock.morning"), monday: t("clock.monday") };

  return (
    <>
      <Header lang={lang} page="index" labels={{ home: t("nav.home"), services: t("nav.services"), clients: t("nav.clients"), cta: t("nav.cta"), lang: langLabel[lang] }} />
      <main id="main">
        {/* The offer and the form that gets it, on one screen. */}
        <div className="relative isolate">
        {/* Warm light behind the offer, so the first screen has depth instead of a flat fill. */}
        <div aria-hidden className="hero-glow pointer-events-none absolute inset-x-0 -top-24 -z-10 h-[680px]" />
        <section className={`${wide} grid gap-10 pb-12 pt-12 sm:pt-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16 lg:pb-16`}>
          <div className="min-w-0">
            <p className="fade-up inline-flex items-center gap-2 rounded-full border border-ember/30 bg-ember/10 px-3 py-1 text-[13.5px] font-medium text-ember">
              <span aria-hidden className="ember-pulse h-2 w-2 rounded-full bg-ember" />{te("o.tag")}
            </p>
            <h1 className="hero-rise mt-5 max-w-[18ch] text-balance text-[clamp(2.4rem,5.4vw,4.4rem)] font-semibold leading-[1.02] tracking-[-0.04em]">
              {t("s.h1")}
            </h1>
            <p className="hero-rise mt-6 max-w-[34rem] text-pretty text-[18px] leading-[1.6] text-ink-muted" style={d(0.12)}>{t("s.sub")}</p>
            {/* Services and samples reachable from the first screen, before the form, without opening the menu. */}
            <nav aria-label={t("chips.label")} className="-mx-4 mt-6 overflow-x-auto px-4 sm:mx-0 sm:px-0">
              <ul className="flex w-max gap-2 sm:w-auto sm:flex-wrap">
                <li><Link href={href(lang, "examples")} className="inline-flex min-h-10 items-center whitespace-nowrap rounded-full bg-ember px-4 text-[14.5px] font-semibold text-paper">{t("chips.ex")}</Link></li>
                {chips.map(([label, id]) => (
                  <li key={id}><Link href={`${href(lang, "examples")}#${id}`} className="inline-flex min-h-10 items-center whitespace-nowrap rounded-full border border-ink/20 px-4 text-[14.5px] transition-colors hover:border-ink/40">{label}</Link></li>
                ))}
                <li><Link href={href(lang, "services")} className="inline-flex min-h-10 items-center whitespace-nowrap rounded-full border border-ink/20 px-4 text-[14.5px] transition-colors hover:border-ink/40">{t("chips.svc")}</Link></li>
              </ul>
            </nav>
            {/* A visible next step down the page: the sample list right below. */}
            <a href="#list" className="group mt-8 hidden items-center gap-3 text-[15px] text-ink-muted transition-colors hover:text-ink lg:inline-flex">
              <span aria-hidden className="scroll-cue grid h-9 w-9 place-items-center rounded-full border border-ink/20 transition-colors group-hover:border-ember">
                <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M8 3v10M3.5 8.5 8 13l4.5-4.5" /></svg>
              </span>
              {t("s.scroll")}
            </a>
          </div>
          <div id="lead" className="hero-rise scroll-mt-20 rounded-[16px] border border-rule bg-sheet/90 p-6 shadow-[0_30px_80px_-30px_rgba(5,10,25,0.9)] backdrop-blur sm:p-8" style={d(0.2)}>
            <LeadForm lang={lang} telegram={contacts.telegram} thanks={href(lang, "thanks")} labels={{
              name: "", site: t("s.site"), contact: t("s.contact"), need: "", options: [t("s.send")],
              send: t("s.send"), sending: t("l.form.sending"), msg: t("l.form.msg"), ok: t("s.ok"), more: t("l.form.more"),
              done: t("l.form.done"), again: t("l.form.again"), edit: t("l.form.edit"),
            }} />
            <p className="mt-4 text-[14.5px] text-ink-muted">{t("s.note")}</p>
            <TrackedLink href={`${contacts.whatsapp}?text=${encodeURIComponent(t("s.wa.text"))}`} event="whatsapp"
              className="mt-3 inline-block text-[15px] underline decoration-ink/30 underline-offset-4 transition-colors hover:decoration-ink">
              {t("s.wa")} {contacts.whatsappLabel}
            </TrackedLink>
            {/* A one-person agency: the person who answers is the trust signal. */}
            <p className="mt-6 flex items-center gap-3 border-t border-rule pt-5 text-[14.5px] leading-[1.45] text-ink-muted">
              <span aria-hidden className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ember/15 font-semibold text-ember">{t("s.me").charAt(0)}</span>
              {t("s.me")}
            </p>
          </div>
        </section>
        </div>

        {/* Everything we do, drifting past: a hint that the page goes on. Links to the samples. */}
        <Link href={href(lang, "examples")} aria-label={t("chips.ex")} className="group block overflow-hidden border-y border-rule bg-paper-deep/60 py-4">
          <div className="ticker flex w-max gap-10 pr-10">
            {[0, 1].map((k) => (
              <ul key={k} aria-hidden={k === 1} className="flex shrink-0 gap-10">
                {ticker.map((x) => (
                  <li key={x} className="flex items-center gap-10 whitespace-nowrap text-[clamp(1.1rem,2vw,1.4rem)] font-semibold tracking-[-0.01em] text-ink/80 transition-colors group-hover:text-ink">
                    {x}<span aria-hidden className="h-1.5 w-1.5 rounded-full bg-ember" />
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </Link>

        {/* What the visitor gets: the four lines next to a sample of the list itself. */}
        <section id="list" className="scroll-mt-20">
          <div className={`${wide} grid gap-12 py-16 sm:py-24 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-16`}>
            <div>
              <Reveal><h2 className={h2l}>{t("s.what.h")}</h2></Reveal>
              <ol className="mt-8 grid gap-1">
                {t("s.what").split("|").map((it, i) => (
                  <li key={it} data-inview="" style={d(0.08 * i)} className="reveal flex gap-4 border-t border-rule py-4 text-[17px] leading-[1.5]">
                    <span className="w-6 shrink-0 text-[15px] font-semibold text-ember tabular-nums">0{i + 1}</span>{it}
                  </li>
                ))}
              </ol>
            </div>
            <figure className="min-w-0">
              <div className="relative rounded-[18px] border border-rule bg-sheet/80 p-3 shadow-[0_40px_90px_-40px_rgba(5,10,25,0.95)] sm:p-4">
                <div className="flex items-center justify-between px-2 pb-3 pt-1 text-[13px] text-ink-muted">
                  <span className="flex items-center gap-2"><span aria-hidden className="ember-pulse h-2 w-2 rounded-full bg-ember" />{te("o.tag")}</span>
                  <span className="tabular-nums">3 / 10</span>
                </div>
                <ul className="grid gap-2">
                  {rows.map(([co, why, check, status], i) => {
                    const no = i === rows.length - 1;
                    return (
                      <li key={co} data-inview="" style={d(0.15 + 0.15 * i)}
                        className={`reveal lift grid gap-x-4 gap-y-1 rounded-[12px] border p-4 sm:grid-cols-[1fr_auto] ${no ? "border-rule/60 bg-paper/40" : "border-rule bg-paper-deep"}`}>
                        <span className="text-[16px] font-semibold">{no ? <StruckLine text={co} delay={0.9} /> : co}</span>
                        <span className={`row-start-4 mt-2 inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[12.5px] font-medium sm:row-start-auto sm:mt-0 ${no ? "bg-pen/15 text-pen-ink" : "bg-ember/15 text-ember"}`}>{status}</span>
                        <span className="text-[14.5px] leading-[1.45] text-ink-muted sm:col-span-2">{te("o.c2")}: {why}</span>
                        <span className={`text-[14.5px] leading-[1.45] sm:col-span-2 ${no ? "text-pen-ink" : "text-ink-muted"}`}>{te("o.c3")}: {check}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <figcaption className="mt-3 flex flex-wrap items-center justify-between gap-3 text-[13.5px] text-ink-muted">
                {te("o.note")}
                <Link href={`${href(lang, "examples")}#outbound`} className="font-medium text-ember underline decoration-ember/40 underline-offset-4 hover:decoration-ember">{t("ex.link")}</Link>
              </figcaption>
            </figure>
          </div>
        </section>

        {/* The other four services, each with a small picture of the result. */}
        <section className="border-t border-rule bg-paper-deep/40">
          <div className={`${wide} py-16 sm:py-24`}>
            <Reveal><h2 className={h2l}>{t("four.h")}</h2></Reveal>
            <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {four.map(([title, line, id], i) => (
                <li key={id} data-inview="" style={d(0.08 * i)} className="reveal">
                  <Link href={`${href(lang, "examples")}#${id}`}
                    className="lift group flex h-full flex-col overflow-hidden rounded-[16px] border border-rule bg-sheet/80 hover:border-ember/50">
                    <Preview id={id} />
                    <span className="flex flex-1 flex-col p-5">
                      <span className="text-[17px] font-semibold">{ts(title)}</span>
                      <span className="mt-2 flex-1 text-[15px] leading-[1.5] text-ink-muted">{t(line)}</span>
                      <span className="mt-4 inline-flex items-center gap-1.5 text-[14.5px] font-medium text-ember">
                        {t("four.link")}<span aria-hidden className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* The paid next step, only after the free result. */}
        <section id="pricing" className="scroll-mt-20 border-t border-rule bg-paper-deep/60">
          <div className={`${wide} grid gap-8 py-16 sm:py-20 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16`}>
            <div>
              <h2 className={h2l}>{t("s.next.h")}</h2>
              <p className="mt-4 max-w-[30rem] text-pretty text-[17px] leading-[1.6] text-ink-muted">{t("s.next.p")}</p>
            </div>
            <dl className="border-b border-rule">
              {[
                { h: t("s.hy.h"), price: t("s.hy.price"), p: t("s.hy.p") },
                { h: t("h.pr.pilot.h"), price: t("h.pr.pilot.price"), p: t("h.pr.pilot.local") },
              ].map((r) => (
                <div key={r.h} className="grid grid-cols-[1fr_auto] gap-x-6 gap-y-1 border-t border-rule py-5">
                  <dt className="text-[18px] font-semibold">{r.h}</dt>
                  <dd className="text-right text-[18px] font-semibold tabular-nums">{r.price}</dd>
                  <dd className="col-span-2 text-[15px] leading-[1.5] text-ink-muted">{r.p}</dd>
                </div>
              ))}
              <div className="border-t border-rule py-5">
                <Link href={href(lang, "pilot")} className="text-[15px] underline decoration-ink/30 underline-offset-4 transition-colors hover:decoration-ink">
                  {t("l.svc.more")}
                </Link>
              </div>
            </dl>
          </div>
        </section>

        {/* Case. */}
        <section className="border-t border-rule">
          <div className={`${wide} grid gap-10 py-16 sm:py-20 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16`}>
            <div>
              <p className="text-[14.5px] text-ink-muted">{t("l.case.label")}</p>
              <h2 className="mt-2 text-balance text-[clamp(1.7rem,2.8vw,2.3rem)] font-semibold leading-[1.12] tracking-[-0.025em]">{t("l.case.h")}</h2>
              <p className="mt-4 max-w-[34rem] text-pretty text-[16.5px] leading-[1.6] text-ink-muted">{t("l.case.p")}</p>
              <Link href={href(lang, "clients")} className="mt-6 inline-block text-[15px] underline decoration-ink/30 underline-offset-4 transition-colors hover:decoration-ink">
                {t("clientsteaser.link")}
              </Link>
            </div>
            <dl className="border-b border-rule">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="grid gap-1 border-t border-rule py-5 sm:grid-cols-[11rem_1fr] sm:gap-6">
                  <dt className="text-[14.5px] text-ink-muted">{t(`l.case.k${n}`)}</dt>
                  <dd className="text-[16.5px]">{t(`l.case.v${n}`)}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* The page ends where it started: one action, no hunting for the form. */}
        <section className="relative isolate overflow-hidden border-t border-rule">
          <div aria-hidden className="hero-glow pointer-events-none absolute inset-0 -z-10" />
          <Reveal className={`${wide} flex flex-col items-start gap-6 py-20 sm:items-center sm:py-28 sm:text-center`}>
            <h2 className="max-w-[20ch] text-balance text-[clamp(2rem,4.4vw,3.4rem)] font-semibold leading-[1.05] tracking-[-0.035em]">{t("s.h1")}</h2>
            <a href="#lead" className={btnAccent}>{t("s.send")}</a>
          </Reveal>
        </section>
      </main>
      <MobileCta label={t("s.send")} href="#lead" />
      <Footer tag={t("footer.tag")} clock={clock} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}

/** A small drawn picture of each service's result; decoration only, the card text says what it is. */
function Preview({ id }: { id: string }) {
  const box = "relative h-36 overflow-hidden border-b border-rule bg-paper";
  if (id === "sites")
    return (
      <span aria-hidden className={`${box} block p-4`}>
        <span className="block h-full rounded-[8px] border border-rule bg-sheet transition-transform duration-500 group-hover:-translate-y-1">
          <span className="flex gap-1 border-b border-rule px-2 py-1.5">{[0, 1, 2].map((i) => <span key={i} className="h-1.5 w-1.5 rounded-full bg-ink/25" />)}</span>
          <span className="block px-3 pt-3"><span className="block h-2.5 w-3/4 rounded bg-ink/70" /><span className="mt-2 block h-1.5 w-1/2 rounded bg-ink/25" />
            <span className="mt-3 block h-4 w-16 rounded bg-ember" /></span>
        </span>
      </span>
    );
  if (id === "assistant")
    return (
      <span aria-hidden className={`${box} flex flex-col justify-center gap-2 px-4`}>
        <span className="ml-auto block h-5 w-2/3 rounded-[10px] rounded-br-[3px] bg-ember/80 transition-transform duration-500 group-hover:-translate-x-1" />
        <span className="block h-9 w-4/5 rounded-[10px] rounded-bl-[3px] bg-sheet ring-1 ring-rule transition-transform duration-500 group-hover:translate-x-1" />
        <span className="flex w-14 gap-1 rounded-[10px] bg-sheet px-3 py-2 ring-1 ring-rule">{[0, 1, 2].map((i) => <span key={i} className="typing-dot h-1.5 w-1.5 rounded-full bg-ink/50" style={{ animationDelay: `${i * 0.15}s` }} />)}</span>
      </span>
    );
  if (id === "audit")
    return (
      <span aria-hidden className={`${box} flex flex-col justify-center gap-3 px-5`}>
        {["bg-pen", "bg-ember", "bg-pen"].map((c, i) => (
          <span key={i} className="flex items-center gap-3"><span className={`h-2.5 w-2.5 shrink-0 rounded-full ${c}`} /><span className="block h-2 rounded bg-ink/25" style={{ width: `${70 - i * 15}%` }} /></span>
        ))}
      </span>
    );
  return (
    <span aria-hidden className={`${box} grid place-items-center`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/media/assistant-demo.jpg" alt="" loading="lazy" decoding="async" width={72} height={128}
        className="h-[118px] w-auto rounded-[8px] ring-1 ring-rule transition-transform duration-500 group-hover:scale-105" />
      <span className="absolute grid h-9 w-9 place-items-center rounded-full bg-ember/90 text-paper">
        <svg viewBox="0 0 16 16" className="ml-0.5 h-3.5 w-3.5" fill="currentColor"><path d="M4 2.5v11l9-5.5z" /></svg>
      </span>
    </span>
  );
}
