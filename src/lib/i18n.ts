import ru from "@/content/ru.json";
import en from "@/content/en.json";
import uk from "@/content/uk.json";

export const locales = ["ru", "en", "uk"] as const;
export type Locale = (typeof locales)[number];
export type Page = "index" | "services" | "clients";

const dictionaries = { ru, en, uk };

export const isLocale = (v: string): v is Locale => (locales as readonly string[]).includes(v);

/** Translator for one page: t("hero.sub"). Falls back to Russian so a missing key never renders empty. */
export function getT(lang: Locale, page: Page) {
  const d = dictionaries[lang][page] as Record<string, string>;
  const fallback = dictionaries.ru[page] as Record<string, string>;
  return (key: string) => d[key] ?? fallback[key] ?? key;
}

/** Public URLs stay what they were on the static site: /, /services.html, /clients.html (+ /en, /uk prefixes). */
export function href(lang: Locale, page: Page, hash = ""): string {
  const prefix = lang === "ru" ? "" : `/${lang}`;
  const path = page === "index" ? prefix || "/" : `${prefix}/${page}.html`;
  return path + hash;
}

export const SITE = "https://ember-court.vercel.app";

export const contacts = {
  telegram: "https://t.me/veloriev",
  telegramHandle: "@veloriev",
  email: "velorievvork@gmail.com",
  whatsapp: "https://wa.me/393290890590",
  whatsappLabel: "+39 329 089 05 90",
};

const auditText: Record<Locale, string> = {
  ru: "Здравствуйте! Хочу бесплатный аудит сайта: ",
  en: "Hi! I'd like a free website audit: ",
  uk: "Вітаю! Хочу безкоштовний аудит сайту: ",
};
export const auditLink = (lang: Locale) => `${contacts.telegram}?text=${encodeURIComponent(auditText[lang])}`;

export const descriptions: Record<Locale, Record<Page, string>> = {
  ru: {
    index: "Приводим B2B-клиентов в Казахстане и СНГ: находим компании, которые сейчас нанимают под вашу задачу, и пишем руководителю в WhatsApp и на почту. Пилот на 2 недели — $250.",
    services: "Outbound-поток, сайты, видео, соцсети, аудит сайта, Telegram-боты и автоматизация заявок для B2B-компаний. Процесс и планка качества.",
    clients: "С кем работает Ember Court: outbound-поток для Camirix и критерии, кому подходит сотрудничество.",
  },
  en: {
    index: "We bring B2B clients in Kazakhstan and Central Asia: companies hiring for the job your product does, messaged on WhatsApp and by email. 2-week pilot for $250.",
    services: "Outbound, websites, video, social media, website audits, Telegram bots and lead automation for B2B companies. Process and quality bar.",
    clients: "Who Ember Court works with: outbound for Camirix, and who our work is a fit for.",
  },
  uk: {
    index: "Приводимо B2B-клієнтів у Казахстані та Центральній Азії: компанії, які зараз наймають під ваше завдання, пишемо керівнику у WhatsApp і на пошту. Пілот на 2 тижні — $250.",
    services: "Outbound-потік, сайти, відео, соцмережі, аудит сайту, Telegram-боти й автоматизація заявок для B2B-компаній. Процес і планка якості.",
    clients: "З ким працює Ember Court: outbound-потік для Camirix і критерії, кому підходить співпраця.",
  },
};

export const langLabel: Record<Locale, string> = { ru: "Язык", en: "Language", uk: "Мова" };
