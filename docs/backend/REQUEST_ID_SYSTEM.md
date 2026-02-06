# Request ID 追蹤系統 (Request ID System)

使用 UUID v7 唯一識別每個請求，支援完整的請求追蹤和除錯。

---

## 📋 目錄

- [Request ID 追蹤系統 (Request ID System)](#request-id-追蹤系統-request-id-system)
  - [📋 目錄](#-目錄)
  - [📖 概述](#-概述)
    - [為什麼需要 Request ID？](#為什麼需要-request-id)
    - [核心特性](#核心特性)
  - [📐 Request ID 格式](#-request-id-格式)
    - [UUID v7](#uuid-v7)
  - [🏗️ 系統架構](#️-系統架構)
    - [架構圖](#架構圖)
    - [核心組件](#核心組件)
  - [🔧 實現細節](#-實現細節)
    - [1. Request ID Interceptor](#1-request-id-interceptor)
    - [2. Request ID Decorator](#2-request-id-decorator)
    - [3. GraphQL Plugin](#3-graphql-plugin)
  - [📝 使用方式](#-使用方式)
    - [前端發送請求](#前端發送請求)
      - [自動生成（推薦）](#自動生成推薦)
      - [自訂 Request ID](#自訂-request-id)
    - [後端使用 Request ID](#後端使用-request-id)
      - [Controller 層](#controller-層)
      - [Service 層](#service-層)
      - [GraphQL Resolver](#graphql-resolver)
  - [🔗 與審計日誌整合](#-與審計日誌整合)
    - [自動關聯](#自動關聯)
    - [查詢追蹤](#查詢追蹤)
    - [錯誤追蹤](#錯誤追蹤)
  - [🎯 最佳實踐](#-最佳實踐)
    - [✅ DO - 應該這樣做](#-do---應該這樣做)
      - [1. 在所有日誌中使用 Request ID](#1-在所有日誌中使用-request-id)
      - [2. 傳遞 Request ID 到下游服務](#2-傳遞-request-id-到下游服務)
      - [3. 在錯誤訊息中包含 Request ID](#3-在錯誤訊息中包含-request-id)
      - [4. 客戶端儲存 Request ID](#4-客戶端儲存-request-id)
    - [❌ DON'T - 不要這樣做](#-dont---不要這樣做)
      - [1. 不要忘記處理 Request ID 缺失](#1-不要忘記處理-request-id-缺失)
      - [2. 不要在 Request ID 中包含敏感資訊](#2-不要在-request-id-中包含敏感資訊)
      - [3. 不要手動生成不相容的格式](#3-不要手動生成不相容的格式)
  - [📚 相關文檔](#-相關文檔)

---

## 📖 概述

Request ID 是一個唯一識別符，用於追蹤單一請求在系統中的完整生命週期。它是分散式系統追蹤和除錯的關鍵工具。

### 為什麼需要 Request ID？

| 場景           | 無 Request ID      | 有 Request ID            |
| -------------- | ------------------ | ------------------------ |
| **除錯錯誤**   | 在數千條日誌中搜尋 | 直接過濾單一請求         |
| **效能分析**   | 難以追蹤完整路徑   | 清楚看到每個步驟         |
| **跨服務追蹤** | 無法關聯請求       | 統一識別符               |
| **客戶支援**   | 難以重現問題       | 提供 Request ID 即可查詢 |

### 核心特性

- ✅ **自動生成** - 每個請求自動分配 UUID v7
- ✅ **客戶端傳遞** - 支援客戶端自訂 Request ID
- ✅ **HTTP/GraphQL 統一** - 兩種協議都支援
- ✅ **日誌整合** - 所有日誌都包含 Request ID
- ✅ **審計追蹤** - 與審計日誌系統完整整合
- ✅ **回應返回** - Request ID 回傳給客戶端

---

## 📐 Request ID 格式

### UUID v7

Wind 專案使用 **UUID v7** 作為 Request ID 格式。

**格式特性**:

```text
01930f8e-4b2e-7890-a123-456789abcdef
└─────┬─────┘└┬┘ └──┬──┘ └─────┬─────┘
  時間戳記   版本  隨機   隨機部分
```

**優勢**:

- ✅ **可排序** - 基於時間戳記，按生成時間排序
- ✅ **唯一性** - 極低碰撞機率（2^128 種可能）
- ✅ **包含時間** - 可從 ID 中提取建立時間
- ✅ **資料庫友善** - 作為主鍵效能良好

**與其他版本比較**:

| 版本        | 特性                        | 適用場景               |
| ----------- | --------------------------- | ---------------------- |
| UUID v4     | 純隨機                      | 通用唯一識別           |
| **UUID v7** | 時間 + 隨機（✅ Wind 使用） | **請求追蹤、審計日誌** |
| ULID        | 可讀性更高                  | 需要人類閱讀的場景     |

---

## 🏗️ 系統架構

### 架構圖

```text
┌──────────────────────────────────────────────────────────┐
│                      客戶端請求                            │
│  Header: x-request-id (可選)                              │
└──────────────────────┬───────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────┐
│              RequestIdInterceptor                         │
│  1. 檢查 x-request-id header                              │
│  2. 有則使用，無則生成 UUID v7                             │
│  3. 儲存到 req.requestId 或 GraphQL context               │
└──────────────────────┬───────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────┐
│                  應用處理層                                │
│  • Controller (@RequestId() decorator)                   │
│  • Service (使用 requestId 記錄日誌)                       │
│  • Exception Filter (錯誤日誌包含 requestId)              │
└──────────────────────┬───────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────┐
│              AuditLogInterceptor                          │
│  記錄完整請求/回應，關聯 requestId                          │
└──────────────────────┬───────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────┐
│                   回應給客戶端                             │
│  Header: X-Request-ID                                     │
│  Body: { requestId: "uuid-v7" }                          │
└──────────────────────────────────────────────────────────┘
```

### 核心組件

| 組件                     | 位置                                             | 職責                            |
| ------------------------ | ------------------------------------------------ | ------------------------------- |
| **RequestIdInterceptor** | `/common/interceptors/request-id.interceptor.ts` | 生成/提取 Request ID            |
| **RequestIdPlugin**      | `/common/plugins/request-id.plugin.ts`           | GraphQL Apollo 插件             |
| **RequestIdDecorator**   | `/common/decorators/request-id.decorator.ts`     | 在 Controller 中注入 Request ID |
| **AllExceptionsFilter**  | `/common/filters/all-exceptions.filter.ts`       | 錯誤處理時記錄 Request ID       |
| **AuditLogInterceptor**  | `/audit-log/audit-log.interceptor.ts`            | 審計日誌關聯 Request ID         |

---

## 🔧 實現細節

### 1. Request ID Interceptor

`/src/common/interceptors/request-id.interceptor.ts`

```typescript
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { uuidv7 } from 'uuidv7';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class RequestIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const contextType = context.getType<'http' | 'graphql'>();

    if (contextType === 'http') {
      return this.handleHttp(context, next);
    } else if (contextType === 'graphql') {
      return this.handleGraphql(context, next);
    }

    return next.handle();
  }

  private handleHttp(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    // 從 header 獲取或生成新 Request ID
    const requestId = request.headers['x-request-id'] || uuidv7();
    request.requestId = requestId;

    // 設定回應 header
    response.setHeader('X-Request-ID', requestId);

    return next.handle();
  }

  private handleGraphql(context: ExecutionContext, next: CallHandler) {
    const gqlContext = GqlExecutionContext.create(context);
    const ctx = gqlContext.getContext();

    // 從 GraphQL context 或 header 獲取
    const requestId = ctx.req?.headers['x-request-id'] || uuidv7();
    ctx.requestId = requestId;

    if (ctx.res) {
      ctx.res.setHeader('X-Request-ID', requestId);
    }

    return next.handle();
  }
}
```

**特性**:

- ✅ 同時支援 HTTP 和 GraphQL
- ✅ 優先使用客戶端提供的 Request ID
- ✅ 自動生成 UUID v7
- ✅ 設定回應 header

### 2. Request ID Decorator

`/src/common/decorators/request-id.decorator.ts`

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const RequestId = createParamDecorator(
  (data: unknown, context: ExecutionContext): string => {
    const contextType = context.getType<'http' | 'graphql'>();

    if (contextType === 'http') {
      const request = context.switchToHttp().getRequest();
      return request.requestId;
    }

    if (contextType === 'graphql') {
      const ctx = GqlExecutionContext.create(context).getContext();
      return ctx.requestId;
    }

    return '';
  },
);
```

**使用範例**:

```typescript
@Query(() => User)
async getUser(
  @Args('id') id: string,
  @RequestId() requestId: string  // 自動注入
) {
  this.logger.log(`[${requestId}] Fetching user ${id}`);
  return this.userService.findOne(id);
}
```

### 3. GraphQL Plugin

`/src/common/plugins/request-id.plugin.ts`

```typescript
import { ApolloServerPlugin } from '@apollo/server';
import { Plugin } from '@nestjs/apollo';
import { uuidv7 } from 'uuidv7';

@Plugin()
export class RequestIdPlugin implements ApolloServerPlugin {
  async requestDidStart(requestContext) {
    const requestId =
      requestContext.request.http?.headers.get('x-request-id') || uuidv7();

    requestContext.contextValue.requestId = requestId;

    return {
      async willSendResponse(responseContext) {
        // 在回應中加入 Request ID
        responseContext.response.http?.headers.set('X-Request-ID', requestId);
      },
    };
  }
}
```

---

## 📝 使用方式

### 前端發送請求

#### 自動生成（推薦）

```typescript
// 不傳遞 x-request-id，後端自動生成
const response = await fetch('/api/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ query: '...' }),
});

// 從回應 header 取得 Request ID
const requestId = response.headers.get('X-Request-ID');
console.log('Request ID:', requestId);
```

#### 自訂 Request ID

```typescript
// 客戶端生成 Request ID（用於追蹤）
import { uuidv4 } from 'uuid';

const clientRequestId = uuidv4();

const response = await fetch('/api/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-request-id': clientRequestId, // 自訂 Request ID
  },
  body: JSON.stringify({ query: '...' }),
});
```

### 後端使用 Request ID

#### Controller 層

```typescript
import { Controller, Get, Param } from '@nestjs/common';
import { RequestId } from '@/common/decorators/request-id.decorator';

@Controller('users')
export class UserController {
  @Get(':id')
  async getUser(@Param('id') id: string, @RequestId() requestId: string) {
    this.logger.log(`[${requestId}] Fetching user ${id}`);

    try {
      const user = await this.userService.findOne(id);
      return user;
    } catch (error) {
      this.logger.error(`[${requestId}] Error fetching user: ${error.message}`);
      throw error;
    }
  }
}
```

#### Service 層

```typescript
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  async findOne(id: string, requestId?: string) {
    const prefix = requestId ? `[${requestId}]` : '';

    this.logger.log(`${prefix} Querying user ${id} from database`);

    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      this.logger.warn(`${prefix} User ${id} not found`);
      return null;
    }

    return user;
  }
}
```

#### GraphQL Resolver

```typescript
import { Resolver, Query, Args } from '@nestjs/graphql';
import { RequestId } from '@/common/decorators/request-id.decorator';

@Resolver()
export class UserResolver {
  @Query(() => User)
  async user(@Args('id') id: string, @RequestId() requestId: string) {
    this.logger.log(`[${requestId}] GraphQL query: user(${id})`);
    return this.userService.findOne(id, requestId);
  }
}
```

---

## 🔗 與審計日誌整合

### 自動關聯

**所有審計日誌都會自動記錄 Request ID**：

```typescript
// AuditLogInterceptor 自動提取 Request ID
const requestId = req.requestId || context.requestId;

await this.auditLogService.create({
  requestId, // 關鍵關聯欄位
  userId,
  action: 'READ',
  entity: 'User',
  entityId: '123',
  status: 'SUCCESS',
  // ...
});
```

### 查詢追蹤

```typescript
// 透過 Request ID 查詢所有相關日誌
const logs = await this.auditLogService.findByRequestId(
  '01930f8e-4b2e-7890-a123-456789abcdef',
);

// 結果：單一請求的完整操作鏈
[
  {
    action: 'READ',
    entity: 'User',
    timestamp: '2026-01-30T00:00:01.000Z',
    duration: 45,
  },
  {
    action: 'UPDATE',
    entity: 'UserProfile',
    timestamp: '2026-01-30T00:00:02.000Z',
    duration: 123,
  },
];
```

### 錯誤追蹤

```typescript
// 錯誤處理時記錄 Request ID
try {
  await this.userService.updateUser(id, data);
} catch (error) {
  this.logger.error(
    `[${requestId}] Failed to update user ${id}: ${error.message}`,
    error.stack,
  );

  // 審計日誌自動記錄錯誤
  throw error;
}
```

---

## 🎯 最佳實踐

### ✅ DO - 應該這樣做

#### 1. 在所有日誌中使用 Request ID

```typescript
// ✅ 好：一致的格式
this.logger.log(`[${requestId}] User login successful`);
this.logger.error(`[${requestId}] Database connection failed`);
this.logger.warn(`[${requestId}] Rate limit approaching`);
```

#### 2. 傳遞 Request ID 到下游服務

```typescript
// ✅ 好：微服務間傳遞 Request ID
async callExternalService(data: any, requestId: string) {
  return await this.httpService.post('/api/endpoint', data, {
    headers: {
      'x-request-id': requestId,  // 傳遞給下游
    },
  });
}
```

#### 3. 在錯誤訊息中包含 Request ID

```typescript
// ✅ 好：用戶可提供 Request ID 給客服
throw new BadRequestException({
  message: '操作失敗',
  requestId,
  timestamp: new Date().toISOString(),
});
```

#### 4. 客戶端儲存 Request ID

```typescript
// ✅ 好：用於除錯和客服
const response = await apiClient.query(...);
const requestId = response.headers.get('X-Request-ID');

// 儲存到 local storage 或日誌
console.log('Last request ID:', requestId);
localStorage.setItem('lastRequestId', requestId);
```

### ❌ DON'T - 不要這樣做

#### 1. 不要忘記處理 Request ID 缺失

```typescript
// ❌ 錯誤：假設 Request ID 總是存在
this.logger.log(`[${requestId}] Processing...`); // requestId 可能 undefined

// ✅ 正確：提供預設值
const id = requestId || 'unknown';
this.logger.log(`[${id}] Processing...`);
```

#### 2. 不要在 Request ID 中包含敏感資訊

```typescript
// ❌ 錯誤：包含使用者資訊
const requestId = `user-${userId}-${timestamp}`;

// ✅ 正確：使用純粹的 UUID
const requestId = uuidv7();
```

#### 3. 不要手動生成不相容的格式

```typescript
// ❌ 錯誤：自訂格式
const requestId = `req-${Date.now()}`;

// ✅ 正確：使用 UUID v7
import { uuidv7 } from 'uuidv7';
const requestId = uuidv7();
```

---

## 📚 相關文檔

- [AUDIT_LOG_SYSTEM.md](./AUDIT_LOG_SYSTEM.md) - 審計日誌系統
- [API_RESPONSE_FORMAT.md](./API_RESPONSE_FORMAT.md) - API 回應格式
- [CACHING_STRATEGY.md](./CACHING_STRATEGY.md) - 快取策略
