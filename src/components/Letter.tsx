"use client";

import { motion, useReducedMotion } from "motion/react";

type Props = { greeting: string; paragraphs: string[]; notes: string[]; caption: string; signature: string };

/**
 * The signature element (DESIGN.md 3.2): a first message with the editor's red notes.
 * The notes arrive one after another on load; that is the only choreographed motion on the site.
 */
export default function Letter({ greeting, paragraphs, notes, caption, signature }: Props) {
  const reduce = useReducedMotion();
  const appear = (i: number) =>
    reduce
      ? {}
      : { initial: { opacity: 0, x: -6 }, animate: { opacity: 1, x: 0 }, transition: { delay: 0.5 + i * 0.45, duration: 0.35 } };
  const stroke = (i: number) =>
    reduce
      ? {}
      : { initial: { scaleY: 0 }, animate: { scaleY: 1 }, transition: { delay: 0.5 + i * 0.45, duration: 0.3, ease: "easeOut" as const } };

  return (
    <figure>
      <div className="rounded-[4px] bg-sheet px-6 py-7 shadow-[0_1px_0_#C9D2DF,0_12px_32px_-18px_rgba(23,35,58,0.35)] sm:px-9 sm:py-8">
        <div className="ruled font-letter text-[17px] leading-[1.7] text-ink sm:text-[18px]">
          <p>{greeting}</p>
          <ol className="mt-[1.7em] grid gap-y-[1.7em]">
            {paragraphs.map((p, i) => (
              <li key={i} className="relative grid gap-2 pl-5 xl:grid-cols-[1fr_10.5rem] xl:gap-6">
                <motion.span aria-hidden className="absolute left-0 top-[0.35em] h-[calc(100%-0.7em)] w-[2px] origin-top bg-pen" {...stroke(i)} />
                <p>{p}</p>
                <motion.p className="font-sans text-[13.5px] font-medium leading-[1.4] text-pen xl:pt-[0.3em]" {...appear(i)}>
                  <span className="mr-1.5 tabular-nums">{i + 1}.</span>{notes[i]}
                </motion.p>
              </li>
            ))}
          </ol>
          <p className="mt-[1.7em]">{signature}</p>
        </div>
      </div>
      <figcaption className="mt-3 text-[14px] text-ink-muted">{caption}</figcaption>
    </figure>
  );
}
