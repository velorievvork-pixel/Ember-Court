import Link from "next/link";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import LeadForm from "@/components/LeadForm";
import MobileCta from "@/components/MobileCta";
import { h2l, wide } from "@/components/ui";
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
          <div>
            <h1 className="max-w-[18ch] text-balance text-[clamp(2.25rem,5vw,4rem)] font-semibold leading-[1.05] tracking-[-0.035em]">{t("s.h1")}</h1>
            <p className="mt-6 max-w-[34rem] text-pretty text-[18px] leading-[1.6] text-ink-muted">{t("s.sub")}</p>
          </div>
          <div id="lead" className="scroll-mt-20 rounded-[14px] border border-rule bg-sheet p-6 sm:p-8">
            <LeadForm lang={lang} telegram={contacts.telegram} thanks={href(lang, "thanks")} labels={{
              name: "", site: t("s.site"), contact: t("s.contact"), need: "", options: [t("s.send")],
              send: t("s.send"), sending: t("l.form.sending"), msg: t("l.form.msg"), ok: t("s.ok"), more: t("l.form.more"),
              done: t("l.form.done"), again: t("l.form.again"), edit: t("l.form.edit"),
            }} />
            <p className="mt-4 text-[14.5px] text-ink-muted">{t("s.note")}</p>
          </div>
        </section>

        {/* What the visitor gets, line by line. */}
        <section className="border-t border-rule">
          <div className={`${wide} py-16 sm:py-20`}>
            <h2 className={h2l}>{t("s.what.h")}</h2>
            <ol className="mt-8 grid gap-4 sm:grid-cols-2">
              {t("s.what").split("|").map((it, i) => (
                <li key={it} className="flex gap-4 border-t border-rule pt-4 text-[17px] leading-[1.5]">
                  <span className="text-[15px] font-medium text-ink-muted tabular-nums">0{i + 1}</span>{it}
                </li>
              ))}
            </ol>
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
                { h: t("h.pr.pilot.h"), price: t("h.pr.pilot.price"), p: t("h.pr.pilot.local") },
                { h: t("h.pr.r1.h"), price: t("h.pr.r1.price"), p: t("h.pr.r1.p") },
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
              {[1, 2, 3].map((n) => (
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
