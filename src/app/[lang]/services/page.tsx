import Contacts from "@/components/Contacts";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ServiceSection, { h3, Rows, Struck } from "@/components/ServiceSection";
import { body, h1, link, muted, wrap } from "@/components/ui";
import { getT, langLabel, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/meta";

export async function generateMetadata({ params }: PageProps<"/[lang]/services">) {
  return pageMetadata((await params).lang as Locale, "services");
}

const INDEX: [string, string][] = [
  ["outbound", "jump.1"], ["sites", "jump.2"], ["video", "jump.3"], ["smm", "jump.4"], ["audit", "jump.5"], ["automation", "jump.6"],
];

export default async function Services({ params }: PageProps<"/[lang]/services">) {
  const lang = (await params).lang as Locale;
  const t = getT(lang, "services");
  const ti = getT(lang, "index");
  const std3 = ["std.1", "std.2", "std.3"];

  const outboundExtra = (
    <>
      <div className="grid gap-8 md:grid-cols-12">
        <h3 className={`${h3} md:col-span-5`}>{t("ob.wr.heading")}</h3>
        <div className="grid gap-8 sm:grid-cols-2 md:col-span-7">
          <div>
            <p className="mb-3 text-[15px] font-semibold text-ink-muted">{t("ob.wr.avoid.h")}</p>
            <Struck items={[1, 2, 3, 4].map((n) => t(`ob.wr.avoid.${n}`))} />
          </div>
          <div>
            <p className="mb-3 text-[15px] font-semibold text-ink-muted">{t("ob.wr.instead.h")}</p>
            <ul className="grid gap-2.5">
              {[1, 2, 3, 4].map((n) => <li key={n} className={`${body} text-[16px]`}>{t(`ob.wr.instead.${n}`)}</li>)}
            </ul>
          </div>
        </div>
      </div>
      <div>
        <h3 className={`${h3} mb-4`}>{t("ob.ch.heading")}</h3>
        <Rows items={[
          { h: "Email", body: t("ob.ch.email") },
          { h: "Telegram", body: t("ob.ch.tg") },
          { h: t("ob.ch.call.h"), body: t("ob.ch.call.body") },
        ]} />
      </div>
    </>
  );

  return (
    <>
      <Header lang={lang} page="services" labels={{ home: t("nav.home"), services: t("nav.services"), clients: t("nav.clients"), cta: t("nav.cta"), lang: langLabel[lang] }} />
      <main>
        <section className={`${wrap} pb-12 pt-12 sm:pb-16 sm:pt-20`}>
          <h1 className={`${h1} max-w-[26ch]`}>{t("ph.heading")}</h1>
          <p className={`${muted} mt-6 max-w-[64ch]`}>{t("ph.lede")}</p>
          <nav aria-label={t("nav.services")} className="mt-10">
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {INDEX.map(([id, key]) => (
                <li key={id}><a href={`#${id}`} className={`${link} text-[15px] font-medium`}>{t(key)}</a></li>
              ))}
            </ul>
          </nav>
        </section>

        <ServiceSection id="outbound" t={t} p="ob" std={["std.excl.1", "std.excl.2", "std.excl.3", "std.excl.4"]} stdIntro fine={[1, 2, 3]} after={outboundExtra} />
        <ServiceSection id="sites" t={t} p="ws" inc={["design", "copy", "launch"]} std={std3} />
        <ServiceSection id="video" t={t} p="vd" inc={["edit", "post", "make"]} std={std3} />
        <ServiceSection id="smm" t={t} p="sm" inc={["plan", "media", "run"]} std={std3} />
        <ServiceSection id="audit" t={t} p="au" inc={["express", "full", "plan"]} std={std3} />
        <ServiceSection id="automation" t={t} p="at" inc={["bots", "integr", "data"]} std={std3} />

        <Contacts heading={t("close.heading")} line={t("close.line")} alt={t("close.alt")} cta={ti("hero.cta")} or={ti("contacts.or")} />
      </main>
      <Footer tag={t("footer.tag")} />
    </>
  );
}
