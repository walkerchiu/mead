# Backend Conventions

## 目錄

- [1. RBAC 命名風格：action-semantic](#1-rbac-命名風格action-semantic)
- [2. Resolver arg 命名規則](#2-resolver-arg-命名規則)
  - [2.1 單一目標 mutation（CRUD 該 resource 本身）— 用 `id`](#21-單一目標-mutationcrud-該-resource-本身-用-id)
  - [2.2 關係型 mutation（兩個 resource 間的 link，無「單一 target」）— 全用 `{X}Id`](#22-關係型-mutation兩個-resource-間的-link無單一-target-全用-xid)
  - [2.3 單一資源 Query（拿一筆）— 用 `id`](#23-單一資源-query拿一筆-用-id)
  - [2.4 Collection Query（scoped 列表或相關子集）— 用 `{X}Id`](#24-collection-queryscoped-列表或相關子集-用-xid)
  - [2.5 Delete mutation 回傳型別](#25-delete-mutation-回傳型別)
- [3. GraphQL schema 常用型別欄位](#3-graphql-schema-常用型別欄位)
  - [3.1 `PageInfo`](#31-pageinfo)
  - [3.2 `{Module}ActivityEvent`（業務模組擴充用）](#32-moduleactivityevent業務模組擴充用)
- [4. Resolver 守法：用 decorator，不要硬編角色名](#4-resolver-守法用-decorator不要硬編角色名)
  - [正確](#正確)
  - [錯誤](#錯誤)
  - [例外可以手動檢查](#例外可以手動檢查)
- [5. 模板內建 baseline permission](#5-模板內建-baseline-permission)
  - [HQ_SCOPE](#hq_scope)
  - [CUSTOMER_SCOPE](#customer_scope)
- [6. 檢核工具](#6-檢核工具)
  - [加新規則](#加新規則)

---

> 本文件定義 NPT 模板的後端慣例。新業務模組請依此規範實作。
>
> 本文件由 Phase 0 建立，之後每次 convention 變更都要 commit 更新。

## 1. RBAC 命名風格：action-semantic

使用 **描述動作 / 語意** 的權限名，不是 CRUD 動詞。

| ✅ 推薦                                                      | ❌ 避免                                        |
| ------------------------------------------------------------ | ---------------------------------------------- |
| `users:reset_password`                                       | `users:update`（不夠具體）                     |
| `users:read_all`                                             | `users:read`（該描述「全部」還是「自己的」？） |
| `roles:manage`                                               | `roles:delete`（delete 只是管理的一環）        |
| `sessions:revoke_batch`（批次） vs `sessions:revoke`（單筆） | `sessions:admin`（角色名當權限）               |

**原則**：

- `{resource}:read_all` — 讀取全部（跨 ownership 邊界）
- `{resource}:read` — 讀取自己相關的（如果真的需要跟 read_all 區分）
- `{resource}:create` — 建立
- `{resource}:update` — 非管理性的一般更新（有使用者操作）
- `{resource}:manage` — 管理者權限（含刪除、全域行為）
- `{resource}:manage_members` — 成員管理（專門切出來）
- `{resource}:assign` — 指派
- 不要直接用 `delete`；用 `manage` 包含

## 2. Resolver arg 命名規則

依「是單一目標還是關係／集合」分四類：

### 2.1 單一目標 mutation（CRUD 該 resource 本身）— 用 `id`

```graphql
updateUser(id: ID!, input: ...): User
deleteUser(id: ID!): Boolean
```

### 2.2 關係型 mutation（兩個 resource 間的 link，無「單一 target」）— 全用 `{X}Id`

```graphql
assignRole(userId: ID!, roleId: ID!): UserRole
revokeRole(userId: ID!, roleId: ID!): Boolean
```

### 2.3 單一資源 Query（拿一筆）— 用 `id`

```graphql
user(id: ID!): User
role(id: ID!): Role
```

### 2.4 Collection Query（scoped 列表或相關子集）— 用 `{X}Id`

```graphql
userSessions(userId: ID!): [Session]
userRoles(userId: ID!): [UserRole]
```

### 2.5 Delete mutation 回傳型別

**單一目標 delete** 統一 **`Boolean`**：

```graphql
deleteUser(id: ID!): Boolean
revokeSession(id: ID!): Boolean
```

**批次 delete** 回被刪除的**數量**（`Int`）：

```graphql
deleteReadNotifications: Int    # 回用戶被清掉的通知數
revokeAllSessions(userId: ID!): Int
```

**理由**：

- 所有 single-target delete 都是 soft delete（設 `deletedAt`），回 Boolean 表操作成功即可。
- 批次 delete 的數量對客端有資訊價值（顯示「已清 42 則通知」），回 Int 合理。
- 客端需要 deletedAt / 個別 metadata 時，從 activity feed / audit log 取，不從 mutation return value 取。

**參考**：GraphQL/Relay 慣例以 `id` 為單一資源主鍵。

## 3. GraphQL schema 常用型別欄位

### 3.1 `PageInfo`

```graphql
type PageInfo {
  currentPage: Int!
  totalPages: Int!
  totalCount: Int!
  limit: Int!
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
}
```

對應 `PaginatedResult<T> { data: [T!]!, pageInfo: PageInfo! }`。

**不要用** `total / page`；全部用 `totalCount / currentPage`。

任何分頁 wrapper（如 `XXXConnection`、`XXXHistoryType`）都**必須**回 `{ data, pageInfo }` 兩欄格式；不可把 `total / page / limit / totalPages` 拆成 flat fields。

### 3.2 `{Module}ActivityEvent`（業務模組擴充用）

新業務模組若有活動日誌需求，建議使用統一的**欄位名**：

```graphql
type {Module}ActivityEvent {
  id: ID!
  eventType: String!   # 不要用 "type"
  timestamp: DateTime! # 不要用 "createdAt"
  actorId: ID
  actorName: String
  actorEmail: String
  # ... 事件特定欄位
}
```

**`eventType` 的 enum 值由各 module 自決**（不強制跨模組統一）。語意不同就用不同名稱，**不為了一致性丟掉 domain 語意**。

#### 評論事件（若新模組支援評論）

統一使用以下三種 event：

| eventType         | 觸發時機                                | timestamp 來源      | 主要欄位                                   |
| ----------------- | --------------------------------------- | ------------------- | ------------------------------------------ |
| `COMMENT_CREATED` | 評論被建立                              | `comment.createdAt` | `commentContent`                           |
| `COMMENT_EDIT`    | 評論被編輯（每筆 history row 一個事件） | `history.editedAt`  | `commentContent`（變更前快照）、`editNote` |
| `COMMENT_DELETED` | 評論被軟刪除                            | `comment.deletedAt` | `commentContent`（被刪內容）               |

實作要點：

- `getActivityFeed` **要關掉 softDelete filter** 才讀得到 `deletedAt`
- `COMMENT_DELETED` 與 `COMMENT_CREATED` 共用一筆 row，只是 timestamp 不同；id 用 `${comment.id}-created` / `${comment.id}-deleted` 避免 React key 衝突
- 編輯歷史獨立寫入 `*-comment-history` 表，**不會被連動軟刪**

## 4. Resolver 守法：用 decorator，不要硬編角色名

### 正確

```ts
@Mutation(...)
@UseGuards(PermissionGuard)
@RequiresScope(AccessScope.HQ_SCOPE)
@RequiresPermission('users:create')
async createUser(...) { ... }
```

或

```ts
@RequiresAnyPermission(['users:read', 'users:list'])
async listUsers(...) { ... }
```

### 錯誤

```ts
const isManager = user.roles?.some(
  (r) => r.roleNames?.includes('MANAGER') || r.roleNames?.includes('SUPER_HQ'),
);
if (!isManager && !user.isSuperHQ) {
  throw new ForbiddenException('只有管理者可以執行');
}
```

**理由**：角色名改了會靜默讓 resolver 壞掉；RBAC 的角色 ↔ 權限對應本來就該在 seed 裡宣告，resolver 只認 permission key。

### 例外可以手動檢查

- `isSuperHQ` — 超級管理員 bypass 屬於框架層慣例，允許留
- `me` / `updateProfileSelf` 這類「對當前使用者自己」的 operation — 只 `@UseGuards(JwtAuthGuard)` 即可，不需 permission

## 5. 模板內建 baseline permission

模板僅內建身份/系統管理權限，業務模組請依需要擴充並在 seed 中註冊。

### HQ_SCOPE

| Permission                                                                                | 說明            | 守在                     |
| ----------------------------------------------------------------------------------------- | --------------- | ------------------------ |
| `users:create / read / list / update / delete / restore / reset_password`                 | 使用者 CRUD     | user.resolver            |
| `roles:read / manage`                                                                     | 角色查詢 / 管理 | rbac.resolver            |
| `audit-logs:read / export`                                                                | 稽核日誌        | audit-log.resolver       |
| `sessions:read / read_user / read_all / revoke / revoke_user / revoke_batch / revoke_all` | 會話管理        | session resolver         |
| `cron_jobs:read / write`                                                                  | Cron 監控       | cron-monitoring resolver |

### CUSTOMER_SCOPE

| Permission                                                      | 說明                  |
| --------------------------------------------------------------- | --------------------- |
| `users:read / list / create / update / delete / reset_password` | CUSTOMER 用戶基本管理 |
| `roles:manage`                                                  | 用戶角色分配          |

業務模組的 permission 由各 repo 自行擴充，但命名須符合 §1 規則。

## 6. 檢核工具

`./scripts/cli.sh drift` 會自動比對：

- **§5 baseline permission**：seed 檔必須都含 baseline 權限清單
- **§2.1~2.3 Mutation / Query arg 命名**：single-target 操作（update/delete / single Query）不得用 `{X}Id`
- **§2.5 Delete 返回型別**：non-document / non-bulk delete 必須回 `Boolean`
- **§3.1 分頁包裝類型**：登記在 `PAGINATION_WRAPPER_TYPES` 的型別必須有 `data + pageInfo` 欄位
- **§3.1 PageInfo / §3.2 ActivityEvent**：欄位名必須完整
- **§4 Resolver 守法**：`*.resolver.ts` 內禁止硬編角色名（`plugin / guard` 框架層不查）

有任一違規 → 列印對照表、`exit 1`。PR 合入前建議執行：

```bash
./scripts/cli.sh drift
```

### 加新規則

修改 `scripts/check-drift.py` 頂部的常數：

- `BASELINE_PERMS`：§5 baseline 權限
- `FORBIDDEN_PERMS`：已廢棄、不得復活的權限
- `SINGLE_TARGET_VIOLATIONS`：單一目標操作的 arg 禁用 pattern
- `FORBIDDEN_ROLE_PATTERNS`：resolver 層禁用的角色硬編 regex
- `EXPECTED_PAGE_INFO_FIELDS` / `EXPECTED_ACTIVITY_EVENT_FIELDS`：型別欄位
- `PAGINATION_WRAPPER_TYPES`：已登記的分頁包裝型別
- `DELETE_RETURNS_ENTITY_ALLOWED`：delete mutation 回非 Boolean 的白名單
