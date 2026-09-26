import { AstanaClock } from "./Desk";
import EmberMark from "./EmberMark";
import { wide } from "./ui";

type Clock = { open: string; closed: string; morning: string; monday: string };

/** Signed off like the letters we write: the name in the letter face, the desk hours as a live fact. */
export default function Footer({ tag, clock }: { tag: string; clock: Clock }) {
  return (
    <footer className="border-t border-rule">
      <div className={`${wide} flex flex-wrap items-end justify-between gap-6 py-10`}>
        <div>
          <p className="flex items-center gap-2.5 font-letter text-[22px] text-ink">
            <EmberMark className="h-5 w-5" /> Ember Court
          </p>
          <p className="mt-1.5 text-[14px] text-ink-muted">{tag}</p>
        </div>
        <AstanaClock className="text-[14px] text-ink-muted" text={clock} />
      </div>
    </footer>
  );
}
