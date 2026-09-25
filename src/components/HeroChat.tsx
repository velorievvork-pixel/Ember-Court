"use client";

import { CheckCheck } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

/** Hero visual: our first message, a typing indicator, then the prospect's reply. Plays once. */
export default function HeroChat({ name, us, reply, meta }: { name: string; us: string; reply: string; meta: string }) {
  const reduce = useReducedMotion();
  const show = (delay: number) =>
    reduce ? {} : { initial: { opacity: 0, y: 12, scale: 0.98 }, animate: { opacity: 1, y: 0, scale: 1 }, transition: { delay, duration: 0.45, ease: [0.22, 1, 0.36, 1] as const } };
  const typing = reduce ? { style: { display: "none" } } : { initial: { opacity: 0 }, animate: { opacity: [0, 1, 1, 0] }, transition: { delay: 1.3, duration: 1.6, times: [0, 0.1, 0.85, 1] } };

  return (
    <div className="relative mx-auto w-full max-w-[440px]">
      <div className="absolute -inset-6 -z-10 rounded-[32px] bg-gradient-to-br from-pen/25 via-ember/10 to-transparent blur-2xl" />
      <div className="overflow-hidden rounded-[22px] border border-rule bg-sheet shadow-[0_40px_80px_-30px_rgba(0,0,0,0.8)]">
        <div className="flex items-center gap-3 border-b border-rule px-5 py-4">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-ember to-pen text-[15px] font-semibold text-paper">А</span>
          <div>
            <p className="text-[15px] font-semibold">{name}</p>
            <p className="text-[12.5px] text-ink-muted">online</p>
          </div>
        </div>
        <div className="flex min-h-[320px] flex-col gap-3 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),transparent)] px-4 py-5">
          <motion.div {...show(0.3)} className="ml-auto max-w-[85%] rounded-[16px] rounded-br-[4px] bg-[#2B3A5C] px-4 py-3 text-[14.5px] leading-[1.5]">
            {us}
            <span className="mt-1 flex items-center justify-end gap-1 text-[11px] text-ink-muted">10:24 <CheckCheck size={14} className="text-ember" /></span>
          </motion.div>
          <motion.div {...typing} className="flex w-16 items-center gap-1 rounded-[16px] bg-paper-deep px-4 py-3">
            {[0, 1, 2].map((i) => <span key={i} className="h-1.5 w-1.5 animate-pulse rounded-full bg-ink-muted" style={{ animationDelay: `${i * 150}ms` }} />)}
          </motion.div>
          <motion.div {...show(3)} className="max-w-[80%] rounded-[16px] rounded-bl-[4px] bg-paper-deep px-4 py-3 text-[14.5px] leading-[1.5]">
            {reply}
            <span className="mt-1 block text-right text-[11px] text-ink-muted">12:31</span>
          </motion.div>
          <motion.p {...show(3.5)} className="mt-auto self-center rounded-full border border-ember/30 bg-ember/10 px-3 py-1 text-[12.5px] font-medium text-ember">
            {meta}
          </motion.p>
        </div>
      </div>
    </div>
  );
}
