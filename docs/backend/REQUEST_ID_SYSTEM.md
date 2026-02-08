# Request ID 追蹤系統 (Request ID System)

使用 UUID v7 唯一識別每個請求，搭配 AsyncLocalStorage 在整個請求生命週期 — 包括深層 service、cron / worker — 全程串接。

---

## 📋 目錄

- [Request ID 追蹤系統 (Request ID System)](#request-id-追蹤系統-request-id-system)
  - [📋 目錄](#-目錄)
  - [📖 概述](#-概述)
  - [📐 Request ID 格式（UUID v7）](#-request-id-格式uuid-v7)
  - [🏗️ 系統架構](#️-系統架構)
  - [🔧 核心組件](#-核心組件)
  - [🛡️ 安全：嚴格 UUID 驗證](#️-安全嚴格-uuid-驗證)
  - [🔁 AsyncLocalStorage 整合（per-request 上下文）](#-asynclocalstorage-整合per-request-上下文)
    - [為什麼需要](#為什麼需要)
    - [解法：AsyncLocalStorage](#解法asynclocalstorage)
    - [Service 層使用模式](#service-層使用模式)
  - [🚨 異常與 fallback](#-異常與-fallback)
    - [`AllExceptionsFilter`](#allexceptionsfilter)
    - [`AuditLogInterceptor`：missing-id fallback](#auditloginterceptormissing-id-fallback)
  - [📝 使用方式](#-使用方式)
    - [前端發送請求](#前端發送請求)
    - [Controller 層（HTTP）](#controller-層http)
    - [GraphQL Resolver](#graphql-resolver)
    - [Service 層（用 RequestContextService）](#service-層用-requestcontextservice)
  - [🔗 與審計日誌整合](#-與審計日誌整合)
    - [自動關聯](#自動關聯)
    - [`details.requestIdMissing` 標記](#detailsrequestidmissing-標記)
  - [🎯 最佳實踐](#-最佳實踐)
    - [✅ DO](#-do)
    - [❌ DON'T](#-dont)
  - [📜 變更紀錄](#-變更紀錄)
    - [2026-05-04](#2026-05-04)
    - [早期版本](#早期版本)
  - [📚 相關文檔](#-相關文檔)

---

## 📖 概述

Request ID 是一個唯一識別符，用來把「同一個請求」在系統中各層的事件串起來：HTTP/GraphQL 進入點、resolver、service、audit_log、log 行。失誤排查、客戶支援、效能追蹤都靠它。

| 場景     | 無 Request ID          | 有 Request ID                    |
| -------- | ---------------------- | -------------------------------- |
| 除錯錯誤 | 在數千條日誌中搜尋     | 直接過濾單一請求                 |
| 客戶支援 | 難以重現問題           | 提供 Request ID 即可查 audit_log |
| 效能分析 | 難以追蹤完整路徑       | 看完整鏈路時間                   |
| 跨層串接 | 各層自生 ID 切斷 chain | 一個 ID 串到底                   |

**核心特性**：

- ✅ **UUID v7** — 時間可排序、極低碰撞、PostgreSQL `uuid` 欄位友善
- ✅ **HTTP/GraphQL 統一** — 兩種協議走同一機制
- ✅ **嚴格 header 驗證** — client 帶非 UUID 一律 fallback
- ✅ **AsyncLocalStorage 串鏈** — service 不必透過參數傳遞 requestId
- ✅ **Audit Log 整合** — `audit_log.request_id` 與當下請求一致
- ✅ **回應返回** — `X-Request-ID` response header 給客戶端

> **目前定位**：同一服務內的 request id，**不是**分散式 trace（無 W3C Trace Context / OpenTelemetry span 階層）。跨服務追蹤待業務需要時再升級。

---

## 📐 Request ID 格式（UUID v7）

```text
01930f8e-4b2e-7890-a123-456789abcdef
└─────┬─────┘└┬┘ └──┬──┘ └─────┬─────┘
  時間戳記   版本  隨機   隨機部分
```

**為何選 v7**：

- 時間可排序 — audit_log timeline scan 友善
- 與 PostgreSQL `uuid` 型別相容（audit_log.request_id 即此型別）
- 低碰撞、不需協調器

**驗證 regex**（接受 UUID v1–v8）：

```text
/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
```

放寬到 v1–v8 是為了相容性 — 接受其他系統產出的合法 UUID。

---

## 🏗️ 系統架構

```text
┌──────────────────────────────────────────────────────────┐
│                  客戶端請求                                │
│  Header: x-request-id（可選；非 UUID 會被忽略）             │
└──────────────────────┬───────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────┐
│              RequestContextMiddleware                     │
│  1. 嚴格 UUID 驗證 header（不通過 → uuidv7()）              │
│  2. 寫 req.requestId                                      │
│  3. 設 X-Request-ID response header                       │
│  4. RequestContextService.run(id, () => next())           │
│     → 起 AsyncLocalStorage scope                          │
└──────────────────────┬───────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────┐
│   RequestIdPlugin（Apollo）/ RequestIdInterceptor         │
│   優先沿用 req.requestId（已由 middleware 設好）            │
│   Subscription：plugin/interceptor 都早退                  │
└──────────────────────┬───────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────┐
│   應用層（Controller / Resolver / Service）                │
│   - @RequestId() decorator（Controller / Resolver 注入）   │
│   - RequestContextService.getRequestIdOrGenerate()         │
│     （Service 層深層讀取，免參數傳遞）                       │
└──────────────────────┬───────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────┐
│   AuditLogInterceptor                                    │
│   寫 audit_log.request_id；missing 時 fallback uuidv7()    │
│   並標記 details.requestIdMissing = true                  │
└──────────────────────┬───────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────┐
│   AllExceptionsFilter                                    │
│   錯誤回應與 log 一律帶 requestId（HTTP/GraphQL 各自取）    │
└──────────────────────────────────────────────────────────┘
```

---

## 🔧 核心組件

| 組件                         | 位置                                                   | 職責                                                                        |
| ---------------------------- | ------------------------------------------------------ | --------------------------------------------------------------------------- |
| **RequestContextModule**     | `common/request-context/request-context.module.ts`     | Global module；註冊 middleware 至所有路由                                   |
| **RequestContextMiddleware** | `common/request-context/request-context.middleware.ts` | 解析/驗證 header、寫 `req.requestId`、起 ALS scope                          |
| **RequestContextService**    | `common/request-context/request-context.service.ts`    | ALS 管理；提供 `getRequestId()` / `getRequestIdOrGenerate()`                |
| **RequestIdInterceptor**     | `common/interceptors/request-id.interceptor.ts`        | NestJS 層補位（HTTP/GraphQL 沿用 `req.requestId`，subscription skip）       |
| **RequestIdPlugin**          | `common/plugins/request-id.plugin.ts`                  | Apollo plugin；HTTP-GraphQL 沿用 `req.requestId`，subscription early-return |
| **RequestId Decorator**      | `common/decorators/request-id.decorator.ts`            | 在 Controller / Resolver 注入 `requestId`                                   |
| **AllExceptionsFilter**      | `common/filters/all-exceptions.filter.ts`              | 異常時 HTTP/GraphQL 分流取 `requestId`，寫 log + response                   |
| **AuditLogInterceptor**      | `audit-log/audit-log.interceptor.ts`                   | 寫 `audit_log.request_id`；缺失時 fallback `uuidv7()`                       |

---

## 🛡️ 安全：嚴格 UUID 驗證

`audit_log.request_id` 是 PostgreSQL `uuid` 型別。如果直接信任 client 帶來的 `x-request-id` header：

- **HTTP response splitting**：`\r\n\r\n` 注入
- **巨大 payload**：撐爆 audit_log 欄位
- **Cache key 污染**：`audit_logs:request:${requestId}` 鍵被異常字符破壞
- **DB 寫入錯誤**：非 UUID 字串會讓 `INSERT` 整個 failed

因此 middleware、interceptor、plugin **三處** 都用同一個正則檢查：

```typescript
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function pickValidHeaderId(raw: unknown): string | undefined {
  return typeof raw === 'string' && UUID_REGEX.test(raw) ? raw : undefined;
}
```

**不通過驗證 → 直接 fallback `uuidv7()`** — 不報錯、不洩資訊給 client。

---

## 🔁 AsyncLocalStorage 整合（per-request 上下文）

### 為什麼需要

傳統做法：service 沒拿到 requestId 時各自 `crypto.randomUUID()`，導致：

```text
HTTP /api/sessions/:id (DELETE)  → requestId-A
   └─ SessionService.revokeSession()
        └─ auditLogService.create({ requestId: ??? })  ← 各自生 random UUID = chain 斷掉
```

寫進 audit_log 的 ID 跟原始請求對不上，事後無法追溯。

### 解法：AsyncLocalStorage

`RequestContextMiddleware` 在所有路由註冊，request 進入時用 `als.run(requestId, () => next())` 包覆整個 async chain：

```typescript
// common/request-context/request-context.service.ts
@Injectable()
export class RequestContextService {
  private readonly als = new AsyncLocalStorage<{ requestId: string }>();

  run<T>(requestId: string, fn: () => T): T {
    return this.als.run({ requestId }, fn);
  }

  /** ALS 外回 undefined（cron / worker / startup） */
  getRequestId(): string | undefined {
    return this.als.getStore()?.requestId;
  }

  /** ALS 外 fallback uuidv7()，仍滿足 audit_log uuid 欄位 */
  getRequestIdOrGenerate(): string {
    return this.getRequestId() ?? uuidv7();
  }
}
```

### Service 層使用模式

```typescript
@Injectable()
export class HQSessionService {
  constructor(
    private auditLogService: AuditLogService,
    private requestContext: RequestContextService,
  ) {}

  async revokeSession(sessionId: string, hqId: string) {
    // ...
    await this.auditLogService.create({
      requestId: this.requestContext.getRequestIdOrGenerate(),
      // ✅ HTTP/GraphQL 流程下 → 與原始請求同一個 ID
      // ✅ Cron / Worker 流程下 → fallback 自生新 UUID
      action: 'SESSION_REVOKED',
      // ...
    });
  }
}
```

**已接 ALS 的 service**：

- `auth/session-management.service.ts`
- `auth/hq-session.service.ts`
- `notification/notification.service.ts`
- `cron-monitoring/cron-job-monitor.service.ts`（cron 場景自動 fallback）

---

## 🚨 異常與 fallback

### `AllExceptionsFilter`

HTTP 與 GraphQL 路徑分流取 `requestId`：

```typescript
catch(exception: unknown, host: ArgumentsHost) {
  const gqlHost = GqlArgumentsHost.create(host);
  const ctx = gqlHost.getContext();
  let httpReq: { requestId?: string } | undefined;
  try {
    httpReq =
      host.getType<'graphql' | 'http'>() === 'http'
        ? host.switchToHttp().getRequest()
        : undefined;
  } catch {
    /* ignore */
  }
  const requestId =
    ctx?.requestId || ctx?.req?.requestId || httpReq?.requestId || 'unknown';
  // ...
}
```

> **歷史 bug**：早期版本對 HTTP 異常一律走 `GqlArgumentsHost`，永遠拿不到 ctx，`requestId` 永遠是 `'unknown'`。已修正。

### `AuditLogInterceptor`：missing-id fallback

當 `req.requestId` 與 header 都拿不到（理論不該發生，實務有 race / hot-reload 場景），不再靜默丟棄 audit log：

```typescript
let requestIdMissing = false;
if (!requestId) {
  requestId = uuidv7();
  requestIdMissing = true;
  logger.warn('[AuditLog] requestId 不存在，已 fallback');
}

await this.auditLogService.create({
  requestId,
  // ...
  details: {
    request: requestInput,
    response: ...,
    ...(requestIdMissing && { requestIdMissing: true }),
  },
});
```

可以 query：

```sql
SELECT id, action, request_id, details
FROM audit_logs
WHERE details->>'requestIdMissing' = 'true';
```

找出 middleware 未生效的請求。

---

## 📝 使用方式

### 前端發送請求

```typescript
// 不主動帶 header — 後端自動生成 UUID v7
const response = await fetch('/api/graphql', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query }),
});

// 取出後端設定的 X-Request-ID
const requestId = response.headers.get('X-Request-ID');
```

如要主動帶（例：frontend 想用同一個 ID 串多次重試）：

```typescript
import { uuidv7 } from 'uuidv7'; // 必須是合法 UUID，否則會被 backend 忽略
const clientRequestId = uuidv7();
fetch('/api/graphql', {
  headers: { 'x-request-id': clientRequestId },
  // ...
});
```

### Controller 層（HTTP）

```typescript
import { RequestId } from '../common/decorators/request-id.decorator';

@Controller('users')
export class UserController {
  @Get(':id')
  async getUser(@Param('id') id: string, @RequestId() requestId: string) {
    this.logger.log(`[${requestId}] Fetching user ${id}`);
    return this.userService.findOne(id);
  }
}
```

### GraphQL Resolver

```typescript
@Resolver()
export class UserResolver {
  @Query(() => User)
  async user(@Args('id') id: string, @RequestId() requestId: string) {
    this.logger.log(`[${requestId}] GraphQL: user(${id})`);
    return this.userService.findOne(id);
  }
}
```

### Service 層（用 RequestContextService）

**推薦**：service 不靠參數傳遞 requestId，改透過 ALS 取：

```typescript
@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private requestContext: RequestContextService,
  ) {}

  async findOne(id: string) {
    const requestId = this.requestContext.getRequestId();
    this.logger.log(`[${requestId ?? 'no-ctx'}] Querying user ${id}`);
    return this.prisma.user.findUnique({ where: { id } });
  }

  async writeAuditLog(action: string, entityId: string) {
    await this.auditLogService.create({
      requestId: this.requestContext.getRequestIdOrGenerate(),
      action,
      entity: 'User',
      entityId,
      status: 'SUCCESS',
    });
  }
}
```

---

## 🔗 與審計日誌整合

### 自動關聯

`AuditLogInterceptor` 從 `req.requestId` 取，寫進 `audit_log.request_id`。同一個請求觸發的所有 audit log 都會帶**同一個** ID。

```sql
-- 找出某次請求的所有事件
SELECT id, action, entity, entity_id, status, created_at
FROM audit_logs
WHERE request_id = '01930f8e-4b2e-7890-a123-456789abcdef'
ORDER BY created_at;
```

### `details.requestIdMissing` 標記

當 interceptor 起作用但拿不到 ID（fallback 場景），audit log 仍會寫，但 `details.requestIdMissing = true` 留下證據：

```sql
-- 監控 middleware 是否有 gap
SELECT path, method, COUNT(*)
FROM audit_logs
WHERE details->>'requestIdMissing' = 'true'
  AND created_at >= NOW() - INTERVAL '1 day'
GROUP BY path, method
ORDER BY COUNT(*) DESC;
```

---

## 🎯 最佳實踐

### ✅ DO

- **service 層用 `RequestContextService`**，不用參數傳遞

  ```typescript
  // ✅ 好
  await this.auditLogService.create({
    requestId: this.requestContext.getRequestIdOrGenerate(),
    // ...
  });
  ```

- **log 帶上 requestId**

  ```typescript
  // ✅ 好
  this.logger.log(`[${requestId}] User login successful`);
  ```

- **向客戶端錯誤訊息提供 requestId**（協助客服查 audit log）

  ```typescript
  throw new BadRequestException({ message, requestId });
  ```

### ❌ DON'T

- **不要自己 `crypto.randomUUID()`** 給 audit_log.requestId — 用 `requestContext.getRequestIdOrGenerate()`，cron 場景仍會自動 fallback

- **不要假設 client header 必為合法 UUID** — middleware 已嚴格驗證並過濾，service 層直接信任 `req.requestId` 即可

- **不要在 Request ID 中嵌入業務資訊**（用 `userId-timestamp` 之類） — 純 UUID v7 就好

---

## 📜 變更紀錄

### 2026-05-04

- 🔴 **修正 P0 bug**：HTTP 異常的 `requestId` 永遠是 `'unknown'`（filter 改為 type 分流）
- 🔴 **修正 P0 bug**：Plugin 與 Interceptor 在沒帶 header 時雙重生成不同 ID（interceptor 改為優先沿用 `req.requestId`）
- 🟠 **導入 AsyncLocalStorage**：新增 `RequestContextModule` / `RequestContextService` / `RequestContextMiddleware`；service 層 `crypto.randomUUID()` 全面改用 `getRequestIdOrGenerate()`
- 🟠 **AuditLogInterceptor missing-id fallback**：取不到 requestId 時用 `uuidv7()` 並標記 `details.requestIdMissing = true`，不再靜默丟棄
- 🟡 **嚴格 UUID 格式驗證**：middleware / plugin / interceptor 都過 regex 檢查，非合法 UUID 一律 fallback
- 🟡 **Plugin Subscription early-return**：與 Interceptor 行為對齊
- 🟡 **Plugin optional chaining**：`req?.headers?.['x-request-id']` 防 edge case throw

### 早期版本

- UUID v7 採用、Apollo Plugin 與 Interceptor 雙軌實作、Audit Log 整合

---

## 📚 相關文檔

- [AUDIT_LOG_SYSTEM.md](./AUDIT_LOG_SYSTEM.md) — 審計日誌系統
- [API_RESPONSE_FORMAT.md](./API_RESPONSE_FORMAT.md) — API 回應格式
- [CACHING_STRATEGY.md](./CACHING_STRATEGY.md) — 快取策略
- [SUBSCRIPTION_GUIDE.md](./SUBSCRIPTION_GUIDE.md) — GraphQL Subscription（不走 Request ID 機制）
