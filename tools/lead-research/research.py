#!/usr/bin/env python3
"""Lead research for outbound: company websites in, vetted cards and first-message drafts out.

For each site the script collects what a person would check before writing:
signals of interest (open sales/marketing roles, growth language), contacts and channels,
the site's weak spots (via tools/site-audit), and a recommended service. It then drafts a
first message from a template, or with Claude when ANTHROPIC_API_KEY is set (--claude).

Usage:
    python3 research.py https://a.com https://b.com -o leads/
    python3 research.py --input companies.csv -o leads/            # a column named url/site/website
    python3 research.py --input companies.csv -o leads/ --claude   # drafts written by Claude

Output: leads/leads.csv (one row per company, sorted by score) and leads/<domain>.md cards.
Standard library only, except the optional `anthropic` + `pydantic` for --claude.
"""
from __future__ import annotations

import argparse
import csv
import datetime as dt
import importlib.util
import json
import os
import re
import sys
import urllib.parse
from dataclasses import asdict, dataclass, field
from pathlib import Path

_AUDIT = Path(__file__).resolve().parent.parent / "site-audit" / "audit.py"
_spec = importlib.util.spec_from_file_location("site_audit", _AUDIT)
audit_mod = importlib.util.module_from_spec(_spec)
sys.modules["site_audit"] = audit_mod  # dataclasses look the module up while it loads
_spec.loader.exec_module(audit_mod)

# Pages worth opening besides the homepage, matched on link text or URL.
PAGE_HINTS = {
    "careers": r"(career|jobs?|vacanc|hiring|join|вакан|карьер|работа у нас|команд[ау] ищет|вакансі)",
    "about": r"(about|company|о нас|о компании|про нас|команда|team)",
    "contacts": r"(contact|контакт|связаться|зв'язок)",
}
# Roles whose opening means "more leads than the founder can handle".
SALES_ROLES = r"(sales|account executive|business development|bdr|sdr|head of growth|growth|marketing|продаж|менеджер по работе с клиентами|аккаунт|маркетолог|маркетинг|бизнес-девелоп|развити[ея] бизнеса|продажів|маркетолог)"
GROWTH_WORDS = r"(we're hiring|мы растём|растем|расширяемся|new office|новый офис|raised|инвестиц|раунд|series [ab]|seed|запустили|launched)"
EMAIL_RE = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")
PHONE_RE = re.compile(r"(?:\+?\d[\d\s().-]{8,}\d)")
SKIP_EMAIL = re.compile(r"(example|sentry|wixpress|\.png|\.jpg|\.webp|\.svg|@2x|domain\.)", re.I)


@dataclass
class Lead:
    url: str
    domain: str = ""
    name: str = ""
    description: str = ""
    language: str = ""
    reachable: bool = True
    error: str = ""
    signals: list[str] = field(default_factory=list)
    open_roles: list[str] = field(default_factory=list)
    emails: list[str] = field(default_factory=list)
    phones: list[str] = field(default_factory=list)
    channels: dict[str, str] = field(default_factory=dict)
    pages: dict[str, str] = field(default_factory=dict)
    site_issues: list[str] = field(default_factory=list)
    critical_issues: int = 0
    score: int = 0
    service: str = ""
    why: str = ""
    observation: str = ""
    draft: str = ""
    draft_by: str = "template"


class Links(audit_mod.HTMLParser):
    """All <a> tags with their visible text."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.items: list[tuple[str, str]] = []
        self._href: str | None = None
        self._text: list[str] = []

    def handle_starttag(self, tag, attrs):
        if tag == "a":
            self._href = dict(attrs).get("href") or ""
            self._text = []

    def handle_data(self, data):
        if self._href is not None:
            self._text.append(data)

    def handle_endtag(self, tag):
        if tag == "a" and self._href is not None:
            self.items.append((self._href.strip(), " ".join("".join(self._text).split())))
            self._href = None


def _text(html: str) -> str:
    p = audit_mod.Page()
    p.feed(html)
    return " ".join(" ".join(p.text_parts).split())


def _get(url: str) -> tuple[str, str]:
    r = audit_mod.fetch(url, timeout=15)
    if not r.status or r.status >= 400:
        return "", r.final_url
    return r.body.decode(audit_mod._charset(r.headers), errors="replace"), r.final_url


def research(url: str, run_audit: bool = True) -> Lead:
    if not re.match(r"^https?://", url):
        url = "https://" + url
    lead = Lead(url=url, domain=urllib.parse.urlparse(url).hostname or url)
    html, final = _get(url)
    if not html:
        lead.reachable, lead.error = False, "site did not open"
        return lead
    lead.domain = (urllib.parse.urlparse(final).hostname or lead.domain).removeprefix("www.")

    page = audit_mod.Page()
    page.feed(html)
    title_name = page.title.split("|")[0].split("—")[0].split(" - ")[0].strip()
    brand = lead.domain.split(".")[0].replace("-", " ").title()
    # Short page titles like "Work" or "Home" are section names, not the company.
    site_name = page.meta.get("og:site_name", "").strip()
    lead.name = next((n for n in (site_name, title_name) if len(n) > 5), brand)[:80]
    lead.description = (page.meta.get("description") or page.meta.get("og:description") or "").strip()[:300]
    lead.language = page.lang[:2].lower()

    links = Links()
    links.feed(html)
    texts = [_text(html)]
    for kind, pattern in PAGE_HINTS.items():
        for href, label in links.items:
            if re.search(pattern, f"{label} {href}", re.I) and not href.startswith(("mailto:", "tel:", "#")):
                target = urllib.parse.urljoin(final, href)
                if urllib.parse.urlparse(target).hostname and lead.domain in urllib.parse.urlparse(target).hostname:
                    lead.pages[kind] = target
                    break
    for kind, target in lead.pages.items():
        sub, _ = _get(target)
        if sub:
            texts.append(_text(sub))
            if kind == "careers":
                sub_links = Links()
                sub_links.feed(sub)
                roles = {lbl for _, lbl in sub_links.items if 3 < len(lbl) < 90 and re.search(SALES_ROLES, lbl, re.I)}
                heads = re.findall(r"<h[1-4][^>]*>(.*?)</h[1-4]>", sub, re.I | re.S)
                roles |= {re.sub(r"<[^>]+>", "", h).strip() for h in heads if re.search(SALES_ROLES, h, re.I) and len(h) < 200}
                lead.open_roles = sorted(r for r in roles if r)[:6]

    all_text = " ".join(texts)
    all_html_links = [h for h, _ in links.items]

    # Channels and contacts.
    for h in all_html_links:
        low = h.lower()
        for name, needle in (("telegram", "t.me/"), ("whatsapp", "wa.me/"), ("linkedin", "linkedin.com/"), ("instagram", "instagram.com/")):
            if needle in low and name not in lead.channels:
                lead.channels[name] = h
        if low.startswith("mailto:"):
            lead.emails.append(h[7:].split("?")[0])
        if low.startswith("tel:"):
            lead.phones.append(h[4:])
    lead.emails += [e for e in EMAIL_RE.findall(all_text) if not SKIP_EMAIL.search(e)]
    lead.emails = sorted(set(e.lower() for e in lead.emails))[:5]
    if not lead.phones:
        lead.phones = [p.strip() for p in PHONE_RE.findall(all_text) if len(re.sub(r"\D", "", p)) >= 10][:2]
    lead.phones = sorted(set(lead.phones))[:3]

    # Signals.
    if lead.open_roles:
        lead.signals.append("Открыты вакансии в продажах/маркетинге: " + "; ".join(lead.open_roles[:3]))
        lead.score += 4
    elif "careers" in lead.pages:
        lead.signals.append("Есть страница вакансий, ролей в продажах не видно")
        lead.score += 1
    growth = re.findall(GROWTH_WORDS, all_text, re.I)
    if growth:
        lead.signals.append("Слова о росте на сайте: " + ", ".join(sorted(set(g.lower() for g in growth))[:4]))
        lead.score += 2
    if not (lead.channels.get("telegram") or lead.channels.get("whatsapp") or page.forms or lead.emails or lead.phones):
        lead.signals.append("Нет ни формы, ни мессенджера, ни почты: заявки теряются")
        lead.score += 1

    if run_audit:
        try:
            findings, _ = audit_mod.audit(final, check_links=8)
            problems = [f for f in findings if f.level != audit_mod.OK]
            lead.critical_issues = sum(f.level == audit_mod.CRIT for f in problems)
            lead.site_issues = [f"{f.level} {f.title}" for f in problems]
            if lead.critical_issues:
                lead.score += 1
        except Exception as e:  # audit must never stop the research of the rest
            lead.site_issues = [f"аудит не выполнен: {e}"]

    # Recommended service and the observation the first message will open with.
    if lead.open_roles:
        lead.service, lead.why = "outbound", "нанимают в продажи: клиентов больше, чем успевает обработать команда"
        role = lead.open_roles[0]
        lead.observation = {"ru": f"вы ищете сотрудника на позицию «{role}»", "en": f"you're hiring a {role}",
                            "uk": f"ви шукаєте співробітника на позицію «{role}»"}[lang_of(lead)]
    elif (hook := business_hook(lead.site_issues, lang_of(lead), lead.domain)):
        lead.service, lead.why = "audit", "у сайта есть проблема, которую видит и владелец бизнеса"
        lead.observation = hook
    else:
        lead.service, lead.why = "outbound", "явного сигнала нет, повод для первого сообщения нужно найти вручную"
        lead.observation = ""
    return lead


# Site problems a business owner cares about, in priority order: (substring of the audit finding, ru, en, uk).
# Technical findings (redirects, HTML weight, schema.org) are deliberately not used as an opening line, and neither
# is "no reviews": a keyword check can't see a portfolio, and a false claim in a first message burns the lead.
HOOKS = [
    ("закрыта от поисковиков", "сайт закрыт от поисковиков", "the site is hidden from search engines", "сайт закритий від пошуковиків"),
    ("robots.txt запрещает", "сайт закрыт от поисковиков", "the site is hidden from search engines", "сайт закритий від пошуковиків"),
    ("бесплатном адресе", "сайт работает на бесплатном адресе {domain}, а для B2B это снижает доверие",
     "the site runs on a free address ({domain}), which costs trust in B2B", "сайт працює на безкоштовній адресі {domain}, а для B2B це знижує довіру"),
    ("Нет кликабельных контактов", "на сайте нет быстрого способа связаться", "there's no quick way to get in touch on the site", "на сайті немає швидкого способу зв'язатися"),
    ("Нет мобильной адаптации", "сайт не адаптирован под телефон", "the site isn't built for phones", "сайт не адаптований під телефон"),
    ("отвечает медленно", "сайт долго открывается", "the site takes a while to load", "сайт довго відкривається"),
    ("Не видно цен", "на сайте не видно цен, и люди уходят сравнивать", "there are no prices on the site, so people leave to compare", "на сайті не видно цін, і люди йдуть порівнювати"),
    ("Нет картинки превью", "ссылка на сайт в мессенджерах выглядит пустой", "a link to the site looks blank when shared in messengers", "посилання на сайт у месенджерах виглядає порожнім"),
]
LANG_INDEX = {"ru": 1, "en": 2, "uk": 3}


def lang_of(lead) -> str:
    return lead.language if lead.language in LANG_INDEX else "ru"


def business_hook(issues: list[str], lang: str, domain: str) -> str:
    for hook in HOOKS:
        if any(hook[0] in i for i in issues):
            return hook[LANG_INDEX[lang]].format(domain=domain)
    return ""


TEMPLATES = {
    "ru": {
        "outbound": ("Здравствуйте! Увидел, что {observation}. Похоже, клиентов становится больше, чем успевает вести команда.\n\n"
                     "Мы берём на себя именно этот участок: вручную находим компании, которым {name} нужен сейчас, и начинаем разговор. "
                     "Сделку закрываете вы.\n\nКак вы сейчас ищете новых клиентов: через знакомства или уже есть система?"),
        "audit": ("Здравствуйте! Посмотрел сайт {domain} перед тем, как писать. Бросилось в глаза: {observation}.\n\n"
                  "Такие вещи обычно тихо съедают заявки. Могу прислать короткий разбор, 5-7 пунктов и что с каждым сделать. Бесплатно.\n\nПрислать?"),
    },
    "en": {
        "outbound": ("Hi! I noticed {observation}. Looks like there are more leads than the team can handle.\n\n"
                     "That's the part we take on: we find companies that need {name} right now and start the conversation. "
                     "You close the deal.\n\nHow do you find new clients today: referrals, or is there already a system?"),
        "audit": ("Hi! I looked at {domain} before writing. One thing stood out: {observation}.\n\n"
                  "Things like this quietly cost leads. I can send a short review, 5-7 points with a fix for each. Free.\n\nShall I send it?"),
    },
    "uk": {
        "outbound": ("Вітаю! Побачив, що {observation}. Схоже, клієнтів стає більше, ніж встигає вести команда.\n\n"
                     "Ми беремо на себе саме цю ділянку: вручну знаходимо компанії, яким {name} потрібен зараз, і починаємо розмову. "
                     "Угоду закриваєте ви.\n\nЯк ви зараз шукаєте нових клієнтів: через знайомства чи вже є система?"),
        "audit": ("Вітаю! Подивився сайт {domain} перед тим, як писати. Впало в око: {observation}.\n\n"
                  "Такі речі зазвичай тихо з'їдають заявки. Можу надіслати короткий розбір, 5-7 пунктів і що з кожним зробити. Безкоштовно.\n\nНадіслати?"),
    },
}


def draft_template(lead: Lead) -> str:
    if not lead.observation:
        return ""  # nothing concrete to open with: a person has to find the hook
    return TEMPLATES[lang_of(lead)][lead.service].format(observation=lead.observation, name=lead.name or lead.domain, domain=lead.domain)


def draft_claude(leads: list[Lead]) -> None:
    """Writes lead.draft for reachable leads with one Claude call per lead. Leaves the template draft on failure."""
    import anthropic
    from pydantic import BaseModel

    class Draft(BaseModel):
        observation: str
        message: str

    client = anthropic.Anthropic()
    rules = (
        "You write the first outreach message from Ember Court, a small studio that finds B2B clients by hand "
        "(also builds websites and runs website audits). Rules, all mandatory:\n"
        "- Open with one concrete observation about this company taken from the research below. Never invent facts.\n"
        "- Frame the problem as a normal stage of growth, never as a mistake.\n"
        "- One sentence about us. No list of services, no call to book a meeting.\n"
        "- End with one concrete, non-rhetorical question.\n"
        "- 60-90 words, plain language, no clichés like 'I hope this finds you well', no emojis.\n"
        "- Write in the language of the company's site (ru, uk or en); if unknown, write in Russian.\n"
        "Return the observation you opened with and the full message."
    )
    for lead in leads:
        if not lead.reachable:
            continue
        facts = {k: v for k, v in asdict(lead).items() if k in ("name", "domain", "description", "language", "signals", "open_roles", "site_issues", "service", "why")}
        try:
            resp = client.messages.parse(
                model=os.environ.get("LEAD_MODEL", "claude-opus-5"),
                max_tokens=4000,
                thinking={"type": "adaptive"},
                output_config={"effort": "medium"},
                system=rules,
                messages=[{"role": "user", "content": "Research:\n" + json.dumps(facts, ensure_ascii=False, indent=1)}],
                output_format=Draft,
            )
            if resp.stop_reason != "refusal" and resp.parsed_output:
                lead.draft, lead.observation, lead.draft_by = resp.parsed_output.message, resp.parsed_output.observation, "claude"
        except Exception as e:
            print(f"[lead] Claude недоступен для {lead.domain}: {type(e).__name__}: {e}", file=sys.stderr)


def card(lead: Lead) -> str:
    out = [f"# {lead.name or lead.domain}", "", f"_{dt.date.today():%d.%m.%Y} · {lead.url}_", ""]
    if not lead.reachable:
        return "\n".join(out + [f"Сайт не открылся: {lead.error}", ""])
    out += [f"**Оценка:** {lead.score} · **Предлагаем:** {lead.service} ({lead.why})", ""]
    if lead.description:
        out += [f"> {lead.description}", ""]
    out += ["## Сигналы", *(f"- {s}" for s in lead.signals or ["Явных сигналов не найдено, проверить вручную"]), ""]
    out += ["## Контакты"]
    out += [f"- Почта: {', '.join(lead.emails)}"] if lead.emails else []
    out += [f"- Телефон: {', '.join(lead.phones)}"] if lead.phones else []
    out += [f"- {k.capitalize()}: {v}" for k, v in lead.channels.items()]
    out += [f"- Страница «{k}»: {v}" for k, v in lead.pages.items()]
    if not (lead.emails or lead.phones or lead.channels):
        out.append("- Не найдены, искать ЛПР в LinkedIn / реестре")
    out += ["", "## Сайт", *(f"- {i}" for i in lead.site_issues[:8] or ["Серьёзных проблем не найдено"]), ""]
    out += [f"## Черновик первого сообщения ({lead.draft_by})", "", lead.draft or "_Нет конкретного повода: найдите его вручную (новость, вакансия, запуск продукта) или запустите с --claude._", "",
            "## Перед отправкой проверить вручную",
            "- Кто принимает решение и как его зовут; обратиться по имени.",
            "- Сигнал ещё актуален (вакансия открыта, новость свежая).",
            "- Компания не часть холдинга и не наш текущий клиент.", ""]
    return "\n".join(out)


def read_input(path: Path) -> list[str]:
    text = path.read_text(encoding="utf-8-sig")
    if path.suffix.lower() == ".csv":
        rows = list(csv.DictReader(text.splitlines()))
        if rows:
            key = next((k for k in rows[0] if k and k.strip().lower() in ("url", "site", "website", "сайт", "domain")), None)
            if key:
                return [r[key].strip() for r in rows if r.get(key, "").strip()]
    return [line.strip() for line in text.splitlines() if line.strip() and not line.startswith("#")]


def main(argv=None) -> None:
    ap = argparse.ArgumentParser(description="Исследование лидов для outbound")
    ap.add_argument("urls", nargs="*", help="сайты компаний")
    ap.add_argument("--input", type=Path, help="CSV с колонкой url/site/website или текстовый файл по сайту в строке")
    ap.add_argument("-o", "--output", type=Path, default=Path("leads"))
    ap.add_argument("--claude", action="store_true", help="черновики пишет Claude (нужен ANTHROPIC_API_KEY)")
    ap.add_argument("--no-audit", action="store_true", help="не проверять сайт (быстрее)")
    a = ap.parse_args(argv)

    urls = list(a.urls) + (read_input(a.input) if a.input else [])
    if not urls:
        ap.error("укажите сайты или --input")
    a.output.mkdir(parents=True, exist_ok=True)

    leads = []
    for i, u in enumerate(dict.fromkeys(urls), 1):
        print(f"[lead] {i}/{len(urls)} {u}", file=sys.stderr, flush=True)
        lead = research(u, run_audit=not a.no_audit)
        if lead.reachable:
            lead.draft = draft_template(lead)
        leads.append(lead)
    if a.claude:
        draft_claude(leads)

    leads.sort(key=lambda l: (-l.reachable, -l.score))
    for lead in leads:
        (a.output / f"{lead.domain.replace(':', '_')}.md").write_text(card(lead), encoding="utf-8")
    cols = ["score", "domain", "name", "service", "signals", "open_roles", "emails", "phones", "channels", "critical_issues", "draft_by", "draft", "url", "error"]
    with (a.output / "leads.csv").open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(cols)
        for lead in leads:
            d = asdict(lead)
            w.writerow(["; ".join(d[c]) if isinstance(d[c], list) else
                        "; ".join(f"{k}: {v}" for k, v in d[c].items()) if isinstance(d[c], dict) else d[c] for c in cols])
    ok = sum(l.reachable for l in leads)
    print(f"[lead] Готово: {ok} из {len(leads)} сайтов, результаты в {a.output}/", file=sys.stderr)


if __name__ == "__main__":
    main()
