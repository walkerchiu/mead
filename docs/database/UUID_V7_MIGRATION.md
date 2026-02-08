# UUID v7 遷移文件

從 UUID v4 遷移至 UUID v7，提升資料庫索引效能與時間排序能力。

---

## 📋 目錄

- [UUID v7 遷移文件](#uuid-v7-遷移文件)
  - [📋 目錄](#-目錄)
  - [📖 概述](#-概述)
  - [✨ 為什麼使用 UUID v7？](#-為什麼使用-uuid-v7)
    - [UUID v7 的優勢](#uuid-v7-的優勢)
    - [與 UUID v4 的比較](#與-uuid-v4-的比較)
  - [📐 UUID v7 格式](#-uuid-v7-格式)
  - [🔧 實施細節](#-實施細節)
    - [1. PostgreSQL 函數](#1-postgresql-函數)
    - [2. Prisma Schema 更新](#2-prisma-schema-更新)
    - [3. NestJS Request ID](#3-nestjs-request-id)
  - [🔄 Migration 遷移](#-migration-遷移)
    - [已完成的步驟](#已完成的步驟)
    - [執行的命令](#執行的命令)
  - [📝 使用範例](#-使用範例)
    - [TypeScript/NestJS 中生成 UUID v7](#typescriptnestjs-中生成-uuid-v7)
    - [PostgreSQL 中生成 UUID v7](#postgresql-中生成-uuid-v7)
    - [GraphQL 查詢中的 Request ID](#graphql-查詢中的-request-id)
  - [🧪 測試驗證](#-測試驗證)
    - [檢查 UUID v7 格式](#檢查-uuid-v7-格式)
    - [測試排序性](#測試排序性)
  - [⚠️ 注意事項](#️-注意事項)
    - [相容性](#相容性)
    - [效能影響](#效能影響)
    - [安全性](#安全性)
  - [🎯 最佳實踐](#-最佳實踐)
  - [📚 相關資源](#-相關資源)

---

## 📖 概述

本專案已從 UUID v4 遷移至 UUID v7，以獲得更好的效能和可排序性。包含時間戳資訊的 UUID v7 提供自然排序能力，大幅改善資料庫索引效能。

---

## ✨ 為什麼使用 UUID v7？

### UUID v7 的優勢

1. **時間排序性**: UUID v7 包含時間戳資訊，可以按生成時間自然排序
2. **資料庫效能**: 更好的 B-tree 索引效能，減少索引碎片
3. **查詢效率**: 範圍查詢更快速
4. **向下相容**: 完全符合 RFC 4122，與 UUID v4 相容
5. **分散式友好**: 適合分散式系統中的唯一 ID 生成

### 與 UUID v4 的比較

| 特性     | UUID v4         | UUID v7       |
| -------- | --------------- | ------------- |
| 隨機性   | 完全隨機        | 時間戳 + 隨機 |
| 排序性   | ❌ 無序         | ✅ 按時間排序 |
| 索引效能 | ⚠️ 較差（碎片） | ✅ 優秀       |
| 查詢效率 | ⚠️ 一般         | ✅ 快速       |
| 生成速度 | ✅ 快           | ✅ 快         |

---

## 📐 UUID v7 格式

```text
019bfed6-edc7-7381-9c32-e8b66ab013e6
└─────┬──────┘ │  │ └────┬────────┘
  時間戳(ms)  ver  random
```

- **前 48 位**: Unix 時間戳（毫秒）
- **第 49-52 位**: 版本號（7）
- **後 74 位**: 隨機數

---

## 🔧 實施細節

### 1. PostgreSQL 函數

建立了 `uuid_generate_v7()` 函數來產生 UUID v7：

```sql
CREATE OR REPLACE FUNCTION uuid_generate_v7()
RETURNS UUID
AS $$
DECLARE
  unix_ts_ms BIGINT;
  uuid_bytes BYTEA;
BEGIN
  unix_ts_ms = (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT;
  uuid_bytes = E'\\x' ||
               LPAD(TO_HEX(unix_ts_ms), 12, '0') ||
               LPAD(TO_HEX((RANDOM() * 65535)::INT), 4, '0') ||
               '7' ||
               LPAD(TO_HEX((RANDOM() * 4095)::INT), 3, '0') ||
               LPAD(TO_HEX((RANDOM() * 1099511627775)::BIGINT), 12, '0');
  RETURN uuid_bytes::UUID;
END;
$$ LANGUAGE plpgsql VOLATILE;
```

### 2. Prisma Schema 更新

所有使用 UUID 的欄位已更新為使用 UUID v7：

```prisma
model User {
  id        String   @id @default(dbgenerated("uuid_generate_v7()")) @db.Uuid
  // ...
}
```

### 3. NestJS Request ID

Request ID Interceptor 已更新使用 `uuidv7` 套件：

```typescript
import { uuidv7 } from 'uuidv7';

// 在 request-id.interceptor.ts 中
const requestId = req.headers['x-request-id'] || uuidv7();
```

---

## 🔄 Migration 遷移

### 已完成的步驟

- [x] 安裝 `uuidv7` 套件
- [x] 移除 `uuid` 和 `@types/uuid` 套件
- [x] 建立 PostgreSQL UUID v7 函數
- [x] 更新 Prisma schema
- [x] 執行資料庫 migration
- [x] 更新 Request ID interceptor
- [x] 測試驗證

### 執行的命令

```bash
# 1. 安裝 UUID v7 套件
pnpm --filter @npt/backend add uuidv7
pnpm --filter @npt/backend remove uuid @types/uuid

# 2. 套用資料庫 migration
# 使用動態容器名稱
PG_CONTAINER=$(grep POSTGRES_CONTAINER_NAME .env.docker | cut -d'=' -f2)
docker exec -i "$PG_CONTAINER" psql -U postgres -d npt_db < \
  packages/database/prisma/migrations/enable_uuid_v7.sql

# 3. 推送 schema 變更
pnpm db:push

# 4. 重建 API
pnpm --filter @npt/backend build
```

---

## 📝 使用範例

### TypeScript/NestJS 中生成 UUID v7

```typescript
import { uuidv7 } from 'uuidv7';

// 生成新的 UUID v7
const id = uuidv7();
console.log(id); // 019bfed6-edc7-7381-9c32-e8b66ab013e6
```

### PostgreSQL 中生成 UUID v7

```sql
-- 插入新記錄時自動生成
INSERT INTO users (name, email) VALUES ('John Doe', 'john@example.com');

-- 手動生成
SELECT uuid_generate_v7();
```

### GraphQL 查詢中的 Request ID

每個 GraphQL 請求都會自動獲得一個 UUID v7 格式的 Request ID：

```graphql
query {
  hello {
    success
    message
    data {
      content
    }
    requestId # UUID v7 格式
  }
}
```

回應範例：

```json
{
  "data": {
    "hello": {
      "success": true,
      "message": "查詢成功",
      "data": {
        "content": "Hello from GraphQL!"
      },
      "requestId": "019bfed6-edc7-7381-9c32-e8b66ab013e6"
    }
  }
}
```

---

## 🧪 測試驗證

### 檢查 UUID v7 格式

UUID v7 的特徵：

- 格式: `xxxxxxxx-xxxx-7xxx-xxxx-xxxxxxxxxxxx`
- 第 13 個字元必須是 `7`（版本號）
- 前 8 個字元隨時間遞增

### 測試排序性

```sql
-- 建立測試資料
CREATE TABLE test_uuids (
  id UUID DEFAULT uuid_generate_v7(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 插入多筆資料
INSERT INTO test_uuids DEFAULT VALUES;
INSERT INTO test_uuids DEFAULT VALUES;
INSERT INTO test_uuids DEFAULT VALUES;

-- 驗證 ID 按時間排序
SELECT id, created_at FROM test_uuids ORDER BY id;
-- 結果應該與 created_at 的順序一致
```

---

## ⚠️ 注意事項

### 相容性

- ✅ 與 UUID v4 相容（都是 128 位元）
- ✅ 可以在同一欄位混合使用（不建議）
- ✅ 所有支援 UUID 的資料庫都可以儲存

### 效能影響

- ✅ 新記錄插入更快（更好的索引效能）
- ✅ 範圍查詢更快
- ✅ 索引碎片更少
- ⚠️ 舊資料仍使用 UUID v4（如有）

### 安全性

- ✅ 包含時間戳不會洩露敏感資訊
- ✅ 仍包含足夠的隨機性（74 位元）
- ✅ 不可預測（隨機部分）

---

## 🎯 最佳實踐

1. **新專案**: 直接使用 UUID v7
2. **舊專案遷移**:
   - 新資料使用 UUID v7
   - 舊資料保持不變（無需遷移）
   - 混合使用不影響功能
3. **索引優化**: 在 UUID v7 欄位上建立 B-tree 索引效能更好
4. **日誌追蹤**: Request ID 使用 UUID v7 便於按時間追蹤

---

## 📚 相關資源

- [Database Layer](./DATABASE_LAYER.md)
- [Prisma Schema 組織](./PRISMA_SCHEMA_ORGANIZATION.md)
- [軟刪除實現](./SOFT_DELETE.md)

- [UUID v7 RFC Draft](https://datatracker.ietf.org/doc/draft-ietf-uuidrev-rfc4122bis/)
- [uuidv7 npm 套件](https://www.npmjs.com/package/uuidv7)
- [PostgreSQL UUID Functions](https://www.postgresql.org/docs/current/datatype-uuid.html)
