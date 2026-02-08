# 稽核日誌系統 (Audit Log System)

自動記錄所有操作，提供完整的請求追蹤和效能分析功能。

---

## 📋 目錄

- [稽核日誌系統 (Audit Log System)](#稽核日誌系統-audit-log-system)
  - [📋 目錄](#-目錄)
  - [📖 概述](#-概述)
    - [核心特性](#核心特性)
    - [技術架構](#技術架構)
  - [📊 記錄內容](#-記錄內容)
    - [資料庫結構](#資料庫結構)
    - [記錄範例](#記錄範例)
  - [🏗️ 架構設計](#️-架構設計)
    - [流程圖](#流程圖)
    - [關鍵組件](#關鍵組件)
      - [1. AuditLogInterceptor（攔截器）](#1-auditloginterceptor攔截器)
      - [2. AuditLogService（服務層）](#2-auditlogservice服務層)
      - [3. AuditLogConsumer（消費者）](#3-auditlogconsumer消費者)
    - [RabbitMQ 配置](#rabbitmq-配置)
    - [批次處理機制](#批次處理機制)
    - [錯誤處理與重試](#錯誤處理與重試)
  - [⚡ 性能優化](#-性能優化)
    - [TimescaleDB 優化](#timescaledb-優化)
    - [查詢優化](#查詢優化)
    - [快取策略](#快取策略)
  - [📈 效能監控](#-效能監控)
    - [查詢最近的請求耗時](#查詢最近的請求耗時)
    - [分析平均效能](#分析平均效能)
    - [找出慢查詢](#找出慢查詢)
    - [分析失敗率](#分析失敗率)
    - [監控批次處理](#監控批次處理)
  - [🔍 GraphQL 查詢](#-graphql-查詢)
    - [查詢稽核日誌（分頁）](#查詢稽核日誌分頁)
    - [依 Request ID 查詢](#依-request-id-查詢)
    - [依用戶查詢](#依用戶查詢)
    - [統計分析](#統計分析)
  - [🔒 安全性](#-安全性)
    - [敏感資料過濾](#敏感資料過濾)
    - [權限控制](#權限控制)
  - [📊 Console Log 解析](#-console-log-解析)
    - [Frontend 耗時（Next.js SSR）](#frontend-耗時nextjs-ssr)
    - [Backend 耗時（批次處理）](#backend-耗時批次處理)
    - [實際請求耗時](#實際請求耗時)
  - [🛠️ 維護操作](#️-維護操作)
    - [清理舊日誌](#清理舊日誌)
    - [手動觸發批次處理](#手動觸發批次處理)
    - [清除快取](#清除快取)
    - [效能監控](#效能監控)
  - [📝 最佳實踐](#-最佳實踐)
    - [1. 定期清理舊日誌](#1-定期清理舊日誌)
    - [2. 監控批次處理效能](#2-監控批次處理效能)
    - [3. 分析慢查詢](#3-分析慢查詢)
    - [4. 安全審計](#4-安全審計)
    - [5. 異常檢測](#5-異常檢測)
    - [6. 容量規劃](#6-容量規劃)
  - [📚 相關文檔](#-相關文檔)

---

## 📖 概述

稽核日誌系統自動記錄所有 HTTP 和 GraphQL 請求，提供完整的審計追蹤、效能監控和安全分析功能。

### 核心特性

- ✅ **自動記錄**：透過 Interceptor 自動擷取所有請求
- ✅ **效能追蹤**：記錄每個請求的處理耗時（毫秒級）
- ✅ **非阻塞設計**：透過 RabbitMQ 佇列異步處理，不影響主業務邏輯
- ✅ **批次寫入**：累積 100 筆或每 5 秒批次寫入，提升資料庫效能
- ✅ **智能提取**：自動識別 userId、entityId、action、entity
- ✅ **敏感資料過濾**：自動移除密碼、Token 等敏感資訊
- ✅ **快取優化**：查詢結果快取 5 分鐘，減少資料庫負載

### 技術架構

**核心技術**:

- **NestJS Interceptor**: 全局請求攔截
- **RabbitMQ**: 非阻塞訊息佇列（持久化）
- **TimescaleDB**: 時間序列資料庫（PostgreSQL 擴展）
- **Dragonfly**: 高性能快取（Redis 兼容）

**資料流向**:

```
HTTP/GraphQL Request
  → Interceptor (記錄開始時間)
    → Business Logic (處理請求)
      → Interceptor (計算耗時)
        → RabbitMQ Queue (非阻塞發送)
          → Consumer (批次緩衝)
            → TimescaleDB (批次寫入)
```

---

## 📊 記錄內容

### 資料庫結構

```prisma
model AuditLog {
  id          String   @id @default(dbgenerated("uuid_generate_v7()"))
  requestId   String   // 請求追蹤 ID（關聯同一請求的多筆日誌）
  userId      String?  // 執行操作的用戶 ID
  action      String   // 操作類型（CREATE_USER, UPDATE_POST 等）
  entity      String   // 實體類型（User, Post, Comment 等）
  entityId    String?  // 被操作的實體 ID
  status      String   // 操作狀態（SUCCESS, FAILURE）
  method      String?  // HTTP 方法或 GraphQL 類型
  path        String?  // 請求路徑或 GraphQL operation 名稱
  ipAddress   String?  // 請求來源 IP
  userAgent   String?  // 用戶代理字串
  details     Json?    // 詳細資訊（請求參數、回應、錯誤）
  duration    Int?     // 請求處理耗時（毫秒）
  timestamp   DateTime @default(now())
}
```

### 記錄範例

**成功的登入請求：**

```json
{
  "id": "019c1909-0d52-1d45-75e0-00830208093e",
  "requestId": "019c1909-0d52-1d45-75e0-008302080000",
  "userId": "019c18de-8a1f-c123-7a3b-00b9f8c3d4e5",
  "action": "MUTATION_LOGIN",
  "entity": "login",
  "status": "SUCCESS",
  "method": "GraphQL",
  "path": "/graphql/login",
  "ipAddress": "127.0.0.1",
  "userAgent": "Mozilla/5.0...",
  "details": {
    "request": {
      "args": { "email": "public@example.com", "password": "[REDACTED]" }
    },
    "response": {
      "accessToken": "[REDACTED]",
      "user": { "id": "...", "email": "public@example.com" }
    }
  },
  "duration": 99,
  "timestamp": "2026-02-01T11:49:09.584Z"
}
```

**失敗的請求：**

```json
{
  "id": "019c1908-f0b9-74c8-b66b-ccdef389f727",
  "requestId": "019c1908-f0b9-74c8-b66b-000000000000",
  "userId": null,
  "action": "QUERY_USER",
  "entity": "user",
  "status": "FAILURE",
  "method": "GraphQL",
  "path": "/graphql/user",
  "ipAddress": "127.0.0.1",
  "details": {
    "request": { "args": { "id": "invalid-id" } },
    "error": {
      "message": "Unauthorized",
      "code": 401
    }
  },
  "duration": 15,
  "timestamp": "2026-02-01T11:49:02.345Z"
}
```

#### `details.requestIdMissing` 標記

當 `RequestContextMiddleware` 因故未生效（race / hot-reload 等罕見場景），`AuditLogInterceptor` 會 **fallback** 用 `uuidv7()` 生成新 `requestId`，但在 `details` 內標記 `requestIdMissing: true`，便於事後 query 監控：

```json
"details": {
  "request": {...},
  "response": {...},
  "requestIdMissing": true
}
```

```sql
-- 監控 middleware 是否有 gap
SELECT path, method, COUNT(*)
FROM audit_logs
WHERE details->>'requestIdMissing' = 'true'
  AND created_at >= NOW() - INTERVAL '1 day'
GROUP BY path, method
ORDER BY COUNT(*) DESC;
```

詳見 [REQUEST_ID_SYSTEM.md](./REQUEST_ID_SYSTEM.md#-異常與-fallback)。

---

## 🏗️ 架構設計

### 流程圖

```text
┌─────────────┐
│   Client    │
│  Request    │
└──────┬──────┘
       │
       ▼
┌───────────────────────────────┐
│   AuditLogInterceptor         │
│   - 記錄開始時間                │
│   - 提取請求資訊                │
│   - 計算處理耗時                │
└──────┬──────────────────┬─────┘
       │ Success          │ Failure
       ▼                  ▼
┌───────────────────────────────┐
│   AuditLogService             │
│   - 發送到 RabbitMQ 佇列        │
│   - 降級方案：直接寫入 DB        │
└──────┬────────────────────────┘
       │
       ▼
┌───────────────────────────────┐
│   RabbitMQ Queue              │
│   - 非阻塞傳輸                  │
│   - 訊息持久化                  │
└──────┬────────────────────────┘
       │
       ▼
┌───────────────────────────────┐
│   AuditLogConsumer            │
│   - 批次緩衝（100筆 or 5秒）    │
│   - 批次寫入資料庫              │
│   - 失敗重試機制                │
└──────┬────────────────────────┘
       │
       ▼
┌───────────────────────────────┐
│   PostgreSQL (TimescaleDB)    │
│   - audit_logs 表             │
│   - 時間序列優化                │
└───────────────────────────────┘
```

### 關鍵組件

#### 1. AuditLogInterceptor（攔截器）

**位置**: `apps/backend/src/audit-log/audit-log.interceptor.ts`

**職責**:

- 自動攔截所有 HTTP 和 GraphQL 請求
- 計算請求處理耗時（`startTime` → `endTime`）
- 智能提取 userId、entityId、action、entity
- 清理敏感資料（密碼、Token 等）

**智能提取規則**:

```typescript
// userId 提取順序
context.user?.id → context.currentUser?.id → response.data?.userId

// entityId 提取順序
response.data?.id → response.data?.[entity]?.id → deep search

// action 推斷
createUser → CREATE_USER
getUsers   → READ_USER
updatePost → UPDATE_POST
deleteComment → DELETE_COMMENT
```

#### 2. AuditLogService（服務層）

**位置**: `apps/backend/src/audit-log/audit-log.service.ts`

**職責**:

- 發送日誌到 RabbitMQ 佇列（非阻塞）
- 提供降級方案（佇列失敗時直接寫入資料庫）
- 查詢日誌（帶快取）
- 統計分析
- 清理舊日誌

#### 3. AuditLogConsumer（消費者）

**位置**: `apps/backend/src/audit-log/audit-log.consumer.ts`

**職責**:

- 監聽 `audit_log.create` 事件
- 批次處理：累積 100 筆或每 5 秒寫入
- 失敗重試：批次失敗時逐筆重試
- 優雅關閉：處理剩餘批次

**批次處理邏輯**:

```typescript
BATCH_SIZE = 100; // 累積 100 筆立即寫入
BATCH_INTERVAL_MS = 5000; // 或每 5 秒寫入一次
```

### RabbitMQ 配置

**Exchange 和 Queue 設定**:

```typescript
// Exchange 配置
{
  name: 'audit_log.exchange',
  type: 'topic',
  durable: true,  // 持久化 Exchange
}

// Queue 配置
{
  name: 'audit_log.create',
  durable: true,  // 持久化 Queue（伺服器重啟後保留訊息）
  arguments: {
    'x-message-ttl': 86400000,  // 訊息 TTL：24 小時
    'x-max-length': 100000,      // 最大訊息數：10 萬筆
  }
}

// Binding
{
  exchange: 'audit_log.exchange',
  routingKey: 'audit_log.create',
  queue: 'audit_log.create',
}
```

**訊息持久化策略**:

- ✅ **Exchange 持久化**: 伺服器重啟後 Exchange 不會消失
- ✅ **Queue 持久化**: 訊息保存到磁碟，重啟後恢復
- ✅ **Message TTL**: 訊息 24 小時後自動過期（防止積壓）
- ✅ **Max Length**: 最多保留 10 萬筆訊息（防止記憶體溢出）

### 批次處理機制

**觸發條件（滿足任一）**:

1. **數量觸發**: 累積 100 筆日誌
2. **時間觸發**: 每 5 秒執行一次
3. **優雅關閉**: 服務停止時處理剩餘批次

**處理流程**:

```typescript
processBatch() {
  if (buffer.length === 0) return;

  try {
    // 批次寫入資料庫
    await prisma.auditLog.createMany({
      data: buffer,
      skipDuplicates: true,  // 防止重複寫入
    });
    logger.log(`批次處理完成，共 ${buffer.length} 筆`);
  } catch (error) {
    // 批次失敗時，逐筆重試
    logger.error('批次處理失敗，開始逐筆重試');
    for (const log of buffer) {
      try {
        await prisma.auditLog.create({ data: log });
      } catch (err) {
        logger.error(`單筆寫入失敗: ${log.id}`);
      }
    }
  } finally {
    buffer = [];  // 清空緩衝區
  }
}
```

**性能指標**:

- ✅ **批次大小**: 100 筆 / 批
- ✅ **批次頻率**: 5 秒 / 次（低流量時）
- ✅ **預期耗時**: < 50ms / 批（100 筆）
- ✅ **資料庫負載**: 降低 95%（相比逐筆寫入）

### 錯誤處理與重試

**三層降級機制**:

1. **正常流程**: RabbitMQ → Consumer → Batch Write
2. **佇列失敗**: Direct Write to DB（繞過 RabbitMQ）
3. **批次失敗**: Individual Retry（逐筆重試）

**降級邏輯**:

```typescript
// 1. 嘗試發送到 RabbitMQ
try {
  await this.amqpConnection.publish(
    'audit_log.exchange',
    'audit_log.create',
    logData,
    { persistent: true }, // 訊息持久化
  );
} catch (error) {
  // 2. 佇列失敗時，直接寫入資料庫
  logger.warn('RabbitMQ 發送失敗，降級為直接寫入');
  try {
    await this.prisma.auditLog.create({ data: logData });
  } catch (dbError) {
    // 3. 資料庫也失敗時，記錄到檔案系統
    logger.error('資料庫寫入失敗，記錄到檔案');
    fs.appendFileSync(
      '/var/log/audit_log_failed.json',
      JSON.stringify(logData),
    );
  }
}
```

**重試策略**:

- ✅ **批次重試**: 批次失敗時逐筆重試
- ✅ **降級寫入**: RabbitMQ 失敗時直接寫 DB
- ✅ **檔案備份**: 完全失敗時記錄到檔案
- ✅ **不影響業務**: 所有失敗都不會阻塞主請求

---

## ⚡ 性能優化

### TimescaleDB 優化

**Hypertable 設定**:

```sql
-- 將 audit_logs 轉換為 Hypertable（時間序列優化）
SELECT create_hypertable('audit_logs', 'timestamp');

-- 設定自動壓縮（14 天後壓縮舊資料）
ALTER TABLE audit_logs SET (
  timescaledb.compress,
  timescaledb.compress_segmentby = 'user_id,action,entity'
);

SELECT add_compression_policy('audit_logs', INTERVAL '14 days');
```

**資料保留政策**:

```sql
-- 自動刪除 90 天前的資料
SELECT add_retention_policy('audit_logs', INTERVAL '90 days');
```

**索引優化**:

```sql
-- 時間範圍查詢索引
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);

-- 用戶查詢索引
CREATE INDEX idx_audit_logs_user_timestamp ON audit_logs(user_id, timestamp DESC);

-- 請求追蹤索引
CREATE INDEX idx_audit_logs_request_id ON audit_logs(request_id);

-- 操作類型索引
CREATE INDEX idx_audit_logs_action_entity ON audit_logs(action, entity, timestamp DESC);

-- 失敗查詢索引
CREATE INDEX idx_audit_logs_status_timestamp ON audit_logs(status, timestamp DESC)
WHERE status = 'FAILURE';
```

### 查詢優化

**分頁查詢（Offset-based Pagination）**:

專案使用傳統的 Offset 分頁（page + limit）:

```typescript
// PaginationInput 定義
interface PaginationInput {
  page: number; // 頁碼（從 1 開始）
  limit: number; // 每頁筆數（最大 100）
}

// 查詢實作
const skip = (pagination.page - 1) * pagination.limit;
const take = pagination.limit;

const [data, total] = await Promise.all([
  prisma.auditLog.findMany({
    skip,
    take,
    where: filters,
    orderBy: { timestamp: 'desc' },
  }),
  prisma.auditLog.count({ where: filters }),
]);

// 回傳分頁資訊
return {
  data,
  pageInfo: {
    currentPage: pagination.page,
    totalPages: Math.ceil(total / pagination.limit),
    totalCount: total,
    limit: pagination.limit,
    hasNextPage: pagination.page < Math.ceil(total / pagination.limit),
    hasPreviousPage: pagination.page > 1,
  },
};
```

**優化建議**:

```typescript
// ✅ 限制最大頁碼（避免深度分頁）
const MAX_PAGE = 100; // 最多 100 頁
if (pagination.page > MAX_PAGE) {
  throw new Error(`頁碼不可超過 ${MAX_PAGE}`);
}

// ✅ 限制最大 limit
const MAX_LIMIT = 100;
if (pagination.limit > MAX_LIMIT) {
  pagination.limit = MAX_LIMIT;
}

// ✅ 使用索引優化（降序查詢最新資料）
orderBy: {
  timestamp: 'desc';
} // 利用 idx_audit_logs_timestamp 索引
```

**時間範圍過濾**:

```typescript
// ✅ 始終添加時間範圍過濾（利用 TimescaleDB Hypertable）
const logs = await prisma.auditLog.findMany({
  where: {
    timestamp: {
      gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 最近 7 天
    },
    userId,
  },
  orderBy: { timestamp: 'desc' },
});
```

**深度分頁問題**:

Offset 分頁在大偏移量時效能較差，建議：

1. **限制最大頁數**: 設定 MAX_PAGE = 100（前端隱藏後面的頁碼）
2. **引導使用篩選**: 提供時間範圍、用戶、操作類型等篩選條件
3. **考慮時間範圍**: 預設只顯示最近 7 天或 30 天的資料

### 快取策略

**查詢快取配置**:

```typescript
// 快取鍵格式
CACHE_KEY = `audit_logs:${filters.userId}:${filters.action}:${limit}`;

// 快取時間
CACHE_TTL = 300; // 5 分鐘

// 快取邏輯
const cacheKey = this.buildCacheKey(filters);
const cached = await this.cacheManager.get(cacheKey);

if (cached) return cached;

const data = await this.prisma.auditLog.findMany({ where: filters });
await this.cacheManager.set(cacheKey, data, CACHE_TTL);
return data;
```

**快取失效策略**:

- ✅ **時間失效**: 5 分鐘自動過期
- ✅ **手動失效**: 批次寫入後清除相關快取
- ✅ **最大記憶體**: 限制快取大小（Dragonfly 配置）

---

## 📈 效能監控

### 查詢最近的請求耗時

```sql
SELECT
  id,
  action,
  entity,
  status,
  duration,
  path,
  timestamp
FROM audit_logs
ORDER BY timestamp DESC
LIMIT 10;
```

### 分析平均效能

```sql
SELECT
  action,
  entity,
  AVG(duration)::int as avg_ms,
  MAX(duration) as max_ms,
  MIN(duration) as min_ms,
  COUNT(*) as count
FROM audit_logs
WHERE timestamp > NOW() - INTERVAL '24 hours'
GROUP BY action, entity
ORDER BY avg_ms DESC
LIMIT 10;
```

**範例輸出**:

```text
action                 | entity         | avg_ms | max_ms | min_ms | count
-----------------------+----------------+--------+--------+--------+-------
MUTATION_LOGIN         | login          |     88 |    143 |      3 |    17
QUERY_USERSPAGINATED   | usersPaginated |     10 |     32 |      2 |     7
QUERY_USER             | user           |      5 |      9 |      2 |     5
```

### 找出慢查詢

```sql
SELECT
  action,
  entity,
  duration,
  path,
  timestamp,
  details->>'request' as request
FROM audit_logs
WHERE duration > 100  -- 超過 100ms 的請求
  AND timestamp > NOW() - INTERVAL '1 hour'
ORDER BY duration DESC
LIMIT 20;
```

### 分析失敗率

```sql
SELECT
  action,
  COUNT(*) FILTER (WHERE status = 'SUCCESS') as success_count,
  COUNT(*) FILTER (WHERE status = 'FAILURE') as failure_count,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE status = 'SUCCESS') / COUNT(*),
    2
  ) as success_rate
FROM audit_logs
WHERE timestamp > NOW() - INTERVAL '24 hours'
GROUP BY action
HAVING COUNT(*) > 10  -- 至少 10 次請求
ORDER BY success_rate ASC;
```

### 監控批次處理

**批次處理效能查詢**:

```sql
-- 查看最近的批次處理記錄（從應用日誌）
-- 在實際應用中，建議將批次處理資訊也記錄到資料庫

-- 間接監控：查看寫入速率
SELECT
  date_trunc('minute', timestamp) as minute,
  COUNT(*) as logs_per_minute
FROM audit_logs
WHERE timestamp > NOW() - INTERVAL '1 hour'
GROUP BY minute
ORDER BY minute DESC;
```

**批次大小分布**:

```text
-- 理想分布：
- 100 筆/批：高流量時期（正常）
- < 100 筆/批：低流量時期（5 秒觸發）
- 大量小批次：可能批次間隔太短，考慮調整
```

**異常檢測**:

```typescript
// 監控批次處理耗時
const BATCH_WARNING_THRESHOLD = 100; // ms
const BATCH_ERROR_THRESHOLD = 500; // ms

if (batchDuration > BATCH_ERROR_THRESHOLD) {
  logger.error(`批次處理異常緩慢: ${batchDuration}ms，批次大小: ${batchSize}`);
  // 觸發告警
} else if (batchDuration > BATCH_WARNING_THRESHOLD) {
  logger.warn(`批次處理較慢: ${batchDuration}ms，批次大小: ${batchSize}`);
}
```

---

## 🔍 GraphQL 查詢

### 查詢稽核日誌（分頁）

```graphql
query AuditLogsPaginated(
  $pagination: PaginationInput!
  $userSearch: String
  $action: String
  $entity: String
  $status: String
) {
  auditLogsPaginated(
    pagination: $pagination
    userSearch: $userSearch
    action: $action
    entity: $entity
    status: $status
  ) {
    data {
      id
      requestId
      userId
      userName
      userEmail
      action
      entity
      entityId
      status
      method
      path
      ipAddress
      userAgent
      timestamp
      duration
    }
    pageInfo {
      currentPage
      totalPages
      totalCount
      limit
      hasNextPage
      hasPreviousPage
    }
  }
}
```

**查詢變數範例**:

```json
{
  "pagination": {
    "page": 1,
    "limit": 20
  },
  "userSearch": "public@example.com",
  "action": "MUTATION_LOGIN",
  "status": "SUCCESS"
}
```

### 依 Request ID 查詢

```graphql
query GetAuditLogsByRequestId {
  auditLogsByRequestId(requestId: "019c1909-0d52-1d45-75e0-008302080000") {
    id
    action
    entity
    status
    duration
    timestamp
  }
}
```

### 依用戶查詢

```graphql
query GetUserAuditLogs {
  auditLogsByUser(userId: "019c18de-8a1f-c123-7a3b-00b9f8c3d4e5", limit: 100) {
    id
    action
    entity
    status
    duration
    timestamp
  }
}
```

### 統計分析

```graphql
query GetAuditStatistics {
  auditLogStatistics(
    startDate: "2026-02-01T00:00:00Z"
    endDate: "2026-02-01T23:59:59Z"
  ) {
    total
    successCount
    failureCount
    successRate
    byAction {
      action
      count
    }
    byEntity {
      entity
      count
    }
  }
}
```

---

## 🔒 安全性

### 敏感資料過濾

系統自動移除以下敏感欄位：

```typescript
const sensitiveFields = [
  'password',
  'token',
  'secret',
  'apiKey',
  'api_key',
  'accessToken',
  'access_token',
  'refreshToken',
  'refresh_token',
  'privateKey',
  'private_key',
  'creditCard',
  'credit_card',
  'cardNumber',
  'card_number',
  'cvv',
  'ssn',
  'socialSecurity',
  'social_security',
];
```

**過濾前**:

```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

**過濾後**:

```json
{
  "email": "user@example.com",
  "password": "[REDACTED]"
}
```

### 權限控制

只有具備 `READ_AUDIT_LOG` 權限的用戶可以查詢稽核日誌：

```typescript
@Query(() => [AuditLogType])
@RequirePermission('READ_AUDIT_LOG')
async auditLogs(@Args('filters') filters: AuditLogFiltersInput) {
  // ...
}
```

---

## 📊 Console Log 解析

### Frontend 耗時（Next.js SSR）

```http
GET /en/login 200 in 868ms
  - compile: 549ms         ← TypeScript 編譯
  - proxy.ts: 8ms          ← Proxy 處理
  - generate-params: 200ms ← 參數生成
  - render: 312ms          ← SSR 渲染
```

這是 **Next.js 伺服器端渲染** 的耗時，不會記錄到 AuditLog。

### Backend 耗時（批次處理）

```text
[AuditLogConsumer] 批次處理完成，共 1 筆，耗時 46ms
```

這是 **批次寫入資料庫** 的耗時，不是請求處理時間。

### 實際請求耗時

**記錄在資料庫的 `duration` 欄位**：

```sql
SELECT action, entity, duration, path FROM audit_logs
WHERE timestamp > NOW() - INTERVAL '10 minutes'
ORDER BY timestamp DESC;
```

```text
action            | entity  | duration | path
------------------+---------+----------+------------------
MUTATION_LOGIN    | login   |       99 | /graphql/login
QUERY_USER        | user    |        7 | /graphql/user
QUERY_USERS...    | users   |       32 | /graphql/users...
```

---

## 🛠️ 維護操作

### 清理舊日誌

**保留 90 天的日誌**（預設）:

```typescript
await auditLogService.cleanup(90);
```

**自定義保留天數**:

```typescript
// 保留 30 天
await auditLogService.cleanup(30);

// 保留 180 天（6 個月）
await auditLogService.cleanup(180);
```

### 手動觸發批次處理

```typescript
// 在 AuditLogConsumer 中
await this.processBatch();
```

### 清除快取

```typescript
// 清除特定快取
await cacheManager.del('audit_logs:user:USER_ID:50');

// 或重啟服務自動清除所有快取
```

### 效能監控

**資料庫大小監控**:

```sql
-- 查看 audit_logs 表大小
SELECT
  pg_size_pretty(pg_total_relation_size('audit_logs')) as total_size,
  pg_size_pretty(pg_relation_size('audit_logs')) as table_size,
  pg_size_pretty(pg_indexes_size('audit_logs')) as indexes_size;
```

**TimescaleDB Chunk 資訊**:

```sql
-- 查看 Hypertable chunks 分布
SELECT
  chunk_name,
  range_start,
  range_end,
  pg_size_pretty(total_bytes) as size,
  pg_size_pretty(compressed_total_bytes) as compressed_size,
  ROUND(100.0 * compressed_total_bytes / total_bytes, 2) as compression_ratio
FROM timescaledb_information.chunks
WHERE hypertable_name = 'audit_logs'
ORDER BY range_start DESC
LIMIT 10;
```

**壓縮狀態檢查**:

```sql
-- 檢查壓縮政策執行狀態
SELECT
  job_id,
  application_name,
  last_run_status,
  last_run_started_at,
  next_start,
  total_runs,
  total_successes,
  total_failures
FROM timescaledb_information.jobs
WHERE proc_name = 'policy_compression';
```

**RabbitMQ 佇列監控**:

```bash
# 使用 RabbitMQ Management API 監控
curl -u guest:guest http://localhost:15672/api/queues/%2F/audit_log.create

# 關鍵指標：
# - messages: 佇列中的訊息數（應該接近 0）
# - messages_ready: 待處理訊息（應該很少）
# - message_stats.publish_details.rate: 發送速率
# - message_stats.deliver_details.rate: 消費速率
```

---

## 📝 最佳實踐

### 1. 定期清理舊日誌

建議設定 Cron Job 定期清理：

```typescript
// 每週清理一次，保留 90 天
@Cron('0 0 * * 0') // 每週日午夜
async cleanupOldLogs() {
  await this.auditLogService.cleanup(90);
}
```

### 2. 監控批次處理效能

關注 Console Log 中的批次處理耗時：

```text
[AuditLogConsumer] 批次處理完成，共 100 筆，耗時 XXX ms
```

- ✅ **正常**: < 100ms
- ⚠️ **警告**: 100-500ms
- ❌ **異常**: > 500ms（檢查資料庫負載）

### 3. 分析慢查詢

定期執行慢查詢分析：

```sql
-- 找出平均耗時 > 100ms 的操作
SELECT action, entity, AVG(duration)::int as avg_ms, COUNT(*) as count
FROM audit_logs
WHERE timestamp > NOW() - INTERVAL '7 days'
GROUP BY action, entity
HAVING AVG(duration) > 100
ORDER BY avg_ms DESC;
```

### 4. 安全審計

定期檢查失敗的操作：

```sql
-- 查詢最近的失敗操作
SELECT
  timestamp,
  action,
  entity,
  ip_address,
  details->>'error'->'message' as error_message
FROM audit_logs
WHERE status = 'FAILURE'
  AND timestamp > NOW() - INTERVAL '24 hours'
ORDER BY timestamp DESC
LIMIT 50;
```

### 5. 異常檢測

監控異常流量：

```sql
-- 檢測同一 IP 的高頻失敗請求（可能是攻擊）
SELECT
  ip_address,
  action,
  COUNT(*) as failure_count,
  MAX(timestamp) as last_failure
FROM audit_logs
WHERE status = 'FAILURE'
  AND timestamp > NOW() - INTERVAL '1 hour'
GROUP BY ip_address, action
HAVING COUNT(*) > 10
ORDER BY failure_count DESC;
```

### 6. 容量規劃

**估算儲存需求**:

```text
假設：
- 每筆日誌平均 1KB
- 每天 100 萬次請求
- 保留 90 天

未壓縮：1KB × 1M × 90 = 90 GB
壓縮後（70% 壓縮率）：90 GB × 0.3 = 27 GB
加上索引（30%）：27 GB × 1.3 = 35 GB

建議分配：50 GB（預留成長空間）
```

**監控儲存成長**:

```sql
-- 每週檢查儲存成長趨勢
SELECT
  date_trunc('week', timestamp) as week,
  COUNT(*) as log_count,
  pg_size_pretty(SUM(octet_length(details::text))) as data_size
FROM audit_logs
GROUP BY week
ORDER BY week DESC
LIMIT 12;  -- 最近 12 週
```

**容量告警閾值**:

- ✅ **70% 使用率**: 正常（綠燈）
- ⚠️ **85% 使用率**: 警告（黃燈），考慮清理或擴容
- ❌ **95% 使用率**: 緊急（紅燈），立即處理

---

## 📚 相關文檔

- [Request ID System](../backend/REQUEST_ID_SYSTEM.md) - 請求追蹤系統
- [GraphQL Best Practices](../backend/GRAPHQL_BEST_PRACTICES.md) - GraphQL 最佳實踐
- [Caching Strategy](../backend/CACHING_STRATEGY.md) - 快取策略
- [RBAC Architecture](../authentication/RBAC_ARCHITECTURE.md) - 權限控制
