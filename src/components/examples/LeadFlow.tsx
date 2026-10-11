"use client";

import { useEffect, useRef, useState } from "react";

type L = { site: string; name: string; phone: string; need: string; send: string; bot: string; n1: string; n5: string; n6: string; sheet: string; cols: string[]; isNew: string };

/**
 * One request travelling through the automation: the site form fills in, the owner's Telegram gets the notice,
 * and the row lands at the top of the sheet. Plays once in view, then loops slowly; static under reduced motion.
 * Steps: 0 empty, 1-3 fields typed, 4 sent, 5 notice, 6 row added.
 */
export default function LeadFlow({ l, values, rows, today }: { l: L; values: string[]; rows: string[][]; today: string }) {
  const [step, setStep] = useState(0);
  const [on, setOn] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOn(e.isIntersecting), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!on) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const plan = still ? [[0, 6]] : [[0, 0], [600, 1], [1400, 2], [2200, 3], [3200, 4], [4000, 5], [5000, 6], [11000, 0]];
    const timers: ReturnType<typeof setTimeout>[] = [];
    let cycle = 0;
    const run = () => {
      plan.forEach(([at, s]) => timers.push(setTimeout(() => setStep(s), at)));
      if (!still) timers.push(setTimeout(() => { cycle += 1; if (cycle < 4) run(); }, 11200));
    };
    run();
    return () => timers.forEach(clearTimeout);
  }, [on]);

  const field = (label: string, value: string, shown: boolean) => (
    <div>
      <p className="text-[12.5px] text-ink-muted">{label}</p>
      <p className="mt-1 min-h-[42px] rounded-[8px] border border-rule bg-paper px-3 py-2.5 text-[14.5px]">
        <span className={shown ? "fade-up inline-block" : "invisible"}>{value}</span>
      </p>
    </div>
  );
  const newRow = [today, values[0], values[2], l.isNew];

  return (
    <div ref={box} className="grid gap-5 md:grid-cols-[1fr_1fr]">
      <div className="rounded-[14px] border border-rule bg-sheet p-4">
        <p className="text-[13px] font-medium text-ink-muted">{l.site}</p>
        <div className="mt-3 grid gap-3">
          {field(l.name, values[0], step >= 1)}
          {field(l.phone, values[1], step >= 2)}
          {field(l.need, values[2], step >= 3)}
          <span className={`rounded-[8px] px-4 py-2.5 text-center text-[14.5px] font-semibold text-paper transition-[background-color,transform] duration-200 ${step === 4 ? "scale-[0.97] bg-[#f7b57a]" : "bg-ember"}`}>{l.send}</span>
        </div>
      </div>

      <div className="grid content-start gap-4">
        <div className={`rounded-[14px] border border-rule bg-sheet p-4 text-[14.5px] leading-[1.5] transition-[opacity,transform] duration-500 ${step >= 5 ? "opacity-100" : "translate-y-2 opacity-0"}`}>
          <p className="text-[12.5px] font-semibold text-[#5aa9e6]">{l.bot}</p>
          <p className="mt-1 font-semibold">{l.n1}</p>
          <p>{values[0]}, {values[1]}</p>
          <p>{values[2]}</p>
          <p className="text-ink-muted">{l.n5}</p>
          <p className={`mt-2 text-[13px] text-ink-muted transition-opacity duration-500 ${step >= 6 ? "opacity-100" : "opacity-0"}`}>{l.n6}</p>
        </div>
        <div className="rounded-[14px] border border-rule">
          <p className="border-b border-rule px-4 py-2.5 text-[13px] font-medium text-ink-muted">{l.sheet}</p>
          <div className="text-[13.5px]">
            {[...(step >= 6 ? [newRow] : []), ...rows].slice(0, 3).map((r, i) => (
              <div key={r.join() + i} className={`grid grid-cols-[5.5rem_1fr_5.5rem] gap-3 border-b border-rule px-4 py-2 last:border-b-0 ${step >= 6 && i === 0 ? "fade-up bg-ember/10" : ""}`}>
                <span className="text-ink-muted">{r[0]}</span>
                <span className="truncate">{r[1]}: {r[2]}</span>
                <span className={step >= 6 && i === 0 ? "text-ember" : "text-ink-muted"}>{r[3]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
