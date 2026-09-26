/** Logo: the coal as a single red drop. Brand mark, not an icon. */
export default function EmberMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={`ember-mark ${className}`}>
      <path d="M12 2.5C8.6 5.2 6.5 8.6 6.9 12.6c.4 4.3 3 7.4 5.1 7.4s4.7-3.1 5.1-7.4c.4-4-1.7-7.4-5.1-10.1Z" fill="#F0766B" />
    </svg>
  );
}
