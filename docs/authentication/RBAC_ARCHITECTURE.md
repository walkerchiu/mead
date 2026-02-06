# RBAC 架構設計文件

多層式權限控制架構，提供從介面層級到欄位層級的完整權限管理。

---

## 📋 目錄

- [RBAC 架構設計文件](#rbac-架構設計文件)
  - [📋 目錄](#-目錄)
  - [📖 概述](#-概述)
  - [🏗️ 架構圖](#️-架構圖)
  - [📊 資料模型](#-資料模型)
    - [1. AccessScope Enum](#1-accessscope-enum)
    - [2. User Model (更新)](#2-user-model-更新)
    - [3. Role Model](#3-role-model)
    - [4. Permission Model](#4-permission-model)
    - [5. UserRole (多對多關聯表)](#5-userrole-多對多關聯表)
    - [6. RolePermission (多對多關聯表)](#6-rolepermission-多對多關聯表)
  - [📝 權限命名規範](#-權限命名規範)
    - [格式](#格式)
    - [Resource 類別](#resource-類別)
    - [Action 類別](#action-類別)
    - [範例](#範例)
  - [🎯 預設角色與權限](#-預設角色與權限)
    - [Admin Portal (ADMIN_SCOPE)](#admin-portal-admin_scope)
      - [SUPER_ADMIN](#super_admin)
      - [CONTENT_EDITOR](#content_editor)
      - [VIEWER](#viewer)
    - [Customer Dashboard (CUSTOMER_SCOPE)](#customer-dashboard-customer_scope)
      - [OWNER](#owner)
      - [MEMBER](#member)
      - [GUEST](#guest)
  - [🔐 JWT Token 結構](#-jwt-token-結構)
  - [🔍 權限檢查流程](#-權限檢查流程)
  - [📝 Decorator 使用範例](#-decorator-使用範例)
  - [🔄 Migration 策略](#-migration-策略)
    - [從現有系統遷移](#從現有系統遷移)
  - [🚀 未來擴展](#-未來擴展)
    - [1. 角色繼承](#1-角色繼承)
    - [2. 條件權限](#2-條件權限)
    - [3. 時間限制權限](#3-時間限制權限)
  - [📋 Phase 3: Field-Level Authorization (欄位級別授權)](#-phase-3-field-level-authorization-欄位級別授權)
    - [概述](#概述)
    - [三層權限控制](#三層權限控制)
    - [欄位裝飾器](#欄位裝飾器)
    - [權限矩陣（含欄位級別）](#權限矩陣含欄位級別)
    - [效能優化](#效能優化)
  - [📖 相關文檔](#-相關文檔)

---

## 📖 概述

本系統採用多層式權限控制架構：

1. **AccessScope（訪問範圍）** - 決定使用者可以訪問哪個介面
2. **Row-Level Security** - 基於 AccessScope 過濾可見資料行
3. **RBAC（角色權限）** - 在每個介面內進行細粒度權限控制
4. **Field-Level Authorization** - 精確控制欄位可見性

> **🔗 相關文檔**
>
> - [Row-Level Security](./ROW_LEVEL_SECURITY.md) - AccessScope 資料行過濾
> - [Field-Level Authorization](./FIELD_AUTHORIZATION.md) - GraphQL 欄位權限

---

## 🏗️ 架構圖

```text
JWT Token
    ↓
┌─────────────────────────────────────────────┐
│ Layer 1: AccessScope Check                  │
│ - PUBLIC_SCOPE                               │
│ - CUSTOMER_SCOPE                             │
│ - ADMIN_SCOPE                                │
└─────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────┐
│ Layer 2: Row-Level Security (RLS)           │
│ - ADMIN_SCOPE → 查看所有資料                │
│ - CUSTOMER_SCOPE → 過濾僅 CUSTOMER+PUBLIC   │
│ - PUBLIC_SCOPE → 只能查看 PUBLIC            │
└─────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────┐
│ Layer 3: RBAC Check (within scope)          │
│                                              │
│ Admin Portal (ADMIN_SCOPE)                   │
│ ├─ Roles: SUPER_ADMIN, CONTENT_EDITOR, ...  │
│ └─ Permissions: users:create, users:delete   │
│                                              │
│ Customer Dashboard (CUSTOMER_SCOPE)          │
│ ├─ Roles: OWNER, MEMBER, GUEST              │
│ └─ Permissions: project:view, project:edit   │
│                                              │
│ Public Pages (PUBLIC_SCOPE)                  │
│ └─ No RBAC (open access)                    │
└─────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────┐
│ Layer 4: Field-Level Authorization          │
│ - 根據 AccessScope/Permissions 過濾欄位     │
│ - @SensitiveField, @AdminOnly 等裝飾器      │
└─────────────────────────────────────────────┘
```

---

## 📊 資料模型

### 1. AccessScope Enum

```typescript
enum AccessScope {
  PUBLIC_SCOPE = 'PUBLIC_SCOPE', // 公開頁面訪問
  CUSTOMER_SCOPE = 'CUSTOMER_SCOPE', // 客戶儀表板訪問
  ADMIN_SCOPE = 'ADMIN_SCOPE', // 管理後台訪問
}
```

### 2. User Model (更新)

```prisma
model User {
  id            String        @id @default(dbgenerated("uuid_generate_v7()"))
  email         String        @unique
  name          String?
  password      String
  accessScopes  AccessScope[] // 使用者可以訪問的範圍（複數）
  refreshToken  String?
  lastLoginAt   DateTime?
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  deletedAt     DateTime?

  // 關聯
  profile       Profile?
  userRoles     UserRole[]    // 使用者擁有的角色（多對多）
}
```

### 3. Role Model

```prisma
model Role {
  id          String   @id @default(dbgenerated("uuid_generate_v7()"))
  name        String   // SUPER_ADMIN, OWNER, MEMBER, etc.
  displayName String   // "超級管理員", "專案擁有者"
  scope       AccessScope // 此角色屬於哪個範圍
  description String?
  isSystem    Boolean  @default(false) // 系統預設角色（不可刪除）
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // 關聯
  userRoles       UserRole[]
  rolePermissions RolePermission[]

  @@unique([name, scope]) // 同一 scope 內角色名稱唯一
}
```

### 4. Permission Model

```prisma
model Permission {
  id          String      @id @default(dbgenerated("uuid_generate_v7()"))
  name        String      @unique // "users:create", "projects:edit"
  resource    String      // "users", "projects", "billing"
  action      String      // "create", "read", "update", "delete", "list"
  scope       AccessScope // 此權限屬於哪個範圍
  description String?
  createdAt   DateTime    @default(now())

  // 關聯
  rolePermissions RolePermission[]

  @@index([resource, action])
  @@index([scope])
}
```

### 5. UserRole (多對多關聯表)

```prisma
model UserRole {
  id        String   @id @default(dbgenerated("uuid_generate_v7()"))
  userId    String
  roleId    String
  grantedAt DateTime @default(now())
  grantedBy String?  // 誰授予的

  // 關聯
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  role Role @relation(fields: [roleId], references: [id], onDelete: Cascade)

  @@unique([userId, roleId])
  @@index([userId])
  @@index([roleId])
}
```

### 6. RolePermission (多對多關聯表)

```prisma
model RolePermission {
  id           String   @id @default(dbgenerated("uuid_generate_v7()"))
  roleId       String
  permissionId String
  createdAt    DateTime @default(now())

  // 關聯
  role       Role       @relation(fields: [roleId], references: [id], onDelete: Cascade)
  permission Permission @relation(fields: [permissionId], references: [id], onDelete: Cascade)

  @@unique([roleId, permissionId])
  @@index([roleId])
  @@index([permissionId])
}
```

---

## 📝 權限命名規範

### 格式

```text
{resource}:{action}
```

### Resource 類別

- `users` - 使用者管理
- `roles` - 角色管理
- `permissions` - 權限管理
- `posts` - 內容管理
- `projects` - 專案管理
- `billing` - 帳務管理
- `audit-logs` - 審計日誌
- `settings` - 系統設定

### Action 類別

- `create` - 創建
- `read` - 讀取單筆
- `list` - 列表查詢
- `update` - 更新
- `delete` - 刪除
- `restore` - 恢復（軟刪除）
- `manage` - 完整管理權限

### 範例

```text
users:create          // 創建使用者
users:list            // 查詢使用者列表
users:update          // 更新使用者
users:delete          // 刪除使用者
projects:read         // 查看專案詳情
projects:manage       // 完整專案管理
billing:read          // 查看帳單
settings:update       // 更新設定
audit-logs:list       // 查詢審計日誌
```

---

## 🎯 預設角色與權限

### Admin Portal (ADMIN_SCOPE)

#### SUPER_ADMIN

- 所有權限：`*:*`

#### CONTENT_EDITOR

```text
posts:create
posts:read
posts:list
posts:update
posts:delete
users:read
users:list
```

#### VIEWER

```text
posts:read
posts:list
users:read
users:list
audit-logs:list
```

### Customer Dashboard (CUSTOMER_SCOPE)

#### OWNER

```text
projects:*          // 所有專案權限
billing:*           // 所有帳務權限
members:manage      // 成員管理
settings:update     // 設定更新
```

#### MEMBER

```text
projects:read
projects:list
projects:update
billing:read
```

#### GUEST

```text
projects:read
projects:list
```

---

## 🔐 JWT Token 結構

```typescript
interface JwtPayload {
  sub: string; // userId
  email: string;
  accessScopes: AccessScope[]; // ["CUSTOMER_SCOPE", "ADMIN_SCOPE"]
  roles: {
    scope: AccessScope;
    roleNames: string[]; // ["OWNER", "SUPER_ADMIN"]
  }[];
}
```

範例：

```json
{
  "sub": "019c1234-5678-...",
  "email": "admin@example.com",
  "accessScopes": ["ADMIN_SCOPE"],
  "roles": [
    {
      "scope": "ADMIN_SCOPE",
      "roleNames": ["SUPER_ADMIN"]
    }
  ],
  "iat": 1706342400,
  "exp": 1706343300
}
```

---

## 🔍 權限檢查流程

```typescript
// Step 1: 驗證 JWT Token
const user = await jwtStrategy.validate(token);

// Step 2: 檢查 AccessScope
if (!user.accessScopes.includes(requiredScope)) {
  throw new ForbiddenException('沒有訪問此介面的權限');
}

// Step 3: 檢查 Permission
const hasPermission = await permissionService.checkPermission(
  user.id,
  requiredScope,
  'users:create',
);

if (!hasPermission) {
  throw new ForbiddenException('沒有執行此操作的權限');
}
```

---

## 📝 Decorator 使用範例

```typescript
// 檢查 AccessScope
@UseGuards(JwtAuthGuard)
@RequiresScope(AccessScope.ADMIN_SCOPE)
async adminOnlyOperation() { }

// 檢查 Permission
@UseGuards(JwtAuthGuard, PermissionGuard)
@RequiresPermission('users:create')
async createUser() { }

// 同時檢查 Scope + Permission
@UseGuards(JwtAuthGuard, PermissionGuard)
@RequiresScope(AccessScope.CUSTOMER_SCOPE)
@RequiresPermission('projects:update')
async updateProject() { }
```

---

## 🔄 Migration 策略

### 從現有系統遷移

1. 創建新的 RBAC 資料表
2. 資料遷移：
   - `UserRole.PUBLIC` → `accessScopes: [PUBLIC_SCOPE]`, roles: []
   - `UserRole.DASHBOARD` → `accessScopes: [CUSTOMER_SCOPE]`, roles: [MEMBER]
   - `UserRole.ADMIN` → `accessScopes: [ADMIN_SCOPE]`, roles: [SUPER_ADMIN]
3. 更新程式碼引用
4. 刪除舊的 `role` enum 欄位

---

## 🚀 未來擴展

### 1. 角色繼承

```text
SUPER_ADMIN
  ↓ inherits
CONTENT_EDITOR
  ↓ inherits
VIEWER
```

### 2. 條件權限

```typescript
{
  permission: 'projects:update',
  condition: {
    field: 'ownerId',
    operator: 'equals',
    value: '{userId}'
  }
}
```

### 3. 時間限制權限

```typescript
{
  permission: 'billing:read',
  validFrom: '2026-01-01',
  validUntil: '2026-12-31'
}
```

---

## 📋 Phase 3: Field-Level Authorization (欄位級別授權)

### 概述

Field-Level Authorization 是 RBAC 系統的**第三層保護**，在 Response 階段動態過濾欄位。

```text
Request Flow:
Client → JWT Auth → AccessScope Check → Permission Check → Resolver → **Field Filter** → Response
```

### 三層權限控制

| 層級        | 檢查階段 | 控制範圍   | 實作方式                            |
| ----------- | -------- | ---------- | ----------------------------------- |
| **Layer 1** | Request  | 介面訪問   | `@RequiresScope()`                  |
| **Layer 2** | Request  | 操作權限   | `@RequiresPermission()`             |
| **Layer 3** | Response | 欄位可見性 | `@SensitiveField()`, `@AdminOnly()` |

### 欄位裝飾器

```typescript
@ObjectType()
export class UserType {
  @Field()
  id: string; // 所有人可見

  @Field()
  @SensitiveField() // Customer 和 Admin 可見
  email: string;

  @Field({ nullable: true })
  @AdminOnly() // 只有 Admin 可見
  deletedAt?: Date;
}
```

### 權限矩陣（含欄位級別）

| 欄位         | PUBLIC | CUSTOMER | ADMIN |
| ------------ | ------ | -------- | ----- |
| id, name     | ✅     | ✅       | ✅    |
| email, phone | ❌     | ✅       | ✅    |
| deletedAt    | ❌     | ❌       | ✅    |
| password     | ❌     | ❌       | ❌    |

### 效能優化

- **零 DB 查詢** - 權限從 JWT 讀取
- **O(1) 檢查** - 使用 `Set<AccessScope>`
- **原地過濾** - `delete obj[field]` 而非重建物件

詳細資訊請參考 [Field Authorization Documentation](./FIELD_AUTHORIZATION.md)。

---

## 📖 相關文檔

- [Row-Level Security](./ROW_LEVEL_SECURITY.md) - AccessScope 資料行過濾
- [Field-Level Authorization](./FIELD_AUTHORIZATION.md) - GraphQL 欄位權限
- [Registration](./REGISTRATION.md) - 用戶註冊與權限分配
- [Token Configuration](./TOKEN-CONFIGURATION.md) - JWT Token 配置
