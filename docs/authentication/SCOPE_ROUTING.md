# Scope-Based Auth Routing

MEAD 同時服務兩種 scope 用戶（**HQ scope** 內部營運與 **Customer scope** 案場用戶），
auth 與個人資料相關頁面（登入 / 忘記密碼 / 重設密碼 / 修改個人資料）依 `/hq/` 前綴拆出
兩套獨立路由與 redirect 邏輯，避免兩 scope 在同一路徑上行為混淆。

> **登入身分為「帳號（accountName）」而非 email。** 詳見 [帳號登入](#帳號登入accountname) 與
> [登入後 scope 導向](#登入後-scope-導向resolvelandingpath) 兩節。HQ 使用者若同時擁有
> `CUSTOMER_SCOPE`，可從任一登入頁登入並進入對應 scope（落點由「登入入口」決定）。
>
> 視覺層**未分軌**：HQ 與 customer 共用同一套 `AuthLayout` 與
> `LoginForm` / `ForgotPasswordForm` / `ResetPasswordForm` / `ChangePasswordForm` 元件 —
> 目前未為 customer scope 引入專屬 design tokens 與 layout 元件。後續若要分視覺軌（例如新增
> `CustomerAuthLayout` + 對應 form 元件套客製 token），可在保留現有路由結構下漸進
> 替換 customer pages 的 form / layout import。

---

## 目錄

- [Scope-Based Auth Routing](#scope-based-auth-routing)
  - [目錄](#目錄)
  - [動機](#動機)
  - [帳號登入（accountName）](#帳號登入accountname)
  - [登入後 scope 導向（resolveLandingPath）](#登入後-scope-導向resolvelandingpath)
  - [首次登入強制變更密碼（mustChangePassword）](#首次登入強制變更密碼mustchangepassword)
  - [路由對應表](#路由對應表)
  - [Path-based scope 偵測](#path-based-scope-偵測)
    - [`getLoginPath()` 分流](#getloginpath-分流)
    - [`ProtectedRoute` redirect helper](#protectedroute-redirect-helper)
  - [Form 共用 + optional href prop pattern](#form-共用--optional-href-prop-pattern)
  - [Backend reset email link](#backend-reset-email-link)
  - [新增頁面的注意事項](#新增頁面的注意事項)

---

## 動機

`/login` 路由原為 HQ + Customer 共用，但兩種 scope 在登入後的目的地、未授權 redirect
fallback、以及未來若要分軌視覺時都會交纏在同一路徑上。把 HQ 拆到 `/hq/` 前綴下後：

- **未授權 redirect 自動分流**：用戶在 `/hq/users` 被踢出 → redirect 到 `/hq/login`，
  在 `/dashboard` 被踢出 → redirect 到 `/login`，不會混淆。
- **未來視覺軌道彈性**：若 customer scope 後續引入專屬 design tokens 與 layout，
  只需替換 `[locale]/login/page.tsx` 等 customer pages 的 form / layout 元件，
  HQ 端 `/hq/login` 完全不受影響。
- **Form-level link 對齊各自 scope**：HQ 內 `/hq/login` 的「忘記密碼」link 直接指
  `/hq/forgot-password`，不會錯誤導到 customer 路徑。

---

## 帳號登入（accountName）

登入識別子為 **帳號（`User.accountName`）**，不再是 email：

- **格式**：`^[a-zA-Z0-9_]{3,20}$`，**case-insensitive 唯一**。「Admin」與「admin」視為同一帳號。
- **小寫正規化儲存**：Prisma schema `accountName String? @unique @map("account_name") @db.VarChar(20)`。
  建立 / 註冊時 application 層一律以 `trim().toLowerCase()` 存入，讓 raw-column 的 `@unique`
  index 直接強制 case-insensitive 唯一性；登入用 `findUnique({ where: { accountName } })` 的
  **exact match** 命中 unique index（避免改用 `LOWER(account_name)` 退化成 seq scan）。
  > Postgres 下 `String? @unique` 允許多筆 `NULL`（DB nullable 以相容既有資料），但建立 /
  > 註冊時由 application 層強制必填。
- **Email**：改為**非唯一**、僅供通知 / 聯繫用（`user.prisma` 的 `email` 不再 `@unique`，
  保留 `@@index([email])`）。建立 / 註冊 / profile 更新都不再檢查 email 重複。
  > 取捨：忘記密碼（`PasswordResetService`）仍以 email 查找——因 email 已非唯一，改用
  > `findFirst({ where: { email }, orderBy: { createdAt: 'asc' } })`；若多帳號共用同一
  > email，reset link 寄給「最早建立」的帳號。實務上 email 唯一，共用為邊界情況。
- **後端**：`AuthService.login()`（`apps/backend/src/auth/auth.service.ts`）先 `trim().toLowerCase()`，
  經 `assertValidAccountName()` 驗格式後以 `findUnique({ where: { accountName } })` 查找；
  因帳號已小寫儲存，故走 raw-column unique index 而非 `LOWER()`。不存在 / 已軟刪除一律回
  `auth.invalidCredentials`（避免帳號枚舉，同時累計 IP lockout）。建立 / 註冊
  （`UserService.createUser` / `AuthService.registerCustomer` / `AuthService.registerHQ`）皆驗
  account 格式 + 唯一性。
  > GraphQL `login(email, password)`（`apps/backend/src/auth/auth.resolver.ts`）的 `email`
  > 參數名為**向後相容保留**，語意為 accountName；前端 `LoginForm` 的 form data 欄位名同樣沿用
  > `email`。
- **前端**：`LoginForm`（`apps/frontend/src/components/organisms/LoginForm/LoginForm.tsx`）欄位
  label 改「帳號」（`t('accountLabel')`）、`type="text"`、`autoComplete="username"`，zod 改用
  `regex(/^[a-zA-Z0-9_]{3,20}$/)` 而非 `.email()`。
- **記住我**：`/login` 與 `/hq/login` 共用的 `LoginForm` 含「記住我」checkbox，透過 `login`
  mutation 的 `rememberMe` 參數送至後端決定 `refresh_token` cookie 是否持久化；勾選後 token
  refresh（`refreshToken`）與 2FA（`verifyTwoFactorLogin`）皆沿用該偏好（以 HttpOnly 的
  `remember_me` cookie 記錄，無 DB migration；見 [Token 配置](TOKEN-CONFIGURATION.md#記住我remember-me)）。
  兩個 scope 的登入頁皆已接上，行為一致。
- **Seed 測試帳號**：`hq_admin`（`hq@example.com`）/ `customer_admin`（`admin@example.com`）/
  `public_user`（`public@example.com`），密碼皆 `Password123!`（`apps/backend/database/prisma/seeds/development.ts`，
  以 `accountName` 為 `upsert` 鍵）。

---

## 登入後 scope 導向（resolveLandingPath）

兩個登入頁各自有 `resolveLandingPath()`，解析 JWT `accessScopes` claim，**以「登入入口所屬
scope」優先**決定落點（雙 scope HQ 使用者從哪個頁登入就進對應 scope）：

| 登入入口             | 優先落點                           | fallback          |
| -------------------- | ---------------------------------- | ----------------- |
| `/hq/login`          | 含 `HQ_SCOPE` → `/hq/users`        | 否則 `/dashboard` |
| `/login`（customer） | 含 `CUSTOMER_SCOPE` → `/dashboard` | 否則 `/hq/users`  |

```ts
// apps/frontend/src/app/[locale]/hq/login/page.tsx
function resolveLandingPath(): string {
  const token = getAccessToken();
  if (!token) return '/dashboard';
  const scopes = (parseJwt(token)?.accessScopes as string[]) || [];
  if (scopes.includes(AccessScope.HQ_SCOPE)) return '/hq/users';
  if (scopes.includes(AccessScope.CUSTOMER_SCOPE)) return '/dashboard';
  return '/dashboard';
}
```

- 登入成功（含 2FA 後 `redirectToDashboard()`）與「已登入再訪登入頁」（`useEffect` 內）皆走此
  helper；`me.profile.language` 與當前 locale 不同時改用完整 URL（`/${lang}${landing}`）跳轉。
- **HQ 跨 scope**：JWT 已帶使用者全部 scope（`AuthService.generateTokens()` 的 `accessScopes`
  claim），後端 login **不限制 scope**，故雙 scope HQ 使用者可同時進 HQ 與 customer 區。
- **頁面守衛仍由 `ProtectedRoute(requiredScopes=...)` 把關**：HQ 頁面 `[HQ_SCOPE]`，純 customer
  帳號訪 HQ 頁會被導開；`/dashboard` 未加硬性 scope 限制。

---

## 首次登入強制變更密碼（mustChangePassword）

由管理員配置（非自助設定）的帳號，首次登入**必須先變更密碼**才能進入系統，改完才導向
[scope 落點](#登入後-scope-導向resolvelandingpath)，不會停留在變更密碼頁。

**哪些帳號帶旗標（`User.mustChangePassword = true`）：**

| 來源                                                   | 旗標       | 說明                               |
| ------------------------------------------------------ | ---------- | ---------------------------------- |
| HQ 後台建立帳號（`UserService.createUser`）            | ✅         | 管理員給的是臨時密碼               |
| 管理員重設密碼（`UserService.hqResetPassword`）        | ✅         | 重設後使用者下次登入須自行改       |
| Seed 帳號（`hq_admin`/`customer_admin`/`public_user`） | ✅         | 與配置帳號行為一致，方便示範       |
| 自助註冊（`registerCustomer`/`registerHQ`，密碼自選）  | ❌         | 密碼非臨時、由本人設定，無需強制改 |
| 使用者自助成功改密（`changePassword`）後               | ❌（清除） | —                                  |

**機制 — 以 JWT claim 為權威依據：**

- 後端 `AuthService.generateTokens()`（`apps/backend/src/auth/auth.service.ts`）在
  `user.mustChangePassword === true` 時於 token payload 加入 `mustChangePassword: true`
  （為 false 時**不加**，避免污染既有 token 形狀）：

  ```ts
  const payload: JwtPayload = {
    sub: user.id,
    email: user.email,
    accessScopes,
    roles: rolesByScope,
    permissions,
    ...(user.mustChangePassword ? { mustChangePassword: true } : {}),
  };
  ```

  `login` / `refresh` / `verifyTwoFactor` 皆從**即時 user 實體**（重新 `findUnique`）重簽 token，
  故旗標一旦在 DB 清除，下次刷新／簽發的 token 即不再帶 claim。`JwtPayload` 介面
  （`apps/backend/src/auth/auth.types.ts`）的 `mustChangePassword?: boolean` 為 optional。

- 前端 `apps/frontend/src/lib/auth.ts` 的 `mustChangePassword()` 解析此 claim 供 UI 導向
  （授權仍由後端把關）。

**變更密碼頁按 scope 分軌**（與其他 auth 頁一致）：customer 在 `/change-password`、HQ 在
`/hq/change-password`，兩者皆薄包 `ProtectedRoute`，共用 `ForcedChangePassword` 元件，差異僅在
`scope` prop 決定的落點優先序。

**導向關卡（兩道）：**

1. **登入頁**：`/login` 與 `/hq/login` 的 `useEffect`（已登入再訪）與 `redirectToDashboard()`
   （剛登入成功 / 2FA 後）在算出 scope 落點後，若 `mustChangePassword()` 為真，**customer
   登入頁導向 `/change-password`、HQ 登入頁導向 `/hq/change-password`**（皆帶
   `?next=<scope 落點>`）。
2. **`ProtectedRoute` 後盾**：`enforcePasswordChange()`（`apps/frontend/src/components/auth/ProtectedRoute.tsx`）
   在**權限／scope 檢查之前**執行 —— 帶旗標者深連結任一受保護頁，會先被導去**對應 scope 的
   變更密碼頁**（依 `/hq/` 前綴分軌，與 `resolveLoginRoute` 一致；即使該頁無權限，也不會卡在
   Permission Denied）。變更密碼頁本身（路徑含 `/change-password`，兩軌皆符合）豁免，避免無窮
   redirect。

   ```ts
   function enforcePasswordChange(
     router: { replace: (path: string) => void },
     pathname: string | null,
   ): boolean {
     if (
       mustChangePassword() &&
       !(pathname && pathname.includes('/change-password'))
     ) {
       router.replace(
         pathname && pathname.includes('/hq/')
           ? '/hq/change-password'
           : '/change-password',
       );
       return true;
     }
     return false;
   }
   ```

**`ForcedChangePassword` 元件（`apps/frontend/src/components/auth/ForcedChangePassword.tsx`）：**

- 用 `AuthLayout` + `ChangePasswordForm`，顯示首登提示；`scope: 'hq' | 'customer'` 決定落點優先序。
- 成功後呼叫 `refreshAccessToken('forced-password-change')` 取得**不再帶 claim** 的新 JWT，再
  導向 `next`（僅接受站內相對路徑，避免 open redirect）或依 scope 推導的落點。
  - **與 nptc 不同**：MEAD 後端 `changePassword`（`UserService.changePasswordSelf`）在交易中把
    `mustChangePassword` 清為 `false`，但**預設不撤銷當前 session**（`revokeOtherSessions`
    預設 false，僅在 input 明確帶入時才 `revokeAllSessions`）。因此前端不需處理 refresh-token
    threading —— 單純刷新一次 token 即可丟掉舊 claim、放行落點。
  - 萬一刷新失敗（極少數），fallback 走 `logout()` 回登入頁，避免帶舊 claim 回落點造成關卡反覆導向。
- i18n 鍵：`auth.changePassword.{title,subtitle,notice,success}`
  （`apps/frontend/messages/{en,zh-TW}.json`）。

---

## 路由對應表

| 功能         | Customer scope (`/`) | HQ scope (`/hq/`)     | 共用元件                                                           |
| ------------ | -------------------- | --------------------- | ------------------------------------------------------------------ |
| 登入         | `/login`             | `/hq/login`           | `AuthLayout` + `LoginForm`                                         |
| 忘記密碼     | `/forgot-password`   | `/hq/forgot-password` | `AuthLayout` + `ForgotPasswordForm`                                |
| 重設密碼     | `/reset-password`    | `/hq/reset-password`  | `AuthLayout` + `ResetPasswordForm`                                 |
| 首登強制改密 | `/change-password`   | `/hq/change-password` | `AuthLayout` + `ChangePasswordForm`（共用 `ForcedChangePassword`） |

實作位置：

- Customer pages：`apps/frontend/src/app/[locale]/{login,forgot-password,reset-password,change-password}/page.tsx`
- HQ pages：`apps/frontend/src/app/[locale]/hq/{login,forgot-password,reset-password,change-password}/page.tsx`
- 變更密碼兩軌共用 `apps/frontend/src/components/auth/ForcedChangePassword.tsx`（`scope` prop 決定落點）

業務邏輯（mutation / state / handler / redirect after success）兩 scope 完全一致，
差異僅在 form prop 注入的 link target（見下節）與 `scope` prop 決定的落點優先序。

---

## Path-based scope 偵測

未登入時的 redirect 路徑、`ProtectedRoute` 的 push target 全部依
**目前 URL 是否含 `/hq/` 前綴** 動態決定。

### `getLoginPath()` 分流

`apps/frontend/src/lib/auth.ts`：

```ts
export const getLoginPath = (): string => {
  const prefix = getLocalePrefix();
  if (
    typeof window !== 'undefined' &&
    window.location.pathname.includes('/hq/')
  ) {
    return `${prefix}/hq/login`;
  }
  return `${prefix}/login`;
};
```

SSR 期間 `window` 不存在，fallback 回 customer `/login`。`logout()` 也以此 helper 決定回哪個登入頁。

### `ProtectedRoute` redirect helper

`apps/frontend/src/components/auth/ProtectedRoute.tsx` 抽 `resolveLoginRoute()` helper：

```ts
function resolveLoginRoute(pathname: string | null): string {
  return pathname && pathname.includes('/hq/') ? '/hq/login' : '/login';
}
```

各 callsite（auth fail redirect / permission error retry button）改用此 helper。**回傳路徑不含
locale prefix** — `useNavRouter` (next-intl) 會自動 prepend。`useEffect` 的 dependency array
含 `pathname`，確保用戶在 customer / HQ 路徑切換時 helper 重新取值。

---

## Form 共用 + optional href prop pattern

MEAD 視覺層未分軌，HQ 與 customer 共用同一個 `LoginForm` / `ForgotPasswordForm`
元件。Form 內的「忘記密碼」「返回登入」link 改用 **optional href prop** 接收
caller 注入的 target，預設值維持 customer 路徑（向後相容）。

### `LoginForm.tsx`

```ts
export interface LoginFormProps {
  // ...
  forgotPasswordHref?: string; // default: '/forgot-password'
}
```

- HQ login page 呼叫：`<LoginForm forgotPasswordHref="/hq/forgot-password" ... />`
- Customer login page 呼叫：`<LoginForm ... />`（不傳 → default `/forgot-password`）

### `ForgotPasswordForm.tsx`

兩處 link（success state 與 form bottom）共用 `backToLoginHref?` prop（default `/login`）。

- HQ forgot-password page：`<ForgotPasswordForm backToLoginHref="/hq/login" ... />`
- Customer：不傳 → default `/login`

### `ResetPasswordForm.tsx`

該 form 內**沒有** render 任何 `/login` link — 重設成功後的 redirect 在 page-level
進行（HQ → `/hq/login`、customer → `/login`），無需加 prop。

---

## Backend reset email link

`apps/backend/src/auth/password-reset.service.ts` 的 `requestPasswordReset()` 寄送 password
reset email 時，依申請者 `user.accessScopes` 決定連結路徑（base URL 來自 `PASSWORD_RESET_URL`
或由 `APP_URL` 推導的 `/reset-password`）：

```ts
// HQ 帳號的重設連結走 /hq/reset-password 分軌（對齊前端 auth 路由分軌）
const resetUrl = user.accessScopes?.includes(AccessScope.HQ_SCOPE)
  ? this.RESET_URL.replace(/\/reset-password$/, '/hq/reset-password')
  : this.RESET_URL;
```

HQ 用戶收到的 reset link 指向 `/hq/reset-password`，customer 指向 `/reset-password`，與
前端兩套路由分軌一致。

---

## 新增頁面的注意事項

- **新 customer scope 頁面**：路由結構維持原樣（`apps/frontend/src/app/[locale]/<page>/page.tsx`），
  `ProtectedRoute(requiredScopes=[CUSTOMER_SCOPE])` 包外層。
- **新 HQ scope 頁面**：放 `apps/frontend/src/app/[locale]/hq/<page>/page.tsx`，
  `ProtectedRoute(requiredScopes=[HQ_SCOPE])` 包外層。
- **共用 form 元件加 link prop**：若新增 form 內含 navigation link 指向 auth-related
  路徑，遵循同樣 optional href prop pattern（default 給 customer 路徑、HQ caller 注入
  `/hq/...`）。
- **避免**：在 form 元件內 hardcode `/login` 或 `/forgot-password` 等路徑 — 會綁死
  customer scope，HQ 共用時會誤導用戶。

---

## 相關文檔

- [GraphQL Schema 合約](../architecture/GRAPHQL_SCHEMA_CONTRACT.md) — JWT claim 形狀（含 `mustChangePassword`）、login union 回傳
- [用戶註冊](./REGISTRATION.md) — 帳號登入、邀請制註冊與首登強制改密
