from __future__ import annotations

import json
import os
import re
import socket
import subprocess
import sys
import tempfile
import time
from http.cookiejar import CookieJar
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import HTTPCookieProcessor, Request, build_opener, urlopen

from storage import LocalStorageBackend


ROOT = Path(__file__).resolve().parents[1]


def free_port() -> int:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.bind(("127.0.0.1", 0))
        return int(sock.getsockname()[1])


def wait_for_server(url: str, timeout: float = 10.0) -> None:
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        try:
            with urlopen(url, timeout=1) as response:
                if response.status == 200:
                    return
        except URLError:
            time.sleep(0.2)
    raise RuntimeError(f"Server did not become ready: {url}")


def request_status(url: str) -> int:
    try:
        with urlopen(url, timeout=3) as response:
            return int(response.status)
    except HTTPError as exc:
        return int(exc.code)


def response_text_and_headers(url: str) -> tuple[str, dict[str, str]]:
    with urlopen(url, timeout=3) as response:
        return response.read().decode("utf-8"), dict(response.headers.items())


def json_request(opener, url: str, payload: dict, method: str = "POST") -> dict:
    body = json.dumps(payload).encode("utf-8")
    request = Request(
        url,
        data=body,
        headers={"Content-Type": "application/json"},
        method=method,
    )
    with opener.open(request, timeout=5) as response:
        return json.loads(response.read().decode("utf-8"))


def login_and_bootstrap(base_url: str) -> None:
    opener = build_opener(HTTPCookieProcessor(CookieJar()))
    payload = json_request(opener, base_url + "/api/login", {"username": "root", "password": "root1234"})
    if not payload.get("ok"):
        raise RuntimeError(f"Login failed: {payload}")
    created_user = json_request(
        opener,
        base_url + "/api/users",
        {
            "username": "worker-test",
            "displayName": "Worker Test",
            "password": "worker1234",
            "role": "inside",
        },
        method="POST",
    )
    user_id = created_user.get("user", {}).get("id")
    if not created_user.get("ok") or not user_id:
        raise RuntimeError(f"Create account user failed: {created_user}")
    updated_user = json_request(
        opener,
        base_url + f"/api/users/{user_id}",
        {
            "username": "worker-renamed",
            "displayName": "Worker Renamed",
            "password": "worker5678",
            "role": "inside",
            "isActive": True,
        },
        method="PUT",
    )
    updated_payload = updated_user.get("user") or {}
    if (
        not updated_user.get("ok")
        or updated_payload.get("username") != "worker-renamed"
        or updated_payload.get("displayName") != "Worker Renamed"
    ):
        raise RuntimeError(f"Update account user failed: {updated_user}")
    renamed_opener = build_opener(HTTPCookieProcessor(CookieJar()))
    renamed_login = json_request(
        renamed_opener,
        base_url + "/api/login",
        {"username": "worker-renamed", "password": "worker5678"},
    )
    if not renamed_login.get("ok"):
        raise RuntimeError(f"Renamed user login failed: {renamed_login}")
    saved_status = json_request(
        opener,
        base_url + "/api/net-house-status-records",
        {
            "recordDate": "2026-05-22",
            "zoneName": "一場",
            "netHouseCode": "1-7",
            "status": "種植",
            "cropName": "皺葉白",
            "plantedDate": "2026-05-22",
            "harvestDate": "2026-05-23",
            "estimatedQuantity": "12",
            "lunchMarked": True,
            "cropItems": [
                {
                    "cropName": "皺葉白",
                    "harvestDate": "2026-05-23",
                    "estimatedQuantity": "12",
                }
            ],
        },
        method="PUT",
    )
    if not saved_status.get("ok") or not saved_status.get("record", {}).get("lunchMarked"):
        raise RuntimeError(f"Net house status lunch marker failed: {saved_status}")
    planting_work = json_request(
        opener,
        base_url + "/api/field-work-records",
        {
            "workDate": "2026-05-24",
            "zoneName": "一場",
            "netHouseCode": "1-8",
            "taskKeys": ["directSow"],
            "directSowCropName": "空心菜",
        },
        method="PUT",
    )
    if not planting_work.get("ok") or not planting_work.get("netHouseStatusRecord"):
        raise RuntimeError(f"Field work planting sync failed: {planting_work}")
    if not planting_work.get("fieldWorkAuditLogged"):
        raise RuntimeError(f"Field work create did not write audit log: {planting_work}")
    if not any(task.get("accountName") == "admin" for task in planting_work.get("tasks") or []):
        raise RuntimeError(f"Field work response did not include account name: {planting_work}")
    harvest_update = json_request(
        opener,
        base_url + "/api/net-house-status-records",
        {
            "recordDate": "2026-05-24",
            "zoneName": "一場",
            "netHouseCode": "1-8",
            "status": "種植",
            "cropName": "空心菜",
            "plantedDate": "2026-05-24",
            "harvestDate": "2026-05-26",
            "cropItems": [{"cropName": "空心菜", "harvestDate": "2026-05-26"}],
        },
        method="PUT",
    )
    if not harvest_update.get("ok"):
        raise RuntimeError(f"Net house harvest date update failed: {harvest_update}")
    planting_period = json_request(
        opener,
        base_url + "/api/net-house-status-records",
        {
            "recordDate": "2026-05-01",
            "zoneName": "一場",
            "netHouseCode": "1-9",
            "status": "種植",
            "cropName": "小松菜",
            "plantedDate": "2026-05-01",
            "harvestDate": "2026-05-20",
            "cropItems": [
                {"cropName": "小松菜", "harvestDate": "2026-05-20", "estimatedQuantity": "12"},
                {"cropName": "小松菜", "harvestDate": "2026-05-27", "estimatedQuantity": "8"},
            ],
        },
        method="PUT",
    )
    planting_period_items = planting_period.get("record", {}).get("cropItems") or []
    if (
        not planting_period.get("ok")
        or len(planting_period_items) != 2
        or planting_period_items[1].get("harvestDate") != "2026-05-27"
    ):
        raise RuntimeError(f"Planting period setup failed: {planting_period}")
    mistaken_empty = json_request(
        opener,
        base_url + "/api/net-house-status-records",
        {
            "recordDate": "2026-05-15",
            "zoneName": "一場",
            "netHouseCode": "1-9",
            "status": "空園",
            "lunchMarked": False,
        },
        method="PUT",
    )
    mistaken_empty_items = mistaken_empty.get("record", {}).get("cropItems") or []
    if (
        not mistaken_empty.get("ok")
        or len(mistaken_empty_items) != 2
        or mistaken_empty_items[0].get("cropName") != "小松菜"
        or mistaken_empty_items[1].get("harvestDate") != "2026-05-27"
    ):
        raise RuntimeError(f"Mistaken empty status did not preserve planting details: {mistaken_empty}")
    restored_planting = json_request(
        opener,
        base_url + "/api/net-house-status-records",
        {
            "recordDate": "2026-05-15",
            "zoneName": "一場",
            "netHouseCode": "1-9",
            "status": "種植",
            "lunchMarked": False,
        },
        method="PUT",
    )
    restored_items = restored_planting.get("record", {}).get("cropItems") or []
    if (
        not restored_planting.get("ok")
        or restored_planting.get("record", {}).get("plantedDate") != "2026-05-01"
        or len(restored_items) != 2
        or restored_items[0].get("cropName") != "小松菜"
        or restored_items[0].get("harvestDate") != "2026-05-20"
        or restored_items[1].get("harvestDate") != "2026-05-27"
    ):
        raise RuntimeError(f"Restored planting status lost planting details: {restored_planting}")
    field_opener = build_opener(HTTPCookieProcessor(CookieJar()))
    field_login = json_request(
        field_opener,
        base_url + "/api/login",
        {"username": "field", "password": "field1234"},
    )
    if not field_login.get("ok"):
        raise RuntimeError(f"Field user login failed: {field_login}")
    with field_opener.open(base_url + "/api/bootstrap", timeout=10) as response:
        field_payload = json.loads(response.read().decode("utf-8"))
    field_net_house_records = field_payload.get("netHouseStatusRecords") or []
    field_matching_status = [
        record for record in field_net_house_records
        if record.get("recordDate") == "2026-05-24"
        and record.get("zoneName") == "一場"
        and record.get("netHouseCode") == "1-8"
    ]
    if not field_matching_status or field_matching_status[0].get("cropItems", [{}])[0].get("harvestDate") != "2026-05-26":
        raise RuntimeError("Field bootstrap did not include net-house harvest dates for planting guard")
    existing_work_update = json_request(
        opener,
        base_url + "/api/field-work-records",
        {
            "workDate": "2026-05-24",
            "zoneName": "一場",
            "netHouseCode": "1-8",
            "taskKeys": ["directSow", "weed"],
            "directSowCropName": "空心菜",
        },
        method="PUT",
    )
    if not existing_work_update.get("ok"):
        raise RuntimeError(f"Existing field work update during planting interval failed: {existing_work_update}")
    if not existing_work_update.get("fieldWorkAuditLogged"):
        raise RuntimeError(f"Existing field work update did not write audit log: {existing_work_update}")
    blocked_message = ""
    try:
        json_request(
            opener,
            base_url + "/api/field-work-records",
            {
                "workDate": "2026-05-25",
                "zoneName": "一場",
                "netHouseCode": "1-8",
                "taskKeys": ["weed"],
            },
            method="PUT",
        )
    except HTTPError as exc:
        blocked_message = exc.read().decode("utf-8")
    if "種植中" not in blocked_message:
        raise RuntimeError(f"Field work planting guard did not block new work record: {blocked_message}")
    harvest_day_work = json_request(
        opener,
        base_url + "/api/field-work-records",
        {
            "workDate": "2026-05-26",
            "zoneName": "一場",
            "netHouseCode": "1-8",
            "taskKeys": ["weed"],
        },
        method="PUT",
    )
    if not harvest_day_work.get("ok"):
        raise RuntimeError(f"Field work on harvest day failed: {harvest_day_work}")
    if not harvest_day_work.get("fieldWorkAuditLogged"):
        raise RuntimeError(f"Field work on harvest day did not write audit log: {harvest_day_work}")
    with opener.open(base_url + "/api/bootstrap", timeout=10) as response:
        payload = json.loads(response.read().decode("utf-8"))
        if response.status != 200 or not payload.get("ok"):
            raise RuntimeError("Bootstrap failed after login")
    records = payload.get("netHouseStatusRecords") or []
    matching = [
        record for record in records
        if record.get("recordDate") == "2026-05-22"
        and record.get("zoneName") == "一場"
        and record.get("netHouseCode") == "1-7"
    ]
    if not matching or not matching[0].get("lunchMarked"):
        raise RuntimeError("Bootstrap did not include persisted lunch marker")
    field_work_records = payload.get("fieldWorkRecords") or []
    account_matching = [
        record for record in field_work_records
        if record.get("workDate") == "2026-05-26"
        and record.get("zoneName") == "一場"
        and record.get("netHouseCode") == "1-8"
        and record.get("taskKey") == "weed"
    ]
    if not account_matching or account_matching[0].get("accountName") != "admin":
        raise RuntimeError("Bootstrap did not include field work account name")


def main() -> None:
    with tempfile.TemporaryDirectory(prefix="sheden-smoke-") as temp_dir:
        temp_path = Path(temp_dir)
        store = LocalStorageBackend(temp_path / "uploads")
        store.save_bytes("field-work-message-photos/test.txt", b"ok", "text/plain")
        content, _ = store.read_bytes("field-work-message-photos/test.txt")
        if content != b"ok":
            raise RuntimeError("Local storage smoke check failed")
        store.delete("field-work-message-photos/test.txt")

        port = free_port()
        env = os.environ.copy()
        env.update(
            {
                "HOST": "127.0.0.1",
                "PORT": str(port),
                "DATABASE_BACKEND": "sqlite",
                "APP_DB_PATH": str(temp_path / "app.db"),
                "FILE_STORAGE_BACKEND": "local",
                "APP_UPLOADS_DIR": str(temp_path / "uploads"),
            }
        )
        process = subprocess.Popen(
            [sys.executable, str(ROOT / "scripts" / "server.py")],
            cwd=str(ROOT),
            env=env,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
        )
        base_url = f"http://127.0.0.1:{port}"
        try:
            wait_for_server(base_url + "/")
            index_html, index_headers = response_text_and_headers(base_url + "/")
            index_cache_control = index_headers.get("Cache-Control", "")
            if "no-store" not in index_cache_control or "__APP_VERSION__" in index_html:
                raise RuntimeError(f"Index version/cache headers invalid: {index_cache_control}")
            app_version_match = re.search(r"app\.js\?v=([^\"']+)", index_html)
            styles_version_match = re.search(r"styles\.css\?v=([^\"']+)", index_html)
            if not app_version_match or not styles_version_match:
                raise RuntimeError("Index did not inject the local app version into asset URLs")
            app_version = app_version_match.group(1)
            styles_version = styles_version_match.group(1)
            if app_version != styles_version or not app_version.startswith("local-dev-"):
                raise RuntimeError(f"Index injected an unexpected local app version: {app_version}")
            _, app_headers = response_text_and_headers(base_url + f"/app.js?v={app_version}")
            app_cache_control = app_headers.get("Cache-Control", "")
            if "no-store" not in app_cache_control:
                raise RuntimeError(f"Local app.js cache headers invalid: {app_cache_control}")
            _, styles_headers = response_text_and_headers(base_url + f"/styles.css?v={styles_version}")
            styles_cache_control = styles_headers.get("Cache-Control", "")
            if "no-store" not in styles_cache_control:
                raise RuntimeError(f"Local styles.css cache headers invalid: {styles_cache_control}")
            service_worker, sw_headers = response_text_and_headers(base_url + "/sw.js")
            sw_cache_control = sw_headers.get("Cache-Control", "")
            if "no-store" not in sw_cache_control or "__APP_VERSION__" in service_worker:
                raise RuntimeError(f"Service worker version/cache headers invalid: {sw_cache_control}")
            if f'APP_VERSION = "{app_version}"' not in service_worker:
                raise RuntimeError("Service worker did not inject the local app version")
            unauthenticated_status = request_status(base_url + "/api/bootstrap")
            if unauthenticated_status != 401:
                raise RuntimeError(f"Expected /api/bootstrap to return 401, got {unauthenticated_status}")
            login_and_bootstrap(base_url)
            print("smoke test passed")
        finally:
            process.terminate()
            try:
                process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                process.kill()
                process.wait(timeout=5)


if __name__ == "__main__":
    main()
