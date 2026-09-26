import { btnPrimary, h2, link, muted, section, wrap } from "./ui";
import { contacts } from "@/lib/i18n";

/** Final contact block shared by all pages: one primary action, two plain alternatives. */
export default function Contacts({ heading, line, alt, cta, or }: {
  heading: string; line: string; alt: string; cta: string; or: string;
}) {
  return (
    <section id="contact" className={`border-t border-rule ${section}`}>
      <div className={`${wrap} grid gap-8 md:grid-cols-12`}>
        <div className="md:col-span-6">
          <h2 className={h2}>{heading}</h2>
          <p className={`${muted} mt-4 max-w-[52ch]`}>{line}</p>
        </div>
        <div className="flex flex-col items-start gap-4 md:col-span-5 md:col-start-8 md:pt-2">
          <a href={contacts.telegram} className={btnPrimary}>{cta}</a>
          <p className="text-[15px] text-ink-muted">
            {or} <a className={`${link} text-ink`} href={`mailto:${contacts.email}`}>{contacts.email}</a>
            {", "}
            <a className={`${link} text-ink`} href={contacts.whatsapp}>WhatsApp {contacts.whatsappLabel}</a>
          </p>
          <p className="text-[14px] text-ink-muted">{alt}</p>
        </div>
      </div>
    </section>
  );
}
