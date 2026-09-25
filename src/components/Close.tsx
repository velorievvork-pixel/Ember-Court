import { EnvelopeSimple, TelegramLogo, WhatsappLogo } from "@phosphor-icons/react/dist/ssr";
import EmberMark from "./EmberMark";
import Magnetic from "./Magnetic";
import { Reveal } from "./Reveal";
import { btnPrimary, h2, wrap } from "./ui";
import { contacts } from "@/lib/i18n";

/** Final contact block shared by all pages. */
export default function Close({ heading, line, alt, extra }: {
  heading: string; line: string; alt: string; extra?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-t border-rule">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[60%] bg-[radial-gradient(ellipse_60%_80%_at_50%_100%,rgba(255,107,53,0.14),transparent_70%)]" />
      <Reveal className={`${wrap} relative flex flex-col items-center py-28 text-center sm:py-36`}>
        <EmberMark glow className="mb-8 h-20 w-20 animate-flicker" />
        <h2 className={`${h2} max-w-[20ch]`}>{heading}</h2>
        <p className="mt-5 max-w-[56ch] text-[17px] leading-relaxed text-ink-soft">{line}</p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-4">
          <Magnetic href={contacts.telegram} className={btnPrimary} external>
            <TelegramLogo size={18} weight="fill" /> Telegram {contacts.telegramHandle}
          </Magnetic>
          <a href={`mailto:${contacts.email}`} className="inline-flex items-center gap-2 text-[15px] text-ink-soft hover:text-ember-core">
            <EnvelopeSimple size={18} weight="light" /> {contacts.email}
          </a>
          <a href={contacts.whatsapp} className="inline-flex items-center gap-2 text-[15px] text-ink-soft hover:text-ember-core">
            <WhatsappLogo size={18} weight="light" /> {contacts.whatsappLabel}
          </a>
        </div>
        {extra}
        <p className="mt-8 text-[13px] text-ink-faint">{alt}</p>
      </Reveal>
    </section>
  );
}
