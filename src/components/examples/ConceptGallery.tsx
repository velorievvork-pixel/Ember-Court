"use client";

import { useState } from "react";

export type Concept = { tab: string; name: string; tag: string; h: string; p: string; cta: string; f: string[]; svc: [string, string][]; how: string[] };
export type GalleryLabels = { desk: string; phone: string; svc: string; how: string; form: string; fname: string; fphone: string; send: string; reply: string };

// One palette per concept, so the six read as six different businesses.
const THEMES = [
  { page: "bg-[#f7fafd]", hero: "bg-[#e6f0fb]", ink: "text-[#0f2741]", muted: "text-[#4b5d73]", btn: "bg-[#f28c28] text-white", line: "border-[#d5e1ee]", card: "bg-white" },
  { page: "bg-[#f3fbf8]", hero: "bg-[#dff5ec]", ink: "text-[#12352e]", muted: "text-[#4a6a62]", btn: "bg-[#1f9d7a] text-white", line: "border-[#cfe9df]", card: "bg-white" },
  { page: "bg-[#16181b]", hero: "bg-[#22252a]", ink: "text-[#f4f4f2]", muted: "text-[#a9adb3]", btn: "bg-[#f5c518] text-[#16181b]", line: "border-white/10", card: "bg-white/[0.04]" },
  { page: "bg-[#fbf7ff]", hero: "bg-[#efe6fb]", ink: "text-[#2b1a46]", muted: "text-[#5f5274]", btn: "bg-[#6c3fd1] text-white", line: "border-[#e2d6f3]", card: "bg-white" },
  { page: "bg-[#fff8f3]", hero: "bg-[#fde9da]", ink: "text-[#3a2416]", muted: "text-[#76604f]", btn: "bg-[#c8562b] text-white", line: "border-[#f1dccb]", card: "bg-white" },
  { page: "bg-[#0e1726]", hero: "bg-[#13213a]", ink: "text-[#e8eef8]", muted: "text-[#93a3bd]", btn: "bg-[#3ddc97] text-[#0e1726]", line: "border-white/10", card: "bg-white/[0.04]" },
];

/** Six concept sites in one browser window: tabs pick the trade, the toggle switches desktop/phone, the page scrolls inside. */
export default function ConceptGallery({ concepts, l }: { concepts: Concept[]; l: GalleryLabels }) {
  const [i, setI] = useState(0);
  const [phone, setPhone] = useState(false);
  const c = concepts[i];
  const th = THEMES[i % THEMES.length];
  const pill = "min-h-10 shrink-0 whitespace-nowrap rounded-full border border-ink/20 px-4 text-[14.5px] transition-colors hover:border-ink/40 aria-selected:border-ember aria-selected:bg-ember aria-selected:font-semibold aria-selected:text-paper";

  return (
    <div>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div role="tablist" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          {concepts.map((x, k) => (
            <button key={x.tab} role="tab" aria-selected={k === i} onClick={() => setI(k)} className={pill}>{x.tab}</button>
          ))}
        </div>
        <div role="group" className="flex gap-1 self-start rounded-full border border-rule p-1">
          {[false, true].map((ph) => (
            <button key={String(ph)} aria-pressed={phone === ph} onClick={() => setPhone(ph)}
              className="rounded-full px-3 py-1.5 text-[13.5px] text-ink-muted transition-colors aria-pressed:bg-sheet aria-pressed:text-ink">
              {ph ? l.phone : l.desk}
            </button>
          ))}
        </div>
      </div>

      <div className={`mx-auto mt-5 overflow-hidden rounded-[14px] border border-rule bg-sheet shadow-[0_30px_80px_-40px_rgba(0,0,0,0.6)] transition-[max-width] duration-500 ${phone ? "max-w-[380px] rounded-[28px]" : "max-w-full"}`}>
        <div aria-hidden className="flex items-center gap-1.5 border-b border-rule px-3 py-2">
          {[0, 1, 2].map((k) => <span key={k} className="h-2 w-2 rounded-full bg-ink/20" />)}
          <span className="ml-2 h-4 flex-1 rounded-full bg-ink/10" />
        </div>
        <div key={`${i}-${phone}`} className={`fade-up h-[520px] overflow-y-auto overscroll-contain ${th.page} ${th.ink}`}>
          <header className={`sticky top-0 z-10 flex items-center justify-between border-b ${th.line} ${th.page} px-5 py-3 text-[13px]`}>
            <span className="font-semibold">{c.name}</span>
            {!phone && <nav className={`hidden gap-4 sm:flex ${th.muted}`}><span>{l.svc}</span><span>{l.how}</span><span>{l.form}</span></nav>}
            <span className={`rounded-[8px] px-3 py-1.5 text-[12px] font-semibold ${th.btn}`}>{c.cta}</span>
          </header>

          <section className={`${th.hero} px-5 py-10 ${phone ? "" : "sm:px-10 sm:py-14"}`}>
            <p className={`text-[12px] font-medium ${th.muted}`}>{c.tag}</p>
            <h4 className={`mt-2 max-w-[22ch] text-balance font-semibold leading-[1.1] tracking-[-0.025em] ${phone ? "text-[26px]" : "text-[26px] sm:text-[38px]"}`}>{c.h}</h4>
            <p className={`mt-3 max-w-[44ch] text-[14.5px] leading-[1.55] ${th.muted}`}>{c.p}</p>
            <span className={`mt-6 inline-flex rounded-[10px] px-5 py-3 text-[14px] font-semibold ${th.btn}`}>{c.cta}</span>
            <ul className="mt-6 flex flex-wrap gap-2">
              {c.f.map((x) => <li key={x} className={`rounded-full border ${th.line} ${th.card} px-3 py-1 text-[12.5px]`}>{x}</li>)}
            </ul>
          </section>

          <section className={`px-5 py-8 ${phone ? "" : "sm:px-10"}`}>
            <h5 className="text-[18px] font-semibold">{l.svc}</h5>
            <div className={`mt-4 grid gap-3 ${phone ? "" : "sm:grid-cols-3"}`}>
              {c.svc.map(([h, p]) => (
                <div key={h} className={`rounded-[12px] border ${th.line} ${th.card} p-4`}>
                  <p className="text-[15px] font-semibold">{h}</p>
                  <p className={`mt-1 text-[13.5px] leading-[1.5] ${th.muted}`}>{p}</p>
                </div>
              ))}
            </div>
          </section>

          <section className={`border-t ${th.line} px-5 py-8 ${phone ? "" : "sm:px-10"}`}>
            <h5 className="text-[18px] font-semibold">{l.how}</h5>
            <ol className={`mt-4 grid gap-4 ${phone ? "" : "sm:grid-cols-3"}`}>
              {c.how.map((x, k) => (
                <li key={x} className="flex gap-3 text-[14.5px] leading-[1.45]">
                  <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-[13px] font-semibold ${th.btn}`}>{k + 1}</span>{x}
                </li>
              ))}
            </ol>
          </section>

          <section className={`${th.hero} px-5 py-8 ${phone ? "" : "sm:px-10"}`}>
            <h5 className="text-[18px] font-semibold">{l.form}</h5>
            <div aria-hidden className={`mt-4 grid gap-3 ${phone ? "" : "sm:grid-cols-[1fr_1fr_auto]"}`}>
              <span className={`rounded-[10px] border ${th.line} ${th.card} px-4 py-3 text-[14px] ${th.muted}`}>{l.fname}</span>
              <span className={`rounded-[10px] border ${th.line} ${th.card} px-4 py-3 text-[14px] ${th.muted}`}>{l.fphone}</span>
              <span className={`rounded-[10px] px-5 py-3 text-center text-[14px] font-semibold ${th.btn}`}>{l.send}</span>
            </div>
            <p className={`mt-3 text-[12.5px] ${th.muted}`}>{l.reply}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
