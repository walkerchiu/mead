# Monorepo 專案結構說明

使用 pnpm workspace 和 Turborepo 管理的 Monorepo 架構完整指南。

---

## 📋 目錄

- [Monorepo 專案結構說明](#monorepo-專案結構說明)
  - [📋 目錄](#-目錄)
  - [📖 概述](#-概述)
    - [為什麼選擇 Monorepo？](#為什麼選擇-monorepo)
    - [技術棧](#技術棧)
  - [📐 目錄結構](#-目錄結構)
  - [✨ 應用程式 (Apps)](#-應用程式-apps)
    - [Frontend (@npt/frontend)](#frontend-nptfrontend)
    - [Backend (@npt/backend)](#backend-nptbackend)
  - [📦 共用套件 (Packages)](#-共用套件-packages)
    - [@npt/typescript-config](#npttypescript-config)
    - [@repo/eslint-config](#repoeslint-config)
  - [🔧 工作區配置](#-工作區配置)
    - [pnpm-workspace.yaml](#pnpm-workspaceyaml)
    - [套件依賴關係](#套件依賴關係)
    - [turbo.json（任務編排）](#turbojson任務編排)
  - [📝 開發流程](#-開發流程)
    - [1. 安裝依賴](#1-安裝依賴)
    - [2. 啟動開發環境](#2-啟動開發環境)
    - [3. 建置專案](#3-建置專案)
    - [4. 執行測試](#4-執行測試)
    - [5. 型別檢查](#5-型別檢查)
    - [6. Lint 檢查](#6-lint-檢查)
  - [🎯 最佳實踐](#-最佳實踐)
    - [✅ DO - 應該這樣做](#-do---應該這樣做)
    - [❌ DON'T - 不要這樣做](#-dont---不要這樣做)
  - [❓ 常見問題](#-常見問題)
    - [Q1: 如何新增一個應用？](#q1-如何新增一個應用)
    - [Q2: 如何新增一個共用套件？](#q2-如何新增一個共用套件)
    - [Q3: 為什麼有些依賴要放在 root？](#q3-為什麼有些依賴要放在-root)
    - [Q4: Turborepo 快取在哪裡？](#q4-turborepo-快取在哪裡)
  - [📚 相關資源](#-相關資源)

---

## 📖 概述

NPT 專案採用 **Monorepo** 架構，使用 **pnpm workspace** 和 **Turborepo** 管理多個應用程式和共用套件。

### 為什麼選擇 Monorepo？

| 優點           | 說明                               |
| -------------- | ---------------------------------- |
| **程式碼共用** | 輕鬆共用型別、組件、工具函數       |
| **統一版本**   | 所有套件使用相同的依賴版本         |
| **原子提交**   | 一次 commit 可跨多個專案           |
| **重構友善**   | 修改共用程式碼立即反映到所有使用處 |
| **CI/CD 優化** | Turborepo 快取加速建置             |

### 技術棧

- **套件管理**: pnpm (workspace)
- **建置工具**: Turborepo
- **前端**: Next.js 16 + React 19
- **後端**: NestJS 11 + GraphQL
- **資料庫**: Prisma + PostgreSQL
- **UI 框架**: Material-UI 7

---

## 📐 目錄結構

```text
npt/
├── apps/                          # 應用程式目錄
│   ├── frontend/                  # Next.js 前端應用
│   │   ├── src/
│   │   ├── public/
│   │   ├── package.json           # @npt/frontend
│   │   └── next.config.js
│   │
│   └── backend/                   # NestJS 後端應用
│       ├── src/
│       ├── database/              # Prisma ORM (內部模組)
│       │   ├── prisma/
│       │   │   ├── schema.prisma
│       │   │   ├── migrations/
│       │   │   └── seeds/
│       │   └── seed.ts
│       ├── package.json           # @npt/backend
│       └── nest-cli.json
│
├── packages/                      # 共用套件目錄
│   ├── typescript-config/         # TypeScript 配置
│   │   ├── base.json
│   │   ├── nextjs.json
│   │   ├── nestjs.json
│   │   ├── react-library.json
│   │   └── package.json           # @npt/typescript-config
│   │
│   └── eslint-config/             # ESLint 配置
│       ├── library.js
│       ├── next.js
│       └── package.json           # @repo/eslint-config
│
├── scripts/                       # 開發者腳本
│   ├── cli.sh                    # NPT CLI 主腳本
│   └── commands/                  # 各種命令
│
├── docs/                          # 專案文檔
├── docker-compose.yml             # Docker 服務配置
├── turbo.json                     # Turborepo 配置
├── pnpm-workspace.yaml            # pnpm workspace 配置
└── package.json                   # Root package.json
```

---

## ✨ 應用程式 (Apps)

### Frontend (@npt/frontend)

**技術棧**:

- Next.js 16.1.5 (App Router)
- React 19.2.3
- Apollo Client 4.1.2
- Material-UI 7.3.7
- Storybook 10.2.1

**主要功能**:

- 用戶介面
- GraphQL 客戶端
- 認證流程（登入、2FA）
- 組件開發與測試（Storybook）

**目錄結構**:

```text
apps/frontend/src/
├── app/                    # Next.js App Router 頁面
├── components/            # React 組件
│   ├── atoms/            # 原子組件
│   ├── molecules/        # 分子組件
│   ├── organisms/        # 有機組件
│   └── templates/        # 模板組件
├── lib/                   # 工具函數
│   ├── apollo-client.ts  # Apollo Client 配置
│   └── auth.ts           # 認證工具
└── mocks/                 # MSW 模擬資料
```

**啟動命令**:

```bash
cd apps/frontend
pnpm dev        # 開發模式（http://localhost:3000）
pnpm build      # 建置生產版本
pnpm storybook  # 啟動 Storybook（http://localhost:6006）
```

### Backend (@npt/backend)

**技術棧**:

- NestJS 11.2.3
- GraphQL (Apollo Server)
- Prisma 6.2.1
- JWT 認證
- RabbitMQ + Dragonfly (Redis)

**主要功能**:

- GraphQL API 伺服器
- 認證與授權（RBAC、欄位權限）
- 資料庫操作（Prisma）
- 審計日誌系統
- Email 服務

**目錄結構**:

```text
apps/backend/
├── src/                   # 業務邏輯程式碼
│   ├── modules/          # 功能模組
│   │   ├── auth/         # 認證模組
│   │   ├── user/         # 用戶模組
│   │   ├── role/         # 角色模組
│   │   └── ...
│   ├── common/           # 共用程式碼
│   │   ├── decorators/   # 裝飾器
│   │   ├── guards/       # 守衛
│   │   ├── filters/      # 異常過濾器
│   │   └── utils/        # 工具函數
│   ├── prisma/           # Prisma Service
│   ├── mail/             # Email 服務
│   └── main.ts           # 應用入口
│
└── database/             # 資料庫層（內部模組）
    ├── prisma/
    │   ├── schema.prisma # Prisma Schema
    │   ├── migrations/   # 資料庫遷移
    │   └── seeds/        # 種子資料
    └── seed.ts           # Seed 腳本
```

**啟動命令**:

```bash
cd apps/backend
pnpm dev        # 開發模式（http://localhost:4000）
pnpm build      # 建置生產版本
pnpm test       # 執行測試
```

---

## 📦 共用套件 (Packages)

NPT 專案只保留真正需要跨應用共用的配置套件。

### @npt/typescript-config

**用途**: 統一的 TypeScript 配置

**配置檔案**:

- `base.json` - 基礎配置
- `nextjs.json` - Next.js 專用
- `nestjs.json` - NestJS 專用
- `react-library.json` - React 組件庫

**使用方式**:

```json
// apps/frontend/tsconfig.json
{
  "extends": "@npt/typescript-config/nextjs.json",
  "compilerOptions": {
    "baseUrl": "./src"
  }
}
```

### @repo/eslint-config

**用途**: 統一的 ESLint 規則

**使用方式**:

```javascript
// apps/frontend/eslint.config.mjs
import eslintConfig from '@repo/eslint-config/next';

export default eslintConfig;
```

---

## 🔧 工作區配置

### pnpm-workspace.yaml

```yaml
packages:
  - 'apps/*' # 包含 frontend、backend
  - 'packages/*' # 包含 database、typescript-config、eslint-config
```

### 套件依賴關係

```typescript
@npt/frontend
└── @npt/typescript-config (workspace:*)

@npt/backend
├── @prisma/client (npm package)
└── @npt/typescript-config (workspace:*)
```

**說明**:

- Frontend 的 UI 組件直接在 `apps/frontend/src/components/` 開發
- 採用 Atomic Design 架構（atoms、molecules、organisms、templates）
- 使用 Storybook 進行組件文檔化

### turbo.json（任務編排）

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**", "build/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "type-check": {
      "dependsOn": ["^type-check"]
    },
    "db:*": {
      "cache": false
    }
  }
}
```

**特性**:

- ✅ 自動處理依賴順序（`^build` 表示先建置依賴）
- ✅ 智能快取（加速建置）
- ✅ 並行執行任務

---

## 📝 開發流程

### 1. 安裝依賴

```bash
# 根目錄安裝所有依賴
pnpm install
```

pnpm 會自動處理所有 workspace 套件的連結。

### 2. 啟動開發環境

```bash
# 使用 NPT CLI（推薦）
./scripts/cli.sh dev

# 或手動啟動
pnpm dev          # 啟動所有應用
pnpm dev --filter=@npt/frontend  # 只啟動前端
pnpm dev --filter=@npt/backend   # 只啟動後端
```

### 3. 建置專案

```bash
# 建置所有應用
pnpm build

# 建置特定應用
pnpm build --filter=@npt/frontend
```

Turborepo 會自動處理依賴順序，並快取建置結果。

### 4. 執行測試

```bash
# 執行所有測試
pnpm test

# 執行特定應用的測試
pnpm test --filter=@npt/backend
```

### 5. 型別檢查

```bash
# 檢查所有專案的型別
pnpm type-check

# 檢查特定專案
pnpm type-check --filter=@npt/frontend
```

### 6. Lint 檢查

```bash
# 檢查所有專案
pnpm lint

# 修復 Lint 問題
pnpm lint --fix
```

---

## 🎯 最佳實踐

### ✅ DO - 應該這樣做

**1. 使用 workspace 協議**

當需要引用共用配置套件時：

```json
{
  "dependencies": {
    "@npt/typescript-config": "workspace:*"
  }
}
```

**2. Database Schema 屬於 Backend**

Database schema 和 migrations 是 backend 的內部實現細節：

```typescript
// apps/backend/src/prisma/prisma.service.ts
import { PrismaClient } from '@prisma/client';

// Prisma Client 從 apps/backend/database/prisma/schema.prisma 生成
```

**3. 使用 Turborepo 命令**

```bash
# ✅ 好：使用 Turborepo
pnpm build

# ❌ 差：手動進入每個目錄建置
cd apps/frontend && pnpm build
cd apps/backend && pnpm build
```

**4. 統一的 Git commit**

```bash
# ✅ 好：一次提交跨多個專案的修改
git add apps/frontend apps/backend
git commit -m "feat: add user profile feature"

# 不需要分開提交
```

### ❌ DON'T - 不要這樣做

**1. 不要重複安裝相同依賴**

```json
// ❌ 錯誤：在多個套件重複安裝
// apps/frontend/package.json
{
  "dependencies": {
    "lodash": "^4.17.21"
  }
}

// apps/backend/package.json
{
  "dependencies": {
    "lodash": "^4.17.21"
  }
}

// ✅ 正確：在 root package.json 安裝共用依賴
// 或建立 @npt/shared 套件
```

**2. 不要直接引用其他應用的程式碼**

```typescript
// ❌ 錯誤：frontend 直接引用 backend
import { UserService } from '../../../backend/src/modules/user/user.service';

// ✅ 正確：透過 GraphQL API 或建立共用套件
```

**3. 不要忽略快取**

```bash
# ❌ 錯誤：每次都清除快取
pnpm build --force

# ✅ 正確：讓 Turborepo 管理快取
pnpm build
```

---

## ❓ 常見問題

### Q1: 如何新增一個應用？

```bash
# 1. 在 apps/ 目錄建立新專案
mkdir apps/my-app
cd apps/my-app
pnpm init

# 2. 更新 package.json
{
  "name": "@npt/my-app",
  "version": "1.0.0"
}

# 3. pnpm install 會自動識別
```

### Q2: 如何新增一個共用套件？

```bash
# 1. 在 packages/ 目錄建立套件
mkdir packages/my-package
cd packages/my-package
pnpm init

# 2. 設定為 workspace 套件
{
  "name": "@npt/my-package",
  "version": "1.0.0"
}

# 3. 在其他專案引用
pnpm add @npt/my-package --filter=@npt/frontend
```

### Q3: 為什麼有些依賴要放在 root？

**應該放在 root 的依賴**:

- 開發工具（TypeScript, ESLint, Prettier）
- 測試工具（Jest, Vitest）
- 建置工具（Turborepo）

**應該放在各自專案的依賴**:

- 框架（Next.js, NestJS）
- 特定功能依賴

### Q4: Turborepo 快取在哪裡？

```bash
# 查看快取目錄
ls node_modules/.cache/turbo

# 清除快取
pnpm clean
# 或
rm -rf node_modules/.cache/turbo
```

---

## 📚 相關資源

- [CLI Guide](./CLI_GUIDE.md) - 開發者 CLI 工具
- [Docker Setup](./DOCKER_SETUP.md) - Docker 環境設置
- [Prisma Schema Organization](../database/PRISMA_SCHEMA_ORGANIZATION.md) - 資料庫設計
