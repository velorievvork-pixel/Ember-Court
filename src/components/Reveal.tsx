"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef, type ReactNode } from "react";

const spring = { type: "spring" as const, stiffness: 120, damping: 20, mass: 0.6 };

/** Content rises into place once when it scrolls into view. Nothing moves for reduced-motion users. */
export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ ...spring, delay }}
    >
      {children}
    </motion.div>
  );
}

/** The four method steps; the pen line draws itself as the list scrolls past. */
export function MethodSteps({ steps }: { steps: { h: string; p: string }[] }) {
  const ref = useRef<HTMLOListElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 80%", "end 55%"] });
  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <ol ref={ref} className="relative mt-12 grid gap-10 pl-8 sm:pl-12">
      <span aria-hidden className="absolute left-[7px] top-2 bottom-2 w-px bg-rule sm:left-[11px]" />
      <motion.span
        aria-hidden
        className="absolute left-[7px] top-2 bottom-2 w-px origin-top bg-pen sm:left-[11px]"
        style={reduce ? undefined : { scaleY }}
      />
      {steps.map((s, i) => (
        <li key={s.h} className="relative grid gap-2 md:grid-cols-[14rem_1fr] md:gap-10">
          <span aria-hidden className="absolute -left-8 top-[0.45em] grid h-[15px] w-[15px] place-items-center rounded-full border border-pen bg-paper sm:-left-12 sm:h-[23px] sm:w-[23px] sm:top-[0.2em]">
            <span className="h-[5px] w-[5px] rounded-full bg-pen sm:h-[7px] sm:w-[7px]" />
          </span>
          <Reveal delay={i * 0.04}>
            <h3 className="text-[22px] font-semibold tracking-[-0.015em]">
              <span className="mr-3 text-[15px] font-medium text-ink-muted tabular-nums">0{i + 1}</span>{s.h}
            </h3>
          </Reveal>
          <Reveal delay={i * 0.04 + 0.05}>
            <p className="max-w-[40rem] text-[17px] leading-[1.6] text-ink-muted">{s.p}</p>
          </Reveal>
        </li>
      ))}
    </ol>
  );
}
