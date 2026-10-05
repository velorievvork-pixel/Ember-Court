import type { CSSProperties, ReactNode } from "react";

/** Content rises into place once when it scrolls into view (CSS, see globals.css). Still for reduced motion. */
export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <div data-inview="" style={{ "--d": `${delay}s` } as CSSProperties} className={`reveal ${className ?? ""}`}>
      {children}
    </div>
  );
}

/** The four method steps; the pen line draws itself as the list scrolls past (scroll-driven CSS). */
export function MethodSteps({ steps }: { steps: { h: string; p: string }[] }) {
  return (
    <ol className="relative mt-12 grid gap-10 pl-8 sm:pl-12">
      <span aria-hidden className="absolute left-[7px] top-2 bottom-2 w-px bg-rule sm:left-[11px]" />
      <span aria-hidden className="method-line absolute left-[7px] top-2 bottom-2 w-px origin-top bg-pen sm:left-[11px]" />
      {steps.map((s, i) => (
        <li key={s.h} className="relative grid gap-2 md:grid-cols-[14rem_1fr] md:gap-10">
          <span aria-hidden className="absolute -left-8 top-[0.45em] grid h-[15px] w-[15px] place-items-center rounded-full border border-pen bg-paper sm:-left-12 sm:h-[23px] sm:w-[23px] sm:top-[0.2em]">
            <span className="h-[5px] w-[5px] rounded-full bg-pen sm:h-[7px] sm:w-[7px]" />
          </span>
          <h3 className="text-[22px] font-semibold tracking-[-0.015em]">
            <span className="mr-3 text-[15px] font-medium text-ink-muted tabular-nums">0{i + 1}</span>{s.h}
          </h3>
          <p className="max-w-[40rem] text-[17px] leading-[1.6] text-ink-muted">{s.p}</p>
        </li>
      ))}
    </ol>
  );
}
