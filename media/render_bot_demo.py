"""30-second vertical demo: a clinic assistant bot books a patient and sends a reminder."""
import subprocess
import sys

import imageio_ffmpeg
from PIL import Image, ImageDraw, ImageFont

W, H, S, FPS, DUR = 720, 1280, 2, 30, 30.0
SW, SH = W * S, H * S
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"


def f(size, bold=False):
    return ImageFont.truetype(BOLD if bold else FONT, size * S)


F_MSG, F_TIME, F_HEAD, F_SUB = f(25), f(16), f(28, True), f(18)
BG, HEAD = (236, 229, 221), (17, 94, 84)
OUT, IN, INK, MUTED = (217, 247, 196), (255, 255, 255), (28, 30, 33), (120, 128, 130)
ACCENT = (17, 94, 84)

# (start, side, text, time, buttons)  side: P patient, B bot, D divider
SCRIPT = [
    (2.4, "P", "Здравствуйте! Ноги отекают к вечеру, хочу на консультацию к флебологу", "21:47", None),
    (4.6, "B", "Здравствуйте! Я ассистент клиники Flebo One. Запишу вас на приём флеболога с УЗДГ вен. Удобнее завтра или в субботу?", "21:47", None),
    (6.6, "P", "Завтра после 15", "21:48", None),
    (8.4, "B", "Завтра свободно 15:30 и 17:00. Какое время записать?", "21:48", None),
    (10.0, "P", "17:00", "21:48", None),
    (11.8, "B", "Записал: завтра в 17:00, приём флеболога + УЗДГ вен, ул. Муканова, 102. Как к вам обращаться?", "21:48", None),
    (13.4, "P", "Марина", "21:49", None),
    (14.8, "B", "Спасибо, Марина! Утром пришлю напоминание.", "21:49", None),
    (16.2, "D", "Завтра, 09:00", "", None),
    (17.6, "B", "Доброе утро, Марина! Сегодня в 17:00 у вас приём флеболога. Подтверждаете?", "09:00", ["Да, приду", "Перенести"]),
    (19.9, "P", "Да, приду", "09:02", None),
    (21.2, "B", "Отлично, ждём вас! Если что-то изменится, просто напишите сюда.", "09:02", None),
]
TYPING = [(3.4, 4.6), (7.4, 8.4), (10.8, 11.8), (14.0, 14.8), (16.6, 17.6), (20.4, 21.2)]
TAP_AT = 19.4  # "Да, приду" chip highlights
CHAT_END, END_CARD = 24.6, 25.0

PAD, MAXW, GAP, TOP = 22 * S, 470 * S, 14 * S, 120 * S
dummy = ImageDraw.Draw(Image.new("RGB", (10, 10)))


def wrap(text, font, width):
    lines, cur = [], ""
    for w in text.split():
        t = (cur + " " + w).strip()
        if dummy.textlength(t, font=font) <= width:
            cur = t
        else:
            lines.append(cur)
            cur = w
    lines.append(cur)
    return lines


def ease(x):
    x = max(0.0, min(1.0, x))
    return 1 - (1 - x) ** 3


# Precompute bubble geometry
LH = 34 * S
items = []
for start, side, text, tm, btns in SCRIPT:
    if side == "D":
        items.append(dict(start=start, side=side, text=text, h=44 * S, w=0))
        continue
    lines = wrap(text, F_MSG, MAXW - 2 * PAD)
    tw = max(dummy.textlength(l, font=F_MSG) for l in lines)
    w = max(tw, dummy.textlength(tm, font=F_TIME) + 40 * S) + 2 * PAD
    h = len(lines) * LH + 2 * PAD + 14 * S
    bh = 0
    if btns:
        bh = 64 * S
    items.append(dict(start=start, side=side, lines=lines, time=tm, w=w, h=h, btns=btns, bh=bh))


def chat_frame(t):
    img = Image.new("RGB", (SW, SH), BG)
    d = ImageDraw.Draw(img)
    # layout heights with appear progress
    y_positions, total = [], 0
    for it in items:
        p = ease((t - it["start"]) / 0.35)
        full = it["h"] + it.get("bh", 0) + GAP
        y_positions.append(total)
        total += full * p
    typing = next(((a, b) for a, b in TYPING if a <= t < b), None)
    if typing:
        total += (56 * S + GAP) * ease((t - typing[0]) / 0.25)
    area = SH - TOP - 40 * S
    off = max(0, total - area)
    for it, y0 in zip(items, y_positions):
        p = ease((t - it["start"]) / 0.35)
        if p <= 0:
            continue
        y = TOP + y0 - off + (1 - p) * 30 * S
        if it["side"] == "D":
            tw = d.textlength(it["text"], font=F_TIME) + 36 * S
            x = (SW - tw) / 2
            d.rounded_rectangle([x, y, x + tw, y + 34 * S], 17 * S, fill=(214, 228, 236))
            d.text((SW / 2, y + 17 * S), it["text"], font=F_TIME, fill=(70, 80, 90), anchor="mm")
            continue
        w, h = it["w"], it["h"]
        x = SW - 24 * S - w if it["side"] == "P" else 24 * S
        col = OUT if it["side"] == "P" else IN
        layer = Image.new("RGBA", (SW, SH), (0, 0, 0, 0))
        ld = ImageDraw.Draw(layer)
        a = int(255 * p)
        ld.rounded_rectangle([x, y, x + w, y + h], 22 * S, fill=col + (a,))
        for i, line in enumerate(it["lines"]):
            ld.text((x + PAD, y + PAD + i * LH), line, font=F_MSG, fill=INK + (a,))
        ld.text((x + w - PAD, y + h - 12 * S), it["time"] + (" ✓✓" if it["side"] == "P" else ""),
                font=F_TIME, fill=MUTED + (a,), anchor="rd")
        if it["btns"]:
            bx = x
            by = y + h + 10 * S
            for label in it["btns"]:
                bw = d.textlength(label, font=F_MSG) + 44 * S
                tapped = label == "Да, приду" and t >= TAP_AT
                fill = ACCENT + (a,) if tapped else (255, 255, 255, a)
                ld.rounded_rectangle([bx, by, bx + bw, by + 50 * S], 25 * S, fill=fill,
                                     outline=ACCENT + (a,), width=2 * S)
                ld.text((bx + bw / 2, by + 25 * S), label, font=F_MSG,
                        fill=((255, 255, 255, a) if tapped else ACCENT + (a,)), anchor="mm")
                bx += bw + 12 * S
        img.paste(layer, (0, 0), layer)
    if typing:
        p = ease((t - typing[0]) / 0.25)
        y = TOP + total - (56 * S + GAP) * p - off + (1 - p) * 20 * S
        d.rounded_rectangle([24 * S, y, 24 * S + 110 * S, y + 56 * S], 22 * S, fill=IN)
        for i in range(3):
            ph = (t * 3 - i * 0.25) % 1
            r = (6 + 3 * (ph < 0.5)) * S
            cx, cy = 24 * S + 32 * S + i * 23 * S, y + 28 * S
            shade = 150 if ph < 0.5 else 190
            d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(shade, shade, shade))
    # header
    d.rectangle([0, 0, SW, 104 * S], fill=HEAD)
    d.ellipse([28 * S, 22 * S, 88 * S, 82 * S], fill=(255, 255, 255))
    d.text((58 * S, 52 * S), "F1", font=f(22, True), fill=HEAD, anchor="mm")
    d.text((108 * S, 30 * S), "Flebo One", font=F_HEAD, fill=(255, 255, 255))
    status = "печатает…" if typing else "ассистент клиники · онлайн"
    d.text((108 * S, 66 * S), status, font=F_SUB, fill=(200, 230, 222))
    d.rounded_rectangle([SW - 130 * S, 34 * S, SW - 26 * S, 70 * S], 18 * S, fill=(255, 255, 255))
    d.text((SW - 78 * S, 52 * S), "демо", font=F_SUB, fill=HEAD, anchor="mm")
    return img


def card(lines, t0, t, sub=None):
    img = Image.new("RGB", (SW, SH), HEAD)
    d = ImageDraw.Draw(img)
    y = SH * 0.30
    for i, (text, size, bold) in enumerate(lines):
        p = ease((t - t0 - i * 0.35) / 0.5)
        if p <= 0:
            continue
        font = f(size, bold)
        for ln in wrap(text, font, SW - 120 * S):
            c = tuple(int(v * p + h_ * (1 - p)) for v, h_ in zip((255, 255, 255), HEAD))
            d.text((SW / 2, y + (1 - p) * 20 * S), ln, font=font, fill=c, anchor="mm")
            y += size * 1.5 * S
        y += 26 * S
    if sub and t - t0 > 1.4:
        p = ease((t - t0 - 1.4) / 0.5)
        c = tuple(int(v * p + h_ * (1 - p)) for v, h_ in zip((190, 225, 215), HEAD))
        d.text((SW / 2, SH * 0.88), sub, font=f(22), fill=c, anchor="mm")
    return img


def frame(t):
    if t < 2.0:
        return card([("Пациент пишет в 21:47.", 40, True),
                      ("Клиника уже закрыта.", 34, False)], 0.1, t)
    if t < CHAT_END:
        img = chat_frame(t)
        if t < 2.3:  # crossfade from intro
            img = Image.blend(frame(1.99), img, (t - 2.0) / 0.3)
        return img
    if t < END_CARD:
        return Image.blend(chat_frame(CHAT_END - 0.01),
                           card([], END_CARD, END_CARD), (t - CHAT_END) / (END_CARD - CHAT_END))
    return card([("Бот отвечает сразу, днём и ночью", 32, True),
                 ("Записывает на приём и УЗДГ", 30, False),
                 ("Напоминает о приёме и подтверждает визит", 30, False),
                 ("Сложные вопросы передаёт оператору", 30, False)],
                END_CARD, t, sub="Ember Court · ember-court.vercel.app")


def main(out):
    exe = imageio_ffmpeg.get_ffmpeg_exe()
    p = subprocess.Popen([exe, "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24",
                          "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-", "-c:v", "libx264",
                          "-pix_fmt", "yuv420p", "-crf", "20", "-movflags", "+faststart", out],
                         stdin=subprocess.PIPE)
    n = int(DUR * FPS)
    for i in range(n):
        img = frame(i / FPS).resize((W, H), Image.LANCZOS)
        p.stdin.write(img.tobytes())
    p.stdin.close()
    p.wait()


if __name__ == "__main__":
    if len(sys.argv) > 2:  # preview stills: render.py still <t> <png>
        frame(float(sys.argv[2])).resize((W, H), Image.LANCZOS).save(sys.argv[3])
    else:
        main(sys.argv[1])
