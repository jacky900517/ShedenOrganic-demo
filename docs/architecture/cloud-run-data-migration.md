# Cloud Run 資料層遷移規劃

目標是把目前可運作的 SQLite + 本機 uploads 架構，逐步改造成適合 Cloud Run 長期使用的架構。

## 結論

正式部署到 Cloud Run 時，資料庫形式需要更改。

建議目標：

```text
Cloud Run        網站與 API
Cloud SQL        PostgreSQL，取代 SQLite app.db
Cloud Storage    取代 uploads/
Secret Manager   保存正式密碼與敏感設定
```

原因：

- Cloud Run 容器需要監聽 `PORT` 環境變數指定的 port。
- Cloud Run 容器的可寫檔案系統是 instance 生命週期內的暫存空間，不適合保存正式資料。
- SQLite 是單一檔案型資料庫，不適合放在會被重建、水平擴充、沒有固定持久磁碟的 Cloud Run 容器裡。
- 上傳照片、匯入檔案等物件檔案應放到 Cloud Storage。

官方參考：

- [Cloud Run container runtime contract](https://cloud.google.com/run/docs/container-contract)
- [Connect from Cloud Run to Cloud SQL for PostgreSQL](https://cloud.google.com/sql/docs/postgres/connect-run)
- [Cloud Storage volume mounts for Cloud Run](https://cloud.google.com/run/docs/configuring/services/cloud-storage-volume-mounts)
- [Cloud Run secrets](https://cloud.google.com/run/docs/configuring/services/secrets)

## 目前資料層盤點

目前正式資料主要在：

```text
data/app.db
uploads/
```

SQLite 資料表包含：

```text
app_snapshots
sales_imports
sales_rows
store_notes
store_routes
shipment_entries
stock_adjustment_entries
harvest_entries
harvest_messages
field_work_messages
field_work_message_photos
field_zones
field_net_houses
field_work_records
field_work_record_crops
field_bt_records
net_house_status_records
net_house_status_record_crops
app_settings
users
auth_sessions
```

目前直接使用 SQLite 的地方：

```text
scripts/database.py
scripts/server.py
scripts/build_site_data.py
scripts/import_sales_from_website_range.py
```

其中 `scripts/database.py` 是主要資料存取集中點，但 `scripts/server.py` 仍有部分直接 SQL。這是遷移前要先整理的重點。

## 遷移原則

- 每一步都要保持本機網站可運作。
- 每次改資料表、匯入流程、登入或儲存 API 前，都要先執行 runtime backup。
- 先集中資料存取，再切換資料庫引擎。
- 不把正式資料 commit 到 Git。
- 不再新增依賴 Excel 作為 runtime source 的流程。
- Cloud Run 上正式資料必須放在外部服務，不依賴容器內檔案。

## 建議分階段

### Phase 1：備份與資料存取集中

目標是降低資料庫遷移前的風險。

工作：

```text
新增正式資料備份腳本
把 server.py 裡直接 SQL 的邏輯逐步移到 database.py
把 build_site_data.py 和匯入腳本改成使用 database.py 的連線設定
補固定 smoke test 流程
```

備份指令：

```bash
python scripts/backup_runtime_data.py
```

### Phase 2：建立 PostgreSQL schema 與 migration script

目標是在不影響現有 SQLite 的情況下，先準備 Cloud SQL schema。

工作：

```text
建立 migrations/postgres/ 初始 schema：已建立
建立 SQLite -> PostgreSQL 匯出匯入腳本：已建立 scripts/migrate_sqlite_to_postgres.py
建立資料筆數比對腳本
建立 users/auth_sessions/app_settings 等關鍵表驗證
```

`scripts/migrate_sqlite_to_postgres.py` 預設只匯入目前啟用中的 `app_snapshots`，避免把大型歷史快照全部搬進 Cloud SQL。若確定需要歷史快照，可加上 `--all-snapshots`。

注意事項：

```text
SQLite INTEGER PRIMARY KEY AUTOINCREMENT 要改成 PostgreSQL identity column
SQLite ? placeholder 要改成 PostgreSQL driver 對應格式
SQLite PRAGMA/table_info/sqlite_sequence 需要替換
INSERT OR IGNORE 要改成 ON CONFLICT DO NOTHING
json 字串欄位可先維持 TEXT，後續再評估 jsonb
```

### Phase 3：雙資料庫相容層

目標是讓本機可繼續用 SQLite，但正式環境可用 PostgreSQL。

建議環境變數：

```text
DATABASE_BACKEND=sqlite|postgres
APP_DB_PATH=data/app.db
DATABASE_URL=postgresql://...
ALLOW_DEFAULT_USERS=0
INITIAL_ROOT_PASSWORD=<Secret Manager 注入>
AUTH_COOKIE_SECURE=1
```

目前已新增 `database.py` 相容層，會依環境變數切換 SQLite 或 PostgreSQL，並處理常見 placeholder 差異。本機預設仍是 SQLite。

### Phase 4：上傳檔案改 Cloud Storage

目標是移除 Cloud Run 對 `uploads/` 本機目錄的正式依賴。

建議環境變數：

```text
FILE_STORAGE_BACKEND=local|gcs
APP_UPLOADS_DIR=uploads
GCS_BUCKET=...
```

先做 storage adapter：

```text
local backend：本機開發用 uploads/
gcs backend：Cloud Run 正式環境用 Cloud Storage
```

目前已新增 `storage.py` adapter，田間留言照片可以用 `FILE_STORAGE_BACKEND=local|gcs` 切換儲存位置。

### Phase 5：Cloud Run 正式部署

目標是讓 Cloud Run revision 不保存正式資料。

工作：

```text
建立 Cloud SQL PostgreSQL instance
建立 Cloud Storage bucket
建立 Secret Manager secrets
設定 Cloud Run service account IAM
設定 Cloud Run Cloud SQL connection
部署 container image
跑 smoke test
確認資料寫入 Cloud SQL 與 Cloud Storage
```

## 每次部署前檢查

```bash
python scripts/backup_runtime_data.py
python -m py_compile scripts/*.py
git status --short
```

Cloud Run 正式切換前，還需要：

```text
SQLite 與 PostgreSQL 資料筆數比對通過
登入和角色權限測試通過
主要儲存 API 測試通過
照片上傳與讀取測試通過
Excel 匯入匯出 smoke test 通過
```
