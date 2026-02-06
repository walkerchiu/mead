# API Rate Limiting 文件

多層級的請求速率限制，保護系統免受濫用和 DDoS 攻擊。

---

## 📋 目錄

- [API Rate Limiting 文件](#api-rate-limiting-文件)
  - [📋 目錄](#-目錄)
  - [📖 概述](#-概述)
  - [🏗️ 速率限制層級](#️-速率限制層級)
    - [工作原理](#工作原理)
  - [📊 回應格式](#-回應格式)
    - [成功請求](#成功請求)
    - [超過速率限制](#超過速率限制)
  - [🔧 實施細節](#-實施細節)
    - [GraphQL 特殊處理](#graphql-特殊處理)
    - [配置](#配置)
    - [全域啟用](#全域啟用)
  - [💡 客戶端處理建議](#-客戶端處理建議)
    - [重試策略](#重試策略)
    - [請求批次化](#請求批次化)
  - [⚙️ 調整速率限制](#️-調整速率限制)
    - [環境變數配置](#環境變數配置)
    - [針對特定端點調整](#針對特定端點調整)
  - [📈 監控與日誌](#-監控與日誌)
    - [追蹤 Rate Limit 事件](#追蹤-rate-limit-事件)
    - [監控指標](#監控指標)
  - [🧪 測試](#-測試)
    - [測試 Rate Limiting](#測試-rate-limiting)
    - [單元測試範例](#單元測試範例)
  - [🎯 最佳實踐](#-最佳實踐)
    - [1. 合理設定限制值](#1-合理設定限制值)
    - [2. 提供清晰的錯誤訊息](#2-提供清晰的錯誤訊息)
    - [3. 考慮認證使用者](#3-考慮認證使用者)
    - [4. 使用 Redis 儲存](#4-使用-redis-儲存)
  - [❓ 常見問題](#-常見問題)
    - [Q: Rate limiting 會影響效能嗎？](#q-rate-limiting-會影響效能嗎)
    - [Q: 如何針對不同端點設定不同限制？](#q-如何針對不同端點設定不同限制)
    - [Q: 可以根據使用者身份調整限制嗎？](#q-可以根據使用者身份調整限制嗎)
    - [Q: Rate limit 資料會持久化嗎？](#q-rate-limit-資料會持久化嗎)
  - [📖 相關資源](#-相關資源)

---

## 📖 概述

API 已實施多層級的請求速率限制（Rate Limiting），保護系統免受濫用和 DDoS 攻擊。

---

## 🏗️ 速率限制層級

系統採用三層速率限制策略：

| 名稱       | 時間窗口 | 最大請求數 | 說明                     |
| ---------- | -------- | ---------- | ------------------------ |
| **Short**  | 1 秒     | 10         | 防止極短時間內的爆發請求 |
| **Medium** | 10 秒    | 50         | 短期請求限制             |
| **Long**   | 1 分鐘   | 100        | 長期請求限制             |

### 工作原理

- 三層限制**同時生效**（取最嚴格的限制）
- 每層使用獨立的計數器
- 超過任一層限制即觸發 429 錯誤

---

## 📊 回應格式

### 成功請求

正常情況下，請求不受影響：

```json
{
  "data": {
    "hello": {
      "success": true,
      "message": "查詢成功",
      "data": {
        "content": "Hello from GraphQL!"
      },
      "requestId": "019bfee0-59c9-7e81-9dee-833705d90b17"
    }
  }
}
```

### 超過速率限制

當超過速率限制時，返回錯誤：

```json
{
  "errors": [
    {
      "message": "ThrottlerException: Too Many Requests",
      "locations": [{ "line": 1, "column": 3 }],
      "path": ["hello"],
      "extensions": {
        "code": "BAD_REQUEST",
        "requestId": "unknown"
      }
    }
  ],
  "data": null
}
```

HTTP 狀態碼：**200**（GraphQL 標準）  
錯誤代碼：**BAD_REQUEST**

---

## 🔧 實施細節

### GraphQL 特殊處理

由於 GraphQL 的執行上下文與 REST API 不同，使用自訂的 `GraphQLThrottlerGuard`：

```typescript
// src/common/guards/graphql-throttler.guard.ts
import { ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class GraphQLThrottlerGuard extends ThrottlerGuard {
  getRequestResponse(context: ExecutionContext) {
    const gqlCtx = GqlExecutionContext.create(context);
    const ctx = gqlCtx.getContext();
    return { req: ctx.req, res: ctx.res };
  }
}
```

### 配置

在 `app.module.ts` 中配置：

```typescript
ThrottlerModule.forRoot([
  {
    name: 'short',
    ttl: 1000,    // 1 秒
    limit: 10,    // 最多 10 個請求
  },
  {
    name: 'medium',
    ttl: 10000,   // 10 秒
    limit: 50,    // 最多 50 個請求
  },
  {
    name: 'long',
    ttl: 60000,   // 1 分鐘
    limit: 100,   // 最多 100 個請求
  },
]),
```

### 全域啟用

使用 APP_GUARD 讓 rate limiting 套用到所有端點：

```typescript
providers: [
  {
    provide: APP_GUARD,
    useClass: GraphQLThrottlerGuard,
  },
],
```

---

## 💡 客戶端處理建議

### 重試策略

當收到 rate limit 錯誤時，建議實施指數退避重試：

```typescript
async function queryWithRetry(query: string, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch('/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      const result = await response.json();

      // 檢查是否為 rate limit 錯誤
      if (
        result.errors?.some((err) => err.message.includes('Too Many Requests'))
      ) {
        // 指數退避：2^i * 100ms
        await sleep(Math.pow(2, i) * 100);
        continue;
      }

      return result;
    } catch (error) {
      throw error;
    }
  }

  throw new Error('Max retries reached');
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
```

### 請求批次化

避免頻繁的單個請求，改用批次查詢：

```graphql
# 不推薦：多次單獨請求
query {
  user1: getUser(id: 1) {
    name
  }
}
query {
  user2: getUser(id: 2) {
    name
  }
}
query {
  user3: getUser(id: 3) {
    name
  }
}

# 推薦：一次請求多個資料
query {
  user1: getUser(id: 1) {
    name
  }
  user2: getUser(id: 2) {
    name
  }
  user3: getUser(id: 3) {
    name
  }
}
```

---

## ⚙️ 調整速率限制

### 環境變數配置

可透過環境變數動態配置（需修改程式碼實作）：

```env
# .env
THROTTLE_SHORT_TTL=1000
THROTTLE_SHORT_LIMIT=10

THROTTLE_MEDIUM_TTL=10000
THROTTLE_MEDIUM_LIMIT=50

THROTTLE_LONG_TTL=60000
THROTTLE_LONG_LIMIT=100
```

### 針對特定端點調整

使用 `@SkipThrottle()` 或 `@Throttle()` decorator：

```typescript
import { SkipThrottle, Throttle } from '@nestjs/throttler';

@Resolver()
export class UserResolver {
  // 跳過 rate limiting（如：健康檢查）
  @SkipThrottle()
  @Query(() => String)
  health() {
    return 'OK';
  }

  // 自訂限制（如：高頻端點更嚴格）
  @Throttle({ short: { limit: 5, ttl: 1000 } })
  @Query(() => User)
  getUser() {
    // ...
  }
}
```

---

## 📈 監控與日誌

### 追蹤 Rate Limit 事件

建議在日誌系統中追蹤 rate limit 觸發：

```typescript
// 在 GraphQLThrottlerGuard 中加入日誌
@Injectable()
export class GraphQLThrottlerGuard extends ThrottlerGuard {
  protected async handleRequest(
    context: ExecutionContext,
    limit: number,
    ttl: number,
  ): Promise<boolean> {
    try {
      return await super.handleRequest(context, limit, ttl);
    } catch (error) {
      const gqlCtx = GqlExecutionContext.create(context);
      const req = gqlCtx.getContext().req;

      console.warn(
        `[Rate Limit] IP: ${req.ip}, Path: ${req.path}, Limit: ${limit}/${ttl}ms`,
      );

      throw error;
    }
  }

  getRequestResponse(context: ExecutionContext) {
    const gqlCtx = GqlExecutionContext.create(context);
    const ctx = gqlCtx.getContext();
    return { req: ctx.req, res: ctx.res };
  }
}
```

### 監控指標

建議追蹤的指標：

- 觸發 rate limit 的頻率
- 被限制的 IP 地址
- 被限制的查詢類型
- 峰值請求時段

---

## 🧪 測試

### 測試 Rate Limiting

```bash
# 快速發送 12 個請求，應該前 10 個成功，後 2 個被限制
for i in {1..12}; do
  curl -s http://localhost:4000/graphql \
    -H "Content-Type: application/json" \
    -d '{"query":"{ hello { success message } }"}' &
done
wait
```

預期結果：

- 前 10 個請求：200 OK
- 第 11、12 個請求：Too Many Requests

### 單元測試範例

```typescript
describe('Rate Limiting', () => {
  it('should allow 10 requests in 1 second', async () => {
    const promises = Array.from({ length: 10 }, () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({ query: '{ hello { success } }' }),
    );

    const results = await Promise.all(promises);
    results.forEach((result) => {
      expect(result.status).toBe(200);
    });
  });

  it('should block 11th request', async () => {
    // 先發送 10 個請求
    await Promise.all(
      Array.from({ length: 10 }, () =>
        request(app.getHttpServer())
          .post('/graphql')
          .send({ query: '{ hello { success } }' }),
      ),
    );

    // 第 11 個應該被限制
    const result = await request(app.getHttpServer())
      .post('/graphql')
      .send({ query: '{ hello { success } }' });

    expect(result.body.errors[0].message).toContain('Too Many Requests');
  });
});
```

---

## 🎯 最佳實踐

### 1. 合理設定限制值

- **太嚴格**：影響正常使用者體驗
- **太寬鬆**：無法有效防止濫用
- **建議**：根據實際流量和業務需求調整

### 2. 提供清晰的錯誤訊息

讓客戶端知道為什麼被限制以及何時可重試。

### 3. 考慮認證使用者

可為已認證使用者提供更高的限制：

```typescript
ThrottlerModule.forRoot([
  {
    name: 'anonymous',
    ttl: 60000,
    limit: 100,
  },
  {
    name: 'authenticated',
    ttl: 60000,
    limit: 1000, // 認證使用者 10 倍限制
  },
]),
```

### 4. 使用 Redis 儲存

在分散式環境中，使用 Redis 作為共享儲存：

```typescript
import { ThrottlerStorageRedisService } from '@nestjs/throttler-storage-redis';

ThrottlerModule.forRoot({
  storage: new ThrottlerStorageRedisService('redis://localhost:6379'),
  throttlers: [/* ... */],
}),
```

---

## ❓ 常見問題

### Q: Rate limiting 會影響效能嗎？

A: 影響極小。Throttler 使用記憶體內計數器，開銷很低。

### Q: 如何針對不同端點設定不同限制？

A: 使用 `@Throttle()` decorator 在個別 resolver 上覆蓋預設設定。

### Q: 可以根據使用者身份調整限制嗎？

A: 可以，實作自訂 guard 邏輯，根據使用者角色或訂閱等級調整限制。

### Q: Rate limit 資料會持久化嗎？

A: 預設使用記憶體儲存，重啟後重置。生產環境建議使用 Redis。

---

## 📖 相關資源

- [NestJS Throttler 官方文件](https://docs.nestjs.com/security/rate-limiting)
- [@nestjs/throttler GitHub](https://github.com/nestjs/throttler)
- [GraphQL 最佳實踐](../backend/GRAPHQL_BEST_PRACTICES.md)
