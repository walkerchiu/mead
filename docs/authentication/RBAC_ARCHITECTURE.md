# RBAC 架構設計文件

> **最新的角色定義、權限清單及對照表請參考 [權限系統 (PERMISSION_SYSTEM.md)](./PERMISSION_SYSTEM.md)**。
> 本文件說明多層式權限控制的架構設計（AccessScope / RLS / RBAC / Field-Level）。

多層式權限控制架構，提供從介面層級到欄位層級的完整權限管理。

---

## 目錄

- [RBAC 架構設計文件](#rbac-架構設計文件)
  - [目錄](#目錄)
  - [概述](#概述)
  - [架構圖](#架構圖)
  - [資料模型](#資料模型)
    - [1. AccessScope Enum](#1-accessscope-enum)
    - [2. User Model (更新)](#2-user-model-更新)
    - [3. Role Model](#3-role-model)
    - [4. Permission Model](#4-permission-model)
    - [5. UserRole (多對多關聯表)](#5-userrole-多對多關聯表)
    - [6. RolePermission (多對多關聯表)](#6-rolepermission-多對多關聯表)
  - [權限命名規範](#權限命名規範)
    - [格式](#格式)
    - [Resource 類別](#resource-類別)
    - [Action 類別](#action-類別)
    - [範例](#範例)
  - [預設角色與權限](#預設角色與權限)
    - [HQ Scope 角色](#hq-scope-角色)
    - [Customer Scope 角色](#customer-scope-角色)
  - [JWT Token 結構](#jwt-token-結構)
  - [權限檢查流程](#權限檢查流程)
  - [Decorator 使用範例](#decorator-使用範例)
  - [Migration 策略](#migration-策略)
    - [從現有系統遷移](#從現有系統遷移)
  - [未來擴展](#未來擴展)
    - [1. 角色繼承](#1-角色繼承)
    - [2. 條件權限](#2-條件權限)
    - [3. 時間限制權限](#3-時間限制權限)
  - [Phase 3: Field-Level Authorization (欄位級別授權)](#phase-3-field-level-authorization-欄位級別授權)
    - [概述](#概述)
    - [三層權限控制](#三層權限控制)
    - [欄位裝飾器](#欄位裝飾器)
    - [權限矩陣（含欄位級別）](#權限矩陣含欄位級別)
    - [效能優化](#效能優化)
  - [相關文檔](#相關文檔)

---

## 概述

本系統採用多層式權限控制架構：

1. **AccessScope（訪問範圍）** - 決定用戶可以訪問哪個介面
2. **Row-Level Security** - 基於 AccessScope 過濾可見資料行
3. **RBAC（角色權限）** - 在每個介面內進行細粒度權限控制
4. **Field-Level Authorization** - 精確控制欄位可見性

> **相關文檔**
>
> - [Row-Level Security](./ROW_LEVEL_SECURITY.md) - AccessScope 資料行過濾
> - [Field-Level Authorization](./FIELD_AUTHORIZATION.md) - GraphQL 欄位權限

---

## 架構圖

```text
JWT Token
    ↓
┌─────────────────────────────────────────────┐
│ Layer 1: AccessScope Check                  │
│ - PUBLIC_SCOPE                               │
│ - CUSTOMER_SCOPE                             │
│ - HQ_SCOPE                                │
└─────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────┐
│ Layer 2: Row-Level Security (RLS)           │
│ - HQ_SCOPE → 查看所有資料                   │
│ - CUSTOMER_SCOPE → 過濾僅 CUSTOMER+PUBLIC   │
│ - PUBLIC_SCOPE → 只能查看 PUBLIC            │
└─────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────┐
│ Layer 3: RBAC Check (within scope)          │
│                                             │
│ ★ SUPER_HQ 自動繞過所有權限檢查            │
│                                             │
│ HQ Portal (HQ_SCOPE)                       │
│ ├─ SUPER_HQ: 所有權限（auto-bypass）       │
│ ├─ CONTENT_EDITOR: 客戶端資料管理+用戶管理 │
│ └─ VIEWER: 唯讀存取                        │
│                                             │
│ Customer Dashboard (CUSTOMER_SCOPE)         │
│ ├─ OWNER: 所有 CUSTOMER 權限+用戶管理      │
│ ├─ MANAGER: 用戶管理                       │
│ ├─ MEMBER: 查詢用戶                        │
│ └─ GUEST: 無權限                           │
│                                             │
│ ★ HQ 角色可持有跨 Scope 權限               │
│   （檢查 CUSTOMER 權限時也查 HQ 角色）     │
│                                             │
│ Public Pages (PUBLIC_SCOPE)                 │
│ └─ No RBAC (open access)                   │
└─────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────┐
│ Layer 4: Field-Level Authorization          │
│ - 根據 AccessScope/Permissions 過濾欄位     │
│ - @SensitiveField, @HQOnly 等裝飾器      │
└─────────────────────────────────────────────┘
```

---

## 資料模型

### 1. AccessScope Enum

```typescript
enum AccessScope {
  PUBLIC_SCOPE = 'PUBLIC_SCOPE', // 公開頁面訪問
  CUSTOMER_SCOPE = 'CUSTOMER_SCOPE', // 客戶儀表板訪問
  HQ_SCOPE = 'HQ_SCOPE', // 管理後台訪問
}
```

### 2. User Model (更新)

```prisma
model User {
  id            String        @id @default(dbgenerated("uuid_generate_v7()"))
  email         String        @unique
  name          String?
  password      String
  accessScopes  AccessScope[] // 用戶可以訪問的範圍（複數）
  refreshToken  String?
  lastLoginAt   DateTime?
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  deletedAt     DateTime?

  // 關聯
  profile       Profile?
  userRoles     UserRole[]    // 用戶擁有的角色（多對多）
}
```

### 3. Role Model

```prisma
model Role {
  id          String   @id @default(dbgenerated("uuid_generate_v7()"))
  name        String   // SUPER_HQ, OWNER, MEMBER, etc.
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
  name        String      @unique // "users:create", "audit-logs:export"
  resource    String      // "users", "audit-logs", "sessions"
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

## 權限命名規範

### 格式

```text
{resource}:{action}
```

### Resource 類別

模板僅內建身份/系統管理相關資源，業務模組請依需求擴充：

- `users` - 用戶管理
- `roles` - 角色管理
- `audit-logs` - 審計日誌
- `sessions` - 會話管理
- `cron_jobs` - 排程任務

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
users:create            // 創建用戶
users:list              // 查詢用戶列表
users:update            // 更新用戶
users:delete            // 刪除用戶
roles:manage            // 管理角色
audit-logs:read         // 查詢審計日誌
sessions:revoke_all     // 撤銷所有會話
cron_jobs:write         // 修改排程任務
```

---

## 預設角色與權限

> 完整的角色權限對照表請參考 [PERMISSION_SYSTEM.md](./PERMISSION_SYSTEM.md#角色權限對照表)。

### HQ Scope 角色

| 角色             | 說明       | 權限範圍                                              |
| ---------------- | ---------- | ----------------------------------------------------- |
| `SUPER_HQ`       | 超級管理員 | 自動繞過所有權限檢查                                  |
| `CONTENT_EDITOR` | 內容編輯   | HQ: users 完整管理；CUSTOMER: 用戶管理 + roles:manage |
| `VIEWER`         | 檢視者     | HQ: users:read/list + audit-logs:read + roles:read    |

### Customer Scope 角色

| 角色      | 說明   | 權限範圍                        |
| --------- | ------ | ------------------------------- |
| `OWNER`   | 擁有者 | 所有 CUSTOMER_SCOPE 權限        |
| `MANAGER` | 管理者 | 用戶管理（CUSTOMER_SCOPE 用戶） |
| `MEMBER`  | 成員   | users:read/list                 |
| `GUEST`   | 訪客   | **無任何權限**                  |

---

## JWT Token 結構

```typescript
interface JwtPayload {
  sub: string; // userId
  email: string;
  accessScopes: AccessScope[]; // ["CUSTOMER_SCOPE", "HQ_SCOPE"]
  isSuperHQ: boolean; // 是否為 SUPER_HQ（自動繞過所有權限）
  roles: {
    scope: AccessScope;
    roleNames: string[]; // ["OWNER", "SUPER_HQ"]
  }[];
  permissions: string[]; // ["users:create", "audit-logs:read", ...]
}
```

範例：

```json
{
  "sub": "019c1234-5678-...",
  "email": "hq@example.com",
  "accessScopes": ["HQ_SCOPE", "CUSTOMER_SCOPE"],
  "isSuperHQ": true,
  "roles": [
    { "scope": "HQ_SCOPE", "roleNames": ["SUPER_HQ"] },
    { "scope": "CUSTOMER_SCOPE", "roleNames": ["OWNER"] }
  ],
  "permissions": ["users:create", "users:read", "audit-logs:read", "..."],
  "iat": 1706342400,
  "exp": 1706343300
}
```

---

## 權限檢查流程

```typescript
// Step 1: 驗證 JWT Token
const user = await jwtStrategy.validate(token);

// Step 2: 檢查 AccessScope
if (!user.accessScopes.includes(requiredScope)) {
  throw new ForbiddenException('沒有訪問此介面的權限');
}

// Step 3: SUPER_HQ 自動繞過（僅限 SUPER_HQ 角色，非所有 HQ 用戶）
if (user.isSuperHQ) {
  return true; // 直接通過，不檢查具體權限
}

// Step 4: 檢查 Permission（含跨 Scope 檢查）
// 先在請求的 Scope 中檢查
let hasPermission = await permissionService.checkPermission(
  user.id,
  requiredScope,
  'users:create',
);

// 若未找到，且請求的不是 HQ_SCOPE，則也檢查 HQ_SCOPE 角色的權限
// （支援 CONTENT_EDITOR/VIEWER 跨 Scope 存取客戶端資料）
if (!hasPermission && requiredScope !== 'HQ_SCOPE') {
  hasPermission = await permissionService.checkPermission(
    user.id,
    'HQ_SCOPE',
    'users:create',
  );
}

if (!hasPermission) {
  throw new ForbiddenException('沒有執行此操作的權限');
}
```

---

## Decorator 使用範例

```typescript
// 檢查 AccessScope
@UseGuards(JwtAuthGuard)
@RequiresScope(AccessScope.HQ_SCOPE)
async hqOnlyOperation() { }

// 檢查 Permission
@UseGuards(JwtAuthGuard, PermissionGuard)
@RequiresPermission('users:create')
async createUser() { }

// 同時檢查 Scope + Permission
@UseGuards(JwtAuthGuard, PermissionGuard)
@RequiresScope(AccessScope.CUSTOMER_SCOPE)
@RequiresPermission('users:update')
async updateUser() { }
```

---

## Migration 策略

### 從現有系統遷移

1. 創建新的 RBAC 資料表
2. 資料遷移：
   - `UserRole.PUBLIC` → `accessScopes: [PUBLIC_SCOPE]`, roles: []
   - `UserRole.DASHBOARD` → `accessScopes: [CUSTOMER_SCOPE]`, roles: [MEMBER]
   - `UserRole.HQ` → `accessScopes: [HQ_SCOPE]`, roles: [SUPER_HQ]
3. 更新程式碼引用
4. 刪除舊的 `role` enum 欄位

---

## 未來擴展

### 1. 角色繼承

```text
HQ Scope:
  SUPER_HQ → CONTENT_EDITOR → VIEWER

Customer Scope:
  OWNER → MANAGER → MEMBER → GUEST
```

> 目前系統不支援自動角色繼承，每個角色的權限需個別分配。

### 2. 條件權限

```typescript
{
  permission: 'records:update',
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
  permission: 'reports:read_all',
  validFrom: '2026-01-01',
  validUntil: '2026-12-31'
}
```

---

## Phase 3: Field-Level Authorization (欄位級別授權)

### 概述

Field-Level Authorization 是 RBAC 系統的**第三層保護**，在 Response 階段動態過濾欄位。

```text
Request Flow:
Client → JWT Auth → AccessScope Check → Permission Check → Resolver → **Field Filter** → Response
```

### 三層權限控制

| 層級        | 檢查階段 | 控制範圍   | 實作方式                         |
| ----------- | -------- | ---------- | -------------------------------- |
| **Layer 1** | Request  | 介面訪問   | `@RequiresScope()`               |
| **Layer 2** | Request  | 操作權限   | `@RequiresPermission()`          |
| **Layer 3** | Response | 欄位可見性 | `@SensitiveField()`, `@HQOnly()` |

### 欄位裝飾器

```typescript
@ObjectType()
export class UserType {
  @Field()
  id: string; // 所有人可見

  @Field()
  @SensitiveField() // Customer 和 HQ 可見
  email: string;

  @Field({ nullable: true })
  @HQOnly() // 只有 HQ 可見
  deletedAt?: Date;
}
```

### 權限矩陣（含欄位級別）

| 欄位         | PUBLIC | CUSTOMER | HQ  |
| ------------ | ------ | -------- | --- |
| id, name     | ✅     | ✅       | ✅  |
| email, phone | ❌     | ✅       | ✅  |
| deletedAt    | ❌     | ❌       | ✅  |
| password     | ❌     | ❌       | ❌  |

### 效能優化

- **零 DB 查詢** - 權限從 JWT 讀取
- **O(1) 檢查** - 使用 `Set<AccessScope>`
- **原地過濾** - `delete obj[field]` 而非重建物件

詳細資訊請參考 [Field Authorization Documentation](./FIELD_AUTHORIZATION.md)。

---

## 相關文檔

- [權限系統](./PERMISSION_SYSTEM.md) - 完整的角色定義、權限清單及對照表（**主要參考**）
- [Row-Level Security](./ROW_LEVEL_SECURITY.md) - AccessScope 資料行過濾
- [Field-Level Authorization](./FIELD_AUTHORIZATION.md) - GraphQL 欄位權限
- [角色管理](../backend/ROLE_MANAGEMENT.md) - 角色分配/撤銷 API 與前端操作
- [Registration](./REGISTRATION.md) - 用戶註冊與權限分配
- [Token Configuration](./TOKEN-CONFIGURATION.md) - JWT Token 配置
