# Cloud Run 部署筆記

> 目前專案已經部署到 Cloud Run。最新實際狀態、資源名稱、網址與 handoff 流程請先看 [Project Status](../project-status.md)；本文件主要保留部署方向與操作背景。

這份文件記錄把專案部署到 Google Cloud Run 的方向。現階段目標是先讓專案能安全放到 GitHub 並容器化；正式 Cloud Run 版本需要先完成資料持久化改造。

## Cloud Run 必要條件

Cloud Run 對 HTTP 服務有幾個關鍵要求：

- 服務必須監聽 `0.0.0.0`。
- 服務必須監聽 Cloud Run 注入的 `PORT` 環境變數。
- 容器映像需要符合 Linux x86_64 / amd64。

本專案的 `scripts/server.py` 已經支援 `HOST` 和 `PORT` 環境變數，Dockerfile 預設使用：

```text
HOST=0.0.0.0
PORT=8080
```

參考：Google Cloud Run [container runtime contract](https://docs.cloud.google.com/run/docs/container-contract)。

## 目前不能直接當正式 Cloud Run 的原因

目前正式資料在：

```text
data/app.db
uploads/
```

Cloud Run 容器會被重建、替換與水平擴充，不能把容器內檔案系統當成正式資料保存位置。雖然 Cloud Run 支援掛載 Cloud Storage bucket，但 Cloud Storage FUSE 不提供多寫入並發控制，也不是完整 POSIX 檔案系統，因此不適合直接拿來放 SQLite 正式資料庫。

參考：Google Cloud Run [Cloud Storage volume mounts](https://docs.cloud.google.com/run/docs/configuring/services/cloud-storage-volume-mounts)。

## 建議正式架構

```text
Cloud Run       跑網站與 API
Cloud SQL       取代 SQLite，保存業務資料
Cloud Storage   取代 uploads/，保存照片與匯入檔
Secret Manager  保存正式密碼與敏感設定
Artifact Registry 保存 Docker image
```

## 第一階段：容器化 smoke test

這個階段只確認容器可以啟動，不代表正式資料已經適合上 Cloud Run。

```bash
docker compose up --build
```

開啟：

```text
http://127.0.0.1:4174/
```

## 第二階段：建立 Google Cloud 基礎資源

以下指令是方向範本，執行前請替換 `PROJECT_ID`、`REGION` 與服務名稱。

```bash
gcloud auth login
gcloud config set project PROJECT_ID

gcloud services enable \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com \
  secretmanager.googleapis.com \
  sqladmin.googleapis.com

gcloud artifacts repositories create sheden-organic \
  --repository-format=docker \
  --location=asia-east1
```

建立 Secret Manager secrets：

```bash
printf '%s' 'postgresql://USER:PASSWORD@/DBNAME?host=/cloudsql/PROJECT_ID:asia-east1:sheden-organic-db' \
  | gcloud secrets create sheden-database-url --data-file=-

printf '%s' '請換成正式 root 初始密碼' \
  | gcloud secrets create sheden-initial-root-password --data-file=-
```

## 第三階段：建置與部署容器

正式 Cloud Run 環境建議使用 PostgreSQL 與 Cloud Storage：

```text
DATABASE_BACKEND=postgres
DATABASE_URL=<Secret Manager 注入>
ALLOW_DEFAULT_USERS=0
INITIAL_ROOT_USERNAME=root
INITIAL_ROOT_DISPLAY_NAME=admin
INITIAL_ROOT_PASSWORD=<Secret Manager 注入>
AUTH_COOKIE_SECURE=1
FILE_STORAGE_BACKEND=gcs
GCS_BUCKET=<bucket name>
GCS_PREFIX=prod
```

```bash
gcloud builds submit \
  --tag asia-east1-docker.pkg.dev/PROJECT_ID/sheden-organic/app:latest

gcloud run deploy sheden-organic \
  --image asia-east1-docker.pkg.dev/PROJECT_ID/sheden-organic/app:latest \
  --region asia-east1 \
  --allow-unauthenticated
```

如果要用 Cloud Build 的一鍵流程，可以先修改 repo 根目錄的 `cloudbuild.yaml` substitutions，然後執行：

```bash
gcloud builds submit --config cloudbuild.yaml
```

如果網站只給內部人員使用，也可以不要 `--allow-unauthenticated`，改用 Google IAM 控制進入 Cloud Run 的權限。不過本系統本身已有登入頁，實際選擇要看你的使用方式。

## 正式上線前待辦

- 建立 Cloud SQL PostgreSQL instance。
- 執行 `scripts/migrate_sqlite_to_postgres.py --replace` 匯入 SQLite 資料。
- 建立 Cloud Storage bucket，並將既有 `uploads/` 內容搬入 bucket。
- 設定 `ALLOW_DEFAULT_USERS=0`，並以 Secret Manager 注入 `INITIAL_ROOT_PASSWORD`。
- 補正式環境變數與 Secret Manager 設定。
- 建立資料庫備份與還原流程。
- 建立部署前 smoke test。
- 確認角色權限與登入流程。

資料層改造細節見 [Cloud Run 資料層遷移規劃](../architecture/cloud-run-data-migration.md)。
