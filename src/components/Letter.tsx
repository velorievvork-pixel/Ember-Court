"use client";

import { useState, type CSSProperties } from "react";

type Props = { greeting: string; paragraphs: string[]; notes: string[]; caption: string; signature: string };

const at = (d: number) => ({ "--d": `${d}s` }) as CSSProperties;

/**
 * The signature element (DESIGN.md 3.2): a first message with the editor's red notes.
 * The page's one authored moment: each line is written in (an ink wipe, left to right), then the pen
 * strikes its margin and writes why the line is there. ~4 s in total, CSS only (globals.css, "Letter").
 */
export default function Letter({ greeting, paragraphs, notes, caption, signature }: Props) {
  // Pointing at a line (or its note) lights that pair and dims the rest: the note explains *this* line.
  const [active, setActive] = useState<number | null>(null);
  const lineAt = (i: number) => 0.25 + i * 0.85;

  return (
    <figure>
      <div className="rounded-[4px] border border-rule bg-sheet px-6 py-7 sm:px-9 sm:py-8">
        <div className="ruled font-letter text-[17px] leading-[1.7] text-ink sm:text-[18px]">
          <p className="letter-ink" style={at(0)}>{greeting}</p>
          <ol className="mt-[1.7em] grid gap-y-[1.7em]">
            {paragraphs.map((p, i) => (
              <li key={i} tabIndex={0}
                onPointerEnter={() => setActive(i)} onPointerLeave={() => setActive(null)}
                onFocus={() => setActive(i)} onBlur={() => setActive(null)}
                onClick={() => setActive((a) => (a === i ? null : i))}
                className={`relative grid cursor-default gap-2 rounded-[2px] pl-5 outline-offset-4 transition-opacity duration-300 xl:grid-cols-[1fr_10.5rem] xl:gap-6 ${active !== null && active !== i ? "opacity-45" : ""}`}>
                <span aria-hidden style={at(lineAt(i) + 0.45)}
                  className={`letter-stroke absolute left-0 top-[0.35em] h-[calc(100%-0.7em)] w-[2px] origin-top rounded-full bg-pen transition-shadow duration-300 ${active === i ? "shadow-[0_0_10px_1px_var(--color-pen)]" : ""}`} />
                <p className="letter-ink" style={at(lineAt(i))}>{p}</p>
                <p className="letter-note font-sans text-[13.5px] font-medium leading-[1.4] text-pen-ink xl:pt-[0.3em]" style={at(lineAt(i) + 0.6)}>
                  <span className="mr-1.5 tabular-nums">{i + 1}.</span>{notes[i]}
                </p>
              </li>
            ))}
          </ol>
          <p className="letter-ink mt-[1.7em]" style={at(lineAt(paragraphs.length))}>{signature}</p>
        </div>
      </div>
      <figcaption className="mt-3 text-[14px] text-ink-muted">{caption}</figcaption>
    </figure>
  );
}
