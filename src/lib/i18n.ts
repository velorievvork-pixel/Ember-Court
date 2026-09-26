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
/** Texts for the live Astana clock (header note and footer), from the index dictionary. */
export function clockText(lang: Locale) {
  const t = getT(lang, "index");
  return { open: t("clock.open"), closed: t("clock.closed"), morning: t("clock.morning"), monday: t("clock.monday") };
}

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
    services: "Outbound для B2B в Казахстане и СНГ: как находим, проверяем и пишем, каналы и цены. Плюс сайты, боты для заявок, аудит и видео.",
    clients: "Клиент Ember Court — Camirix: задача, каналы и результат первой недели. И кому мы подходим.",
  },
  en: {
    index: "We bring B2B clients in Kazakhstan and Central Asia: companies hiring for the job your product does, messaged on WhatsApp and by email. 2-week pilot for $250.",
    services: "B2B outbound in Kazakhstan and Central Asia: how we find, vet and write, channels and prices. Plus websites, lead bots, audits and video.",
    clients: "Ember Court's client Camirix: the task, channels and first-week result. And who we fit.",
  },
  uk: {
    index: "Приводимо B2B-клієнтів у Казахстані та Центральній Азії: компанії, які зараз наймають під ваше завдання, пишемо керівнику у WhatsApp і на пошту. Пілот на 2 тижні — $250.",
    services: "Outbound для B2B у Казахстані та Центральній Азії: як знаходимо, перевіряємо й пишемо, канали й ціни. Плюс сайти, боти для заявок, аудит і відео.",
    clients: "Клієнт Ember Court — Camirix: завдання, канали й результат першого тижня. І кому ми підходимо.",
  },
};

export const langLabel: Record<Locale, string> = { ru: "Язык", en: "Language", uk: "Мова" };
