import { existsSync } from "node:fs";
import { join } from "node:path";
import type { CSSProperties } from "react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { PenCheck } from "@/components/Pen";
import { btnAccent, btnGhost, h2l, wide } from "@/components/ui";
import { clockText, contacts, getT, langLabel, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/meta";

export async function generateMetadata({ params }: PageProps<"/[lang]/examples">) {
  return pageMetadata((await params).lang as Locale, "examples");
}

// For people who arrive from our first email: why they got it, and what each service looks like.
// Every example is marked as a sample; no real client names or numbers beyond the site's own.
export default async function Examples({ params }: PageProps<"/[lang]/examples">) {
  const lang = (await params).lang as Locale;
  const t = getT(lang, "examples");

  const chat: { side: "in" | "out" | "day"; key: string; time?: string }[] = [
    { side: "in", key: "a.m1", time: "21:47" },
    { side: "out", key: "a.m2", time: "21:47" },
    { side: "in", key: "a.m3", time: "21:48" },
    { side: "out", key: "a.m4", time: "21:48" },
    { side: "in", key: "a.m5", time: "21:48" },
    { side: "day", key: "a.day" },
    { side: "out", key: "a.m6", time: "09:00" },
    { side: "in", key: "a.m7", time: "09:02" },
  ];
  // The player shows only once the rendered file is committed to public/media.
  const hasVideo = existsSync(join(process.cwd(), "public/media/assistant-demo.mp4")) && existsSync(join(process.cwd(), "public/media/assistant-demo.jpg"));
  const jump: [string, string][] = [["assistant", "jump.a"], ["integrations", "jump.i"], ["outbound", "jump.o"], ["audit", "jump.au"], ["sites", "jump.s"], ["video", "jump.v"], ["social", "jump.sm"]];
  const label = "text-[14.5px] font-medium text-ember";
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

        {/* Assistant: a sample chat, evening request to morning confirmation. */}
        <section id="assistant" className="scroll-mt-20 border-t border-rule">
          <div className={`${wide} grid gap-10 py-16 sm:py-20 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16`}>
            <div>
              <p className={label}>{t("a.tag")}</p>
              <h2 className={`mt-2 ${h2l}`}>{t("a.h")}</h2>
              <p className="mt-4 max-w-[30rem] text-pretty text-[17px] leading-[1.6] text-ink-muted">{t("a.p")}</p>
              <p className={note}>{t("a.note")}</p>
            </div>
            <div className="mx-auto w-full max-w-[420px] overflow-hidden rounded-[22px] border border-rule bg-[#ece5dd] shadow-[0_20px_60px_-30px_rgba(0,0,0,0.35)]">
              <div className="flex items-center gap-3 bg-[#115e54] px-4 py-3 text-white">
                <span aria-hidden className="grid h-9 w-9 place-items-center rounded-full bg-white/90 text-[13px] font-semibold text-[#115e54]">+</span>
                <div className="leading-tight">
                  <p className="text-[15px] font-semibold">{t("a.name")}</p>
                  <p className="text-[12.5px] text-white/75">{t("a.status")}</p>
                </div>
              </div>
              <ol className="grid gap-2 p-4">
                {chat.map((m, i) => m.side === "day" ? (
                  <li key={m.key} className="my-1 justify-self-center rounded-full bg-[#d4e4ec] px-3 py-1 text-[12.5px] text-[#46505a]">{t(m.key)}</li>
                ) : (
                  <li key={m.key} data-inview="" style={{ "--d": `${i * 0.08}s` } as CSSProperties}
                    className={`reveal max-w-[85%] rounded-[14px] px-3.5 py-2 text-[15px] leading-[1.45] text-[#1c1e21] shadow-[0_1px_1px_rgba(0,0,0,0.08)] ${m.side === "in" ? "justify-self-end bg-[#d9f7c4]" : "justify-self-start bg-white"}`}>
                    {t(m.key)}<span className="ml-2 align-bottom text-[11.5px] text-[#788082]">{m.time}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
          {/* Two more bots in other trades, so a visitor finds one close to their own business. */}
          <div className={`${wide} pb-16 sm:pb-20`}>
            <h3 className="text-[22px] font-semibold tracking-[-0.015em]">{t("b.h")}</h3>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <MiniChat t={t} prefix="b1" head="bg-[#3390ec]" bg="bg-[#dfe7ee]" own="bg-[#effdde]" times={["14:02", "14:02", "14:03", "14:03"]} />
              <MiniChat t={t} prefix="b2" head="bg-[#115e54]" bg="bg-[#ece5dd]" own="bg-[#d9f7c4]" times={["19:31", "19:31", "19:32", "19:32"]} />
            </div>
            <p className={note}>{t("b.note")}</p>
          </div>
        </section>

        {/* Automation: the Telegram notice and the sheet row a site request turns into. */}
        <section id="integrations" className="scroll-mt-20 border-t border-rule">
          <div className={`${wide} grid gap-10 py-16 sm:py-20 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16`}>
            <div>
              <p className={label}>{t("i.tag")}</p>
              <h2 className={`mt-2 ${h2l}`}>{t("i.h")}</h2>
              <p className="mt-4 max-w-[30rem] text-pretty text-[17px] leading-[1.6] text-ink-muted">{t("i.p")}</p>
              <p className={note}>{t("i.note")}</p>
            </div>
            <div className="grid gap-6">
              <div className="max-w-[380px] rounded-[16px] border border-rule bg-sheet p-4 text-[15px] leading-[1.5]">
                <p className="text-[13px] font-semibold text-[#5aa9e6]">{t("i.bot")}</p>
                <p className="mt-1 font-semibold">{t("i.n1")}</p>
                {[2, 3, 4, 5].map((n) => <p key={n}>{t(`i.n${n}`)}</p>)}
                <p className="mt-2 text-[13.5px] text-ink-muted">{t("i.n6")}</p>
              </div>
              <div className="border-b border-rule">
                <div aria-hidden className="hidden gap-4 pb-3 text-[13.5px] font-medium text-ink-muted sm:grid sm:grid-cols-[7.5rem_5rem_1fr_8rem]">
                  {[1, 2, 3, 4].map((n) => <span key={n}>{t(`i.c${n}`)}</span>)}
                </div>
                {[1, 2, 3].map((r) => {
                  const cells = t(`i.r${r}`).split("|");
                  return (
                    <dl key={r} className="grid gap-x-4 gap-y-1 border-t border-rule py-3 text-[15px] leading-[1.45] sm:grid-cols-[7.5rem_5rem_1fr_8rem]">
                      {cells.map((c, i) => (
                        <div key={i} className="grid grid-cols-[6.5rem_1fr] gap-3 sm:block">
                          <dt className="text-[13.5px] text-ink-muted sm:sr-only">{t(`i.c${i + 1}`)}</dt>
                          <dd className={r === 1 && i === 3 ? "text-ember" : ""}>{c}</dd>
                        </div>
                      ))}
                    </dl>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Outbound: what the weekly list looks like, including a company we chose not to write to. */}
        <section id="outbound" className="scroll-mt-20 border-t border-rule bg-paper-deep/60">
          <div className={`${wide} py-16 sm:py-20`}>
            <p className={label}>{t("o.tag")}</p>
            <h2 className={`mt-2 ${h2l}`}>{t("o.h")}</h2>
            <p className="mt-4 max-w-[36rem] text-pretty text-[17px] leading-[1.6] text-ink-muted">{t("o.p")}</p>
            {/* Rows as cards on a phone, a four-column table from sm up; the last row is a company we chose not to write to. */}
            <div className="mt-8 border-b border-rule">
              <div aria-hidden className="hidden gap-4 pb-3 text-[13.5px] font-medium text-ink-muted sm:grid sm:grid-cols-4">
                {[1, 2, 3, 4].map((n) => <span key={n}>{t(`o.c${n}`)}</span>)}
              </div>
              {[1, 2, 3].map((r) => {
                const cells = t(`o.r${r}`).split("|");
                return (
                  <dl key={r} className={`grid gap-x-4 gap-y-2 border-t border-rule py-4 text-[15px] leading-[1.45] sm:grid-cols-4 ${r === 3 ? "text-ink-muted" : ""}`}>
                    {cells.map((c, i) => (
                      <div key={i} className="grid grid-cols-[6.5rem_1fr] gap-3 sm:block">
                        <dt className="text-[13.5px] text-ink-muted sm:sr-only">{t(`o.c${i + 1}`)}</dt>
                        <dd className={`${i === 0 ? "font-medium" : ""} ${r === 3 && i === 3 ? "text-ember" : ""}`}>{c}</dd>
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
              <p className={label}>{t("au.tag")}</p>
              <h2 className={`mt-2 ${h2l}`}>{t("au.h")}</h2>
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
              <p className={label}>{t("s.tag")}</p>
              <h2 className={`mt-2 ${h2l}`}>{t("s.h")}</h2>
              <p className="mt-4 max-w-[30rem] text-pretty text-[17px] leading-[1.6] text-ink-muted">{t("s.p")}</p>
              <p className={note}>{t("s.note")}</p>
            </div>
            <ul className="grid gap-4 self-center">
              {t("s.list").split("|").map((it, i) => (
                <li key={it} className="flex gap-3 text-[16.5px] leading-[1.5]"><PenCheck delay={i * 0.12} className="mt-[-1px]" />{it}</li>
              ))}
            </ul>
          </div>
          {/* Three first screens for other trades, each in its own palette, drawn in HTML rather than as pictures. */}
          <div className={`${wide} pb-16 sm:pb-20`}>
            <p className={label}>{t("sc.tag")}</p>
            <h3 className="mt-2 text-[clamp(1.5rem,2.6vw,2rem)] font-semibold tracking-[-0.02em]">{t("sc.h")}</h3>
            <p className="mt-3 max-w-[40rem] text-pretty text-[16.5px] leading-[1.6] text-ink-muted">{t("sc.p")}</p>
            <ul className="mt-8 grid gap-6 lg:grid-cols-3">
              {CONCEPTS.map((c, i) => (
                <li key={c.n} data-inview="" style={{ "--d": `${i * 0.1}s` } as CSSProperties} className="reveal">
                  <SiteConcept t={t} n={c.n} theme={c} />
                </li>
              ))}
            </ul>
            <p className={note}>{t("sc.note")}</p>
          </div>
        </section>

        {/* Video: a minute-long piece we made, loaded only when played (preload="none") to keep the page fast. */}
        <section id="video" className="scroll-mt-20 border-t border-rule">
          <div className={`${wide} grid gap-10 py-16 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16`}>
            <div>
              <p className={label}>{t("v.tag")}</p>
              <h2 className={`mt-2 ${h2l}`}>{t("v.h")}</h2>
              <p className="mt-4 max-w-[32rem] text-pretty text-[17px] leading-[1.6] text-ink-muted">{t("v.p")}</p>
              <ul className="mt-6 grid gap-3">
                {t("v.list").split("|").map((it) => (
                  <li key={it} className="flex gap-3 text-[16px] leading-[1.5]"><span aria-hidden className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-ember" />{it}</li>
                ))}
              </ul>
              <p className={note}>{t("v.note")}</p>
            </div>
            {hasVideo && <video controls playsInline preload="none" poster="/media/assistant-demo.jpg" aria-label={t("v.label")}
              className="mx-auto aspect-[9/16] w-full max-w-[340px] rounded-[18px] border border-rule bg-black object-cover">
              <source src="/media/assistant-demo.mp4" type="video/mp4" />
            </video>}
          </div>
        </section>

        {/* Social: a sample week from a monthly plan. */}
        <section id="social" className="scroll-mt-20 border-t border-rule bg-paper-deep/60">
          <div className={`${wide} py-16 sm:py-20`}>
            <p className={label}>{t("sm.tag")}</p>
            <h2 className={`mt-2 ${h2l}`}>{t("sm.h")}</h2>
            <p className="mt-4 max-w-[36rem] text-pretty text-[17px] leading-[1.6] text-ink-muted">{t("sm.p")}</p>
            <div className="mt-8 border-b border-rule">
              <div aria-hidden className="hidden gap-4 pb-3 text-[13.5px] font-medium text-ink-muted sm:grid sm:grid-cols-[5rem_10rem_1fr]">
                {[1, 2, 3].map((n) => <span key={n}>{t(`sm.c${n}`)}</span>)}
              </div>
              {[1, 2, 3, 4].map((r) => {
                const [day, format, topic] = t(`sm.r${r}`).split("|");
                return (
                  <dl key={r} className="grid gap-x-4 gap-y-1 border-t border-rule py-4 text-[15.5px] leading-[1.45] sm:grid-cols-[5rem_10rem_1fr]">
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

type T = (k: string) => string;

/** A compact messenger window for a sample conversation: messages <prefix>.m1…m4, the client writes first. */
function MiniChat({ t, prefix, head, bg, own, times }: { t: T; prefix: string; head: string; bg: string; own: string; times: string[] }) {
  return (
    <div className={`overflow-hidden rounded-[20px] border border-rule ${bg} shadow-[0_20px_50px_-30px_rgba(0,0,0,0.35)]`}>
      <div className={`flex items-center gap-3 ${head} px-4 py-3 text-white`}>
        <span aria-hidden className="grid h-8 w-8 place-items-center rounded-full bg-white/90 text-[12px] font-semibold text-[#1c1e21]">{t(`${prefix}.name`).charAt(0)}</span>
        <div className="leading-tight">
          <p className="text-[14.5px] font-semibold">{t(`${prefix}.name`)}</p>
          <p className="text-[12px] text-white/75">{t(`${prefix}.status`)}</p>
        </div>
      </div>
      <ol className="grid gap-2 p-4">
        {[1, 2, 3, 4].map((n, i) => (
          <li key={n} data-inview="" style={{ "--d": `${i * 0.1}s` } as CSSProperties}
            className={`reveal max-w-[85%] rounded-[14px] px-3.5 py-2 text-[14.5px] leading-[1.45] text-[#1c1e21] shadow-[0_1px_1px_rgba(0,0,0,0.08)] ${n % 2 ? `justify-self-end ${own}` : "justify-self-start bg-white"}`}>
            {t(`${prefix}.m${n}`)}<span className="ml-2 align-bottom text-[11px] text-[#788082]">{times[i]}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

const CONCEPTS = [
  { n: 1, page: "bg-[#f7fafd]", hero: "bg-[linear-gradient(135deg,#e6f0fb,#f7fafd)]", ink: "text-[#0f2741]", muted: "text-[#4b5d73]", btn: "bg-[#f28c28] text-white", chip: "bg-white text-[#0f2741] ring-1 ring-[#d5e1ee]" },
  { n: 2, page: "bg-[#f3fbf8]", hero: "bg-[linear-gradient(135deg,#dff5ec,#f3fbf8)]", ink: "text-[#12352e]", muted: "text-[#4a6a62]", btn: "bg-[#1f9d7a] text-white", chip: "bg-white text-[#12352e] ring-1 ring-[#cfe9df]" },
  { n: 3, page: "bg-[#16181b]", hero: "bg-[linear-gradient(135deg,#24272c,#16181b)]", ink: "text-[#f4f4f2]", muted: "text-[#a9adb3]", btn: "bg-[#f5c518] text-[#16181b]", chip: "bg-white/5 text-[#f4f4f2] ring-1 ring-white/10" },
];

/** One concept site's first screen inside a browser frame. Decorative copy, real text, no images. */
function SiteConcept({ t, n, theme }: { t: T; n: number; theme: (typeof CONCEPTS)[number] }) {
  const k = (x: string) => t(`sc${n}.${x}`);
  return (
    <figure className="lift overflow-hidden rounded-[14px] border border-rule bg-sheet">
      <div aria-hidden className="flex items-center gap-1.5 border-b border-rule px-3 py-2">
        {[0, 1, 2].map((i) => <span key={i} className="h-2 w-2 rounded-full bg-ink/20" />)}
        <span className="ml-2 h-4 flex-1 rounded-full bg-ink/10" />
      </div>
      <div className={`${theme.page} ${theme.ink}`}>
        <div className="flex items-center justify-between px-5 py-3 text-[12.5px]">
          <span className="font-semibold tracking-[-0.01em]">{k("name")}</span>
          <span className={`hidden gap-3 sm:flex ${theme.muted}`}>{t("sc.nav").split("|").map((x) => <span key={x}>{x}</span>)}</span>
        </div>
        <div className={`${theme.hero} px-5 pb-6 pt-5`}>
          <p className={`text-[11.5px] font-medium uppercase tracking-[0.06em] ${theme.muted}`}>{k("tag")}</p>
          <p className="mt-2 text-balance text-[21px] font-semibold leading-[1.15] tracking-[-0.02em]">{k("h")}</p>
          <p className={`mt-2 text-[13px] leading-[1.5] ${theme.muted}`}>{k("p")}</p>
          <span className={`mt-4 inline-flex rounded-[8px] px-4 py-2 text-[13px] font-semibold ${theme.btn}`}>{k("cta")}</span>
          <ul className="mt-4 flex flex-wrap gap-1.5">
            {k("f").split("|").map((f) => <li key={f} className={`rounded-full px-2.5 py-1 text-[11.5px] ${theme.chip}`}>{f}</li>)}
          </ul>
        </div>
      </div>
      <figcaption className="sr-only">{k("name")}: {k("tag")}</figcaption>
    </figure>
  );
}
