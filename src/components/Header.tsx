"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ReadingLine } from "./Pen";
import EmberMark from "./EmberMark";
import { btnPrimary, wide } from "./ui";
import { contacts, href, locales, type Locale, type Page } from "@/lib/i18n";

const LANG_LABEL: Record<Locale, string> = { ru: "RU", en: "EN", uk: "UA" };

export default function Header({ lang, page, labels }: {
  lang: Locale; page: Page; labels: { home: string; services: string; clients: string; cta: string; lang: string };
}) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const nav: [Page, string][] = [["index", labels.home], ["services", labels.services], ["clients", labels.clients]];
  const links = nav.map(([p, label]) => (
    <Link key={p} href={href(lang, p)} onClick={() => setOpen(false)} aria-current={p === page ? "page" : undefined}
      className="py-2 text-[15px] text-ink-muted hover:text-ink aria-[current=page]:text-ink aria-[current=page]:underline aria-[current=page]:decoration-pen aria-[current=page]:decoration-2 aria-[current=page]:underline-offset-8">
      {label}
    </Link>
  ));
  const langs = (
    <nav aria-label={labels.lang} className="flex items-center gap-3 text-[14px]">
      {locales.map((l) => (
        <Link key={l} href={href(l, page)} hrefLang={l} lang={l} aria-current={l === lang ? "true" : undefined}
          className="py-2 text-ink-muted hover:text-ink aria-[current=true]:font-semibold aria-[current=true]:text-ink">
          {LANG_LABEL[l]}
        </Link>
      ))}
    </nav>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-rule bg-paper/95 backdrop-blur-[6px]">
      <div className={`${wide} flex h-16 items-center justify-between gap-6`}>
        <Link href={href(lang, "index")} className="flex items-center gap-2 text-[17px] font-semibold tracking-[-0.01em]">
          <EmberMark className="h-5 w-5" /> Ember Court
        </Link>
        <nav className="hidden items-center gap-7 md:flex" aria-label="Main">{links}</nav>
        <div className="hidden items-center gap-6 md:flex">
          {langs}
          <a href={contacts.telegram} className={`${btnPrimary} min-h-10 py-2`}>{labels.cta}</a>
        </div>
        <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-controls="mobile-nav"
          className="-mr-2 grid min-h-11 min-w-11 place-items-center md:hidden">
          <svg aria-hidden viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <motion.path animate={open ? { d: "M6 6 18 18" } : { d: "M4 8h16" }} transition={{ duration: reduce ? 0 : 0.22 }} />
            <motion.path animate={open ? { d: "M6 18 18 6" } : { d: "M4 16h16" }} transition={{ duration: reduce ? 0 : 0.22 }} />
          </svg>
          <span className="sr-only">Menu</span>
        </button>
      </div>
      <ReadingLine />
      <AnimatePresence initial={false}>
        {open && (
          <motion.div id="mobile-nav" className="overflow-hidden border-t border-rule md:hidden"
            initial={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, height: "auto" }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
            transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}>
            <div className={`${wide} flex flex-col gap-2 py-4`}>
              {links}
              <div className="mt-2 flex items-center justify-between border-t border-rule pt-4">
                {langs}
                <a href={contacts.telegram} className={btnPrimary}>{labels.cta}</a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
