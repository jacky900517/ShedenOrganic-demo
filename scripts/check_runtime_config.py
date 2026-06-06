from __future__ import annotations

import argparse
import os
import sys


def errors_for_config(cloud_run: bool = False) -> list[str]:
    errors = []
    database_backend = os.environ.get("DATABASE_BACKEND", "sqlite").strip().lower()
    storage_backend = os.environ.get("FILE_STORAGE_BACKEND", "local").strip().lower()

    if database_backend not in {"sqlite", "postgres", "postgresql"}:
        errors.append("DATABASE_BACKEND must be sqlite or postgres")
    if database_backend in {"postgres", "postgresql"} and not os.environ.get("DATABASE_URL"):
        errors.append("DATABASE_URL is required when DATABASE_BACKEND=postgres")

    if storage_backend not in {"local", "gcs"}:
        errors.append("FILE_STORAGE_BACKEND must be local or gcs")
    if storage_backend == "gcs" and not os.environ.get("GCS_BUCKET"):
        errors.append("GCS_BUCKET is required when FILE_STORAGE_BACKEND=gcs")

    allow_default_users = os.environ.get("ALLOW_DEFAULT_USERS", "1").strip()
    if cloud_run:
        if database_backend not in {"postgres", "postgresql"}:
            errors.append("Cloud Run should use DATABASE_BACKEND=postgres")
        if storage_backend != "gcs":
            errors.append("Cloud Run should use FILE_STORAGE_BACKEND=gcs")
        if allow_default_users != "0":
            errors.append("Cloud Run should set ALLOW_DEFAULT_USERS=0")
        if not os.environ.get("INITIAL_ROOT_PASSWORD"):
            errors.append("Cloud Run first startup needs INITIAL_ROOT_PASSWORD from Secret Manager")
        if os.environ.get("AUTH_COOKIE_SECURE") != "1":
            errors.append("Cloud Run should set AUTH_COOKIE_SECURE=1")

    return errors


def main() -> None:
    parser = argparse.ArgumentParser(description="Validate runtime environment settings.")
    parser.add_argument("--cloud-run", action="store_true", help="Enforce Cloud Run production settings.")
    args = parser.parse_args()

    errors = errors_for_config(args.cloud_run)
    if errors:
        for error in errors:
            print(f"ERROR: {error}", file=sys.stderr)
        raise SystemExit(1)
    print("runtime config check passed")


if __name__ == "__main__":
    main()
