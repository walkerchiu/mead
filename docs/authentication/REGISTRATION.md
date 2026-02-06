# 用戶註冊系統

受邀請制註冊系統，由現有用戶創建新帳號，確保安全的用戶管理。

---

## 📋 目錄

- [用戶註冊系統](#用戶註冊系統)
  - [📋 目錄](#-目錄)
  - [📖 概述](#-概述)
  - [🔧 註冊端點](#-註冊端點)
    - [1. `registerCustomer` - 註冊客戶用戶](#1-registercustomer---註冊客戶用戶)
    - [2. `registerAdmin` - 註冊管理員用戶](#2-registeradmin---註冊管理員用戶)
  - [🔒 密碼要求](#-密碼要求)
  - [🎯 訪問層級說明](#-訪問層級說明)
    - [CUSTOMER_SCOPE 客戶層級](#customer_scope-客戶層級)
    - [ADMIN_SCOPE 管理員層級](#admin_scope-管理員層級)
  - [🚀 初始化系統](#-初始化系統)
    - [方法 1：使用 Seed 腳本（推薦）](#方法-1使用-seed-腳本推薦)
    - [方法 2：直接在數據庫創建](#方法-2直接在數據庫創建)
  - [📝 完整使用流程](#-完整使用流程)
    - [步驟 1：使用 Seed 創建初始管理員](#步驟-1使用-seed-創建初始管理員)
    - [步驟 2：管理員登入](#步驟-2管理員登入)
    - [步驟 3：管理員創建新客戶](#步驟-3管理員創建新客戶)
    - [步驟 4：客戶邀請團隊成員](#步驟-4客戶邀請團隊成員)
  - [🔐 HTTP Headers 設置](#-http-headers-設置)
  - [🚨 錯誤處理](#-錯誤處理)
    - [常見錯誤](#常見錯誤)
      - [1. `UNAUTHENTICATED` - 未登入](#1-unauthenticated---未登入)
      - [2. `FORBIDDEN` - 權限不足](#2-forbidden---權限不足)
      - [3. `CONFLICT` - Email 已存在](#3-conflict---email-已存在)
      - [4. `BAD_USER_INPUT` - 密碼強度不足](#4-bad_user_input---密碼強度不足)
  - [🔒 安全考量](#-安全考量)
    - [1. **不提供公開註冊**](#1-不提供公開註冊)
    - [2. **層級權限分離**](#2-層級權限分離)
    - [3. **密碼強度驗證**](#3-密碼強度驗證)
    - [4. **JWT Token 管理**](#4-jwt-token-管理)
  - [❓ 常見問題 (FAQ)](#-常見問題-faq)
    - [Q: 如果沒有任何用戶，如何創建第一個管理員？](#q-如果沒有任何用戶如何創建第一個管理員)
    - [Q: 客戶可以邀請無限多的用戶嗎？](#q-客戶可以邀請無限多的用戶嗎)
    - [Q: 創建的用戶會自動分配角色嗎？](#q-創建的用戶會自動分配角色嗎)
    - [Q: 可以將 Customer 升級為 Admin 嗎？](#q-可以將-customer-升級為-admin-嗎)
    - [Q: 密碼可以在註冊後修改嗎？](#q-密碼可以在註冊後修改嗎)
  - [📖 相關文檔](#-相關文檔)

---

## 📖 概述

本系統採用**受邀請制註冊**，不提供公開註冊端點。新用戶需要由現有的 Customer 或 Admin 用戶創建。

---

## 🔧 註冊端點

### 1. `registerCustomer` - 註冊客戶用戶

**權限要求**：

- ✅ `CUSTOMER_SCOPE`（客戶層級用戶）
- ✅ `ADMIN_SCOPE`（管理員層級用戶）

**創建的用戶層級**：`CUSTOMER_SCOPE`

**GraphQL Mutation**：

```graphql
mutation RegisterCustomer($email: String!, $password: String!, $name: String) {
  registerCustomer(email: $email, password: $password, name: $name) {
    accessToken
    refreshToken
    user {
      id
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
  "email": "newcustomer@example.com",
  "password": "SecurePass123",
  "name": "New Customer"
}
```

**使用場景**：

- 客戶邀請團隊成員
- 管理員創建新客戶帳號

---

### 2. `registerAdmin` - 註冊管理員用戶

**權限要求**：

- ✅ `ADMIN_SCOPE`（僅管理員）

**創建的用戶層級**：`ADMIN_SCOPE`

**GraphQL Mutation**：

```graphql
mutation RegisterAdmin($email: String!, $password: String!, $name: String) {
  registerAdmin(email: $email, password: $password, name: $name) {
    accessToken
    refreshToken
    user {
      id
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
  "email": "newadmin@example.com",
  "password": "AdminPass123",
  "name": "New Administrator"
}
```

**使用場景**：

- 超級管理員創建新的管理員帳號
- 系統管理員擴充管理團隊

---

## 🔒 密碼要求

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

## 🎯 訪問層級說明

### CUSTOMER_SCOPE 客戶層級

創建方式：`registerCustomer`

**可訪問的功能**：

- ✅ 查看和管理自己的用戶資料
- ✅ 訪問 `usersPaginated`（查看用戶列表）
- ✅ 創建和管理專案 (projects)
- ✅ 查看和管理帳務 (billing)
- ✅ **可以邀請新的客戶用戶**（調用 `registerCustomer`）

**無法訪問**：

- ❌ 創建管理員帳號
- ❌ 管理系統權限和角色
- ❌ 查看稽核日誌

### ADMIN_SCOPE 管理員層級

創建方式：`registerAdmin`

**可訪問的功能**：

- ✅ **所有 Customer 功能**
- ✅ 創建客戶帳號（`registerCustomer`）
- ✅ **創建管理員帳號**（`registerAdmin`）
- ✅ 管理所有用戶
- ✅ 查看稽核日誌
- ✅ 管理角色和權限

---

## 🚀 初始化系統

### 方法 1：使用 Seed 腳本（推薦）

運行以下命令創建初始管理員和測試用戶：

```bash
cd packages/database
pnpm db:seed
```

這將創建：

- ✅ `admin@example.com` (ADMIN_SCOPE, 密碼: `Password123!`)
- ✅ `customer@example.com` (CUSTOMER_SCOPE, 密碼: `Password123!`)

### 方法 2：直接在數據庫創建

如果需要手動創建第一個管理員：

```bash
cd packages/database
npx prisma studio
```

在 Prisma Studio 中手動創建用戶，設置 `accessScopes: ["ADMIN_SCOPE"]`

---

## 📝 完整使用流程

### 步驟 1：使用 Seed 創建初始管理員

```bash
pnpm db:seed
```

### 步驟 2：管理員登入

```graphql
mutation Login {
  login(email: "admin@example.com", password: "Password123!") {
    accessToken
    refreshToken
  }
}
```

### 步驟 3：管理員創建新客戶

使用上一步獲得的 `accessToken` 作為 Bearer Token：

```graphql
mutation CreateNewCustomer {
  registerCustomer(
    email: "client@company.com"
    password: "ClientPass123"
    name: "Client Name"
  ) {
    user {
      id
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
    email: "teammate@company.com"
    password: "TeamPass123"
    name: "Team Member"
  ) {
    user {
      id
      email
      accessScopes
    }
  }
}
```

---

## 🔐 HTTP Headers 設置

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

## 🚨 錯誤處理

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

- 客戶用戶嘗試調用 `registerAdmin` ❌
- PUBLIC_SCOPE 用戶嘗試註冊新用戶 ❌

#### 3. `CONFLICT` - Email 已存在

```json
{
  "errors": [
    {
      "message": "此 Email 已被註冊",
      "extensions": {
        "code": "CONFLICT"
      }
    }
  ]
}
```

**解決方案**：使用不同的 email 地址

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

## 🔒 安全考量

### 1. **不提供公開註冊**

- ✅ 防止垃圾註冊
- ✅ 確保所有用戶都是受邀請的
- ✅ 便於管理和審核

### 2. **層級權限分離**

- ✅ Customer 不能創建 Admin
- ✅ Admin 可以創建所有層級用戶
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

## ❓ 常見問題 (FAQ)

### Q: 如果沒有任何用戶，如何創建第一個管理員？

**A**: 運行 `pnpm db:seed` 來創建初始管理員帳號

### Q: 客戶可以邀請無限多的用戶嗎？

**A**: 目前沒有限制，如需要可以在業務邏輯中添加配額管理

### Q: 創建的用戶會自動分配角色嗎？

**A**: 不會，創建時只分配 Access Scope。角色需要後續通過用戶管理功能分配

### Q: 可以將 Customer 升級為 Admin 嗎？

**A**: 可以，管理員可以通過更新用戶的 `accessScopes` 來升級權限

### Q: 密碼可以在註冊後修改嗎？

**A**: 可以，用戶可以通過密碼重設流程或個人設置頁面修改密碼

---

## 📖 相關文檔

- [RBAC Architecture](./RBAC_ARCHITECTURE.md) - 角色權限系統架構
- [Token Configuration](./TOKEN-CONFIGURATION.md) - JWT Token 配置
- [Two Factor Auth](./TWO_FACTOR_AUTH.md) - 雙因素認證
- [Row-Level Security](./ROW_LEVEL_SECURITY.md) - 資料行級別安全控制
