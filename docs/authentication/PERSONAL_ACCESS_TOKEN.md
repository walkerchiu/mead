# 個人存取權杖 (Personal Access Token)

說明個人存取權杖（PAT）的架構設計、認證流程與資料模型。模板提供完整的 PAT 基礎建設，但**未預設任何可用 Scope**——使用者需根據自身業務需求在 `personal-access-token.service.ts` 的 `ALLOWED_SCOPES` 中加入合法 Scope。

---

## 📋 目錄

- [📖 概述](#-概述)
- [🏗️ 核心概念](#-核心概念)
- [🔐 Token 安全設計](#-token-安全設計)
- [📊 資料模型](#-資料模型)
- [🔑 認證流程](#-認證流程)
- [🔌 API 參考](#-api-參考)
- [🔔 通知機制](#-通知機制)
- [📁 相關檔案](#-相關檔案)

---

## 📖 概述

個人存取權杖（PAT）讓用戶在不需要瀏覽器登入的情況下，透過 API 存取系統資源。

- **PersonalAccessTokenService** — 權杖管理：建立、列表、撤銷、驗證
- **PatAuthGuard** — 認證中間層：從 `Authorization: Bearer npt_xxx` 提取並驗證 PAT
- **PAT 通知** — 建立/撤銷 Token 時自動發送系統通知與 Email

**核心特點：**

- ✅ Token 不可逆儲存（SHA-256 hash）
- ✅ Scope 限縮機制（白名單驗證）
- ✅ 到期機制（30 / 90 / 180 天）
- ✅ 每人最多 3 個有效 Token

---

## 🏗️ 核心概念

| 概念                   | 說明                                             |
| ---------------------- | ------------------------------------------------ |
| **個人存取權杖 (PAT)** | 長效 API Token，用於外部工具存取系統             |
| **Scope**              | 權杖的授權範圍。模板未預設值，業務專案需自行定義 |
| **Token Prefix**       | `npt_` 前綴，用於區分 PAT 和 JWT Token           |

---

## 🔐 Token 安全設計

### Token 格式

```text
npt_<32 字元隨機 hex>
```

- 總長度：37 字元
- 範例：`npt_a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4`
- 前綴 `npt_` 用於 Guard 快速辨識是否為 PAT

### 儲存策略

| 項目            | 說明                                    |
| --------------- | --------------------------------------- |
| **tokenHash**   | SHA-256 hash（不可逆），存入資料庫      |
| **tokenPrefix** | 前 12 字元（`npt_a1b2c3d`），供列表識別 |
| **明文 Token**  | 僅在建立時回傳一次，之後無法再查看      |

```typescript
// Token 產生
const rawToken = 'npt_' + crypto.randomBytes(16).toString('hex');
const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
const tokenPrefix = rawToken.substring(0, 12);
```

### 限制機制

| 項目                  | 預設值                         |
| --------------------- | ------------------------------ |
| 每人最多有效 Token 數 | 3                              |
| 允許的到期天數        | 30 / 90 / 180 天               |
| 允許的 Scope          | 由 `ALLOWED_SCOPES` 白名單控制 |

---

## 📊 資料模型

### Prisma Schema

詳見 `apps/backend/database/prisma/schemas/personal-access-token.prisma`：

```prisma
model PersonalAccessToken {
  id          String    @id @default(uuid())
  userId      String
  name        String
  tokenHash   String    @unique
  tokenPrefix String
  scopes      String[]
  lastUsedAt  DateTime?
  lastUsedIp  String?
  expiresAt   DateTime
  createdAt   DateTime  @default(now())
  revokedAt   DateTime?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### 設定 ALLOWED_SCOPES

模板預設 `ALLOWED_SCOPES` 為空陣列。若要使用 PAT，請於 `apps/backend/src/modules/personal-access-token/personal-access-token.service.ts` 加入您專案的 Scope：

```typescript
// 範例：加入自訂 scope
const ALLOWED_SCOPES: readonly string[] = [
  'reports:read',
  'reports:write',
] as const;
```

---

## 🔑 認證流程

### PAT 認證 vs JWT 認證

| 特性     | JWT (一般登入)      | PAT (個人存取權杖)            |
| -------- | ------------------- | ----------------------------- |
| 來源     | 登入後產生          | 用戶於設定頁主動建立          |
| 有效期   | 短（access ~15min） | 長（30/90/180 天）            |
| 撤銷     | Token 失效機制      | 軟刪除（`revokedAt`）         |
| Scope    | 完整角色權限        | 僅限白名單內的 scope          |
| 識別方式 | 標準 JWT            | `Authorization: Bearer npt_*` |

### PatAuthGuard 流程

1. 從 `Authorization: Bearer <token>` 抓出 token
2. 檢查前綴 `npt_` 與長度 37 字元
3. SHA-256 雜湊後查 DB（`tokenHash`）
4. 驗證 `revokedAt is null` 與 `expiresAt > now`
5. 將 `userId` 與 `scopes` 寫入 request context
6. 非同步更新 `lastUsedAt` 與 `lastUsedIp`

### PermissionGuard 整合

PAT 認證後的 request 會在 `PermissionGuard` 中比對 scope，僅允許 `scopes` 中明列的權限。

---

## 🔌 API 參考

### GraphQL（前端管理用）

| Mutation / Query                   | 說明                 |
| ---------------------------------- | -------------------- |
| `createPersonalAccessToken(input)` | 建立新 Token         |
| `revokePersonalAccessToken(id)`    | 撤銷 Token（軟刪除） |
| `personalAccessTokens`             | 列出自己的所有 Token |

### REST API（外部整合用）

模板未預設任何 PAT-protected REST endpoint。新增時請：

1. 於 controller 加 `@UseGuards(PatAuthGuard)`
2. 對應動作標註 `@RequiresPermission('your-scope')`
3. 於 `ALLOWED_SCOPES` 白名單加入相同 scope

---

## 🔔 通知機制

PAT 建立或撤銷時，系統會自動發送：

- **系統通知（鈴鐺）** — 由 `NotificationService.createLocalizedNotification` 發送
- **Email 通知** — 由 `MailService.sendPatNotificationEmail` 發送

兩者均可由環境變數 `PUSH_NOTIFY_PAT` / `MAIL_NOTIFY_PAT` 開關。

---

## 📁 相關檔案

| 路徑                                                                               | 說明                           |
| ---------------------------------------------------------------------------------- | ------------------------------ |
| `apps/backend/database/prisma/schemas/personal-access-token.prisma`                | DB Schema                      |
| `apps/backend/src/modules/personal-access-token/personal-access-token.service.ts`  | 服務（含 ALLOWED_SCOPES 設定） |
| `apps/backend/src/modules/personal-access-token/personal-access-token.resolver.ts` | GraphQL Resolver               |
| `apps/backend/src/auth/pat-auth.guard.ts`                                          | PAT 認證 Guard                 |
| `apps/backend/src/mail/templates/{en,zh-TW}/pat-notification.hbs`                  | Email 模板                     |
| `apps/frontend/src/app/[locale]/settings/tokens/page.tsx`                          | 前端管理頁                     |

---

## 📖 相關文檔

- [權限系統](./PERMISSION_SYSTEM.md) — 權限與 scope 的整體設計
- [RBAC 架構](./RBAC_ARCHITECTURE.md) — 多層式授權架構
- [Email 服務配置](../backend/EMAIL_CONFIGURATION.md) — Email 通知配置
