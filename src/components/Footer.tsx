import EmberMark from "./EmberMark";
import { wrap } from "./ui";

export default function Footer({ tag }: { tag: string }) {
  return (
    <footer className="border-t border-rule">
      <div className={`${wrap} flex flex-wrap items-center justify-between gap-4 py-10 text-[14px] text-ink-faint`}>
        <span className="flex items-center gap-2">
          <EmberMark className="h-5 w-5" />
          Ember Court
        </span>
        <span className="font-display text-[17px] italic text-ink-soft">{tag}</span>
      </div>
    </footer>
  );
}
