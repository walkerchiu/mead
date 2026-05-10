# 分頁實現指南 (Pagination Guide)

Offset-based 分頁實作，適合管理系統和需要跳頁功能的列表查詢。

---

## 目錄

- [分頁實現指南 (Pagination Guide)](#分頁實現指南-pagination-guide)
  - [目錄](#目錄)
  - [概述](#概述)
    - [為什麼選擇 Offset-based？](#為什麼選擇-offset-based)
  - [分頁架構](#分頁架構)
    - [核心組件](#核心組件)
    - [檔案結構](#檔案結構)
  - [後端實現](#後端實現)
    - [1. PaginationInput（輸入參數）](#1-paginationinput輸入參數)
    - [2. PageInfo（分頁元資料）](#2-pageinfo分頁元資料)
    - [3. Pagination Utils（工具函數）](#3-pagination-utils工具函數)
    - [4. 實際使用範例：usersPaginated](#4-實際使用範例userspaginated)
      - [Resolver 定義](#resolver-定義)
      - [Service 實現](#service-實現)
      - [Response Type 定義](#response-type-定義)
  - [前端使用](#前端使用)
    - [GraphQL Query](#graphql-query)
    - [Apollo Client 使用](#apollo-client-使用)
    - [Material-UI Pagination](#material-ui-pagination)
  - [效能優化](#效能優化)
    - [1. 並行查詢（已實現）](#1-並行查詢已實現)
    - [2. 資料庫索引](#2-資料庫索引)
    - [3. 選擇性查詢欄位](#3-選擇性查詢欄位)
    - [4. 快取策略](#4-快取策略)
  - [最佳實踐](#最佳實踐)
    - [DO - 應該這樣做](#do---應該這樣做)
      - [1. 限制最大筆數](#1-限制最大筆數)
      - [2. 驗證輸入參數](#2-驗證輸入參數)
      - [3. 提供預設值](#3-提供預設值)
      - [4. 使用並行查詢](#4-使用並行查詢)
    - [DON'T - 不要這樣做](#dont---不要這樣做)
      - [1. 不要無限制查詢](#1-不要無限制查詢)
      - [2. 不要序列查詢](#2-不要序列查詢)
      - [3. 不要忽略軟刪除](#3-不要忽略軟刪除)
  - [常見問題](#常見問題)
    - [Q1: 為什麼不使用 Cursor-based pagination？](#q1-為什麼不使用-cursor-based-pagination)
    - [Q2: 如何處理大資料集（100萬+ 筆）？](#q2-如何處理大資料集100萬-筆)
    - [Q3: count() 查詢很慢怎麼辦？](#q3-count-查詢很慢怎麼辦)
  - [相關文檔](#相關文檔)

---

## 概述

NPT 專案採用 **Offset-based Pagination**（偏移式分頁），適合大多數業務場景。

### 為什麼選擇 Offset-based？

| 特性       | Offset-based   | Cursor-based       |
| ---------- | -------------- | ------------------ |
| 實現複雜度 | ⭐⭐ 簡單      | ⭐⭐⭐⭐ 複雜      |
| 跳頁能力   | ✅ 支援        | ❌ 不支援          |
| 資料即時性 | ⚠️ 可能有偏移  | ✅ 準確            |
| 總頁數顯示 | ✅ 支援        | ❌ 不支援          |
| 適用場景   | 管理後台、列表 | 社交feed、無限滾動 |

**結論**: Offset-based 更適合管理系統和需要跳頁的場景。

---

## 分頁架構

### 核心組件

```text
┌─────────────────────────────────────┐
│  PaginationInput (輸入參數)          │
│  - page: 頁碼（從 1 開始）             │
│  - limit: 每頁筆數（預設 20，最大 100） │
└─────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│  Pagination Utils (工具函數)         │
│  - calculateSkip(): 計算偏移量        │
│  - createPaginationResult(): 組裝結果 │
└─────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│  PageInfo (回應元資料)               │
│  - currentPage, totalPages            │
│  - totalCount, limit                  │
│  - hasNextPage, hasPreviousPage       │
└─────────────────────────────────────┘
```

### 檔案結構

```text
apps/backend/src/common/
├── dto/
│   └── pagination.input.ts        # PaginationInput 定義
├── types/
│   └── pagination.types.ts        # PageInfo 類型定義
└── utils/
    └── pagination.utils.ts        # 分頁工具函數
```

---

## 後端實現

### 1. PaginationInput（輸入參數）

`/src/common/dto/pagination.input.ts`

```typescript
import { InputType, Field, Int } from '@nestjs/graphql';
import { Min, Max } from 'class-validator';

@InputType()
export class PaginationInput {
  @Field(() => Int, {
    defaultValue: 1,
    description: '頁碼（從 1 開始）',
  })
  @Min(1, { message: '頁碼必須大於等於 1' })
  page: number = 1;

  @Field(() => Int, {
    defaultValue: 20,
    description: '每頁筆數（最大 100）',
  })
  @Min(1, { message: '每頁筆數必須大於等於 1' })
  @Max(100, { message: '每頁筆數不能超過 100' })
  limit: number = 20;
}
```

**特性**:

- ✅ 預設值：page=1, limit=20
- ✅ 輸入驗證：page >= 1, limit 介於 1-100
- ✅ GraphQL 描述：自動生成文檔

### 2. PageInfo（分頁元資料）

`/src/common/types/pagination.types.ts`

```typescript
import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType({ description: '分頁資訊' })
export class PageInfo {
  @Field(() => Int, { description: '當前頁碼' })
  currentPage: number;

  @Field(() => Int, { description: '總頁數' })
  totalPages: number;

  @Field(() => Int, { description: '總筆數' })
  totalCount: number;

  @Field(() => Int, { description: '每頁筆數' })
  limit: number;

  @Field({ description: '是否有下一頁' })
  hasNextPage: boolean;

  @Field({ description: '是否有上一頁' })
  hasPreviousPage: boolean;
}
```

### 3. Pagination Utils（工具函數）

`/src/common/utils/pagination.utils.ts`

```typescript
import { PageInfo } from '../types/pagination.types';

export interface PaginationResult<T> {
  data: T[];
  pageInfo: PageInfo;
}

/**
 * 計算 Prisma skip 值
 */
export function calculateSkip(page: number, limit: number): number {
  return (page - 1) * limit;
}

/**
 * 建立分頁結果
 */
export function createPaginationResult<T>(
  data: T[],
  totalCount: number,
  page: number,
  limit: number,
): PaginationResult<T> {
  const totalPages = Math.ceil(totalCount / limit);

  return {
    data,
    pageInfo: {
      currentPage: page,
      totalPages,
      totalCount,
      limit,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}
```

### 4. 實際使用範例：usersPaginated

#### Resolver 定義

`/src/modules/user/user.resolver.ts`

```typescript
import { Query, Args, UseGuards } from '@nestjs/graphql';
import { PaginationInput } from '@/common/dto/pagination.input';
import { PaginatedUsers } from './user.types';

@Query(() => PaginatedUsers, {
  name: 'usersPaginated',
  description: '分頁查詢用戶列表'
})
@UseGuards(PermissionGuard)
@RequiresAnyScope([AccessScope.HQ_SCOPE, AccessScope.CUSTOMER_SCOPE])
@RequiresPermission('users:list')
async usersPaginated(
  @Args('pagination', {
    type: () => PaginationInput,
    defaultValue: { page: 1, limit: 20 }
  })
  pagination: PaginationInput,

  @Args('includeDeleted', {
    defaultValue: false,
    description: '是否包含已刪除的用戶'
  })
  includeDeleted: boolean,
): Promise<PaginatedUsers> {
  return this.userService.findAllUsersPaginated(
    pagination.page,
    pagination.limit,
    includeDeleted,
  );
}
```

#### Service 實現

`/src/modules/user/user.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import {
  calculateSkip,
  createPaginationResult,
  PaginationResult,
} from '@/common/utils/pagination.utils';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findAllUsersPaginated(
    page: number,
    limit: number,
    includeDeleted = false,
  ): Promise<PaginationResult<any>> {
    // 1. 輸入驗證和正規化
    page = Math.max(1, Math.floor(page));
    limit = Math.max(1, Math.min(100, Math.floor(limit)));

    // 2. 構建查詢條件
    const where = includeDeleted ? {} : { deletedAt: null };
    const skip = calculateSkip(page, limit);

    // 3. 並行查詢資料和總數（效能優化）
    const [data, totalCount] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          emailVerifiedAt: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    // 4. 組裝分頁結果
    return createPaginationResult(data, totalCount, page, limit);
  }
}
```

#### Response Type 定義

`/src/modules/user/user.types.ts`

```typescript
import { ObjectType, Field } from '@nestjs/graphql';
import { PageInfo } from '@/common/types/pagination.types';
import { UserType } from './user.type';

@ObjectType({ description: '分頁用戶列表' })
export class PaginatedUsers {
  @Field(() => [UserType], { description: '用戶資料' })
  data: UserType[];

  @Field(() => PageInfo, { description: '分頁資訊' })
  pageInfo: PageInfo;
}
```

---

## 前端使用

### GraphQL Query

```graphql
query GetUsers($pagination: PaginationInput!) {
  usersPaginated(pagination: $pagination) {
    data {
      id
      name
      email
      avatar
      createdAt
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

**Variables**:

```json
{
  "pagination": {
    "page": 1,
    "limit": 20
  }
}
```

### Apollo Client 使用

```typescript
import { gql, useQuery } from '@apollo/client';
import { useState } from 'react';

const GET_USERS = gql`
  query GetUsers($pagination: PaginationInput!) {
    usersPaginated(pagination: $pagination) {
      data { id name email avatar }
      pageInfo {
        currentPage
        totalPages
        totalCount
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;

function UserList() {
  const [page, setPage] = useState(1);
  const { data, loading, error } = useQuery(GET_USERS, {
    variables: { pagination: { page, limit: 20 } },
  });

  if (loading) return <div>載入中...</div>;
  if (error) return <div>錯誤: {error.message}</div>;

  const { data: users, pageInfo } = data.usersPaginated;

  return (
    <div>
      {/* 用戶列表 */}
      {users.map((user) => (
        <div key={user.id}>{user.name}</div>
      ))}

      {/* 分頁控制 */}
      <div>
        <button
          disabled={!pageInfo.hasPreviousPage}
          onClick={() => setPage(page - 1)}
        >
          上一頁
        </button>
        <span>第 {pageInfo.currentPage} / {pageInfo.totalPages} 頁</span>
        <button
          disabled={!pageInfo.hasNextPage}
          onClick={() => setPage(page + 1)}
        >
          下一頁
        </button>
      </div>
      <div>共 {pageInfo.totalCount} 筆</div>
    </div>
  );
}
```

### Material-UI Pagination

```typescript
import { Pagination } from '@mui/material';

<Pagination
  count={pageInfo.totalPages}
  page={pageInfo.currentPage}
  onChange={(event, value) => setPage(value)}
  color="primary"
/>
```

---

## 效能優化

### 1. 並行查詢（已實現）

```typescript
// ✅ 好：並行執行
const [data, totalCount] = await Promise.all([
  this.prisma.user.findMany({ ... }),
  this.prisma.user.count({ ... })
]);

// ❌ 差：序列執行
const data = await this.prisma.user.findMany({ ... });
const totalCount = await this.prisma.user.count({ ... });
```

**效能提升**: ~50% 查詢時間減少

### 2. 資料庫索引

```prisma
model User {
  id        String   @id @default(dbgenerated("uuid_generate_v7()"))
  email     String   @unique
  createdAt DateTime @default(now()) @db.Timestamptz(3)
  deletedAt DateTime? @db.Timestamptz(3)

  // 索引優化
  @@index([createdAt])           // 排序欄位
  @@index([deletedAt])           // 軟刪除篩選
  @@index([createdAt, deletedAt]) // 複合索引
}
```

### 3. 選擇性查詢欄位

```typescript
// ✅ 好：只查詢需要的欄位
select: {
  id: true,
  name: true,
  email: true,
}

// ❌ 差：查詢所有欄位（包含敏感資料）
// 不指定 select
```

### 4. 快取策略

```typescript
// Redis 快取範例（可選）
const cacheKey = `users:page:${page}:limit:${limit}`;
const cached = await this.cacheManager.get(cacheKey);

if (cached) {
  return cached;
}

const result = await this.findAllUsersPaginated(page, limit);
await this.cacheManager.set(cacheKey, result, 300); // 5 分鐘
return result;
```

---

## 最佳實踐

### DO - 應該這樣做

#### 1. 限制最大筆數

```typescript
limit = Math.min(100, limit); // 防止過大的查詢
```

#### 2. 驗證輸入參數

```typescript
page = Math.max(1, Math.floor(page)); // page >= 1
limit = Math.max(1, Math.min(100, Math.floor(limit))); // 1 <= limit <= 100
```

#### 3. 提供預設值

```typescript
@Args('pagination', {
  type: () => PaginationInput,
  defaultValue: { page: 1, limit: 20 } // 明確的預設值
})
```

#### 4. 使用並行查詢

```typescript
const [data, totalCount] = await Promise.all([
  this.prisma.user.findMany({ ... }),
  this.prisma.user.count({ ... })
]);
```

### DON'T - 不要這樣做

#### 1. 不要無限制查詢

```typescript
// ❌ 錯誤：沒有 limit 限制
const allUsers = await this.prisma.user.findMany();
```

#### 2. 不要序列查詢

```typescript
// ❌ 錯誤：先查資料，再查總數
const data = await this.prisma.user.findMany({ ... });
const totalCount = await this.prisma.user.count({ ... });
```

#### 3. 不要忽略軟刪除

```typescript
// ❌ 錯誤：可能包含已刪除資料
const data = await this.prisma.user.findMany({ skip, take: limit });

// ✅ 正確：明確篩選
const data = await this.prisma.user.findMany({
  where: { deletedAt: null },
  skip,
  take: limit,
});
```

---

## 常見問題

### Q1: 為什麼不使用 Cursor-based pagination？

**A**: Offset-based 更適合管理系統：

- 需要跳頁功能（例如：直接跳到第 5 頁）
- 需要顯示總頁數
- 資料變動不頻繁

Cursor-based 更適合社交媒體 feed 和無限滾動。

### Q2: 如何處理大資料集（100萬+ 筆）？

**A**:

1. 加入搜尋/篩選條件，減少資料集
2. 使用 Cursor-based pagination
3. 考慮使用 Elasticsearch
4. 限制可訪問的最大頁數

### Q3: count() 查詢很慢怎麼辦？

**A**:

1. 確保篩選欄位有索引
2. 使用估算值（大資料集時）：
   ```sql
   SELECT reltuples AS estimate FROM pg_class WHERE relname = 'users';
   ```

````
3. 快取 totalCount（短時間）

### Q4: 如何實現搜尋 + 分頁？

**A**:

```typescript
async searchUsersPaginated(
  keyword: string,
  page: number,
  limit: number
): Promise<PaginationResult<User>> {
  const where = {
    deletedAt: null,
    OR: [      { name: { contains: keyword, mode: 'insensitive' } },
      { email: { contains: keyword, mode: 'insensitive' } },
    ],
  };

  const skip = calculateSkip(page, limit);
  const [data, totalCount] = await Promise.all([    this.prisma.user.findMany({ where, skip, take: limit }),
    this.prisma.user.count({ where }),
  ]);

  return createPaginationResult(data, totalCount, page, limit);
}
````

---

## 相關文檔

- [API_RESPONSE_FORMAT.md](./API_RESPONSE_FORMAT.md) - API 回應格式
- [PRISMA_SCHEMA_ORGANIZATION.md](../database/PRISMA_SCHEMA_ORGANIZATION.md) - 資料庫設計
- [FIELD_AUTHORIZATION.md](../authentication/FIELD_AUTHORIZATION.md) - GraphQL 欄位權限
