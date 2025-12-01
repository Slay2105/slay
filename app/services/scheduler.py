from __future__ import annotations

import signal
import threading
import time
from typing import Optional

from ..config import settings
from .reup_service import reup_service


class AutoScanner:
    def __init__(self, interval: Optional[int] = None) -> None:
        self.interval = interval or settings.scan_interval_seconds
        self._stop_event = threading.Event()

    def start(self) -> None:
        if self.interval <= 0:
            raise ValueError("Thiết lập SCAN_INTERVAL phải > 0 để bật auto mode")
        self._stop_event.clear()
        print(f"[AUTO] Bắt đầu auto scan mỗi {self.interval} giây... (Ctrl+C để dừng)")
        self._install_signal_handlers()
        while not self._stop_event.is_set():
            self._run_cycle()
            self._stop_event.wait(self.interval)
        print("[AUTO] Đã dừng auto scan")

    def stop(self) -> None:
        self._stop_event.set()

    def _install_signal_handlers(self) -> None:
        signal.signal(signal.SIGINT, lambda *_: self.stop())
        signal.signal(signal.SIGTERM, lambda *_: self.stop())

    def _run_cycle(self) -> None:
        print("[AUTO] Quét các nguồn TikTok...")
        scan_result = reup_service.scan_sources()
        if scan_result["posted"]:
            print(f"[AUTO] Đã reup {scan_result['posted']} video mới")
        if scan_result["failures"]:
            for reason in scan_result["failures"]:
                print(f"[AUTO][FAIL] {reason}")

        retry_result = reup_service.retry_pending()
        if retry_result["posted"]:
            print(f"[AUTO] Đã reup lại {retry_result['posted']} video tồn")
        if retry_result["failures"]:
            for reason in retry_result["failures"]:
                print(f"[AUTO][FAIL] {reason}")


auto_scanner = AutoScanner()
