import { useId } from "react";

/** The coal mark: brand logo, not an icon, so it stays a custom SVG. */
export default function EmberMark({ className = "", glow = false }: { className?: string; glow?: boolean }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 120 120" aria-hidden className={className}>
      <defs>
        <radialGradient id={`c${id}`} cx="42%" cy="38%" r="65%">
          <stop offset="0%" stopColor="#FFE3B0" />
          <stop offset="30%" stopColor="#FF9A3D" />
          <stop offset="68%" stopColor="#D9491F" />
          <stop offset="100%" stopColor="#4A1B0C" />
        </radialGradient>
        <radialGradient id={`g${id}`} cx="50%" cy="58%" r="55%">
          <stop offset="0%" stopColor="#FFCB7A" stopOpacity="0.5" />
          <stop offset="45%" stopColor="#FF7A33" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#FF7A33" stopOpacity="0" />
        </radialGradient>
      </defs>
      {glow && <circle cx="60" cy="64" r="56" fill={`url(#g${id})`} />}
      <circle cx="60" cy="64" r="26" fill="#2A0F06" />
      <path d="M60 30 C 47 40, 40 52, 42 66 C 44 80, 55 90, 60 90 C 65 90, 76 80, 78 66 C 80 52, 73 40, 60 30 Z" fill={`url(#c${id})`} />
    </svg>
  );
}
