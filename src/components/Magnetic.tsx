"use client";

import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import type { ReactNode, PointerEvent } from "react";

/** Link that leans up to 6 px toward the pointer. Motion values only, no React re-renders. */
export default function Magnetic({ href, children, className, external = false }: {
  href: string; children: ReactNode; className?: string; external?: boolean;
}) {
  const reduce = useReducedMotion();
  const x = useSpring(useMotionValue(0), { stiffness: 260, damping: 18 });
  const y = useSpring(useMotionValue(0), { stiffness: 260, damping: 18 });

  function move(e: PointerEvent<HTMLAnchorElement>) {
    if (reduce || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    x.set(((e.clientX - r.left) / r.width - 0.5) * 12);
    y.set(((e.clientY - r.top) / r.height - 0.5) * 12);
  }
  function leave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.a
      href={href}
      className={className}
      style={{ x, y }}
      onPointerMove={move}
      onPointerLeave={leave}
      whileTap={{ scale: 0.97 }}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
    </motion.a>
  );
}
