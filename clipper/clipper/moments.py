"""Choosing the best moments: a local scorer (no API) or Claude."""
from __future__ import annotations

import os
import re
import subprocess

import numpy as np

from . import ff

HOOK_WORDS = (
    # ru
    "почему", "как ", "зачем", "секрет", "ошибк", "никогда", "всегда", "главн", "правд", "проблем",
    "деньг", "миллион", "самое", "важно", "представь", "история", "совет", "нельзя", "лучш", "худш",
    # en
    "why", "how ", "secret", "mistake", "never", "always", "truth", "problem", "money", "million",
    "most important", "imagine", "story", "advice", "best", "worst",
)


def loudness(path: str, sr: int = 8000) -> tuple[np.ndarray, int]:
    """Per-0.1s RMS of the audio track (mono, low sample rate is enough)."""
    raw = subprocess.run([ff.ffmpeg(), "-v", "error", "-i", path, "-ac", "1", "-ar", str(sr), "-f", "s16le", "-"],
                         check=True, capture_output=True).stdout
    a = np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768
    hop = sr // 10
    n = len(a) // hop
    rms = np.sqrt((a[: n * hop].reshape(n, hop) ** 2).mean(axis=1) + 1e-9) if n else np.zeros(1)
    return rms, 10


def _window_score(sents, i, j, rms, rate, target):
    first = sents[i]["text"].lower()
    words = [w for s in sents[i:j + 1] for w in s["words"]]
    start, end = sents[i]["start"], sents[j]["end"]
    dur = end - start
    score = 0.0
    # A hook in the first sentence: a question or a strong word.
    if "?" in sents[i]["text"]:
        score += 2.0
    score += 1.0 * min(2, sum(h in first for h in HOOK_WORDS))
    # Pace: lively speech holds attention.
    wps = len(words) / max(dur, 1)
    score += min(wps, 3.5) / 3.5 * 2
    # Energy relative to the whole episode.
    seg = rms[int(start * rate): int(end * rate)]
    if len(seg):
        score += float(np.clip(seg.mean() / (rms.mean() + 1e-9) - 0.8, 0, 1.2)) * 2
    # Long silences inside a clip are dead air.
    gaps = [b["start"] - a["end"] for a, b in zip(words, words[1:])]
    score -= sum(g - 1.2 for g in gaps if g > 1.2) * 1.5
    # Ending on a finished thought.
    if re.search(r"[.!?…]$", sents[j]["text"]):
        score += 0.5
    # Closeness to the target length.
    score -= abs(dur - target) / target
    return score


def pick_local(sents, audio_path, n, min_len, max_len, target=None) -> list[dict]:
    target = target or (min_len + max_len) / 2
    rms, rate = loudness(audio_path)
    cands = []
    for i in range(len(sents)):
        for j in range(i, len(sents)):
            dur = sents[j]["end"] - sents[i]["start"]
            if dur > max_len:
                break
            if dur >= min_len:
                cands.append((_window_score(sents, i, j, rms, rate, target), i, j))
    cands.sort(reverse=True)
    chosen = []
    for score, i, j in cands:
        s, e = sents[i]["start"], sents[j]["end"]
        if all(e <= c["start"] or s >= c["end"] for c in chosen):
            title = sents[i]["text"]
            chosen.append({"start": s, "end": e, "score": round(score, 2),
                           "title": _short(title, 60), "hook": _short(title, 48), "reason": "local scorer"})
        if len(chosen) == n:
            break
    return sorted(chosen, key=lambda c: c["start"])


def _short(s: str, n: int) -> str:
    s = s.strip()
    return s if len(s) <= n else s[: n - 1].rsplit(" ", 1)[0] + "…"


def pick_claude(sents, n, min_len, max_len, language_hint="") -> list[dict]:
    """Asks Claude to pick the clips. Falls back to [] on refusal so the caller can use the local scorer."""
    import anthropic
    from pydantic import BaseModel

    class Clip(BaseModel):
        start_sentence: int
        end_sentence: int
        title: str
        hook: str
        reason: str
        score: int

    class Clips(BaseModel):
        clips: list[Clip]

    lines = [f"[{k}] {_ts(s['start'])}–{_ts(s['end'])} {s['text']}" for k, s in enumerate(sents)]
    prompt = (
        f"Below is a podcast transcript split into numbered sentences with timestamps.\n"
        f"Pick the {n} best moments to publish as standalone vertical short videos (Reels / Shorts / TikTok).\n\n"
        f"What makes a good clip:\n"
        f"- it is {min_len:.0f}–{max_len:.0f} seconds long (end time of the last sentence minus start time of the first);\n"
        f"- it makes sense without the rest of the episode: a complete thought, story, argument or piece of advice;\n"
        f"- the first sentence grabs attention on its own: a question, a bold claim, a surprising fact, conflict or emotion;\n"
        f"- it ends on a finished thought, not mid-sentence;\n"
        f"- clips do not overlap.\n\n"
        f"For each clip return start_sentence and end_sentence (inclusive sentence numbers), "
        f"a short title (up to 60 characters) and an on-screen hook text for the first 2 seconds (up to 48 characters), "
        f"both in the language of the transcript{language_hint}; a one-line reason; and a virality score from 1 to 10.\n\n"
        + "\n".join(lines)
    )
    client = anthropic.Anthropic()
    resp = client.messages.parse(
        model=os.environ.get("CLIPPER_MODEL", "claude-opus-5"),
        max_tokens=16000,
        thinking={"type": "adaptive"},
        output_config={"effort": "medium"},
        messages=[{"role": "user", "content": prompt}],
        output_format=Clips,
    )
    if resp.stop_reason == "refusal" or resp.parsed_output is None:
        return []
    out = []
    for c in resp.parsed_output.clips:
        i, j = max(0, c.start_sentence), min(len(sents) - 1, c.end_sentence)
        if j < i:
            continue
        s, e = sents[i]["start"], sents[j]["end"]
        if not (min_len * 0.8 <= e - s <= max_len * 1.2):
            continue
        if any(not (e <= o["start"] or s >= o["end"]) for o in out):
            continue
        out.append({"start": s, "end": e, "score": c.score, "title": c.title, "hook": c.hook, "reason": c.reason})
    return sorted(out, key=lambda c: c["start"])


def _ts(t: float) -> str:
    return f"{int(t // 3600):02d}:{int(t % 3600 // 60):02d}:{t % 60:04.1f}"
