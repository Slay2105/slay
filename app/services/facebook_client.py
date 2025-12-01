from __future__ import annotations

import requests

from ..config import settings


class FacebookClient:
    GRAPH_BASE = "https://graph.facebook.com/v19.0"

    def __init__(self, *, timeout: int | None = None) -> None:
        self.timeout = timeout or settings.request_timeout

    def upload_video(
        self,
        *,
        page_id: str,
        page_token: str,
        video_url: str,
        caption: str,
    ) -> str:
        endpoint = f"{self.GRAPH_BASE}/{page_id}/videos"
        response = requests.post(
            endpoint,
            data={
                "access_token": page_token,
                "file_url": video_url,
                "description": caption,
            },
            timeout=self.timeout,
        )
        if response.status_code >= 400:
            raise RuntimeError(f"Facebook API lỗi: {response.text}")
        payload = response.json()
        video_id = payload.get("id")
        if not video_id:
            raise RuntimeError("Không nhận được id video từ Facebook")
        return video_id


facebook_client = FacebookClient()
