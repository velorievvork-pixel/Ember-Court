import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Arrow, PenCheck } from "@/components/Pen";
import { MethodSteps, Reveal } from "@/components/Reveal";
import { btnAccent, h2l, wide } from "@/components/ui";
import { clockText, getT, href, langLabel, locales, NICHES, nicheHref, SITE, type Locale, type Niche } from "@/lib/i18n";

export const dynamicParams = false;
export function generateStaticParams() {
  return Object.keys(NICHES).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/o/[slug]">): Promise<Metadata> {
  const { lang, slug } = (await params) as { lang: Locale; slug: Niche };
  const t = getT(lang, "niches");
  const title = t(`${slug}.title`);
  const description = t(`${slug}.desc`);
  return {
    title,
    description,
    alternates: {
      canonical: nicheHref(lang, slug),
      languages: { ...Object.fromEntries(locales.map((l) => [l, nicheHref(l, slug)])), "x-default": nicheHref("ru", slug) },
    },
    openGraph: { type: "website", siteName: "Ember Court", title, description, url: SITE + nicheHref(lang, slug), locale: lang },
  };
}

/** One page per niche: the signals we write about there, an example first message, the pilot. */
export default async function NichePage({ params }: PageProps<"/[lang]/o/[slug]">) {
  const { lang, slug } = (await params) as { lang: Locale; slug: Niche };
  const t = getT(lang, "niches");
  const ts = getT(lang, "services");
  const steps = [1, 2, 3, 4].map((n) => ({ h: ts(`s2.ob.s${n}.h`), p: ts(`s2.ob.s${n}.p`) }));
  const others = (Object.keys(NICHES) as Niche[]).filter((n) => n !== slug);

  return (
    <>
      <Header lang={lang} page="services" langHrefs={Object.fromEntries(locales.map((l) => [l, nicheHref(l, slug)])) as Record<Locale, string>}
        labels={{ home: t("nav.home"), services: t("nav.services"), clients: t("nav.clients"), cta: t("nav.cta"), lang: langLabel[lang] }} />
      <main id="main">
        <section className={`${wide} pb-14 pt-14 sm:pb-20 sm:pt-20`}>
          <p className="text-[15px] font-medium text-ember">{t(`${slug}.nav`)}</p>
          <h1 className="mt-3 max-w-[22ch] text-balance text-[clamp(2.2rem,4.6vw,3.6rem)] font-semibold leading-[1.06] tracking-[-0.035em]">{t(`${slug}.h1`)}</h1>
          <p className="mt-6 max-w-[42rem] text-pretty text-[18px] leading-[1.6] text-ink-muted">{t(`${slug}.lede`)}</p>
          <a href={`${href(lang, "index")}#lead`} className={`${btnAccent} mt-8`}>{t("n.cta")}</a>
        </section>

        <section className="border-t border-rule">
          <div className={`${wide} grid gap-10 py-20 sm:py-24 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16`}>
            <h2 className={h2l}>{t("n.sig.h")}</h2>
            <ul className="grid content-start gap-5">
              {[1, 2, 3, 4].map((n, i) => (
                <li key={n} className="flex gap-3 text-[17px] leading-[1.55]"><PenCheck delay={i * 0.12} className="mt-[-1px]" />{t(`${slug}.sig.${n}`)}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="border-t border-rule bg-paper-deep/60">
          <div className={`${wide} grid gap-10 py-20 sm:py-24 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16`}>
            <h2 className={h2l}>{t("n.msg.h")}</h2>
            <Reveal>
              <figure>
                <blockquote className="rounded-[4px] border border-rule bg-sheet px-6 py-7 font-letter text-[18px] leading-[1.7] text-ink sm:px-9">
                  {t(`${slug}.msg`)}
                </blockquote>
                <figcaption className="mt-3 text-[14px] text-ink-muted">{t("n.msg.cap")}</figcaption>
              </figure>
            </Reveal>
          </div>
        </section>

        <section className="border-t border-rule">
          <div className={`${wide} py-20 sm:py-24`}>
            <h2 className={h2l}>{t("n.how.h")}</h2>
            <MethodSteps steps={steps} />
          </div>
        </section>

        <section className="border-t border-rule bg-paper-deep">
          <div className={`${wide} grid gap-10 py-20 sm:py-24 lg:grid-cols-[1fr_auto] lg:items-end`}>
            <div>
              <h2 className={h2l}>{t("n.fit.h")}</h2>
              <p className="mt-4 max-w-[40rem] text-[17px] leading-[1.6] text-ink-muted">{t(`${slug}.fit`)}</p>
              <p className="mt-6 flex max-w-[40rem] gap-3 text-[16px] leading-[1.55] text-ink"><PenCheck className="mt-[-1px] h-5 w-5" />{t("n.price")}</p>
            </div>
            <a href={`${href(lang, "index")}#lead`} className={btnAccent}>{t("n.cta")}</a>
          </div>
          <div className={`${wide} border-t border-rule py-8`}>
            <p className="text-[14.5px] text-ink-muted">{t("n.also")}</p>
            <ul className="mt-3 flex flex-wrap gap-x-8 gap-y-2">
              {others.map((n) => (
                <li key={n}>
                  <Link href={nicheHref(lang, n)} className="group inline-flex items-center gap-2 text-[16px] text-ink">
                    {t(`${n}.nav`)} <Arrow className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
      <Footer tag={t("footer.tag")} clock={clockText(lang)} />
    </>
  );
}
