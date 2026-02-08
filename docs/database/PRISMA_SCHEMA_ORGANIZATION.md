# Prisma Schema 組織結構

模組化的 Prisma schema 管理方案，提升大型專案可維護性與團隊協作效率。

---

## 📋 目錄

- [Prisma Schema 組織結構](#prisma-schema-組織結構)
  - [📋 目錄](#-目錄)
  - [📖 概述](#-概述)
  - [🏗️ 目錄結構](#️-目錄結構)
  - [✨ 為什麼使用多檔案？](#-為什麼使用多檔案)
    - [問題](#問題)
    - [解決方案](#解決方案)
  - [📐 Schema 結構](#-schema-結構)
    - [base.prisma](#baseprisma)
    - [user.prisma](#userprisma)
    - [metric.prisma](#metricprisma)
    - [建立新檔案](#建立新檔案)
  - [📝 使用方式](#-使用方式)
    - [1. 編輯 Schema](#1-編輯-schema)
    - [2. 合併 Schema](#2-合併-schema)
    - [3. 檢視合併結果](#3-檢視合併結果)
  - [📋 工作流程範例](#-工作流程範例)
    - [新增一個 Post Model](#新增一個-post-model)
  - [🔧 合併腳本工作原理](#-合併腳本工作原理)
    - [執行流程](#執行流程)
    - [檔案排序規則](#檔案排序規則)
    - [自訂排序](#自訂排序)
  - [⚙️ 進階配置](#️-進階配置)
    - [監聽模式（開發用）](#監聽模式開發用)
    - [Git 配置](#git-配置)
    - [Pre-commit Hook](#pre-commit-hook)
  - [🎯 最佳實踐](#-最佳實踐)
    - [1. 按領域分離](#1-按領域分離)
    - [2. 保持檔案小而專注](#2-保持檔案小而專注)
    - [3. 加上清楚的註解](#3-加上清楚的註解)
    - [4. 統一命名規範](#4-統一命名規範)
    - [5. 定期檢查合併結果](#5-定期檢查合併結果)
  - [⚠️ 注意事項](#️-注意事項)
    - [不要編輯 schema.prisma](#不要編輯-schemaprisma)
    - [Model 關聯跨檔案](#model-關聯跨檔案)
    - [避免循環依賴](#避免循環依賴)
  - [🚨 故障排除](#-故障排除)
    - [合併失敗](#合併失敗)
    - [Schema 驗證失敗](#schema-驗證失敗)
    - [找不到 Model](#找不到-model)
  - [📚 相關資源](#-相關資源)

---

## 📖 概述

為了更好地管理 Prisma schema，專案採用**多檔案結構**，將不同功能的 model 分離到獨立檔案中。提供自動化合併機制，確保團隊協作時的一致性與效率。

---

## 🏗️ 目錄結構

```text
apps/backend/database/
├── prisma/
│   ├── schema.prisma          # ⚠️ 自動產生，請勿手動編輯
│   ├── schemas/               # ✅ 在這裡編輯 schema
│   │   ├── base.prisma       # 基礎設定（generator, datasource）
│   │   ├── user.prisma       # User 和 Profile models
│   │   └── metric.prisma     # Metric model（時間序列）
│   ├── migrations/           # 資料庫遷移檔案
│   ├── seed.ts              # 種子資料
│   └── seeds/               # 環境別種子資料
└── scripts/
    └── merge-schemas.js     # Schema 合併腳本
```

---

## ✨ 為什麼使用多檔案？

### 問題

- ❌ 單一 `schema.prisma` 檔案隨著專案成長變得龐大難以維護
- ❌ 多人協作時容易產生衝突
- ❌ 不同領域的 model 混在一起難以找到

### 解決方案

- ✅ 按功能或領域分離 schema 檔案
- ✅ 更好的可讀性和可維護性
- ✅ 團隊協作時減少衝突
- ✅ 自動合併，保持 Prisma 相容性

---

## 📐 Schema 結構

### base.prisma

**基礎設定檔**，包含 generator 和 datasource 配置：

```prisma
// Prisma 設定
generator client {
  provider = "prisma-client-js"
  // 不設定 output，使用默認位置（自動處理 pnpm monorepo）
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

⚠️ **必須放在第一位**，因為 Prisma 要求這些配置在最前面。

### user.prisma

**用戶相關 models**：

- `User` - 用戶基本資料
- `Profile` - 用戶詳細資料

### metric.prisma

**時間序列資料**：

- `Metric` - TimescaleDB 時間序列資料

### 建立新檔案

按照以下命名規範建立：

- `{domain}.prisma` - 例如 `post.prisma`, `order.prisma`
- 使用小寫和連字符

---

## 📝 使用方式

### 1. 編輯 Schema

**✅ 正確**：編輯 `prisma/schemas/` 中的檔案

```bash
# 編輯用戶相關 schema
vim packages/database/prisma/schemas/user.prisma

# 新增文章相關 schema
vim packages/database/prisma/schemas/post.prisma
```

**❌ 錯誤**：直接編輯 `schema.prisma`

```bash
# 不要這樣做！這個檔案會被覆蓋
vim packages/database/prisma/schema.prisma
```

### 2. 合併 Schema

編輯完成後，執行合併：

```bash
# 僅合併 schema
cd apps/backend && pnpm db:merge-schemas

# 合併 + 產生 Prisma Client
pnpm db:generate

# 合併 + 推送到資料庫
pnpm db:push

# 合併 + 建立 migration
pnpm db:migrate
```

所有 `db:*` 指令都會**自動執行合併**，無需手動執行 `db:merge-schemas`。

### 3. 檢視合併結果

```bash
cat packages/database/prisma/schema.prisma
```

會看到類似：

```prisma
// This file is auto-generated. DO NOT EDIT manually.
// Edit files in prisma/schemas/ instead and run: pnpm db:merge-schemas
// Generated at: 2026-01-27T10:12:11.803Z

// ============================================
// Source: base.prisma
// ============================================

generator client {
  // ...
}

// ============================================
// Source: metric.prisma
// ============================================

model Metric {
  // ...
}

// ============================================
// Source: user.prisma
// ============================================

model User {
  // ...
}
```

## 📋 工作流程範例

### 新增一個 Post Model

**步驟 1**：建立 schema 檔案

```bash
vim packages/database/prisma/schemas/post.prisma
```

**步驟 2**：定義 model

```prisma
// Post - 文章
model Post {
  id        String    @id @default(dbgenerated("uuid_generate_v7()")) @db.Uuid
  title     String
  content   String    @db.Text
  authorId  String    @db.Uuid
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")
  deletedAt DateTime? @map("deleted_at")

  // 關聯
  author User @relation(fields: [authorId], references: [id], onDelete: Cascade)

  // 索引
  @@index([authorId])
  @@index([deletedAt])
  @@map("posts")
}
```

**步驟 3**：更新 User model（加入關聯）

```prisma
// 編輯 user.prisma
model User {
  // ... 其他欄位

  // 新增關聯
  profile Profile?
  posts   Post[]    // ← 新增這行

  // ...
}
```

**步驟 4**：推送到資料庫

```bash
pnpm db:push
```

腳本會自動：

1. 合併所有 schema 檔案
2. 推送到資料庫
3. 產生 Prisma Client

---

## 🔧 合併腳本工作原理

### 執行流程

```text
1. 讀取 prisma/schemas/*.prisma
2. 排序（base.prisma 必須在最前）
3. 合併內容 + 加上來源註解
4. 寫入 prisma/schema.prisma
```

### 檔案排序規則

1. **base.prisma** 永遠在第一位
2. 其他檔案按字母順序排列

### 自訂排序

如果需要特定順序，可以使用數字前綴：

```text
schemas/
├── 00-base.prisma
├── 10-user.prisma
├── 20-post.prisma
├── 30-comment.prisma
└── 99-metric.prisma
```

---

## ⚙️ 進階配置

### 監聽模式（開發用）

如果需要自動監聽 schemas 目錄變更：

```bash
# 安裝 nodemon（如果還沒安裝）
pnpm add -D nodemon

# 在 package.json 新增
"scripts": {
  "db:watch": "nodemon --watch prisma/schemas --ext prisma --exec 'pnpm db:merge-schemas && prisma format'"
}

# 執行
cd apps/backend && pnpm db:watch
```

### Git 配置

將自動產生的 `schema.prisma` 加入版控，以便追蹤變更：

```bash
# .gitignore 中不要排除 schema.prisma
# git add packages/database/prisma/schema.prisma
```

這樣團隊成員可以看到完整的 schema 差異。

### Pre-commit Hook

確保提交前 schema 已合併：

```bash
# .husky/pre-commit
#!/bin/sh
cd packages/database && pnpm db:merge-schemas
git add prisma/schema.prisma
```

---

## 🎯 最佳實踐

### 1. 按領域分離

```text
schemas/
├── user.prisma      # 用戶相關
├── post.prisma      # 文章相關
├── comment.prisma   # 評論相關
├── order.prisma     # 訂單相關
└── product.prisma   # 商品相關
```

### 2. 保持檔案小而專注

- 每個檔案 < 200 行
- 相關的 model 放在一起（如 User + Profile）
- 不要把所有 model 都放在同一個檔案

### 3. 加上清楚的註解

```prisma
// User - 用戶基本資料
// 包含認證資訊和基本個人資料
model User {
  // ...
}

// Profile - 用戶詳細資料
// 與 User 一對一關聯，包含擴展資訊
model Profile {
  // ...
}
```

### 4. 統一命名規範

- Model 名稱：PascalCase
- 欄位名稱：camelCase
- 資料庫表名：snake_case
- 檔案名稱：kebab-case

### 5. 定期檢查合併結果

```bash
# 檢查合併後的 schema 是否正確
cd apps/backend && pnpm exec prisma validate
cd apps/backend && pnpm exec prisma format
```

---

## ⚠️ 注意事項

### 不要編輯 schema.prisma

❌ **錯誤示範**：

```bash
vim prisma/schema.prisma  # 不要這樣做！
```

檔案開頭有警告：

```prisma
// This file is auto-generated. DO NOT EDIT manually.
// Edit files in prisma/schemas/ instead
```

所有修改會在下次合併時被覆蓋。

### Model 關聯跨檔案

如果 model 跨檔案關聯，確保兩邊都有定義：

**user.prisma**

```prisma
model User {
  posts Post[]  // ← 關聯到 Post
}
```

**post.prisma**

```prisma
model Post {
  author User @relation(fields: [authorId], references: [id])  // ← 關聯到 User
}
```

### 避免循環依賴

Prisma 會自動處理關聯，但要注意邏輯上的循環依賴。

---

## 🚨 故障排除

### 合併失敗

```bash
❌ 合併失敗: ENOENT: no such file or directory
```

**解決**：確保 `prisma/schemas/` 目錄存在且包含至少 `base.prisma`。

### Schema 驗證失敗

```bash
❌ Error validating: The relation field `author` on Model `Post` is missing an opposite relation field
```

**解決**：確保雙向關聯都有定義。

### 找不到 Model

```bash
❌ Unknown type "User"
```

**解決**：

1. 確認 User model 定義在某個 schema 檔案中
2. 執行 `pnpm db:merge-schemas`
3. 檢查 `schema.prisma` 是否包含 User model

---

## 📚 相關資源

- [Database Layer](./DATABASE_LAYER.md)
- [軟刪除實現](./SOFT_DELETE.md)
- [UUID v7 遷移](./UUID_V7_MIGRATION.md)
- [Prisma Schema 文件](https://www.prisma.io/docs/concepts/components/prisma-schema)
- [Prisma Relations 文件](https://www.prisma.io/docs/concepts/components/prisma-schema/relations)
