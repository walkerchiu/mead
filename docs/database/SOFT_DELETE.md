# 軟刪除 (Soft Delete) 功能說明

實現資料邏輯刪除而非物理刪除，保留歷史記錄與審計追蹤能力。

---

## 📋 目錄

- [軟刪除 (Soft Delete) 功能說明](#軟刪除-soft-delete-功能說明)
  - [📋 目錄](#-目錄)
  - [📖 概述](#-概述)
  - [📐 Schema 結構](#-schema-結構)
    - [User 表](#user-表)
    - [Profile 表](#profile-表)
  - [✨ 功能特性](#-功能特性)
    - [硬刪除 vs 軟刪除](#硬刪除-vs-軟刪除)
    - [Cascade 刪除](#cascade-刪除)
  - [📝 使用範例](#-使用範例)
    - [1. 建立 User 和 Profile](#1-建立-user-和-profile)
    - [2. 查詢（排除已刪除）](#2-查詢排除已刪除)
    - [3. 軟刪除](#3-軟刪除)
    - [4. 恢復已刪除的資料](#4-恢復已刪除的資料)
    - [5. 永久刪除（Hard Delete）](#5-永久刪除hard-delete)
  - [🔧 Prisma Middleware（推薦）](#-prisma-middleware推薦)
  - [🔧 GraphQL 範例](#-graphql-範例)
    - [Schema 定義](#schema-定義)
    - [Resolver](#resolver)
  - [🎯 最佳實踐](#-最佳實踐)
    - [1. 查詢時永遠過濾 deletedAt](#1-查詢時永遠過濾-deletedat)
    - [2. 使用 Middleware 自動化](#2-使用-middleware-自動化)
    - [3. 定期清理](#3-定期清理)
    - [4. 稽核日誌](#4-稽核日誌)
  - [⚠️ 注意事項](#️-注意事項)
    - [Cascade 限制](#cascade-限制)
    - [唯一索引衝突](#唯一索引衝突)
  - [📚 相關資源](#-相關資源)

---

## 📖 概述

User 和 Profile 資料表已實作軟刪除功能。資料不會被實際刪除，而是標記 `deletedAt` 欄位。提供完整的軟刪除、恢復與清理機制，確保資料安全與審計追蹤。

---

## 📐 Schema 結構

### User 表

- `id`: UUID v7 主鍵
- `email`: 唯一電子郵件
- `name`: 使用者名稱
- `createdAt`: 建立時間
- `updatedAt`: 更新時間
- `deletedAt`: **軟刪除時間戳**（null = 未刪除）
- `profile`: 一對一關聯到 Profile

### Profile 表

- `id`: UUID v7 主鍵
- `userId`: 關聯到 User（唯一，一對一）
- `bio`: 個人簡介
- `avatar`: 頭像 URL
- `phone`: 電話
- `address`: 地址
- `website`: 網站
- `createdAt`: 建立時間
- `updatedAt`: 更新時間
- `deletedAt`: **軟刪除時間戳**（null = 未刪除）
- `user`: 關聯到 User（`onDelete: Cascade`）

---

## ✨ 功能特性

### 硬刪除 vs 軟刪除

| 操作 | 硬刪除 (Hard Delete) | 軟刪除 (Soft Delete) |
| ---- | -------------------- | -------------------- |
| 資料 | 永久移除             | 保留但標記           |
| 恢復 | 不可能               | 可恢復               |
| 查詢 | 不再出現             | 需過濾查詢           |
| 稽核 | 無歷史記錄           | 保留歷史             |

### Cascade 刪除

當 User 被軟刪除時，關聯的 Profile 也會自動被軟刪除（透過 `onDelete: Cascade`）。

---

## 📝 使用範例

### 1. 建立 User 和 Profile

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 建立 User 和 Profile
const user = await prisma.user.create({
  data: {
    email: 'user@example.com',
    name: 'John Doe',
    profile: {
      create: {
        bio: '軟體工程師',
        phone: '+886912345678',
        avatar: 'https://example.com/avatar.jpg',
      },
    },
  },
  include: {
    profile: true,
  },
});
```

### 2. 查詢（排除已刪除）

```typescript
// 只查詢未刪除的 User
const activeUsers = await prisma.user.findMany({
  where: {
    deletedAt: null,
  },
  include: {
    profile: {
      where: {
        deletedAt: null,
      },
    },
  },
});

// 查詢單一 User（排除已刪除）
const user = await prisma.user.findFirst({
  where: {
    id: userId,
    deletedAt: null,
  },
  include: {
    profile: {
      where: {
        deletedAt: null,
      },
    },
  },
});
```

### 3. 軟刪除

```typescript
// 軟刪除 User（Profile 會自動跟著被刪）
const deletedUser = await prisma.user.update({
  where: { id: userId },
  data: {
    deletedAt: new Date(),
  },
});

// 需要手動軟刪除 Profile（因為 Prisma 不支援自動 cascade soft delete）
await prisma.profile.updateMany({
  where: {
    userId: userId,
    deletedAt: null,
  },
  data: {
    deletedAt: new Date(),
  },
});
```

### 4. 恢復已刪除的資料

```typescript
// 恢復 User
const restoredUser = await prisma.user.update({
  where: { id: userId },
  data: {
    deletedAt: null,
  },
});

// 恢復 Profile
await prisma.profile.updateMany({
  where: {
    userId: userId,
  },
  data: {
    deletedAt: null,
  },
});
```

### 5. 永久刪除（Hard Delete）

```typescript
// 警告：這會永久刪除資料！
await prisma.profile.deleteMany({
  where: { userId: userId },
});

await prisma.user.delete({
  where: { id: userId },
});
```

---

## 🔧 Prisma Middleware（推薦）

為了自動化軟刪除，建議使用 Prisma Middleware：

```typescript
// packages/database/src/middleware.ts
import { Prisma, PrismaClient } from '@prisma/client';

export function applySoftDeleteMiddleware(prisma: PrismaClient) {
  // 攔截 delete 操作，轉換為 update
  prisma.$use(async (params, next) => {
    // 軟刪除邏輯
    if (params.action === 'delete') {
      params.action = 'update';
      params.args['data'] = { deletedAt: new Date() };
    }

    if (params.action === 'deleteMany') {
      params.action = 'updateMany';
      if (params.args.data != undefined) {
        params.args.data['deletedAt'] = new Date();
      } else {
        params.args['data'] = { deletedAt: new Date() };
      }
    }

    // 自動過濾已刪除的記錄
    if (params.action === 'findUnique' || params.action === 'findFirst') {
      params.action = 'findFirst';
      params.args.where = {
        ...params.args.where,
        deletedAt: null,
      };
    }

    if (params.action === 'findMany') {
      if (params.args.where) {
        if (params.args.where.deletedAt === undefined) {
          params.args.where['deletedAt'] = null;
        }
      } else {
        params.args['where'] = { deletedAt: null };
      }
    }

    return next(params);
  });
}

// 使用
const prisma = new PrismaClient();
applySoftDeleteMiddleware(prisma);
```

---

## 🔧 GraphQL 範例

### Schema 定義

```typescript
// User Type
@ObjectType()
export class UserType {
  @Field()
  id: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  name?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field({ nullable: true })
  deletedAt?: Date;

  @Field(() => ProfileType, { nullable: true })
  profile?: ProfileType;
}

// Profile Type
@ObjectType()
export class ProfileType {
  @Field()
  id: string;

  @Field()
  userId: string;

  @Field({ nullable: true })
  bio?: string;

  @Field({ nullable: true })
  avatar?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field({ nullable: true })
  deletedAt?: Date;
}
```

### Resolver

```typescript
@Resolver()
export class UserResolver {
  constructor(private prisma: PrismaClient) {}

  @Query(() => [UserType])
  async users() {
    return this.prisma.user.findMany({
      where: { deletedAt: null },
      include: {
        profile: {
          where: { deletedAt: null },
        },
      },
    });
  }

  @Mutation(() => UserType)
  async deleteUser(@Args('id') id: string) {
    // 軟刪除 User
    const user = await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    // 軟刪除 Profile
    await this.prisma.profile.updateMany({
      where: { userId: id, deletedAt: null },
      data: { deletedAt: new Date() },
    });

    return user;
  }

  @Mutation(() => UserType)
  async restoreUser(@Args('id') id: string) {
    // 恢復 User
    const user = await this.prisma.user.update({
      where: { id },
      data: { deletedAt: null },
    });

    // 恢復 Profile
    await this.prisma.profile.updateMany({
      where: { userId: id },
      data: { deletedAt: null },
    });

    return user;
  }
}
```

---

## 🎯 最佳實踐

### 1. 查詢時永遠過濾 deletedAt

```typescript
// ✅ 正確
const users = await prisma.user.findMany({
  where: { deletedAt: null },
});

// ❌ 錯誤（會包含已刪除的資料）
const users = await prisma.user.findMany();
```

### 2. 使用 Middleware 自動化

建議使用 Prisma Middleware 自動處理軟刪除邏輯，避免手動處理。

### 3. 定期清理

設定定期任務清理超過一定時間的軟刪除資料：

```typescript
// 刪除 90 天前軟刪除的資料
const ninetyDaysAgo = new Date();
ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

await prisma.profile.deleteMany({
  where: {
    deletedAt: {
      lt: ninetyDaysAgo,
    },
  },
});

await prisma.user.deleteMany({
  where: {
    deletedAt: {
      lt: ninetyDaysAgo,
    },
  },
});
```

### 4. 稽核日誌

記錄軟刪除操作：

```typescript
async function softDeleteUser(userId: string, deletedBy: string) {
  await prisma.$transaction([
    // 軟刪除 User
    prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date() },
    }),

    // 軟刪除 Profile
    prisma.profile.updateMany({
      where: { userId, deletedAt: null },
      data: { deletedAt: new Date() },
    }),

    // 記錄刪除日誌
    prisma.auditLog.create({
      data: {
        action: 'SOFT_DELETE_USER',
        entityId: userId,
        performedBy: deletedBy,
        timestamp: new Date(),
      },
    }),
  ]);
}
```

---

## ⚠️ 注意事項

### Cascade 限制

Prisma 的 `onDelete: Cascade` 只在**硬刪除**時生效。軟刪除時需要手動處理關聯資料：

```typescript
// 硬刪除（自動 cascade）
await prisma.user.delete({ where: { id } });
// Profile 會自動被刪除 ✅

// 軟刪除（需手動處理）
await prisma.user.update({
  where: { id },
  data: { deletedAt: new Date() },
});
// Profile 不會自動被軟刪除 ❌，需手動處理：
await prisma.profile.updateMany({
  where: { userId: id, deletedAt: null },
  data: { deletedAt: new Date() },
});
```

### 唯一索引衝突

如果有唯一索引（如 `email`），軟刪除後再建立相同 email 的 User 可能衝突。解決方案：

**方案 1：複合唯一索引**

```prisma
model User {
  email     String
  deletedAt DateTime?

  @@unique([email, deletedAt])
}
```

**方案 2：清空或修改已刪除記錄的唯一欄位**

```typescript
await prisma.user.update({
  where: { id },
  data: {
    email: `deleted_${Date.now()}_${email}`,
    deletedAt: new Date(),
  },
});
```

---

## 📚 相關資源

- [Database Layer](./DATABASE_LAYER.md)
- [Prisma Schema 組織](./PRISMA_SCHEMA_ORGANIZATION.md)
- [UUID v7 遷移](./UUID_V7_MIGRATION.md)
- [Prisma Middleware](https://www.prisma.io/docs/concepts/components/prisma-client/middleware)
- [Soft Delete 設計模式](https://en.wikipedia.org/wiki/Soft_delete)
