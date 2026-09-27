"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { captureRecipient } from "@/lib/visit";

/**
 * Tells the owner which invited company is reading which page (see src/lib/visit.ts).
 * Fires only for visitors who came by an outreach link, only after 5 s of the page actually being
 * on screen: mail scanners that prefetch links rarely stay that long, and automated browsers are skipped.
 */
export default function VisitBeacon() {
  const pathname = usePathname();
  useEffect(() => {
    const r = captureRecipient(window.location.search);
    if (!r || navigator.webdriver) return;
    let shown = 0;
    let last = document.visibilityState === "visible" ? Date.now() : 0;
    let sent = false;
    const send = () => {
      if (sent) return;
      sent = true;
      const body = JSON.stringify({ r, path: window.location.pathname, ref: document.referrer.slice(0, 200) });
      navigator.sendBeacon?.("/api/hit", new Blob([body], { type: "text/plain" }));
    };
    const tick = setInterval(() => {
      if (document.visibilityState !== "visible") { last = 0; return; }
      const now = Date.now();
      if (last) shown += now - last;
      last = now;
      if (shown >= 5000) { clearInterval(tick); send(); }
    }, 1000);
    return () => clearInterval(tick);
  }, [pathname]);
  return null;
}
