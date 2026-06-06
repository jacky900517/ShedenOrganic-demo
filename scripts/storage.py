from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def app_path_from_env(name: str, default: Path) -> Path:
    value = os.environ.get(name)
    if not value:
        return default
    path = Path(value).expanduser()
    return path if path.is_absolute() else ROOT / path


FILE_STORAGE_BACKEND = os.environ.get("FILE_STORAGE_BACKEND", "local").strip().lower()
APP_UPLOADS_DIR = app_path_from_env("APP_UPLOADS_DIR", ROOT / "uploads")
GCS_BUCKET = os.environ.get("GCS_BUCKET", "").strip()
GCS_PREFIX = os.environ.get("GCS_PREFIX", "").strip().strip("/")


@dataclass(frozen=True)
class StoredObject:
    file_name: str
    content_type: str
    size: int


class StorageBackend:
    def save_bytes(self, key: str, payload: bytes, content_type: str = "") -> StoredObject:
        raise NotImplementedError

    def read_bytes(self, key: str) -> tuple[bytes, str]:
        raise NotImplementedError

    def delete(self, key: str) -> None:
        raise NotImplementedError

    def exists(self, key: str) -> bool:
        raise NotImplementedError


class LocalStorageBackend(StorageBackend):
    def __init__(self, root: Path) -> None:
        self.root = root

    def path_for_key(self, key: str) -> Path:
        normalized = normalize_storage_key(key)
        return self.root / normalized

    def save_bytes(self, key: str, payload: bytes, content_type: str = "") -> StoredObject:
        path = self.path_for_key(key)
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(payload)
        return StoredObject(file_name=Path(key).name, content_type=content_type, size=len(payload))

    def read_bytes(self, key: str) -> tuple[bytes, str]:
        path = self.path_for_key(key)
        return path.read_bytes(), ""

    def delete(self, key: str) -> None:
        try:
            self.path_for_key(key).unlink()
        except FileNotFoundError:
            pass

    def exists(self, key: str) -> bool:
        return self.path_for_key(key).is_file()


class GcsStorageBackend(StorageBackend):
    def __init__(self, bucket_name: str, prefix: str = "") -> None:
        if not bucket_name:
            raise ValueError("GCS_BUCKET is required when FILE_STORAGE_BACKEND=gcs")
        try:
            from google.cloud import storage
        except ImportError as exc:
            raise RuntimeError("GCS storage requires google-cloud-storage") from exc
        self.client = storage.Client()
        self.bucket = self.client.bucket(bucket_name)
        self.prefix = prefix.strip("/")

    def blob_name_for_key(self, key: str) -> str:
        normalized = normalize_storage_key(key)
        return f"{self.prefix}/{normalized}" if self.prefix else normalized

    def save_bytes(self, key: str, payload: bytes, content_type: str = "") -> StoredObject:
        blob = self.bucket.blob(self.blob_name_for_key(key))
        blob.upload_from_string(payload, content_type=content_type or None)
        return StoredObject(file_name=Path(key).name, content_type=content_type, size=len(payload))

    def read_bytes(self, key: str) -> tuple[bytes, str]:
        blob = self.bucket.blob(self.blob_name_for_key(key))
        if not blob.exists():
            raise FileNotFoundError(key)
        blob.reload()
        return blob.download_as_bytes(), blob.content_type or ""

    def delete(self, key: str) -> None:
        blob = self.bucket.blob(self.blob_name_for_key(key))
        try:
            blob.delete()
        except Exception as exc:
            if exc.__class__.__name__ != "NotFound":
                raise

    def exists(self, key: str) -> bool:
        return self.bucket.blob(self.blob_name_for_key(key)).exists()


def normalize_storage_key(key: str) -> str:
    normalized = str(key or "").strip().replace("\\", "/").strip("/")
    if not normalized or ".." in normalized.split("/"):
        raise ValueError("Invalid storage key")
    return normalized


def storage_backend() -> StorageBackend:
    if FILE_STORAGE_BACKEND == "local":
        return LocalStorageBackend(APP_UPLOADS_DIR)
    if FILE_STORAGE_BACKEND == "gcs":
        return GcsStorageBackend(GCS_BUCKET, GCS_PREFIX)
    raise ValueError("FILE_STORAGE_BACKEND must be local or gcs")
