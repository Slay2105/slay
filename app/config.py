from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path
from typing import Optional


@dataclass(frozen=True)
class Settings:
    """Container for runtime configuration."""

    data_dir: Path
    db_path: Path
    scan_interval_seconds: int
    max_scan_videos: int
    request_timeout: int
    tiktok_fetch_limit: int
    telegram_bot_token: Optional[str]
    telegram_admin_id: Optional[int]
    admin_password: Optional[str]
    dashboard_host: str
    dashboard_port: int


def _resolve_settings() -> Settings:
    project_root = Path(os.environ.get("PROJECT_ROOT", Path(__file__).resolve().parent.parent))
    data_dir = Path(os.environ.get("DATA_DIR", project_root / "data"))
    data_dir.mkdir(parents=True, exist_ok=True)

    db_path = Path(os.environ.get("DB_PATH", data_dir / "bot.db"))
    scan_interval_seconds = int(os.environ.get("SCAN_INTERVAL", "0"))
    max_scan_videos = int(os.environ.get("MAX_SCAN_VIDEOS", "5"))
    request_timeout = int(os.environ.get("REQUEST_TIMEOUT", "15"))
    tiktok_fetch_limit = int(os.environ.get("TIKTOK_FETCH_LIMIT", "20"))
    telegram_bot_token = os.environ.get("TELEGRAM_BOT_TOKEN")
    telegram_admin_id = os.environ.get("TELEGRAM_ADMIN_ID")
    telegram_admin_id = int(telegram_admin_id) if telegram_admin_id else None
    admin_password = os.environ.get("ADMIN_PASSWORD")
    dashboard_host = os.environ.get("DASHBOARD_HOST", "0.0.0.0")
    dashboard_port = int(os.environ.get("DASHBOARD_PORT", "5000"))

    return Settings(
        data_dir=data_dir,
        db_path=db_path,
        scan_interval_seconds=scan_interval_seconds,
        max_scan_videos=max_scan_videos,
        request_timeout=request_timeout,
        tiktok_fetch_limit=tiktok_fetch_limit,
        telegram_bot_token=telegram_bot_token,
        telegram_admin_id=telegram_admin_id,
        admin_password=admin_password,
        dashboard_host=dashboard_host,
        dashboard_port=dashboard_port,
    )


settings = _resolve_settings()
