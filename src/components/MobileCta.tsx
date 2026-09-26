"use client";

import { useEffect, useState } from "react";
import { btnAccent } from "./ui";

/**
 * Phone only: once the reader is past the first screen, the pilot offer stays one tap away at the
 * bottom. It steps aside while the pricing or the form itself is on screen, so it never covers them.
 */
export default function MobileCta({ label, href }: { label: string; href: string }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const covered = new Set<Element>();
    let past = false;
    const update = () => setShow(past && covered.size === 0);
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => (e.isIntersecting ? covered.add(e.target) : covered.delete(e.target)));
      update();
    });
    ["pricing", "lead"].forEach((id) => { const el = document.getElementById(id); if (el) io.observe(el); });
    const onScroll = () => { const p = window.scrollY > window.innerHeight * 0.9; if (p !== past) { past = p; update(); } };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { io.disconnect(); window.removeEventListener("scroll", onScroll); };
  }, []);

  return (
    <div data-show={show || undefined} inert={!show}
      className="mobile-cta fixed inset-x-0 bottom-0 z-30 border-t border-rule bg-paper/95 px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 backdrop-blur-[6px] md:hidden">
      <a href={href} className={`${btnAccent} w-full`}>
        {label}
      </a>
    </div>
  );
}
