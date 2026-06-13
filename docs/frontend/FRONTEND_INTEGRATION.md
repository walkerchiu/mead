# 前端認證系統集成指南

完整的前端認證系統實現與整合文檔。

---

## 目錄

- [前端認證系統集成指南](#前端認證系統集成指南)
  - [目錄](#目錄)
  - [概述](#概述)
    - [技術棧](#技術棧)
    - [功能特性](#功能特性)
  - [套件清單](#套件清單)
  - [檔案結構](#檔案結構)
  - [快速開始](#快速開始)
    - [1. 環境變數配置](#1-環境變數配置)
    - [2. 啟動開發伺服器](#2-啟動開發伺服器)
    - [3. 訪問頁面](#3-訪問頁面)
  - [核心組件說明](#核心組件說明)
    - [1. Apollo Client 配置 (`lib/apollo-client.ts`)](#1-apollo-client-配置-libapollo-clientts)
    - [2. 認證輔助函數 (`lib/auth.ts`)](#2-認證輔助函數-libauthts)
    - [3. GraphQL Queries 和 Mutations (`lib/graphql.ts`)](#3-graphql-queries-和-mutations-libgraphqlts)
  - [使用流程](#使用流程)
    - [登入流程](#登入流程)
    - [頁面重新整理後的 Session 恢復](#頁面重新整理後的-session-恢復)
    - [密碼重設流程](#密碼重設流程)
    - [2FA 設定流程](#2fa-設定流程)
  - [UI 組件說明](#ui-組件說明)
    - [登入表單 (LoginForm.tsx)](#登入表單-loginformtsx)
    - [2FA 驗證表單 (TwoFactorForm.tsx)](#2fa-驗證表單-twofactorformtsx)
    - [受保護路由 (ProtectedRoute.tsx)](#受保護路由-protectedroutetsx)
    - [密碼重設表單 (ResetPasswordForm.tsx)](#密碼重設表單-resetpasswordformtsx)
    - [2FA 設定組件 (TwoFactorSettings.tsx)](#2fa-設定組件-twofactorsettingstsx)
  - [安全考量](#安全考量)
    - [Token 管理架構](#token-管理架構)
    - [後端 Cookie 設定](#後端-cookie-設定)
    - [密碼驗證](#密碼驗證)
    - [2FA 驗證](#2fa-驗證)
  - [故障排除](#故障排除)
    - [問題 1：Apollo Client 導入錯誤](#問題-1apollo-client-導入錯誤)
    - [問題 2：Token 無法自動帶入 header](#問題-2token-無法自動帶入-header)
    - [問題 3：CORS 錯誤](#問題-3cors-錯誤)
    - [問題 4：頁面重新整理後被踢回登入頁](#問題-4頁面重新整理後被踢回登入頁)
    - [問題 5：GraphQL Schema 類型不匹配](#問題-5graphql-schema-類型不匹配)
  - [參考資源](#參考資源)
    - [官方文檔](#官方文檔)
    - [專案文檔](#專案文檔)
  - [TODO](#todo)
    - [短期](#短期)
    - [長期](#長期)
  - [總結](#總結)

---

## 概述

本文檔提供完整的前端認證系統實現指南，包括登入、密碼重設和雙因素認證 (2FA) 功能。

### 技術棧

- **Next.js**: 16.1.5 (App Router)
- **React**: 19.2.3
- **Apollo Client**: 4.1.2 (標準版本)
- **Material-UI**: 7.3.7
- **TypeScript**: 5.x
- **表單處理**: React Hook Form 7.71.1 + Zod 4.3.6

### 功能特性

- ✅ 用戶登入/登出
- ✅ 密碼重設流程
- ✅ Email-based 雙因素認證 (2FA)
- ✅ 受保護路由
- ✅ JWT Token 管理（Access Token 記憶體 + Refresh Token HttpOnly Cookie）
- ✅ 自動 Token 重新整理（401 時自動重試）
- ✅ MSW 模擬 API（開發/測試）
- ✅ Storybook 組件開發
- ✅ i18n 多語系支援（next-intl）

---

## 套件清單

```json
{
  "dependencies": {
    "@apollo/client": "^4.1.2",
    "@emotion/react": "^11.14.0",
    "@emotion/styled": "^11.14.0",
    "@hookform/resolvers": "^5.2.2",
    "@mui/material": "^7.3.7",
    "graphql": "^16.12.0",
    "next": "16.1.5",
    "notistack": "^3.0.2",
    "react": "19.2.3",
    "react-hook-form": "^7.71.1",
    "zod": "^4.3.6"
  }
}
```

---

## 檔案結構

```text
apps/frontend/
├── messages/
│   ├── en.json                       # 英文翻譯
│   └── zh-TW.json                    # 繁體中文翻譯
└── src/
    ├── i18n/
    │   ├── routing.ts                # i18n 路由配置
    │   └── request.ts                # Server-side 訊息載入
    ├── middleware.ts                  # Locale 偵測與路由重定向
    ├── lib/
    │   ├── apollo-client.ts          # Apollo Client 配置（含 refresh-on-401）
    │   ├── apollo-provider.tsx       # Apollo Provider 組件
    │   ├── auth.ts                   # 認證輔助函數（記憶體 Token + Cookie 重新整理）
    │   └── graphql.ts                # GraphQL queries/mutations
    ├── components/auth/
    │   ├── LoginForm.tsx             # 登入表單
    │   ├── TwoFactorForm.tsx         # 2FA 驗證表單
    │   ├── ForgotPasswordForm.tsx    # 忘記密碼表單
    │   ├── ResetPasswordForm.tsx     # 重設密碼表單
    │   ├── TwoFactorSettings.tsx     # 2FA 設定組件
    │   └── ProtectedRoute.tsx        # 受保護路由 HOC（含自動重新整理）
    └── app/
        ├── layout.tsx                # Root Layout
        └── [locale]/
            ├── layout.tsx            # Locale Layout（NextIntlClientProvider）
            ├── providers.tsx         # Client Providers
            ├── login/page.tsx        # 登入頁面
            ├── forgot-password/page.tsx  # 忘記密碼頁面
            ├── reset-password/page.tsx   # 重設密碼頁面
            ├── dashboard/page.tsx        # Dashboard
            └── settings/security/page.tsx # 安全設定頁面
```

---

## 快速開始

### 1. 環境變數配置

創建 `/apps/frontend/.env`：

```env
NEXT_PUBLIC_GRAPHQL_ENDPOINT=http://localhost:4000/graphql
```

### 2. 啟動開發伺服器

確保後端 API 正在運行：

```bash
# Terminal 1 - 後端 API
cd /path/to/wind
pnpm --filter api dev

# Terminal 2 - 前端 Web
cd /path/to/wind
pnpm --filter web dev
```

### 3. 訪問頁面

所有頁面 URL 包含 locale 前綴（`/en/...` 或 `/zh-TW/...`），訪問不帶 locale 的路徑會自動重定向。

- 首頁：<http://localhost:3000/en> 或 <http://localhost:3000/zh-TW>
- 登入：<http://localhost:3000/en/login> 或 <http://localhost:3000/zh-TW/login>
- 忘記密碼：<http://localhost:3000/en/forgot-password>
- Dashboard：<http://localhost:3000/en/dashboard>
- 安全設定：<http://localhost:3000/en/settings/security>

---

## 核心組件說明

### 1. Apollo Client 配置 (`lib/apollo-client.ts`)

```typescript
import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  from,
  Observable,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import {
  getAccessToken,
  clearAuthTokens,
  getLoginPath,
  refreshAccessToken,
  setApolloClientRef,
} from './auth';

const httpLink = createHttpLink({
  uri:
    process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || 'http://localhost:4000/graphql',
  credentials: 'include', // 發送 HttpOnly Cookie
});

// 認證 Link：從記憶體讀取 access token 並加入到 headers
const authLink = setContext((_, { headers }) => {
  if (typeof window === 'undefined') {
    return { headers };
  }

  const token = getAccessToken();

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// 錯誤處理 Link：401 時自動嘗試使用 HttpOnly Cookie 重新整理 token
const errorLink = onError(
  ({ graphQLErrors, networkError, operation, forward }) => {
    if (graphQLErrors) {
      for (const err of graphQLErrors) {
        if (err.extensions?.code === 'UNAUTHENTICATED') {
          // 自動調用 refreshToken mutation
          // refresh token 透過 HttpOnly Cookie 自動帶入，無需前端管理
          return new Observable((observer) => {
            refreshAccessToken().then((success) => {
              if (success) {
                // 重試原始請求
                forward(operation).subscribe(observer);
              } else {
                clearAuthTokens();
                window.location.href = getLoginPath();
                observer.error(err);
              }
            });
          });
        }
      }
    }
  },
);

export const createApolloClient = () => {
  const client = new ApolloClient({
    link: from([errorLink, authLink, httpLink]),
    cache: new InMemoryCache(),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'cache-and-network',
      },
    },
  });

  // 設定引用供 auth.ts 的 refreshAccessToken 使用
  setApolloClientRef(client);

  return client;
};
```

**功能**：

- ✅ 自動從記憶體讀取 accessToken 並加入 Authorization header
- ✅ `credentials: 'include'` 自動發送 HttpOnly Cookie（含 refresh token）
- ✅ 401 時自動嘗試用 refresh token 重新整理，成功則重試原始請求
- ✅ 重新整理失敗才清除 token 並跳轉登入頁
- ✅ 統一錯誤處理和日誌記錄

### 2. 認證輔助函數 (`lib/auth.ts`)

```typescript
// 記憶體儲存（不暴露給 XSS）
let accessToken: string | null = null;

// 儲存 access token（refresh token 由 HttpOnly Cookie 管理）
export const setAuthTokens = (tokens: { accessToken: string }): void => {
  accessToken = tokens.accessToken;
};

// 取得 Access Token
export const getAccessToken = (): string | null => {
  return accessToken;
};

// 清除 access token
export const clearAuthTokens = (): void => {
  accessToken = null;
};

// 檢查用戶是否已登入
export const isAuthenticated = (): boolean => {
  return !!getAccessToken();
};

// 透過 HttpOnly Cookie 中的 refresh token 重新取得 access token
export const refreshAccessToken = async (): Promise<boolean> => {
  // 呼叫 refreshToken mutation，cookie 自動帶入
  // 成功則更新記憶體中的 access token
};

// 登出
export const logout = (): void => {
  clearAuthTokens();
  // 後端 logout mutation 會清除 HttpOnly Cookie
  if (typeof window !== 'undefined') {
    window.location.href = getLoginPath();
  }
};
```

**功能**：

- ✅ Access Token 儲存在記憶體中，避免 XSS 竊取
- ✅ Refresh Token 由 HttpOnly Cookie 管理，前端無法直接存取
- ✅ 頁面重新整理後可透過 `refreshAccessToken()` 恢復 session
- ✅ 認證狀態檢查
- ✅ 登出功能

### 3. GraphQL Queries 和 Mutations (`lib/graphql.ts`)

所有 GraphQL 操作都定義在此檔案中：

```typescript
import { gql } from '@apollo/client';

// 登入（refresh token 透過 HttpOnly Cookie 設定，不在回應中返回）
export const LOGIN_MUTATION = gql`
  mutation Login($accountName: String!, $password: String!) {
    login(accountName: $accountName, password: $password) {
      ... on AuthResponse {
        __typename
        accessToken
        user {
          id
          email
          name
        }
      }
      ... on TwoFactorLoginResponse {
        __typename
        requiresTwoFactor
        temporaryToken
        message
      }
    }
  }
`;

// 驗證 2FA（同上，refresh token 透過 cookie 設定）
export const VERIFY_TWO_FACTOR_LOGIN_MUTATION = gql`
  mutation VerifyTwoFactorLogin($input: VerifyTwoFactorInput!) {
    verifyTwoFactorLogin(input: $input) {
      accessToken
      message
    }
  }
`;

// 重新整理 Access Token（Refresh Token 透過 HttpOnly Cookie 自動帶入，無需參數）
export const REFRESH_TOKEN_MUTATION = gql`
  mutation RefreshToken {
    refreshToken {
      accessToken
      user {
        id
        email
        name
      }
    }
  }
`;
```

---

## 使用流程

### 登入流程

> 登入身分為「帳號（accountName）」，非 email。`login` mutation 的 arg 名沿用 `email`
> 為向後相容，但傳入值為帳號。HQ 與 customer 各自走 `/login` 與 `/hq/login` 分軌。

1. **無 2FA**：
   - 輸入帳號和密碼
   - 獲得 accessToken（記憶體儲存），refresh token 自動設為 HttpOnly Cookie
   - 跳轉到對應 scope 落點（customer → `/dashboard`、HQ → `/hq/users`）；若帶 `mustChangePassword` 則先導向變更密碼頁

2. **有 2FA**：
   - 輸入帳號和密碼
   - 收到 `TwoFactorLoginResponse`，包含 `temporaryToken`
   - 系統自動發送驗證碼到 email
   - 輸入 6 位數驗證碼
   - 獲得 accessToken，refresh token 設為 HttpOnly Cookie
   - 跳轉到對應 scope 落點（首次登入須先變更密碼）

### 頁面重新整理後的 Session 恢復

1. 頁面重新整理後，記憶體中的 access token 遺失
2. `ProtectedRoute` 組件偵測到未認證狀態
3. 自動呼叫 `refreshAccessToken()`，利用 HttpOnly Cookie 中的 refresh token
4. 後端驗證 cookie 並返回新的 access token
5. 前端更新記憶體中的 access token，用戶無感繼續操作

### 密碼重設流程

1. **請求重設**：
   - 訪問 `/forgot-password`
   - 輸入 email
   - 系統發送重設連結到 email

2. **重設密碼**：
   - 從 email 點擊連結（包含 token）
   - 訪問 `/reset-password?token=xxx`
   - 輸入新密碼（需符合強度要求）
   - 密碼重設成功
   - 跳轉到登入頁

### 2FA 設定流程

1. **啟用 2FA**：
   - 訪問 `/settings/security`
   - 點擊「啟用 2FA」
   - 輸入發送到 email 的驗證碼
   - 系統顯示 10 組備用驗證碼
   - **務必保存備用碼**（僅顯示一次）

2. **停用 2FA**：
   - 訪問 `/settings/security`
   - 點擊「停用 2FA」
   - 輸入發送到 email 的驗證碼
   - 2FA 已停用（備用碼同時清除）

---

## UI 組件說明

### 登入表單 (LoginForm.tsx)

```typescript
const onSubmit = async (data: LoginFormData) => {
  const result = await login({
    variables: {
      email: data.email,
      password: data.password,
    },
  });

  const response = result.data?.login;

  if (response.__typename === 'TwoFactorLoginResponse') {
    // 需要 2FA 驗證
    onTwoFactorRequired(response.temporaryToken, response.message);
  } else if (response.__typename === 'AuthResponse') {
    // 直接登入成功（refresh token 已透過 HttpOnly Cookie 設定）
    setAuthTokens({
      accessToken: response.accessToken,
    });
    router.push('/dashboard');
  }
};
```

**特點**：

- ✅ React Hook Form + Zod 表單驗證
- ✅ 自動處理 2FA 流程切換
- ✅ 錯誤提示（Notistack）
- ✅ Loading 狀態

### 2FA 驗證表單 (TwoFactorForm.tsx)

```typescript
const onSubmit = async (data: TwoFactorFormData) => {
  const result = await verifyTwoFactor({
    variables: {
      input: {
        temporaryToken,
        code: data.code,
        isBackupCode: data.isBackupCode || false,
      },
    },
  });

  // refresh token 已透過 HttpOnly Cookie 設定
  setAuthTokens({
    accessToken: response.accessToken,
  });

  router.push('/dashboard');
};
```

**特點**：

- ✅ 支援一般驗證碼和備用驗證碼
- ✅ 倒數計時提示（10 分鐘）
- ✅ 最多 5 次嘗試限制
- ✅ 可返回登入頁面

### 受保護路由 (ProtectedRoute.tsx)

```typescript
useEffect(() => {
  const check = async () => {
    if (isAuthenticated()) {
      // 記憶體中有 access token，直接通過
      return;
    }

    // 嘗試用 HttpOnly Cookie 中的 refresh token 恢復 session
    const refreshed = await refreshAccessToken();
    if (!refreshed) {
      router.push('/login');
    }
  };
  check();
}, []);
```

**特點**：

- ✅ 先檢查記憶體中的 access token
- ✅ 頁面重新整理後自動嘗試用 HttpOnly Cookie 恢復 session
- ✅ 重新整理失敗才跳轉登入頁

### 密碼重設表單 (ResetPasswordForm.tsx)

```typescript
const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, '密碼至少需要 8 個字元')
      .regex(/[A-Z]/, '密碼必須包含至少一個大寫字母')
      .regex(/[a-z]/, '密碼必須包含至少一個小寫字母')
      .regex(/[0-9]/, '密碼必須包含至少一個數字'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: '密碼不一致',
    path: ['confirmPassword'],
  });
```

**特點**：

- ✅ 密碼強度驗證（Zod schema）
- ✅ 密碼一致性檢查
- ✅ Token 有效性驗證（使用 useQuery）
- ✅ 即時錯誤提示

### 2FA 設定組件 (TwoFactorSettings.tsx)

**特點**：

- ✅ 顯示當前 2FA 狀態
- ✅ 啟用/停用流程對話框
- ✅ 備用驗證碼顯示和下載
- ✅ 完整的錯誤處理

---

## 安全考量

### Token 管理架構

本專案採用 **Access Token 記憶體儲存 + Refresh Token HttpOnly Cookie** 的安全架構：

| Token 類型    | 儲存位置                  | 有效期  | 安全特性                                          |
| ------------- | ------------------------- | ------- | ------------------------------------------------- |
| Access Token  | 記憶體（JavaScript 變數） | 15 分鐘 | 無法被 XSS 從 storage 竊取                        |
| Refresh Token | HttpOnly Cookie           | 7 天    | JavaScript 無法存取，CSRF 由 SameSite=Strict 防護 |

```typescript
// ✅ Access Token 儲存在記憶體中，避免 XSS 直接竊取
// ✅ Refresh Token 透過 HttpOnly Cookie 傳遞，前端無法存取
// ✅ 每次 API 請求自動帶入 Authorization header（access token）
// ✅ 每次 API 請求自動帶入 Cookie（refresh token，由瀏覽器管理）
// ✅ 401 時自動嘗試重新整理，成功則重試原始請求
// ✅ Cookie 使用 SameSite=Strict 防護 CSRF
// ✅ 生產環境 Cookie 使用 Secure flag（僅 HTTPS）
```

### 後端 Cookie 設定

```typescript
// apps/backend/src/auth/cookie.utils.ts
res.cookie('refresh_token', token, {
  httpOnly: true, // JavaScript 無法存取
  secure: process.env.NODE_ENV === 'production', // 生產環境僅 HTTPS
  sameSite: 'strict', // 防止 CSRF
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 天
  path: '/',
});
```

### 密碼驗證

```typescript
// 密碼強度要求：
// - 至少 8 個字元
// - 至少一個大寫英文字母
// - 至少一個小寫英文字母
// - 至少一個數字

const passwordRegex = {
  uppercase: /[A-Z]/,
  lowercase: /[a-z]/,
  digit: /[0-9]/,
};
```

### 2FA 驗證

```typescript
// 驗證碼：6 位數，10 分鐘有效期
// 備用碼：8 字元十六進位，一次性使用
// 最多嘗試：5 次
```

---

## 故障排除

### 問題 1：Apollo Client 導入錯誤

**錯誤**：`Export useMutation doesn't exist in target module`

**原因**：Next.js 16 與 `@apollo/experimental-nextjs-app-support` 不兼容

**解決方案**：

### 問題 2：Token 無法自動帶入 header

**檢查**：

```typescript
// 1. 確認 Apollo Client 配置正確（credentials: 'include'）
const httpLink = createHttpLink({
  uri: 'http://localhost:4000/graphql',
  credentials: 'include',
});

// 2. 確認 access token 存在於記憶體中
console.log(getAccessToken());

// 3. 檢查 network tab，確認 Authorization header 和 Cookie
```

### 問題 3：CORS 錯誤

**後端配置** (`apps/backend/src/main.ts`)：

```typescript
app.use(cookieParser());

app.enableCors({
  origin: 'http://localhost:3000',
  credentials: true, // 必須設為 true 以支援 Cookie 跨域傳遞
});
```

### 問題 4：頁面重新整理後被踢回登入頁

**原因**：`refreshAccessToken()` 失敗

**檢查**：

1. 確認後端 `cookie-parser` 中間件已正確安裝
2. 確認 CORS `credentials: true` 已設定
3. 確認前端 httpLink 有 `credentials: 'include'`
4. 檢查 Network tab 中是否有 `refresh_token` cookie 被送出

### 問題 5：GraphQL Schema 類型不匹配

**解決方案**：

```bash
# 重新生成 schema
cd apps/backend
pnpm build

# 檢查 schema.gql
cat apps/backend/schema.gql
```

---

## 參考資源

### 官方文檔

- [Apollo Client - Next.js Integration](https://www.apollographql.com/docs/react/data/queries/)
- [Next.js 15 App Router](https://nextjs.org/docs/app)
- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)
- [Notistack](https://notistack.com/)

### 專案文檔

- [後端 API 文檔](../backend/API_RESPONSE_FORMAT.md)
- [2FA 使用指南](../authentication/TWO_FACTOR_AUTH.md)
- [註冊系統說明](../authentication/REGISTRATION.md)
- [前端 i18n 設置](I18N_SETUP.md) - 多語系配置與使用指南

---

## TODO

### 短期

- [ ] 修復 Next.js 16 兼容性問題
- [ ] 添加 E2E 測試

### 長期

- [ ] 支援 TOTP (Google Authenticator)
- [ ] 支援 SMS 2FA
- [ ] 實現「記住我」功能
- [ ] 添加社交登入 (Google/GitHub)

---

## 總結

本專案已完成：

✅ **基礎設施**

- Apollo Client 配置（含 `credentials: 'include'`）
- Token 管理系統（Access Token 記憶體 + Refresh Token HttpOnly Cookie）
- 自動 Token 重新整理（401 時自動重試）
- GraphQL queries/mutations
- 錯誤處理和通知系統

✅ **UI 組件**

- 登入表單（含 2FA 支援）
- 密碼重設流程
- 2FA 設定介面
- 受保護的路由（含自動 session 恢復）

**建議的下一步**：

1. 添加 OAuth 社交登入
2. 測試所有功能流程
3. 根據需求調整 UI/UX
4. 添加更多錯誤處理和驗證
