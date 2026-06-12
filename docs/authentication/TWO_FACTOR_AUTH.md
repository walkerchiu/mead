# 雙因素認證 (2FA) 文檔

額外的安全層，透過 Email 驗證碼提供第二層身份驗證保護。

---

## 目錄

- [雙因素認證 (2FA) 文檔](#雙因素認證-2fa-文檔)
  - [目錄](#目錄)
  - [概述](#概述)
    - [支援的 2FA 類型](#支援的-2fa-類型)
  - [功能特性](#功能特性)
    - [已實現](#已實現)
    - [未來擴展](#未來擴展)
  - [啟用流程](#啟用流程)
    - [步驟 1：請求啟用（發送驗證碼）](#步驟-1請求啟用發送驗證碼)
    - [步驟 2：確認啟用（使用驗證碼）](#步驟-2確認啟用使用驗證碼)
  - [停用流程](#停用流程)
    - [步驟 1：請求停用（發送驗證碼）](#步驟-1請求停用發送驗證碼)
    - [步驟 2：確認停用（使用驗證碼）](#步驟-2確認停用使用驗證碼)
  - [登入流程](#登入流程)
    - [未啟用 2FA（正常登入）](#未啟用-2fa正常登入)
    - [已啟用 2FA（兩步驟登入）](#已啟用-2fa兩步驟登入)
      - [步驟 1：輸入帳號和密碼](#步驟-1輸入帳號和密碼)
      - [步驟 2：輸入驗證碼](#步驟-2輸入驗證碼)
  - [備用驗證碼](#備用驗證碼)
    - [何時使用](#何時使用)
    - [使用方法](#使用方法)
  - [GraphQL API](#graphql-api)
    - [Mutations](#mutations)
      - [`requestEnable2FA`](#requestenable2fa)
      - [`confirmEnable2FA(code: String!)`](#confirmenable2facode-string)
      - [`requestDisable2FA`](#requestdisable2fa)
      - [`confirmDisable2FA(code: String!)`](#confirmdisable2facode-string)
      - [`verifyTwoFactorLogin(input: VerifyTwoFactorInput!)`](#verifytwofactorlogininput-verifytwofactorinput)
    - [Queries](#queries)
      - [`my2FASettings`](#my2fasettings)
  - [安全考量](#安全考量)
    - [驗證碼安全](#驗證碼安全)
    - [備用驗證碼安全](#備用驗證碼安全)
    - [臨時 Token 安全](#臨時-token-安全)
    - [Email 安全](#email-安全)
  - [錯誤處理](#錯誤處理)
    - [常見錯誤](#常見錯誤)
      - [1. 已啟用 2FA 時嘗試再次啟用](#1-已啟用-2fa-時嘗試再次啟用)
      - [2. 驗證碼錯誤](#2-驗證碼錯誤)
      - [3. 驗證碼過期](#3-驗證碼過期)
      - [4. 嘗試次數過多](#4-嘗試次數過多)
      - [5. 臨時 Token 無效](#5-臨時-token-無效)
      - [6. 備用驗證碼錯誤或已使用](#6-備用驗證碼錯誤或已使用)
  - [常見問題](#常見問題)
    - [Q1: 啟用 2FA 後忘記備用驗證碼怎麼辦？](#q1-啟用-2fa-後忘記備用驗證碼怎麼辦)
    - [Q2: 可以重新生成備用驗證碼嗎？](#q2-可以重新生成備用驗證碼嗎)
    - [Q3: 驗證碼多久會過期？](#q3-驗證碼多久會過期)
    - [Q4: 可以強制某些用戶必須啟用 2FA 嗎？](#q4-可以強制某些用戶必須啟用-2fa-嗎)
    - [Q5: 為什麼登入需要兩個步驟？](#q5-為什麼登入需要兩個步驟)
    - [Q6: Email 收不到驗證碼怎麼辦？](#q6-email-收不到驗證碼怎麼辦)
    - [Q7: 可以同時啟用多種 2FA 方式嗎？](#q7-可以同時啟用多種-2fa-方式嗎)
    - [Q8: 更換 Email 後 2FA 還有效嗎？](#q8-更換-email-後-2fa-還有效嗎)
    - [Q9: 備用驗證碼用完了怎麼辦？](#q9-備用驗證碼用完了怎麼辦)
    - [Q10: 開發環境如何測試 2FA？](#q10-開發環境如何測試-2fa)
  - [資料庫結構](#資料庫結構)
    - [TwoFactorAuth 表](#twofactorauth-表)
    - [TwoFactorVerification 表](#twofactorverification-表)
  - [前端整合範例](#前端整合範例)
    - [React + Apollo Client](#react--apollo-client)
  - [維護與監控](#維護與監控)
    - [定期清理過期驗證記錄](#定期清理過期驗證記錄)
    - [監控建議](#監控建議)
  - [相關文檔](#相關文檔)

---

## 概述

雙因素認證（Two-Factor Authentication, 2FA）是一種額外的安全層，在用戶輸入密碼後，要求提供第二個驗證因素來確認身份。本系統目前支援 **Email-based 2FA**，並預留了擴展性以支援 TOTP 和 SMS。

### 支援的 2FA 類型

| 類型  | 狀態      | 說明                             |
| ----- | --------- | -------------------------------- |
| EMAIL | ✅ 已實現 | 透過 Email 發送 6 位數驗證碼     |
| TOTP  | 未來      | Google Authenticator 等 TOTP app |
| SMS   | 未來      | 透過簡訊發送驗證碼               |

---

## 功能特性

### 已實現

- **自主啟用/停用**：用戶可在個人檔案中自由控制 2FA
- **Email 驗證**：6 位數驗證碼，10 分鐘有效期
- **備用驗證碼**：10 組備用碼，用於緊急訪問
- **防暴力破解**：最多 5 次錯誤嘗試
- **安全存儲**：驗證碼以 bcrypt hash 存儲
- **臨時 Token**：登入流程使用短期臨時 Token（5 分鐘）
- **精美郵件模板**：清晰的中文 HTML 郵件
- **IP 追蹤**：記錄所有 2FA 操作的 IP 地址

### 未來擴展

- TOTP 支援（Google Authenticator）
- SMS 驗證
- 強制 HQ_SCOPE 必須啟用 2FA
- 備用驗證碼重新生成
- AuditLog 整合

---

## 啟用流程

### 步驟 1：請求啟用（發送驗證碼）

```graphql
mutation {
  requestEnable2FA {
    message
  }
}
```

**回應範例**：

```json
{
  "data": {
    "requestEnable2FA": {
      "message": "驗證碼已發送到您的電子郵件"
    }
  }
}
```

**說明**：

- 必須已登入（需要 JWT Token）
- 系統會發送 6 位數驗證碼到用戶的註冊 Email
- 驗證碼 10 分鐘內有效
- 如果已經啟用 2FA，會返回錯誤

### 步驟 2：確認啟用（使用驗證碼）

```graphql
mutation {
  confirmEnable2FA(code: "123456") {
    message
    backupCodes
  }
}
```

**回應範例**：

```json
{
  "data": {
    "confirmEnable2FA": {
      "message": "雙因素認證已成功啟用",
      "backupCodes": [
        "A1B2C3D4",
        "E5F6G7H8",
        "I9J0K1L2",
        "M3N4O5P6",
        "Q7R8S9T0",
        "U1V2W3X4",
        "Y5Z6A7B8",
        "C9D0E1F2",
        "G3H4I5J6",
        "K7L8M9N0"
      ]
    }
  }
}
```

**⚠️ 重要**：

- 備用驗證碼僅顯示一次，**必須立即保存**！
- 建議將備用碼下載或列印保存在安全的地方
- 每組備用碼為 8 字元的十六進位字串（大寫）

---

## 停用流程

### 步驟 1：請求停用（發送驗證碼）

```graphql
mutation {
  requestDisable2FA {
    message
  }
}
```

**回應範例**：

```json
{
  "data": {
    "requestDisable2FA": {
      "message": "驗證碼已發送到您的電子郵件"
    }
  }
}
```

### 步驟 2：確認停用（使用驗證碼）

```graphql
mutation {
  confirmDisable2FA(code: "123456") {
    message
  }
}
```

**回應範例**：

```json
{
  "data": {
    "confirmDisable2FA": {
      "message": "雙因素認證已停用"
    }
  }
}
```

**說明**：

- 停用後，所有備用驗證碼將被清除
- 下次啟用時會生成新的備用碼

---

## 登入流程

> 登入身分為**帳號（accountName）**；`login` 的 `email` 參數名為向後相容保留，傳入值放 accountName（如 `customer_admin`）。詳見 [Scope Routing](./SCOPE_ROUTING.md)。

### 未啟用 2FA（正常登入）

```graphql
mutation {
  login(email: "customer_admin", password: "Password123!") {
    ... on AuthResponse {
      accessToken
      refreshToken
      user {
        id
        email
        name
      }
    }
  }
}
```

**回應**：直接返回 JWT tokens，可立即訪問 API。

### 已啟用 2FA（兩步驟登入）

#### 步驟 1：輸入帳號和密碼

```graphql
mutation {
  login(email: "customer_admin", password: "Password123!") {
    ... on TwoFactorLoginResponse {
      requiresTwoFactor
      temporaryToken
      message
    }
    ... on AuthResponse {
      accessToken
      refreshToken
      user {
        id
        email
      }
    }
  }
}
```

**回應範例**（需要 2FA）：

```json
{
  "data": {
    "login": {
      "requiresTwoFactor": true,
      "temporaryToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "message": "驗證碼已發送到您的電子郵件，請輸入以完成登入"
    }
  }
}
```

**說明**：

- `temporaryToken`：臨時 JWT Token，5 分鐘有效
- 系統會自動發送 6 位數驗證碼到 Email
- 需要保存 `temporaryToken` 用於下一步驗證

#### 步驟 2：輸入驗證碼

```graphql
mutation {
  verifyTwoFactorLogin(
    input: {
      temporaryToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
      code: "123456"
      isBackupCode: false
    }
  ) {
    accessToken
    refreshToken
    message
  }
}
```

**回應範例**：

```json
{
  "data": {
    "verifyTwoFactorLogin": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "message": "登入成功"
    }
  }
}
```

---

## 備用驗證碼

### 何時使用

- 無法接收 Email（信箱無法訪問、郵件延遲等）
- Email 服務暫時中斷
- 緊急情況需要立即訪問帳號

### 使用方法

使用備用驗證碼登入時，將 `isBackupCode` 設為 `true`：

```graphql
mutation {
  verifyTwoFactorLogin(
    input: {
      temporaryToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
      code: "A1B2C3D4" # 使用備用碼
      isBackupCode: true
    }
  ) {
    accessToken
    refreshToken
    message
  }
}
```

**重要事項**：

- 每個備用碼僅能使用一次
- 使用後會被標記為已用，無法再次使用
- 共有 10 組備用碼，用完後無法重新生成（需要先停用再啟用 2FA）
- 建議至少保留幾組備用碼以備不時之需

---

## GraphQL API

### Mutations

#### `requestEnable2FA`

請求啟用雙因素認證（發送驗證碼）

**權限**：需要登入
**Rate Limiting**：無

```graphql
mutation {
  requestEnable2FA {
    message
  }
}
```

#### `confirmEnable2FA(code: String!)`

確認啟用雙因素認證（返回備用碼）

**權限**：需要登入
**Rate Limiting**：無（但驗證碼最多嘗試 5 次）

```graphql
mutation {
  confirmEnable2FA(code: "123456") {
    message
    backupCodes
  }
}
```

#### `requestDisable2FA`

請求停用雙因素認證（發送驗證碼）

**權限**：需要登入
**Rate Limiting**：無

```graphql
mutation {
  requestDisable2FA {
    message
  }
}
```

#### `confirmDisable2FA(code: String!)`

確認停用雙因素認證

**權限**：需要登入
**Rate Limiting**：無（但驗證碼最多嘗試 5 次）

```graphql
mutation {
  confirmDisable2FA(code: "123456") {
    message
  }
}
```

#### `verifyTwoFactorLogin(input: VerifyTwoFactorInput!)`

驗證雙因素認證並完成登入

**權限**：無（使用臨時 Token）
**Rate Limiting**：1 分鐘內最多 5 次

```graphql
mutation {
  verifyTwoFactorLogin(input: {
    temporaryToken: String!
    code: String!
    isBackupCode: Boolean  # 預設：false
  }) {
    accessToken
    refreshToken
    message
  }
}
```

### Queries

#### `my2FASettings`

查詢當前用戶的 2FA 設定

**權限**：需要登入

```graphql
query {
  my2FASettings {
    type # EMAIL, TOTP, SMS
    enabled # true/false
    lastVerifiedAt
    createdAt
    updatedAt
  }
}
```

**回應範例**：

```json
{
  "data": {
    "my2FASettings": {
      "type": "EMAIL",
      "enabled": true,
      "lastVerifiedAt": "2026-01-28T08:15:00.000Z",
      "createdAt": "2026-01-28T08:00:00.000Z",
      "updatedAt": "2026-01-28T08:15:00.000Z"
    }
  }
}
```

如果未啟用 2FA：

```json
{
  "data": {
    "my2FASettings": null
  }
}
```

---

## 安全考量

### 驗證碼安全

1. **生成方式**：使用 `crypto.randomInt()` 生成真隨機數
2. **長度**：6 位數（000000-999999）
3. **有效期**：10 分鐘
4. **存儲方式**：bcrypt hash，不儲存明文
5. **一次性使用**：驗證後立即標記為已驗證
6. **防暴力破解**：最多 5 次錯誤嘗試

### 備用驗證碼安全

1. **生成方式**：`crypto.randomBytes(4).toString('hex')`
2. **長度**：8 字元十六進位（大寫）
3. **數量**：10 組
4. **存儲方式**：JSON 陣列，明文存儲（僅顯示一次）
5. **一次性使用**：使用後標記為已用
6. **無法重新生成**：需先停用再啟用 2FA

### 臨時 Token 安全

1. **用途**：僅用於 2FA 驗證流程
2. **有效期**：5 分鐘
3. **payload**：包含 `userId`, `email`, `purpose: '2fa-login'`
4. **限制**：無法用於訪問其他 API

### Email 安全

1. **模板**：包含 IP 地址和時間戳
2. **用途提示**：明確標示驗證碼用途（LOGIN/ENABLE/DISABLE）
3. **有效期提示**：清楚標註 10 分鐘過期
4. **安全警告**：提醒用戶勿分享驗證碼

---

## 錯誤處理

### 常見錯誤

#### 1. 已啟用 2FA 時嘗試再次啟用

```json
{
  "errors": [
    {
      "message": "雙因素認證已經啟用",
      "extensions": {
        "code": "BAD_USER_INPUT"
      }
    }
  ]
}
```

**解決方法**：如需重新設定，請先停用再啟用。

#### 2. 驗證碼錯誤

```json
{
  "errors": [
    {
      "message": "驗證碼錯誤",
      "extensions": {
        "code": "UNAUTHENTICATED"
      }
    }
  ]
}
```

**解決方法**：

- 檢查驗證碼是否正確（6 位數字）
- 檢查是否在 10 分鐘內
- 檢查是否已使用過

#### 3. 驗證碼過期

```json
{
  "errors": [
    {
      "message": "驗證碼不存在或已過期",
      "extensions": {
        "code": "UNAUTHENTICATED"
      }
    }
  ]
}
```

**解決方法**：重新請求驗證碼。

#### 4. 嘗試次數過多

```json
{
  "errors": [
    {
      "message": "驗證嘗試次數過多，請重新請求驗證碼",
      "extensions": {
        "code": "UNAUTHENTICATED"
      }
    }
  ]
}
```

**解決方法**：等待當前驗證碼過期（最多 10 分鐘），或重新請求新的驗證碼。

#### 5. 臨時 Token 無效

```json
{
  "errors": [
    {
      "message": "驗證失敗，請重新登入",
      "extensions": {
        "code": "UNAUTHENTICATED"
      }
    }
  ]
}
```

**可能原因**：

- 臨時 Token 過期（5 分鐘）
- Token 格式錯誤
- Token 被篡改

**解決方法**：重新執行 login mutation。

#### 6. 備用驗證碼錯誤或已使用

```json
{
  "errors": [
    {
      "message": "驗證碼錯誤或已過期",
      "extensions": {
        "code": "UNAUTHENTICATED"
      }
    }
  ]
}
```

**解決方法**：

- 檢查備用碼是否正確
- 確認該備用碼未被使用過
- 使用其他備用碼

---

## 常見問題

### Q1: 啟用 2FA 後忘記備用驗證碼怎麼辦？

**A**: 如果無法訪問 Email，且備用驗證碼遺失，需要聯繫系統管理員協助停用 2FA。建議啟用時立即保存備用碼。

### Q2: 可以重新生成備用驗證碼嗎？

**A**: 目前不支援。如需重新生成，必須先停用 2FA，再重新啟用，系統會生成新的備用碼。

### Q3: 驗證碼多久會過期？

**A**:

- 驗證碼（Email）：10 分鐘
- 臨時 Token（登入流程）：5 分鐘

### Q4: 可以強制某些用戶必須啟用 2FA 嗎？

**A**: 目前不支援。但可在未來版本中實現強制 HQ_SCOPE 用戶啟用 2FA。

### Q5: 為什麼登入需要兩個步驟？

**A**: 這是 2FA 的設計目的。即使密碼被盜，攻擊者仍需要訪問您的 Email 才能登入，大幅提升安全性。

### Q6: Email 收不到驗證碼怎麼辦？

**A**:

1. 檢查垃圾郵件資料夾
2. 確認 Email 地址正確
3. 等待幾分鐘（Email 可能延遲）
4. 如仍無法收到，使用備用驗證碼登入

### Q7: 可以同時啟用多種 2FA 方式嗎？

**A**: 目前不支援。每個用戶只能啟用一種 2FA 方式（EMAIL, TOTP, 或 SMS）。

### Q8: 更換 Email 後 2FA 還有效嗎？

**A**: 需要重新設定。建議在更換 Email 前先停用 2FA，更換後再重新啟用。

### Q9: 備用驗證碼用完了怎麼辦？

**A**: 停用 2FA 後重新啟用，系統會生成新的 10 組備用碼。

### Q10: 開發環境如何測試 2FA？

**A**: 系統使用 Ethereal Email 作為開發環境的 SMTP 服務。可以在 [https://ethereal.email/login](https://ethereal.email/login) 查看發送的驗證碼郵件（帳號資訊見 `.env` 檔案）。

---

## 資料庫結構

### TwoFactorAuth 表

| 欄位           | 類型      | 說明              |
| -------------- | --------- | ----------------- |
| id             | String    | 主鍵              |
| userId         | String    | 用戶 ID（唯一）   |
| type           | Enum      | EMAIL, TOTP, SMS  |
| enabled        | Boolean   | 是否啟用          |
| totpSecret     | String?   | TOTP 密鑰（加密） |
| backupCodes    | Json      | 備用驗證碼陣列    |
| lastVerifiedAt | DateTime? | 最後驗證時間      |
| createdAt      | DateTime  | 建立時間          |
| updatedAt      | DateTime  | 更新時間          |

### TwoFactorVerification 表

| 欄位       | 類型      | 說明                   |
| ---------- | --------- | ---------------------- |
| id         | String    | 主鍵                   |
| userId     | String    | 用戶 ID                |
| purpose    | Enum      | LOGIN, ENABLE, DISABLE |
| code       | String    | 驗證碼（bcrypt hash）  |
| expiresAt  | DateTime  | 過期時間（10 分鐘）    |
| attempts   | Int       | 嘗試次數               |
| verifiedAt | DateTime? | 驗證時間               |
| ipAddress  | String?   | IP 地址                |
| createdAt  | DateTime  | 建立時間               |

---

## 前端整合範例

### React + Apollo Client

```typescript
import { gql, useMutation, useQuery } from '@apollo/client';

// 1. 查詢 2FA 狀態
const GET_2FA_SETTINGS = gql`
  query {
    my2FASettings {
      type
      enabled
      lastVerifiedAt
    }
  }
`;

// 2. 啟用 2FA
const REQUEST_ENABLE_2FA = gql`
  mutation {
    requestEnable2FA {
      message
    }
  }
`;

const CONFIRM_ENABLE_2FA = gql`
  mutation ConfirmEnable2FA($code: String!) {
    confirmEnable2FA(code: $code) {
      message
      backupCodes
    }
  }
`;

// 3. 登入流程
const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      ... on TwoFactorLoginResponse {
        __typename
        requiresTwoFactor
        temporaryToken
        message
      }
      ... on AuthResponse {
        __typename
        accessToken
        refreshToken
        user { id email name }
      }
    }
  }
`;

const VERIFY_2FA_LOGIN = gql`
  mutation VerifyTwoFactorLogin($input: VerifyTwoFactorInput!) {
    verifyTwoFactorLogin(input: $input) {
      accessToken
      refreshToken
      message
    }
  }
`;

// 使用範例
function LoginFlow() {
  const [login] = useMutation(LOGIN);
  const [verify2FA] = useMutation(VERIFY_2FA_LOGIN);
  const [temporaryToken, setTemporaryToken] = useState(null);
  const [show2FAInput, setShow2FAInput] = useState(false);

  const handleLogin = async (email, password) => {
    const { data } = await login({ variables: { email, password } });

    if (data.login.__typename === 'TwoFactorLoginResponse') {
      // 需要 2FA 驗證
      setTemporaryToken(data.login.temporaryToken);
      setShow2FAInput(true);
      alert(data.login.message);
    } else {
      // 直接登入成功
      localStorage.setItem('accessToken', data.login.accessToken);
      localStorage.setItem('refreshToken', data.login.refreshToken);
      // 跳轉到應用程式
    }
  };

  const handleVerify2FA = async (code) => {
    const { data } = await verify2FA({
      variables: {
        input: {
          temporaryToken,
          code,
          isBackupCode: false
        }
      }
    });

    localStorage.setItem('accessToken', data.verifyTwoFactorLogin.accessToken);
    localStorage.setItem('refreshToken', data.verifyTwoFactorLogin.refreshToken);
    // 跳轉到應用程式
  };

  return (
    <div>
      {!show2FAInput ? (
        <LoginForm onSubmit={handleLogin} />
      ) : (
        <TwoFactorInput onSubmit={handleVerify2FA} />
      )}
    </div>
  );
}
```

---

## 維護與監控

### 定期清理過期驗證記錄

```typescript
// 在服務中已實現，可透過 Cron job 執行
import { TwoFactorAuthService } from './two-factor-auth.service';

@Cron('0 */2 * * *') // 每 2 小時執行一次
async cleanupExpiredVerifications() {
  const count = await this.twoFactorAuthService.cleanupExpiredVerifications();
  console.log(`[Cron] Cleaned up ${count} expired 2FA verifications`);
}
```

### 監控建議

1. **Email 送達率**：監控驗證碼郵件的送達率
2. **驗證失敗率**：追蹤驗證碼錯誤次數
3. **啟用率**：統計用戶啟用 2FA 的比例
4. **備用碼使用**：監控備用碼的使用頻率（可能表示 Email 送達問題）

---

## 相關文檔

- [Token Configuration](./TOKEN-CONFIGURATION.md) - JWT Token 配置與安全實踐
- [Registration](./REGISTRATION.md) - 用戶註冊與權限分配
- [RBAC Architecture](./RBAC_ARCHITECTURE.md) - 角色權限系統架構
- [Rate Limiting](./RATE_LIMITING.md) - API 速率限制保護
