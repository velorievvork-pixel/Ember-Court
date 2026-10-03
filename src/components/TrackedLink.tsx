"use client";

import { track } from "@vercel/analytics";
import type { ReactNode } from "react";

/** A plain link that also counts its clicks in Vercel Web Analytics (custom events; cookieless). */
export default function TrackedLink({ href, event, className, children }: { href: string; event: string; className?: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener" className={className} onClick={() => track(event)}>
      {children}
    </a>
  );
}
