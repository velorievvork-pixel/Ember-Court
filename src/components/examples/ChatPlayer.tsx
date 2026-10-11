"use client";

import { useEffect, useRef, useState } from "react";

export type Msg = { who: "c" | "b" | "d"; text: string; time: string };
export type Scenario = { tab: string; name: string; status: string; kind: "wa" | "tg"; msgs: Msg[] };

const skin = {
  wa: { head: "bg-[#115e54]", bg: "bg-[#ece5dd]", own: "bg-[#d9f7c4]" },
  tg: { head: "bg-[#3390ec]", bg: "bg-[#dfe7ee]", own: "bg-[#effdde]" },
};

/**
 * A sample conversation that plays itself once it is on screen: the customer writes, the bot "types", then answers.
 * Tabs switch the trade; Replay starts it again. With reduced motion the whole conversation is shown at once.
 * Plain timers with cleanup; nothing runs until the window scrolls into view.
 */
export default function ChatPlayer({ scenarios, typing, replay }: { scenarios: Scenario[]; typing: string; replay: string }) {
  const [tab, setTab] = useState(0);
  const [shown, setShown] = useState(0);
  const [busy, setBusy] = useState(false);
  const [run, setRun] = useState(0);
  const [visible, setVisible] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLOListElement>(null);
  const s = scenarios[tab];

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); io.disconnect(); } }, { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (still) {
      timers.push(setTimeout(() => { setBusy(false); setShown(s.msgs.length); }, 0));
      return () => timers.forEach(clearTimeout);
    }
    let at = 400;
    timers.push(setTimeout(() => { setBusy(false); setShown(0); }, 0));
    s.msgs.forEach((m, i) => {
      if (m.who === "b") {
        timers.push(setTimeout(() => setBusy(true), at));
        at += 1100;
      }
      timers.push(setTimeout(() => { setBusy(false); setShown(i + 1); }, at));
      at += m.who === "c" ? 1300 : 900;
    });
    return () => timers.forEach(clearTimeout);
  }, [visible, tab, run, s.msgs]);

  useEffect(() => {
    const el = list.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [shown, busy]);

  const sk = skin[s.kind];
  const done = shown >= s.msgs.length && !busy;
  return (
    <div ref={box}>
      <div role="tablist" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {scenarios.map((x, i) => (
          <button key={x.tab} role="tab" aria-selected={i === tab} onClick={() => { setTab(i); setRun((r) => r + 1); }}
            className="min-h-10 shrink-0 whitespace-nowrap rounded-full border border-ink/20 px-4 text-[14.5px] transition-colors hover:border-ink/40 aria-selected:border-ember aria-selected:bg-ember aria-selected:font-semibold aria-selected:text-paper">
            {x.tab}
          </button>
        ))}
      </div>
      <div className={`mt-5 overflow-hidden rounded-[22px] border border-rule ${sk.bg} shadow-[0_20px_60px_-30px_rgba(0,0,0,0.45)]`}>
        <div className={`flex items-center gap-3 ${sk.head} px-4 py-3 text-white`}>
          <span aria-hidden className="grid h-9 w-9 place-items-center rounded-full bg-white/90 text-[13px] font-semibold text-[#1c1e21]">{s.name.charAt(0)}</span>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-[15px] font-semibold">{s.name}</p>
            <p className="text-[12.5px] text-white/75">{busy ? typing : s.status}</p>
          </div>
          <button onClick={() => setRun((r) => r + 1)} disabled={!done}
            className="rounded-full bg-white/15 px-3 py-1.5 text-[13px] font-medium transition-opacity hover:bg-white/25 disabled:opacity-0">
            {replay}
          </button>
        </div>
        <ol ref={list} aria-live="polite" className="grid h-[420px] content-start gap-2 overflow-y-auto p-4">
          {s.msgs.slice(0, shown).map((m, i) => m.who === "d" ? (
            <li key={i} className="fade-up my-1 justify-self-center rounded-full bg-[#d4e4ec] px-3 py-1 text-[12.5px] text-[#46505a]">{m.text}</li>
          ) : (
            <li key={i} className={`fade-up max-w-[85%] rounded-[14px] px-3.5 py-2 text-[15px] leading-[1.45] text-[#1c1e21] shadow-[0_1px_1px_rgba(0,0,0,0.08)] ${m.who === "c" ? `justify-self-end ${sk.own}` : "justify-self-start bg-white"}`}>
              {m.text}<span className="ml-2 align-bottom text-[11.5px] text-[#788082]">{m.time}</span>
            </li>
          ))}
          {busy && (
            <li aria-hidden className="fade-up flex w-16 gap-1 justify-self-start rounded-[14px] bg-white px-3.5 py-3">
              {[0, 1, 2].map((d) => <span key={d} className="typing-dot h-2 w-2 rounded-full bg-[#9aa0a6]" style={{ animationDelay: `${d * 0.15}s` }} />)}
            </li>
          )}
        </ol>
      </div>
    </div>
  );
}
