from __future__ import annotations

from typing import List

from ..repositories import page_repo


class PageService:
    def add_page(self, fb_page_id: str, page_token: str) -> int:
        if not fb_page_id or not page_token:
            raise ValueError("fb_page_id và page_token là bắt buộc")
        return page_repo.add(fb_page_id, page_token)

    def list_pages(self) -> List[dict]:
        return page_repo.list()

    def remove_page(self, page_id: int) -> None:
        if not page_repo.get(page_id):
            raise ValueError("Page không tồn tại")
        page_repo.remove(page_id)

    def get(self, page_id: int) -> dict:
        page = page_repo.get(page_id)
        if not page:
            raise ValueError("Page không tồn tại")
        return page


page_service = PageService()
