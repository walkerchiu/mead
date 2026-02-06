# 審計日誌系統 (Audit Log System)

自動記錄所有 API 操作，提供完整的操作追蹤和稽核能力。

---

## 📋 目錄

- [審計日誌系統 (Audit Log System)](#審計日誌系統-audit-log-system)
  - [📋 目錄](#-目錄)
  - [📖 概述](#-概述)
    - [核心特色](#核心特色)
  - [✨ 功能特性](#-功能特性)
    - [1. 自動記錄所有操作](#1-自動記錄所有操作)
    - [2. 成功與失敗追蹤](#2-成功與失敗追蹤)
    - [3. Request ID 追蹤](#3-request-id-追蹤)
  - [🚀 快速開始](#-快速開始)
    - [查看審計日誌](#查看審計日誌)
    - [查看特定使用者的操作記錄](#查看特定使用者的操作記錄)
  - [📐 資料表結構](#-資料表結構)
    - [Prisma Schema](#prisma-schema)
    - [欄位說明](#欄位說明)
  - [🔧 自動記錄機制](#-自動記錄機制)
    - [AuditLogInterceptor](#auditloginterceptor)
    - [記錄內容](#記錄內容)
      - [輸入資料](#輸入資料)
      - [輸出資料](#輸出資料)
      - [元資料](#元資料)
  - [🎯 智能提取規則](#-智能提取規則)
    - [1. userId 提取](#1-userid-提取)
    - [2. action 提取](#2-action-提取)
    - [3. entity 提取](#3-entity-提取)
    - [4. entityId 提取](#4-entityid-提取)
  - [📚 查詢 API](#-查詢-api)
    - [基本查詢](#基本查詢)
    - [按使用者過濾](#按使用者過濾)
    - [按操作類型過濾](#按操作類型過濾)
    - [按狀態過濾（失敗操作）](#按狀態過濾失敗操作)
    - [按時間範圍查詢](#按時間範圍查詢)
  - [📊 統計分析](#-統計分析)
    - [按使用者統計](#按使用者統計)
    - [按操作類型統計](#按操作類型統計)
  - [🔒 敏感資料處理](#-敏感資料處理)
    - [自動清理敏感欄位](#自動清理敏感欄位)
    - [自訂敏感欄位](#自訂敏感欄位)
  - [⚡ 效能優化](#-效能優化)
    - [1. 批次處理（RabbitMQ）](#1-批次處理rabbitmq)
    - [2. 索引優化](#2-索引優化)
    - [3. 自動清理舊資料](#3-自動清理舊資料)
  - [🚨 故障排除](#-故障排除)
    - [問題 1：日誌未記錄](#問題-1日誌未記錄)
    - [問題 2：userId 為 null](#問題-2userid-為-null)
    - [問題 3：效能問題](#問題-3效能問題)
  - [📖 相關文檔](#-相關文檔)

---

## 📖 概述

Wind 專案實作了完整的審計日誌系統，自動記錄所有 API 操作（HTTP 和 GraphQL），提供完整的操作追蹤和稽核能力。

### 核心特色

- ✅ **自動記錄** - 使用 Interceptor 自動攔截所有請求
- ✅ **成功/失敗追蹤** - 區分操作狀態，記錄錯誤詳情
- ✅ **Request ID 整合** - 與 Request ID 系統完整整合
- ✅ **豐富元資料** - IP 地址、User Agent、執行時間等
- ✅ **GraphQL 支援** - 自動解析 GraphQL 操作名稱
- ✅ **智能提取** - 自動提取 userId 和 entityId
- ✅ **敏感資料保護** - 自動清理密碼、Token 等敏感資訊
- ✅ **查詢 API** - 提供多種查詢方式
- ✅ **統計分析** - 內建統計功能
- ✅ **批次處理** - 使用 RabbitMQ 非同步寫入
- ✅ **自動清理** - 保留指定天數的日誌

---

## ✨ 功能特性

### 1. 自動記錄所有操作

```typescript
// 所有以下請求都會自動記錄
POST /graphql { query: "mutation login(...)" }
GET /api/users/123
POST /api/posts
DELETE /api/comments/456
```

### 2. 成功與失敗追蹤

```typescript
// 成功操作
{
  status: "SUCCESS",
  statusCode: 200,
  response: { data: {...} }
}

// 失敗操作
{
  status: "FAILURE",
  statusCode: 401,
  error: "Unauthorized: Invalid credentials",
  response: null
}
```

### 3. Request ID 追蹤

每個審計日誌都與 Request ID 關聯，便於追蹤完整請求鏈：

```typescript
{
  requestId: "019bfed6-edc7-7381-9c32-e8b66ab013e6",  // UUID v7
  // ... 其他欄位
}
```

---

## 🚀 快速開始

### 查看審計日誌

使用 GraphQL API 查詢日誌：

```graphql
query {
  auditLogsPaginated(
    input: {
      offset: 0
      limit: 10
      orderBy: { createdAt: DESC }
      where: { userId: { equals: "user-123" } }
    }
  ) {
    success
    message
    data {
      items {
        id
        requestId
        userId
        action
        entity
        status
        createdAt
      }
      total
      hasNext
    }
  }
}
```

### 查看特定使用者的操作記錄

```graphql
query {
  auditLogsPaginated(
    input: {
      offset: 0
      limit: 20
      where: { userId: { equals: "user-abc" } }
      orderBy: { createdAt: DESC }
    }
  ) {
    data {
      items {
        action
        entity
        status
        createdAt
        details
      }
    }
  }
}
```

---

## 📐 資料表結構

### Prisma Schema

```prisma
model AuditLog {
  id          String    @id @default(dbgenerated("uuid_generate_v7()")) @db.Uuid
  requestId   String    @db.Uuid  // Request ID (UUID v7)
  userId      String?   @db.Uuid  // 使用者 ID（選填）
  action      String    @db.VarChar(100)  // 操作類型 (e.g., "login", "createPost")
  entity      String    @db.VarChar(100)  // 實體類型 (e.g., "User", "Post")
  entityId    String?   @db.Uuid  // 實體 ID（選填）
  status      String    @db.VarChar(20)   // SUCCESS 或 FAILURE
  statusCode  Int       // HTTP 狀態碼
  method      String?   @db.VarChar(10)   // HTTP 方法 (GET, POST, etc.)
  path        String?   @db.VarChar(500)  // 請求路徑
  ip          String?   @db.VarChar(45)   // IP 地址
  userAgent   String?   @db.VarChar(500)  // User-Agent
  duration    Int?      // 執行時間 (毫秒)
  details     Json?     // 詳細資訊 (input, output, error)
  error       String?   @db.Text  // 錯誤訊息
  createdAt   DateTime  @default(now()) @db.Timestamptz(3)

  user        User?     @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@index([userId])
  @@index([requestId])
  @@index([createdAt])
  @@index([status])
  @@index([action])
  @@map("audit_logs")
}
```

### 欄位說明

| 欄位         | 類型     | 說明                       | 範例                              |
| ------------ | -------- | -------------------------- | --------------------------------- |
| `id`         | UUID     | 主鍵 (UUID v7)             | `019c1234-...`                    |
| `requestId`  | UUID     | Request ID                 | `019bfed6-...`                    |
| `userId`     | UUID?    | 使用者 ID（未登入則 null） | `018f9a2b-...`                    |
| `action`     | String   | 操作名稱                   | `MUTATION_LOGIN`, `CREATE_USER`   |
| `entity`     | String   | 實體類型                   | `Auth`, `User`, `Post`            |
| `entityId`   | UUID?    | 實體 ID                    | `018f9a2b-...`                    |
| `status`     | String   | 成功/失敗                  | `SUCCESS`, `FAILURE`              |
| `statusCode` | Int      | HTTP 狀態碼                | `200`, `401`, `500`               |
| `method`     | String?  | HTTP 方法                  | `GET`, `POST`, `DELETE`           |
| `path`       | String?  | 請求路徑                   | `/graphql`, `/api/users`          |
| `ip`         | String?  | 來源 IP                    | `192.168.1.1`                     |
| `userAgent`  | String?  | User-Agent                 | `Mozilla/5.0 ...`                 |
| `duration`   | Int?     | 執行時間 (ms)              | `123`                             |
| `details`    | JSON?    | 詳細資料                   | `{ input: {...}, output: {...} }` |
| `error`      | String?  | 錯誤訊息                   | `Unauthorized: ...`               |
| `createdAt`  | DateTime | 建立時間                   | `2026-01-30T10:00:00Z`            |

> **📌 Action 命名規則**：
>
> - GraphQL Mutation: `MUTATION_<操作名>` (如 `MUTATION_LOGIN`)
> - GraphQL Query: `QUERY_<操作名>` (如 `QUERY_USER`)
> - REST API: `<HTTP方法>_<資源名>` (如 `CREATE_USER`, `UPDATE_POST`)

---

## 🔧 自動記錄機制

### AuditLogInterceptor

系統使用 `AuditLogInterceptor` 自動攔截和記錄所有請求：

```typescript
@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const startTime = Date.now();
    const ctx = GqlExecutionContext.create(context);

    // 提取請求資訊
    const request = this.getRequest(ctx);
    const userId = this.extractUserId(ctx);
    const { action, entity, entityId } = this.extractOperation(ctx);

    return next.handle().pipe(
      tap({
        next: (response) => {
          // 記錄成功操作
          this.auditLogService.createAsync({
            ...metadata,
            status: 'SUCCESS',
            response,
            duration: Date.now() - startTime,
          });
        },
        error: (error) => {
          // 記錄失敗操作
          this.auditLogService.createAsync({
            ...metadata,
            status: 'FAILURE',
            error: error.message,
            statusCode: error.status || 500,
            duration: Date.now() - startTime,
          });
        },
      }),
    );
  }
}
```

### 記錄內容

每個審計日誌包含：

#### 輸入資料

- GraphQL: `variables`, `query`, `operationName`
- REST: `body`, `query`, `params`

#### 輸出資料

- 成功: 完整的 response 資料
- 失敗: 錯誤訊息和堆疊追蹤

#### 元資料

- `requestId`: Request ID (UUID v7)
- `userId`: 使用者 ID（如果已認證）
- `action`: 操作名稱
- `entity`: 實體類型
- `entityId`: 實體 ID
- `duration`: 執行時間（毫秒）
- `ip`: 來源 IP 地址
- `userAgent`: User-Agent 字串

---

## 🎯 智能提取規則

### 1. userId 提取

Interceptor 會按以下**優先順序**查找 userId：

```typescript
// 優先級 1: GraphQL Context (需要認證 Guard)
context.user?.id;
context.currentUser?.id;

// 優先級 2: HTTP Request (需要認證 Guard)
req.user?.id;
req.currentUser?.id;

// 優先級 3: 如果未認證
userId = null; // 訪客操作
```

**範例**：

```typescript
// 已登入使用者
{
  userId: "018f9a2b-1234-7890-abcd-ef0123456789",
  action: "CREATE_POST",
  // ...
}

// 訪客（未登入）
{
  userId: null,
  action: "MUTATION_REGISTER",
  // ...
}
```

### 2. action 提取

系統會自動從不同來源提取操作名稱：

```typescript
// GraphQL Mutation: 加上 MUTATION_ 前綴
mutation Login { ... } → action = "MUTATION_LOGIN"

// GraphQL Query: 加上 QUERY_ 前綴
query User { ... } → action = "QUERY_USER"

// REST API: 從路徑和方法組合
POST /api/posts → action = "CREATE_POST"
GET /api/users/123 → action = "getUser"
DELETE /api/comments/456 → action = "deleteComment"
```

**提取邏輯**：

```typescript
// GraphQL
if (info.operation.operation === 'mutation') {
  action = info.fieldName; // e.g., "login", "register"
} else if (info.operation.operation === 'query') {
  action = info.fieldName; // e.g., "me", "users"
}

// REST
action = `${method.toLowerCase()}${entity}`;
// POST + User → createUser
// GET + Post → getPost
// DELETE + Comment → deleteComment
```

### 3. entity 提取

實體類型從多個來源自動提取：

```typescript
// GraphQL: 從 Type 定義
@ObjectType()
class User { ... } → entity = "User"

// REST: 從路徑解析
/api/posts/123 → entity = "Post"
/api/users → entity = "User"
```

### 4. entityId 提取

系統會智能查找實體 ID：

```typescript
// 優先級 1: Response 資料中的 id
response?.data?.id → entityId

// 優先級 2: Input 參數中的 id
variables?.id → entityId
args?.id → entityId

// 優先級 3: URL 參數中的 id
/api/posts/123 → entityId = "123"
```

**範例**：

```graphql
# Mutation 輸入包含 ID
mutation {
  updatePost(id: "123", input: {...}) {
    id
    title
  }
}
# → entityId = "123"

# Mutation 輸出包含 ID
mutation {
  createPost(input: {...}) {
    id  # 返回 "456"
    title
  }
}
# → entityId = "456"
```

---

## 📚 查詢 API

### 基本查詢

```graphql
query {
  auditLogsPaginated(input: { offset: 0, limit: 10 }) {
    data {
      items {
        id
        action
        status
        createdAt
      }
      total
    }
  }
}
```

### 按使用者過濾

```graphql
query {
  auditLogsPaginated(
    input: {
      where: { userId: { equals: "user-123" } }
      orderBy: { createdAt: DESC }
    }
  ) {
    data {
      items {
        action
        entity
        status
        createdAt
      }
    }
  }
}
```

### 按操作類型過濾

```graphql
query {
  auditLogsPaginated(
    input: { where: { action: { in: ["login", "logout", "changePassword"] } } }
  ) {
    data {
      items {
        userId
        action
        status
        ip
        createdAt
      }
    }
  }
}
```

### 按狀態過濾（失敗操作）

```graphql
query {
  auditLogsPaginated(
    input: {
      where: { status: { equals: "FAILURE" } }
      orderBy: { createdAt: DESC }
    }
  ) {
    data {
      items {
        action
        statusCode
        error
        createdAt
      }
    }
  }
}
```

### 按時間範圍查詢

```graphql
query {
  auditLogsPaginated(
    input: {
      where: {
        createdAt: { gte: "2026-01-01T00:00:00Z", lte: "2026-01-31T23:59:59Z" }
      }
    }
  ) {
    data {
      items {
        action
        createdAt
      }
    }
  }
}
```

---

## 📊 統計分析

### 按使用者統計

```graphql
query {
  auditLogStats(
    input: {
      groupBy: ["userId"]
      where: { createdAt: { gte: "2026-01-01T00:00:00Z" } }
    }
  ) {
    data {
      userId
      totalCount
      successCount
      failureCount
    }
  }
}
```

### 按操作類型統計

```graphql
query {
  auditLogStats(
    input: { groupBy: ["action"], orderBy: { count: DESC }, limit: 10 }
  ) {
    data {
      action
      totalCount
      avgDuration
    }
  }
}
```

---

## 🔒 敏感資料處理

### 自動清理敏感欄位

系統會自動清理以下敏感資料：

```typescript
const SENSITIVE_FIELDS = [
  'password',
  'token',
  'accessToken',
  'refreshToken',
  'apiKey',
  'secret',
  'privateKey',
  'creditCard',
  'ssn',
];
```

**清理前**：

```json
{
  "input": {
    "email": "user@example.com",
    "password": "Password123!",
    "apiKey": "sk-abc123def456"
  }
}
```

**清理後**：

```json
{
  "input": {
    "email": "user@example.com",
    "password": "[REDACTED]",
    "apiKey": "[REDACTED]"
  }
}
```

### 自訂敏感欄位

可以在配置中添加自訂敏感欄位：

```typescript
// audit-log.module.ts
{
  sensitiveFields: ['password', 'token', 'ssn', 'customSecret'];
}
```

---

---

## ⚡ 效能優化

### 1. 批次處理（RabbitMQ）

審計日誌使用 RabbitMQ 非同步批次寫入，避免阻塞主請求：

```typescript
// 1. Interceptor 發送到 Queue（非阻塞）
this.auditLogQueue.add('create', auditLogData);

// 2. Consumer 批次處理（每 100 筆或 5 秒）
@Process('create')
async handleBatch(jobs: Job[]) {
  const logs = jobs.map(job => job.data);
  await this.prisma.auditLog.createMany({ data: logs });
}
```

**效能提升**：

- 單筆寫入: ~10ms/request
- 批次寫入: ~0.1ms/request (100x 改善)

### 2. 索引優化

資料表建立了多個索引加速查詢：

```sql
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_request_id ON audit_logs(request_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_status ON audit_logs(status);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
```

### 3. 自動清理舊資料

定期清理超過保留期限的日誌（預設 90 天）：

```typescript
// audit-log.service.ts
async cleanupOldLogs(daysToKeep = 90) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

  await this.prisma.auditLog.deleteMany({
    where: { createdAt: { lt: cutoffDate } },
  });
}
```

設定 Cron Job：

```typescript
@Cron('0 2 * * *')  // 每天凌晨 2 點執行
async handleCleanup() {
  await this.auditLogService.cleanupOldLogs(90);
}
```

---

## 🚨 故障排除

### 問題 1：日誌未記錄

**檢查清單**：

- [ ] AuditLogInterceptor 是否正確註冊？
- [ ] RabbitMQ 是否運行？
- [ ] 資料庫連線是否正常？

```bash
# 檢查 RabbitMQ
./scripts/cli.sh logs rabbitmq -f

# 檢查資料庫
./scripts/cli.sh db studio
```

### 問題 2：userId 為 null

**可能原因**：

- 未套用認證 Guard
- Context 中沒有 user 物件

**解決方案**：

```typescript
// 確保 Resolver 有 @UseGuards
@UseGuards(JwtAuthGuard)
@Mutation(() => PostResponse)
async createPost(@CurrentUser() user: User) {
  // ...
}
```

### 問題 3：效能問題

**診斷**：

```graphql
query {
  auditLogStats(input: { groupBy: ["action"] }) {
    data {
      action
      avgDuration
    }
  }
}
```

**優化建議**：

- 增加批次大小（100 → 500）
- 縮短保留天數（90 → 30）
- 添加更多索引

---

## 📖 相關文檔

- [Request ID System](../backend/REQUEST_ID_SYSTEM.md) - Request ID 追蹤系統
- [RBAC Architecture](../authentication/RBAC_ARCHITECTURE.md) - 權限控制
- [RabbitMQ & Dragonfly](./RABBITMQ_DRAGONFLY.md) - 訊息佇列設定
- [Prisma Schema](../database/PRISMA_SCHEMA_ORGANIZATION.md) - 資料庫結構
