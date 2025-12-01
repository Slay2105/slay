#!/usr/bin/env python3
"""Telegram + Flask control surface for the TikTok → Facebook reup bot."""
from __future__ import annotations

import logging
import threading
import time
from functools import wraps
from textwrap import dedent
from typing import Callable, Optional

from app.config import settings
from app.services.page_service import page_service
from app.services.reup_service import reup_service
from app.services.source_service import source_service

try:
    import telebot
except ImportError as exc:  # pragma: no cover - runtime dependency guard
    raise SystemExit(
        "Missing dependency 'pyTelegramBotAPI'. Run `pip install -r requirements.txt`."
    ) from exc

try:
    from flask import Flask, redirect, render_template_string, request, url_for
except ImportError:  # pragma: no cover - dashboard optional
    Flask = None  # type: ignore
    redirect = None  # type: ignore
    render_template_string = None  # type: ignore
    request = None  # type: ignore
    url_for = None  # type: ignore


if not settings.telegram_bot_token:
    raise SystemExit("Environment variable TELEGRAM_BOT_TOKEN is required to run auto.py")

LOG_PATH = settings.data_dir / "auto.log"
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[
        logging.FileHandler(LOG_PATH, encoding="utf-8"),
        logging.StreamHandler(),
    ],
)
logger = logging.getLogger("auto")

bot = telebot.TeleBot(settings.telegram_bot_token, parse_mode="HTML")


HELP_TEXT = dedent(
    """
    <b>Tool reup TikTok → nhiều fanpage Facebook</b>

    <b>QUẢN LÝ PAGE</b>
    /addpage &lt;fb_page_id&gt; &lt;page_token&gt;
    /listpages
    /removepage &lt;id&gt;

    <b>NGUỒN REUP</b>
    /addurl &lt;page_id&gt; &lt;tiktok_url&gt;
    /adduser &lt;page_id&gt; &lt;username hoặc @username&gt;
    /addtag &lt;page_id&gt; &lt;tag hoặc #tag&gt;
    /listsources
    /removesource &lt;id&gt;

    <b>CHẠY REUP</b>
    /post &lt;page_id&gt; &lt;tiktok_url&gt;
    /scanpost
    /check
    /stats
    /auto - xem trạng thái auto-mode

    Nếu SCAN_INTERVAL &gt; 0, bot sẽ tự scan & reup định kỳ.
    Video lỗi &gt;= 3 lần sẽ chuyển sang trạng thái CHỜ.
    """
).strip()


def admin_only(handler: Callable) -> Callable:
    """Decorator to restrict commands to ADMIN_ID when configured."""

    @wraps(handler)
    def wrapper(message):  # type: ignore[override]
        admin_id = settings.telegram_admin_id
        if admin_id and message.from_user.id != admin_id:
            bot.reply_to(message, "Bạn không có quyền dùng bot này.")
            logger.warning("Blocked unauthorized user id=%s", message.from_user.id)
            return
        return handler(message)

    return wrapper


def admin_notify(text: str) -> None:
    if not settings.telegram_admin_id:
        return
    try:
        bot.send_message(settings.telegram_admin_id, text, parse_mode="HTML")
    except Exception as exc:  # pragma: no cover - network failures
        logger.exception("admin_notify failed: %s", exc)


def run_in_background(target: Callable, *args, **kwargs) -> None:
    threading.Thread(target=target, args=args, kwargs=kwargs, daemon=True).start()


def render_scan_summary(scan_result: dict, retry_result: dict) -> str:
    parts = [
        f"✅ mới đăng: {scan_result.get('posted', 0)}",
        f"🔍 tìm thấy: {scan_result.get('discovered', 0)}",
        f"♻️ đăng lại: {retry_result.get('posted', 0)}",
    ]
    failures = (scan_result.get("failures") or []) + (retry_result.get("failures") or [])
    if failures:
        parts.append("⚠️ lỗi: " + "; ".join(failures[:5]))
    return " | ".join(parts)


def run_scan_cycle(chat_id: Optional[int] = None) -> None:
    try:
        scan_result = reup_service.scan_sources(settings.max_scan_videos)
        retry_result = reup_service.retry_pending(settings.max_scan_videos)
        summary = render_scan_summary(scan_result, retry_result)
        logger.info("Scan cycle finished: %s", summary)
        if chat_id:
            bot.send_message(chat_id, summary)
        else:
            admin_notify(f"[AUTO] {summary}")
    except Exception as exc:  # pragma: no cover - runtime guard
        logger.exception("Scan cycle failed: %s", exc)
        if chat_id:
            bot.send_message(chat_id, f"❌ Scan lỗi: {exc}")
        else:
            admin_notify(f"❌ AUTO lỗi: {exc}")


def post_video(chat_id: int, page_id: int, url: str) -> None:
    try:
        result = reup_service.post_now(page_id, url)
        bot.send_message(chat_id, f"✅ Đã reup video {result['tiktok_id']} lên page #{page_id}")
    except Exception as exc:
        logger.exception("post_video failed: %s", exc)
        bot.send_message(chat_id, f"❌ Lỗi: {exc}")


class SchedulerWorker(threading.Thread):
    def __init__(self, interval: int) -> None:
        super().__init__(daemon=True)
        self.interval = interval
        self._stop_event = threading.Event()

    def run(self) -> None:
        if self.interval <= 0:
            logger.info("Scheduler disabled (SCAN_INTERVAL <= 0)")
            return
        logger.info("Scheduler started, interval=%ss", self.interval)
        admin_notify(f"[AUTO] Scheduler chạy, chu kỳ {self.interval}s")
        while not self._stop_event.is_set():
            run_scan_cycle()
            self._stop_event.wait(self.interval)

    def stop(self) -> None:
        self._stop_event.set()


scheduler_worker = SchedulerWorker(settings.scan_interval_seconds)


@bot.message_handler(commands=["start", "help"])
@admin_only
def handle_help(message) -> None:
    bot.reply_to(message, HELP_TEXT)


@bot.message_handler(commands=["addpage"])
@admin_only
def handle_addpage(message) -> None:
    parts = message.text.split(maxsplit=2)
    if len(parts) < 3:
        bot.reply_to(message, "Dùng: /addpage <fb_page_id> <page_token>")
        return
    fb_page_id, page_token = parts[1], parts[2]
    page_id = page_service.add_page(fb_page_id, page_token)
    bot.reply_to(message, f"✅ Đã thêm page #{page_id} (FB ID {fb_page_id})")


@bot.message_handler(commands=["listpages"])
@admin_only
def handle_listpages(message) -> None:
    pages = page_service.list_pages()
    if not pages:
        bot.reply_to(message, "Chưa có page nào. Dùng /addpage để thêm.")
        return
    lines = [f"#{p['id']} | fb_id:{p['fb_page_id']}" for p in pages[:100]]
    bot.reply_to(message, "\n".join(lines))


@bot.message_handler(commands=["removepage"])
@admin_only
def handle_removepage(message) -> None:
    parts = message.text.split(maxsplit=1)
    if len(parts) < 2:
        bot.reply_to(message, "Dùng: /removepage <id>")
        return
    try:
        page_id = int(parts[1])
        page_service.remove_page(page_id)
        bot.reply_to(message, f"✅ Đã xoá page #{page_id}")
    except Exception as exc:
        bot.reply_to(message, f"❌ Lỗi: {exc}")


@bot.message_handler(commands=["listsources"])
@admin_only
def handle_listsources(message) -> None:
    sources = source_service.list_sources()
    if not sources:
        bot.reply_to(message, "Chưa có nguồn. Dùng /addurl, /adduser hoặc /addtag.")
        return
    lines = [
        f"#{s['id']} | page:{s['page_id']} | {s['type']} | {s['value']}"
        for s in sources[:100]
    ]
    bot.reply_to(message, "\n".join(lines))


def _handle_source_add(message, source_type: str) -> None:
    parts = message.text.split(maxsplit=2)
    if len(parts) < 3:
        bot.reply_to(message, f"Dùng: /add{source_type} <page_id> <value>")
        return
    try:
        page_id = int(parts[1])
    except ValueError:
        bot.reply_to(message, "page_id phải là số. Xem bằng /listpages")
        return
    value = parts[2].strip()
    try:
        if source_type == "url":
            source_service.add_url(page_id, value)
        elif source_type == "user":
            source_service.add_user(page_id, value)
        elif source_type == "tag":
            source_service.add_tag(page_id, value)
        bot.reply_to(message, f"✅ Đã thêm nguồn {source_type} cho page #{page_id}")
    except Exception as exc:
        bot.reply_to(message, f"❌ Lỗi: {exc}")


@bot.message_handler(commands=["addurl"])
@admin_only
def handle_addurl(message) -> None:
    _handle_source_add(message, "url")


@bot.message_handler(commands=["adduser"])
@admin_only
def handle_adduser(message) -> None:
    _handle_source_add(message, "user")


@bot.message_handler(commands=["addtag"])
@admin_only
def handle_addtag(message) -> None:
    _handle_source_add(message, "tag")


@bot.message_handler(commands=["removesource"])
@admin_only
def handle_removesource(message) -> None:
    parts = message.text.split(maxsplit=1)
    if len(parts) < 2:
        bot.reply_to(message, "Dùng: /removesource <id>")
        return
    try:
        source_id = int(parts[1])
        source_service.remove_source(source_id)
        bot.reply_to(message, f"✅ Đã xoá nguồn #{source_id}")
    except Exception as exc:
        bot.reply_to(message, f"❌ Lỗi: {exc}")


@bot.message_handler(commands=["post"])
@admin_only
def handle_post(message) -> None:
    parts = message.text.split(maxsplit=2)
    if len(parts) < 3:
        bot.reply_to(message, "Dùng: /post <page_id> <tiktok_url>")
        return
    try:
        page_id = int(parts[1])
    except ValueError:
        bot.reply_to(message, "page_id phải là số")
        return
    url = parts[2].strip()
    bot.reply_to(message, f"Đang reup video này lên page #{page_id} ...")
    run_in_background(post_video, message.chat.id, page_id, url)


@bot.message_handler(commands=["scanpost"])
@admin_only
def handle_scan(message) -> None:
    bot.reply_to(message, "Bot đang quét tất cả nguồn & reup tối đa 5 video mới ...")
    run_in_background(run_scan_cycle, message.chat.id)


@bot.message_handler(commands=["check"])
@admin_only
def handle_check(message) -> None:
    pending = reup_service.pending_overview()
    if not pending:
        bot.reply_to(message, "Không có video chờ.")
        return
    lines = []
    for item in pending[:50]:
        last_error = item.get("last_error") or ""
        lines.append(
            f"Page #{item['page_id']} | {item['tiktok_id']} | trạng thái {item['status']} | lỗi: {last_error}"
        )
    bot.reply_to(message, "\n".join(lines))


@bot.message_handler(commands=["stats"])
@admin_only
def handle_stats(message) -> None:
    stats = reup_service.stats()
    if not stats:
        bot.reply_to(message, "Chưa có dữ liệu")
        return
    lines = [f"{status}: {total}" for status, total in stats.items()]
    bot.reply_to(message, "\n".join(lines))


@bot.message_handler(commands=["auto"])
@admin_only
def handle_auto(message) -> None:
    if settings.scan_interval_seconds > 0:
        bot.reply_to(
            message,
            f"Auto-mode đang bật. Chu kỳ {settings.scan_interval_seconds}s. Ghi log tại {LOG_PATH}.",
        )
    else:
        bot.reply_to(message, "Auto-mode đang tắt. Đặt SCAN_INTERVAL > 0 để bật.")


# ------------------- Flask dashboard (optional) -------------------
if Flask is not None and settings.admin_password:
    flask_app = Flask(__name__)

    def require_admin(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            pw = request.args.get("pw") or request.form.get("pw")
            if pw != settings.admin_password:
                return redirect(url_for("login"))
            return fn(*args, **kwargs)

        return wrapper

    @flask_app.get("/")
    def login():
        return render_template_string(
            """
            <h2>Auto Reup Dashboard</h2>
            <form action="/dashboard">
                Admin password: <input type="password" name="pw" />
                <button>Enter</button>
            </form>
            """
        )

    @flask_app.get("/dashboard")
    @require_admin
    def dashboard():
        pages = page_service.list_pages()
        sources = source_service.list_sources()
        pending = reup_service.pending_overview()
        stats = reup_service.stats()
        return render_template_string(
            """
            <h2>Dashboard</h2>
            <p><a href="/">Đăng xuất</a></p>

            <h3>Pages</h3>
            <table border=1>
                <tr><th>ID</th><th>FB Page</th><th>Token</th></tr>
                {% for p in pages %}
                <tr><td>{{p['id']}}</td><td>{{p['fb_page_id']}}</td><td>{{p['page_token'][:6] + '***'}}</td></tr>
                {% endfor %}
            </table>
            <form method="post" action="/addpage">
                <h4>Thêm page</h4>
                FB Page ID: <input name="fb_page_id" />
                Token: <input name="page_token" />
                <input type="hidden" name="pw" value="{{request.args.get('pw')}}" />
                <button>Thêm</button>
            </form>

            <h3>Sources</h3>
            <table border=1>
                <tr><th>ID</th><th>Page</th><th>Type</th><th>Value</th></tr>
                {% for s in sources %}
                <tr><td>{{s['id']}}</td><td>{{s['page_id']}}</td><td>{{s['type']}}</td><td>{{s['value']}}</td></tr>
                {% endfor %}
            </table>
            <form method="post" action="/addsource">
                <h4>Thêm nguồn</h4>
                Page ID: <input name="page_id" />
                Type: <select name="type"><option value="url">url</option><option value="user">user</option><option value="tag">tag</option></select>
                Value: <input name="value" />
                <input type="hidden" name="pw" value="{{request.args.get('pw')}}" />
                <button>Thêm nguồn</button>
            </form>

            <h3>Pending / Stats</h3>
            <p>Stats: {{stats}}</p>
            <ul>
                {% for item in pending[:20] %}
                <li>Page {{item['page_id']}} | {{item['tiktok_id']}} | {{item['status']}}</li>
                {% endfor %}
            </ul>

            <form method="post" action="/run_scan">
                <input type="hidden" name="pw" value="{{request.args.get('pw')}}" />
                <button>Chạy scan & reup</button>
            </form>
            """,
            pages=pages,
            sources=sources,
            pending=pending,
            stats=stats,
            request=request,
        )

    @flask_app.post("/addpage")
    @require_admin
    def http_addpage():
        fb_page_id = request.form.get("fb_page_id")
        page_token = request.form.get("page_token")
        if not fb_page_id or not page_token:
            return "Missing", 400
        page_service.add_page(fb_page_id, page_token)
        return redirect(url_for("dashboard", pw=request.form.get("pw")))

    @flask_app.post("/addsource")
    @require_admin
    def http_addsource():
        page_id = request.form.get("page_id")
        value = request.form.get("value")
        source_type = request.form.get("type")
        if not page_id or not value or not source_type:
            return "Missing", 400
        page_id_int = int(page_id)
        if source_type == "url":
            source_service.add_url(page_id_int, value)
        elif source_type == "user":
            source_service.add_user(page_id_int, value)
        else:
            source_service.add_tag(page_id_int, value)
        return redirect(url_for("dashboard", pw=request.form.get("pw")))

    @flask_app.post("/run_scan")
    @require_admin
    def http_run_scan():
        run_in_background(run_scan_cycle)
        return redirect(url_for("dashboard", pw=request.form.get("pw")))
else:
    flask_app = None  # type: ignore


def start_flask_thread() -> None:
    if not flask_app:
        logger.info("Flask dashboard disabled (missing Flask or ADMIN_PASSWORD)")
        return
    threading.Thread(
        target=lambda: flask_app.run(
            host=settings.dashboard_host,
            port=settings.dashboard_port,
            threaded=True,
            use_reloader=False,
        ),
        daemon=True,
    ).start()
    logger.info(
        "Flask dashboard running at http://%s:%s (pw qua tham số ?pw=...)",
        settings.dashboard_host,
        settings.dashboard_port,
    )


def main() -> None:
    admin_notify("✅ auto.py starting up")
    start_flask_thread()
    scheduler_worker.start()
    bot.infinity_polling(skip_pending=True)


if __name__ == "__main__":
    main()
