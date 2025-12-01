from __future__ import annotations

from typing import List

from ..config import settings
from ..repositories import page_repo, video_repo
from .facebook_client import facebook_client
from .page_service import page_service
from .source_service import source_service
from .tiktok_client import TikTokVideo, tiktok_client


class ReupService:
    def post_now(self, page_id: int, tiktok_url: str) -> dict:
        page = page_service.get(page_id)
        video = tiktok_client.video_from_url(tiktok_url)
        record = video_repo.get_by_tiktok(page_id, video.tiktok_id)
        if record:
            video_id = record["id"]
        else:
            video_id = video_repo.record_discovery(
                page_id=page_id,
                source_id=None,
                tiktok_id=video.tiktok_id,
                tiktok_url=video.share_url or tiktok_url,
                caption=video.caption,
                download_url=video.download_url,
            )
        video_repo.ensure_download_url(video_id, video.download_url)
        self._upload_with_tracking(video_id, page, video)
        return {"video_id": video_id, "tiktok_id": video.tiktok_id}

    def scan_sources(self, limit: int | None = None) -> dict:
        limit = limit or settings.max_scan_videos
        posted = 0
        discovered = 0
        failures: list[str] = []

        for page in page_repo.list():
            for src in source_service.for_page(page["id"]):
                if posted >= limit:
                    break
                try:
                    videos = self._fetch_by_source(src)
                except Exception as exc:  # pragma: no cover - network failure path
                    failures.append(f"Nguồn {src['id']}: {exc}")
                    continue
                for video in videos:
                    if posted >= limit:
                        break
                    already = video_repo.get_by_tiktok(page["id"], video.tiktok_id)
                    if already:
                        continue
                    video_id = video_repo.record_discovery(
                        page_id=page["id"],
                        source_id=src["id"],
                        tiktok_id=video.tiktok_id,
                        tiktok_url=video.share_url,
                        caption=video.caption,
                        download_url=video.download_url,
                    )
                    discovered += 1
                    try:
                        self._upload_with_tracking(video_id, page, video)
                        posted += 1
                    except Exception as exc:  # pragma: no cover - API failure path
                        failures.append(f"Video {video.tiktok_id}: {exc}")
        return {
            "discovered": discovered,
            "posted": posted,
            "failures": failures,
        }

    def retry_pending(self, limit: int | None = None) -> dict:
        limit = limit or settings.max_scan_videos
        attempts = 0
        posted = 0
        failures: list[str] = []
        for record in video_repo.ready_to_post(limit):
            page = page_service.get(record["page_id"])
            video = TikTokVideo(
                tiktok_id=record["tiktok_id"],
                share_url=record["tiktok_url"],
                download_url=record.get("download_url") or record["tiktok_url"],
                caption=record.get("caption") or "",
            )
            try:
                self._upload_with_tracking(record["id"], page, video)
                posted += 1
            except Exception as exc:  # pragma: no cover - API failure path
                failures.append(f"Video {record['tiktok_id']}: {exc}")
            attempts += 1
            if attempts >= limit:
                break
        return {"attempted": attempts, "posted": posted, "failures": failures}

    def pending_overview(self) -> List[dict]:
        records = video_repo.unposted()
        result: List[dict] = []
        for row in records:
            status = "CHỜ" if row["failure_count"] >= 3 else "OK"
            result.append(
                {
                    "video_id": row["id"],
                    "tiktok_id": row["tiktok_id"],
                    "page_id": row["page_id"],
                    "status": status,
                    "failure_count": row["failure_count"],
                    "last_error": row["last_error"],
                }
            )
        return result

    def stats(self) -> dict:
        return video_repo.stats()

    def _fetch_by_source(self, source: dict) -> List[TikTokVideo]:
        src_type = source["type"]
        value = source["value"]
        if src_type == "url":
            return [tiktok_client.video_from_url(value)]
        if src_type == "user":
            return tiktok_client.user_feed(value)
        if src_type == "tag":
            return tiktok_client.tag_feed(value)
        raise ValueError(f"Không hỗ trợ nguồn {src_type}")

    def _upload_with_tracking(self, video_id: int, page: dict, video: TikTokVideo) -> None:
        if not video.download_url:
            raise RuntimeError("Không có link tải video")
        try:
            facebook_client.upload_video(
                page_id=page["fb_page_id"],
                page_token=page["page_token"],
                video_url=video.download_url,
                caption=video.caption,
            )
        except Exception as exc:
            video_repo.register_failure(video_id, str(exc))
            raise
        video_repo.mark_posted(video_id)


reup_service = ReupService()
