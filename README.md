# MEAD — New Project Template

**企業級全端 monorepo 模板**：Next.js 16 + NestJS 11 + GraphQL + TimescaleDB 的應用程式骨架，預先整合認證、授權、稽核日誌、通知、排程任務等基礎建設，協助團隊快速啟動新專案。

> 本 repo 僅含「身份／系統管理」相關的核心模組。業務模組（如提案、工單、議題追蹤等）請依專案需求自行擴充。

![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20.0.0-339933?logo=node.js&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-%3E%3D9.0.0-F69220?logo=pnpm&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=next.js&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white)
![MUI](https://img.shields.io/badge/MUI-7-007FFF?logo=mui&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma&logoColor=white)
![GraphQL](https://img.shields.io/badge/GraphQL-E10098?logo=graphql&logoColor=white)
![Storybook](https://img.shields.io/badge/Storybook-10-FF4785?logo=storybook&logoColor=white)
![Turborepo](https://img.shields.io/badge/Turborepo-2-EF4444?logo=turborepo&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white)

## 目錄

- [架構](#架構)
- [主要功能](#主要功能)
- [系統需求](#系統需求)
- [快速開始](#快速開始)
- [開發](#開發)
- [文檔](#文檔)

---

## 架構

- **前端**: Next.js 16 (App Router) + MUI 7
- **後端**: NestJS 11 + GraphQL + Prisma
- **資料庫**: TimescaleDB (PostgreSQL 相容)
- **訊息佇列**: RabbitMQ 3.13
- **快取**: Dragonfly (Redis 相容)
- **Monorepo**: pnpm workspaces + Turborepo

### 目錄結構

```text
mead/
├── apps/
│   ├── frontend/              # Next.js 前端應用
│   └── backend/               # NestJS GraphQL API
│       └── database/          # Prisma schema & migrations
├── packages/
│   ├── typescript-config/     # 共享 TypeScript 設定
│   └── eslint-config/         # 共享 ESLint 設定
├── infra/
│   └── seaweedfs/             # SeaweedFS 儲存服務設定
├── scripts/                   # MEAD CLI 工具腳本
│   ├── cli.sh                 # CLI 主程式
│   ├── commands/              # CLI 命令實作
│   └── utils/                 # CLI 工具函式
├── docs/                      # 完整專案文檔
│   ├── authentication/        # 認證相關文檔
│   ├── backend/               # 後端文檔
│   ├── database/              # 資料庫文檔
│   ├── frontend/              # 前端文檔
│   ├── getting-started/       # 入門指南
│   └── infrastructure/        # 基礎架構文檔
└── docker-compose.yml         # Docker 服務配置
```

---

## 內建功能

### 認證與授權

- JWT Token 認證（access + refresh）
- 雙因素認證（2FA，Email-based）
- RBAC 角色權限控制（HQ / Customer / Public 三層 Scope）
- 列級別安全（Row-Level Security）
- 欄位級別授權（Field-Level Authorization）
- 速率限制與防濫用
- 個人存取權杖（PAT）基礎建設
- 帳號鎖定、密碼歷史、密碼政策

### 用戶與角色管理

- 用戶 CRUD、軟刪除、還原
- HQ 後台管理介面（用戶、角色、會話）
- Profile / Account 個人設定頁

### 資料管理

- GraphQL API（Apollo Server，支援 Subscriptions）
- Prisma ORM + TimescaleDB
- 軟刪除機制
- 稽核日誌系統（RabbitMQ 批次寫入 + TimescaleDB 優化）
- Offset-based 分頁

### 通知

- 系統通知（鈴鐺 + 通知中心，支援 BroadcastChannel 跨頁同步）
- Email 通知（密碼變更、會話撤銷、PAT 建立/撤銷等）
- GraphQL Subscriptions 即時推播

### 系統運維

- Cron Job 監控與管理介面（分散式鎖）
- Session 管理與批次撤銷
- TLS 自動化（LetsEncrypt / Cloudflare / AWS ACM）

### 多語系 (i18n)

- 前端：next-intl（路徑前綴 `/en`、`/zh-TW`）
- 後端：nestjs-i18n（Accept-Language / x-lang header）
- Email 模板：依語言載入對應模板
- 支援語言：English (en)、繁體中文 (zh-TW)

### 前端技術

- Next.js 16 App Router
- Material-UI 7 組件庫
- Apollo Client 4
- Atomic Design 架構
- Storybook 10 組件展示

### 開發工具

- MEAD CLI（一鍵 init / dev / restart / db / status / doctor）
- Turborepo 任務編排
- pnpm Workspace
- Docker Compose
- 熱重載開發環境

---

## 系統需求

- **Node.js** >= 20.0.0
- **pnpm** >= 9.0.0
- **Docker** & Docker Compose
- **作業系統**: macOS / Linux / Windows (WSL2)

---

## 使用本模板開新專案

1. 將本 repo 複製到您的新專案目錄並改名
   ```bash
   cp -R /path/to/mead /path/to/your-new-project
   cd /path/to/your-new-project
   git init && git add . && git commit -m "init from MEAD template"
   ```
2. 全域取代 `mead`/`MEAD` 為您的專案代號（建議用 IDE 全域 rename）
3. 修改 `apps/backend/database/prisma/seeds/base.ts` 中的權限與角色，加入您專案特有的 perm
4. 修改 `apps/backend/src/modules/personal-access-token/personal-access-token.service.ts` 的 `ALLOWED_SCOPES`
5. 在 `apps/backend/src/modules/` 與 `apps/frontend/src/app/[locale]/` 新增您的業務模組
6. 詳見 [docs/backend/CONVENTIONS.md](docs/backend/CONVENTIONS.md) 的命名規則與 RBAC 慣例

---

## 快速開始

### 方式 1：使用 MEAD CLI（推薦）⭐

最簡單的方式，一鍵完成所有設置：

```bash
# 互動式選單
./scripts/cli.sh

# 或直接初始化
./scripts/cli.sh init
```

MEAD CLI 會自動完成：

- ✅ 系統需求檢查
- ✅ 依賴安裝
- ✅ Docker 服務啟動
- ✅ 資料庫初始化
- ✅ 服務驗證

**完整說明**：[MEAD CLI 完整指南](docs/getting-started/CLI_GUIDE.md)

### 預設帳號（development / uat seed 共用）

> 登入身分為「帳號（accountName）」，**非 email**；email 僅作通知用。
> 這些 seed 帳號首次登入會被**強制變更密碼**（詳見 [Scope Routing](docs/authentication/SCOPE_ROUTING.md)）。

| 帳號（登入用）   | 密碼           | Email（通知）        | 角色                                                    |
| ---------------- | -------------- | -------------------- | ------------------------------------------------------- |
| `hq_admin`       | `Password123!` | `hq@example.com`     | `SUPER_HQ`（HQ）+ `MANAGER`（CUSTOMER）— 最高權限       |
| `customer_admin` | `Password123!` | `admin@example.com`  | `OWNER`（CUSTOMER）— 純 Customer Scope dashboard 體驗用 |
| `public_user`    | `Password123!` | `public@example.com` | 無角色（PUBLIC_SCOPE）— 用於測試「未授權」情境          |

> Production 環境刻意**不**建立任何測試帳號。部署前請改密碼並建立正式帳號。
> 詳見 `apps/backend/database/prisma/seeds/development.ts`。

---

### 方式 2：手動設置（進階）

<details>
<summary><b>展開查看手動設置步驟</b></summary>

#### 1. 安裝依賴

```bash
pnpm install
```

#### 2. 設定環境變數

```bash
# Docker 服務配置
cp .env.docker.example .env.docker

# 後端配置
cp apps/backend/.env.example apps/backend/.env

# 前端配置
cp apps/frontend/.env.example apps/frontend/.env
```

#### 3. 啟動 Docker 服務

```bash
docker-compose --env-file .env.docker up -d
```

這會啟動：

- TimescaleDB (PostgreSQL): port 5432
- RabbitMQ: AMQP 5672, 管理介面 15672
- Dragonfly (Redis): port 6379

#### 4. 初始化資料庫

```bash
# 產生 Prisma Client
pnpm db:generate

# 執行 migrations
cd apps/backend && pnpm prisma migrate deploy && cd ../..

# 載入初始資料
pnpm db:seed
```

#### 5. 啟動開發伺服器

```bash
# 同時啟動前後端
pnpm dev

# 或個別啟動
pnpm --filter @mead/frontend dev
pnpm --filter @mead/backend dev
```

</details>

---

## 開發

### 啟動開發環境

使用 MEAD CLI（推薦）：

```bash
./scripts/cli.sh dev
```

或使用 pnpm：

```bash
pnpm dev
```

### 服務端點

| 服務                   | 端點                            | 說明               |
| ---------------------- | ------------------------------- | ------------------ |
| **前端**               | <http://localhost:3000>         | Next.js 應用       |
| **後端 API**           | <http://localhost:4000>         | NestJS GraphQL API |
| **GraphQL Playground** | <http://localhost:4000/graphql> | Apollo Sandbox     |
| **Prisma Studio**      | <http://localhost:5555>         | 資料庫管理介面     |
| **RabbitMQ 管理**      | <http://localhost:15672>        | hq/password        |

### 常用命令

#### MEAD CLI（推薦）

```bash
./scripts/cli.sh              # 互動式選單
./scripts/cli.sh init         # 初始化環境
./scripts/cli.sh dev          # 啟動開發
./scripts/cli.sh status       # 查看服務狀態
./scripts/cli.sh logs         # 查看日誌
./scripts/cli.sh restart      # 重啟服務
./scripts/cli.sh test         # 執行測試
./scripts/cli.sh db           # 資料庫管理
./scripts/cli.sh doctor       # 環境診斷
./scripts/cli.sh clean        # 環境清理
```

完整說明: [MEAD CLI 完整指南](docs/getting-started/CLI_GUIDE.md)

#### pnpm 命令

<details>
<summary><b>展開查看完整命令列表</b></summary>

**開發**

```bash
pnpm dev                    # 啟動所有應用程式
pnpm frontend:dev           # 僅啟動前端
pnpm backend:dev            # 僅啟動後端
pnpm storybook              # 啟動 Storybook
```

**建置與檢查**

```bash
pnpm build                  # 建置所有應用程式
pnpm lint                   # 程式碼檢查
pnpm lint:fix               # 自動修正 lint 問題
pnpm type-check             # TypeScript 型別檢查
pnpm format                 # 格式化程式碼
pnpm test                   # 執行測試
```

**資料庫**

```bash
pnpm db:generate            # 產生 Prisma Client
pnpm db:push                # 推送 schema 到資料庫
pnpm db:migrate             # 執行資料庫遷移
pnpm db:studio              # 開啟 Prisma Studio
pnpm db:seed                # 載入初始資料
```

**Docker**

```bash
docker-compose --env-file .env.docker --profile tools up -d  # 啟動服務（含 dev 工具）
docker-compose --profile tools --profile storage down        # 停止服務（含 tools / storage profile）
docker-compose logs -f                         # 查看日誌
docker-compose ps                              # 查看服務狀態
```

</details>

---

## 文檔

完整的專案文檔已組織在 [`docs/`](docs/) 目錄中。

### 開始閱讀

**[文檔導航中心](docs/README.md)** ← 從這裡開始！

### 新手推薦閱讀順序

1. [貢獻指南](docs/getting-started/CONTRIBUTING.md) - 開發流程、Commit 規範、PR 流程
2. [MEAD CLI 完整指南](docs/getting-started/CLI_GUIDE.md) - 開發者工具
3. [Docker 設置指南](docs/getting-started/DOCKER_SETUP.md) - 環境設置
4. [Monorepo 結構說明](docs/getting-started/MONOREPO_STRUCTURE.md) - 專案結構
5. [前後端 i18n 協調機制](docs/getting-started/I18N_COORDINATION.md) - 多國語系
6. [疑難排解](docs/getting-started/TROUBLESHOOTING.md) - 遇到問題時先看這裡

### 熱門文檔

- [API 回應格式規範](docs/backend/API_RESPONSE_FORMAT.md) - 統一 API 格式
- [RBAC 架構](docs/authentication/RBAC_ARCHITECTURE.md) - 角色權限系統
- [組件庫指南](docs/frontend/COMPONENT_LIBRARY.md) - Atomic Design 組件
- [部署指南](docs/getting-started/DEPLOYMENT.md) - 環境分層與發布流程

---

## 作者

**Walker Chiu** - [walker.chiu@icp-si.com](mailto:walker.chiu@icp-si.com)

---

## 版權聲明 / Copyright

Copyright 2026 **加雲聯網股份有限公司** (Intelligent Cloud Plus Inc.)
All Rights Reserved.

本軟體為加雲聯網股份有限公司之專有財產，未經書面授權不得複製、修改、散布或使用。
This software is proprietary to Intelligent Cloud Plus Inc. and may not
be reproduced, modified, distributed, or used without prior written
permission. See [LICENSE](./LICENSE) for full terms.
