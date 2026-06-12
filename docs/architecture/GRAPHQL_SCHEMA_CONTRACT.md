# GraphQL Schema 合約

說明 backend NestJS + Apollo（code-first，`@nestjs/graphql`）schema 與 frontend Apollo Client
之間的命名 / 形狀 / 行為對齊規則。修動 schema 時請先讀過此文件。

> MEAD 後端採 **Apollo code-first**：schema 由 resolver 上的 `@ObjectType` / `@InputType` /
> `@Field` 裝飾器與 `createUnionType` 等推導，再由 `GraphQLModule` 的 `autoSchemaFile` 產生
> SDL 快照（見 [重新產生 schema.gql 快照](#重新產生-schemagql-快照)）。沒有獨立的手寫 schema 檔。

---

## 目錄

- [GraphQL Schema 合約](#graphql-schema-合約)
  - [目錄](#目錄)
  - [命名規則](#命名規則)
    - [型別名（Object / Input / Enum）](#型別名object--input--enum)
    - [Field 與 argument](#field-與-argument)
  - [型別映射](#型別映射)
    - [ID / 主鍵型別](#id--主鍵型別)
    - [Login union 回傳](#login-union-回傳)
    - [分頁形狀](#分頁形狀)
    - [用戶相關型別](#用戶相關型別)
  - [JWT Claim 形狀](#jwt-claim-形狀)
  - [過濾 / 分頁實作注意事項](#過濾--分頁實作注意事項)
    - [`usersPaginated` 對 accessScopes 過濾](#userspaginated-對-accessscopes-過濾)
    - [Prisma query 陷阱](#prisma-query-陷阱)
  - [Mutation 回傳型別與 Input 命名](#mutation-回傳型別與-input-命名)
  - [錯誤處理](#錯誤處理)
  - [驗證流程](#驗證流程)
    - [重新產生 `schema.gql` 快照](#重新產生-schemagql-快照)

---

## 命名規則

### 型別名（Object / Input / Enum）

MEAD 用 code-first，**schema 名直接由裝飾器決定**，無 nptc 那種 `Dto` 後綴 + interceptor 拔除的
機制。慣例：

| 規則                                                                          | 範例                                                           |
| ----------------------------------------------------------------------------- | -------------------------------------------------------------- |
| GraphQL ObjectType class 以 `Type` 後綴命名，但 schema 名以裝飾器第一引數覆寫 | `@ObjectType('User')` 的 `UserType` → schema 名 `User`         |
| 未指定名稱時，schema 名 = class 名去掉裝飾器無關修飾（多數仍帶 `Type`）       | `ProfileType` → `@ObjectType('Profile')` → `Profile`           |
| Enum 以 `registerEnumType` 顯式註冊 wire 名稱                                 | `registerEnumType(AccessScope, { name: 'AccessScope' })`       |
| Input class 以 `Input` 後綴，schema 名即 class 名                             | `HQUpdateUserInput`、`HQResetPasswordInput`、`CreateUserInput` |

新增型別時：

- ObjectType 要對齊前端期望的 schema 名時，在 `@ObjectType('<期望名>')` 第一引數指定（例如
  `apps/backend/src/modules/user/user.types.ts` 的 `@ObjectType('User')`）。
- Field-level 權限以裝飾器標註（`@SensitiveField()` / `@HQOnly()` / `@SelfAccessible()`），
  由 `FieldAuthPlugin` 在 runtime 把關（見 [欄位級別授權](../authentication/FIELD_AUTHORIZATION.md)）。

### Field 與 argument

- Resolver method 名即 GraphQL field 名（camelCase）。`hqUpdateUser` → `hqUpdateUser`；
  以 `@Query({ name: 'usersPaginated' })` 可覆寫（method 名與 schema 名不同時）。
- 參數以 `@Args('<name>')` 宣告，name 即 wire 上的 argument 名。`@Args('id') id: string` → `id: String!`。
- 個別欄位要對齊 FE 而 class 屬性名不同時，在 `@Field`／`@Args` 指定名稱即可（不需額外 mapper）。

## 型別映射

### ID / 主鍵型別

MEAD 的主鍵在 **DB 層為 `String @db.Uuid`（UUID v7，`dbgenerated("uuid_generate_v7()")`）**，
GraphQL 層以 `@Field(() => ID)` 暴露為 `ID`（runtime 即 string）。前端 GraphQL 變數宣告通常用
`$id: String!` 或 `$id: ID!`，兩者皆相容（`ID` scalar 接受字串輸入）。

> 不存在 nptc 的 `Guid → String!` 全局 rebind 問題：MEAD 從一開始就是字串型別，C# 那套
> `.BindRuntimeType<Guid, StringType>()` 在此**不適用**。

```graphql
# apps/backend/src/modules/user/user.types.ts
type User {
  id: ID!
  accountName: String # nullable；登入帳號
  email: String! # 已非唯一，僅通知用
  name: String
  # ...
}
```

### Login union 回傳

> `email` 參數名為向後相容保留，**語意為帳號（accountName）**——登入身分為帳號而非 email。
> 詳見 [Scope Routing](../authentication/SCOPE_ROUTING.md#帳號登入accountname)。

`login` 回傳 union，以 `@nestjs/graphql` 的 `createUnionType` 在 `apps/backend/src/auth/auth.resolver.ts`
組成：

```graphql
union LoginResult = AuthResponse | TwoFactorLoginResponse

mutation Login($email: String!, $password: String!, $rememberMe: Boolean) {
  login(email: $email, password: $password, rememberMe: $rememberMe) {
    ... on AuthResponse {
      accessToken
      user {
        id
        accountName
        email
        accessScopes
      }
    }
    ... on TwoFactorLoginResponse {
      requiresTwoFactor
      temporaryToken
      message
    }
  }
}
```

實作（`apps/backend/src/auth/auth.types.ts` + `auth.resolver.ts`）：

- `AuthResponse`（`@ObjectType`）：只含 `accessToken: String!` 與 `user: User!`；**refreshToken
  不在 GraphQL 回應**，由 resolver 寫入 HttpOnly Cookie（`setRefreshTokenCookie`）。
- `TwoFactorLoginResponse`（`@ObjectType`）：`requiresTwoFactor` / `temporaryToken` / `message`。
- `LoginResult = createUnionType({ name: 'LoginResult', types: () => [AuthResponse, TwoFactorLoginResponse] })`，
  `resolveType` 以 `'requiresTwoFactor' in value` 判別。
- `verifyTwoFactorLogin(input)` 直接回 `AuthResponse`（非 union）。
- `login` 的 `rememberMe: Boolean = false` 為選用參數，控制 `refresh_token` cookie 是否持久化
  （true → 帶 `maxAge` 的持久 cookie；false / 未傳 → session cookie）。此偏好另以 HttpOnly 的
  `remember_me` cookie 記錄，供 `refreshToken` / `verifyTwoFactorLogin` 重簽 cookie 時沿用
  （見 [Token 配置 — 記住我](../authentication/TOKEN-CONFIGURATION.md#記住我remember-me)）。

> 後端 service 內部用 `AuthTokenResult`（含 `refreshToken`）這個 **non-GraphQL** interface 傳遞，
> resolver destructure 出 `refreshToken` 設 cookie 後只回 `AuthResponse`。

### 分頁形狀

前端期望 `{data, pageInfo}`，MEAD 由共用工具 `createPaginationResult()`
（`apps/backend/src/common/utils/pagination.utils.ts`）產生，ObjectType 為 `PaginatedUsers` /
`PaginatedSessions` / `PaginatedAuditLogs`，共用 `PageInfo`：

```graphql
type PaginatedUsers {
  data: [User!]!
  pageInfo: PageInfo!
}
type PageInfo {
  currentPage: Int!
  totalPages: Int!
  totalCount: Int!
  limit: Int!
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
}
```

新增分頁 query 時：service 回 `PaginationResult<T>`，resolver 以對應 `Paginated<Xxx>` ObjectType
宣告回傳；分頁參數統一用 `PaginationInput`（`{ page, limit }`，預設 `{ page: 1, limit: 20 }`）。

### 用戶相關型別

- 主型別 `UserType`（schema 名 `User`），含 `id` / `accountName` / `email` / `name` /
  `accessScopes` / profile / roles 等。
- `UserBasicType`（schema 名 `UserBasic`）為精簡型別，供其他模組引用，不含敏感欄位。
- Login response 的 `user` 用 `User`；完整 roles / permissions 前端另外 call `me` 取得
  （`me` query 不受 accessScope 過濾，傳入完整 context 繞過 PUBLIC_SCOPE 限制）。
- 敏感欄位（`phone` / `address`）以 `@SensitiveField()` + `@SelfAccessible()` 標註，由
  `FieldAuthPlugin` 控制可見性。

## JWT Claim 形狀

JWT payload 由 `AuthService.generateTokens()`（`apps/backend/src/auth/auth.service.ts`）組裝，
型別為 `JwtPayload`（`apps/backend/src/auth/auth.types.ts`）。

| Claim 名稱           | 形狀                                                                                                                                                                                |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sub`                | UUID 字串（user id）                                                                                                                                                                |
| `email`              | string                                                                                                                                                                              |
| `accessScopes`       | `[string]`（wire format：`HQ_SCOPE` / `CUSTOMER_SCOPE` / `PUBLIC_SCOPE`）                                                                                                           |
| `permissions`        | `[string]`（例 `users:read`；由 `getPermissionsByRoleIds()` 經 role→permission 查詢扁平化）                                                                                         |
| `roles`              | `[{scope: string, roleNames: [string]}]`（陣列，不是 map；由 `groupRolesByScope()` 產生）                                                                                           |
| `mustChangePassword` | `true`（boolean）——**僅在須首次登入強制改密時才出現**；旗標為 false 時不發此 claim。詳見 [Scope Routing](../authentication/SCOPE_ROUTING.md#首次登入強制變更密碼mustchangepassword) |

> `sub` / `email` / `accessScopes` 為必帶；`roles` / `permissions` 在 `JwtPayload` 型別上為
> optional 但實際登入皆帶；`mustChangePassword` 以 spread 條件式插入（`...(user.mustChangePassword ? { mustChangePassword: true } : {})`），故 false 時 token 完全不含此 key。

授權：

- 統一用 scope 裝飾器：`@RequiresScope(AccessScope.HQ_SCOPE)` / `@RequiresAnyScope([...])`，
  搭配 `@UseGuards(PermissionGuard)`；permission 用 `@RequiresPermission('users:read')`。
- JWT 驗證走 `JwtAuthGuard`（`@UseGuards(JwtAuthGuard)`）；WebSocket subscription 在
  `app.module.ts` 的 `onConnect` 用 `jwt.verify(token, JWT_SECRET)` 驗簽並讀 `accessScopes`。
- `SUPER_HQ` 角色（`HQ_SCOPE` 下）在前端 `ProtectedRoute` 與後端會繞過 permission 檢查。

## 過濾 / 分頁實作注意事項

### `usersPaginated` 對 accessScopes 過濾

不同於 nptc 需 client-side filter，MEAD 的 `accessScopes` 是 Postgres enum 陣列欄位
（`AccessScope[]`），Prisma **原生支援** array 過濾，故直接在 `where` 用 `hasSome` / `has`：

```ts
// apps/backend/src/modules/user/user.service.ts — buildAccessScopeFilter()
if (accessScopes.includes(AccessScope.CUSTOMER_SCOPE)) {
  return {
    accessScopes: {
      hasSome: [AccessScope.CUSTOMER_SCOPE, AccessScope.PUBLIC_SCOPE],
    },
  };
}
```

`findAllUsersPaginated()` 把 base where（軟刪除）、accessScope filter、欄位 filter
（search / accessScope / roleId / status）合併後一次查 DB，並以 `Promise.all` 並行取
`findMany` 與 `count`。User 列表的 `findMany` 會 `include` profile + userRoles→role，再
map 成扁平 `roles` 陣列。

### Prisma query 陷阱

- **`String? @unique` 在 Postgres 允許多筆 `NULL`**：`accountName` DB 層 nullable，唯一性只對
  non-null 生效；必填性由 application 層（`assertValidAccountName`）強制。
- **case-insensitive 唯一性靠「儲存小寫」達成**：write-path `trim().toLowerCase()`，讀取用
  `findUnique({ where: { accountName } })` 命中 unique index；不要在查詢端套 `LOWER()`，否則
  退化成 seq scan 且繞過 index。
- **`findUnique` vs `findFirst`**：唯一鍵（`accountName` / `id`）用 `findUnique`；非唯一鍵
  （`email`，已 drop unique）必須用 `findFirst`（`password-reset.service.ts` 用
  `findFirst({ where: { email }, orderBy: { createdAt: 'asc' } })`）。
- **搜尋大小寫不敏感**用 Prisma 的 `mode: 'insensitive'`（`{ contains, mode: 'insensitive' }`）。

## Mutation 回傳型別與 Input 命名

| Mutation                                                | Input / Args                               | Return                                                       |
| ------------------------------------------------------- | ------------------------------------------ | ------------------------------------------------------------ |
| `login(email, password, rememberMe?)`                   | flat args（`rememberMe: Boolean = false`） | `LoginResult`（union）                                       |
| `verifyTwoFactorLogin(input)`                           | `VerifyTwoFactorInput`                     | `AuthResponse`                                               |
| `refreshToken`                                          | （cookie，無 args）                        | `AuthResponse`                                               |
| `registerCustomer(accountName, email, password, name?)` | flat args                                  | `AuthResponse`                                               |
| `registerHQ(accountName, email, password, name?)`       | flat args                                  | `AuthResponse`                                               |
| `requestPasswordReset(email)`                           | flat                                       | `PasswordResetResponse { success, message }`                 |
| `resetPassword(token, newPassword)`                     | flat                                       | `Boolean!`                                                   |
| `verifyPasswordResetToken(token)` (query)               | flat                                       | `VerifyTokenResponse { valid: Boolean! }`                    |
| `me` (query)                                            | —                                          | `User`                                                       |
| `createUser(input)`                                     | `CreateUserInput`                          | `User`（含 `accountName`，建立後 `mustChangePassword=true`） |
| `hqUpdateUser(id, input)`                               | `HQUpdateUserInput`                        | `User`                                                       |
| `hqResetPassword(id, input)`                            | `HQResetPasswordInput`                     | `Boolean!`（重設後 `mustChangePassword=true`）               |
| `changePassword(input)`                                 | `ChangePasswordInput`                      | `Boolean!`（成功後 `mustChangePassword=false`）              |
| `lockUser(id, input)` / `unlockUser(id)`                | `LockUserInput` / flat                     | `User`                                                       |
| `softDeleteUser(id)` / `restoreUser(id)`                | flat                                       | `User`                                                       |
| `assignRole(input)` / `revokeRole(input)`               | `AssignRoleInput` / `RevokeRoleInput`      | `Boolean!`                                                   |

> MEAD 的 mutation 回 `User` 時，service 內已 `include: { profile: true }` 重新查回完整實體，
> 不需 nptc 那種 `ReloadAsUserAsync` 的 mediator reload pattern（MEAD 無 MediatR / CQRS handler）。

## 錯誤處理

- 後端用 NestJS 例外（`UnauthorizedException` / `ForbiddenException` / `BadRequestException` /
  `ConflictException` / `NotFoundException`），訊息經 `nestjs-i18n` 的 `i18n.translate(...)` 在地化。
- Rate limit 用 `@nestjs/throttler` 的 `@Throttle({ default: { limit, ttl } })`（login 5/60s、
  requestPasswordReset 3/300s 等），全域 `GqlThrottlerGuard`。
- Query 安全：`validationRules: [depthLimit(10)]` + `QueryComplexityPlugin`；production 僅 HQ 可
  introspection（`app.module.ts` 的 `didResolveOperation` 攔截 `IntrospectionQuery`）。

## 驗證流程

每次動 schema 後請跑：

```bash
# Backend 測試（單元 + i18n 完整性）
pnpm --filter @mead/backend test
pnpm --filter @mead/backend run test:contract   # GraphQL 契約測試（如有對應 spec）

# Backend 型別檢查
pnpm --filter @mead/backend type-check

# 前端型別檢查
pnpm --filter @mead/frontend type-check
```

### 重新產生 `schema.gql` 快照

MEAD 用 Apollo **code-first** `autoSchemaFile`，schema 由後端 build/start 時自動產生 —— 不需
手動 introspection 匯出。`GraphQLModule` 配置（`apps/backend/src/app.module.ts`）：

```ts
GraphQLModule.forRootAsync<ApolloDriverConfig>({
  driver: ApolloDriver,
  useFactory: () => ({
    autoSchemaFile: 'schema.gql', // 產生於 apps/backend/schema.gql
    sortSchema: true, // 穩定排序，利於 diff
    // ...
  }),
});
```

因此「重新產生快照」= 啟動或建置後端：

```bash
# 任一即可觸發 schema.gql 重新產生
pnpm --filter @mead/backend build       # nest build
pnpm --filter @mead/backend start:dev    # watch 模式，存檔即重產
```

`sortSchema: true` 確保欄位穩定排序，便於 git diff 審查。**動過 schema（新增/改 type、input、
mutation 等）後務必把更新後的 `apps/backend/schema.gql` 一起提交**，否則快照會與實作脫節
（例：帳號登入把 `User` 加上 `accountName` 後，舊快照仍只有 `email`）。
