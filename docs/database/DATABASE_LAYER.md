# Database Layer

Backend 的內部資料庫層，使用 Prisma ORM 管理 schema、遷移與種子資料。

---

## 📋 目錄

- [Database Layer](#database-layer)
  - [📋 目錄](#-目錄)
  - [📖 概述](#-概述)
  - [🏗️ 目錄結構](#️-目錄結構)
  - [🚀 快速開始](#-快速開始)
  - [🛠️ 常用命令](#️-常用命令)
    - [從 Backend 目錄執行](#從-backend-目錄執行)
    - [使用 CLI（從專案根目錄）](#使用-cli從專案根目錄)
  - [📐 Schema 結構](#-schema-結構)
    - [多檔案架構](#多檔案架構)
    - [編輯工作流程](#編輯工作流程)
    - [Base Schema 配置](#base-schema-配置)
  - [🌱 種子資料](#-種子資料)
    - [環境別載入](#環境別載入)
    - [執行 Seed](#執行-seed)
  - [🔄 Migration 遷移](#-migration-遷移)
    - [1. 修改 Schema](#1-修改-schema)
    - [2. 建立 Migration](#2-建立-migration)
    - [3. 檢查生成的 SQL](#3-檢查生成的-sql)
    - [4. 執行 Migration](#4-執行-migration)
  - [❓ 常見問題](#-常見問題)
    - [Q: 為什麼要模組化 schema？](#q-為什麼要模組化-schema)
    - [Q: Prisma Client 在哪裡？](#q-prisma-client-在哪裡)
    - [Q: 如何在程式碼中使用？](#q-如何在程式碼中使用)
    - [Q: 為什麼沒有獨立的 package.json？](#q-為什麼沒有獨立的-packagejson)
  - [🚨 故障排除](#-故障排除)
    - [TypeScript 找不到 `@prisma/client`](#typescript-找不到-prismaclient)
    - [Schema 合併失敗](#schema-合併失敗)
  - [🎯 最佳實踐](#-最佳實踐)
    - [✅ DO（應該做）](#-do應該做)
    - [❌ DON'T（不要做）](#-dont不要做)
  - [💾 備份與還原](#-備份與還原)
    - [快速備份/還原](#快速備份還原)
    - [備份檔案位置](#備份檔案位置)
    - [環境差異](#環境差異)
  - [🔗 技術堆疊](#-技術堆疊)
  - [📚 相關資源](#-相關資源)

---

## 📖 概述

Backend 的內部資料庫層，使用 Prisma ORM 管理 schema、遷移與種子資料。專案採用模組化 schema 設計，提供完整的備份還原機制，支援多環境部署。

---

## 🏗️ 目錄結構

```text
apps/backend/database/
├── prisma/
│   ├── schema.prisma       # 自動產生的完整 schema（請勿直接編輯）
│   ├── schemas/            # Schema 模組化檔案（在此編輯）
│   │   ├── base.prisma     # Generator 和 Datasource 設定
│   │   ├── user.prisma     # 使用者相關 models
│   │   ├── role.prisma     # 角色相關 models
│   │   ├── metric.prisma   # TimescaleDB 時間序列
│   │   └── ...
│   ├── migrations/         # 資料庫遷移檔案
│   ├── seed.ts             # Seed 主腳本
│   └── seeds/              # 環境別 seed 資料
│       ├── base.ts         # 基礎資料（所有環境）
│       ├── development.ts  # 開發環境測試資料
│       └── uat.ts          # 測試環境資料
└── scripts/
    └── merge-schemas.js    # Schema 合併腳本
```

---

## 🚀 快速開始

```bash
# 1. 生成 Prisma Client
cd apps/backend
pnpm db:generate

# 2. 執行 migrations
pnpm prisma migrate deploy

# 3. 載入種子資料
pnpm db:seed

# 4. 開啟 Prisma Studio 查看資料
pnpm db:studio
# 瀏覽器開啟: http://localhost:5555
```

---

## 🛠️ 常用命令

### 從 Backend 目錄執行

```bash
cd apps/backend

# 產生 Prisma Client
pnpm db:generate

# 推送 schema 到資料庫（開發用）
pnpm db:push

# 建立 migration
pnpm db:migrate

# 開啟 Prisma Studio
pnpm db:studio

# 載入種子資料
pnpm db:seed
```

### 使用 CLI（從專案根目錄）

```bash
# 查看 migration 狀態
./scripts/cli.sh db migrate:status

# 建立新的 migration
./scripts/cli.sh db migrate create "add_user_profile"

# 執行 migrations
./scripts/cli.sh db migrate:up

# 重置資料庫
./scripts/cli.sh db reset

# 載入種子資料
./scripts/cli.sh db seed
```

---

## 📐 Schema 結構

### 多檔案架構

為了更好的可維護性，schema 採用模組化設計：

- **編輯位置**: `prisma/schemas/*.prisma`
- **自動合併**: 執行任何 db 命令時會自動合併
- **輸出檔案**: `prisma/schema.prisma`（自動生成，請勿手動編輯）

### 編輯工作流程

1. **編輯 schema 模組**

   ```bash
   vim apps/backend/database/prisma/schemas/user.prisma
   ```

2. **自動合併**（執行任何 db 命令時觸發）

   ```bash
   pnpm db:generate  # 會先合併再生成
   ```

3. **建立 migration**

   ```bash
   pnpm db:migrate
   ```

### Base Schema 配置

`prisma/schemas/base.prisma` 包含核心配置：

```prisma
generator client {
  provider = "prisma-client-js"
  // 不設定 output，使用默認位置
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

**重要**:

- Prisma Client 使用默認生成位置（自動處理 pnpm 的符號鏈接）
- 在 pnpm monorepo 中，實際位置為 `node_modules/.pnpm/@prisma+client@*/node_modules/.prisma/client`
- 不需要手動指定 `output` 路徑，Prisma 會自動處理

---

## 🌱 種子資料

### 環境別載入

Seed 系統根據 `WIND_ENV` 環境變數載入對應資料：

- **base**: 所有環境的基礎資料（roles, permissions）
- **development**: 開發環境測試帳號
- **uat**: 測試環境資料
- **production**: 生產環境（通常只載入 base）

### 執行 Seed

```bash
# 開發環境（預設）
pnpm db:seed

# 指定環境
WIND_ENV=uat pnpm db:seed
```

---

## 🔄 Migration 遷移

### 1. 修改 Schema

編輯 `prisma/schemas/*.prisma` 中的任一檔案。

### 2. 建立 Migration

```bash
# 使用 CLI（推薦）
./scripts/cli.sh db migrate create "add_user_email_verified"

# 或直接使用 pnpm
pnpm db:migrate
```

### 3. 檢查生成的 SQL

Migration 會在 `prisma/migrations/` 生成：

```text
prisma/migrations/
└── 20260201130000_add_user_email_verified/
    └── migration.sql
```

### 4. 執行 Migration

```bash
./scripts/cli.sh db migrate:up
```

---

## ❓ 常見問題

### Q: 為什麼要模組化 schema？

**A**: 單一 schema.prisma 在大型專案中難以維護。模組化後：

- ✅ 每個領域（user, role, metric）獨立檔案
- ✅ 避免 merge conflict
- ✅ 更容易找到相關 models

### Q: Prisma Client 在哪裡？

**A**: 使用默認位置，Prisma 會自動處理 pnpm monorepo 的符號鏈接。

實際生成位置：`node_modules/.pnpm/@prisma+client@*/node_modules/.prisma/client`

使用方式：

```typescript
import { PrismaClient } from '@prisma/client';
```

### Q: 如何在程式碼中使用？

**A**: 透過 `PrismaService`：

```typescript
// apps/backend/src/user/user.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany();
  }
}
```

### Q: 為什麼沒有獨立的 package.json？

**A**: Database 是 backend 的內部模組，不是獨立 package。所有依賴都在 `apps/backend/package.json` 中管理。

---

## 🚨 故障排除

### TypeScript 找不到 `@prisma/client`

**症狀**: 編譯錯誤 `Module '@prisma/client' has no exported member 'PrismaClient'`

**原因**: 在 pnpm monorepo 中，如果手動設定 `generator.output` 路徑可能導致模組解析失敗。

**解決方案**:

1. 確保 `prisma/schemas/base.prisma` 中的 `generator client` **不包含** `output` 設定
2. 重新生成 Prisma Client: `pnpm db:generate`
3. 清除編譯緩存: `rm -rf dist .nest node_modules/.cache`

正確的 generator 設定：

```prisma
generator client {
  provider = "prisma-client-js"
  // 不設定 output，使用默認值
}
```

### Schema 合併失敗

**症狀**: `pnpm db:generate` 時找不到 schema 文件

**解決方案**:

1. 檢查 `apps/backend/package.json` 中的 `prisma.schema` 設定
2. 確認 `database/prisma/schemas/` 目錄存在
3. 確認 `database/scripts/merge-schemas.js` 可執行

---

## 🎯 最佳實踐

### ✅ DO（應該做）

1. **編輯 schemas/ 中的檔案**

   ```bash
   vim database/prisma/schemas/user.prisma
   ```

2. **使用描述性的 migration 名稱**

   ```bash
   ./scripts/cli.sh db migrate create "add_email_verification_to_users"
   ```

3. **在 migration 前先測試 schema 變更**

   ```bash
   pnpm db:push  # 測試 schema
   pnpm db:migrate  # 確認後建立 migration
   ```

### ❌ DON'T（不要做）

1. **不要直接編輯 schema.prisma**
   - ❌ 會在下次合併時被覆蓋

2. **不要手動修改 migration 檔案**
   - ❌ 已執行的 migration 不應修改

3. **不要在生產環境使用 db:push**
   - ❌ 使用 migration 確保可追蹤性

---

## 💾 備份與還原

### 快速備份/還原

使用 Wind CLI 進行資料庫備份與還原：

```bash
# 備份資料庫
./scripts/cli.sh
# 選擇 10 → 1

# 還原資料庫
./scripts/cli.sh
# 選擇 10 → 2

# 列出備份
./scripts/cli.sh
# 選擇 10 → 3

# 清理舊備份
./scripts/cli.sh
# 選擇 10 → 4
```

### 備份檔案位置

```text
backups/
├── development/
│   └── wind_db_development_YYYYMMDD_HHMMSS.sql.gz
├── uat/
│   └── wind_db_uat_YYYYMMDD_HHMMSS.sql.gz
└── production/
    └── wind_db_production_YYYYMMDD_HHMMSS.sql.gz
```

### 環境差異

| 環境           | 備份方式        | 還原方式               | 確認層級 |
| -------------- | --------------- | ---------------------- | -------- |
| Development    | 簡單 pg_dump    | DROP DATABASE 重建     | 1 層     |
| UAT/Production | pg_dump --clean | DROP SCHEMA 保留資料庫 | 4 層     |

---

## 🔗 技術堆疊

- **Prisma ORM**: 6.19.2
- **TimescaleDB**: PostgreSQL 相容的時間序列資料庫
- **PostgreSQL**: 16.x
- **bcrypt**: 密碼雜湊

---

## 📚 相關資源

- [Prisma Schema 組織](./PRISMA_SCHEMA_ORGANIZATION.md)
- [軟刪除實現](./SOFT_DELETE.md)
- [UUID v7 遷移](./UUID_V7_MIGRATION.md)
- [資料庫備份與還原](./BACKUP_RESTORE.md)
- [TimescaleDB 整合](../backend/TIMESCALEDB_INTEGRATION.md)
