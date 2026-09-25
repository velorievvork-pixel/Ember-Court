#!/usr/bin/env python3
"""Website audit: checks a page the way a new client and a search engine see it
and writes a prioritised Markdown report in Russian.

Usage:
    python3 audit.py https://example.com                 # full report to stdout
    python3 audit.py https://example.com --express       # top 7 problems only
    python3 audit.py https://example.com -o report.md    # save to a file

Standard library only, so it runs anywhere Python 3.9+ is installed.
"""
from __future__ import annotations

import argparse
import datetime as dt
import re
import ssl
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass, field
from html.parser import HTMLParser

UA = "Mozilla/5.0 (compatible; EmberCourtAudit/1.0; +https://ember-court.vercel.app)"
MOBILE_UA = ("Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 "
             "(KHTML, like Gecko) Chrome/126.0 Mobile Safari/537.36")
FREE_HOSTS = ("vercel.app", "netlify.app", "github.io", "tilda.ws", "wixsite.com",
              "webflow.io", "pages.dev", "herokuapp.com", "onrender.com", "ucoz", "narod.ru")
ANALYTICS = {
    "Google Analytics": ("googletagmanager.com", "google-analytics.com", "gtag("),
    "Яндекс Метрика": ("mc.yandex.ru", "ym("),
    "Vercel Analytics": ("/_vercel/insights", "va.vercel-scripts.com"),
    "Plausible": ("plausible.io",),
    "Meta Pixel": ("connect.facebook.net", "fbq("),
}

CRIT, WARN, OK = "🔴", "🟡", "🟢"
RANK = {CRIT: 0, WARN: 1, OK: 2}


@dataclass
class Finding:
    level: str
    block: str
    title: str
    why: str = ""
    fix: str = ""


@dataclass
class Fetched:
    url: str
    final_url: str
    status: int
    body: bytes
    headers: dict
    seconds: float
    error: str = ""


def fetch(url: str, ua: str = UA, method: str = "GET", timeout: int = 20) -> Fetched:
    req = urllib.request.Request(url, headers={"User-Agent": ua, "Accept-Language": "ru,en;q=0.8"}, method=method)
    ctx = ssl.create_default_context()
    t0 = time.monotonic()
    try:
        with urllib.request.urlopen(req, timeout=timeout, context=ctx) as r:
            body = r.read() if method == "GET" else b""
            return Fetched(url, r.geturl(), r.status, body, {k.lower(): v for k, v in r.headers.items()},
                           time.monotonic() - t0)
    except urllib.error.HTTPError as e:
        return Fetched(url, e.geturl() or url, e.code, e.read() if method == "GET" else b"",
                       {k.lower(): v for k, v in (e.headers or {}).items()}, time.monotonic() - t0)
    except Exception as e:  # network errors, TLS errors, timeouts
        return Fetched(url, url, 0, b"", {}, time.monotonic() - t0, error=str(e))


class Page(HTMLParser):
    """Collects the handful of things the audit looks at."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.lang = ""
        self.title = ""
        self.meta: dict[str, str] = {}
        self.links: list[dict] = []          # <link>
        self.anchors: list[str] = []         # <a href>
        self.images: list[dict] = []
        self.scripts: list[dict] = []
        self.headings: dict[str, list[str]] = {f"h{i}": [] for i in range(1, 7)}
        self.forms = 0
        self.inputs = 0
        self.ld_json = 0
        self.text_parts: list[str] = []
        self._stack: list[str] = []
        self._in_title = False
        self._heading: str | None = None
        self._heading_text: list[str] = []
        self._skip = 0

    def handle_starttag(self, tag, attrs):
        a = {k: (v or "") for k, v in attrs}
        if tag == "html":
            self.lang = a.get("lang", "")
        elif tag == "title":
            self._in_title = True
        elif tag == "meta":
            key = (a.get("name") or a.get("property") or a.get("http-equiv") or "").lower()
            if key:
                self.meta[key] = a.get("content", "")
            if "charset" in a:
                self.meta["charset"] = a["charset"]
        elif tag == "link":
            self.links.append(a)
        elif tag == "a" and a.get("href"):
            self.anchors.append(a["href"].strip())
        elif tag == "img":
            self.images.append(a)
        elif tag == "script":
            self.scripts.append(a)
            if a.get("type") == "application/ld+json":
                self.ld_json += 1
            self._skip += 1
        elif tag == "style":
            self._skip += 1
        elif tag in self.headings:
            self._heading, self._heading_text = tag, []
        elif tag == "form":
            self.forms += 1
        elif tag in ("input", "textarea", "select"):
            if a.get("type", "text") not in ("hidden", "submit", "button"):
                self.inputs += 1

    def handle_endtag(self, tag):
        if tag == "title":
            self._in_title = False
        elif tag in ("script", "style") and self._skip:
            self._skip -= 1
        elif tag == self._heading:
            self.headings[tag].append(" ".join("".join(self._heading_text).split()))
            self._heading = None

    def handle_data(self, data):
        if self._in_title:
            self.title += data
        if self._skip:
            return
        if self._heading:
            self._heading_text.append(data)
        self.text_parts.append(data)

    @property
    def words(self) -> int:
        return len(re.findall(r"\w+", " ".join(self.text_parts)))


def audit(url: str, check_links: int = 25) -> tuple[list[Finding], dict]:
    if not re.match(r"^https?://", url):
        url = "https://" + url
    F: list[Finding] = []
    add = lambda *a: F.append(Finding(*a))

    r = fetch(url)
    info = {"url": url, "final_url": r.final_url, "status": r.status, "seconds": r.seconds}
    if r.status == 0:
        add(CRIT, "Техника", "Сайт не открывается", f"Ошибка: {r.error}",
            "Проверить хостинг, домен и SSL-сертификат.")
        return F, info
    if r.status >= 400:
        add(CRIT, "Техника", f"Главная страница отвечает ошибкой {r.status}",
            "Клиенты и поисковики видят ошибку вместо сайта.", "Проверить сервер и адрес страницы.")

    html = r.body.decode(_charset(r.headers), errors="replace")
    p = Page()
    p.feed(html)
    host = urllib.parse.urlparse(r.final_url).hostname or ""
    base = r.final_url

    # ---------- Техника ----------
    if not r.final_url.startswith("https://"):
        add(CRIT, "Техника", "Сайт работает без HTTPS",
            "Браузер помечает сайт как «Не защищён», часть людей сразу уходит.",
            "Включить SSL-сертификат (у большинства хостингов бесплатно) и редирект на https.")
    elif url.startswith("https://"):
        http = fetch("http://" + url[len("https://"):], method="HEAD", timeout=10)
        if http.status and not http.final_url.startswith("https://"):
            add(WARN, "Техника", "Адрес с http:// не перенаправляется на https://",
                "Часть посетителей и ссылок попадает на незащищённую версию.", "Настроить 301-редирект на https.")

    if r.seconds > 3:
        add(CRIT, "Техника", f"Сервер отвечает медленно: {r.seconds:.1f} с",
            "Больше половины мобильных посетителей уходят, если страница грузится дольше 3 секунд.",
            "Кэширование, CDN, более быстрый хостинг.")
    elif r.seconds > 1.2:
        add(WARN, "Техника", f"Ответ сервера {r.seconds:.1f} с — можно быстрее",
            "Скорость влияет и на поведение людей, и на позиции в поиске.", "Кэширование или CDN.")
    else:
        add(OK, "Техника", f"Сервер отвечает быстро ({r.seconds:.2f} с)")

    kb = len(r.body) / 1024
    if kb > 500:
        add(WARN, "Техника", f"Тяжёлый HTML: {kb:.0f} КБ",
            "На мобильном интернете страница будет открываться долго.", "Убрать встроенные данные и лишний код.")

    if not p.meta.get("viewport"):
        add(CRIT, "Мобильная версия", "Нет мобильной адаптации (meta viewport)",
            "На телефоне сайт показывается мелко, как уменьшенная копия компьютерной версии. Большинство заходит именно с телефона.",
            'Добавить <meta name="viewport" content="width=device-width, initial-scale=1"> и адаптивную вёрстку.')
    else:
        add(OK, "Мобильная версия", "Есть meta viewport")

    blocking = [s for s in p.scripts if s.get("src") and "async" not in s and "defer" not in s
                and s.get("type") != "module"]
    if len(blocking) > 3:
        add(WARN, "Техника", f"{len(blocking)} скриптов блокируют отрисовку",
            "Пока они грузятся, человек видит белый экран.", "Добавить скриптам атрибуты defer или async.")

    mixed = [x for x in re.findall(r'(?:src|href)=["\'](http://[^"\']+)', html)] if base.startswith("https://") else []
    if mixed:
        add(WARN, "Техника", f"Смешанный контент: {len(mixed)} ресурсов по http://",
            "Браузер может заблокировать их или показать предупреждение.", "Перевести ссылки на https://. Пример: " + mixed[0][:80])

    # ---------- SEO ----------
    title = " ".join(p.title.split())
    if not title:
        add(CRIT, "SEO", "У страницы нет заголовка (title)",
            "Это то, что показывается в поиске и на вкладке браузера.", "Добавить title на 30–65 символов: что вы делаете и для кого.")
    elif not 20 <= len(title) <= 70:
        add(WARN, "SEO", f"Заголовок страницы {len(title)} симв.: «{title[:80]}»",
            "Слишком короткий не объясняет, чем вы занимаетесь; слишком длинный обрезается в поиске.",
            "Оптимально 30–65 символов.")
    else:
        add(OK, "SEO", f"Заголовок страницы нормальной длины ({len(title)} симв.)")

    desc = p.meta.get("description", "").strip()
    if not desc:
        add(CRIT, "SEO", "Нет описания страницы (meta description)",
            "Поисковик сам выберет кусок текста для сниппета — часто неудачный.", "Добавить описание на 120–160 символов с главной выгодой.")
    elif not 70 <= len(desc) <= 170:
        add(WARN, "SEO", f"Описание страницы {len(desc)} симв.", "", "Оптимально 120–160 символов.")
    else:
        add(OK, "SEO", "Описание страницы заполнено")

    h1 = p.headings["h1"]
    if not h1:
        add(WARN, "SEO", "На странице нет заголовка H1", "Поисковику сложнее понять главную тему страницы.", "Сделать главный заголовок тегом H1.")
    elif len(h1) > 1:
        add(WARN, "SEO", f"Заголовков H1 несколько ({len(h1)})", "", "Оставить один H1, остальные сделать H2.")

    if not p.lang:
        add(WARN, "SEO", "Не указан язык страницы (<html lang>)", "", 'Добавить <html lang="ru"> (или нужный язык).')

    if not any("canonical" in (l.get("rel") or "") for l in p.links):
        add(WARN, "SEO", "Нет canonical-ссылки",
            "Одна и та же страница может индексироваться по нескольким адресам.", 'Добавить <link rel="canonical" href="...">.')

    robots_meta = p.meta.get("robots", "").lower()
    if "noindex" in robots_meta:
        add(CRIT, "SEO", "Страница закрыта от поисковиков (noindex)", "Сайт не появится в Google и Яндексе.", "Убрать noindex.")

    origin = f"{urllib.parse.urlparse(base).scheme}://{host}"
    robots = fetch(origin + "/robots.txt", timeout=10)
    if robots.status != 200:
        add(WARN, "SEO", "Нет файла robots.txt", "", "Добавить robots.txt со ссылкой на sitemap.")
    elif re.search(r"(?im)^disallow:\s*/\s*$", robots.body.decode("utf-8", "replace")):
        add(CRIT, "SEO", "robots.txt запрещает индексацию всего сайта", "Поисковики не будут показывать сайт.", "Убрать «Disallow: /».")
    sm = fetch(origin + "/sitemap.xml", timeout=10)
    if sm.status != 200:
        add(WARN, "SEO", "Нет карты сайта sitemap.xml", "Поисковики медленнее находят страницы.", "Сгенерировать sitemap.xml и добавить в Search Console / Вебмастер.")
    if robots.status == 200 and sm.status == 200:
        add(OK, "SEO", "Есть robots.txt и sitemap.xml")

    if not p.ld_json:
        add(WARN, "SEO", "Нет структурированных данных (schema.org)",
            "Поисковик может показывать расширенный сниппет: рейтинг, контакты, адрес.", "Добавить JSON-LD Organization / LocalBusiness.")

    no_alt = [i for i in p.images if not i.get("alt")]
    if p.images and no_alt:
        add(WARN, "SEO", f"{len(no_alt)} из {len(p.images)} картинок без описания (alt)",
            "Поисковики не понимают, что на картинке; хуже доступность.", "Заполнить alt у содержательных картинок.")

    # ---------- Оффер и тексты ----------
    if p.words < 150:
        add(WARN, "Тексты", f"Мало текста на странице (~{p.words} слов)",
            "Посетителю не хватает информации для решения, поисковику — для понимания темы.",
            "Описать услуги, для кого они, как проходит работа и результаты клиентов.")
    price_hit = re.search(r"(₽|руб|\$|€|грн|цен[аы]|стоимост|price|pricing|от \d)", html, re.I)
    if not price_hit:
        add(WARN, "Тексты", "Не видно цен или хотя бы «от …»",
            "Люди уходят сравнивать туда, где цену видно сразу.", "Указать цены или вилку «от».")

    # ---------- Конверсия ----------
    contact = {
        "телефон": any(a.startswith("tel:") for a in p.anchors),
        "почта": any(a.startswith("mailto:") for a in p.anchors),
        "Telegram": any("t.me/" in a for a in p.anchors),
        "WhatsApp": any("wa.me/" in a or "whatsapp" in a for a in p.anchors),
    }
    have = [k for k, v in contact.items() if v]
    if not have and not p.forms:
        add(CRIT, "Конверсия", "Нет кликабельных контактов и формы заявки",
            "Желающему связаться приходится искать, как это сделать.", "Добавить кнопку Telegram/WhatsApp, телефон и короткую форму.")
    elif not p.forms and not (contact["Telegram"] or contact["WhatsApp"]):
        add(WARN, "Конверсия", "Нет формы и мессенджеров", "Для многих клиентов написать проще, чем позвонить.", "Добавить кнопку мессенджера или короткую форму.")
    else:
        add(OK, "Конверсия", "Связаться можно: " + ", ".join(have + (["форма"] if p.forms else [])))
    if p.forms and p.inputs > 6:
        add(WARN, "Конверсия", f"Форма длинная: {p.inputs} полей",
            "Каждое лишнее поле снижает число заявок.", "Оставить 2–3 поля: имя, контакт, комментарий.")

    # ---------- Доверие ----------
    if host.endswith(FREE_HOSTS) or any(h in host for h in FREE_HOSTS):
        add(CRIT, "Доверие", f"Сайт на бесплатном адресе ({host})",
            "Для B2B это выглядит как временный проект; письма с такого домена чаще попадают в спам.",
            "Купить свой домен (~$10–15 в год) и подключить почту на нём.")
    trust = re.search(r"(отзыв|кейс|клиент|review|testimonial|case stud|портфолио|portfolio)", html, re.I)
    if not trust:
        add(WARN, "Доверие", "Не видно отзывов, кейсов или портфолио",
            "Новому клиенту нечем проверить, что вы делаете это хорошо.", "Добавить 2–3 кейса с цифрами или отзывы.")
    if not any(("icon" in (l.get("rel") or "")) for l in p.links):
        add(WARN, "Доверие", "Нет иконки сайта (favicon)", "На вкладке браузера и в закладках пустая иконка.", "Добавить favicon.")

    # ---------- Превью в соцсетях ----------
    miss = [k for k in ("og:title", "og:description", "og:image") if not p.meta.get(k)]
    if "og:image" in miss:
        add(WARN, "Соцсети", "Нет картинки превью ссылки (og:image)",
            "Ссылка в Telegram, WhatsApp и LinkedIn выглядит пустой, по ней реже кликают.", "Сделать картинку 1200×630 и добавить og:image.")
    elif miss:
        add(WARN, "Соцсети", "Не заполнены: " + ", ".join(miss), "", "Заполнить Open Graph теги.")
    else:
        add(OK, "Соцсети", "Превью ссылки настроено (Open Graph)")

    # ---------- Аналитика ----------
    found = [name for name, sig in ANALYTICS.items() if any(s in html for s in sig)]
    if not found:
        add(WARN, "Аналитика", "Не найдено систем аналитики",
            "Невозможно понять, сколько людей приходит, откуда и что они делают.", "Подключить Яндекс Метрику или Google Analytics.")
    else:
        add(OK, "Аналитика", "Аналитика: " + ", ".join(found))

    # ---------- Битые ссылки ----------
    internal = []
    for a in p.anchors:
        if a.startswith(("#", "mailto:", "tel:", "javascript:")):
            continue
        u = urllib.parse.urljoin(base, a).split("#")[0]
        if urllib.parse.urlparse(u).hostname == host and u not in internal:
            internal.append(u)
    broken = []
    for u in internal[:check_links]:
        x = fetch(u, method="HEAD", timeout=10)
        if x.status in (405, 403, 0):  # some servers refuse HEAD
            x = fetch(u, timeout=10)
        if x.status >= 400 or x.status == 0:
            broken.append((u, x.status or x.error))
    if broken:
        add(CRIT, "Техника", f"Битые внутренние ссылки: {len(broken)}",
            "Человек нажимает и попадает на ошибку.", "Исправить: " + "; ".join(f"{u} ({s})" for u, s in broken[:5]))
    elif internal:
        add(OK, "Техника", f"Внутренние ссылки открываются (проверено {min(len(internal), check_links)})")

    # ---------- Мобильная версия (отдельный запрос) ----------
    m = fetch(url, ua=MOBILE_UA)
    if m.status and m.status >= 400:
        add(CRIT, "Мобильная версия", f"С телефона сайт отвечает ошибкой {m.status}", "", "Проверить мобильную версию/редиректы.")

    info.update(title=title, description=desc, h1=h1[:3], words=p.words, host=host)
    return F, info


def _charset(headers: dict) -> str:
    m = re.search(r"charset=([\w-]+)", headers.get("content-type", ""), re.I)
    return m.group(1) if m else "utf-8"


def render(findings: list[Finding], info: dict, express: bool = False) -> str:
    problems = sorted([f for f in findings if f.level != OK], key=lambda f: RANK[f.level])
    good = [f for f in findings if f.level == OK]
    today = dt.date.today().strftime("%d.%m.%Y")
    out = []
    if express:
        out.append(f"# Экспресс-аудит сайта {info.get('host') or info['url']}\n")
        out.append(f"_{today} · Ember Court_\n")
        top = problems[:7]
        out.append(f"Мы нашли **{len(problems)}** мест, где сайт может терять клиентов. Ниже — {len(top)} самых важных.\n")
        for i, f in enumerate(top, 1):
            out.append(f"**{i}. {f.level} {f.title}**  ")
            if f.why:
                out.append(f"{f.why}  ")
            if f.fix:
                out.append(f"→ {f.fix}")
            out.append("")
        if good:
            out.append("**Что уже хорошо:** " + "; ".join(g.title for g in good[:4]) + ".\n")
        out.append("Полный разбор (все пункты и план исправлений) и сами исправления можем взять на себя — "
                   "напишите в Telegram @veloriev.")
        return "\n".join(out)

    crit = sum(f.level == CRIT for f in problems)
    warn = len(problems) - crit
    out.append(f"# Аудит сайта {info.get('host') or info['url']}\n")
    out.append(f"_{today} · Ember Court_\n")
    out.append("## Итог\n")
    out.append(f"| | |\n|---|---|\n| Адрес | {info['final_url']} |\n| Заголовок | {info.get('title') or '—'} |"
               f"\n| Ответ сервера | {info['seconds']:.2f} с |\n| Объём текста | ~{info.get('words', 0)} слов |"
               f"\n| {CRIT} Срочно | {crit} |\n| {WARN} Желательно | {warn} |\n| {OK} В порядке | {len(good)} |\n")
    for level, name in ((CRIT, "Срочно исправить"), (WARN, "Желательно исправить")):
        items = [f for f in problems if f.level == level]
        if not items:
            continue
        out.append(f"## {level} {name}\n")
        out.append("| # | Блок | Проблема | Почему это важно | Что сделать |\n|---|---|---|---|---|")
        for i, f in enumerate(items, 1):
            out.append(f"| {i} | {f.block} | {_cell(f.title)} | {_cell(f.why)} | {_cell(f.fix)} |")
        out.append("")
    if good:
        out.append(f"## {OK} Что уже хорошо\n")
        out.extend(f"- {g.block}: {g.title}" for g in good)
        out.append("")
    out.append("## Что проверить вручную\n")
    out.append("Автоматическая проверка не заменяет взгляд человека. Перед отправкой клиенту посмотрите сами:\n")
    out.extend([
        "- Понятно ли за 5 секунд на первом экране, **что** предлагают, **кому** и **почему здесь**?",
        "- Есть ли на первом экране кнопка следующего шага (написать, заказать, получить расчёт)?",
        "- Как сайт выглядит на телефоне: читается ли текст, нажимаются ли кнопки, не съезжает ли вёрстка?",
        "- Тексты про выгоду клиента или про «мы лучшие на рынке»?",
        "- Реальные ли фото и кейсы, или стоковые картинки?",
        "- Скорость по данным PageSpeed Insights: https://pagespeed.web.dev/?url=" + urllib.parse.quote(info["final_url"], safe=""),
    ])
    return "\n".join(out) + "\n"


def _cell(s: str) -> str:
    return (s or "—").replace("|", "\\|").replace("\n", " ")


def main(argv=None):
    ap = argparse.ArgumentParser(description="Аудит сайта с отчётом в Markdown")
    ap.add_argument("url")
    ap.add_argument("--express", action="store_true", help="только 7 главных проблем (для бесплатного разбора)")
    ap.add_argument("-o", "--output", help="сохранить отчёт в файл")
    ap.add_argument("--links", type=int, default=25, help="сколько внутренних ссылок проверять (по умолчанию 25)")
    a = ap.parse_args(argv)
    findings, info = audit(a.url, a.links)
    report = render(findings, info, a.express)
    if a.output:
        with open(a.output, "w", encoding="utf-8") as f:
            f.write(report)
        print(f"Отчёт сохранён: {a.output}", file=sys.stderr)
    else:
        print(report)


if __name__ == "__main__":
    main()
