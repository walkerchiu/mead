# 稽核日誌系統 (Audit Log System)

自動記錄所有操作，提供完整的請求追蹤和效能分析功能。

---

## 📋 目錄

- [稽核日誌系統 (Audit Log System)](#稽核日誌系統-audit-log-system)
  - [📋 目錄](#-目錄)
  - [📖 概述](#-概述)
    - [核心特性](#核心特性)
  - [📊 記錄內容](#-記錄內容)
    - [資料庫結構](#資料庫結構)
    - [記錄範例](#記錄範例)
  - [🏗️ 架構設計](#️-架構設計)
    - [流程圖](#流程圖)
    - [關鍵組件](#關鍵組件)
      - [1. AuditLogInterceptor（攔截器）](#1-auditloginterceptor攔截器)
      - [2. AuditLogService（服務層）](#2-auditlogservice服務層)
      - [3. AuditLogConsumer（消費者）](#3-auditlogconsumer消費者)
  - [📈 效能監控](#-效能監控)
    - [查詢最近的請求耗時](#查詢最近的請求耗時)
    - [分析平均效能](#分析平均效能)
    - [找出慢查詢](#找出慢查詢)
    - [分析失敗率](#分析失敗率)
  - [🔍 GraphQL 查詢](#-graphql-查詢)
    - [查詢稽核日誌](#查詢稽核日誌)
    - [依 Request ID 查詢](#依-request-id-查詢)
    - [依使用者查詢](#依使用者查詢)
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
  - [📝 最佳實踐](#-最佳實踐)
    - [1. 定期清理舊日誌](#1-定期清理舊日誌)
    - [2. 監控批次處理效能](#2-監控批次處理效能)
    - [3. 分析慢查詢](#3-分析慢查詢)
    - [4. 安全審計](#4-安全審計)
    - [5. 異常檢測](#5-異常檢測)
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

---

## 📊 記錄內容

### 資料庫結構

```prisma
model AuditLog {
  id          String   @id @default(dbgenerated("uuid_generate_v7()"))
  requestId   String   // 請求追蹤 ID（關聯同一請求的多筆日誌）
  userId      String?  // 執行操作的使用者 ID
  action      String   // 操作類型（CREATE_USER, UPDATE_POST 等）
  entity      String   // 實體類型（User, Post, Comment 等）
  entityId    String?  // 被操作的實體 ID
  status      String   // 操作狀態（SUCCESS, FAILURE）
  method      String?  // HTTP 方法或 GraphQL 類型
  path        String?  // 請求路徑或 GraphQL operation 名稱
  ipAddress   String?  // 請求來源 IP
  userAgent   String?  // 使用者代理字串
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
      "args": { "email": "customer@example.com", "password": "[REDACTED]" }
    },
    "response": {
      "accessToken": "[REDACTED]",
      "user": { "id": "...", "email": "customer@example.com" }
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

---

## 🔍 GraphQL 查詢

### 查詢稽核日誌

```graphql
query GetAuditLogs {
  auditLogs(
    filters: {
      userId: "019c18de-8a1f-c123-7a3b-00b9f8c3d4e5"
      action: "MUTATION_LOGIN"
      status: "SUCCESS"
      startDate: "2026-02-01T00:00:00Z"
      endDate: "2026-02-01T23:59:59Z"
      limit: 50
    }
  ) {
    id
    requestId
    userId
    action
    entity
    entityId
    status
    method
    path
    ipAddress
    duration
    timestamp
    details
  }
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

### 依使用者查詢

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

只有具備 `READ_AUDIT_LOG` 權限的使用者可以查詢稽核日誌：

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

---

## 📚 相關文檔

- [Request ID System](../backend/REQUEST_ID_SYSTEM.md) - 請求追蹤系統
- [GraphQL Best Practices](../backend/GRAPHQL_BEST_PRACTICES.md) - GraphQL 最佳實踐
- [Caching Strategy](../backend/CACHING_STRATEGY.md) - 快取策略
- [RBAC Architecture](../authentication/RBAC_ARCHITECTURE.md) - 權限控制
