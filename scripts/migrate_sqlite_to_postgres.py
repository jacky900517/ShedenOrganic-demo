from __future__ import annotations

import argparse
import json
import os
import sqlite3
from pathlib import Path
from typing import Any

from database import POSTGRES_SCHEMA, ROOT, app_path_from_env, split_sql_script


TABLES = [
    "app_snapshots",
    "sales_imports",
    "sales_rows",
    "store_notes",
    "store_routes",
    "shipment_entries",
    "stock_adjustment_entries",
    "harvest_entries",
    "harvest_messages",
    "field_work_messages",
    "field_work_message_photos",
    "field_zones",
    "field_net_houses",
    "field_work_records",
    "field_work_record_crops",
    "field_work_record_audit_logs",
    "field_bt_records",
    "net_house_status_records",
    "net_house_status_record_crops",
    "app_settings",
    "users",
    "auth_sessions",
]
IDENTITY_TABLES = {
    "app_snapshots",
    "sales_rows",
    "harvest_messages",
    "field_work_messages",
    "field_work_message_photos",
    "field_work_record_audit_logs",
    "users",
}


def quote_identifier(value: str) -> str:
    return '"' + value.replace('"', '""') + '"'


def sqlite_columns(conn: sqlite3.Connection, table: str) -> list[str]:
    rows = conn.execute(f"PRAGMA table_info({quote_identifier(table)})").fetchall()
    return [str(row["name"]) for row in rows]


def sqlite_count(conn: sqlite3.Connection, table: str, where: str = "") -> int:
    where_clause = f" WHERE {where}" if where else ""
    row = conn.execute(f"SELECT COUNT(*) AS count FROM {quote_identifier(table)}{where_clause}").fetchone()
    return int(row["count"] if row else 0)


def postgres_count(conn: Any, table: str) -> int:
    with conn.cursor() as cursor:
        cursor.execute(f"SELECT COUNT(*) FROM {quote_identifier(table)}")
        row = cursor.fetchone()
        return int(row[0] if row else 0)


def init_postgres(conn: Any) -> None:
    with conn.cursor() as cursor:
        for statement in split_sql_script(POSTGRES_SCHEMA):
            cursor.execute(statement)
    conn.commit()


def truncate_postgres(conn: Any) -> None:
    table_list = ", ".join(quote_identifier(table) for table in TABLES)
    with conn.cursor() as cursor:
        cursor.execute(f"TRUNCATE TABLE {table_list} RESTART IDENTITY CASCADE")
    conn.commit()


def reset_identity(conn: Any, table: str) -> None:
    with conn.cursor() as cursor:
        cursor.execute(f"SELECT COALESCE(MAX(id), 0) FROM {quote_identifier(table)}")
        max_id = int(cursor.fetchone()[0] or 0)
        if max_id > 0:
            cursor.execute("SELECT pg_get_serial_sequence(%s, 'id')", (table,))
            sequence_row = cursor.fetchone()
            sequence_name = sequence_row[0] if sequence_row else None
            if sequence_name:
                cursor.execute("SELECT setval(%s, %s, true)", (sequence_name, max_id))


def copy_table(
    sqlite_conn: sqlite3.Connection,
    postgres_conn: Any,
    table: str,
    batch_size: int,
    current_snapshot_only: bool,
) -> int:
    columns = sqlite_columns(sqlite_conn, table)
    if not columns:
        return 0
    column_sql = ", ".join(quote_identifier(column) for column in columns)
    placeholders = ", ".join("%s" for _ in columns)
    insert_sql = f"INSERT INTO {quote_identifier(table)} ({column_sql}) VALUES ({placeholders})"
    where_clause = " WHERE is_current = 1" if table == "app_snapshots" and current_snapshot_only else ""
    select_sql = f"SELECT {column_sql} FROM {quote_identifier(table)}{where_clause}"

    copied = 0
    batch = []
    with postgres_conn.cursor() as cursor:
        for row in sqlite_conn.execute(select_sql):
            batch.append(tuple(row[column] for column in columns))
            if len(batch) >= batch_size:
                cursor.executemany(insert_sql, batch)
                copied += len(batch)
                batch = []
        if batch:
            cursor.executemany(insert_sql, batch)
            copied += len(batch)
    postgres_conn.commit()
    if table in IDENTITY_TABLES:
        reset_identity(postgres_conn, table)
        postgres_conn.commit()
    return copied


def migrate(
    sqlite_path: Path,
    database_url: str,
    replace: bool,
    batch_size: int,
    current_snapshot_only: bool,
) -> dict[str, Any]:
    if not sqlite_path.exists():
        raise FileNotFoundError(f"SQLite database not found: {sqlite_path}")
    try:
        import psycopg
    except ImportError as exc:
        raise RuntimeError("Install psycopg before running PostgreSQL migration") from exc

    sqlite_conn = sqlite3.connect(sqlite_path)
    sqlite_conn.row_factory = sqlite3.Row
    postgres_conn = psycopg.connect(database_url)
    try:
        init_postgres(postgres_conn)
        if replace:
            truncate_postgres(postgres_conn)

        result = {}
        for table in TABLES:
            before = postgres_count(postgres_conn, table)
            copied = copy_table(sqlite_conn, postgres_conn, table, batch_size, current_snapshot_only)
            after = postgres_count(postgres_conn, table)
            source = sqlite_count(
                sqlite_conn,
                table,
                "is_current = 1" if table == "app_snapshots" and current_snapshot_only else "",
            )
            result[table] = {
                "sqliteRows": source,
                "copiedRows": copied,
                "postgresRowsBefore": before,
                "postgresRowsAfter": after,
                "matches": after == source if replace else after >= before + copied,
            }
        return result
    finally:
        sqlite_conn.close()
        postgres_conn.close()


def main() -> None:
    parser = argparse.ArgumentParser(description="Migrate local SQLite runtime data into PostgreSQL.")
    parser.add_argument(
        "--sqlite-path",
        type=Path,
        default=app_path_from_env("APP_DB_PATH", ROOT / "data" / "app.db"),
    )
    parser.add_argument("--database-url", default=os.environ.get("DATABASE_URL", ""))
    parser.add_argument("--replace", action="store_true", help="Truncate PostgreSQL tables before importing.")
    parser.add_argument(
        "--all-snapshots",
        action="store_true",
        help="Import all historical app_snapshots. By default only the current snapshot is imported.",
    )
    parser.add_argument("--batch-size", type=int, default=1000)
    args = parser.parse_args()

    if not args.database_url:
        raise SystemExit("DATABASE_URL or --database-url is required")

    result = migrate(
        args.sqlite_path.expanduser(),
        args.database_url,
        args.replace,
        args.batch_size,
        not args.all_snapshots,
    )
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
