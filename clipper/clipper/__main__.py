"""CLI.

    python -m clipper run podcast.mp4 -o out/ --clips 5 --style bold --reference ref.mp4
    python -m clipper analyze ref.mp4
"""
from __future__ import annotations

import argparse
import copy
import json
import os
import sys
import time
from pathlib import Path

import yaml

from . import ff
from .captions import build as build_ass
from .moments import pick_claude, pick_local
from .reference import analyze, to_style
from .render import render_clip
from .transcribe import sentences, transcribe

STYLES = Path(__file__).parent / "styles"


def load_style(name: str) -> dict:
    p = Path(name)
    if not p.exists():
        p = STYLES / f"{name}.yaml"
    if not p.exists():
        raise SystemExit(f"Стиль не найден: {name}. Есть: {', '.join(x.stem for x in STYLES.glob('*.yaml'))}")
    return yaml.safe_load(p.read_text(encoding="utf-8"))


def merge(base: dict, over: dict) -> dict:
    out = copy.deepcopy(base)
    for k, v in over.items():
        out[k] = merge(out.get(k, {}), v) if isinstance(v, dict) and isinstance(out.get(k), dict) else v
    return out


def log(msg: str) -> None:
    print(f"[clipper] {msg}", file=sys.stderr, flush=True)


def cmd_analyze(a) -> None:
    res = analyze(a.video)
    print(json.dumps({"analysis": res, "style_overrides": to_style(res)}, ensure_ascii=False, indent=2))


def cmd_run(a) -> None:
    out = Path(a.output)
    out.mkdir(parents=True, exist_ok=True)
    style = load_style(a.style)
    target = None
    if a.reference:
        log(f"Разбираю референс {a.reference}")
        ref = analyze(a.reference)
        over = to_style(ref)
        target = over.pop("target_seconds")
        style = merge(style, over)
        log(f"Референс: {ref['duration']} с, склейка каждые {ref['avg_shot_seconds']} с → зум каждые "
            f"{style['zoom']['every']:.1f} с, клип ~{target:.0f} с")
        (out / "reference.json").write_text(json.dumps({"analysis": ref, "applied": over}, ensure_ascii=False, indent=2), encoding="utf-8")

    t0 = time.time()
    log(f"Распознаю речь (whisper {a.whisper})…")
    words = transcribe(a.video, out / ".cache", a.whisper, a.lang)
    sents = sentences(words)
    log(f"{len(words)} слов, {len(sents)} предложений за {time.time() - t0:.0f} с")

    min_len, max_len = a.min, a.max
    if target:
        min_len, max_len = max(min_len, target * 0.6), min(max_len, max(target * 1.4, min_len + 5))
    selector = a.selector
    if selector == "auto":
        selector = "claude" if os.environ.get("ANTHROPIC_API_KEY") else "local"
    clips = []
    if selector == "claude":
        log("Ищу лучшие моменты через Claude…")
        try:
            clips = pick_claude(sents, a.clips, min_len, max_len)
        except Exception as e:  # no key, network, rate limit — the local scorer still works
            log(f"Claude недоступен ({type(e).__name__}: {e}); переключаюсь на локальный выбор")
    if not clips:
        log("Ищу лучшие моменты локально (без API)…")
        lo, hi = min_len, max_len
        for _ in range(3):
            clips = pick_local(sents, a.video, a.clips, lo, hi, target)
            if clips:
                break
            # Long monologue sentences may not fit the window exactly; widen it rather than give up.
            lo, hi = lo * 0.7, hi * 1.4
            log(f"Нет фрагментов нужной длины, расширяю диапазон до {lo:.0f}–{hi:.0f} с")
    if not clips:
        raise SystemExit("Не нашлось фрагментов нужной длины. Уменьшите --min или проверьте, что в видео есть речь.")

    info = ff.probe(a.video)
    for n, c in enumerate(clips, 1):
        name = f"clip_{n:02d}"
        ass = out / f"{name}.ass"
        pad = 0.15
        s, e = max(0, c["start"] - pad), min(info["duration"] or c["end"] + pad, c["end"] + pad)
        ass.write_text(build_ass(words, s, e, style, c.get("hook", "") if not a.no_hook else ""), encoding="utf-8")
        log(f"Рендер {name}: {s:.1f}–{e:.1f} с — {c['title']}")
        render_clip(a.video, s, e, ass, out / f"{name}.mp4", style, info)
        c.update(file=f"{name}.mp4", start=round(s, 2), end=round(e, 2), duration=round(e - s, 1),
                 text=" ".join(w["w"] for w in words if s <= w["start"] < e))
        if not a.keep_ass:
            ass.unlink()

    (out / "clips.json").write_text(json.dumps({"source": a.video, "selector": selector, "style": a.style,
                                                "clips": clips}, ensure_ascii=False, indent=2), encoding="utf-8")
    md = ["# Клипы", "", f"Источник: `{a.video}` · выбор: {selector} · стиль: {a.style}", ""]
    for c in clips:
        md += [f"## {c['file']} — {c['title']}", f"- Время: {c['start']:.1f}–{c['end']:.1f} с ({c['duration']} с), оценка {c['score']}",
               f"- Хук: {c['hook']}", f"- Почему: {c['reason']}", "", f"> {c['text']}", ""]
    (out / "clips.md").write_text("\n".join(md), encoding="utf-8")
    log(f"Готово: {len(clips)} клипов в {out}/ за {time.time() - t0:.0f} с")


def main(argv=None) -> None:
    ap = argparse.ArgumentParser(prog="clipper", description="Подкаст → вертикальные клипы с субтитрами")
    sub = ap.add_subparsers(dest="cmd", required=True)

    r = sub.add_parser("run", help="нарезать клипы")
    r.add_argument("video")
    r.add_argument("-o", "--output", default="out")
    r.add_argument("--clips", type=int, default=5, help="сколько клипов (по умолчанию 5)")
    r.add_argument("--style", default="bold", help="bold | minimal | hype | путь к .yaml")
    r.add_argument("--reference", help="референс-ролик: темп, цвет и длина берутся с него")
    r.add_argument("--min", type=float, default=20, help="мин. длина клипа, с")
    r.add_argument("--max", type=float, default=60, help="макс. длина клипа, с")
    r.add_argument("--selector", choices=["auto", "claude", "local"], default="auto",
                   help="auto: Claude при наличии ANTHROPIC_API_KEY, иначе локально")
    r.add_argument("--whisper", default="small", help="модель whisper: tiny/base/small/medium/large-v3")
    r.add_argument("--lang", default=None, help="язык речи (ru, en, uk…); по умолчанию определяется сам")
    r.add_argument("--no-hook", action="store_true", help="без заголовка-хука в начале")
    r.add_argument("--keep-ass", action="store_true", help="сохранить файлы субтитров .ass")
    r.set_defaults(fn=cmd_run)

    an = sub.add_parser("analyze", help="разобрать стиль референса")
    an.add_argument("video")
    an.set_defaults(fn=cmd_analyze)

    a = ap.parse_args(argv)
    a.fn(a)


if __name__ == "__main__":
    main()
