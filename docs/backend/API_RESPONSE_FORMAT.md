# API 回應格式規範 (API Response Format)

統一的 GraphQL 和 HTTP API 回應格式規範，確保一致性和可追蹤性。

---

## 📋 目錄

- [API 回應格式規範 (API Response Format)](#api-回應格式規範-api-response-format)
  - [📋 目錄](#-目錄)
  - [📖 概述](#-概述)
    - [核心原則](#核心原則)
  - [📐 BaseResponse 統一格式](#-baseresponse-統一格式)
    - [定義位置](#定義位置)
    - [泛型工廠函數](#泛型工廠函數)
    - [欄位說明](#欄位說明)
  - [✨ 成功回應](#-成功回應)
    - [基本成功回應](#基本成功回應)
    - [無資料的成功回應](#無資料的成功回應)
    - [GraphQL Query 範例](#graphql-query-範例)
  - [🚨 錯誤回應](#-錯誤回應)
    - [ErrorDetail 結構](#errordetail-結構)
    - [常見錯誤代碼](#常見錯誤代碼)
    - [單一錯誤範例](#單一錯誤範例)
    - [驗證錯誤範例（多個欄位）](#驗證錯誤範例多個欄位)
    - [GraphQL 錯誤範例](#graphql-錯誤範例)
  - [📊 分頁回應](#-分頁回應)
    - [PaginatedResponse 定義](#paginatedresponse-定義)
    - [PageInfo 結構](#pageinfo-結構)
    - [分頁回應範例](#分頁回應範例)
    - [GraphQL 分頁 Query](#graphql-分頁-query)
  - [🔧 GraphQL 特殊處理](#-graphql-特殊處理)
    - [AllExceptionsFilter 統一異常處理](#allexceptionsfilter-統一異常處理)
      - [HTTP 異常回應](#http-異常回應)
      - [GraphQL 異常回應](#graphql-異常回應)
    - [Union Types（聯合類型）](#union-types聯合類型)
  - [🔍 Request ID 追蹤](#-request-id-追蹤)
    - [自動生成 Request ID](#自動生成-request-id)
    - [使用方式](#使用方式)
      - [前端發送請求](#前端發送請求)
      - [後端記錄日誌](#後端記錄日誌)
      - [審計日誌整合](#審計日誌整合)
  - [🎯 最佳實踐](#-最佳實踐)
    - [✅ DO - 應該這樣做](#-do---應該這樣做)
      - [1. 明確的成功訊息](#1-明確的成功訊息)
      - [2. 詳細的錯誤資訊](#2-詳細的錯誤資訊)
      - [3. 使用泛型回應類型](#3-使用泛型回應類型)
      - [4. 記錄 Request ID](#4-記錄-request-id)
    - [❌ DON'T - 不要這樣做](#-dont---不要這樣做)
      - [1. 不要暴露內部錯誤](#1-不要暴露內部錯誤)
      - [2. 不要混用回應格式](#2-不要混用回應格式)
      - [3. 不要忽略錯誤詳情](#3-不要忽略錯誤詳情)
  - [📚 相關文檔](#-相關文檔)

---

## 📖 概述

Starter 專案採用 **GraphQL-first** 設計，使用統一的泛型回應格式 `BaseResponse<T>`，確保所有 API 回應結構一致。

### 核心原則

- ✅ 統一的回應結構（success, message, data, errors, requestId）
- ✅ 泛型設計，支援任意資料類型
- ✅ 完整的錯誤詳情（code, message, field, details）
- ✅ Request ID 追蹤每個請求
- ✅ GraphQL 和 HTTP 統一處理

---

## 📐 BaseResponse 統一格式

### 定義位置

`/apps/backend/src/common/types/response.types.ts`

### 泛型工廠函數

```typescript
export function BaseResponse<T>(classRef: Type<T>) {
  @ObjectType({ isAbstract: true })
  abstract class BaseResponseClass {
    @Field(() => Boolean)
    success: boolean; // 操作是否成功

    @Field(() => String, { nullable: true })
    message?: string; // 人類可讀的訊息

    @Field(() => classRef, { nullable: true })
    data?: T; // 實際資料（泛型）

    @Field(() => [ErrorDetail], { nullable: true })
    errors?: ErrorDetail[]; // 錯誤詳情陣列

    @Field(() => String, { nullable: true })
    requestId?: string; // 請求追蹤 ID
  }
  return BaseResponseClass;
}
```

### 欄位說明

| 欄位        | 類型          | 必填 | 說明                 |
| ----------- | ------------- | ---- | -------------------- |
| `success`   | Boolean       | ✅   | 操作是否成功         |
| `message`   | String        | ❌   | 操作結果訊息（中文） |
| `data`      | T             | ❌   | 實際回應資料（泛型） |
| `errors`    | ErrorDetail[] | ❌   | 錯誤詳情列表         |
| `requestId` | String        | ❌   | 請求追蹤 ID          |

---

## ✨ 成功回應

### 基本成功回應

```json
{
  "success": true,
  "message": "操作成功",
  "data": {
    "id": "01930c8f-4b2e-7890-a123-456789abcdef",
    "name": "張三",
    "email": "user@example.com"
  },
  "requestId": "req-1234567890"
}
```

### 無資料的成功回應

```json
{
  "success": true,
  "message": "刪除成功",
  "requestId": "req-1234567890"
}
```

### GraphQL Query 範例

```graphql
query {
  user(id: "01930c8f-4b2e-7890-a123-456789abcdef") {
    id
    name
    email
    createdAt
  }
}
```

**回應**:

```json
{
  "data": {
    "user": {
      "id": "01930c8f-4b2e-7890-a123-456789abcdef",
      "name": "張三",
      "email": "user@example.com",
      "createdAt": "2026-01-30T00:00:00.000Z"
    }
  }
}
```

---

## 🚨 錯誤回應

### ErrorDetail 結構

```typescript
@ObjectType()
export class ErrorDetail {
  @Field(() => String)
  code: string; // 錯誤代碼

  @Field(() => String)
  message: string; // 錯誤訊息

  @Field(() => String, { nullable: true })
  field?: string; // 相關欄位（驗證錯誤時使用）

  @Field(() => GraphQLJSON, { nullable: true })
  details?: any; // 額外詳情
}
```

### 常見錯誤代碼

| Code                  | HTTP Status | 說明         | 使用時機         |
| --------------------- | ----------- | ------------ | ---------------- |
| `VALIDATION_ERROR`    | 400         | 輸入驗證失敗 | 欄位格式錯誤     |
| `UNAUTHENTICATED`     | 401         | 未認證       | Token 無效或過期 |
| `FORBIDDEN`           | 403         | 無權限       | 權限不足         |
| `NOT_FOUND`           | 404         | 資源不存在   | 查詢資料不存在   |
| `CONFLICT`            | 409         | 資源衝突     | Email 已存在     |
| `RATE_LIMIT_EXCEEDED` | 429         | 超過速率限制 | API 呼叫過於頻繁 |
| `INTERNAL_ERROR`      | 500         | 伺服器錯誤   | 未預期的錯誤     |

### 單一錯誤範例

```json
{
  "success": false,
  "message": "使用者不存在",
  "errors": [
    {
      "code": "NOT_FOUND",
      "message": "找不到指定的使用者"
    }
  ],
  "requestId": "req-1234567890"
}
```

### 驗證錯誤範例（多個欄位）

```json
{
  "success": false,
  "message": "驗證失敗",
  "errors": [
    {
      "code": "VALIDATION_ERROR",
      "message": "Email 格式不正確",
      "field": "email"
    },
    {
      "code": "VALIDATION_ERROR",
      "message": "密碼長度至少 8 個字元",
      "field": "password"
    }
  ],
  "requestId": "req-1234567890"
}
```

### GraphQL 錯誤範例

```json
{
  "errors": [
    {
      "message": "使用者不存在",
      "extensions": {
        "code": "NOT_FOUND",
        "requestId": "req-1234567890",
        "timestamp": "2026-01-30T00:00:00.000Z",
        "http": {
          "status": 404
        }
      }
    }
  ],
  "data": null
}
```

---

## 📊 分頁回應

### PaginatedResponse 定義

```typescript
export function PaginatedResponse<T>(classRef: Type<T>) {
  @ObjectType()
  abstract class PaginatedResponseClass extends BaseResponse(classRef) {
    @Field(() => [classRef], { nullable: true })
    items?: T[]; // 資料列表

    @Field(() => PaginationInfo, { nullable: true })
    pagination?: PaginationInfo; // 分頁資訊
  }
  return PaginatedResponseClass;
}
```

### PageInfo 結構

```typescript
@ObjectType()
export class PageInfo {
  @Field(() => Int)
  currentPage: number; // 當前頁碼（從 1 開始）

  @Field(() => Int)
  totalPages: number; // 總頁數

  @Field(() => Int)
  totalCount: number; // 總筆數

  @Field(() => Int)
  limit: number; // 每頁筆數

  @Field()
  hasNextPage: boolean; // 是否有下一頁

  @Field()
  hasPreviousPage: boolean; // 是否有上一頁
}
```

### 分頁回應範例

```json
{
  "data": {
    "usersPaginated": {
      "data": [
        {
          "id": "01930c8f-4b2e-7890-a123-456789abcdef",
          "name": "張三",
          "email": "user1@example.com"
        },
        {
          "id": "01930c90-5c3f-8901-b234-567890bcdefg",
          "name": "李四",
          "email": "user2@example.com"
        }
      ],
      "pageInfo": {
        "currentPage": 1,
        "totalPages": 5,
        "totalCount": 100,
        "limit": 20,
        "hasNextPage": true,
        "hasPreviousPage": false
      }
    }
  }
}
```

### GraphQL 分頁 Query

```graphql
query {
  usersPaginated(pagination: { page: 1, limit: 20 }) {
    data {
      id
      name
      email
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

**詳細分頁實作請參考**: [PAGINATION_GUIDE.md](./PAGINATION_GUIDE.md)

---

## 🔧 GraphQL 特殊處理

### AllExceptionsFilter 統一異常處理

位置: `/apps/backend/src/common/filters/all-exceptions.filter.ts`

#### HTTP 異常回應

```json
{
  "statusCode": 404,
  "timestamp": "2026-01-30T00:00:00.000Z",
  "path": "/api/users/123",
  "requestId": "req-1234567890",
  "message": "使用者不存在"
}
```

#### GraphQL 異常回應

```json
{
  "errors": [
    {
      "message": "使用者不存在",
      "extensions": {
        "code": "NOT_FOUND",
        "requestId": "req-1234567890",
        "timestamp": "2026-01-30T00:00:00.000Z",
        "http": {
          "status": 404
        },
        "details": {
          "userId": "123"
        }
      }
    }
  ]
}
```

### Union Types（聯合類型）

用於處理多種可能的回應類型：

```typescript
// 登入可能回傳 AuthResponse 或 TwoFactorLoginResponse
@Mutation(() => LoginUnion)
async login(@Args('email') email: string, @Args('password') password: string) {
  // 實作邏輯
}
```

**GraphQL Schema**:

```graphql
union LoginResult = AuthResponse | TwoFactorLoginResponse

mutation Login {
  login(email: "user@example.com", password: "password") {
    ... on AuthResponse {
      __typename
      accessToken
      refreshToken
    }
    ... on TwoFactorLoginResponse {
      __typename
      requiresTwoFactor
      temporaryToken
      message
    }
  }
}
```

---

## 🔍 Request ID 追蹤

### 自動生成 Request ID

每個請求都會自動生成唯一的 Request ID：

- **格式**: `req-{timestamp}-{randomString}`
- **位置**: HTTP Header `x-request-id`
- **用途**: 追蹤請求、錯誤排查、審計日誌

### 使用方式

#### 前端發送請求

```typescript
// 可選：客戶端自訂 Request ID
const response = await fetch('/api/graphql', {
  headers: {
    'x-request-id': 'custom-request-id',
    Authorization: 'Bearer token...',
  },
});
```

#### 後端記錄日誌

```typescript
logger.error(`[${requestId}] 使用者不存在`, { userId: '123' });
```

#### 審計日誌整合

所有審計日誌都會記錄 Request ID，便於追蹤：

```sql
SELECT * FROM audit_logs WHERE request_id = 'req-1234567890';
```

---

## 🎯 最佳實踐

### ✅ DO - 應該這樣做

#### 1. 明確的成功訊息

```typescript
return {
  success: true,
  message: '使用者建立成功',
  data: user,
};
```

#### 2. 詳細的錯誤資訊

```typescript
throw new BadRequestException({
  code: 'VALIDATION_ERROR',
  message: 'Email 已被使用',
  field: 'email',
  details: { email: input.email },
});
```

#### 3. 使用泛型回應類型

```typescript
@ObjectType()
export class CreateUserResponse extends BaseResponse(UserType) {}
```

#### 4. 記錄 Request ID

```typescript
logger.info(`[${requestId}] 使用者登入成功`, { userId: user.id });
```

### ❌ DON'T - 不要這樣做

#### 1. 不要暴露內部錯誤

```typescript
// ❌ 錯誤
throw new Error('Prisma error: P2002 Unique constraint failed');

// ✅ 正確
throw new ConflictException('Email 已被使用');
```

#### 2. 不要混用回應格式

```typescript
// ❌ 錯誤
return { user, token };

// ✅ 正確
return {
  success: true,
  data: { user, token },
};
```

#### 3. 不要忽略錯誤詳情

```typescript
// ❌ 錯誤
throw new BadRequestException('驗證失敗');

// ✅ 正確
throw new BadRequestException({
  code: 'VALIDATION_ERROR',
  message: '驗證失敗',
  errors: [
    { field: 'email', message: 'Email 格式不正確' },
    { field: 'password', message: '密碼長度至少 8 個字元' },
  ],
});
```

---

## 📚 相關文檔

- [PAGINATION_GUIDE.md](./PAGINATION_GUIDE.md) - 分頁實現指南
- [AUDIT_LOG_SYSTEM.md](../infrastructure/AUDIT_LOG_SYSTEM.md) - 審計日誌系統
- [FIELD_AUTHORIZATION.md](../authentication/FIELD_AUTHORIZATION.md) - GraphQL 欄位權限
- [RBAC_ARCHITECTURE.md](../authentication/RBAC_ARCHITECTURE.md) - 角色權限架構
