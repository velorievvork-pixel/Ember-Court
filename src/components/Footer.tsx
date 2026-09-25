import EmberMark from "./EmberMark";
import { wrap } from "./ui";

export default function Footer({ tag }: { tag: string }) {
  return (
    <footer className="border-t border-rule">
      <div className={`${wrap} flex flex-wrap items-center justify-between gap-4 py-8 text-[14px] text-ink-muted`}>
        <span className="flex items-center gap-2 text-ink">
          <EmberMark className="h-4 w-4" /> Ember Court
        </span>
        <span>{tag}</span>
      </div>
    </footer>
  );
}
