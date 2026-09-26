import Link from "next/link";
import { AstanaClock } from "@/components/Desk";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Arrow, PenCheck } from "@/components/Pen";
import { btnGhost, wide } from "@/components/ui";
import { clockText, contacts, getT, href, langLabel, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/meta";

export async function generateMetadata({ params }: PageProps<"/[lang]/thanks">) {
  return pageMetadata((await params).lang as Locale, "thanks");
}

/** Where the lead form lands after a request reached the owner. Its page view is the conversion in analytics. */
export default async function Thanks({ params }: PageProps<"/[lang]/thanks">) {
  const lang = (await params).lang as Locale;
  const t = getT(lang, "thanks");
  const clock = clockText(lang);
  const next = [
    { to: href(lang, "clients"), h: t("ty.case.h"), p: t("ty.case.p") },
    { to: href(lang, "pilot"), h: t("ty.pilot.h"), p: t("ty.pilot.p") },
  ];

  return (
    <>
      <Header lang={lang} page="thanks" labels={{ home: t("nav.home"), services: t("nav.services"), clients: t("nav.clients"), cta: t("nav.cta"), lang: langLabel[lang] }} />
      <main id="main">
        <section className={`${wide} pb-16 pt-16 sm:pb-24 sm:pt-24`}>
          <PenCheck className="h-12 w-12" />
          <h1 className="mt-6 text-balance text-[clamp(2.3rem,4.8vw,3.75rem)] font-semibold leading-[1.05] tracking-[-0.035em]">{t("ty.h1")}</h1>
          <p className="mt-6 max-w-[38rem] text-pretty font-letter text-[19px] leading-[1.65] text-ink">{t("ty.p")}</p>
          <AstanaClock className="mt-5 text-[15px] text-ink-muted" text={clock} />
          <p className="mt-8 text-[15.5px] text-ink-muted">
            {t("ty.urgent")}: <a className="text-ink underline decoration-ink/30 underline-offset-4" href={contacts.telegram}>{contacts.telegramHandle}</a>
          </p>
        </section>

        <section className="border-t border-rule bg-paper-deep/60">
          <div className={`${wide} py-16 sm:py-20`}>
            <h2 className="text-[15px] font-medium text-ink-muted">{t("ty.wait")}</h2>
            <ul className="mt-6 grid gap-4 md:grid-cols-2">
              {next.map((n) => (
                <li key={n.to}>
                  <Link href={n.to} className="group flex h-full items-start justify-between gap-6 rounded-[10px] border border-rule bg-sheet p-6 transition-colors duration-200 hover:border-ink/35">
                    <span>
                      <span className="block text-[19px] font-semibold tracking-[-0.01em]">{n.h}</span>
                      <span className="mt-1.5 block text-[15.5px] leading-[1.55] text-ink-muted">{n.p}</span>
                    </span>
                    <Arrow className="mt-1 shrink-0 text-ink-muted transition-transform duration-200 group-hover:translate-x-1 group-hover:text-ink" />
                  </Link>
                </li>
              ))}
            </ul>
            <Link href={href(lang, "index")} className={`${btnGhost} mt-10`}>{t("ty.back")}</Link>
          </div>
        </section>
      </main>
      <Footer tag={t("footer.tag")} clock={clock} />
    </>
  );
}
