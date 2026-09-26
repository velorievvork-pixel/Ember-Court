"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * One observer for the whole site: every [data-inview] element gets [data-in] once it scrolls into view,
 * and the CSS in globals.css plays its entrance. Re-scans after each client-side navigation.
 */
export default function InViewObserver() {
  const pathname = usePathname();
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        // Already scrolled past (e.g. opened at #lead): show it, never leave a hidden block above the reader.
        if (!e.isIntersecting && e.boundingClientRect.bottom > 0) return;
        e.target.setAttribute("data-in", "");
        io.unobserve(e.target);
      }),
      { rootMargin: "0px 0px -12% 0px" },
    );
    document.querySelectorAll("[data-inview]:not([data-in])").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);
  return null;
}
