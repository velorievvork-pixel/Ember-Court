import { existsSync } from "node:fs";
import { join } from "node:path";
import type { CSSProperties } from "react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { PenCheck } from "@/components/Pen";
import { btnAccent, btnGhost, h2l, wide } from "@/components/ui";
import { clockText, contacts, getT, langLabel, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/meta";
import ChatPlayer, { type Msg, type Scenario } from "@/components/examples/ChatPlayer";
import ConceptGallery, { type Concept } from "@/components/examples/ConceptGallery";
import LeadFlow from "@/components/examples/LeadFlow";
import { StruckLine } from "@/components/Pen";

export async function generateMetadata({ params }: PageProps<"/[lang]/examples">) {
  return pageMetadata((await params).lang as Locale, "examples");
}

// For people who arrive from our first email: why they got it, and what each service looks like.
// Every example is marked as a sample; no real client names or numbers beyond the site's own.
export default async function Examples({ params }: PageProps<"/[lang]/examples">) {
  const lang = (await params).lang as Locale;
  const t = getT(lang, "examples");

  // Five sample conversations; each line is "c:" customer, "b:" bot or "d:" a day divider. Times tick from the start.
  const scenarios: Scenario[] = [1, 2, 3, 4, 5].map((n) => {
    const [hh, mm] = t(`ch${n}.start`).split(":").map(Number);
    let min = hh * 60 + mm;
    const msgs: Msg[] = t(`ch${n}.msgs`).split("\n").map((line) => {
      const who = line.slice(0, 1) as Msg["who"];
      if (who === "d") { min = 9 * 60; return { who, text: line.slice(2), time: "" }; }
      const time = `${String(Math.floor(min / 60) % 24).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
      if (who === "c") min += 1;
      return { who, text: line.slice(2), time };
    });
    return { tab: t(`ch${n}.tab`), name: t(`ch${n}.name`), status: t(`ch${n}.status`), kind: t(`ch${n}.kind`) as Scenario["kind"], msgs };
  });
  const concepts: Concept[] = [1, 2, 3, 4, 5, 6].map((n) => ({
    tab: t(`c${n}.tab`), name: t(`c${n}.name`), tag: t(`c${n}.tag`), h: t(`c${n}.h`), p: t(`c${n}.p`), cta: t(`c${n}.cta`),
    f: t(`c${n}.f`).split("|"), svc: t(`c${n}.svc`).split("|").map((x) => x.split(";") as [string, string]), how: t(`c${n}.how`).split("|"),
  }));
  const gl = { desk: t("gal.desk"), phone: t("gal.phone"), svc: t("gal.svc"), how: t("gal.how"), form: t("gal.form"), fname: t("gal.fname"), fphone: t("gal.fphone"), send: t("gal.send"), reply: t("gal.reply") };
  // Players show only for clips whose file and poster are committed to public/media.
  const videos = ["assistant-demo", "logistics-demo", "steel-demo"]
    .filter((n) => existsSync(join(process.cwd(), `public/media/${n}.mp4`)) && existsSync(join(process.cwd(), `public/media/${n}.jpg`)))
    .map((n) => ({ src: `/media/${n}.mp4`, poster: `/media/${n}.jpg` }));
  const jump: [string, string][] = [["assistant", "jump.a"], ["integrations", "jump.i"], ["outbound", "jump.o"], ["audit", "jump.au"], ["sites", "jump.s"], ["video", "jump.v"], ["social", "jump.sm"]];
  const note = "mt-4 text-[14px] text-ink-muted";

  return (
    <>
      <Header lang={lang} page="examples" labels={{ home: t("nav.home"), services: t("nav.services"), clients: t("nav.clients"), cta: t("nav.cta"), lang: langLabel[lang] }} />
      <main id="main">
        <section className={`${wide} pb-12 pt-14 sm:pb-16 sm:pt-20`}>
          <h1 className="max-w-[18ch] text-balance text-[clamp(2.3rem,4.8vw,3.75rem)] font-semibold leading-[1.05] tracking-[-0.035em]">{t("ex.h1")}</h1>
          <p className="mt-6 max-w-[38rem] text-pretty text-[18px] leading-[1.6] text-ink-muted">{t("ex.lede")}</p>
          <nav aria-label={t("jump.h")} className="mt-8">
            <p className="text-[14.5px] text-ink-muted">{t("jump.h")}</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {jump.map(([id, key]) => (
                <li key={id}><a href={`#${id}`} className="inline-flex min-h-10 items-center rounded-full border border-ink/20 px-4 text-[14.5px] transition-colors hover:border-ink/40">{t(key)}</a></li>
              ))}
            </ul>
          </nav>
        </section>

        {/* Why this company got our message: the four facts that make a cold email less alarming. */}
        <section className="border-t border-rule bg-paper-deep/60">
          <div className={`${wide} py-16 sm:py-20`}>
            <h2 className={h2l}>{t("why.h")}</h2>
            <ul className="mt-8 grid gap-5 sm:grid-cols-2">
              {[1, 2, 3, 4].map((n, i) => (
                <li key={n} className="flex gap-3 text-[16.5px] leading-[1.5]"><PenCheck delay={i * 0.12} className="mt-[-1px]" />{t(`why.${n}`)}</li>
              ))}
            </ul>
          </div>
        </section>

        {/* Assistant: five conversations that play themselves, one per trade. */}
        <section id="assistant" className="scroll-mt-20 border-t border-rule">
          <div className={`${wide} grid gap-10 py-16 sm:py-20 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16`}>
            <div className="lg:pt-14">
              <h2 className={h2l}>{t("a.h")}</h2>
              <p className="mt-4 max-w-[30rem] text-pretty text-[17px] leading-[1.6] text-ink-muted">{t("a.p")}</p>
              <p className="mt-4 max-w-[30rem] text-[16px] leading-[1.55] text-ink">{t("cp.h")}. {t("cp.p")}</p>
              <p className={note}>{t("cp.note")}</p>
            </div>
            <div className="min-w-0">
              <ChatPlayer scenarios={scenarios} typing={t("cp.typing")} replay={t("cp.replay")} />
            </div>
          </div>
        </section>

        {/* Automation: one request travels from the site form to Telegram and into the sheet, on a loop. */}
        <section id="integrations" className="scroll-mt-20 border-t border-rule">
          <div className={`${wide} py-16 sm:py-20`}>
            <h2 className={h2l}>{t("i.h")}</h2>
            <p className="mt-4 max-w-[40rem] text-pretty text-[17px] leading-[1.6] text-ink-muted">{t("i.p")}</p>
            <div className="mt-8">
              <LeadFlow values={t("i.fv").split("|")} today={t("i.r1").split("|")[0]} rows={[t("i.r2").split("|"), t("i.r3").split("|")]}
                l={{ site: t("i.site"), name: t("i.f.name"), phone: t("i.f.phone"), need: t("i.f.need"), send: t("i.f.send"), bot: t("i.bot"),
                  n1: t("i.n1"), n5: t("i.n5"), n6: t("i.n6"), sheet: t("i.sheet"), cols: [1, 2, 3, 4].map((n) => t(`i.c${n}`)), isNew: t("i.new") }} />
            </div>
            <p className={note}>{t("i.note")}</p>
          </div>
        </section>

        {/* Outbound: what the weekly list looks like, including a company we chose not to write to. */}
        <section id="outbound" className="scroll-mt-20 border-t border-rule bg-paper-deep/60">
          <div className={`${wide} py-16 sm:py-20`}>
            <h2 className={h2l}>{t("o.h")}</h2>
            <p className="mt-4 max-w-[36rem] text-pretty text-[17px] leading-[1.6] text-ink-muted">{t("o.p")}</p>
            {/* Rows as cards on a phone, a four-column table from sm up; the last row is a company we chose not to write to. */}
            <div className="mt-8 border-b border-rule">
              <div aria-hidden className="hidden gap-4 pb-3 text-[13.5px] font-medium text-ink-muted sm:grid sm:grid-cols-4">
                {[1, 2, 3, 4].map((n) => <span key={n}>{t(`o.c${n}`)}</span>)}
              </div>
              {[1, 2, 3].map((r) => {
                const cells = t(`o.r${r}`).split("|");
                return (
                  <dl key={r} data-inview="" style={{ "--d": `${r * 0.15}s` } as CSSProperties} className={`reveal grid gap-x-4 gap-y-2 border-t border-rule py-4 text-[15px] leading-[1.45] sm:grid-cols-4 ${r === 3 ? "text-ink-muted" : ""}`}>
                    {cells.map((c, i) => (
                      <div key={i} className="grid grid-cols-[6.5rem_1fr] gap-3 sm:block">
                        <dt className="text-[13.5px] text-ink-muted sm:sr-only">{t(`o.c${i + 1}`)}</dt>
                        <dd className={`${i === 0 ? "font-medium" : ""} ${r === 3 && i >= 2 ? "text-pen-ink" : ""}`}>{r === 3 && i === 0 ? <StruckLine text={c} delay={0.8} /> : c}</dd>
                      </div>
                    ))}
                  </dl>
                );
              })}
            </div>
            <p className={note}>{t("o.note")}</p>
          </div>
        </section>

        {/* Audit: four sample findings in the report's own red/amber format. */}
        <section id="audit" className="scroll-mt-20 border-t border-rule">
          <div className={`${wide} grid gap-10 py-16 sm:py-20 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16`}>
            <div>
              <h2 className={h2l}>{t("au.h")}</h2>
              <p className="mt-4 max-w-[30rem] text-pretty text-[17px] leading-[1.6] text-ink-muted">{t("au.p")}</p>
              <p className={note}>{t("au.note")}</p>
            </div>
            <ol className="border-b border-rule">
              {[1, 2, 3, 4].map((n, i) => (
                <li key={n} data-inview="" style={{ "--d": `${i * 0.06}s` } as CSSProperties} className="reveal flex gap-4 border-t border-rule py-5 text-[16.5px] leading-[1.5]">
                  <span aria-hidden className={`mt-[7px] h-2.5 w-2.5 shrink-0 rounded-full ${n <= 2 ? "bg-[#d64545]" : "bg-[#e0a43a]"}`} />
                  {t(`au.${n}`)}
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Sites: the honest example is this site itself. */}
        <section id="sites" className="scroll-mt-20 border-t border-rule bg-paper-deep/60">
          <div className={`${wide} grid gap-10 py-16 sm:py-20 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16`}>
            <div>
              <h2 className={h2l}>{t("s.h")}</h2>
              <p className="mt-4 max-w-[30rem] text-pretty text-[17px] leading-[1.6] text-ink-muted">{t("s.p")}</p>
              <p className={note}>{t("s.note")}</p>
            </div>
            <ul className="grid gap-4 self-center">
              {t("s.list").split("|").map((it, i) => (
                <li key={it} className="flex gap-3 text-[16.5px] leading-[1.5]"><PenCheck delay={i * 0.12} className="mt-[-1px]" />{it}</li>
              ))}
            </ul>
          </div>
          {/* Six concept sites in one window: pick the trade, switch to phone, scroll the page. */}
          <div className={`${wide} pb-16 sm:pb-20`}>
            <h3 className="text-[clamp(1.5rem,2.6vw,2rem)] font-semibold tracking-[-0.02em]">{t("gal.h")}</h3>
            <p className="mt-3 max-w-[40rem] text-pretty text-[16.5px] leading-[1.6] text-ink-muted">{t("gal.p")}</p>
            <div className="mt-8"><ConceptGallery concepts={concepts} l={gl} /></div>
            <p className={note}>{t("gal.note")}</p>
          </div>
        </section>

        {/* Video: three vertical pieces we made. Each loads only when played (preload="none"). */}
        <section id="video" className="scroll-mt-20 border-t border-rule">
          <div className={`${wide} py-16 sm:py-20`}>
            <h2 className={h2l}>{t("v.h")}</h2>
            <p className="mt-4 max-w-[40rem] text-pretty text-[17px] leading-[1.6] text-ink-muted">{t("v.p")}</p>
            <ul className="-mx-4 mt-8 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0">
              {videos.map((v, i) => (
                <li key={v.src} data-inview="" style={{ "--d": `${i * 0.1}s` } as CSSProperties} className="reveal w-[72%] shrink-0 snap-start sm:w-auto">
                  <video controls playsInline preload="none" poster={v.poster} aria-label={t(`v${i + 1}.t`)}
                    className="aspect-[9/16] w-full rounded-[18px] border border-rule bg-black object-cover">
                    <source src={v.src} type="video/mp4" />
                  </video>
                  <p className="mt-3 text-[16px] font-semibold leading-[1.35]">{t(`v${i + 1}.t`)}</p>
                  <p className="mt-1 text-[14px] text-ink-muted">{t(`v${i + 1}.d`)}</p>
                </li>
              ))}
            </ul>
            <p className={note}>{t("v.note")}</p>
          </div>
        </section>

        {/* Social: a sample week from a monthly plan. */}
        <section id="social" className="scroll-mt-20 border-t border-rule bg-paper-deep/60">
          <div className={`${wide} py-16 sm:py-20`}>
            <h2 className={h2l}>{t("sm.h")}</h2>
            <p className="mt-4 max-w-[36rem] text-pretty text-[17px] leading-[1.6] text-ink-muted">{t("sm.p")}</p>
            <div className="mt-8 border-b border-rule">
              <div aria-hidden className="hidden gap-4 pb-3 text-[13.5px] font-medium text-ink-muted sm:grid sm:grid-cols-[5rem_10rem_1fr]">
                {[1, 2, 3].map((n) => <span key={n}>{t(`sm.c${n}`)}</span>)}
              </div>
              {[1, 2, 3, 4].map((r) => {
                const [day, format, topic] = t(`sm.r${r}`).split("|");
                return (
                  <dl key={r} data-inview="" style={{ "--d": `${r * 0.12}s` } as CSSProperties} className="reveal grid gap-x-4 gap-y-1 border-t border-rule py-4 text-[15.5px] leading-[1.45] sm:grid-cols-[5rem_10rem_1fr]">
                    <dt className="sr-only">{t("sm.c1")}</dt><dd className="font-medium">{day}</dd>
                    <dt className="sr-only">{t("sm.c2")}</dt><dd className="text-ember">{format}</dd>
                    <dt className="sr-only">{t("sm.c3")}</dt><dd>{topic}</dd>
                  </dl>
                );
              })}
            </div>
            <p className={note}>{t("sm.note")}</p>
          </div>
        </section>

        <section id="contact" className="border-t border-rule">
          <div className={`${wide} grid gap-8 py-16 sm:py-20 lg:grid-cols-[1fr_auto] lg:items-end`}>
            <div>
              <h2 className={h2l}>{t("close.h")}</h2>
              <p className="mt-4 max-w-[36rem] text-[17px] leading-[1.6] text-ink-muted">{t("close.p")}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a href={contacts.telegram} className={btnAccent}>{t("close.tg")}</a>
              <a href={`mailto:${contacts.email}`} className={btnGhost}>{t("close.mail")}</a>
            </div>
          </div>
        </section>
      </main>
      <Footer tag={t("footer.tag")} clock={clockText(lang)} />
    </>
  );
}

