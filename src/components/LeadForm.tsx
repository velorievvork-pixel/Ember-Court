"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { PenCheck } from "./Pen";
import { btnAccent, btnGhost } from "./ui";

type Labels = {
  name: string; site: string; contact: string; need: string; options: string[]; send: string; sending: string;
  msg: string; ok: string; more: string; done: string; again: string; edit: string;
};

/**
 * The request goes to the owner's Telegram through the site's bot (/api/lead).
 * If that fails for any reason, the form falls back to the old path: Telegram opens with the message prefilled.
 */
export default function LeadForm({ lang, telegram, labels }: { lang: string; telegram: string; labels: Labels }) {
  const [need, setNeed] = useState(labels.options[0]);
  const [state, setState] = useState<"form" | "sending" | "ok" | "fallback">("form");
  const [fallback, setFallback] = useState("");
  const [draft, setDraft] = useState({ name: "", site: "", contact: "" });   // kept for "edit the request"
  const opened = useRef(0);   // when the form was shown; a form filled in under 2.5 s is a bot
  useEffect(() => { opened.current = Date.now(); }, []);
  const reduce = useReducedMotion();

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const v = { name: String(f.get("name") || "").trim(), site: String(f.get("site") || "").trim(), contact: String(f.get("contact") || "").trim() };
    setDraft(v);
    setState("sending");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...v, need, lang, website: f.get("website"), elapsed: Date.now() - opened.current }),
      });
      if (res.ok) return setState("ok");
    } catch { /* fall through to Telegram */ }

    const text = labels.msg.replace("{name}", v.name).replace("{site}", v.site).replace("{contact}", v.contact).replace("{need}", need);
    const url = `${telegram}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener");
    // Say what happened and keep a link: a blocked pop-up must not leave the visitor guessing.
    setFallback(url);
    setState("fallback");
  }

  if (state === "ok" || state === "fallback") {
    return (
      <AnimatePresence>
        <motion.div role="status" initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-[4px] border border-rule bg-sheet px-6 py-7 sm:px-8">
          <p className="flex gap-3 font-letter text-[18px] leading-[1.6] text-ink"><PenCheck className="mt-[2px]" />{state === "ok" ? labels.ok : labels.done}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            {state === "fallback" && <a href={fallback} target="_blank" rel="noopener" className={btnAccent}>{labels.again}</a>}
            <button type="button" onClick={() => { opened.current = Date.now(); setState("form"); }} className={btnGhost}>
              {state === "ok" ? labels.more : labels.edit}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  const field = "mt-1.5 w-full rounded-[8px] border border-rule bg-paper px-4 py-3 text-[15.5px] text-ink focus:border-ember/60 focus:outline-none";
  return (
    <form onSubmit={submit} className="grid gap-4">
      <label className="text-[14px] text-ink-muted">{labels.name}
        <input name="name" required maxLength={80} autoComplete="name" defaultValue={draft.name} className={field} />
      </label>
      <label className="text-[14px] text-ink-muted">{labels.site}
        <input name="site" required maxLength={160} autoComplete="organization" defaultValue={draft.site} className={field} />
      </label>
      <label className="text-[14px] text-ink-muted">{labels.contact}
        <input name="contact" required maxLength={120} autoComplete="tel" defaultValue={draft.contact} className={field} />
      </label>
      {/* Hidden from people; bots that fill every field are dropped on the server. */}
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] h-px w-px opacity-0" />
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
      <button type="submit" disabled={state === "sending"} className={`${btnAccent} mt-2 w-full disabled:opacity-70`}>
        {state === "sending" ? labels.sending : labels.send}
      </button>
    </form>
  );
}
