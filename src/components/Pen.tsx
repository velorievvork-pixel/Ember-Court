import type { CSSProperties, ReactNode } from "react";

/**
 * The red editor's pen is the site's one motion language (DESIGN.md: a desk at night, a red pen
 * explaining each line). Everything here is drawn by that pen: an underline, a tick, a reading line.
 * Plain CSS (globals.css, "Pen motion"): no animation library on the page. The default state is fully
 * drawn, so a failed script or reduced motion never hides content. [data-inview] marks are switched on
 * by InViewObserver when they scroll into view.
 */

const delay = (d: number) => ({ "--d": `${d}s` }) as CSSProperties;

/** A hand-drawn underline under one word: drawn after the headline lands, or when scrolled into view. */
export function PenUnderline({ children, delay: d = 0.9, onView = false }: { children: ReactNode; delay?: number; onView?: boolean }) {
  return (
    <span className="relative inline-block whitespace-nowrap">
      {children}
      <svg aria-hidden viewBox="0 0 200 14" preserveAspectRatio="none" {...(onView ? { "data-inview": "" } : {})}
        className={`pointer-events-none absolute -bottom-[0.12em] left-[-2%] h-[0.28em] w-[104%] overflow-visible ${onView ? "pen-draw-view" : "pen-draw-now"}`}
        style={{ ...delay(d), "--dur": "0.7s" } as CSSProperties}>
        <path d="M2 9 C 40 4, 80 11, 120 7 S 180 5, 198 8" pathLength={1}
          fill="none" stroke="var(--color-pen)" strokeWidth="3.2" strokeLinecap="round" />
      </svg>
    </span>
  );
}

/** A pen tick, drawn when the line it confirms scrolls into view. */
export function PenCheck({ delay: d = 0, className = "" }: { delay?: number; className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" data-inview="" style={delay(d)} className={`pen-draw-view h-6 w-6 shrink-0 overflow-visible ${className}`}>
      <path d="M4 13.5 C 6.5 15.5, 8 17.5, 9.5 19.5 C 12.5 13, 16 8, 20.5 4.5" pathLength={1}
        fill="none" stroke="var(--color-pen)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Reading position: a thin pen line under the header, driven by the page scroll (hidden where unsupported). */
export function ReadingLine() {
  return <span aria-hidden className="reading-line absolute inset-x-0 -bottom-px h-px origin-left bg-pen" />;
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
export function StruckLine({ text, delay: d = 0 }: { text: string; delay?: number }) {
  return (
    <span data-inview="" style={delay(d)}
      className="pen-strike bg-no-repeat text-ink-muted [box-decoration-break:clone] [-webkit-box-decoration-break:clone]">
      {text}
    </span>
  );
}
