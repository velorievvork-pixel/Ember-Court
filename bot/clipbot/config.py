from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path


def _load_dotenv(path: Path) -> None:
    if not path.exists():
        return
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            k, v = line.split("=", 1)
            os.environ.setdefault(k.strip(), v.strip())


@dataclass(frozen=True)
class Config:
    token: str
    admin_ids: frozenset[int] = field(default_factory=frozenset)
    price_stars: int = 450
    monthly_runs: int = 30
    sub_clips: int = 8
    free_runs: int = 1
    free_clips: int = 3
    whisper: str = "small"
    workers: int = 1
    max_url_mb: int = 2000
    api_url: str = ""
    data_dir: Path = Path("data")

    @property
    def tg_file_limit_mb(self) -> int:
        # The public Bot API lets bots download files up to 20 MB; a self-hosted server allows up to 2000 MB.
        return 2000 if self.api_url else 20


def load() -> Config:
    _load_dotenv(Path(__file__).resolve().parent.parent / ".env")
    token = os.environ.get("BOT_TOKEN", "")
    if not token:
        raise SystemExit("Не задан BOT_TOKEN (см. bot/.env.example)")
    env = os.environ.get
    return Config(
        token=token,
        admin_ids=frozenset(int(x) for x in env("ADMIN_IDS", "").replace(" ", "").split(",") if x),
        price_stars=int(env("PRICE_STARS", 450)),
        monthly_runs=int(env("MONTHLY_RUNS", 30)),
        sub_clips=int(env("SUB_CLIPS", 8)),
        free_runs=int(env("FREE_RUNS", 1)),
        free_clips=int(env("FREE_CLIPS", 3)),
        whisper=env("WHISPER", "small"),
        workers=max(1, int(env("WORKERS", 1))),
        max_url_mb=int(env("MAX_URL_MB", 2000)),
        api_url=env("TELEGRAM_API_URL", "").rstrip("/"),
        data_dir=Path(env("DATA_DIR", "data")),
    )
