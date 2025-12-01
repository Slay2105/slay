from __future__ import annotations

import sqlite3
from typing import List

from ..repositories import source_repo
from .page_service import page_service


class SourceService:
    def add_url(self, page_id: int, url: str) -> int:
        return self._add_source(page_id, "url", url.strip())

    def add_user(self, page_id: int, username: str) -> int:
        normalized = username.strip().lstrip("@")
        return self._add_source(page_id, "user", normalized)

    def add_tag(self, page_id: int, tag: str) -> int:
        normalized = tag.strip().lstrip("#")
        return self._add_source(page_id, "tag", normalized)

    def list_sources(self) -> List[dict]:
        return source_repo.list()

    def remove_source(self, source_id: int) -> None:
        if not source_repo.get(source_id):
            raise ValueError("Nguồn không tồn tại")
        source_repo.remove(source_id)

    def for_page(self, page_id: int) -> List[dict]:
        return source_repo.get_by_page(page_id)

    def _add_source(self, page_id: int, source_type: str, value: str) -> int:
        if not value:
            raise ValueError("Giá trị nguồn không hợp lệ")
        page_service.get(page_id)
        try:
            return source_repo.add(page_id, source_type, value)
        except sqlite3.IntegrityError as exc:  # pragma: no cover - user feedback path
            raise ValueError("Nguồn đã tồn tại cho page này") from exc


source_service = SourceService()
