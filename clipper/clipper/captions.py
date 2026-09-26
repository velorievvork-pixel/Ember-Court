"""ASS subtitles: short word groups with the spoken word highlighted, plus the hook title."""
from __future__ import annotations

W, H = 1080, 1920


def _color(hex_rgb: str, alpha: int = 0) -> str:
    """#RRGGBB → ASS &HAABBGGRR."""
    h = hex_rgb.lstrip("#")
    r, g, b = h[0:2], h[2:4], h[4:6]
    return f"&H{alpha:02X}{b}{g}{r}".upper()


def _t(sec: float) -> str:
    sec = max(sec, 0)
    cs = int(round(sec * 100))
    return f"{cs // 360000}:{cs // 6000 % 60:02d}:{cs // 100 % 60:02d}.{cs % 100:02d}"


def _esc(s: str) -> str:
    return s.replace("\\", "\\\\").replace("{", "(").replace("}", ")")


def groups(words: list[dict], max_words: int, max_chars: int, pause: float = 0.45) -> list[list[dict]]:
    out, cur = [], []
    for i, w in enumerate(words):
        cur.append(w)
        nxt = words[i + 1] if i + 1 < len(words) else None
        text_len = sum(len(x["w"]) + 1 for x in cur)
        if (nxt is None or len(cur) >= max_words or text_len >= max_chars
                or nxt["start"] - w["end"] > pause or w["w"][-1:] in ".?!,…"):
            out.append(cur)
            cur = []
    return out


def build(words: list[dict], clip_start: float, clip_end: float, style: dict, hook: str = "") -> str:
    c = style["captions"]
    upper = c.get("uppercase", True)
    base, hi = _color(c["color"]), _color(c["highlight"])
    outline = _color(c.get("outline_color", "#000000"))
    back = _color(c.get("back_color", "#000000"), alpha=int(255 * (1 - c.get("back_opacity", 0.0))))
    border_style = 3 if c.get("box", False) else 1
    h = style.get("hook", {})
    lines = [
        "[Script Info]", "ScriptType: v4.00+", f"PlayResX: {W}", f"PlayResY: {H}", "WrapStyle: 0",
        "ScaledBorderAndShadow: yes", "",
        "[V4+ Styles]",
        "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, "
        "Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, "
        "MarginR, MarginV, Encoding",
        f"Style: Cap,{c['font']},{c['size']},{base},{hi},{outline},{back},{-1 if c.get('bold', True) else 0},0,0,0,"
        f"100,100,{c.get('spacing', 0)},0,{border_style},{c.get('outline', 6)},{c.get('shadow', 0)},2,60,60,{c['margin_v']},1",
        f"Style: Hook,{h.get('font', c['font'])},{h.get('size', 64)},{_color(h.get('color', '#FFFFFF'))},"
        f"{_color(h.get('color', '#FFFFFF'))},{_color(h.get('box_color', '#000000'))},"
        f"{_color(h.get('box_color', '#000000'), alpha=int(255 * (1 - h.get('box_opacity', 0.75))))},-1,0,0,0,"
        f"100,100,0,0,3,18,0,8,80,80,{h.get('margin_v', 260)},1",
        "",
        "[Events]",
        "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text",
    ]
    if hook and h.get("enabled", True):
        text = hook.upper() if h.get("uppercase", False) else hook
        dur = h.get("duration", 2.5)
        lines.append(f"Dialogue: 1,{_t(0)},{_t(dur)},Hook,,0,0,0,,{{\\fad(150,200)}}{_esc(text)}")

    ws = [w for w in words if w["end"] > clip_start and w["start"] < clip_end]
    pop = c.get("pop", True)
    events = []  # (start, end, text)
    for g in groups(ws, c.get("max_words", 3), c.get("max_chars", 22)):
        g_end = g[-1]["end"]
        for k, w in enumerate(g):
            start = w["start"]
            end = g[k + 1]["start"] if k + 1 < len(g) else g_end + 0.15
            parts = []
            for m, x in enumerate(g):
                t = _esc(x["w"].upper() if upper else x["w"])
                if m == k:
                    anim = "\\fscx112\\fscy112\\t(0,90,\\fscx100\\fscy100)" if pop else ""
                    parts.append(f"{{\\c{hi}{anim}}}{t}{{\\c{base}\\fscx100\\fscy100}}")
                else:
                    parts.append(t)
            events.append([start, end, " ".join(parts)])
    # Whisper word times can overlap and each group lingers a little after its last word;
    # only one caption may be on screen at a time.
    for k in range(len(events) - 1):
        events[k][1] = min(events[k][1], events[k + 1][0])
    for start, end, text in events:
        if end - start >= 0.02:
            lines.append(f"Dialogue: 0,{_t(start - clip_start)},{_t(end - clip_start)},Cap,,0,0,0,,{text}")
    return "\n".join(lines) + "\n"
