import type { ReactNode } from "react";
import { StruckLine } from "./Pen";
import { h2, muted, section, wrap } from "./ui";

type T = (k: string) => string;

export const h3 = "text-[20px] font-semibold tracking-[-0.01em]";

/** Rows separated by index-card rules: a short title on the left, the explanation on the right. */
export function Rows({ items }: { items: { h: string; body: string }[] }) {
  return (
    <dl>
      {items.map(({ h, body }) => (
        <div key={h} className="grid gap-2 border-t border-rule py-5 md:grid-cols-12 md:gap-8">
          <dt className="text-[17px] font-semibold md:col-span-3">{h}</dt>
          <dd className={`${muted} text-[16px] md:col-span-9`}>{body}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Things we refuse to do, crossed out by the pen (DESIGN.md 3.2). */
export function Struck({ items }: { items: string[] }) {
  return (
    <ul className="grid gap-2.5">
      {items.map((s, i) => (
        <li key={s} className="text-[16px] leading-[1.6]"><StruckLine text={s} delay={i * 0.12} /></li>
      ))}
    </ul>
  );
}

/** One service on /services.html: heading, the real sequence of steps, what's included, what we don't do. */
export default function ServiceSection({ id, t, p, inc, std, fine = [], stdIntro, after }: {
  id: string; t: T; p: string; inc?: string[]; std: string[]; fine?: number[]; stdIntro?: boolean; after?: ReactNode;
}) {
  return (
    <section id={id} className={`scroll-mt-6 border-t border-rule ${section}`}>
      <div className={`${wrap} grid gap-14`}>
        <header className="grid gap-5 md:grid-cols-12">
          <h2 className={`${h2} md:col-span-5`}>{t(`${p}.eyebrow`)}</h2>
          <div className="max-w-[60ch] md:col-span-7">
            <p className="text-[21px] font-semibold leading-[1.35] tracking-[-0.01em]">{t(`${p}.heading`)}</p>
            <p className={`${muted} mt-3`}>{t(`${p}.lede`)}</p>
          </div>
        </header>

        <ol className="grid gap-x-10 gap-y-8 md:grid-cols-2">
          {[1, 2, 3, 4].map((n) => (
            <li key={n} className="grid grid-cols-[1.75rem_1fr]">
              <span className="pt-[3px] text-[15px] font-semibold text-ink-muted tabular-nums">{n}</span>
              <div>
                <h3 className={h3}>{t(`${p}.s${n}.title`)}</h3>
                <p className={`${muted} mt-1.5 text-[16px]`}>{t(`${p}.s${n}.body`)}</p>
                {fine.includes(n) && <p className="mt-2 text-[14px] leading-[1.5] text-ink-muted">{t(`${p}.s${n}.fine`)}</p>}
              </div>
            </li>
          ))}
        </ol>

        {inc && (
          <div>
            <h3 className={`${h3} mb-4`}>{t(`${p}.inc.heading`)}</h3>
            <Rows items={inc.map((k) => ({ h: t(`${p}.inc.${k}.h`), body: t(`${p}.inc.${k}.body`) }))} />
          </div>
        )}

        {after}

        <div className="grid gap-5 md:grid-cols-12">
          <div className="md:col-span-5">
            <h3 className={h3}>{t(`${p}.std.heading`)}</h3>
            {stdIntro && <p className={`${muted} mt-3 text-[16px]`}>{t(`${p}.std.intro`)}</p>}
          </div>
          <div className="grid gap-5 md:col-span-7">
            <Struck items={std.map((k) => t(`${p}.${k}`))} />
            <p className="text-[17px] font-medium">{t(`${p}.std.line`)}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
