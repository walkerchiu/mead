# 角色管理 (Role Management)

說明如何透過 API 和 UI 為用戶分配或撤銷角色，以及各操作者的權限限制。

---

## 目錄

- [角色管理 (Role Management)](#角色管理-role-management)
  - [目錄](#目錄)
  - [概述](#概述)
  - [權限矩陣](#權限矩陣)
    - [操作者可分配的角色範圍](#操作者可分配的角色範圍)
    - [權限檢查流程](#權限檢查流程)
  - [GraphQL API](#graphql-api)
    - [Queries](#queries)
    - [Mutations](#mutations)
  - [前端操作](#前端操作)
    - [操作路徑](#操作路徑)
    - [管理角色對話框](#管理角色對話框)
  - [業務規則](#業務規則)
  - [架構說明](#架構說明)
    - [資料模型](#資料模型)
    - [權限檢查架構](#權限檢查架構)
    - [Token 更新機制](#token-更新機制)
  - [相關檔案](#相關檔案)

---

## 概述

角色管理功能允許擁有 `roles:manage` 權限的用戶為其他用戶分配或撤銷角色。系統根據操作者的身份（HQ / OWNER / MANAGER）限制可分配的角色範圍，防止權限升級攻擊。

所需權限：`roles:manage`

| Scope          | 擁有此權限的角色         |
| -------------- | ------------------------ |
| HQ_SCOPE       | SUPER_HQ, CONTENT_EDITOR |
| CUSTOMER_SCOPE | OWNER                    |

> MANAGER 沒有 `roles:manage` 權限，無法管理角色分配。
> CONTENT_EDITOR 擁有 `roles:manage`，但無法操作 SUPER_HQ 帳號。

---

## 權限矩陣

### 操作者可分配的角色範圍

| 操作者             | 可分配的角色              | 不可分配的角色 | 可操作的目標用戶          |
| ------------------ | ------------------------- | -------------- | ------------------------- |
| **SUPER_HQ**       | 所有角色（HQ + CUSTOMER） | —              | 所有用戶                  |
| **CONTENT_EDITOR** | 所有角色（HQ + CUSTOMER） | —              | 所有用戶（SUPER_HQ 除外） |
| **OWNER**          | 所有 CUSTOMER_SCOPE 角色  | HQ_SCOPE 角色  | CUSTOMER_SCOPE 用戶       |

> 撤銷角色的權限限制與分配相同。

### 權限檢查流程

```text
操作請求
    │
    ▼
┌─────────────────────────────────┐
│  1. Resolver 層                  │
│     確認用戶擁有 roles:manage    │
│     （跨 HQ/CUSTOMER 兩個 Scope）│
└─────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────┐
│  2. Service 層                   │
│                                 │
│  SUPER_HQ？                     │
│    → 無限制，直接執行            │
│                                 │
│  CONTENT_EDITOR？               │
│    → 不可操作 SUPER_HQ 帳號     │
│                                 │
│  非 HQ 用戶：                    │
│    → 目標角色必須是 CUSTOMER_SCOPE│
│    → 目標用戶必須有 CUSTOMER_SCOPE│
│    → 操作者的角色層級 ≥ 目標角色  │
└─────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────┐
│  3. 資料層                       │
│     PermissionService.grantRole()│
│     or .revokeRole()            │
└─────────────────────────────────┘
```

---

## GraphQL API

### Queries

#### 取得用戶的角色列表

```graphql
query UserRoles($userId: String!) {
  userRoles(userId: $userId) {
    id
    role {
      id
      name
      displayName
      scope
      description
      isSystem
    }
    grantedAt
    grantedBy
  }
}
```

回傳範圍依操作者身份而定：

- HQ：回傳該用戶在所有 Scope 的角色
- 非 HQ：僅回傳該用戶在 CUSTOMER_SCOPE 的角色

#### 取得可分配的角色列表

```graphql
query AssignableRoles {
  assignableRoles {
    id
    name
    displayName
    scope
    description
    isSystem
  }
}
```

回傳範圍依操作者身份而定：

- HQ：回傳所有 Scope 的角色
- OWNER：回傳所有 CUSTOMER_SCOPE 角色

### Mutations

#### 分配角色

```graphql
mutation AssignRole($input: AssignRoleInput!) {
  assignRole(input: $input)
}
```

Input 欄位：

- `targetUserId` (String!) — 目標用戶 ID
- `roleId` (String!) — 要分配的角色 ID

回傳 `Boolean`（成功為 `true`）。

#### 撤銷角色

```graphql
mutation RevokeRole($input: RevokeRoleInput!) {
  revokeRole(input: $input)
}
```

Input 欄位：

- `targetUserId` (String!) — 目標用戶 ID
- `roleId` (String!) — 要撤銷的角色 ID

回傳 `Boolean`（成功為 `true`）。

---

## 前端操作

### 操作路徑

```text
HQ 用戶管理頁面 (/hq/users)
  → 用戶列表的操作欄
    → 點擊「管理角色」圖示按鈕（ManageAccounts icon）
      → 開啟「管理角色」對話框

Customer 用戶管理頁面 (/users)
  → 用戶列表的操作欄
    → 點擊「管理角色」圖示按鈕
      → 開啟「管理角色」對話框（僅顯示 CUSTOMER_SCOPE 角色）
```

> 「管理角色」按鈕僅在用戶擁有 `roles:manage` 權限時顯示。
> CONTENT_EDITOR 可透過 `/hq/users` 管理用戶，但無法操作 SUPER_HQ 帳號。
> OWNER 可透過 `/users` 管理 CUSTOMER_SCOPE 用戶。

### 管理角色對話框

對話框分為兩個區塊：

#### 區塊一：目前角色

- 以 Chip 元件顯示用戶目前持有的角色
- 每個 Chip 顯示角色的 `displayName`
- 點擊 Chip 的刪除圖示可撤銷該角色（會先確認）

#### 區塊二：分配角色

- Select 下拉選單列出可分配但用戶尚未持有的角色
- 選擇角色後點擊「分配」按鈕執行分配
- 分配成功後自動重新載入角色列表

---

## 業務規則

1. **不可重複分配**：若用戶已持有該角色，分配操作會回傳衝突錯誤（Prisma unique constraint P2002）
2. **撤銷靜默成功**：撤銷不存在的角色不會拋出錯誤（使用 `deleteMany`）
3. **角色變更延遲生效**：角色變更立即寫入資料庫，但 JWT Token 中的角色資訊需等到下次 Token 更新才會反映（Access Token 15 分鐘過期、Refresh Token 7 天過期）
4. **後端即時檢查**：雖然 JWT 可能過期，但 `PermissionGuard` 在每次請求時都會從資料庫重新讀取角色，因此後端權限檢查是即時的
5. **系統角色保護**：所有預建角色標記為 `isSystem: true`，防止被刪除（由 `RoleService.deleteRole` 保護）

---

## 架構說明

### 資料模型

```text
User
  ├── accessScopes[]        → 存取範圍（HQ_SCOPE / CUSTOMER_SCOPE / PUBLIC_SCOPE）
  └── userRoles[]           → UserRole（多筆）
        ├── roleId          → Role
        ├── grantedAt       → 分配時間
        └── grantedBy       → 分配者 ID

Role
  ├── name                  → 角色名稱（如 OWNER、MANAGER）
  ├── displayName           → 顯示名稱（如 擁有者、管理者）
  ├── scope                 → 所屬 Scope
  ├── isSystem              → 是否為系統內建角色
  └── rolePermissions[]     → RolePermission → Permission
```

> `accessScopes` 和 `userRoles` 是獨立的概念。`accessScopes` 決定用戶可存取哪些 Scope，`userRoles` 決定用戶在該 Scope 中的具體角色和權限。

### 權限檢查架構

角色管理的權限檢查採用**雙層架構**：

#### Resolver 層

- 使用 `@RequiresAnyScope([HQ_SCOPE, CUSTOMER_SCOPE])` 確保用戶至少屬於其中一個 Scope
- 手動呼叫 `PermissionService.checkPermission()` 檢查 `roles:manage`，逐一對用戶的每個 Scope 進行檢查
- 這樣做是因為 `PermissionGuard` 的 `inferScope` 在用戶同時擁有多個 Scope 時可能無法正確推斷

#### Service 層

- 業務邏輯限制（OWNER 不能分配 HQ 角色等）在 Service 方法中檢查
- 從資料庫讀取操作者的角色來判斷其層級

### Token 更新機制

```text
角色分配/撤銷
    │
    ▼
資料庫立即更新（UserRole 表）
    │
    ├── 後端 PermissionGuard：每次請求從 DB 讀取 → 即時生效
    │
    └── 前端 JWT Token：包含角色快照 → 需等 Token 刷新
        ├── Access Token：15 分鐘過期 → 自動刷新
        └── 手動重新登入 → 立即取得新 Token
```

---

## 相關檔案

| 檔案                                                                | 說明                                            |
| ------------------------------------------------------------------- | ----------------------------------------------- |
| `apps/backend/database/prisma/seeds/base.ts`                        | 角色和權限的 Seed 定義（含 `roles:manage`）     |
| `apps/backend/src/modules/user/user.resolver.ts`                    | 角色管理 GraphQL Resolver                       |
| `apps/backend/src/modules/user/user.service.ts`                     | 角色管理業務邏輯（含權限矩陣檢查）              |
| `apps/backend/src/modules/user/user.types.ts`                       | `RoleType`、`UserRoleType` GraphQL 類型         |
| `apps/backend/src/modules/user/user.input.ts`                       | `AssignRoleInput`、`RevokeRoleInput`            |
| `apps/backend/src/rbac/permission.service.ts`                       | `grantRole()`、`revokeRole()`、`getUserRoles()` |
| `apps/backend/src/rbac/role.service.ts`                             | `getRolesByScope()`                             |
| `apps/frontend/src/graphql/users.ts`                                | 角色相關 GraphQL 操作                           |
| `apps/frontend/src/components/organisms/hq/ManageRolesDialog.tsx`   | 管理角色對話框                                  |
| `apps/frontend/src/app/[locale]/hq/users/page.tsx`                  | HQ 用戶管理頁面（接線對話框）                   |
| `apps/frontend/src/components/organisms/hq/UserTable/UserTable.tsx` | 用戶列表（管理角色按鈕）                        |
| `apps/frontend/src/hooks/usePermissions.ts`                         | 前端權限檢查 Hook                               |
| `docs/authentication/PERMISSION_SYSTEM.md`                          | 權限系統總覽（含角色定義和權限對照表）          |
