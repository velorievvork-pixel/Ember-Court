"use client";

import Link from "next/link";
import { useState } from "react";
import { List, X } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import EmberMark from "./EmberMark";
import { btnPrimary, wrap } from "./ui";
import { contacts, href, locales, type Locale, type Page } from "@/lib/i18n";

const LANG_LABEL: Record<Locale, string> = { ru: "RU", en: "EN", uk: "UA" };

export default function Header({ lang, page, labels }: {
  lang: Locale; page: Page; labels: { home: string; services: string; clients: string; cta: string; lang: string };
}) {
  const [open, setOpen] = useState(false);
  const nav: [Page, string][] = [["index", labels.home], ["services", labels.services], ["clients", labels.clients]];

  const links = (onClick?: () => void) =>
    nav.map(([p, label]) => (
      <Link key={p} href={href(lang, p)} onClick={onClick} aria-current={p === page ? "page" : undefined}
        className="text-[15px] text-ink-soft transition-colors hover:text-ink aria-[current=page]:text-ember">
        {label}
      </Link>
    ));

  const langs = (
    <nav aria-label={labels.lang} className="flex items-center gap-1 font-mono text-[12px]">
      {locales.map((l) => (
        <a key={l} href={href(l, page)} hrefLang={l} lang={l}
          aria-current={l === lang ? "true" : undefined}
          className="rounded-[2px] px-2 py-1 text-ink-faint transition-colors hover:text-ink aria-[current=true]:bg-panel aria-[current=true]:text-ember">
          {LANG_LABEL[l]}
        </a>
      ))}
    </nav>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-rule/70 bg-ground/75 backdrop-blur-md">
      <div className={`${wrap} flex h-16 items-center justify-between gap-6`}>
        <Link href={href(lang, "index")} className="flex items-center gap-2.5" aria-label="Ember Court">
          <EmberMark className="h-7 w-7" />
          <span className="font-display text-[21px] font-semibold tracking-[0.02em]">Ember Court</span>
        </Link>
        <nav className="hidden items-center gap-7 md:flex">{links()}</nav>
        <div className="hidden items-center gap-4 md:flex">
          {langs}
          <a href={contacts.telegram} className={`${btnPrimary} px-5 py-2 text-[14px]`}>{labels.cta}</a>
        </div>
        <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-controls="mobile-nav"
          className="-mr-2 p-2 text-ink md:hidden" aria-label="Menu">
          {open ? <X size={24} weight="light" /> : <List size={24} weight="light" />}
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div id="mobile-nav" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }} className="border-t border-rule bg-ground md:hidden">
            <div className={`${wrap} flex flex-col gap-5 py-6`}>
              {links(() => setOpen(false))}
              <div className="flex items-center justify-between pt-2">
                {langs}
                <a href={contacts.telegram} className={`${btnPrimary} px-5 py-2 text-[14px]`}>{labels.cta}</a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
