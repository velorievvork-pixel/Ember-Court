"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState, type FormEvent } from "react";
import { PenCheck } from "./Pen";
import { btnAccent, btnGhost } from "./ui";

/** No backend needed: the form composes a message and opens the Telegram chat with it prefilled. */
export default function LeadForm({ telegram, labels }: {
  telegram: string;
  labels: { name: string; site: string; need: string; options: string[]; send: string; msg: string; done: string; again: string; edit: string };
}) {
  const [need, setNeed] = useState(labels.options[0]);
  const [sent, setSent] = useState<string | null>(null);
  const [draft, setDraft] = useState({ name: "", site: "" });   // kept for "edit the request"
  const reduce = useReducedMotion();

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setDraft({ name: String(f.get("name") || ""), site: String(f.get("site") || "") });
    const text = labels.msg
      .replace("{name}", String(f.get("name") || "").trim())
      .replace("{site}", String(f.get("site") || "").trim())
      .replace("{need}", need);
    const url = `${telegram}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener");
    // Say what happened and keep a link: a blocked pop-up must not leave the visitor guessing.
    setSent(url);
  }

  if (sent) {
    return (
      <AnimatePresence>
        <motion.div role="status" initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-[4px] border border-rule bg-sheet px-6 py-7 sm:px-8">
          <p className="flex gap-3 font-letter text-[18px] leading-[1.6] text-ink"><PenCheck className="mt-[2px]" />{labels.done}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a href={sent} target="_blank" rel="noopener" className={btnAccent}>{labels.again}</a>
            <button type="button" onClick={() => setSent(null)} className={btnGhost}>{labels.edit}</button>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  const field = "mt-1.5 w-full rounded-[8px] border border-rule bg-paper px-4 py-3 text-[15.5px] text-ink focus:border-ember/60 focus:outline-none";
  return (
    <form onSubmit={submit} className="grid gap-4">
      <label className="text-[14px] text-ink-muted">{labels.name}
        <input name="name" required autoComplete="name" defaultValue={draft.name} className={field} />
      </label>
      <label className="text-[14px] text-ink-muted">{labels.site}
        <input name="site" required autoComplete="organization" defaultValue={draft.site} className={field} />
      </label>
      <fieldset>
        <legend className="text-[14px] text-ink-muted">{labels.need}</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {labels.options.map((o) => (
            <button type="button" key={o} onClick={() => setNeed(o)} aria-pressed={need === o}
              className="rounded-full border border-rule px-3.5 py-2 text-[14px] text-ink-muted transition-colors hover:text-ink aria-[pressed=true]:border-ink aria-[pressed=true]:text-ink">
              {o}
            </button>
          ))}
        </div>
      </fieldset>
      <button type="submit" className={`${btnAccent} mt-2 w-full`}>{labels.send}</button>
    </form>
  );
}
