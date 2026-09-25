"use client";

import { Send } from "lucide-react";
import { useState, type FormEvent } from "react";
import { btnAccent } from "./ui";

/** No backend needed: the form composes a message and opens the Telegram chat with it prefilled. */
export default function LeadForm({ telegram, labels }: {
  telegram: string;
  labels: { name: string; site: string; need: string; options: string[]; send: string; msg: string };
}) {
  const [need, setNeed] = useState(labels.options[0]);

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const text = labels.msg
      .replace("{name}", String(f.get("name") || "").trim())
      .replace("{site}", String(f.get("site") || "").trim())
      .replace("{need}", need);
    window.open(`${telegram}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  }

  const field = "mt-1.5 w-full rounded-[10px] border border-rule bg-paper px-4 py-3 text-[15.5px] text-ink placeholder:text-ink-muted/70 focus:border-ember/60 focus:outline-none";
  return (
    <form onSubmit={submit} className="grid gap-4">
      <label className="text-[14px] text-ink-muted">{labels.name}
        <input name="name" required autoComplete="name" className={field} />
      </label>
      <label className="text-[14px] text-ink-muted">{labels.site}
        <input name="site" required autoComplete="organization" className={field} />
      </label>
      <fieldset>
        <legend className="text-[14px] text-ink-muted">{labels.need}</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {labels.options.map((o) => (
            <button type="button" key={o} onClick={() => setNeed(o)} aria-pressed={need === o}
              className="rounded-full border border-rule px-3.5 py-2 text-[14px] text-ink-muted transition-colors hover:text-ink aria-[pressed=true]:border-ember/60 aria-[pressed=true]:bg-ember/10 aria-[pressed=true]:text-ink">
              {o}
            </button>
          ))}
        </div>
      </fieldset>
      <button type="submit" className={`${btnAccent} mt-2 w-full`}><Send size={18} /> {labels.send}</button>
    </form>
  );
}
