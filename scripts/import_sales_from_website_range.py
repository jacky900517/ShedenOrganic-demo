from __future__ import annotations

import argparse
import csv
import json
import os
import subprocess
import sys
import time
from datetime import date, datetime, timedelta
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from database import connect, delete_sales_data, init_db, set_current_snapshot, taipei_now_text


ROOT = Path(__file__).resolve().parents[1]
DOCS_DATA_JSON = ROOT / "docs" / "data.json"
BUILD_SITE_DATA = ROOT / "scripts" / "build_site_data.py"


def app_path_from_env(name: str, default: Path) -> Path:
    value = os.environ.get(name)
    if not value:
        return default
    path = Path(value).expanduser()
    return path if path.is_absolute() else ROOT / path


UPLOADS = app_path_from_env("APP_UPLOADS_DIR", ROOT / "uploads")
DEFAULT_SERVER_URL = "http://localhost:4174"
CODEX_PYTHON = (
    Path.home()
    / ".cache"
    / "codex-runtimes"
    / "codex-primary-runtime"
    / "dependencies"
    / "python"
    / "bin"
    / "python3"
)
PYTHON = str(CODEX_PYTHON) if CODEX_PYTHON.exists() else sys.executable


def parse_date(value: str) -> date:
    return datetime.strptime(value, "%Y-%m-%d").date()


def date_range(start: date, end: date) -> list[date]:
    if end < start:
        raise ValueError("結束日期不可早於開始日期")
    current = start
    dates = []
    while current <= end:
        dates.append(current)
        current += timedelta(days=1)
    return dates


def post_json(url: str, payload: dict, timeout: int = 600) -> dict:
    body = json.dumps(payload).encode("utf-8")
    request = Request(
        url,
        data=body,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urlopen(request, timeout=timeout) as response:
            raw = response.read()
            return json.loads(raw.decode("utf-8"))
    except HTTPError as exc:
        raw = exc.read().decode("utf-8", errors="replace")
        try:
            payload = json.loads(raw)
        except json.JSONDecodeError:
            payload = {"error": raw or str(exc)}
        raise RuntimeError(payload.get("error") or str(exc)) from exc
    except URLError as exc:
        raise RuntimeError(f"無法連線到網頁 server：{exc.reason}") from exc


def clear_sales_data() -> None:
    conn = connect()
    try:
        init_db(conn)
        delete_sales_data(conn)
        conn.execute("DELETE FROM app_snapshots")
        conn.commit()
    finally:
        conn.close()
    if UPLOADS.exists():
        for path in UPLOADS.glob("*SalesData_4523_*.xlsx"):
            path.unlink(missing_ok=True)
        (UPLOADS / "sales_imports.json").unlink(missing_ok=True)


def rebuild_empty_snapshot() -> None:
    env = os.environ.copy()
    env.pop("SALES_FILE_PATH", None)
    env.pop("SALES_DATE", None)
    subprocess.run([PYTHON, str(BUILD_SITE_DATA)], cwd=str(ROOT), env=env, check=True)

    payload = json.loads(DOCS_DATA_JSON.read_text(encoding="utf-8"))
    conn = connect()
    try:
        init_db(conn)
        set_current_snapshot(conn, payload)
    finally:
        conn.close()


def import_sales_dates(server_url: str, dates: list[date], timing_output: Path) -> None:
    endpoint = server_url.rstrip("/") + "/api/import-sales-from-website"
    total = len(dates)
    timing_output.parent.mkdir(parents=True, exist_ok=True)
    with timing_output.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(
            handle,
            fieldnames=[
                "index",
                "total",
                "sales_date",
                "started_at",
                "finished_at",
                "elapsed_seconds",
                "file",
                "ok",
                "error",
            ],
        )
        writer.writeheader()
        for index, sales_date in enumerate(dates, start=1):
            label = sales_date.isoformat()
            started_at_iso = taipei_now_text()
            print(f"第 {index}/{total} 天：{label} 匯入中...", flush=True)
            started_at = time.monotonic()
            result: dict = {}
            error = ""
            try:
                result = post_json(endpoint, {"salesDate": label})
                if not result.get("ok"):
                    raise RuntimeError(result.get("error") or f"{label} 匯入失敗")
            except Exception as exc:
                error = str(exc)
            elapsed = time.monotonic() - started_at
            finished_at_iso = taipei_now_text()
            writer.writerow(
                {
                    "index": index,
                    "total": total,
                    "sales_date": label,
                    "started_at": started_at_iso,
                    "finished_at": finished_at_iso,
                    "elapsed_seconds": f"{elapsed:.3f}",
                    "file": result.get("file", ""),
                    "ok": "true" if not error else "false",
                    "error": error,
                }
            )
            handle.flush()
            if error:
                print(f"第 {index}/{total} 天：{label} 失敗，耗時 {elapsed:.1f} 秒：{error}", flush=True)
                raise RuntimeError(error)
            print(f"第 {index}/{total} 天：{label} 完成，檔案 {result.get('file')}，耗時 {elapsed:.1f} 秒", flush=True)


def main() -> None:
    parser = argparse.ArgumentParser(description="逐日呼叫網頁 API，從網站直接匯入銷售 Excel。")
    parser.add_argument("--start", default="2026-04-01", help="開始日期，格式 YYYY-MM-DD")
    parser.add_argument("--end", default="2026-04-30", help="結束日期，格式 YYYY-MM-DD")
    parser.add_argument("--server-url", default=DEFAULT_SERVER_URL, help="網頁 server URL")
    parser.add_argument("--keep-existing", action="store_true", help="保留既有匯入資料，不先清空")
    parser.add_argument(
        "--timing-output",
        default="",
        help="匯入耗時 CSV 輸出路徑，預設寫入 .codex_tmp/sales_import_timings_時間戳.csv",
    )
    args = parser.parse_args()

    dates = date_range(parse_date(args.start), parse_date(args.end))
    timing_output = (
        Path(args.timing_output)
        if args.timing_output
        else ROOT / ".codex_tmp" / f"sales_import_timings_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    )
    if not args.keep_existing:
        print("清除目前所有銷售匯入資料...", flush=True)
        clear_sales_data()
        print("重建空白銷售快照...", flush=True)
        rebuild_empty_snapshot()

    print(f"準備匯入 {dates[0].isoformat()} 到 {dates[-1].isoformat()}，共 {len(dates)} 天。", flush=True)
    print(f"耗時紀錄：{timing_output}", flush=True)
    import_sales_dates(args.server_url, dates, timing_output)
    print("全部匯入完成。", flush=True)


if __name__ == "__main__":
    main()
