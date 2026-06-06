# 專案現況與整理建議

這份文件整理目前網站專案的工程狀況、已經具備的優點、目前比較不正規的地方，以及後續可以怎麼一步一步整理成更適合長期維護與部署的專案。

目前專案不是「不能用」或「完全拼湊」的狀態。它已經是一個可以實際運作的內部管理系統，有前端畫面、後端 API、登入權限、SQLite 資料庫、Excel 匯入匯出、上傳檔案與多個業務功能。不過，它也確實還停留在「快速迭代累積功能」的階段，工程結構還沒有完全整理成正式 repo 或正式部署專案的樣子。

## 目前技術架構

目前專案大致是以下架構：

```text
前端：原生 HTML / CSS / JavaScript
後端：Python 標準庫 http.server + 自製 API handler
資料庫：SQLite，主要資料庫檔案是 data/app.db
Excel：使用 openpyxl 做匯入、匯出、一次性資料轉換
檔案上傳：使用本機 uploads/ 目錄
```

主要檔案：

```text
docs/index.html     網站 HTML
docs/app.js         前端主要邏輯
docs/styles.css     前端樣式
scripts/server.py   後端 server、API、登入權限、匯入匯出
scripts/database.py SQLite schema 與資料存取
data/app.db         正式資料庫
uploads/            上傳檔案
```

## 目前做得好的地方

目前專案已經具備幾個重要基礎：

1. 網站已經可以離開 Excel 日常運作

   使用者在網頁輸入的資料大多已經保存到 SQLite，不是每次都重新讀 Excel 才產生畫面。這符合長期系統化的方向。

2. 前後端已經有明確分工

   前端透過 `fetch()` 呼叫 `/api/...`，後端負責資料讀寫、匯入匯出、登入與權限。雖然檔案還沒拆細，但系統邊界已經存在。

3. 有資料庫 schema

   `scripts/database.py` 裡已經建立多個資料表，例如銷售、出貨、採收、田間紀錄、網室狀態、帳號、session、設定等。這比只靠 Excel 或 JSON 檔可靠很多。

4. 有登入與角色權限

   目前已有 `root`、`inside`、`field` 等角色，後端 API 也有依角色限制存取。這是正式內部系統需要的基礎。

5. 已經能用 Docker 化

   這個專案的依賴不複雜，主要是 Python 和 `openpyxl`，很適合整理成 Dockerfile + docker-compose 的部署方式。

## 目前比較不正規的地方

以下不是說專案不能用，而是指出如果要長期維護、多人協作、部署到雲端，這些地方會逐漸變成成本。

1. `scripts/server.py` 責任太多

   目前 `server.py` 同時處理：

   ```text
   HTTP server
   靜態檔案服務
   API routing
   登入與 cookie session
   角色權限
   Excel 匯入
   Excel 匯出
   檔案上傳
   業務資料驗證
   多個功能模組的資料處理
   ```

   短期可以跑，但後續每加一個功能都會讓這個檔案更難改，也更難測試。

2. `docs/app.js` 太大

   目前前端狀態、API 呼叫、畫面切換、表格渲染、各功能頁面邏輯都集中在單一 JavaScript 檔案。這會造成幾個問題：

   ```text
   很難快速找到某個功能在哪裡
   修改一個頁面可能影響另一個頁面
   狀態變數越來越多，資料流越來越難追
   不容易做單元測試或局部重構
   ```

3. `docs/styles.css` 太大

   全站樣式集中在一支 CSS 檔案，當功能越來越多時，容易出現：

   ```text
   class 名稱難管理
   樣式互相覆蓋
   不知道哪些 CSS 還有在用
   新增頁面時怕改壞舊頁面
   ```

4. repo 還像工作資料夾，不像正式專案

   目前根目錄有許多 Excel、資料庫、上傳資料、暫存檔與程式碼混在一起。正式 GitHub repo 應該主要保存程式碼與部署設定，不應直接保存正式營運資料。

5. 缺少標準專案檔案

   目前還缺少：

   ```text
   README.md
   requirements.txt
   .gitignore
   Dockerfile
   docker-compose.yml
   .env.example
   備份與還原說明
   部署說明
   ```

6. 缺少測試與驗證流程

   現在功能主要靠手動測試。對內部工具來說一開始可以接受，但隨著資料變多、功能變多，至少需要一些基本測試或檢查腳本，例如：

   ```text
   server 是否能啟動
   database schema 是否能初始化
   login API 是否正常
   主要儲存 API 是否正常
   Excel 匯出是否能產生檔案
   ```

7. 預設帳號密碼不適合公開 repo

   目前程式裡有預設帳號密碼。若專案要放到 GitHub，尤其是 public repo，必須處理這件事。正式部署時應該要求初始化密碼、環境變數，或至少部署後強制改密碼。

8. SQLite 適合目前階段，但不是所有雲端平台都適合

   SQLite 很適合單機、內部工具、低並發場景。若部署在 Compute Engine VM 沒問題；但如果未來要改 Cloud Run，就需要把資料庫改成 Cloud SQL，並把 `uploads/` 改成 Cloud Storage。

## 一個好的專案應該做到什麼

好的專案不一定要用很大的框架，也不一定要一開始就很複雜。重點是能穩定運作、容易理解、容易部署、容易維護。

1. 可以被重建

   任何人拿到 repo 後，照著 README 應該可以把網站跑起來。

   應具備：

   ```text
   README.md
   requirements.txt
   Dockerfile
   docker-compose.yml
   .env.example
   ```

2. 程式碼和資料分開

   GitHub 保存程式碼與結構，不保存正式資料。

   應放進 repo：

   ```text
   docs/
   scripts/
   AGENTS.md
   README.md
   requirements.txt
   Dockerfile
   docker-compose.yml
   .gitignore
   .env.example
   data/.gitkeep
   uploads/.gitkeep
   ```

   不應放進 repo：

   ```text
   data/app.db
   data/*.db
   uploads/*
   *.xlsx
   *.xls
   *.csv
   .DS_Store
   .codex_tmp/
   __pycache__/
   *.pyc
   ```

3. 模組責任清楚

   後端應逐步拆成比較清楚的責任邊界，例如：

   ```text
   scripts/
     server.py
     database.py
     auth.py
     api_sales.py
     api_harvest.py
     api_field_work.py
     api_net_house.py
     excel_import.py
     excel_export.py
     file_uploads.py
   ```

   前端也可以逐步拆成：

   ```text
   docs/js/
     app.js
     api.js
     state.js
     auth.js
     inventory.js
     harvest.js
     fieldWork.js
     netHouse.js
     render.js
   ```

   CSS 可以逐步拆成：

   ```text
   docs/css/
     base.css
     layout.css
     buttons.css
     forms.css
     tables.css
     pages.css
   ```

4. 部署方式固定

   不應該靠「某台電腦剛好可以跑」來維持系統。應該用 Docker 或明確的 Python 環境描述，讓部署流程可重複。

5. 有備份策略

   對目前架構來說，最重要的是：

   ```text
   定期備份 data/app.db
   定期備份 uploads/
   部署前備份
   大改資料表前備份
   確認備份可以還原
   ```

6. 有基本驗證流程

   不一定一開始就要完整自動化測試，但至少要有固定檢查清單：

   ```text
   server 能啟動
   登入能成功
   主要頁面能載入
   出貨資料能儲存
   採收資料能儲存
   田間資料能儲存
   Excel 匯出能下載
   權限限制正確
   ```

7. 安全設定不要寫死

   帳號密碼、cookie secret、外部服務設定、正式環境參數，應該透過環境變數或初始化流程管理，不應直接寫死在程式裡。

8. 能支撐資料成長

   目前 SQLite 加上索引可以支撐不少內部使用量，但應避免未來所有資料都一次丟到前端。資料量變大後，應該逐步改成分頁、日期區間查詢、條件查詢，避免一次載入過多資料。

## 建議整理順序

不要一次重寫。比較安全的做法是分階段整理，每一步都保持網站能正常運作。

### 第一階段：整理成正式 repo

目標是讓專案可以安全放到 GitHub。

應做事項：

```text
新增 .gitignore
新增 README.md
新增 requirements.txt
新增 Dockerfile
新增 docker-compose.yml
新增 .env.example
新增 data/.gitkeep
新增 uploads/.gitkeep
確認 data/app.db 不進 Git
確認 uploads/ 不進 Git
確認 Excel 正式資料不進 Git
```

這一階段不需要大改功能，風險最低。

### 第二階段：整理部署與備份

目標是能穩定部署到 GCP Compute Engine。

應做事項：

```text
使用 Docker Compose 啟動
把 data/ 和 uploads/ 掛成 volume
設定 restart: unless-stopped
建立 app.db 備份流程
建立 uploads 備份流程
整理部署步驟到 README
```

### 第三階段：拆後端

目標是降低 `server.py` 的複雜度。

建議先拆低風險、邊界清楚的部分：

```text
auth.py
excel_import.py
excel_export.py
file_uploads.py
```

再拆 API：

```text
api_sales.py
api_harvest.py
api_field_work.py
api_net_house.py
api_users.py
```

### 第四階段：拆前端

目標是降低 `app.js` 和 `styles.css` 的維護成本。

可以先照功能頁拆，而不是一開始就導入 React 或 Vue：

```text
api.js
auth.js
inventory.js
harvest.js
fieldWork.js
netHouse.js
accountUsers.js
```

CSS 也依照基礎元件與頁面拆：

```text
base.css
layout.css
tables.css
forms.css
modals.css
pages.css
```

### 第五階段：考慮雲端化架構

如果未來要從 Compute Engine 轉到 Cloud Run，建議改成：

```text
Cloud Run      跑網站與 API
Cloud SQL      取代 SQLite
Cloud Storage  取代 uploads/
Secret Manager 管理密碼與敏感設定
```

這一階段會需要比較大的改動，不建議在 repo 整理前就做。

## 不建議現在做的事

目前不建議直接整個重寫成 React、FastAPI、PostgreSQL、Cloud Run。原因是：

```text
目前系統已經能運作
完整重寫風險高
業務規則很多，重寫容易漏功能
真正急迫的問題是結構整理、部署、備份，而不是框架本身
```

比較務實的路線是：

```text
先整理 repo
再 Docker 化
再部署到 VM
再拆檔案
再補測試
最後才考慮換架構
```

## 結論

目前專案比較像一個已經長出實際功能的內部系統，而不是一個從一開始就按照正式工程規格規劃好的產品。它不是沒有價值，也不是不能維護；但如果繼續把所有功能都累積在幾個大檔案裡，未來修改成本會越來越高。

最好的方向不是推倒重來，而是逐步把它整理成：

```text
程式碼和資料分開
部署方式可重複
後端責任拆清楚
前端功能拆清楚
資料有備份
重要功能有驗證
敏感設定不寫死
```

這樣它就能從「能跑的內部工具」慢慢變成「可以長期維護與部署的正式專案」。
