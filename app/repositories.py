from __future__ import annotations

from dataclasses import dataclass
from typing import List, Optional

from .database import db


@dataclass
class Page:
    fb_page_id: str
    page_token: str
    id: int | None = None


class PageRepository:
    def add(self, fb_page_id: str, page_token: str) -> int:
        query = "INSERT INTO pages (fb_page_id, page_token) VALUES (?, ?)"
        return db.execute(query, (fb_page_id, page_token), commit=True)

    def list(self) -> List[dict]:
        rows = db.execute("SELECT * FROM pages ORDER BY id DESC", fetchall=True)
        return [dict(row) for row in rows]

    def remove(self, page_id: int) -> bool:
        query = "DELETE FROM pages WHERE id = ?"
        db.execute(query, (page_id,), commit=True)
        return True

    def get(self, page_id: int) -> Optional[dict]:
        row = db.execute("SELECT * FROM pages WHERE id = ?", (page_id,), fetchone=True)
        return dict(row) if row else None


@dataclass
class Source:
    page_id: int
    type: str
    value: str
    id: int | None = None


class SourceRepository:
    def add(self, page_id: int, source_type: str, value: str) -> int:
        query = "INSERT INTO sources (page_id, type, value) VALUES (?, ?, ?)"
        return db.execute(query, (page_id, source_type, value), commit=True)

    def list(self) -> List[dict]:
        rows = db.execute(
            """
            SELECT sources.*, pages.fb_page_id
            FROM sources
            JOIN pages ON pages.id = sources.page_id
            ORDER BY sources.id DESC
            """,
            fetchall=True,
        )
        return [dict(row) for row in rows]

    def remove(self, source_id: int) -> bool:
        db.execute("DELETE FROM sources WHERE id = ?", (source_id,), commit=True)
        return True

    def get_by_page(self, page_id: int) -> List[dict]:
        rows = db.execute(
            "SELECT * FROM sources WHERE page_id = ? ORDER BY id DESC",
            (page_id,),
            fetchall=True,
        )
        return [dict(row) for row in rows]

    def get(self, source_id: int) -> Optional[dict]:
        row = db.execute("SELECT * FROM sources WHERE id = ?", (source_id,), fetchone=True)
        return dict(row) if row else None


class VideoRepository:
    def record_discovery(
        self,
        *,
        page_id: int,
        source_id: int | None,
        tiktok_id: str,
        tiktok_url: str,
        caption: str,
        download_url: str,
    ) -> int | None:
        query = """
            INSERT OR IGNORE INTO videos (page_id, source_id, tiktok_id, tiktok_url, caption, download_url)
            VALUES (?, ?, ?, ?, ?, ?)
        """
        return db.execute(
            query,
            (page_id, source_id, tiktok_id, tiktok_url, caption, download_url),
            commit=True,
        )

    def get_by_tiktok(self, page_id: int, tiktok_id: str) -> dict | None:
        row = db.execute(
            "SELECT * FROM videos WHERE page_id = ? AND tiktok_id = ?",
            (page_id, tiktok_id),
            fetchone=True,
        )
        return dict(row) if row else None

    def mark_posted(self, video_id: int) -> None:
        db.execute(
            """
            UPDATE videos
            SET status = 'POSTED', posted_at = CURRENT_TIMESTAMP, last_error = NULL
            WHERE id = ?
            """,
            (video_id,),
            commit=True,
        )

    def ensure_download_url(self, video_id: int, download_url: str) -> None:
        db.execute(
            "UPDATE videos SET download_url = COALESCE(download_url, ?) WHERE id = ?",
            (download_url, video_id),
            commit=True,
        )

    def register_failure(self, video_id: int, error_message: str) -> None:
        db.execute(
            """
            UPDATE videos
            SET
                failure_count = failure_count + 1,
                status = CASE
                    WHEN failure_count + 1 >= 3 THEN 'WAITING'
                    ELSE 'FAILED'
                END,
                last_error = ?
            WHERE id = ?
            """,
            (error_message[:500], video_id),
            commit=True,
        )

    def ready_to_post(self, limit: int) -> List[dict]:
        rows = db.execute(
            """
            SELECT * FROM videos
            WHERE status IN ('PENDING', 'FAILED')
            ORDER BY discovered_at ASC
            LIMIT ?
            """,
            (limit,),
            fetchall=True,
        )
        return [dict(row) for row in rows]

    def unposted(self) -> List[dict]:
        rows = db.execute(
            "SELECT * FROM videos WHERE status != 'POSTED' ORDER BY discovered_at DESC",
            fetchall=True,
        )
        return [dict(row) for row in rows]

    def stats(self) -> dict:
        rows = db.execute(
            "SELECT status, COUNT(*) as total FROM videos GROUP BY status",
            fetchall=True,
        )
        return {row["status"]: row["total"] for row in rows}


page_repo = PageRepository()
source_repo = SourceRepository()
video_repo = VideoRepository()
