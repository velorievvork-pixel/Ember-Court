"use client";

import { useEffect, useState } from "react";

/**
 * Small pieces of the "desk at night" world that carry the brand's character.
 * Each one is either true information (the clock) or light the scene already implies (the lamp).
 */

/** Warm light from a desk lamp falling on the letter. Breathes very slowly; still for reduced motion. */
export function LampGlow() {
  return (
    <div aria-hidden className="pointer-events-none absolute -inset-x-4 -top-16 -bottom-10 -z-10 lamp-glow lg:-inset-x-16 lg:-top-24" />
  );
}

type ClockText = { open: string; closed: string; morning: string; monday: string };

/**
 * The time in Astana and whether we are at the desk now: Mon–Fri, 9:00–18:00, UTC+5.
 * Computed from UTC so an outdated browser time-zone database cannot shift it.
 * Rendered after mount only, so server and client HTML never disagree.
 */
export function AstanaClock({ text, className = "" }: { text: ClockText; className?: string }) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, []);

  if (!now) return <span className={`inline-block min-h-[1.5em] ${className}`} />;

  const local = new Date(now.getTime() + 5 * 3600e3);
  const day = local.getUTCDay();
  const minutes = local.getUTCHours() * 60 + local.getUTCMinutes();
  const time = `${String(local.getUTCHours()).padStart(2, "0")}:${String(local.getUTCMinutes()).padStart(2, "0")}`;
  const weekday = day >= 1 && day <= 5;
  const open = weekday && minutes >= 9 * 60 && minutes < 18 * 60;
  const nextIsMonday = day === 6 || day === 0 || (day === 5 && minutes >= 18 * 60);
  const line = open
    ? text.open.replace("{time}", time)
    : text.closed.replace("{time}", time).replace("{when}", nextIsMonday ? text.monday : text.morning);

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span aria-hidden className={`h-2 w-2 rounded-full ${open ? "bg-ember ember-pulse" : "bg-ink-muted/60"}`} />
      {line}
    </span>
  );
}
