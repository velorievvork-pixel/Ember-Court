"""Speech → words with timestamps (faster-whisper), cached next to the output."""
from __future__ import annotations

import hashlib
import json
import os
import re
from pathlib import Path


def _key(path: str, model: str, language: str | None) -> str:
    st = os.stat(path)
    return hashlib.sha1(f"{Path(path).resolve()}|{st.st_size}|{st.st_mtime}|{model}|{language}".encode()).hexdigest()[:16]


def transcribe(path: str, cache_dir: Path, model: str = "small", language: str | None = None) -> list[dict]:
    """Returns [{"w": word, "start": s, "end": e}, ...]."""
    cache = cache_dir / f"transcript-{_key(path, model, language)}.json"
    if cache.exists():
        return json.loads(cache.read_text(encoding="utf-8"))
    from faster_whisper import WhisperModel
    m = WhisperModel(model, device="auto", compute_type="int8")
    segments, info = m.transcribe(path, language=language, word_timestamps=True, vad_filter=True)
    words = []
    for seg in segments:
        for w in seg.words or []:
            t = w.word.strip()
            if t:
                words.append({"w": t, "start": round(w.start, 3), "end": round(w.end, 3)})
    cache.parent.mkdir(parents=True, exist_ok=True)
    cache.write_text(json.dumps(words, ensure_ascii=False), encoding="utf-8")
    return words


def sentences(words: list[dict], pause: float = 0.7) -> list[dict]:
    """Groups words into sentences: split on .?! or on a pause longer than `pause` seconds."""
    out, cur = [], []
    for i, w in enumerate(words):
        cur.append(w)
        nxt = words[i + 1] if i + 1 < len(words) else None
        end_punct = re.search(r"[.?!…]$", w["w"])
        gap = (nxt["start"] - w["end"]) if nxt else 99
        if end_punct or gap > pause or nxt is None:
            out.append({"start": cur[0]["start"], "end": cur[-1]["end"],
                        "text": " ".join(x["w"] for x in cur), "words": cur})
            cur = []
    return out
