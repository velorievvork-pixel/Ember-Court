"""60-second vertical pitch video for a clinic: an evening request lost without a bot, then the same
evening with a booking bot, the operator's morning summary, and what the clinic gets.

    python3 render_bot_demo.py out.mp4            # full video
    python3 render_bot_demo.py still 22.5 f.png   # one frame for preview
"""
import subprocess
import sys

import imageio_ffmpeg
from PIL import Image, ImageDraw, ImageFont

W, H, S, FPS, DUR = 720, 1280, 2, 30, 60.0
SW, SH = W * S, H * S
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"


def f(size, bold=False):
    return ImageFont.truetype(BOLD if bold else FONT, size * S)


F_MSG, F_TIME, F_HEAD, F_SUB = f(25), f(16), f(28, True), f(18)
BG, HEAD = (236, 229, 221), (17, 94, 84)
OUT, IN, INK, MUTED = (217, 247, 196), (255, 255, 255), (28, 30, 33), (120, 128, 130)
WHITE, MINT, RED = (255, 255, 255), (190, 225, 215), (196, 52, 52)
PAD, MAXW, GAP, TOP, LH = 22 * S, 470 * S, 14 * S, 120 * S, 34 * S
dummy = ImageDraw.Draw(Image.new("RGB", (10, 10)))


def ease(x):
    x = max(0.0, min(1.0, x))
    return 1 - (1 - x) ** 3


def mix(c, p, base=HEAD):
    return tuple(int(v * p + b * (1 - p)) for v, b in zip(c, base))


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


# ---------- chat scenes ----------
class Scene:
    def __init__(self, script, typing, status, tap=None, ticks="✓✓"):
        self.typing, self.status, self.tap, self.ticks = typing, status, tap, ticks
        self.items = []
        for start, side, text, tm, btns in script:
            if side == "D":
                self.items.append(dict(start=start, side=side, text=text, h=44 * S, bh=0))
                continue
            lines = wrap(text, F_MSG, MAXW - 2 * PAD)
            tw = max(dummy.textlength(ln, font=F_MSG) for ln in lines)
            w = max(tw, dummy.textlength(tm, font=F_TIME) + 40 * S) + 2 * PAD
            self.items.append(dict(start=start, side=side, lines=lines, time=tm, w=w,
                                   h=len(lines) * LH + 2 * PAD + 14 * S, btns=btns,
                                   bh=64 * S if btns else 0))

    def render(self, t, badge=None):
        img = Image.new("RGB", (SW, SH), BG)
        d = ImageDraw.Draw(img)
        ys, total = [], 0
        for it in self.items:
            ys.append(total)
            total += (it["h"] + it["bh"] + GAP) * ease((t - it["start"]) / 0.35)
        typing = next(((a, b) for a, b in self.typing if a <= t < b), None)
        if typing:
            total += (56 * S + GAP) * ease((t - typing[0]) / 0.25)
        off = max(0, total - (SH - TOP - 150 * S))
        layer = Image.new("RGBA", (SW, SH), (0, 0, 0, 0))
        ld = ImageDraw.Draw(layer)
        for it, y0 in zip(self.items, ys):
            p = ease((t - it["start"]) / 0.35)
            if p <= 0:
                continue
            a = int(255 * p)
            y = TOP + y0 - off + (1 - p) * 30 * S
            if it["side"] == "D":
                tw = d.textlength(it["text"], font=F_TIME) + 36 * S
                x = (SW - tw) / 2
                ld.rounded_rectangle([x, y, x + tw, y + 34 * S], 17 * S, fill=(214, 228, 236, a))
                ld.text((SW / 2, y + 17 * S), it["text"], font=F_TIME, fill=(70, 80, 90, a), anchor="mm")
                continue
            w, h = it["w"], it["h"]
            x = SW - 24 * S - w if it["side"] == "P" else 24 * S
            ld.rounded_rectangle([x, y, x + w, y + h], 22 * S, fill=(OUT if it["side"] == "P" else IN) + (a,))
            for i, line in enumerate(it["lines"]):
                ld.text((x + PAD, y + PAD + i * LH), line, font=F_MSG, fill=INK + (a,))
            ld.text((x + w - PAD, y + h - 12 * S),
                    it["time"] + (" " + self.ticks if it["side"] == "P" else ""),
                    font=F_TIME, fill=MUTED + (a,), anchor="rd")
            if it["btns"]:
                bx, by = x, y + h + 10 * S
                for label in it["btns"]:
                    bw = d.textlength(label, font=F_MSG) + 44 * S
                    on = self.tap and label == self.tap[1] and t >= self.tap[0]
                    ld.rounded_rectangle([bx, by, bx + bw, by + 50 * S], 25 * S,
                                         fill=(HEAD if on else WHITE) + (a,), outline=HEAD + (a,), width=2 * S)
                    ld.text((bx + bw / 2, by + 25 * S), label, font=F_MSG,
                            fill=(WHITE if on else HEAD) + (a,), anchor="mm")
                    bx += bw + 12 * S
        img.paste(layer, (0, 0), layer)
        if typing:
            p = ease((t - typing[0]) / 0.25)
            y = TOP + total - (56 * S + GAP) * p - off + (1 - p) * 20 * S
            d.rounded_rectangle([24 * S, y, 134 * S, y + 56 * S], 22 * S, fill=IN)
            for i in range(3):
                ph = (t * 3 - i * 0.25) % 1
                r = (6 + 3 * (ph < 0.5)) * S
                cx, cy = 56 * S + i * 23 * S, y + 28 * S
                g = 150 if ph < 0.5 else 190
                d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(g, g, g))
        # header
        d.rectangle([0, 0, SW, 104 * S], fill=HEAD)
        d.ellipse([28 * S, 22 * S, 88 * S, 82 * S], fill=WHITE)
        d.text((58 * S, 52 * S), "F1", font=f(22, True), fill=HEAD, anchor="mm")
        d.text((108 * S, 30 * S), "Flebo One", font=F_HEAD, fill=WHITE)
        d.text((108 * S, 66 * S), "печатает…" if typing else self.status, font=F_SUB, fill=(200, 230, 222))
        d.rounded_rectangle([SW - 130 * S, 34 * S, SW - 26 * S, 70 * S], 18 * S, fill=WHITE)
        d.text((SW - 78 * S, 52 * S), "демо", font=F_SUB, fill=HEAD, anchor="mm")
        if badge:
            text, col, t0 = badge
            p = ease((t - t0) / 0.4)
            if p > 0:
                font = f(26, True)
                bw = d.textlength(text, font=font) + 60 * S
                y = SH - 120 * S + (1 - p) * 60 * S
                lay = Image.new("RGBA", (SW, SH), (0, 0, 0, 0))
                ImageDraw.Draw(lay).rounded_rectangle([(SW - bw) / 2, y, (SW + bw) / 2, y + 70 * S], 35 * S,
                                                      fill=col + (int(240 * p),))
                ImageDraw.Draw(lay).text((SW / 2, y + 35 * S), text, font=font, fill=WHITE + (int(255 * p),),
                                         anchor="mm")
                img.paste(lay, (0, 0), lay)
        return img


WITHOUT = Scene(
    [(4.6, "P", "Здравствуйте! Хочу записаться к флебологу, ноги отекают к вечеру", "21:47", None),
     (7.2, "D", "Утром, 09:40", "", None),
     (8.2, "B", "Доброе утро! Да, конечно. Когда вам удобно подойти?", "09:40", None),
     (10.4, "P", "Спасибо, уже записалась в другую клинику", "09:52", None)],
    [], "был(а) в сети в 18:00", ticks="✓")

WITH = Scene(
    [(18.4, "P", "Здравствуйте! Хочу записаться к флебологу, ноги отекают к вечеру", "21:47", None),
     (20.2, "B", "Здравствуйте! Я ассистент клиники Flebo One. Запишу вас на приём флеболога с УЗДГ вен. "
                 "Удобнее завтра или в субботу?", "21:47", None),
     (21.6, "P", "Завтра после 15", "21:48", None),
     (23.0, "B", "Завтра свободно 15:30 и 17:00. Какое время записать?", "21:48", None),
     (24.2, "P", "17:00", "21:48", None),
     (25.6, "B", "Записал: завтра в 17:00, приём флеболога + УЗДГ вен, ул. Муканова, 102. "
                 "Как к вам обращаться?", "21:48", None),
     (26.8, "P", "Марина", "21:49", None),
     (28.0, "B", "Спасибо, Марина! Утром пришлю напоминание.", "21:49", None),
     (29.0, "P", "А процедура болезненная?", "21:50", None),
     (30.6, "B", "Это лучше объяснит врач. Передал ваш вопрос администратору, утром вам ответят. "
                 "Запись на 17:00 в силе.", "21:50", None),
     (32.2, "D", "Завтра, 09:00", "", None),
     (33.6, "B", "Доброе утро, Марина! Сегодня в 17:00 у вас приём флеболога. Подтверждаете?", "09:00",
      ["Да, приду", "Перенести"]),
     (35.9, "P", "Да, приду", "09:02", None),
     (37.2, "B", "Отлично, ждём вас! Если что-то изменится, просто напишите сюда.", "09:02", None)],
    [(19.2, 20.2), (22.2, 23.0), (24.8, 25.6), (27.3, 28.0), (29.6, 30.6), (32.6, 33.6), (36.4, 37.2)],
    "ассистент клиники · онлайн", tap=(35.4, "Да, приду"))


# ---------- cards ----------
def text_card(t, t0, lines, sub=None, bg=HEAD):
    img = Image.new("RGB", (SW, SH), bg)
    d = ImageDraw.Draw(img)
    y = SH * 0.36
    for i, (text, size, bold, col) in enumerate(lines):
        p = ease((t - t0 - i * 0.5) / 0.5)
        font = f(size, bold)
        for ln in wrap(text, font, SW - 120 * S):
            if p > 0:
                d.text((SW / 2, y + (1 - p) * 20 * S), ln, font=font, fill=mix(col, p, bg), anchor="mm")
            y += size * 1.45 * S
        y += 30 * S
    if sub:
        p = ease((t - t0 - 1.2) / 0.5)
        d.text((SW / 2, SH * 0.9), sub, font=f(22), fill=mix(MINT, p, bg), anchor="mm")
    return img


def list_card(t, t0, title, rows, cta=None):
    img = Image.new("RGB", (SW, SH), HEAD)
    d = ImageDraw.Draw(img)
    p = ease((t - t0) / 0.5)
    tf = f(34, True)
    y = 170 * S
    for ln in wrap(title, tf, SW - 120 * S):
        d.text((SW / 2, y + (1 - p) * 20 * S), ln, font=tf, fill=mix(WHITE, p), anchor="mm")
        y += 50 * S
    y += 50 * S
    for i, (head, body) in enumerate(rows):
        p = ease((t - t0 - 0.8 - i * 1.0) / 0.5)
        hf, bf = f(25, True), f(22)
        hl, bl = wrap(head, hf, SW - 200 * S), wrap(body, bf, SW - 200 * S) if body else []
        bh = len(hl) * 36 * S + len(bl) * 32 * S + 48 * S
        if p > 0:
            lay = Image.new("RGBA", (SW, SH), (0, 0, 0, 0))
            ld = ImageDraw.Draw(lay)
            x0 = 60 * S + (1 - p) * 40 * S
            ld.rounded_rectangle([x0, y, x0 + SW - 120 * S, y + bh], 26 * S, fill=WHITE + (int(255 * p),))
            ld.ellipse([x0 + 26 * S, y + 30 * S, x0 + 44 * S, y + 48 * S], fill=HEAD + (int(255 * p),))
            yy = y + 24 * S
            for ln in hl:
                ld.text((x0 + 62 * S, yy), ln, font=hf, fill=INK + (int(255 * p),))
                yy += 36 * S
            for ln in bl:
                ld.text((x0 + 62 * S, yy), ln, font=bf, fill=MUTED + (int(255 * p),))
                yy += 32 * S
            img.paste(lay, (0, 0), lay)
        y += bh + 22 * S
    if cta:
        p = ease((t - t0 - 0.8 - len(rows) * 1.0 - 0.3) / 0.6)
        if p > 0:
            y += 30 * S
            for i, (text, size, bold) in enumerate(cta):
                d.text((SW / 2, y + (1 - p) * 20 * S), text, font=f(size, bold), fill=mix(WHITE, p), anchor="mm")
                y += size * 1.6 * S
            d.text((SW / 2, SH - 70 * S), "Ember Court · ember-court.vercel.app", font=f(22),
                   fill=mix(MINT, p), anchor="mm")
    return img


# ---------- timeline ----------
def raw(t):
    if t < 4.0:
        return text_card(t, 0.2, [("21:47", 64, True, WHITE), ("Клиника уже закрыта.", 34, False, WHITE),
                                  ("А пациентка решилась записаться именно сейчас.", 30, False, MINT)])
    if t < 14.5:
        return WITHOUT.render(t, badge=("Пациент ушёл в другую клинику", RED, 11.6))
    if t < 18.0:
        return text_card(t, 14.6, [("Тот же вечер.", 44, True, WHITE), ("Но на сообщения отвечает бот.", 32, False, MINT)])
    if t < 39.5:
        return WITH.render(t, badge=("Записана за 2 минуты, в 21:49", HEAD, 28.3) if 28.3 <= t < 32.0 else None)
    if t < 48.0:
        return list_card(t, 39.6, "Утром администратор видит готовое",
                         [("Новая запись: Марина", "завтра 17:00 · флеболог + УЗДГ вен · подтвердила"),
                          ("Вопрос врачу", "«Процедура болезненная?» — пациентка ждёт ответа"),
                          ("Ничего не потерялось за ночь", "")])
    return list_card(t, 48.1, "Что это даёт Flebo One",
                     [("Вечерние заявки не ждут до утра", ""),
                      ("Пациент записан, пока ещё выбирает клинику", ""),
                      ("Напоминание и подтверждение: меньше пустых окон", ""),
                      ("Операторы заняты пациентами, а не перепиской", "")],
                     cta=[("Покажем на вашей записи", 30, True), ("бесплатно, за 15 минут", 26, False)])


CUTS = [4.0, 14.5, 18.0, 39.5, 48.0]


def frame(t):
    for c in CUTS:  # short crossfade at each scene change
        if c <= t < c + 0.35:
            return Image.blend(raw(c - 0.01), raw(t), (t - c) / 0.35)
    return raw(t)


def main(out):
    exe = imageio_ffmpeg.get_ffmpeg_exe()
    p = subprocess.Popen([exe, "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24",
                          "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-", "-c:v", "libx264",
                          "-pix_fmt", "yuv420p", "-crf", "20", "-movflags", "+faststart", out],
                         stdin=subprocess.PIPE)
    for i in range(int(DUR * FPS)):
        p.stdin.write(frame(i / FPS).resize((W, H), Image.LANCZOS).tobytes())
    p.stdin.close()
    p.wait()


if __name__ == "__main__":
    if sys.argv[1] == "still":
        frame(float(sys.argv[2])).resize((W, H), Image.LANCZOS).save(sys.argv[3])
    else:
        main(sys.argv[1])
