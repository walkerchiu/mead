# Prisma Schema 組織結構

本專案使用多檔案結構管理 Prisma schema，提升可維護性。

## 目錄結構

```
prisma/
├── schema.prisma          # ⚠️ 自動產生，請勿編輯
└── schemas/               # ✅ 在這裡編輯
    ├── base.prisma       # 基礎設定
    ├── user.prisma       # 用戶相關
    └── metric.prisma     # 時間序列
```

## 使用方式

### 新增或修改 Model

1. 編輯 `prisma/schemas/` 中的檔案
2. 執行任何 `db:*` 指令會自動合併

```bash
# 所有這些指令都會自動合併 schema
pnpm db:push
pnpm db:generate
pnpm db:migrate

# 或手動合併
pnpm db:merge-schemas
```

### 新增 Schema 檔案

按領域建立新檔案：

```bash
# 建立 post.prisma
vim prisma/schemas/post.prisma
```

```prisma
// Post - 文章
model Post {
  id        String    @id @default(dbgenerated("uuid_generate_v7()")) @db.Uuid
  title     String
  content   String    @db.Text
  authorId  String    @db.Uuid
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")

  author User @relation(fields: [authorId], references: [id])

  @@map("posts")
}
```

## 重要提醒

⚠️ **不要直接編輯 `schema.prisma`** - 會被自動覆蓋  
✅ **編輯 `prisma/schemas/*.prisma`** - 再執行合併

## 檔案說明

- **base.prisma**: Generator 和 Datasource 設定（必須第一個）
- **user.prisma**: User 和 Profile models
- **metric.prisma**: TimescaleDB 時間序列

## 詳細文件

查看完整說明：[Prisma Schema 組織結構文件](../../../../docs/database/PRISMA_SCHEMA_ORGANIZATION.md)
