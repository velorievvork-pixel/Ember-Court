"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { PenCheck } from "./Pen";
import { btnAccent } from "./ui";

/** Eight open questions; answers go to the owner's Telegram through /api/brief. */
export default function BriefForm({ lang, questions, labels }: {
  lang: string; questions: string[]; labels: { send: string; sending: string; ok: string; fail: string };
}) {
  const [state, setState] = useState<"form" | "sending" | "ok" | "fail">("form");
  const opened = useRef(0);
  useEffect(() => { opened.current = Date.now(); }, []);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setState("sending");
    try {
      const res = await fetch("/api/brief", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...Object.fromEntries(f), lang, elapsed: Date.now() - opened.current }),
      });
      setState(res.ok ? "ok" : "fail");
    } catch {
      setState("fail");
    }
  }

  if (state === "ok") {
    return (
      <div role="status" className="fade-up rounded-[4px] border border-rule bg-sheet px-6 py-7 sm:px-8">
        <p className="flex gap-3 font-letter text-[18px] leading-[1.6] text-ink"><PenCheck className="mt-[2px]" />{labels.ok}</p>
      </div>
    );
  }

  const field = "mt-1.5 w-full rounded-[8px] border border-rule bg-paper px-4 py-3 text-[15.5px] leading-[1.5] text-ink focus:border-ember/60 focus:outline-none";
  return (
    <form onSubmit={submit} className="grid gap-5">
      {questions.map((q, i) => (
        <label key={q} className="text-[15px] text-ink">
          <span className="mr-2 text-ink-muted tabular-nums">{i + 1}.</span>{q}
          <textarea name={`q${i + 1}`} rows={i === 0 || i === 6 ? 1 : 2} maxLength={450}
            required={i === 0 || i === 7} className={`${field} resize-y`} />
        </label>
      ))}
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] h-px w-px opacity-0" />
      {state === "fail" && <p role="alert" className="text-[15px] text-pen-ink">{labels.fail}</p>}
      <button type="submit" disabled={state === "sending"} className={`${btnAccent} mt-1 w-full sm:w-auto disabled:opacity-70`}>
        {state === "sending" ? labels.sending : labels.send}
      </button>
    </form>
  );
}
