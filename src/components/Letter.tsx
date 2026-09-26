"use client";

import { motion, useReducedMotion } from "motion/react";

type Props = { greeting: string; paragraphs: string[]; notes: string[]; caption: string; signature: string };

/**
 * The signature element (DESIGN.md 3.2): a first message with the editor's red notes.
 * The page's one authored moment: the letter is written line by line and corrected by the pen.
 */
export default function Letter({ greeting, paragraphs, notes, caption, signature }: Props) {
  const reduce = useReducedMotion();
  // The authored moment of the page: each line is written in (an ink wipe, left to right),
  // then the pen strikes its margin and writes why the line is there. ~4 s in total.
  const ease = [0.16, 1, 0.3, 1] as const;
  const lineAt = (i: number) => 0.25 + i * 0.85;
  const ink = (at: number) =>
    reduce
      ? {}
      : { initial: { clipPath: "inset(0 100% 0 0)", opacity: 0.4 }, animate: { clipPath: "inset(0 0% 0 0)", opacity: 1 },
          transition: { delay: at, duration: 0.6, ease } };
  const stroke = (i: number) =>
    reduce
      ? {}
      : { initial: { scaleY: 0 }, animate: { scaleY: 1 }, transition: { delay: lineAt(i) + 0.45, duration: 0.3, ease } };
  const note = (i: number) =>
    reduce
      ? {}
      : { initial: { opacity: 0, filter: "blur(3px)" }, animate: { opacity: 1, filter: "blur(0px)" },
          transition: { delay: lineAt(i) + 0.6, duration: 0.4, ease } };

  return (
    <figure>
      <div className="rounded-[4px] border border-rule bg-sheet px-6 py-7 sm:px-9 sm:py-8">
        <div className="ruled font-letter text-[17px] leading-[1.7] text-ink sm:text-[18px]">
          <motion.p {...ink(0)}>{greeting}</motion.p>
          <ol className="mt-[1.7em] grid gap-y-[1.7em]">
            {paragraphs.map((p, i) => (
              <li key={i} className="relative grid gap-2 pl-5 xl:grid-cols-[1fr_10.5rem] xl:gap-6">
                <motion.span aria-hidden className="absolute left-0 top-[0.35em] h-[calc(100%-0.7em)] w-[2px] origin-top bg-pen" {...stroke(i)} />
                <motion.p {...ink(lineAt(i))}>{p}</motion.p>
                <motion.p className="font-sans text-[13.5px] font-medium leading-[1.4] text-pen-ink xl:pt-[0.3em]" {...note(i)}>
                  <span className="mr-1.5 tabular-nums">{i + 1}.</span>{notes[i]}
                </motion.p>
              </li>
            ))}
          </ol>
          <motion.p className="mt-[1.7em]" {...ink(lineAt(paragraphs.length))}>{signature}</motion.p>
        </div>
      </div>
      <figcaption className="mt-3 text-[14px] text-ink-muted">{caption}</figcaption>
    </figure>
  );
}
