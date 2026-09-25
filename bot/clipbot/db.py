"""SQLite storage: users, quotas, subscriptions, jobs, payments."""
from __future__ import annotations

import sqlite3
import time
from dataclasses import dataclass
from pathlib import Path

SCHEMA = """
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    username TEXT,
    created_at INTEGER NOT NULL,
    free_used INTEGER NOT NULL DEFAULT 0,
    sub_until INTEGER NOT NULL DEFAULT 0,
    runs_period TEXT NOT NULL DEFAULT '',
    runs_count INTEGER NOT NULL DEFAULT 0,
    style TEXT NOT NULL DEFAULT 'bold',
    reference_path TEXT
);
CREATE TABLE IF NOT EXISTS jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    source TEXT NOT NULL,
    status TEXT NOT NULL,
    paid INTEGER NOT NULL,
    created_at INTEGER NOT NULL,
    finished_at INTEGER,
    clips INTEGER,
    error TEXT
);
CREATE TABLE IF NOT EXISTS payments (
    charge_id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    amount INTEGER NOT NULL,
    created_at INTEGER NOT NULL,
    sub_until INTEGER NOT NULL
);
"""


@dataclass
class User:
    id: int
    username: str | None
    free_used: int
    sub_until: int
    runs_period: str
    runs_count: int
    style: str
    reference_path: str | None

    @property
    def subscribed(self) -> bool:
        return self.sub_until > time.time()


def _period(ts: float | None = None) -> str:
    return time.strftime("%Y-%m", time.gmtime(ts or time.time()))


class DB:
    def __init__(self, path: Path):
        path.parent.mkdir(parents=True, exist_ok=True)
        self.c = sqlite3.connect(path, isolation_level=None, check_same_thread=False)
        self.c.row_factory = sqlite3.Row
        self.c.executescript(SCHEMA)
        # Jobs interrupted by a restart would otherwise stay "running" forever.
        self.c.execute("UPDATE jobs SET status='failed', error='restart' WHERE status IN ('queued','running')")

    def user(self, uid: int, username: str | None = None) -> User:
        self.c.execute("INSERT OR IGNORE INTO users (id, username, created_at) VALUES (?, ?, ?)",
                       (uid, username, int(time.time())))
        if username:
            self.c.execute("UPDATE users SET username=? WHERE id=?", (username, uid))
        r = self.c.execute("SELECT * FROM users WHERE id=?", (uid,)).fetchone()
        return User(**{k: r[k] for k in User.__dataclass_fields__})

    def set_style(self, uid: int, style: str) -> None:
        self.c.execute("UPDATE users SET style=? WHERE id=?", (style, uid))

    def set_reference(self, uid: int, path: str | None) -> None:
        self.c.execute("UPDATE users SET reference_path=? WHERE id=?", (path, uid))

    # ---- quota ----
    def runs_left(self, u: User, monthly: int, free: int) -> tuple[int, bool]:
        """(runs left, is_paid)."""
        if u.subscribed:
            used = u.runs_count if u.runs_period == _period() else 0
            return max(0, monthly - used), True
        return max(0, free - u.free_used), False

    def consume(self, uid: int, paid: bool) -> None:
        if paid:
            p = _period()
            self.c.execute("UPDATE users SET runs_count = CASE WHEN runs_period=? THEN runs_count+1 ELSE 1 END, "
                           "runs_period=? WHERE id=?", (p, p, uid))
        else:
            self.c.execute("UPDATE users SET free_used = free_used + 1 WHERE id=?", (uid,))

    def refund(self, uid: int, paid: bool) -> None:
        col = "runs_count" if paid else "free_used"
        self.c.execute(f"UPDATE users SET {col} = MAX(0, {col} - 1) WHERE id=?", (uid,))

    # ---- payments ----
    def add_payment(self, charge_id: str, uid: int, amount: int, until: int) -> bool:
        """Returns False for a duplicate charge (Telegram may redeliver updates)."""
        cur = self.c.execute("INSERT OR IGNORE INTO payments VALUES (?, ?, ?, ?, ?)",
                             (charge_id, uid, amount, int(time.time()), until))
        if not cur.rowcount:
            return False
        self.c.execute("UPDATE users SET sub_until = MAX(sub_until, ?) WHERE id=?", (until, uid))
        return True

    # ---- jobs ----
    def new_job(self, uid: int, source: str, paid: bool) -> int:
        return self.c.execute("INSERT INTO jobs (user_id, source, status, paid, created_at) VALUES (?, ?, 'queued', ?, ?)",
                              (uid, source, int(paid), int(time.time()))).lastrowid

    def job_status(self, jid: int, status: str, clips: int | None = None, error: str | None = None) -> None:
        done = int(time.time()) if status in ("done", "failed") else None
        self.c.execute("UPDATE jobs SET status=?, clips=COALESCE(?, clips), error=COALESCE(?, error), "
                       "finished_at=COALESCE(?, finished_at) WHERE id=?", (status, clips, error, done, jid))

    def active_jobs(self, uid: int) -> int:
        return self.c.execute("SELECT COUNT(*) FROM jobs WHERE user_id=? AND status IN ('queued','running')",
                              (uid,)).fetchone()[0]

    def stats(self) -> dict:
        q = lambda sql, *a: self.c.execute(sql, a).fetchone()[0]
        now = int(time.time())
        return {
            "users": q("SELECT COUNT(*) FROM users"),
            "subscribers": q("SELECT COUNT(*) FROM users WHERE sub_until > ?", now),
            "jobs_done": q("SELECT COUNT(*) FROM jobs WHERE status='done'"),
            "jobs_failed": q("SELECT COUNT(*) FROM jobs WHERE status='failed'"),
            "jobs_queued": q("SELECT COUNT(*) FROM jobs WHERE status IN ('queued','running')"),
            "stars_total": q("SELECT COALESCE(SUM(amount), 0) FROM payments"),
            "stars_30d": q("SELECT COALESCE(SUM(amount), 0) FROM payments WHERE created_at > ?", now - 30 * 86400),
        }
