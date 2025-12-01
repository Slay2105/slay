from __future__ import annotations

import sqlite3
from pathlib import Path
from typing import Any, Iterable, Optional

from .config import settings


class Database:
    """Lightweight SQLite helper with automatic schema management."""

    def __init__(self, db_path: Path | None = None) -> None:
        self.db_path = Path(db_path or settings.db_path)
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self._ensure_schema()

    def _get_connection(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA foreign_keys = ON;")
        return conn

    def execute(
        self,
        query: str,
        params: Iterable[Any] | None = None,
        *,
        fetchone: bool = False,
        fetchall: bool = False,
        commit: bool = False,
    ) -> Any:
        params = tuple(params or [])
        with self._get_connection() as conn:
            cursor = conn.execute(query, params)
            if commit:
                conn.commit()
            if fetchone:
                return cursor.fetchone()
            if fetchall:
                return cursor.fetchall()
            return cursor.lastrowid

    def _ensure_schema(self) -> None:
        statements = [
            """
            CREATE TABLE IF NOT EXISTS pages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                fb_page_id TEXT NOT NULL,
                page_token TEXT NOT NULL,
                fail_count INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            """,
            """
            CREATE TABLE IF NOT EXISTS sources (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                page_id INTEGER NOT NULL,
                type TEXT NOT NULL CHECK (type IN ('url','user','tag')),
                value TEXT NOT NULL,
                last_cursor TEXT,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(page_id, type, value),
                FOREIGN KEY(page_id) REFERENCES pages(id) ON DELETE CASCADE
            );
            """,
            """
            CREATE TABLE IF NOT EXISTS videos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                source_id INTEGER,
                page_id INTEGER NOT NULL,
                tiktok_id TEXT NOT NULL,
                tiktok_url TEXT NOT NULL,
                download_url TEXT,
                caption TEXT,
                status TEXT NOT NULL DEFAULT 'PENDING',
                failure_count INTEGER NOT NULL DEFAULT 0,
                last_error TEXT,
                posted_at TEXT,
                discovered_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(page_id, tiktok_id),
                FOREIGN KEY(source_id) REFERENCES sources(id) ON DELETE CASCADE,
                FOREIGN KEY(page_id) REFERENCES pages(id) ON DELETE CASCADE
            );
            """,
        ]

        with self._get_connection() as conn:
            cursor = conn.cursor()
            for statement in statements:
                cursor.execute(statement)
            conn.commit()


db = Database()
