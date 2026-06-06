from __future__ import annotations

import argparse
import gzip
import json
import os
import re
import subprocess
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

import psycopg
from psycopg.conninfo import conninfo_to_dict
from psycopg.rows import dict_row


ROOT = Path(__file__).resolve().parents[1]
TAIPEI_TZ = timezone(timedelta(hours=8))
INVENTORY_SYNC_VERSION_KEY = "inventorySyncVersion"
GCLOUD_PYTHON = (
    Path.home()
    / ".cache"
    / "codex-runtimes"
    / "codex-primary-runtime"
    / "dependencies"
    / "python"
    / "bin"
    / "python3"
)


def taipei_now() -> datetime:
    return datetime.now(TAIPEI_TZ)


def taipei_now_text() -> str:
    return taipei_now().isoformat(timespec="seconds")


def require_date(value: str, label: str) -> str:
    normalized = str(value or "").strip()
    if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", normalized):
      raise ValueError(f"{label} must use YYYY-MM-DD format")
    return normalized


def gcloud_secret_value(secret_name: str, project: str) -> str:
    env = os.environ.copy()
    if GCLOUD_PYTHON.exists():
        env["CLOUDSDK_PYTHON"] = str(GCLOUD_PYTHON)
    return subprocess.check_output(
        ["gcloud", "secrets", "versions", "access", "latest", f"--secret={secret_name}", f"--project={project}"],
        text=True,
        env=env,
    ).strip()


def connection_kwargs(args: argparse.Namespace) -> dict[str, Any]:
    if args.use_gcp_secret:
        database_url = gcloud_secret_value(args.secret_name, args.project)
        info = conninfo_to_dict(database_url)
        return {
            "host": args.proxy_host,
            "port": args.proxy_port,
            "dbname": info.get("dbname") or "sheden_organic",
            "user": info.get("user"),
            "password": info.get("password"),
            "row_factory": dict_row,
        }
    database_url = os.environ.get("DATABASE_URL", "").strip()
    if not database_url:
        raise ValueError("DATABASE_URL is required unless --use-gcp-secret is passed")
    return {"conninfo": database_url, "row_factory": dict_row}


def connect_database(args: argparse.Namespace) -> psycopg.Connection:
    kwargs = connection_kwargs(args)
    conninfo = kwargs.pop("conninfo", None)
    if conninfo:
        return psycopg.connect(conninfo, **kwargs)
    return psycopg.connect(**kwargs)


def dump_rows(cur: psycopg.Cursor, sql: str, params: tuple[Any, ...]) -> list[dict[str, Any]]:
    cur.execute(sql, params)
    return [dict(row) for row in cur.fetchall()]


def shipment_date_summary(cur: psycopg.Cursor, from_date: str, to_date: str) -> dict[str, Any]:
    rows = dump_rows(
        cur,
        """
        SELECT
          shipment_date,
          COUNT(*) AS row_count,
          COUNT(DISTINCT store_key) AS store_count,
          COALESCE(SUM(quantity), 0) AS quantity_sum
        FROM shipment_entries
        WHERE shipment_date IN (%s, %s)
        GROUP BY shipment_date
        ORDER BY shipment_date
        """,
        (from_date, to_date),
    )
    conflict = cur.execute(
        """
        SELECT
          COUNT(*) AS row_count,
          COALESCE(SUM(source.quantity), 0) AS source_quantity_sum,
          COALESCE(SUM(target.quantity), 0) AS target_quantity_sum
        FROM shipment_entries source
        JOIN shipment_entries target
          ON target.store_key = source.store_key
         AND target.product_code = source.product_code
         AND target.shipment_date = %s
        WHERE source.shipment_date = %s
        """,
        (to_date, from_date),
    ).fetchone()
    return {
        "dates": rows,
        "conflicts": dict(conflict or {}),
    }


def backup_state(cur: psycopg.Cursor, args: argparse.Namespace, summary: dict[str, Any]) -> Path:
    args.backup_dir.mkdir(parents=True, exist_ok=True)
    backup_path = args.backup_dir / (
        f"shipment_entry_date_shift_{args.from_date}_to_{args.to_date}_"
        f"{taipei_now().strftime('%Y%m%d_%H%M%S')}.json.gz"
    )
    backup = {
        "createdAt": taipei_now_text(),
        "operation": "shift_shipment_entry_date",
        "fromDate": args.from_date,
        "toDate": args.to_date,
        "summaryBefore": summary,
        "sourceRows": dump_rows(
            cur,
            """
            SELECT *
            FROM shipment_entries
            WHERE shipment_date = %s
            ORDER BY store_key, product_code
            """,
            (args.from_date,),
        ),
        "targetRows": dump_rows(
            cur,
            """
            SELECT *
            FROM shipment_entries
            WHERE shipment_date = %s
            ORDER BY store_key, product_code
            """,
            (args.to_date,),
        ),
        "conflictRows": dump_rows(
            cur,
            """
            SELECT
              source.store_key,
              source.product_code,
              source.quantity AS source_quantity,
              source.updated_at AS source_updated_at,
              target.quantity AS target_quantity,
              target.updated_at AS target_updated_at
            FROM shipment_entries source
            JOIN shipment_entries target
              ON target.store_key = source.store_key
             AND target.product_code = source.product_code
             AND target.shipment_date = %s
            WHERE source.shipment_date = %s
            ORDER BY source.store_key, source.product_code
            """,
            (args.to_date, args.from_date),
        ),
        "inventorySyncVersion": dump_rows(
            cur,
            "SELECT * FROM app_settings WHERE setting_key = %s",
            (INVENTORY_SYNC_VERSION_KEY,),
        ),
    }
    with gzip.open(backup_path, "wt", encoding="utf-8") as handle:
        json.dump(backup, handle, ensure_ascii=False, separators=(",", ":"), default=str)
    return backup_path


def mark_inventory_sync_changed(cur: psycopg.Cursor, version: str) -> None:
    cur.execute(
        """
        INSERT INTO app_settings (setting_key, setting_value, updated_at)
        VALUES (%s, %s, %s)
        ON CONFLICT(setting_key) DO UPDATE SET
          setting_value = excluded.setting_value,
          updated_at = excluded.updated_at
        """,
        (
            INVENTORY_SYNC_VERSION_KEY,
            json.dumps(version, ensure_ascii=False, separators=(",", ":")),
            version,
        ),
    )


def run(args: argparse.Namespace) -> dict[str, Any]:
    args.from_date = require_date(args.from_date, "from-date")
    args.to_date = require_date(args.to_date, "to-date")
    if args.from_date == args.to_date:
        raise ValueError("from-date and to-date must be different")

    with connect_database(args) as conn:
        with conn.transaction():
            with conn.cursor() as cur:
                cur.execute("LOCK TABLE shipment_entries IN SHARE ROW EXCLUSIVE MODE")
                before = shipment_date_summary(cur, args.from_date, args.to_date)
                conflict_count = int(before["conflicts"].get("row_count") or 0)
                backup_path = backup_state(cur, args, before)

                moved_rows = 0
                sync_version = ""
                if args.apply:
                    if conflict_count:
                        raise ValueError(
                            f"Cannot shift dates because {conflict_count} target rows already exist on {args.to_date}."
                        )
                    sync_version = taipei_now_text()
                    result = cur.execute(
                        """
                        UPDATE shipment_entries
                        SET shipment_date = %s, updated_at = %s
                        WHERE shipment_date = %s
                        """,
                        (args.to_date, sync_version, args.from_date),
                    )
                    moved_rows = int(result.rowcount or 0)
                    mark_inventory_sync_changed(cur, sync_version)

                after = shipment_date_summary(cur, args.from_date, args.to_date)
    return {
        "applied": bool(args.apply),
        "fromDate": args.from_date,
        "toDate": args.to_date,
        "backupPath": str(backup_path),
        "movedRows": moved_rows,
        "syncVersion": sync_version,
        "before": before,
        "after": after,
    }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Shift shipment_entries from one shipment_date to another.")
    parser.add_argument("--from-date", required=True)
    parser.add_argument("--to-date", required=True)
    parser.add_argument("--apply", action="store_true", help="Write the date shift. Omit for dry-run.")
    parser.add_argument("--use-gcp-secret", action="store_true", help="Read DATABASE_URL from Secret Manager.")
    parser.add_argument("--secret-name", default="sheden-database-url")
    parser.add_argument("--project", default=os.environ.get("GCP_PROJECT", ""))
    parser.add_argument("--proxy-host", default="127.0.0.1")
    parser.add_argument("--proxy-port", type=int, default=5433)
    parser.add_argument("--backup-dir", type=Path, default=ROOT / "backups")
    return parser.parse_args()


def main() -> None:
    summary = run(parse_args())
    print(json.dumps(summary, ensure_ascii=False, indent=2, default=str))


if __name__ == "__main__":
    main()
