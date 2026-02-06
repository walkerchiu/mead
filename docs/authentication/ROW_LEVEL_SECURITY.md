# Row-Level Security (RLS) - 行級別安全控制

基於訪問範圍的資料行級別過濾，確保使用者只能查看其有權限存取的資料。

---

## 📋 目錄

- [Row-Level Security (RLS) - 行級別安全控制](#row-level-security-rls---行級別安全控制)
  - [📋 目錄](#-目錄)
  - [📖 概述](#-概述)
  - [🎯 訪問規則](#-訪問規則)
    - [AccessScope 訪問矩陣](#accessscope-訪問矩陣)
    - [視覺化權限樹](#視覺化權限樹)
  - [🔧 技術實現](#-技術實現)
    - [1. Service 層過濾](#1-service-層過濾)
    - [2. Resolver 層應用](#2-resolver-層應用)
    - [3. Prisma 查詢過濾](#3-prisma-查詢過濾)
  - [📝 實際應用範例](#-實際應用範例)
    - [範例 1: Admin 查詢所有使用者](#範例-1-admin-查詢所有使用者)
    - [範例 2: Customer 查詢使用者](#範例-2-customer-查詢使用者)
    - [範例 3: Public 查詢使用者](#範例-3-public-查詢使用者)
  - [🔗 關聯查詢處理](#-關聯查詢處理)
  - [🔧 配置選項](#-配置選項)
    - [UserQueryContext 介面](#userquerycontext-介面)
    - [擴展 RLS 規則](#擴展-rls-規則)
  - [🧪 測試](#-測試)
    - [測試不同權限的查詢](#測試不同權限的查詢)
      - [1. 使用 Admin Token 測試](#1-使用-admin-token-測試)
      - [2. 使用 Customer Token 測試](#2-使用-customer-token-測試)
  - [🔒 安全性考量](#-安全性考量)
    - [✅ 已實現的保護](#-已實現的保護)
    - [⚠️ 注意事項](#️-注意事項)
  - [🔄 與其他安全機制的關係](#-與其他安全機制的關係)
  - [⚡ 效能考量](#-效能考量)
  - [📖 相關文檔](#-相關文檔)

---

## 📖 概述

Row-Level Security (RLS) 是一種資料庫級別的安全機制，根據使用者的身份和權限自動過濾查詢結果。本系統在應用層實現了 RLS，確保使用者只能查看其有權限存取的資料。

> **🔗 相關文檔**
>
> - [RBAC 架構](./RBAC_ARCHITECTURE.md) - 角色權限基礎架構（含完整架構圖）
> - [Field-Level Authorization](./FIELD_AUTHORIZATION.md) - 欄位級別權限控制
>
> **安全層級關係**: Endpoint (PermissionGuard) → **Row-Level (本文檔)** → Field-Level (FieldAuthPlugin)

---

## 🎯 訪問規則

### AccessScope 訪問矩陣

| AccessScope        | 可查看的帳號 AccessScope      | 說明                                      |
| ------------------ | ----------------------------- | ----------------------------------------- |
| **ADMIN_SCOPE**    | ALL (ADMIN, CUSTOMER, PUBLIC) | 管理員可以查看所有帳號                    |
| **CUSTOMER_SCOPE** | CUSTOMER, PUBLIC              | Customer 可以查看 Customer 和 Public 帳號 |
| **PUBLIC_SCOPE**   | PUBLIC only                   | Public 使用者只能查看 Public 帳號         |
| **未認證**         | PUBLIC only                   | 未登入使用者只能查看 Public 帳號          |

### 視覺化權限樹

```text
ADMIN_SCOPE (最高權限)
    ├── 可查看 ADMIN_SCOPE 帳號
    ├── 可查看 CUSTOMER_SCOPE 帳號
    └── 可查看 PUBLIC_SCOPE 帳號

CUSTOMER_SCOPE (中等權限)
    ├── 可查看 CUSTOMER_SCOPE 帳號
    └── 可查看 PUBLIC_SCOPE 帳號

PUBLIC_SCOPE (基本權限)
    └── 可查看 PUBLIC_SCOPE 帳號

未認證 (無權限)
    └── 可查看 PUBLIC_SCOPE 帳號
```

---

## 🔧 技術實現

### 1. Service 層過濾

在 `UserService` 中實現 `buildAccessScopeFilter()` 方法：

```typescript
/**
 * 根據使用者的 accessScopes 建立資料過濾條件
 */
private buildAccessScopeFilter(context?: UserQueryContext) {
  if (!context || !context.accessScopes || context.accessScopes.length === 0) {
    // 未認證的使用者，只能查詢 PUBLIC_SCOPE
    return {
      accessScopes: {
        hasSome: [AccessScope.PUBLIC_SCOPE],
      },
    };
  }

  const accessScopes = context.accessScopes;

  // ADMIN 可以查詢所有帳號
  if (accessScopes.includes(AccessScope.ADMIN_SCOPE)) {
    return {}; // 無過濾條件
  }

  // CUSTOMER 可以查詢 CUSTOMER_SCOPE 和 PUBLIC_SCOPE
  if (accessScopes.includes(AccessScope.CUSTOMER_SCOPE)) {
    return {
      accessScopes: {
        hasSome: [AccessScope.CUSTOMER_SCOPE, AccessScope.PUBLIC_SCOPE],
      },
    };
  }

  // PUBLIC 只能查詢 PUBLIC_SCOPE
  if (accessScopes.includes(AccessScope.PUBLIC_SCOPE)) {
    return {
      accessScopes: {
        hasSome: [AccessScope.PUBLIC_SCOPE],
      },
    };
  }

  // 預設：無權限查看任何資料
  return {
    id: 'impossible-id-to-match',
  };
}
```

### 2. Resolver 層應用

在 `UserResolver` 中傳遞使用者上下文：

```typescript
@Query(() => PaginatedUsers)
@UseGuards(PermissionGuard)
@RequiresAnyScope([AccessScope.ADMIN_SCOPE, AccessScope.CUSTOMER_SCOPE])
@RequiresPermission('users:list')
async usersPaginated(
  @Args('pagination') pagination: PaginationInput,
  @Context() context: any,
): Promise<PaginatedUsers> {
  // 提取使用者權限上下文
  const userContext = {
    accessScopes: context.req?.user?.accessScopes || [],
    userId: context.req?.user?.userId,
  };

  return this.userService.findAllUsersPaginated(
    pagination.page,
    pagination.limit,
    false,
    userContext, // 傳遞上下文
  );
}
```

### 3. Prisma 查詢過濾

在 Prisma 查詢中應用過濾條件：

```typescript
const where = {
  ...baseWhere,
  ...accessScopeFilter, // RLS 過濾條件
};

const users = await this.prisma.user.findMany({
  where,
  include: {
    profile: true, // 關聯查詢也會被過濾
  },
});
```

---

## 📝 實際應用範例

### 範例 1: Admin 查詢所有使用者

```graphql
# Admin Token (accessScopes: [ADMIN_SCOPE])
query {
  usersPaginated(pagination: { page: 1, limit: 10 }) {
    data {
      id
      email
      accessScopes
    }
    pageInfo {
      totalCount
    }
  }
}
```

**結果**: 返回所有使用者，包括 ADMIN、CUSTOMER、PUBLIC

```json
{
  "data": {
    "usersPaginated": {
      "data": [
        { "email": "admin@example.com", "accessScopes": ["ADMIN_SCOPE"] },
        { "email": "customer@example.com", "accessScopes": ["CUSTOMER_SCOPE"] },
        { "email": "public@example.com", "accessScopes": ["PUBLIC_SCOPE"] }
      ],
      "pageInfo": { "totalCount": 3 }
    }
  }
}
```

### 範例 2: Customer 查詢使用者

```graphql
# Customer Token (accessScopes: [CUSTOMER_SCOPE])
query {
  usersPaginated(pagination: { page: 1, limit: 10 }) {
    data {
      id
      email
      accessScopes
    }
  }
}
```

**結果**: 只返回 CUSTOMER 和 PUBLIC 使用者

```json
{
  "data": {
    "usersPaginated": {
      "data": [
        { "email": "customer@example.com", "accessScopes": ["CUSTOMER_SCOPE"] },
        { "email": "public@example.com", "accessScopes": ["PUBLIC_SCOPE"] }
      ]
    }
  }
}
```

### 範例 3: Public 查詢使用者

```graphql
# Public Token (accessScopes: [PUBLIC_SCOPE])
query {
  usersPaginated(pagination: { page: 1, limit: 10 }) {
    data {
      id
      email
      accessScopes
    }
  }
}
```

**結果**: 只返回 PUBLIC 使用者

```json
{
  "data": {
    "usersPaginated": {
      "data": [
        { "email": "public@example.com", "accessScopes": ["PUBLIC_SCOPE"] }
      ]
    }
  }
}
```

---

## 🔗 關聯查詢處理

RLS 規則**自動適用於關聯查詢**：

```graphql
query {
  usersPaginated {
    data {
      id
      email
      profile {
        # 關聯的 profile 也會被 RLS 過濾
        phone
        address
      }
    }
  }
}
```

當查詢 user 時，如果該 user 不符合 RLS 規則，則：

- User 本身不會被返回
- 其關聯的 profile 也不會被返回

---

## 🔧 配置選項

### UserQueryContext 介面

```typescript
export interface UserQueryContext {
  accessScopes?: AccessScope[]; // 使用者的訪問範圍
  userId?: string; // 使用者 ID（用於未來擴展）
}
```

### 擴展 RLS 規則

如需添加更複雜的規則（例如：組織隔離、地區隔離），可以擴展 `buildAccessScopeFilter()` 方法：

```typescript
private buildAccessScopeFilter(context?: UserQueryContext) {
  // ... 現有邏輯 ...

  // 添加組織過濾
  if (context.organizationId) {
    return {
      ...accessScopeFilter,
      organizationId: context.organizationId,
    };
  }

  // 添加地區過濾
  if (context.region) {
    return {
      ...accessScopeFilter,
      region: context.region,
    };
  }
}
```

---

## 🧪 測試

### 測試不同權限的查詢

#### 1. 使用 Admin Token 測試

```bash
# 登入獲取 Admin Token
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { login(email: \"admin@example.com\", password: \"Password123!\") { ... on AuthResponse { accessToken } } }"
  }'

# 使用 Token 查詢
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -d '{
    "query": "query { usersPaginated { data { email accessScopes } } }"
  }'
```

#### 2. 使用 Customer Token 測試

```bash
# 登入獲取 Customer Token
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { login(email: \"customer@example.com\", password: \"Password123!\") { ... on AuthResponse { accessToken } } }"
  }'

# 查詢（應該只看到 CUSTOMER 和 PUBLIC）
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <CUSTOMER_TOKEN>" \
  -d '{
    "query": "query { usersPaginated { data { email accessScopes } } }"
  }'
```

---

## 🔒 安全性考量

### ✅ 已實現的保護

1. **Service 層過濾** - 資料在查詢時就被過濾，不會洩漏
2. **Resolver 層驗證** - 雙重檢查，確保上下文正確傳遞
3. **Prisma 層面過濾** - 資料庫查詢層面的過濾
4. **關聯查詢保護** - 關聯資料自動遵守 RLS 規則

### ⚠️ 注意事項

1. **不要繞過 Service 層**
   - 始終通過 Service 方法查詢資料
   - 不要直接使用 PrismaService 繞過 RLS

2. **測試所有權限組合**
   - 確保每個 AccessScope 都按預期工作
   - 測試邊界情況（未認證、多重 Scope 等）

3. **審計日誌**
   - 記錄 RLS 過濾事件
   - 監控異常查詢模式

---

## 🔄 與其他安全機制的關係

```text
請求流程：
1. JwtAuthGuard        - 驗證 JWT Token
2. PermissionGuard     - 檢查 Scope/Permission（Endpoint 級別）
3. Resolver            - 提取使用者上下文
4. Service (RLS)       - 過濾查詢結果（Row 級別）
5. FieldAuthPlugin     - 過濾敏感欄位（Field 級別）
```

**三層防護**：

- **Endpoint 級別**: PermissionGuard 控制能否呼叫 API
- **Row 級別**: RLS 控制能查看哪些資料
- **Field 級別**: FieldAuthPlugin 控制能看到哪些欄位

---

## ⚡ 效能考量

- **查詢效能**: RLS 過濾在資料庫查詢層面，效能影響極小
- **索引建議**: 在 `accessScopes` 欄位上建立索引
- **快取策略**: 可以按 AccessScope 快取查詢結果

```sql
-- 建議的資料庫索引
CREATE INDEX idx_user_access_scopes ON "User" USING GIN (access_scopes);
```

---

## 📖 相關文檔

- [RBAC Architecture](./RBAC_ARCHITECTURE.md) - RBAC 架構與完整權限系統
- [Field Authorization](./FIELD_AUTHORIZATION.md) - 欄位級別授權
- [Registration](./REGISTRATION.md) - 用戶註冊與權限分配
- [Token Configuration](./TOKEN-CONFIGURATION.md) - JWT Token 配置

---

✅ **Row-Level Security 已完整實現並測試通過**
