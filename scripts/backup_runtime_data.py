from __future__ import annotations

import argparse
import json
import os
import shutil
import sqlite3
import zipfile
from datetime import datetime, timedelta, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
TAIPEI_TZ = timezone(timedelta(hours=8))


def app_path_from_env(name: str, default: Path) -> Path:
    value = os.environ.get(name)
    if not value:
        return default
    path = Path(value).expanduser()
    return path if path.is_absolute() else ROOT / path


def backup_sqlite_database(source: Path, destination: Path) -> bool:
    if not source.exists():
        return False
    destination.parent.mkdir(parents=True, exist_ok=True)
    with sqlite3.connect(source) as src, sqlite3.connect(destination) as dst:
        src.backup(dst)
    return True


def add_directory_to_zip(
    archive: zipfile.ZipFile,
    source_dir: Path,
    archive_prefix: str,
) -> int:
    if not source_dir.exists():
        return 0

    count = 0
    for path in sorted(source_dir.rglob("*")):
        if not path.is_file():
            continue
        if path.name in {".DS_Store", ".gitkeep"}:
            continue
        archive.write(path, Path(archive_prefix) / path.relative_to(source_dir))
        count += 1
    return count


def build_backup(output_dir: Path, db_path: Path, uploads_dir: Path) -> Path:
    timestamp = datetime.now(TAIPEI_TZ).strftime("%Y%m%d_%H%M%S")
    work_dir = output_dir / f"runtime_backup_{timestamp}"
    work_dir.mkdir(parents=True, exist_ok=False)

    db_backup_path = work_dir / "app.db"
    database_included = backup_sqlite_database(db_path, db_backup_path)
    manifest = {
        "createdAt": datetime.now(TAIPEI_TZ).isoformat(timespec="seconds"),
        "databaseSource": str(db_path),
        "databaseIncluded": database_included,
        "uploadsSource": str(uploads_dir),
        "uploadsFileCount": 0,
    }

    archive_path = output_dir / f"{work_dir.name}.zip"
    with zipfile.ZipFile(archive_path, "w", compression=zipfile.ZIP_DEFLATED) as archive:
        if database_included:
            archive.write(db_backup_path, "data/app.db")
        manifest["uploadsFileCount"] = add_directory_to_zip(archive, uploads_dir, "uploads")
        archive.writestr(
            "manifest.json",
            json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
        )

    shutil.rmtree(work_dir)
    return archive_path


def main() -> None:
    parser = argparse.ArgumentParser(description="Create a zip backup of runtime data before migrations or deploys.")
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=ROOT / "backups",
        help="Directory where the backup zip will be created.",
    )
    parser.add_argument(
        "--db-path",
        type=Path,
        default=app_path_from_env("APP_DB_PATH", ROOT / "data" / "app.db"),
        help="SQLite database path to back up.",
    )
    parser.add_argument(
        "--uploads-dir",
        type=Path,
        default=app_path_from_env("APP_UPLOADS_DIR", ROOT / "uploads"),
        help="Uploads directory to include in the backup.",
    )
    args = parser.parse_args()

    archive_path = build_backup(
        args.output_dir.expanduser(),
        args.db_path.expanduser(),
        args.uploads_dir.expanduser(),
    )
    print(archive_path)


if __name__ == "__main__":
    main()
