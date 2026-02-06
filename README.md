# Wind Monorepo

現代化全端 monorepo，使用 Next.js 16、NestJS 11、GraphQL 和 TimescaleDB。

![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20.0.0-339933?logo=node.js&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-%3E%3D9.0.0-F69220?logo=pnpm&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=next.js&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white)
![MUI](https://img.shields.io/badge/MUI-7-007FFF?logo=mui&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma&logoColor=white)
![GraphQL](https://img.shields.io/badge/GraphQL-E10098?logo=graphql&logoColor=white)
![Storybook](https://img.shields.io/badge/Storybook-10-FF4785?logo=storybook&logoColor=white)
![Turborepo](https://img.shields.io/badge/Turborepo-2-EF4444?logo=turborepo&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white)

## 📋 目錄

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
wind/
├── apps/
│   ├── frontend/              # Next.js 前端應用
│   └── backend/               # NestJS GraphQL API
│       └── database/          # Prisma schema & migrations
├── packages/
│   ├── typescript-config/     # 共享 TypeScript 設定
│   └── eslint-config/         # 共享 ESLint 設定
├── scripts/                   # Wind CLI 工具腳本
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

## 主要功能

### 🔐 認證與授權

- JWT Token 認證
- RBAC 角色權限控制
- 列級別安全（Row-Level Security）
- 欄位級別授權（Field-Level Authorization）
- 雙因素認證 (2FA)
- 速率限制與防濫用

### 📊 資料管理

- GraphQL API (Apollo Server)
- Prisma ORM with TimescaleDB
- 軟刪除機制
- 審計日誌系統
- Offset-based 分頁

### 🌐 多語系 (i18n)

- 前端：next-intl（路徑前綴 `/en`、`/zh-TW`）
- 後端：nestjs-i18n（Accept-Language / x-lang header）
- Email 模板：依語言載入對應模板
- 支援語言：English (en)、繁體中文 (zh-TW)

### 🎨 前端技術

- Next.js 16 App Router
- Material-UI 組件庫
- Apollo Client
- Atomic Design 架構
- Storybook 組件展示

### 🚀 開發工具

- Wind CLI 開發工具
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

## 快速開始

### 方式 1：使用 Wind CLI（推薦）⭐

最簡單的方式，一鍵完成所有設置：

```bash
# 互動式選單
./scripts/cli.sh

# 或直接初始化
./scripts/cli.sh init
```

Wind CLI 會自動完成：

- ✅ 系統需求檢查
- ✅ 依賴安裝
- ✅ Docker 服務啟動
- ✅ 資料庫初始化
- ✅ 服務驗證

**完整說明**：[Wind CLI 完整指南](docs/getting-started/CLI_GUIDE.md)

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
pnpm --filter @wind/frontend dev
pnpm --filter @wind/backend dev
```

</details>

---

## 開發

### 啟動開發環境

使用 Wind CLI（推薦）：

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
| **RabbitMQ 管理**      | <http://localhost:15672>        | admin/password     |

### 常用命令

#### Wind CLI（推薦）

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
./scripts/cli.sh clean        # 清理快取
```

完整說明: [Wind CLI 完整指南](docs/getting-started/CLI_GUIDE.md)

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
docker-compose --env-file .env.docker up -d    # 啟動服務
docker-compose down                            # 停止服務
docker-compose logs -f                         # 查看日誌
docker-compose ps                              # 查看服務狀態
```

</details>

---

## 文檔

完整的專案文檔已組織在 [`docs/`](docs/) 目錄中。

### 🎯 開始閱讀

**[📖 文檔導航中心](docs/README.md)** ← 從這裡開始！

### 📖 新手推薦閱讀順序

1. [Wind CLI 完整指南](docs/getting-started/CLI_GUIDE.md) - 開發者工具
2. [Docker 設置指南](docs/getting-started/DOCKER_SETUP.md) - 環境設置
3. [Monorepo 結構說明](docs/getting-started/MONOREPO_STRUCTURE.md) - 專案結構
4. [前後端 i18n 協調機制](docs/getting-started/I18N_COORDINATION.md) - 多國語系

### 🔥 熱門文檔

- [API 回應格式規範](docs/backend/API_RESPONSE_FORMAT.md) - 統一 API 格式
- [RBAC 架構](docs/authentication/RBAC_ARCHITECTURE.md) - 角色權限系統
- [組件庫指南](docs/frontend/COMPONENT_LIBRARY.md) - Atomic Design 組件

---

## 作者

**Walker Chiu** - [walker.chiu@icp-si.com](mailto:walker.chiu@icp-si.com)
