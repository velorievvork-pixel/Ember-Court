import { Check, EnvelopeSimple, Phone, TelegramLogo, X } from "@phosphor-icons/react/dist/ssr";
import Close from "@/components/Close";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Reveal, RevealItem } from "@/components/Reveal";
import ServiceSection from "@/components/ServiceSection";
import { eyebrow, lede, wrap } from "@/components/ui";
import { getT, langLabel, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/meta";

export async function generateMetadata({ params }: PageProps<"/[lang]/services">) {
  return pageMetadata((await params).lang as Locale, "services");
}

const JUMP: [string, string][] = [
  ["outbound", "jump.1"], ["sites", "jump.2"], ["video", "jump.3"], ["smm", "jump.4"], ["audit", "jump.5"], ["automation", "jump.6"],
];

export default async function Services({ params }: PageProps<"/[lang]/services">) {
  const lang = (await params).lang as Locale;
  const t = getT(lang, "services");
  const std3 = ["std.1", "std.2", "std.3"];

  const writing = (
    <div className="grid gap-10 md:grid-cols-12">
      <Reveal className="md:col-span-4">
        <h3 className="font-display text-[28px] font-medium leading-tight">{t("ob.wr.heading")}</h3>
      </Reveal>
      <Reveal stagger className="grid gap-8 sm:grid-cols-2 md:col-span-8">
        {(["avoid", "instead"] as const).map((col) => (
          <RevealItem key={col}>
            <h4 className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-faint">{t(`ob.wr.${col}.h`)}</h4>
            <ul className="mt-4 grid gap-3">
              {[1, 2, 3, 4].map((n) => (
                <li key={n} className="grid grid-cols-[20px_1fr] gap-3 text-[15px] text-ink-soft">
                  {col === "avoid"
                    ? <X size={16} weight="bold" className="mt-[3px] text-ink-faint" />
                    : <Check size={16} weight="bold" className="mt-[3px] text-ember" />}
                  {t(`ob.wr.${col}.${n}`)}
                </li>
              ))}
            </ul>
          </RevealItem>
        ))}
      </Reveal>
    </div>
  );

  const channels = (
    <div className="grid gap-10 md:grid-cols-12">
      <Reveal className="md:col-span-4">
        <h3 className="font-display text-[28px] font-medium leading-tight">{t("ob.ch.heading")}</h3>
      </Reveal>
      <Reveal stagger as="ul" className="md:col-span-8">
        {[
          { icon: EnvelopeSimple, h: "Email", body: t("ob.ch.email") },
          { icon: TelegramLogo, h: "Telegram", body: t("ob.ch.tg") },
          { icon: Phone, h: t("ob.ch.call.h"), body: t("ob.ch.call.body") },
        ].map(({ icon: I, h, body }) => (
          <RevealItem as="li" key={h} className="grid gap-2 border-t border-rule py-6 sm:grid-cols-[180px_1fr] sm:gap-8">
            <h4 className="flex items-center gap-2.5 font-display text-[21px] font-medium"><I size={20} weight="light" className="text-ember" />{h}</h4>
            <p className="text-[15.5px] leading-relaxed text-ink-soft">{body}</p>
          </RevealItem>
        ))}
      </Reveal>
    </div>
  );

  const reel = (
    <Reveal stagger className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {[1, 2, 3, 4].map((n) => (
        <RevealItem key={n}
          className="relative flex aspect-[4/3] items-end rounded-[2px] border border-rule bg-[radial-gradient(ellipse_at_30%_120%,rgba(255,107,53,0.25),transparent_60%)] bg-panel p-4">
          <span className="font-display text-[20px] italic text-ink">{t(`vd.f${n}`)}</span>
        </RevealItem>
      ))}
    </Reveal>
  );

  return (
    <>
      <Header lang={lang} page="services" labels={{ home: t("nav.home"), services: t("nav.services"), clients: t("nav.clients"), cta: t("nav.cta"), lang: langLabel[lang] }} />
      <main>
        <section className={`${wrap} pb-16 pt-20 sm:pt-28`}>
          <Reveal>
            <p className={eyebrow}>{t("ph.eyebrow")}</p>
            <h1 className="mt-5 max-w-[24ch] font-display text-[clamp(2.2rem,5vw,4rem)] font-medium leading-[1.05] tracking-[-0.01em]">{t("ph.heading")}</h1>
            <p className={`${lede} mt-7`}>{t("ph.lede")}</p>
          </Reveal>
        </section>

        <nav className="sticky top-16 z-30 border-y border-rule bg-ground/80 backdrop-blur-md" aria-label={t("ph.eyebrow")}>
          <div className={`${wrap} flex gap-2 overflow-x-auto py-3 [scrollbar-width:none]`} data-lenis-prevent>
            {JUMP.map(([id, key]) => (
              <a key={id} href={`#${id}`} className="shrink-0 rounded-full border border-rule px-4 py-1.5 text-[14px] text-ink-soft transition-colors hover:border-ember/50 hover:text-ink">
                {t(key)}
              </a>
            ))}
          </div>
        </nav>

        <ServiceSection id="outbound" t={t} p="ob" std={["std.excl.1", "std.excl.2", "std.excl.3", "std.excl.4"]} stdIntro fine={[1, 2, 3]}
          after={<>{writing}{channels}</>} />
        <ServiceSection id="sites" t={t} p="ws" inc={["design", "copy", "launch"]} std={std3} />
        <ServiceSection id="video" t={t} p="vd" inc={["edit", "post", "make"]} std={std3} flip before={reel} />
        <ServiceSection id="smm" t={t} p="sm" inc={["plan", "media", "run"]} std={std3} />
        <ServiceSection id="audit" t={t} p="au" inc={["express", "full", "plan"]} std={std3} flip />
        <ServiceSection id="automation" t={t} p="at" inc={["bots", "integr", "data"]} std={std3} />

        <Close heading={t("close.heading")} line={t("close.line")} alt={t("close.alt")} />
      </main>
      <Footer tag={t("footer.tag")} />
    </>
  );
}
