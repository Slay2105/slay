#!/usr/bin/env python3
from __future__ import annotations

import sys
from textwrap import dedent
from typing import Callable, Dict, List

from app.config import settings
from app.services.page_service import page_service
from app.services.reup_service import reup_service
from app.services.scheduler import auto_scanner
from app.services.source_service import source_service

CommandHandler = Callable[[List[str]], None]


def handle_addpage(args: List[str]) -> None:
    if len(args) != 2:
        raise ValueError("/addpage <fb_page_id> <page_token>")
    fb_page_id, page_token = args
    page_id = page_service.add_page(fb_page_id, page_token)
    print(f"Đã thêm page #{page_id} ({fb_page_id})")


def handle_listpages(_: List[str]) -> None:
    pages = page_service.list_pages()
    if not pages:
        print("Chưa có page nào. Dùng /addpage để thêm.")
        return
    for page in pages:
        print(f"#{page['id']} - FB Page ID: {page['fb_page_id']}")


def handle_removepage(args: List[str]) -> None:
    if len(args) != 1:
        raise ValueError("/removepage <id>")
    page_id = int(args[0])
    page_service.remove_page(page_id)
    print(f"Đã xoá page #{page_id}")


def handle_addurl(args: List[str]) -> None:
    if len(args) != 2:
        raise ValueError("/addurl <page_id> <tiktok_url>")
    page_id = int(args[0])
    url = args[1]
    source_id = source_service.add_url(page_id, url)
    print(f"Đã thêm nguồn URL #{source_id}")


def handle_adduser(args: List[str]) -> None:
    if len(args) != 2:
        raise ValueError("/adduser <page_id> <username>")
    page_id = int(args[0])
    username = args[1]
    source_id = source_service.add_user(page_id, username)
    print(f"Đã thêm nguồn user #{source_id}")


def handle_addtag(args: List[str]) -> None:
    if len(args) != 2:
        raise ValueError("/addtag <page_id> <tag>")
    page_id = int(args[0])
    tag = args[1]
    source_id = source_service.add_tag(page_id, tag)
    print(f"Đã thêm nguồn tag #{source_id}")


def handle_listsources(_: List[str]) -> None:
    sources = source_service.list_sources()
    if not sources:
        print("Chưa có nguồn nào. Dùng /addurl, /adduser hoặc /addtag.")
        return
    for src in sources:
        print(
            f"#{src['id']} | page #{src['page_id']} | {src['type']} | {src['value']}"
        )


def handle_removesource(args: List[str]) -> None:
    if len(args) != 1:
        raise ValueError("/removesource <id>")
    source_id = int(args[0])
    source_service.remove_source(source_id)
    print(f"Đã xoá nguồn #{source_id}")


def handle_post(args: List[str]) -> None:
    if len(args) != 2:
        raise ValueError("/post <page_id> <tiktok_url>")
    page_id = int(args[0])
    url = args[1]
    result = reup_service.post_now(page_id, url)
    print(f"Đã reup video {result['tiktok_id']} lên page #{page_id}")


def handle_scan(_: List[str]) -> None:
    result = reup_service.scan_sources(settings.max_scan_videos)
    print(
        f"Scan xong: phát hiện {result['discovered']} | đã reup {result['posted']} video mới"
    )
    if result["failures"]:
        print("Lỗi:")
        for fail in result["failures"]:
            print(f" - {fail}")


def handle_check(_: List[str]) -> None:
    pending = reup_service.pending_overview()
    if not pending:
        print("Không có video tồn")
        return
    for item in pending:
        note = item["last_error"] or ""
        print(
            f"Video {item['tiktok_id']} | page #{item['page_id']} | trạng thái {item['status']} | lỗi: {note}"
        )


def handle_stats(_: List[str]) -> None:
    stats = reup_service.stats()
    if not stats:
        print("Chưa có dữ liệu video")
        return
    for status, total in stats.items():
        print(f"{status}: {total}")


def handle_auto(_: List[str]) -> None:
    auto_scanner.start()


COMMANDS: Dict[str, CommandHandler] = {
    "/addpage": handle_addpage,
    "/listpages": handle_listpages,
    "/removepage": handle_removepage,
    "/addurl": handle_addurl,
    "/adduser": handle_adduser,
    "/addtag": handle_addtag,
    "/listsources": handle_listsources,
    "/removesource": handle_removesource,
    "/post": handle_post,
    "/scanpost": handle_scan,
    "/check": handle_check,
    "/stats": handle_stats,
    "/auto": handle_auto,
}


def print_help() -> None:
    print(
        dedent(
            """
            Các lệnh hỗ trợ:
              /addpage <fb_page_id> <page_token>
              /listpages
              /removepage <id>
              /addurl <page_id> <tiktok_url>
              /adduser <page_id> <username>
              /addtag <page_id> <tag>
              /listsources
              /removesource <id>
              /post <page_id> <tiktok_url>
              /scanpost
              /check
              /stats
              /auto (cần SCAN_INTERVAL > 0)
            """
        ).strip()
    )


def main(argv: List[str] | None = None) -> int:
    argv = argv or sys.argv[1:]
    if not argv:
        print_help()
        return 0
    command = argv[0]
    if not command.startswith("/"):
        command = "/" + command
    handler = COMMANDS.get(command.lower())
    if not handler:
        print(f"Không biết lệnh {command}")
        print_help()
        return 1
    try:
        handler(argv[1:])
    except Exception as exc:
        print(f"[ERROR] {exc}")
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
