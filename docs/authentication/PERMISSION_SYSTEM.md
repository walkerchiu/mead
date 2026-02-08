# 權限系統 (Permission System)

基於角色的存取控制（RBAC），透過 Scope、Role、Permission 三層架構管理系統權限。模板僅內建與身份/系統管理相關的權限（用戶、角色、稽核、會話、排程），業務模組請依需要自行擴充。

---

## 📋 目錄

- [📖 概述](#-概述)
- [🔑 權限動作類型](#-權限動作類型)
- [📊 權限清單](#-權限清單)
- [👤 角色定義](#-角色定義)
- [🏗️ 架構設計](#-架構設計)
- [⚙️ 權限隱含規則](#-權限隱含規則)
- [📁 相關檔案](#-相關檔案)

---

## 📖 概述

### 核心架構

系統採用三層權限架構：

```text
Scope（存取範圍）
  └── Role（角色）
        └── Permission（權限）= resource:action
```

- **Scope**：定義使用者的存取範圍（HQ 管理層 / Customer 業務層 / Public 公開層）
- **Role**：在特定 Scope 下的角色（如 SUPER_HQ、OWNER、MANAGER）
- **Permission**：具體的操作權限，格式為 `resource:action`（如 `users:create`）

### 設計原則

1. **Scope 隔離**：不同 Scope 的權限互不影響，防止權限升級攻擊
2. **Resource:Action 命名**：所有權限統一使用 `資源:動作` 格式
3. **Manage 超級權限**：`resource:manage` 自動包含該資源的所有其他動作
4. **SUPER_HQ 自動提升**：僅 SUPER_HQ 角色自動繞過所有權限檢查
5. **跨 Scope 權限檢查**：HQ_SCOPE 角色可持有 CUSTOMER_SCOPE 權限
6. **雙層防護**：後端（GraphQL Guard）負責安全驗證，前端（Hook）負責 UI 顯示控制

---

## 🔑 權限動作類型

### 基本 CRUD 動作

| 動作      | 說明                               | 使用情境                |
| --------- | ---------------------------------- | ----------------------- |
| `create`  | 新增資源                           | 建立新用戶              |
| `read`    | 讀取**單一**資源的詳細資料         | 查看某筆資源的完整內容  |
| `list`    | 取得資源的**列表**（含分頁、篩選） | 瀏覽列表頁              |
| `update`  | 修改既有資源                       | 編輯資源                |
| `delete`  | 軟刪除資源                         | 刪除用戶                |
| `restore` | 還原已軟刪除的資源                 | 還原誤刪的用戶（僅 HQ） |

> **`read` vs `list`**
>
> - `read`：取得單一資源的完整詳情（Detail View）
> - `list`：取得資源集合的摘要列表（List View）
> - 兩者獨立控制

### 全權管理動作

| 動作     | 說明                                 | 使用情境             |
| -------- | ------------------------------------ | -------------------- |
| `manage` | 該資源的**所有操作權限**（超級權限） | 角色管理、新業務模組 |

> **關鍵規則**：擁有 `resource:manage` 自動包含該資源的 `create`、`read`、`update`、`delete`、`list` 等所有動作。

### 特殊動作

| 動作             | 說明                           | 範例                    |
| ---------------- | ------------------------------ | ----------------------- |
| `export`         | 匯出資料                       | `audit-logs:export`     |
| `read_all`       | 讀取**全部**資料（不限自己的） | `sessions:read_all`     |
| `read_user`      | 讀取**特定用戶**的資料         | `sessions:read_user`    |
| `reset_password` | 重設密碼                       | `users:reset_password`  |
| `write`          | 寫入/修改設定                  | `cron_jobs:write`       |
| `revoke`         | 撤銷                           | `sessions:revoke`       |
| `revoke_user`    | 撤銷特定用戶                   | `sessions:revoke_user`  |
| `revoke_batch`   | 批次撤銷                       | `sessions:revoke_batch` |
| `revoke_all`     | 撤銷全部                       | `sessions:revoke_all`   |

---

## 📊 權限清單

### HQ_SCOPE 權限（系統管理層）

用於後台管理功能。

**用戶管理**

| 權限名稱               | 說明           |
| ---------------------- | -------------- |
| `users:create`         | 建立新用戶     |
| `users:read`           | 查看用戶詳情   |
| `users:list`           | 瀏覽用戶列表   |
| `users:update`         | 修改用戶資料   |
| `users:delete`         | 軟刪除用戶     |
| `users:restore`        | 還原已刪除用戶 |
| `users:reset_password` | 重設用戶密碼   |

**稽核日誌**

| 權限名稱            | 說明         |
| ------------------- | ------------ |
| `audit-logs:read`   | 查看稽核日誌 |
| `audit-logs:export` | 匯出稽核日誌 |

**角色管理**

| 權限名稱       | 說明                         |
| -------------- | ---------------------------- |
| `roles:manage` | 管理角色（建立、編輯、刪除） |
| `roles:read`   | 讀取角色（VIEWER 用）        |

**會話管理**

| 權限名稱                | 說明               |
| ----------------------- | ------------------ |
| `sessions:read`         | 查看自己的會話     |
| `sessions:read_user`    | 查看特定用戶的會話 |
| `sessions:read_all`     | 查看所有會話       |
| `sessions:revoke`       | 撤銷自己的會話     |
| `sessions:revoke_user`  | 撤銷特定用戶的會話 |
| `sessions:revoke_batch` | 批次撤銷會話       |
| `sessions:revoke_all`   | 撤銷所有會話       |

**排程任務**

| 權限名稱          | 說明             |
| ----------------- | ---------------- |
| `cron_jobs:read`  | 查看排程任務設定 |
| `cron_jobs:write` | 修改排程任務設定 |

### CUSTOMER_SCOPE 權限（業務操作層）

模板僅保留與用戶、角色相關的權限。其他業務權限請依需求新增於 `apps/backend/database/prisma/seeds/base.ts`。

**用戶管理**

| 權限名稱               | 說明                                 |
| ---------------------- | ------------------------------------ |
| `users:read`           | 查看用戶資訊                         |
| `users:list`           | 查詢用戶列表                         |
| `users:create`         | 建立新用戶（OWNER / MANAGER 可建立） |
| `users:update`         | 修改用戶資料                         |
| `users:delete`         | 軟刪除用戶                           |
| `users:reset_password` | 重設用戶密碼                         |

**角色**

| 權限名稱       | 說明             |
| -------------- | ---------------- |
| `roles:manage` | 管理用戶角色分配 |

### PUBLIC_SCOPE

所有登入用戶都擁有的基本資料存取（profile 讀寫透過 JwtAuthGuard 控制，不另設 permission）。

---

## 👤 角色定義

### HQ Scope 角色

| 角色             | 顯示名稱   | 說明                                 |
| ---------------- | ---------- | ------------------------------------ |
| `SUPER_HQ`       | 超級管理員 | 擁有所有權限（自動繞過所有權限檢查） |
| `CONTENT_EDITOR` | 內容編輯   | 可管理客戶端用戶，無法操作 SUPER_HQ  |
| `VIEWER`         | 檢視者     | 僅能查看用戶與稽核日誌               |

### Customer Scope 角色

| 角色      | 顯示名稱 | 說明                            |
| --------- | -------- | ------------------------------- |
| `OWNER`   | 擁有者   | 擁有所有 CUSTOMER_SCOPE 權限    |
| `MANAGER` | 管理者   | 用戶管理（CUSTOMER_SCOPE 用戶） |
| `MEMBER`  | 成員     | 僅能查詢用戶                    |
| `GUEST`   | 訪客     | 無任何權限（僅能登入）          |

### 角色權限對照表（Customer Scope）

| 權限                   | OWNER | MANAGER | MEMBER | GUEST |
| ---------------------- | :---: | :-----: | :----: | :---: |
| `users:read`           |   ●   |    ●    |   ●    |   -   |
| `users:list`           |   ●   |    ●    |   ●    |   -   |
| `users:create`         |   ●   |    ●    |   -    |   -   |
| `users:update`         |   ●   |    ●    |   -    |   -   |
| `users:delete`         |   ●   |    ●    |   -    |   -   |
| `users:reset_password` |   ●   |    ●    |   -    |   -   |
| `roles:manage`         |   ●   |    -    |   -    |   -   |

### 角色權限對照表（HQ Scope，SUPER_HQ 略）

| 權限                   | CONTENT_EDITOR | VIEWER |
| ---------------------- | :------------: | :----: |
| `users:read`           |       ●        |   ●    |
| `users:list`           |       ●        |   ●    |
| `users:create`         |       ●        |   -    |
| `users:update`         |       ●        |   -    |
| `users:delete`         |       ●        |   -    |
| `users:restore`        |       ●        |   -    |
| `users:reset_password` |       ●        |   -    |
| `audit-logs:read`      |       -        |   ●    |
| `roles:read`           |       -        |   ●    |
| `roles:manage`         |       ●        |   -    |

---

## 🏗️ 架構設計

### 後端權限檢查流程

```text
GraphQL Request
    │
    ▼
┌─────────────────────┐
│  PermissionGuard    │
│                     │
│  1. JWT 驗證         │ ─── 驗證 Token 有效性
│  2. Scope 檢查       │ ─── 使用者是否有所需的 AccessScope
│  3. 權限檢查         │ ─── 是否擁有操作所需的具體權限
│  4. SUPER_HQ 自動提升 │ ─── 僅 SUPER_HQ 自動繞過所有權限
└─────────────────────┘
    │
    ▼
  Resolver 執行
```

### Decorator 使用方式

```typescript
// 要求特定 Scope
@RequiresScope(AccessScope.CUSTOMER_SCOPE)

// 要求單一權限
@RequiresPermission('users:create')

// 要求任一權限（OR 邏輯）
@RequiresAnyPermission(['users:read', 'users:list'])

// 要求所有權限（AND 邏輯）
@RequiresAllPermissions(['users:read', 'roles:manage'])
```

### 前端權限檢查

```typescript
import { usePermissions } from '@/hooks/usePermissions';

const { hasPermission, hasRole, hasScope } = usePermissions();

if (hasPermission('users:create')) {
  // 顯示用戶建立 UI
}

if (hasRole('MANAGER')) {
  // 顯示管理者專屬功能
}

if (hasScope('HQ_SCOPE')) {
  // 顯示後台管理功能
}
```

> **注意**：前端權限檢查僅用於 UI 顯示控制，不具備安全性。真正的權限驗證在後端 Guard 層。

---

## ⚙️ 權限隱含規則

1. **`manage` 包含所有動作**
   - 擁有 `resource:manage` → 自動擁有該資源的 `create`、`read`、`update`、`delete`、`list` 等所有動作

2. **SUPER_HQ 自動提升**
   - 僅 SUPER_HQ 角色自動繞過所有權限檢查
   - 其他 HQ_SCOPE 角色（CONTENT_EDITOR、VIEWER）需依照實際分配的權限控制

3. **跨 Scope 權限檢查**
   - HQ_SCOPE 角色可持有 CUSTOMER_SCOPE 的權限
   - 系統在檢查 CUSTOMER_SCOPE 權限時，也會查詢使用者的 HQ_SCOPE 角色是否持有該權限

4. **同一權限可存在於不同 Scope**
   - 例如 `users:read` 同時存在於 HQ_SCOPE 和 CUSTOMER_SCOPE
   - HQ_SCOPE 的 `users:read` 可存取完整用戶資料
   - CUSTOMER_SCOPE 的 `users:read` 範圍受 RLS 控制

---

## 📁 相關檔案

| 檔案                                                                  | 說明                                 |
| --------------------------------------------------------------------- | ------------------------------------ |
| `apps/backend/database/prisma/seeds/base.ts`                          | 權限、角色、角色權限對應的 Seed 定義 |
| `apps/backend/database/prisma/schemas/permission.prisma`              | Permission 資料模型                  |
| `apps/backend/database/prisma/schemas/role.prisma`                    | Role 資料模型                        |
| `apps/backend/database/prisma/schemas/role-permission.prisma`         | 角色-權限對應模型                    |
| `apps/backend/src/common/guards/permission.guard.ts`                  | 後端權限驗證 Guard                   |
| `apps/backend/src/rbac/permission.service.ts`                         | 權限檢查服務（含 manage 隱含邏輯）   |
| `apps/backend/src/common/decorators/requires-permission.decorator.ts` | 權限 Decorator 定義                  |
| `apps/frontend/src/hooks/usePermissions.ts`                           | 前端權限檢查 Hook                    |
