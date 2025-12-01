from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable, List

import requests

from ..config import settings


@dataclass
class TikTokVideo:
    tiktok_id: str
    share_url: str
    download_url: str
    caption: str


class TikTokClient:
    BASE_URL = "https://www.tikwm.com/api/"

    def __init__(self, *, timeout: int | None = None, fetch_limit: int | None = None) -> None:
        self.timeout = timeout or settings.request_timeout
        self.fetch_limit = fetch_limit or settings.tiktok_fetch_limit

    def video_from_url(self, url: str) -> TikTokVideo:
        payload = self._request({}, params={"url": url})
        return self._map_video(payload.get("data", {}))

    def user_feed(self, username: str) -> List[TikTokVideo]:
        payload = self._request(
            {"path": "user/posts/"},
            params={"unique_id": username, "count": self.fetch_limit},
        )
        videos = payload.get("data", {}).get("videos", [])
        return [self._map_video(item) for item in videos]

    def tag_feed(self, tag: str) -> List[TikTokVideo]:
        payload = self._request(
            {"path": "tag/posts/"},
            params={"tag": tag, "count": self.fetch_limit},
        )
        videos = payload.get("data", {}).get("videos", [])
        return [self._map_video(item) for item in videos]

    def _request(self, meta: dict, *, params: dict) -> dict:
        path = meta.get("path", "")
        url = self.BASE_URL + path
        response = requests.get(url, params=params, timeout=self.timeout)
        response.raise_for_status()
        data = response.json()
        if data.get("code") not in (0, 200):  # API uses both 0 and 200
            raise RuntimeError(data.get("msg", "TikTok API trả về lỗi"))
        return data

    def _map_video(self, payload: dict) -> TikTokVideo:
        if not payload:
            raise RuntimeError("Không tìm thấy dữ liệu video")
        download_url = (
            payload.get("play")
            or payload.get("wmplay")
            or payload.get("music")
            or payload.get("download_url")
            or payload.get("url")
        )
        return TikTokVideo(
            tiktok_id=str(payload.get("video_id") or payload.get("id")),
            share_url=payload.get("share_url") or payload.get("url", ""),
            download_url=download_url,
            caption=payload.get("title") or payload.get("desc") or "",
        )


tiktok_client = TikTokClient()
