"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import EmberMark from "./EmberMark";
import { btnPrimary, wrap } from "./ui";
import { contacts, href, locales, type Locale, type Page } from "@/lib/i18n";

const LANG_LABEL: Record<Locale, string> = { ru: "RU", en: "EN", uk: "UA" };

export default function Header({ lang, page, labels }: {
  lang: Locale; page: Page; labels: { home: string; services: string; clients: string; cta: string; lang: string };
}) {
  const [open, setOpen] = useState(false);

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
    <header className="border-b border-rule">
      <div className={`${wrap} flex h-16 items-center justify-between gap-6`}>
        <Link href={href(lang, "index")} className="flex items-center gap-2 text-[17px] font-semibold tracking-[-0.01em]">
          <EmberMark className="h-5 w-5" /> Ember Court
        </Link>
        <nav className="hidden items-center gap-7 md:flex" aria-label="Main">{links}</nav>
        <div className="hidden items-center gap-6 md:flex">
          {langs}
          <a href={contacts.telegram} className={`${btnPrimary} min-h-10 py-2`}>{labels.cta}</a>
        </div>
        <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-controls="mobile-nav"
          className="-mr-2 min-h-11 px-2 text-[15px] font-medium md:hidden">
          {open ? "×" : "☰"}<span className="sr-only">Menu</span>
        </button>
      </div>
      {open && (
        <div id="mobile-nav" className="border-t border-rule md:hidden">
          <div className={`${wrap} flex flex-col gap-2 py-4`}>
            {links}
            <div className="mt-2 flex items-center justify-between border-t border-rule pt-4">
              {langs}
              <a href={contacts.telegram} className={btnPrimary}>{labels.cta}</a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
