# 用戶註冊系統

受邀請制註冊系統，由現有用戶創建新帳號，確保安全的用戶管理。

---

## 目錄

- [用戶註冊系統](#用戶註冊系統)
  - [目錄](#目錄)
  - [概述](#概述)
  - [註冊端點](#註冊端點)
    - [1. `registerCustomer` - 註冊客戶用戶](#1-registercustomer---註冊客戶用戶)
    - [2. `registerHQ` - 註冊管理員用戶](#2-registerhq---註冊管理員用戶)
  - [密碼要求](#密碼要求)
  - [訪問層級說明](#訪問層級說明)
    - [CUSTOMER_SCOPE 客戶層級](#customer_scope-客戶層級)
    - [HQ_SCOPE 管理員層級](#hq_scope-管理員層級)
  - [初始化系統](#初始化系統)
    - [方法 1：使用 Seed 腳本（推薦）](#方法-1使用-seed-腳本推薦)
    - [方法 2：直接在數據庫創建](#方法-2直接在數據庫創建)
  - [完整使用流程](#完整使用流程)
    - [步驟 1：使用 Seed 創建初始管理員](#步驟-1使用-seed-創建初始管理員)
    - [步驟 2：管理員登入](#步驟-2管理員登入)
    - [步驟 3：管理員創建新客戶](#步驟-3管理員創建新客戶)
    - [步驟 4：客戶邀請團隊成員](#步驟-4客戶邀請團隊成員)
  - [HTTP Headers 設置](#http-headers-設置)
  - [錯誤處理](#錯誤處理)
    - [常見錯誤](#常見錯誤)
      - [1. `UNAUTHENTICATED` - 未登入](#1-unauthenticated---未登入)
      - [2. `FORBIDDEN` - 權限不足](#2-forbidden---權限不足)
      - [3. `CONFLICT` - 帳號已存在](#3-conflict---帳號已存在)
      - [4. `BAD_USER_INPUT` - 密碼強度不足](#4-bad_user_input---密碼強度不足)
  - [首次登入強制變更密碼](#首次登入強制變更密碼)
  - [安全考量](#安全考量)
    - [1. **不提供公開註冊**](#1-不提供公開註冊)
    - [2. **層級權限分離**](#2-層級權限分離)
    - [3. **密碼強度驗證**](#3-密碼強度驗證)
    - [4. **JWT Token 管理**](#4-jwt-token-管理)
  - [常見問題 (FAQ)](#常見問題-faq)
    - [Q: 如果沒有任何用戶，如何創建第一個管理員？](#q-如果沒有任何用戶如何創建第一個管理員)
    - [Q: 客戶可以邀請無限多的用戶嗎？](#q-客戶可以邀請無限多的用戶嗎)
    - [Q: 創建的用戶會自動分配角色嗎？](#q-創建的用戶會自動分配角色嗎)
    - [Q: 可以將 Customer 升級為 HQ 嗎？](#q-可以將-customer-升級為-hq-嗎)
    - [Q: 密碼可以在註冊後修改嗎？](#q-密碼可以在註冊後修改嗎)
  - [相關文檔](#相關文檔)

---

## 概述

本系統採用**受邀請制註冊**，不提供公開註冊端點。新用戶需要由現有的 Customer 或 HQ 用戶創建。

> **登入身分為「帳號（`accountName`）」而非 email。** 註冊 / 建立帳號時須同時提供唯一的
> `accountName`（3-20 英數底線，case-insensitive 唯一）；`email` 已改為**非唯一**、僅供通知用。
> 登入、忘記密碼、scope 分軌與首登強制改密的完整說明見
> [Scope-Based Auth Routing](./SCOPE_ROUTING.md)。

---

## 註冊端點

### 1. `registerCustomer` - 註冊客戶用戶

**權限要求**：

- ✅ `CUSTOMER_SCOPE`（客戶層級用戶）
- ✅ `HQ_SCOPE`（管理員層級用戶）

**創建的用戶層級**：`CUSTOMER_SCOPE`

**GraphQL Mutation**：

```graphql
mutation RegisterCustomer(
  $accountName: String!
  $email: String!
  $password: String!
  $name: String
) {
  registerCustomer(
    accountName: $accountName
    email: $email
    password: $password
    name: $name
  ) {
    accessToken
    user {
      id
      accountName
      email
      name
      accessScopes
    }
  }
}
```

> `AuthResponse` 不回傳 `refreshToken`（透過 HttpOnly Cookie 傳遞，不在 GraphQL 回應中暴露）。

**變數範例**：

```json
{
  "accountName": "new_customer",
  "email": "newcustomer@example.com",
  "password": "SecurePass123!",
  "name": "New Customer"
}
```

**使用場景**：

- 客戶邀請團隊成員
- 管理員創建新客戶帳號

---

### 2. `registerHQ` - 註冊管理員用戶

**權限要求**：

- ✅ `HQ_SCOPE`（僅管理員）

**創建的用戶層級**：`HQ_SCOPE`

**GraphQL Mutation**：

```graphql
mutation RegisterHQ(
  $accountName: String!
  $email: String!
  $password: String!
  $name: String
) {
  registerHQ(
    accountName: $accountName
    email: $email
    password: $password
    name: $name
  ) {
    accessToken
    user {
      id
      accountName
      email
      name
      accessScopes
    }
  }
}
```

**變數範例**：

```json
{
  "accountName": "new_hq",
  "email": "newhq@example.com",
  "password": "HQPass123!",
  "name": "New HQ Admin"
}
```

**使用場景**：

- 超級管理員創建新的管理員帳號
- 系統管理員擴充管理團隊

---

## 密碼要求

**適用於**：終端用戶註冊/登入的帳號密碼

所有註冊都需要符合密碼強度要求：

✅ **最少 8 個字符**
✅ **至少一個大寫字母** (A-Z)
✅ **至少一個小寫字母** (a-z)
✅ **至少一個數字** (0-9)
✅ **至少一個特殊符號** (!@#$%^&\* 等)

> **注意**：這是用戶帳號密碼的要求。
>
> **系統服務密碼**（PostgreSQL, RabbitMQ 等）有不同的規則，請參考 [環境變數文檔](../infrastructure/ENVIRONMENT_VARIABLES.md#2-系統服務密碼強度要求)。

**有效密碼範例**：

- `Password123!`
- `SecurePass1@`
- `MyP@ssw0rd`

**無效密碼範例**：

- `password` ❌ 無大寫字母、數字和特殊符號
- `Password123` ❌ 無特殊符號
- `PASSWORD123!` ❌ 無小寫字母
- `Pass1!` ❌ 少於 8 字符

---

## 訪問層級說明

### CUSTOMER_SCOPE 客戶層級

創建方式：`registerCustomer`

**可訪問的功能**：

- ✅ 查看和管理自己的用戶資料
- ✅ 訪問 `usersPaginated`（查看用戶列表）
- ✅ **可以邀請新的客戶用戶**（調用 `registerCustomer`）

**無法訪問**：

- ❌ 創建管理員帳號
- ❌ 管理系統權限和角色
- ❌ 查看稽核日誌

### HQ_SCOPE 管理員層級

創建方式：`registerHQ`

**可訪問的功能**：

- ✅ **所有 Customer 功能**
- ✅ 創建客戶帳號（`registerCustomer`）
- ✅ **創建管理員帳號**（`registerHQ`）
- ✅ 管理所有用戶
- ✅ 查看稽核日誌
- ✅ 管理角色和權限

---

## 初始化系統

### 方法 1：使用 Seed 腳本（推薦）

運行以下命令創建初始管理員和測試用戶：

```bash
cd packages/database
pnpm db:seed
```

這將創建（登入身分為**帳號**，括號內為通知用 email）：

- ✅ `hq_admin` (`hq@example.com`，HQ_SCOPE + CUSTOMER_SCOPE，SUPER_HQ + MANAGER，密碼: `Password123!`)
- ✅ `customer_admin` (`admin@example.com`，CUSTOMER_SCOPE / OWNER，密碼: `Password123!`)
- ✅ `public_user` (`public@example.com`，PUBLIC_SCOPE，密碼: `Password123!`)

> 三個 seed 帳號皆帶 `mustChangePassword: true`，首次登入會被導向變更密碼頁（見
> [首次登入強制變更密碼](#首次登入強制變更密碼)）。

### 方法 2：直接在數據庫創建

如果需要手動創建第一個管理員：

```bash
cd packages/database
npx prisma studio
```

在 Prisma Studio 中手動創建用戶，設置 `accessScopes: ["HQ_SCOPE"]`

---

## 完整使用流程

### 步驟 1：使用 Seed 創建初始管理員

```bash
pnpm db:seed
```

### 步驟 2：管理員登入

> `login` 的登入識別參數為 `accountName`（即**帳號**，非 email）。

```graphql
mutation Login {
  # 傳入的是帳號（accountName），非 email
  login(accountName: "hq_admin", password: "Password123!") {
    ... on AuthResponse {
      accessToken
      user {
        id
        accountName
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

### 步驟 3：管理員創建新客戶

使用上一步獲得的 `accessToken` 作為 Bearer Token：

```graphql
mutation CreateNewCustomer {
  registerCustomer(
    accountName: "client_co"
    email: "client@company.com"
    password: "ClientPass123!"
    name: "Client Name"
  ) {
    user {
      id
      accountName
      email
      accessScopes
    }
  }
}
```

### 步驟 4：客戶邀請團隊成員

客戶登入後可以邀請新成員：

```graphql
mutation InviteTeamMember {
  registerCustomer(
    accountName: "teammate"
    email: "teammate@company.com"
    password: "TeamPass123!"
    name: "Team Member"
  ) {
    user {
      id
      accountName
      email
      accessScopes
    }
  }
}
```

---

## HTTP Headers 設置

所有需要認證的請求都需要包含 JWT Token：

```text
Authorization: Bearer <your_access_token>
```

**範例**（使用 curl）：

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { registerCustomer(email: \"new@example.com\", password: \"Pass123\") { user { id } } }"
  }'
```

---

## 錯誤處理

### 常見錯誤

#### 1. `UNAUTHENTICATED` - 未登入

```json
{
  "errors": [
    {
      "message": "Unauthorized",
      "extensions": {
        "code": "UNAUTHENTICATED"
      }
    }
  ]
}
```

**解決方案**：先登入取得 token，然後在請求中加入 `Authorization` header

#### 2. `FORBIDDEN` - 權限不足

```json
{
  "errors": [
    {
      "message": "存取範圍不足",
      "extensions": {
        "code": "FORBIDDEN"
      }
    }
  ]
}
```

**原因**：

- 客戶用戶嘗試調用 `registerHQ` ❌ - PUBLIC_SCOPE 用戶嘗試註冊新用戶 ❌

#### 3. `CONFLICT` - 帳號已存在

唯一性以**帳號（accountName）**為準（email 已非唯一）。註冊重複帳號時：

```json
{
  "errors": [
    {
      "message": "此帳號已被註冊",
      "extensions": {
        "code": "CONFLICT"
      }
    }
  ]
}
```

**解決方案**：使用不同的 `accountName`（注意 case-insensitive：`Admin` 與 `admin` 視為同一帳號）

#### 4. `BAD_USER_INPUT` - 密碼強度不足

```json
{
  "errors": [
    {
      "message": "密碼必須包含至少一個大寫字母",
      "extensions": {
        "code": "BAD_USER_INPUT"
      }
    }
  ]
}
```

**解決方案**：確保密碼符合強度要求

---

## 首次登入強制變更密碼

由**管理員配置**（非自助設定）而來的帳號，首次登入必須先變更密碼才能進入系統。這透過
`User.mustChangePassword` 旗標與 JWT claim 實現：

| 來源                                                   | `mustChangePassword` |
| ------------------------------------------------------ | -------------------- |
| 管理員建立帳號（`createUser`）                         | `true`（臨時密碼）   |
| 管理員重設密碼（`hqResetPassword`）                    | `true`               |
| Seed 帳號（`hq_admin`/`customer_admin`/`public_user`） | `true`               |
| 自助註冊（`registerCustomer`/`registerHQ`，密碼自選）  | `false`              |
| 使用者自助成功改密（`changePassword`）後               | `false`（清除）      |

- 後端 `AuthService.generateTokens()` 僅在旗標為 `true` 時於 JWT 加入 `mustChangePassword: true`
  claim；`login` / `refresh` / 2FA verify 皆從即時 user 重簽，旗標清除後 token 即不再帶此 claim。
- 前端依此 claim 把使用者導向對應 scope 的變更密碼頁（customer `/change-password`、HQ
  `/hq/change-password`），改完才放行 scope 落點。

> 完整機制（含 `ProtectedRoute` 關卡、`ForcedChangePassword` 元件、scope 分軌）見
> [Scope-Based Auth Routing — 首次登入強制變更密碼](./SCOPE_ROUTING.md#首次登入強制變更密碼mustchangepassword)。

---

## 安全考量

### 1. **不提供公開註冊**

- ✅ 防止垃圾註冊
- ✅ 確保所有用戶都是受邀請的
- ✅ 便於管理和審核

### 2. **層級權限分離**

- ✅ Customer 不能創建 HQ
- ✅ HQ 可以創建所有層級用戶
- ✅ 遵循最小權限原則

### 3. **密碼強度驗證**

- ✅ 強制複雜密碼
- ✅ 防止常見弱密碼
- ✅ 前端和後端雙重驗證

### 4. **JWT Token 管理**

- ✅ Access Token: 15 分鐘過期
- ✅ Refresh Token: 7 天過期
- ✅ 登出時清除 Refresh Token

---

## 常見問題 (FAQ)

### Q: 如果沒有任何用戶，如何創建第一個管理員？

**A**: 運行 `pnpm db:seed` 來創建初始管理員帳號

### Q: 客戶可以邀請無限多的用戶嗎？

**A**: 目前沒有限制，如需要可以在業務邏輯中添加配額管理

### Q: 創建的用戶會自動分配角色嗎？

**A**: 不會，創建時只分配 Access Scope。角色需要後續通過用戶管理功能分配

### Q: 可以將 Customer 升級為 HQ 嗎？

**A**: 可以，管理員可以通過更新用戶的 `accessScopes` 來升級權限

### Q: 密碼可以在註冊後修改嗎？

**A**: 可以，用戶可以通過密碼重設流程或個人設置頁面修改密碼。此外，由管理員建立 / 重設密碼的帳號
（含 seed 帳號）首次登入會被**強制**先變更密碼，見[首次登入強制變更密碼](#首次登入強制變更密碼)。

### Q: 為什麼登入用的是帳號而不是 email？

**A**: 登入識別子已改為 `accountName`（3-20 英數底線，case-insensitive 唯一）；`email` 改為非唯一、
僅供通知用。GraphQL `login` 與前端表單欄位名仍沿用 `email` 為向後相容保留，但語意是帳號。
詳見 [Scope-Based Auth Routing — 帳號登入](./SCOPE_ROUTING.md#帳號登入accountname)。

---

## 相關文檔

- [Scope-Based Auth Routing](./SCOPE_ROUTING.md) - 帳號登入、HQ/customer 路由分軌、首登強制改密
- [RBAC Architecture](./RBAC_ARCHITECTURE.md) - 角色權限系統架構
- [Token Configuration](./TOKEN-CONFIGURATION.md) - JWT Token 配置
- [Two Factor Auth](./TWO_FACTOR_AUTH.md) - 雙因素認證
- [Row-Level Security](./ROW_LEVEL_SECURITY.md) - 資料行級別安全控制
