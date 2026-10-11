import Link from "next/link";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import LeadForm from "@/components/LeadForm";
import MobileCta from "@/components/MobileCta";
import { PenCheck, StruckLine } from "@/components/Pen";
import PayButton from "@/components/PayButton";
import TrackedLink from "@/components/TrackedLink";
import { h2l, wide } from "@/components/ui";
import { contacts, descriptions, getT, href, langLabel, SITE, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/meta";
import { stripeReady } from "@/lib/stripe";

export async function generateMetadata({ params }: PageProps<"/[lang]">) {
  return pageMetadata((await params).lang as Locale, "index");
}

// The page gives the result first: a free list of 10 companies for the visitor's site.
// Plain on purpose: the offer and the form, then a real sample of the list, then the other services, prices
// and the one client. No decorative motion or drawn "screenshots"; the sample table is the product itself.
export default async function Home({ params }: PageProps<"/[lang]">) {
  const lang = (await params).lang as Locale;
  const t = getT(lang, "index");
  const ts = getT(lang, "services");
  const te = getT(lang, "examples");
  // Fictional sample rows from the examples page, marked as such under the table.
  const rows = ["o.r1", "o.r2", "o.r3"].map((k) => te(k).split("|"));
  // The other services with the prices already published on the services page.
  const services: [string, string, string, string][] = [
    ["s2.ws.h", "four.ws", "s2.ws.price", "sites"],
    ["s2.at.h", "four.at", "s2.at.price", "assistant"],
    ["s2.au.h", "four.au", "s2.au.price", "audit"],
    ["s2.vd.h", "four.vd", "s2.vd.price", "video"],
  ];

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
        <section className={`${wide} grid gap-10 pb-16 pt-12 sm:pt-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16 lg:pb-24`}>
          <div className="min-w-0">
            <h1 className="max-w-[16ch] text-balance text-[clamp(2.4rem,5vw,4rem)] font-semibold leading-[1.04] tracking-[-0.035em]">{t("s.h1")}</h1>
            <p className="mt-6 max-w-[34rem] text-pretty text-[18px] leading-[1.6] text-ink-muted">{t("s.sub")}</p>
            <Link href={href(lang, "examples")} className="mt-8 inline-flex items-center gap-2 text-[16px] font-medium text-ink underline decoration-ember/60 underline-offset-[6px] transition-colors hover:decoration-ember">
              {t("chips.ex")} <span aria-hidden>→</span>
            </Link>
          </div>
          <div id="lead" className="scroll-mt-20 rounded-[14px] border border-rule bg-sheet p-6 sm:p-8">
            <LeadForm lang={lang} telegram={contacts.telegram} thanks={href(lang, "thanks")} labels={{
              name: "", site: t("s.site"), contact: t("s.contact"), need: "", options: [t("s.send")],
              send: t("s.send"), sending: t("l.form.sending"), msg: t("l.form.msg"), ok: t("s.ok"), more: t("l.form.more"),
              done: t("l.form.done"), again: t("l.form.again"), edit: t("l.form.edit"),
            }} />
            <p className="mt-4 text-[14.5px] text-ink-muted">{t("s.note")}</p>
            {/* Two direct channels next to the form: WhatsApp and Telegram, each opens with a prefilled message. */}
            <div className="mt-3 flex flex-col gap-2 text-[15px]">
              <TrackedLink href={`${contacts.whatsapp}?text=${encodeURIComponent(t("s.wa.text"))}`} event="whatsapp"
                className="w-fit underline decoration-ink/30 underline-offset-4 transition-colors hover:decoration-ink">
                {t("s.wa")} {contacts.whatsappLabel}
              </TrackedLink>
              <TrackedLink href={`${contacts.telegram}?text=${encodeURIComponent(t("s.wa.text"))}`} event="telegram"
                className="w-fit underline decoration-ink/30 underline-offset-4 transition-colors hover:decoration-ink">
                {t("s.tg")} {contacts.telegramHandle}
              </TrackedLink>
            </div>
            {/* A one-person agency: the person who answers is the trust signal. */}
            <p className="mt-6 border-t border-rule pt-5 text-[14.5px] leading-[1.45] text-ink-muted">{t("s.me")}</p>
          </div>
        </section>

        {/* What the list is, shown as the list itself: the columns are what we check, the struck row is a refusal. */}
        <section id="list" className="scroll-mt-20 border-t border-rule">
          <div className={`${wide} py-16 sm:py-24`}>
            <h2 className={h2l}>{t("s.what.h")}</h2>
            <ul className="mt-6 grid max-w-[52rem] gap-x-10 gap-y-3 sm:grid-cols-2">
              {t("s.what").split("|").map((it, i) => (
                <li key={it} className="flex gap-3 text-[16.5px] leading-[1.5]"><PenCheck delay={i * 0.1} className="mt-[-1px]" />{it}</li>
              ))}
            </ul>
            <div className="mt-10 overflow-hidden rounded-[14px] border border-rule">
              <div className="hidden grid-cols-[1.2fr_1.4fr_1fr_0.9fr] gap-6 border-b border-rule bg-sheet px-5 py-3 text-[13.5px] text-ink-muted md:grid">
                {["o.c1", "o.c2", "o.c3", "o.c4"].map((k) => <span key={k}>{te(k)}</span>)}
              </div>
              <dl className="divide-y divide-rule">
                {rows.map(([co, why, check, status], i) => {
                  const no = i === rows.length - 1;
                  return (
                    <div key={co} className="grid gap-1 px-5 py-4 md:grid-cols-[1.2fr_1.4fr_1fr_0.9fr] md:gap-6">
                      <dt className="text-[16px] font-semibold">{no ? <StruckLine text={co} delay={0.4} /> : co}</dt>
                      <dd className="text-[15px] leading-[1.5] text-ink-muted">{why}</dd>
                      <dd className={`text-[15px] leading-[1.5] ${no ? "text-pen-ink" : "text-ink-muted"}`}>{check}</dd>
                      <dd className={`text-[15px] leading-[1.5] ${no ? "text-pen-ink" : "text-ink"}`}>{status}</dd>
                    </div>
                  );
                })}
              </dl>
            </div>
            <p className="mt-3 text-[14px] text-ink-muted">{te("o.note")}</p>
          </div>
        </section>

        {/* The other services as one plain price list, each line to its sample. */}
        <section className="border-t border-rule bg-paper-deep/60">
          <div className={`${wide} py-16 sm:py-24`}>
            <h2 className={h2l}>{t("four.h")}</h2>
            <ul className="mt-8 divide-y divide-rule border-y border-rule">
              {services.map(([title, line, price, id]) => (
                <li key={id}>
                  <Link href={`${href(lang, "examples")}#${id}`}
                    className="group grid gap-1 py-5 transition-colors sm:grid-cols-[14rem_1fr_auto] sm:items-baseline sm:gap-8">
                    <span className="text-[18px] font-semibold group-hover:text-ember">{ts(title)}</span>
                    <span className="text-[15.5px] leading-[1.5] text-ink-muted">{t(line)}</span>
                    <span className="text-[15px] tabular-nums text-ink sm:text-right">{ts(price)}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <Link href={href(lang, "services")} className="mt-6 inline-block text-[15px] underline decoration-ink/30 underline-offset-4 transition-colors hover:decoration-ink">
              {t("chips.svc")}
            </Link>
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
              {stripeReady() && (
                <div className="border-t border-rule py-5">
                  <PayButton lang={lang} offer="pilot" label={`${t("pay.pilot")}: $250`} />
                  <p className="mt-3 text-[14px] leading-[1.5] text-ink-muted">{t("pay.note")}</p>
                </div>
              )}
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

      </main>
      <MobileCta label={t("s.send")} href="#lead" />
      <Footer tag={t("footer.tag")} clock={clock} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
