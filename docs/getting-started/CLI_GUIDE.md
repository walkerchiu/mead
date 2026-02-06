# Starter CLI 完整指南

> 直覺的互動式命令列工具，讓你無需記憶任何命令就能管理整個開發工作流程

## 📋 目錄

- [Starter CLI 完整指南](#starter-cli-完整指南)
  - [📋 目錄](#-目錄)
  - [📖 概述](#-概述)
    - [核心特色](#核心特色)
  - [🚀 快速開始](#-快速開始)
    - [第一次使用](#第一次使用)
    - [方式 1：互動式（推薦）](#方式-1互動式推薦)
    - [方式 2：命令列](#方式-2命令列)
    - [每天開始工作](#每天開始工作)
    - [常用操作速查表](#常用操作速查表)
    - [查看狀態](#查看狀態)
    - [重啟服務（改完程式後）](#重啟服務改完程式後)
    - [查看日誌（Debug 用）](#查看日誌debug-用)
    - [執行測試](#執行測試)
    - [資料庫操作](#資料庫操作)
    - [多語系管理](#多語系管理)
    - [Port 管理](#port-管理)
    - [環境切換](#環境切換)
    - [依賴管理](#依賴管理)
    - [實際使用場景](#實際使用場景)
    - [場景 1：早上開始工作](#場景-1早上開始工作)
    - [場景 2：API 改了快速測試](#場景-2api-改了快速測試)
    - [場景 3：資料庫改壞了](#場景-3資料庫改壞了)
    - [場景 4：測試掛了找不到原因](#場景-4測試掛了找不到原因)
    - [場景 5：測試郵件功能](#場景-5測試郵件功能)
    - [場景 6：Port 被占用無法啟動](#場景-6port-被占用無法啟動)
    - [場景 7：翻譯改完要確認](#場景-7翻譯改完要確認)
    - [場景 8：切換到測試環境](#場景-8切換到測試環境)
    - [場景 9：查看或編輯資料庫數據](#場景-9查看或編輯資料庫數據)
  - [📝 使用方式](#-使用方式)
    - [三種使用方式](#三種使用方式)
    - [方式 1：互動式選單（推薦新手）](#方式-1互動式選單推薦新手)
    - [方式 2：命令列（推薦熟練者）](#方式-2命令列推薦熟練者)
    - [方式 3：Tab 自動完成（推薦專家）](#方式-3tab-自動完成推薦專家)
    - [互動式選單詳解](#互動式選單詳解)
    - [選單結構](#選單結構)
    - [資料安全性總覽](#資料安全性總覽)
  - [🔧 核心命令](#-核心命令)
    - [./scripts/cli.sh init - 初始化環境](#scriptsclish-init---初始化環境)
    - [./scripts/cli.sh dev - 啟動開發](#scriptsclish-dev---啟動開發)
    - [./scripts/cli.sh status - 查看服務狀態](#scriptsclish-status---查看服務狀態)
    - [./scripts/cli.sh stop - 停止服務](#scriptsclish-stop---停止服務)
    - [./scripts/cli.sh restart - 重啟服務](#scriptsclish-restart---重啟服務)
    - [./scripts/cli.sh logs - 查看日誌](#scriptsclish-logs---查看日誌)
    - [./scripts/cli.sh test - 執行測試](#scriptsclish-test---執行測試)
    - [./scripts/cli.sh clean - 清理快取](#scriptsclish-clean---清理快取)
    - [./scripts/cli.sh db - 資料庫管理](#scriptsclish-db---資料庫管理)
    - [./scripts/cli.sh i18n - 多語系管理](#scriptsclish-i18n---多語系管理)
    - [./scripts/cli.sh port - Port 管理](#scriptsclish-port---port-管理)
    - [./scripts/cli.sh env - 環境切換](#scriptsclish-env---環境切換)
    - [./scripts/cli.sh doctor - 環境診斷](#scriptsclish-doctor---環境診斷)
    - [./scripts/cli.sh deps - 依賴管理](#scriptsclish-deps---依賴管理)
  - [🎯 最佳實踐](#-最佳實踐)
    - [新開發者學習路徑](#新開發者學習路徑)
    - [開發工作流程](#開發工作流程)
    - [效率提升技巧](#效率提升技巧)
  - [🚨 故障排除](#-故障排除)
    - [Q1: 我不知道要用什麼命令？](#q1-我不知道要用什麼命令)
    - [Q2: 服務起不來？](#q2-服務起不來)
    - [Q3: Port 被占用？](#q3-port-被占用)
    - [Q4: 資料庫連不上？](#q4-資料庫連不上)
    - [Q5: 測試一直失敗？](#q5-測試一直失敗)
    - [Q6: Port 被占用怎麼辦？](#q6-port-被占用怎麼辦)
    - [Q7: 翻譯鍵不知道有沒有用到？](#q7-翻譯鍵不知道有沒有用到)
    - [Q8: 怎麼切換到不同環境？](#q8-怎麼切換到不同環境)
  - [🏗️ 技術架構](#️-技術架構)
    - [Scripts 目錄結構](#scripts-目錄結構)
    - [命令實作詳解](#命令實作詳解)
    - [共用函數庫](#共用函數庫)
    - [貢獻指南](#貢獻指南)
  - [📚 相關資源](#-相關資源)

---

## 📖 概述

Starter CLI 是一個**直覺的互動式命令列工具**，讓你無需記憶任何命令就能管理整個開發工作流程。

### 核心特色

- 🎯 **互動式選單** - 直接輸入 `./scripts/cli.sh` 進入選單
- 🚀 **一鍵初始化** - 3 分鐘完成環境設置
- 🔧 **服務管理** - 快速啟動、重啟、查看狀態
- 💾 **資料庫管理** - Migration、備份、還原
- 🏥 **智能診斷** - 自動偵測並修復問題
- ⚡ **Tab 自動完成** - Shell 補全支援

---

## 🚀 快速開始

### 第一次使用

### 方式 1：互動式（推薦）

```bash
# 進入選單
./scripts/cli.sh

# 選擇「1) 初始化環境」
```

### 方式 2：命令列

```bash
# 一鍵完成所有設置
./scripts/cli.sh init
```

**這會自動完成**：

- ✅ 檢查系統需求（Node.js, pnpm, Docker）
- ✅ 安裝所有依賴（pnpm install）
- ✅ 啟動 Docker 服務（PostgreSQL, RabbitMQ, Dragonfly, Mailpit）
- ✅ 初始化資料庫（migrations + seed data）
- ✅ 驗證所有服務正常

**預計時間**: 3-5 分鐘

### 每天開始工作

```bash
# 1. 檢查狀態
./scripts/cli.sh status

# 2. 啟動開發
./scripts/cli.sh dev

# 3. 開始寫 code！
```

### 常用操作速查表

### 查看狀態

```bash
./scripts/cli.sh status              # 快速查看
./scripts/cli.sh status --watch      # 持續監控
```

### 重啟服務（改完程式後）

```bash
./scripts/cli.sh restart backend     # 後端改了
./scripts/cli.sh restart frontend    # 前端改了
./scripts/cli.sh restart all         # 全部重來
```

### 查看日誌（Debug 用）

```bash
./scripts/cli.sh logs backend -f     # 即時追蹤後端
./scripts/cli.sh logs frontend -f    # 即時追蹤前端
./scripts/cli.sh logs postgres -f    # 查看資料庫
```

### 執行測試

```bash
./scripts/cli.sh test                # 全部測試
./scripts/cli.sh test frontend       # 前端測試
./scripts/cli.sh test --watch        # Watch 模式
```

### 資料庫操作

```bash
./scripts/cli.sh db reset            # 重置資料庫
./scripts/cli.sh db backup           # 備份
./scripts/cli.sh db migrate:up       # 執行 migration
./scripts/cli.sh db studio           # 開啟 Prisma Studio
```

### 多語系管理

```bash
./scripts/cli.sh i18n test           # 執行翻譯測試
./scripts/cli.sh i18n generate       # 生成類型定義
./scripts/cli.sh i18n unused         # 檢查未使用鍵
./scripts/cli.sh i18n stats          # 顯示統計
```

### Port 管理

```bash
./scripts/cli.sh port status         # 查看 Port 狀態
./scripts/cli.sh port free 3000      # 釋放 Port 3000
./scripts/cli.sh port free-all       # 釋放所有 Port
```

### 環境切換

```bash
./scripts/cli.sh env current         # 查看當前環境
./scripts/cli.sh env list            # 列出所有環境
./scripts/cli.sh env switch dev      # 切換到開發環境
./scripts/cli.sh env diff prod       # 比較環境差異
```

### 依賴管理

```bash
./scripts/cli.sh deps outdated all   # 檢查過時套件
./scripts/cli.sh deps audit all      # 安全性審計
./scripts/cli.sh deps update all     # 更新套件
./scripts/cli.sh deps unused         # 掃描未使用依賴
```

### 實際使用場景

### 場景 1：早上開始工作

```bash
./scripts/cli.sh status    # 檢查服務
./scripts/cli.sh dev       # 啟動開發
```

### 場景 2：API 改了快速測試

```bash
./scripts/cli.sh restart backend && ./scripts/cli.sh logs backend -f
```

### 場景 3：資料庫改壞了

```bash
./scripts/cli.sh db reset          # 重置
./scripts/cli.sh restart backend   # 重啟
```

### 場景 4：測試掛了找不到原因

```bash
./scripts/cli.sh doctor           # 診斷
./scripts/cli.sh clean            # 清理
./scripts/cli.sh restart all      # 重啟
```

### 場景 5：測試郵件功能

```bash
# 1. 確認 Mailpit 運行中
./scripts/cli.sh status

# 2. 查看 Mailpit 日誌（如需除錯）
./scripts/cli.sh logs mailpit -f

# 3. 在瀏覽器開啟 Mailpit Web UI
open http://localhost:8025
```

### 場景 6：Port 被占用無法啟動

```bash
# 1. 檢查 Port 狀態（自動顯示衝突）
./scripts/cli.sh port status
# 會顯示：⚠ Port 3000 被 node (PID: 12345) 佔用

# 2. 釋放被占用的 Port
./scripts/cli.sh port free 3000

# 3. 或釋放所有 Port
./scripts/cli.sh port free-all

# 4. 重新啟動服務
./scripts/cli.sh dev
```

### 場景 7：翻譯改完要確認

```bash
# 1. 執行翻譯測試
./scripts/cli.sh i18n test

# 2. 生成新的類型定義
./scripts/cli.sh i18n generate

# 3. 檢查有沒有未使用的翻譯鍵
./scripts/cli.sh i18n unused --show

# 4. 清理未使用的鍵（如需要）
./scripts/cli.sh i18n unused --cleanup
```

### 場景 8：切換到測試環境

```bash
# 1. 查看當前環境
./scripts/cli.sh env current

# 2. 比較與測試環境的差異
./scripts/cli.sh env diff uat

# 3. 切換到測試環境
./scripts/cli.sh env switch uat

# 4. 驗證切換成功
./scripts/cli.sh status
```

### 場景 9：查看或編輯資料庫數據

```bash
# 1. 啟動 Prisma Studio
./scripts/cli.sh db studio

# 2. 在瀏覽器中自動打開 http://localhost:5555
#    可以查看/編輯所有資料表

# 3. 檢查 Prisma Studio 狀態
./scripts/cli.sh status

# 4. 使用完畢後停止
./scripts/cli.sh stop prisma-studio
```

---

## 📝 使用方式

### 三種使用方式

### 方式 1：互動式選單（推薦新手）

```bash
./scripts/cli.sh  # 無參數直接進入選單
```

**優點**：

- ✅ 不需要記憶命令
- ✅ 清楚的中文說明
- ✅ 多層級引導操作

### 方式 2：命令列（推薦熟練者）

```bash
./scripts/cli.sh <command> [options]
```

**優點**：

- ⚡ 快速執行
- 🔄 可組合使用
- 🤖 適合腳本化

### 方式 3：Tab 自動完成（推薦專家）

啟用後可以用 Tab 鍵自動完成：

```bash
./scripts/cli.sh <Tab>              # 顯示所有命令
./scripts/cli.sh restart <Tab>      # 顯示所有服務
./scripts/cli.sh db <Tab>           # 顯示所有 db 子命令
```

**啟用方式**：

```bash
# Shell completion 功能尚未實作
# 未來版本將提供 Bash/Zsh 自動完成功能
```

### 互動式選單詳解

### 選單結構

```text
╔═══════════════════════════════════════════════════════════╗
║              🌪️  Starter CLI v1.0.0                          ║
║         開發工作流程管理工具 - 互動式選單                  ║
╚═══════════════════════════════════════════════════════════╝

🚀 快速開始
  1) 初始化環境
  2) 啟動開發伺服器
  3) 查看服務狀態

🔧 開發工具
  4) 重啟服務
  5) 查看日誌
  6) 執行測試

💾 資料庫管理
  7) 資料庫遷移
  8) 重置資料庫
  9) 資料庫備份/還原

🏥 診斷修復
  10) 環境診斷
  11) 清理快取
  12) 健康檢查

⚙️ 進階功能
  13) i18n 多語系管理
  14) Port 管理
  15) 環境切換
  16) 依賴管理

📚 說明文件
  h) 查看完整指令說明
  d) 開啟文檔
  q) 離開
```

### 資料安全性總覽

> **重要**：在執行任何操作前，請確認你了解該操作是否會影響資料。

| 選項                | 操作                                       |                              會刪除資料嗎                              | 保護機制                                 |
| ------------------- | ------------------------------------------ | :--------------------------------------------------------------------: | ---------------------------------------- |
| 1) 初始化環境       | 安裝依賴、啟動 Docker、跑 migration/seed   |                                   ❌                                   | -                                        |
| 2) 啟動開發伺服器   | 啟動 frontend/backend/storybook            |                                   ❌                                   | -                                        |
| 3) 查看服務狀態     | 唯讀查詢                                   |                                   ❌                                   | -                                        |
| 4) 停止服務         | 停止運行中的服務                           |                                   ❌                                   | -                                        |
| 5) 重啟服務         | 重啟指定服務                               |                                   ❌                                   | -                                        |
| 6) 查看日誌         | 唯讀查詢                                   |                                   ❌                                   | -                                        |
| 7) 執行測試         | 跑測試                                     |                                   ❌                                   | -                                        |
| 8) 資料庫遷移       | 建立/執行/回滾 migration                   |               ⚠️ `migrate:down` 會回滾最後一次 migration               | 確認提示                                 |
| 9) 重置資料庫       | `prisma migrate reset --force` + 重新 seed |                       ✅ **刪除所有資料並重建**                        | production 檢查 + 確認提示（預設「否」） |
| 10) 資料庫備份/還原 | pg_dump / pg_restore                       |                         ⚠️ 還原會覆蓋現有資料                          | 確認提示                                 |
| 11) 環境診斷        | 唯讀檢查                                   |                                   ❌                                   | -                                        |
| 12) 清理快取        | 刪除 node_modules、.next、dist 等建置產物  |                      ⚠️ 刪除建置快取（非資料庫）                       | `--dry-run` 預覽                         |
| 13) i18n 多語系管理 | 執行翻譯測試、生成類型、檢查未使用鍵       |               ⚠️ `unused --cleanup` 會刪除未使用的翻譯鍵               | 預覽模式 + 確認提示                      |
| 14) Port 管理       | 查看、釋放 Port，掃描衝突                  |                     ⚠️ `free-all` 會終止占用的進程                     | 確認提示                                 |
| 15) 環境切換        | 切換 .env、重啟 Docker                     | ⚠️ 清除 Dragonfly cache 和 RabbitMQ queue volume（**不會刪除資料庫**） | 確認提示                                 |
| 16) 依賴管理        | 安裝/更新套件                              |                                   ❌                                   | -                                        |

**圖例**：❌ 安全　⚠️ 部分影響　✅ 會刪除資料

---

## 🔧 核心命令

### ./scripts/cli.sh init - 初始化環境

**用途**: 一鍵設置完整開發環境（新開發者必用）

**使用方式**

```bash
./scripts/cli.sh init [options]
```

**選項**

- `--skip-docker` - 跳過 Docker 服務啟動
- `--skip-install` - 跳過依賴安裝
- `--skip-db` - 跳過資料庫初始化

**執行流程**

1. ✅ 檢查前置條件（Node.js >= 18, pnpm >= 8, Docker >= 20）
2. ✅ 安裝依賴（pnpm install）
3. ✅ 環境變數檢查（.env 檔案）
4. ✅ 啟動 Docker 服務
5. ✅ 初始化資料庫（migrations + seed）
6. ✅ 驗證所有服務

**範例**

```bash
# 完整初始化（推薦）
./scripts/cli.sh init

# 跳過 Docker（已手動啟動）
./scripts/cli.sh init --skip-docker

# 僅安裝依賴
./scripts/cli.sh init --skip-docker --skip-db
```

### ./scripts/cli.sh dev - 啟動開發

**用途**: 啟動開發環境（前端 + 後端 + Storybook）

**使用方式**

```bash
./scripts/cli.sh dev                       # 啟動前端 + 後端（預設）
./scripts/cli.sh dev --all                 # 啟動全部（前端 + 後端 + Storybook）
./scripts/cli.sh dev --frontend-only       # 僅前端
./scripts/cli.sh dev --backend-only        # 僅後端
./scripts/cli.sh dev --storybook-only      # 僅 Storybook
./scripts/cli.sh dev --frontend-storybook  # 前端 + Storybook
```

**互動式選單選項**

當執行 `./scripts/cli.sh` 並選擇「2) 啟動開發伺服器」時，可選：

1. 全部（Frontend + Backend + Storybook + Prisma Studio）
2. Frontend + Backend + Storybook
3. Frontend + Backend（預設組合）
4. Frontend + Storybook
5. 僅 Frontend
6. 僅 Backend
7. 僅 Storybook
8. 僅 Prisma Studio

**功能**

- 同時啟動前端（Next.js）和後端（NestJS）
- 支援 Storybook 組件開發模式
- 支援 Prisma Studio 資料庫管理
- 支援熱重載（Hot Reload）
- 自動開啟瀏覽器

**訪問位置**

- **前端**: http://localhost:3000
- **後端 API**: http://localhost:4000/graphql
- **Storybook**: http://localhost:6006
- **Prisma Studio**: http://localhost:5555
- **Mailpit Web UI**: http://localhost:8025

### ./scripts/cli.sh status - 查看服務狀態

**用途**: 一目了然查看所有服務的運行狀態

**使用方式**

```bash
./scripts/cli.sh status [options]
```

**選項**

- `--health` - 完整健康檢查（包含連線測試）
- `--watch` - 持續監控模式（每 2 秒更新）
- `--json` - JSON 格式輸出（供 CI/CD 使用）

**範例**

```bash
./scripts/cli.sh status              # 快速狀態
./scripts/cli.sh status --health     # 完整檢查
./scripts/cli.sh status --watch      # 持續監控
```

**顯示內容**

```text
╔════════════════════════════════════════╗
║  服務狀態
╚════════════════════════════════════════╝

📦 應用服務
  ✓ Frontend (Port 3000, PID 12345) 運行中
      CPU: 2.5% | 記憶體: 150MB
  ✓ Backend (Port 4000, PID 12346) 運行中
      CPU: 5.2% | 記憶體: 300MB
  ✓ Storybook (Port 6006, PID 12347) 運行中
      CPU: 1.8% | 記憶體: 200MB
  ✗ Prisma Studio (Port 5555) 未運行

🐳 Docker 服務
  ✓ PostgreSQL (容器: 自動偵測) 運行中
  ✓ RabbitMQ (容器: 自動偵測) 運行中
  ✓ Dragonfly (容器: 自動偵測) 運行中
  ✓ Mailpit (容器: 自動偵測) 運行中

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ 所有服務正常運行 (7/8)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### ./scripts/cli.sh stop - 停止服務

**用途**: 停止指定服務或所有服務

**使用方式**

```bash
./scripts/cli.sh stop <service> [options]
```

**支援的服務**

- `frontend` - 停止前端（Next.js）
- `backend` - 停止後端（NestJS）
- `storybook` - 停止 Storybook
- `prisma-studio` - 停止 Prisma Studio
- `docker` - 停止 Docker 服務
- `all` - 停止所有服務

**互動式選單選項**

當執行 `./scripts/cli.sh` 並選擇「4) 停止服務」時，可選：

1. 全部（包含 Docker）
2. Frontend + Backend + Storybook
3. Frontend + Backend
4. Frontend + Storybook
5. 僅 Frontend
6. 僅 Backend
7. 僅 Storybook
8. 僅 Prisma Studio
9. Docker 服務

**選項**

- `--force` - 強制終止進程（使用 kill -9）

**範例**

```bash
./scripts/cli.sh stop frontend          # 停止前端
./scripts/cli.sh stop backend           # 停止後端
./scripts/cli.sh stop docker            # 停止 Docker
./scripts/cli.sh stop all               # 停止所有服務
./scripts/cli.sh stop backend --force   # 強制終止後端
```

**執行流程**

1. 查找服務進程（通過 Port 或進程名）
2. 優雅停止（SIGTERM）
3. 如果使用 `--force`，則強制終止（SIGKILL）
4. 驗證服務已停止

### ./scripts/cli.sh restart - 重啟服務

**用途**: 快速重啟指定服務（開發中改完程式常用）

**使用方式**

```bash
./scripts/cli.sh restart <service>
```

**支援的服務**

- `frontend` - 前端（Next.js）
- `backend` - 後端（NestJS）
- `storybook` - Storybook
- `prisma-studio` - Prisma Studio
- `docker` - 所有 Docker 服務
- `all` - 全部服務

**互動式選單選項**

當執行 `./scripts/cli.sh` 並選擇「5) 重啟服務」時，可選：

1. 全部（包含 Docker）
2. Frontend + Backend + Storybook
3. Frontend + Backend
4. Frontend + Storybook
5. 僅 Frontend
6. 僅 Backend
7. 僅 Storybook
8. 僅 Prisma Studio
9. Docker 服務

**範例**

```bash
./scripts/cli.sh restart backend        # 後端改了
./scripts/cli.sh restart frontend       # 前端改了
./scripts/cli.sh restart prisma-studio  # 重啟 Prisma Studio
./scripts/cli.sh restart docker         # Docker 異常
./scripts/cli.sh restart all            # 全部重啟
```

**執行流程**

1. 停止服務（優雅停止 → 強制停止）
2. 等待 Port 釋放
3. 重新啟動服務
4. 驗證啟動成功

### ./scripts/cli.sh logs - 查看日誌

**用途**: 查看各服務的日誌輸出（Debug 必備工具）

**使用方式**

```bash
./scripts/cli.sh logs <service> [options]
```

**支援的服務**

- `frontend` - 前端（Next.js）
- `backend` - 後端（NestJS）
- `postgres` - PostgreSQL 資料庫
- `rabbitmq` - RabbitMQ 訊息佇列
- `redis` - Dragonfly/Redis 快取
- `mailpit` - Mailpit 郵件測試服務
- `docker` - 所有 Docker 容器
- `all` - 全部服務

**選項**

- `-f, --follow` - 即時追蹤日誌（類似 tail -f）
- `-n <num>` - 顯示最後 N 行（預設 100）
- `--since <time>` - 時間篩選（5m, 1h, 2023-01-01）

**範例**

```bash
# 即時追蹤後端日誌（最常用）
./scripts/cli.sh logs backend -f

# 查看最後 50 行
./scripts/cli.sh logs backend -n 50

# 查看最近 5 分鐘
./scripts/cli.sh logs postgres --since 5m

# 搜尋關鍵字
./scripts/cli.sh logs backend -n 500 | grep "ERROR"
```

### ./scripts/cli.sh test - 執行測試

**用途**: 執行前端、後端或全部測試（包含 TypeScript 型別檢查）

**使用方式**

```bash
./scripts/cli.sh test [options]
```

**選項**

- 無參數 - 執行所有測試（type-check + 前端 + 後端）
- `--backend` - 僅執行後端測試（含 type-check）
- `--frontend` - 僅執行前端測試（含 type-check）
- `--i18n` - 僅執行 i18n 翻譯完整性測試
- `--watch` - Watch 模式（跳過 type-check）
- `--coverage` - 產生覆蓋率報告

**測試流程**

執行測試時會按以下順序進行：

1. **TypeScript 型別檢查** (`tsc --noEmit`)
   - 快速靜態檢查，確保沒有型別錯誤
   - 如果失敗，將不會執行單元測試（Fail Fast 原則）

2. **單元測試** (Jest / Vitest)
   - 執行所有單元測試
   - 可選擇產生覆蓋率報告

**範例**

```bash
./scripts/cli.sh test                # 執行所有測試
./scripts/cli.sh test --backend      # 僅後端測試（含 type-check）
./scripts/cli.sh test --frontend     # 僅前端測試（含 type-check）
./scripts/cli.sh test --i18n         # 僅 i18n 測試
./scripts/cli.sh test --watch        # Watch 模式
./scripts/cli.sh test --coverage     # 產生覆蓋率報告
```

### ./scripts/cli.sh clean - 清理快取

**用途**: 清理快取、暫存檔、釋放空間

**使用方式**

```bash
./scripts/cli.sh clean [options]
```

**選項**

- `--dry-run` - 預覽不實際刪除
- `--deep` - 深度清理（包含 Docker）

**清理項目**

| 項目           | 位置           | 大小影響 |
| -------------- | -------------- | -------- |
| node_modules   | 所有 workspace | 🔴 大    |
| .next          | apps/frontend  | 🟡 中    |
| dist           | apps/backend   | 🟢 小    |
| Docker volumes | Docker         | 🔴 大    |

**範例**

```bash
./scripts/cli.sh clean              # 互動式選擇
./scripts/cli.sh clean --dry-run    # 預覽
./scripts/cli.sh clean --deep       # 深度清理
```

### ./scripts/cli.sh db - 資料庫管理

**用途**: 完整的資料庫生命週期管理

**子命令**

**Migration 管理**

```bash
./scripts/cli.sh db migrate:create <name>   # 建立新 migration
./scripts/cli.sh db migrate:up              # 執行 migrations
./scripts/cli.sh db migrate:down            # 回滾 migration
./scripts/cli.sh db migrate:status          # 查看狀態
```

**資料庫操作**

```bash
./scripts/cli.sh db reset     # 重置資料庫
./scripts/cli.sh db seed      # 填充測試資料
./scripts/cli.sh db studio    # 開啟 Prisma Studio
./scripts/cli.sh db generate  # 重新生成 Prisma Client
```

**備份與還原**

```bash
./scripts/cli.sh db backup     # 備份資料庫
./scripts/cli.sh db restore    # 還原資料庫
```

**環境支援**

使用 `--env` 指定環境：

- `development` - 開發環境（預設）
- `uat` - 測試環境
- `production` - 生產環境

**範例**

```bash
# 開發環境 migration
./scripts/cli.sh db migrate:create add_user_avatar
./scripts/cli.sh db migrate:up

# 生產環境備份
./scripts/cli.sh db backup --env production

# 測試環境重置
./scripts/cli.sh db reset --env uat
```

### ./scripts/cli.sh i18n - 多語系管理

**用途**: 管理專案的多語系翻譯（前端 + 後端）

**使用方式**

```bash
./scripts/cli.sh i18n <command>
```

**命令**

**1. test - 執行翻譯完整性測試**

```bash
./scripts/cli.sh i18n test
```

檢查項目：

- ✅ 翻譯鍵一致性（en.json vs zh-TW.json）
- ✅ Placeholder 正確性（變數格式檢查）
- ✅ 空值檢測
- ✅ 重複鍵檢測

**2. generate - 生成 TypeScript 類型定義**

```bash
./scripts/cli.sh i18n generate
```

自動生成：

- `apps/frontend/src/types/i18n.generated.ts` - 前端類型定義
- 基於實際翻譯檔案自動生成，確保類型安全

**3. unused - 檢查未使用的翻譯鍵**

```bash
./scripts/cli.sh i18n unused              # 統計摘要
./scripts/cli.sh i18n unused --show       # 顯示詳細列表
./scripts/cli.sh i18n unused --cleanup    # 生成清理腳本
```

功能：

- 掃描前端和後端代碼
- 識別未使用的翻譯鍵
- 生成清理腳本（支持預覽和確認模式）
- 自動清理空對象

**執行效果：**

```text
╔══════════════════════════════════════════════════════════════╗
║           i18n 多語系翻譯鍵使用情況統整報告                  ║
╚══════════════════════════════════════════════════════════════╝

📊 整體統計摘要
──────────────────────────────────────────────────────
  總定義鍵數:                     354
  總使用鍵數:                     201
  總未使用鍵數:                   292
  可能動態使用的鍵:               34

🗑️  建議刪除
──────────────────────────────────────────────────────
  確定可刪除的鍵:                 292
  潛在可節省空間:                 82.5%
```

**4. stats - 顯示翻譯統計資訊**

```bash
./scripts/cli.sh i18n stats
```

顯示：

- 翻譯鍵總數
- 各語言文件統計
- 命名空間分布

**範例**

```bash
# 日常檢查
./scripts/cli.sh i18n test

# 生成類型定義（改了翻譯後）
./scripts/cli.sh i18n generate

# 清理未使用的翻譯鍵
./scripts/cli.sh i18n unused --show      # 先查看
./scripts/cli.sh i18n unused --cleanup   # 生成腳本
node cleanup-unused-i18n-keys.js         # 預覽
node cleanup-unused-i18n-keys.js --confirm  # 確認刪除
```

### ./scripts/cli.sh port - Port 管理

**用途**: 查看、釋放服務的 Port，自動檢測衝突

**使用方式**

```bash
./scripts/cli.sh port <subcommand> [options]
```

**子命令**

**1. status - 查看所有服務的 Port 狀態**

```bash
./scripts/cli.sh port status
```

**顯示內容：**

**Port 列表（按號碼排序）：**

- Mailpit SMTP (1025)
- Frontend (3000)
- Backend (4000)
- PostgreSQL (5432)
- Prisma Studio (5555)
- RabbitMQ AMQP (5672)
- Storybook (6006)
- Dragonfly/Redis (6379)
- Mailpit Web UI (8025)
- RabbitMQ Management (15672)

**統計信息：**

- 總 Port 數
- 佔用中的數量
- 可用的數量

**衝突檢測（如有）：**

- 列出所有被佔用的 Port
- 顯示佔用進程的名稱和 PID
- 提供解決方案建議

**輸出範例：**

```text
服務 Port 狀態
──────────────────────────────────────────────────
  Port    服務                    狀態      PID      程序
  1025    Mailpit (SMTP)         可用      -        -
  3000    Frontend (Next.js)     佔用中    12345    node
  4000    Backend (NestJS)       可用      -        -
  ...

統計：
  總 Port 數：10
  佔用中：2
  可用：8

⚠ 發現 2 個 Port 被佔用：
  • Port 3000 (Frontend (Next.js)) 被 node (PID: 12345) 佔用
  • Port 6006 (Storybook) 被 node (PID: 12346) 佔用

💡 解決方案：
  使用 ./scripts/cli.sh port free <port> 釋放指定 Port
  使用 ./scripts/cli.sh port free-all 釋放所有 Port
```

**2. free - 釋放指定 Port**

```bash
./scripts/cli.sh port free <port>
```

終止佔用指定 Port 的進程。

**3. free-all - 釋放所有服務的 Port**

```bash
./scripts/cli.sh port free-all
```

終止佔用所有專案 Port 的進程。

**範例**

```bash
# 查看 Port 狀態
./scripts/cli.sh port status

# 前端 Port 被占用了，釋放它
./scripts/cli.sh port free 3000

# 釋放所有被佔用的 Port
./scripts/cli.sh port free-all
```

**使用場景**

- 服務起不來，提示 Port 被占用
- 想確認哪些服務正在運行
- 快速定位 Port 衝突問題
- 清理所有服務，重新開始

### ./scripts/cli.sh env - 環境切換

**用途**: 切換開發/測試/生產環境，管理環境變數檔案

**使用方式**

```bash
./scripts/cli.sh env <subcommand> [options]
```

**子命令**

**1. current - 顯示當前環境**

```bash
./scripts/cli.sh env current
```

**2. list - 列出所有可用環境及狀態**

```bash
./scripts/cli.sh env list
```

顯示：

- local - 本地開發環境
- dev - 開發環境
- uat - 測試環境
- prod - 生產環境

**3. switch - 切換到指定環境**

```bash
./scripts/cli.sh env switch <env>
```

環境選項：

- `local` - 本地開發
- `dev` - 開發環境
- `uat` - 測試環境
- `prod` - 生產環境

**切換流程：**

1. 備份當前 `.env` 檔案
2. 複製目標環境檔案（如 `.env.dev.example` → `.env`）
3. 重啟 Docker 服務
4. 清除快取（Dragonfly cache, RabbitMQ queue）
5. 驗證切換成功

**4. diff - 比較當前環境與目標環境的差異**

```bash
./scripts/cli.sh env diff <env>
```

顯示：

- 新增的環境變數
- 刪除的環境變數
- 變更的環境變數值

**範例**

```bash
# 查看當前環境
./scripts/cli.sh env current

# 列出所有環境
./scripts/cli.sh env list

# 切換到開發環境
./scripts/cli.sh env switch dev

# 比較當前與生產環境的差異
./scripts/cli.sh env diff prod
```

**注意事項**

⚠️ **資料影響**:

- 切換環境會清除 Dragonfly cache 和 RabbitMQ queue
- **不會**刪除資料庫資料
- 建議在切換前備份重要資料

⚠️ **生產環境**:

- 切換到生產環境需要二次確認
- 建議在專用機器上運行生產環境
- 使用 Docker secrets 管理敏感資訊

### ./scripts/cli.sh doctor - 環境診斷

**用途**: 智能診斷開發環境問題

**使用方式**

```bash
./scripts/cli.sh doctor [options]
```

**選項**

- `--fix` - 嘗試自動修復問題

**檢查項目**

1. ✅ 前置條件（Node.js, pnpm, Docker）
2. ✅ 環境變數（.env 檔案完整性）
3. ✅ Port 占用（1025, 3000, 4000, 5432, 5555, 5672, 6006, 6379, 8025, 15672）
4. ✅ Docker 服務（容器運行狀態）
5. ✅ 資料庫連線（PostgreSQL, RabbitMQ, Dragonfly, Mailpit）
6. ✅ 依賴完整性
7. ✅ 檔案權限

**範例**

```bash
# 診斷問題
./scripts/cli.sh doctor

# 診斷並自動修復
./scripts/cli.sh doctor --fix
```

### ./scripts/cli.sh deps - 依賴管理

**用途**: 管理專案依賴、安全審計、套件更新

**使用方式**

```bash
./scripts/cli.sh deps [subcommand] [workspace]
```

**子命令**

**1. outdated - 檢查過時套件**

```bash
# 檢查所有套件
./scripts/cli.sh deps outdated all

# 只檢查後端
./scripts/cli.sh deps outdated backend

# 只檢查前端
./scripts/cli.sh deps outdated frontend
```

**執行效果：**

```text
━━━ 檢查過時套件 (全部)

⏳ 正在檢查套件版本...

┌───────────────────┬─────────┬────────┐
│ Package           │ Current │ Latest │
├───────────────────┼─────────┼────────┤
│ @eslint/js (dev)  │ 9.39.1  │ 9.39.2 │
│ prettier (dev)    │ 3.7.4   │ 3.8.1  │
└───────────────────┴─────────┴────────┘

✓  檢查完成
```

**2. audit - 安全性審計**

```bash
# 掃描所有套件漏洞
./scripts/cli.sh deps audit all

# 只掃描後端
./scripts/cli.sh deps audit backend
```

**執行效果：**

```text
━━━ 安全性審計 (Backend)

🔍 正在掃描安全漏洞...

┌─────────────┬──────────────────────┐
│ moderate    │ MJML Directory       │
│ Package     │ mjml                 │
│ Patched     │ <0.0.0               │
└─────────────┴──────────────────────┘

2 vulnerabilities found
Severity: 1 low | 1 moderate
```

**處理建議：**

- **Critical/High** - 立即修復
- **Moderate** - 評估影響後決定
- **Low** - 可接受風險

**3. update - 更新套件**

⚠️ **警告：** 會更新到最新版本，可能有破壞性變更

```bash
# 更新所有套件
./scripts/cli.sh deps update all

# 更新後端套件
./scripts/cli.sh deps update backend
```

**建議流程：**

```bash
# 1. 建立分支
git checkout -b deps-update-$(date +%Y%m)

# 2. 更新套件
./scripts/cli.sh deps update all

# 3. 執行測試
./scripts/cli.sh test

# 4. 本地驗證
./scripts/cli.sh dev
```

**4. unused - 掃描未使用依賴**

```bash
./scripts/cli.sh deps unused
```

**執行效果：**

```text
🔎 正在分析依賴...

━━━━━━ Backend ━━━━━━
Unused dependencies
- lodash-old

━━━━━━ Frontend ━━━━━━
No unused dependencies
```

**互動式使用**

```bash
./scripts/cli.sh

# 選擇 17) 依賴管理
# 然後選擇功能：
#   1) 檢查過時套件
#   2) 安全性審計
#   3) 更新套件
#   4) 清理未使用依賴
```

**最佳實踐**

**定期維護：**

```bash
# 每週（開發期間）
./scripts/cli.sh deps outdated all

# 每月
./scripts/cli.sh deps audit all

# 每季
./scripts/cli.sh deps update all && ./scripts/cli.sh test
```

**安全漏洞處理：**

```json
// 使用 pnpm overrides 強制更新子依賴
{
  "pnpm": {
    "overrides": {
      "lodash": "^4.17.23"
    }
  }
}
```

---

## 🎯 最佳實踐

### 新開發者學習路徑

**第 1 天**

```bash
./scripts/cli.sh          # 熟悉選單
./scripts/cli.sh init     # 初始化環境
./scripts/cli.sh dev      # 啟動開發
```

**第 1 週**

```bash
./scripts/cli.sh status              # 檢查狀態
./scripts/cli.sh restart backend     # 重啟服務
./scripts/cli.sh logs backend -f     # 查看日誌
```

**第 1 個月**

```bash
./scripts/cli.sh db migrate:create   # Migration
./scripts/cli.sh db backup          # 備份資料
./scripts/cli.sh doctor --fix       # 診斷修復
```

### 開發工作流程

**每天開始**：

```bash
./scripts/cli.sh status    # 檢查服務
./scripts/cli.sh dev       # 啟動開發
```

**開發中**：

```bash
# API 改了
./scripts/cli.sh restart backend && ./scripts/cli.sh logs backend -f

# 測試
./scripts/cli.sh test backend --watch
```

**遇到問題**：

```bash
./scripts/cli.sh doctor           # 第一步：診斷
./scripts/cli.sh clean            # 第二步：清理
./scripts/cli.sh restart all      # 第三步：重啟
./scripts/cli.sh logs backend -f  # 第四步：查看日誌
```

### 效率提升技巧

**Shell 別名**

```bash
# 加到 ~/.bashrc 或 ~/.zshrc
alias w="./scripts/cli.sh"
alias ws="./scripts/cli.sh status"
alias wd="./scripts/cli.sh dev"
alias wr="./scripts/cli.sh restart"
alias wl="./scripts/cli.sh logs"
alias wi="./scripts/cli.sh i18n"
alias wp="./scripts/cli.sh port"
alias we="./scripts/cli.sh env"
alias wdb="./scripts/cli.sh db"
alias wdoc="./scripts/cli.sh doctor"
```

使用：

```bash
ws              # = ./scripts/cli.sh status
wr backend      # = ./scripts/cli.sh restart backend
wl backend -f   # = ./scripts/cli.sh logs backend -f
wi test         # = ./scripts/cli.sh i18n test
wp status       # = ./scripts/cli.sh port status
we current      # = ./scripts/cli.sh env current
```

---

## 🚨 故障排除

### Q1: 我不知道要用什麼命令？

**A**: 直接輸入 `./scripts/cli.sh`，選單會告訴你所有選項！

### Q2: 服務起不來？

**A**:

```bash
./scripts/cli.sh doctor          # 先診斷
./scripts/cli.sh status          # 查看狀態
./scripts/cli.sh logs backend -f # 看日誌找原因
```

### Q3: Port 被占用？

**A**:

```bash
./scripts/cli.sh doctor  # 會告訴你哪個進程占用
# 或手動查看
lsof -i :4000
```

### Q4: 資料庫連不上？

**A**:

```bash
./scripts/cli.sh status          # 檢查 Docker
./scripts/cli.sh restart docker  # 重啟 Docker
./scripts/cli.sh logs postgres -f# 查看日誌
```

### Q5: 測試一直失敗？

**A**:

```bash
./scripts/cli.sh clean
./scripts/cli.sh init --skip-docker
./scripts/cli.sh restart all
./scripts/cli.sh test
```

### Q6: Port 被占用怎麼辦？

**A**:

```bash
# 查看 Port 狀態（自動顯示衝突）
./scripts/cli.sh port status
# 會列出所有被佔用的 Port 及佔用進程

# 釋放特定 Port
./scripts/cli.sh port free 3000

# 或釋放所有被佔用的 Port
./scripts/cli.sh port free-all
```

### Q7: 翻譯鍵不知道有沒有用到？

**A**:

```bash
# 檢查未使用的翻譯鍵
./scripts/cli.sh i18n unused --show

# 生成清理腳本
./scripts/cli.sh i18n unused --cleanup

# 預覽刪除
node cleanup-unused-i18n-keys.js

# 確認刪除
node cleanup-unused-i18n-keys.js --confirm
```

### Q8: 怎麼切換到不同環境？

**A**:

```bash
# 先查看當前環境
./scripts/cli.sh env current

# 列出所有環境
./scripts/cli.sh env list

# 切換環境
./scripts/cli.sh env switch dev
```

---

## 🏗️ 技術架構

### Scripts 目錄結構

```text
scripts/
├── cli.sh                      # 主入口（互動式選單 + 命令路由）
├── README.md                   # Scripts 說明文檔
├── commands/                   # 核心命令
│   ├── clean.sh                # 清理工具
│   ├── db.sh                   # 資料庫管理
│   ├── deps.sh                 # 依賴管理
│   ├── dev.sh                  # 開發啟動
│   ├── doctor.sh               # 環境診斷
│   ├── env.sh                  # 環境切換
│   ├── i18n.sh                 # 多語系管理
│   ├── init.sh                 # 初始化環境
│   ├── logs.sh                 # 日誌查看
│   ├── port.sh                 # Port 管理
│   ├── restart.sh              # 服務重啟
│   ├── status.sh               # 服務狀態
│   ├── stop.sh                 # 停止服務
│   ├── test.sh                 # 測試執行
│   └── test-services-safe.sh   # 服務健康檢查（內部使用）
└── utils/
    └── common.sh               # 共用函數庫（35+ 函數）
```

### 命令實作詳解

**cli.sh - 主入口**

作用：統一的命令列介面，提供互動式選單和命令路由

關鍵程式碼：

```bash
#!/bin/bash
set -euo pipefail

# 無參數 = 互動式選單
if [[ -z "${1:-}" ]]; then
  show_interactive_menu
  exit 0
fi

# 路由到子命令
case "$COMMAND" in
  init|dev|test|clean|db|doctor|status|stop|restart|logs|i18n|port|env|deps)
    exec "$SCRIPT_DIR/commands/$COMMAND.sh" "$@"
    ;;
  *)
    log_error "未知的命令: $COMMAND"
    echo "💡 小提示：輸入 ./scripts/cli.sh 進入互動式選單"
    exit 1
    ;;
esac
```

### 共用函數庫

**common.sh**

作用：提供所有命令共用的函數庫（DRY 原則）

**包含的函數（35+）**

顏色與樣式：

```bash
RED, GREEN, YELLOW, BLUE, CYAN, MAGENTA, DIM, NC
```

日誌函數：

```bash
log_info()      # ℹ 資訊（藍色）
log_success()   # ✓ 成功（綠色）
log_warning()   # ⚠ 警告（黃色）
log_error()     # ✗ 錯誤（紅色）
log_step()      # ▶ 步驟（青色）
print_header()  # 標題框（綠色邊框）
```

互動函數：

```bash
confirm()              # 確認提示（y/N）
select_from_list()     # 列表選擇
```

檢查函數：

```bash
check_command()        # 檢查命令是否存在
check_port()           # 檢查 Port 是否被占用
check_file()           # 檢查檔案是否存在
check_docker()         # 檢查 Docker 是否運行
```

工具函數：

```bash
get_project_root()     # 取得專案根目錄
get_container_name()   # 取得 Docker 容器名稱 (timescaledb, rabbitmq, dragonfly, mailpit)
get_env_value()        # 讀取 .env 值
update_env()           # 更新 .env 值
wait_for_port()        # 等待 Port 可用
wait_for_service()     # 等待服務就緒（支援自訂檢查命令）
kill_port()            # 終止占用 Port 的進程
```

### 貢獻指南

**添加新命令**

1. 建立命令檔案

```bash
touch scripts/commands/your-command.sh
chmod +x scripts/commands/your-command.sh
```

2. 使用範本

```bash
#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

source "$SCRIPT_DIR/../utils/common.sh"

show_command_help() {
  cat << EOF
使用方式、選項、範例...
EOF
}

# 主要邏輯...
```

3. 加入路由（cli.sh）

```bash
your-command)
  exec "$SCRIPT_DIR/commands/your-command.sh" "$@"
  ;;
```

4. 更新文檔

- 本文檔（CLI_GUIDE.md）
- README.md（如適用）

**編碼規範**

- ✅ 使用 `set -euo pipefail`
- ✅ 載入 common.sh 使用共用函數
- ✅ 提供 `--help` 選項
- ✅ 使用一致的日誌格式
- ✅ 處理錯誤並提供解決建議
- ✅ 添加範例和小技巧
- ✅ 註解關鍵邏輯

---

## 📚 相關資源

- [Docker Setup](./DOCKER_SETUP.md) - Docker 配置與安全
- [Monorepo Structure](./MONOREPO_STRUCTURE.md) - 專案結構說明
- [Environment Variables](../infrastructure/ENVIRONMENT_VARIABLES.md) - 環境變數完整指南
- [API Response Format](../backend/API_RESPONSE_FORMAT.md) - API 回應格式
- [RBAC Architecture](../authentication/RBAC_ARCHITECTURE.md) - 角色權限系統
- [Audit Log System](../backend/AUDIT_LOG_SYSTEM.md) - 審計日誌
