import { X } from "@phosphor-icons/react/dist/ssr";
import type { ReactNode } from "react";
import { Reveal, RevealItem } from "./Reveal";
import { eyebrow, h2, lede, wrap } from "./ui";

type T = (k: string) => string;

function Includes({ t, p, keys }: { t: T; p: string; keys: string[] }) {
  return (
    <div className="grid gap-10 md:grid-cols-12">
      <Reveal className="md:col-span-4">
        <h3 className="font-display text-[28px] font-medium leading-tight">{t(`${p}.inc.heading`)}</h3>
      </Reveal>
      <Reveal stagger as="ul" className="md:col-span-8">
        {keys.map((k) => (
          <RevealItem as="li" key={k} className="grid gap-2 border-t border-rule py-6 sm:grid-cols-[180px_1fr] sm:gap-8">
            <h4 className="font-display text-[21px] font-medium text-ink">{t(`${p}.inc.${k}.h`)}</h4>
            <p className="text-[15.5px] leading-relaxed text-ink-soft">{t(`${p}.inc.${k}.body`)}</p>
          </RevealItem>
        ))}
      </Reveal>
    </div>
  );
}

function Process({ t, p, fine = [] }: { t: T; p: string; fine?: number[] }) {
  return (
    <Reveal stagger as="ol" className="grid gap-x-12 gap-y-12 md:grid-cols-2">
      {[1, 2, 3, 4].map((n) => (
        <RevealItem as="li" key={n} className="grid grid-cols-[44px_1fr] gap-4">
          <span className="font-display text-[30px] leading-none text-ember/70">{n}</span>
          <div>
            <h4 className="font-display text-[23px] font-medium text-ink">{t(`${p}.s${n}.title`)}</h4>
            <p className="mt-2 text-[15.5px] leading-relaxed text-ink-soft">{t(`${p}.s${n}.body`)}</p>
            {fine.includes(n) && (
              <p className="mt-3 border-l border-ember/40 pl-3 text-[13.5px] leading-relaxed text-ink-faint">{t(`${p}.s${n}.fine`)}</p>
            )}
          </div>
        </RevealItem>
      ))}
    </Reveal>
  );
}

function Standard({ t, p, items, intro = false }: { t: T; p: string; items: string[]; intro?: boolean }) {
  return (
    <Reveal className="rounded-[2px] border border-rule bg-panel p-7 sm:p-10">
      <h3 className="font-display text-[clamp(1.6rem,3vw,2.1rem)] font-medium leading-tight">{t(`${p}.std.heading`)}</h3>
      {intro && <p className="mt-4 max-w-[60ch] text-[15.5px] leading-relaxed text-ink-soft">{t(`${p}.std.intro`)}</p>}
      <ul className="mt-7 grid gap-3.5">
        {items.map((k) => (
          <li key={k} className="grid grid-cols-[20px_1fr] gap-3 text-[15px] text-ink-soft">
            <X size={16} weight="bold" className="mt-[3px] text-ember-hot" />
            {t(`${p}.${k}`)}
          </li>
        ))}
      </ul>
      <p className="mt-8 border-t border-rule pt-6 font-display text-[21px] italic leading-snug text-ink">{t(`${p}.std.line`)}</p>
    </Reveal>
  );
}

/** One service on /services.html. `flip` alternates the order of blocks so neighbouring sections don't look identical. */
export default function ServiceSection({ id, t, p, inc, std, fine, stdIntro, flip, before, after }: {
  id: string; t: T; p: string; inc?: string[]; std: string[]; fine?: number[]; stdIntro?: boolean; flip?: boolean;
  before?: ReactNode; after?: ReactNode;
}) {
  const includes = inc && <Includes t={t} p={p} keys={inc} />;
  const process = <Process t={t} p={p} fine={fine} />;
  return (
    <section id={id} className="scroll-mt-24 border-t border-rule">
      <div className={`${wrap} flex flex-col gap-20 py-24 sm:py-32`}>
        <Reveal>
          <p className={eyebrow}>{t(`${p}.eyebrow`)}</p>
          <h2 className={`${h2} mt-5 max-w-[22ch]`}>{t(`${p}.heading`)}</h2>
          <p className={`${lede} mt-6`}>{t(`${p}.lede`)}</p>
        </Reveal>
        {before}
        {flip ? <>{includes}{process}</> : <>{process}{includes}</>}
        <Standard t={t} p={p} items={std} intro={stdIntro} />
        {after}
      </div>
    </section>
  );
}
