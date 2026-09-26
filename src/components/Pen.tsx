"use client";

import { motion, useReducedMotion, useScroll, useSpring } from "motion/react";
import type { ReactNode } from "react";

/**
 * The red editor's pen is the site's one motion language (DESIGN.md: a desk at night, a red pen
 * explaining each line). Everything here is drawn by that pen: an underline, a tick, a reading line.
 * Default state is fully drawn, so a failed script never hides content.
 */

const ease = [0.16, 1, 0.3, 1] as const;

/** A hand-drawn underline under one word, drawn once after the headline lands. */
export function PenUnderline({ children, delay = 0.9, onView = false }: { children: ReactNode; delay?: number; onView?: boolean }) {
  const reduce = useReducedMotion();
  return (
    <span className="relative inline-block whitespace-nowrap">
      {children}
      <svg aria-hidden viewBox="0 0 200 14" preserveAspectRatio="none"
        className="pointer-events-none absolute -bottom-[0.12em] left-[-2%] h-[0.28em] w-[104%] overflow-visible">
        <motion.path
          d="M2 9 C 40 4, 80 11, 120 7 S 180 5, 198 8"
          fill="none" stroke="var(--color-pen)" strokeWidth="3.2" strokeLinecap="round"
          initial={reduce ? false : { pathLength: 0, opacity: 0 }}
          {...(onView
            ? { whileInView: { pathLength: 1, opacity: 1 }, viewport: { once: true, margin: "0px 0px -15% 0px" } }
            : { animate: { pathLength: 1, opacity: 1 } })}
          transition={{ delay, duration: 0.7, ease }}
        />
      </svg>
    </span>
  );
}

/** A pen tick, drawn when the line it confirms scrolls into view. */
export function PenCheck({ delay = 0, className = "" }: { delay?: number; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={`h-6 w-6 shrink-0 overflow-visible ${className}`}>
      <motion.path
        d="M4 13.5 C 6.5 15.5, 8 17.5, 9.5 19.5 C 12.5 13, 16 8, 20.5 4.5"
        fill="none" stroke="var(--color-pen)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"
        initial={reduce ? false : { pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true, margin: "0px 0px -15% 0px" }}
        transition={{ delay, duration: 0.45, ease }}
      />
    </svg>
  );
}

/** Reading position: a thin pen line under the header. Hidden for reduced motion (it only moves). */
export function ReadingLine() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4 });
  if (reduce) return null;
  return <motion.span aria-hidden style={{ scaleX }} className="absolute inset-x-0 -bottom-px h-px origin-left bg-pen" />;
}

/** An arrow drawn in the same stroke as the pen, for "go there" links. */
export function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={`h-5 w-5 ${className}`} fill="none" stroke="currentColor"
      strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12h15M13.5 6.5 19 12l-5.5 5.5" />
    </svg>
  );
}

/** A refusal crossed out by the pen as it scrolls into view; every wrapped line gets its own stroke. */
export function StruckLine({ text, delay = 0 }: { text: string; delay?: number }) {
  const reduce = useReducedMotion();
  const drawn = { backgroundSize: "100% 1.5px" };
  return (
    <motion.span
      className="bg-no-repeat text-ink-muted [box-decoration-break:clone] [-webkit-box-decoration-break:clone]"
      style={{ backgroundImage: "linear-gradient(var(--color-pen), var(--color-pen))", backgroundPosition: "0 58%", ...(reduce ? drawn : {}) }}
      initial={reduce ? false : { backgroundSize: "0% 1.5px" }}
      whileInView={drawn}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ delay, duration: 0.5, ease }}
    >
      {text}
    </motion.span>
  );
}
