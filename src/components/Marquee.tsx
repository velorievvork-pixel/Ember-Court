/** The one marquee on the page: service names drifting past. Duplicated once for a seamless loop. */
export default function Marquee({ items }: { items: string[] }) {
  const row = items.map((t, i) => (
    <span key={i} className="flex shrink-0 items-center gap-8 pr-8 font-display text-[22px] italic text-ink-soft">
      {t}
      <span aria-hidden className="text-[10px] not-italic text-ember/70">✦</span>
    </span>
  ));
  return (
    <div className="relative overflow-hidden border-y border-rule py-5 [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
      <div className="flex w-max animate-marquee motion-reduce:animate-none">
        <div className="flex">{row}</div>
        <div className="flex" aria-hidden>{row}</div>
      </div>
    </div>
  );
}
