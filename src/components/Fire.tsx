"use client";

import { useEffect, useRef } from "react";
import { createBlaze } from "@/lib/blaze";

/** WebGL fire behind the hero. Stops off-screen and respects reduced motion (handled inside blaze). */
export default function Fire({ className = "" }: { className?: string }) {
  const out = useRef<HTMLCanvasElement>(null);
  const src = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!out.current || !src.current) return;
    const inst = createBlaze(
      { source: src.current, content: out.current, output: out.current },
      {
        height: 0.72, sparks: 0.6, sparkDensity: 1.6, sparkSize: 1.2, layers: 5,
        smoke: 0.3, glow: 1.5, speed: 0.8, sparkColor: [1, 0.55, 0.2], smokeColor: [1, 0.42, 0.21],
      },
    );
    return () => inst?.destroy();
  }, []);

  return (
    <>
      <canvas ref={out} aria-hidden className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} />
      <canvas ref={src} hidden />
    </>
  );
}
