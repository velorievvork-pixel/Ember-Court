"""Render queue: download the source, run clipper in a subprocess, send the clips back."""
from __future__ import annotations

import asyncio
import json
import logging
import os
import shutil
import sys
import time
from dataclasses import dataclass
from pathlib import Path

import aiohttp
from aiogram import Bot
from aiogram.types import FSInputFile

from . import texts
from .config import Config
from .db import DB

log = logging.getLogger(__name__)
CLIPPER_ROOT = Path(__file__).resolve().parents[2] / "clipper"


@dataclass
class Job:
    id: int
    user_id: int
    chat_id: int
    status_msg_id: int
    paid: bool
    clips: int
    style: str
    reference: str | None
    file_id: str | None = None
    url: str | None = None


async def download_url(url: str, dest: Path, max_mb: int) -> None:
    timeout = aiohttp.ClientTimeout(total=3600, sock_read=120)
    async with aiohttp.ClientSession(timeout=timeout) as s:
        async with s.get(url, allow_redirects=True) as r:
            if r.status != 200:
                raise RuntimeError(f"ссылка ответила {r.status}")
            ctype = r.headers.get("content-type", "")
            if "text/html" in ctype:
                raise RuntimeError("по ссылке веб-страница, а не файл — нужна прямая ссылка на видео")
            if r.content_length and r.content_length > max_mb * 1024 * 1024:
                raise RuntimeError(f"файл больше {max_mb} МБ")
            size = 0
            with dest.open("wb") as f:
                async for chunk in r.content.iter_chunked(1 << 20):
                    size += len(chunk)
                    if size > max_mb * 1024 * 1024:
                        raise RuntimeError(f"файл больше {max_mb} МБ")
                    f.write(chunk)


async def run_clipper(args: list[str], on_line=None) -> str:
    """Runs `python -m clipper ...`; returns stdout, raises with the last stderr lines on failure."""
    env = {**os.environ, "PYTHONPATH": str(CLIPPER_ROOT) + os.pathsep + os.environ.get("PYTHONPATH", "")}
    p = await asyncio.create_subprocess_exec(sys.executable, "-m", "clipper", *args, env=env,
                                             stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE)
    tail: list[str] = []

    async def read_err():
        async for raw in p.stderr:
            line = raw.decode("utf-8", "replace").rstrip()
            tail.append(line)
            del tail[:-20]
            if on_line and line.startswith("[clipper] "):
                await on_line(line[len("[clipper] "):])

    out, _ = await asyncio.gather(p.stdout.read(), read_err())
    if await p.wait() != 0:
        msg = next((l for l in reversed(tail) if l.strip()), "ошибка обработки")
        raise RuntimeError(msg[-300:])
    return out.decode("utf-8", "replace")


class Worker:
    def __init__(self, bot: Bot, db: DB, cfg: Config):
        self.bot, self.db, self.cfg = bot, db, cfg
        self.queue: asyncio.Queue[Job] = asyncio.Queue()
        self.jobs_dir = cfg.data_dir / "jobs"
        self.jobs_dir.mkdir(parents=True, exist_ok=True)

    def submit(self, job: Job) -> int:
        self.queue.put_nowait(job)
        return self.queue.qsize()

    async def run(self) -> None:
        while True:
            job = await self.queue.get()
            try:
                await self.process(job)
            except Exception:  # never let one job kill the worker
                log.exception("job %s crashed", job.id)
            finally:
                self.queue.task_done()

    async def _status(self, job: Job, text: str) -> None:
        try:
            await self.bot.edit_message_text(text, chat_id=job.chat_id, message_id=job.status_msg_id)
        except Exception:  # message deleted or text unchanged — progress is best-effort
            pass

    async def process(self, job: Job) -> None:
        d = self.jobs_dir / str(job.id)
        d.mkdir(parents=True, exist_ok=True)
        self.db.job_status(job.id, "running")
        try:
            await self._status(job, texts.PROGRESS.format(line="Скачиваю видео…"))
            src = d / "input.mp4"
            if job.file_id:
                await self.bot.download(job.file_id, destination=src)
            else:
                await download_url(job.url, src, self.cfg.max_url_mb)

            last = [0.0]

            async def progress(line: str):
                if time.monotonic() - last[0] > 4:
                    last[0] = time.monotonic()
                    await self._status(job, texts.PROGRESS.format(line=line))

            args = ["run", str(src), "-o", str(d / "out"), "--clips", str(job.clips), "--style", job.style,
                    "--whisper", self.cfg.whisper]
            if job.reference and Path(job.reference).exists():
                args += ["--reference", job.reference]
            await run_clipper(args, progress)

            meta = json.loads((d / "out" / "clips.json").read_text(encoding="utf-8"))
            clips = meta["clips"]
            await self._status(job, texts.PROGRESS.format(line=f"Отправляю {texts.clips_word(len(clips))}…"))
            for c in clips:
                caption = f"{c['title']}\n\nХук: {c['hook']}\n{c['start']:.0f}–{c['end']:.0f} с"
                await self.bot.send_video(job.chat_id, FSInputFile(d / "out" / c["file"]), caption=caption[:1024],
                                          width=1080, height=1920, duration=int(c["duration"]),
                                          supports_streaming=True, request_timeout=600)
            await self.bot.send_document(job.chat_id, FSInputFile(d / "out" / "clips.md", filename="клипы.md"))
            self.db.job_status(job.id, "done", clips=len(clips))
            await self._status(job, texts.DONE.format(n=texts.clips_word(len(clips))))
        except Exception as e:
            log.exception("job %s failed", job.id)
            self.db.job_status(job.id, "failed", error=str(e)[:500])
            self.db.refund(job.user_id, job.paid)
            await self.bot.send_message(job.chat_id, texts.FAILED.format(err=str(e)[:300]))
        finally:
            shutil.rmtree(d, ignore_errors=True)
