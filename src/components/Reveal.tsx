"use client";

import { motion, type Variants } from "motion/react";
import type { ReactNode } from "react";

const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

/** Fades a block in once when it scrolls into view. Children marked <RevealItem> stagger by 60 ms. */
export function Reveal({ children, className, as = "div", stagger = false }: {
  children: ReactNode; className?: string; as?: "div" | "section" | "ul" | "ol"; stagger?: boolean;
}) {
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      variants={stagger ? { hidden: {}, shown: { transition: { staggerChildren: 0.06 } } } : item}
    >
      {children}
    </Tag>
  );
}

export function RevealItem({ children, className, as = "div" }: {
  children: ReactNode; className?: string; as?: "div" | "li" | "article";
}) {
  const Tag = motion[as];
  return <Tag className={className} variants={item}>{children}</Tag>;
}
