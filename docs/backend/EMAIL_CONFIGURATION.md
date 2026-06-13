# Email 服務配置指南 (Email Configuration)

完整的 Email 服務設定，支援 SMTP 和 Microsoft Graph API 雙模式，可用於密碼重設和通知發送。

---

## 目錄

- [Email 服務配置指南 (Email Configuration)](#email-服務配置指南-email-configuration)
  - [目錄](#目錄)
  - [概述](#概述)
    - [技術棧](#技術棧)
  - [快速開始](#快速開始)
    - [1. 安裝依賴](#1-安裝依賴)
    - [2. 環境變數配置](#2-環境變數配置)
    - [3. 啟動服務](#3-啟動服務)
    - [4. 測試 Email](#4-測試-email)
  - [配置說明](#配置說明)
    - [環境變數](#環境變數)
    - [Mail Module 配置](#mail-module-配置)
  - [Email 模板](#email-模板)
    - [1. 密碼重設 (password-reset.hbs)](#1-密碼重設-password-resethbs)
    - [2. 雙因素驗證碼 (two-factor-code.hbs)](#2-雙因素驗證碼-two-factor-codehbs)
    - [3. 密碼變更通知 (password-changed.hbs)](#3-密碼變更通知-password-changedhbs)
  - [郵件種類與觸發邏輯](#郵件種類與觸發邏輯)
    - [郵件總覽](#郵件總覽)
    - [各郵件觸發時機與呼叫者](#各郵件觸發時機與呼叫者)
    - [多語系 Email](#多語系-email)
  - [開發環境](#開發環境)
    - [方案一：Ethereal Email（線上測試）](#方案一ethereal-email線上測試)
    - [方案二：Mailpit（本地測試）](#方案二mailpit本地測試)
    - [開發環境方案比較](#開發環境方案比較)
  - [郵件發送模式](#郵件發送模式)
    - [SMTP 模式（預設）](#smtp-模式預設)
    - [Graph API 模式](#graph-api-模式)
  - [生產環境](#生產環境)
    - [推薦 SMTP 服務](#推薦-smtp-服務)
    - [配置範例（SendGrid）](#配置範例sendgrid)
    - [安全最佳實踐](#安全最佳實踐)
  - [疑難排解](#疑難排解)
  - [測試範例](#測試範例)
  - [相關檔案](#相關檔案)

---

## 概述

MEAD 專案使用 `@nestjs-modules/mailer` 作為 Email 服務，支援 SMTP 和 Microsoft Graph API 雙模式，搭配 Handlebars 模板引擎。

- **MailService** — 核心服務：根據 `MAIL_PROVIDER` 自動選擇 SMTP 或 Graph API 發送
- **GraphMailService** — Graph API 發送：使用 Microsoft OAuth2 Client Credentials Flow

### 技術棧

- **框架**: @nestjs-modules/mailer
- **模板引擎**: Handlebars (.hbs)
- **傳輸協議**: SMTP / Microsoft Graph API
- **開發測試**: Ethereal Email (線上測試) / Mailpit (本地測試)

---

## 快速開始

### 1. 安裝依賴

```bash
pnpm add @nestjs-modules/mailer nodemailer handlebars
pnpm add -D @types/nodemailer
```

### 2. 環境變數配置

複製範例檔案：

```bash
# 開發環境
cp apps/backend/.env.example apps/backend/.env

# 生產環境
cp apps/backend/.env.prod.example apps/backend/.env.prod
```

### 3. 啟動服務

```bash
# 使用 MEAD CLI
./scripts/cli.sh dev

# 或手動啟動
cd apps/backend
pnpm dev
```

### 4. 測試 Email

開發環境使用 Ethereal Email，可在以下網址查看發送的郵件：

```text
https://ethereal.email/login

使用 .env 中的帳號密碼登入
```

---

## 配置說明

### 環境變數

#### 共用變數

| 變數                    | 說明                   | 開發環境                               | 生產環境                                 |
| ----------------------- | ---------------------- | -------------------------------------- | ---------------------------------------- |
| `MAIL_PROVIDER`         | 郵件發送模式           | smtp                                   | graph                                    |
| `MAIL_FROM`             | 寄件者 Email           | <noreply@ethereal.email>               | <noreply@example.com>                    |
| `MAIL_FROM_NAME`        | 寄件者名稱             | MEAD App                               | Your App Name                            |
| `PASSWORD_RESET_EXPIRY` | 密碼重設有效期（分鐘） | 30                                     | 15                                       |
| `PASSWORD_RESET_URL`    | 密碼重設頁面 URL       | <http://localhost:3000/reset-password> | <https://app.example.com/reset-password> |

#### SMTP 模式變數（`MAIL_PROVIDER=smtp`）

| 變數          | 說明         | 開發環境            | 生產環境         |
| ------------- | ------------ | ------------------- | ---------------- |
| `MAIL_HOST`   | SMTP 伺服器  | smtp.ethereal.email | smtp.example.com |
| `MAIL_PORT`   | SMTP 埠號    | 587                 | 587              |
| `MAIL_SECURE` | 是否使用 TLS | false               | true             |
| `MAIL_USER`   | SMTP 帳號    | (Ethereal 帳號)     | (真實帳號)       |
| `MAIL_PASS`   | SMTP 密碼    | (Ethereal 密碼)     | (真實密碼)       |

#### Graph API 模式變數（`MAIL_PROVIDER=graph`）

| 變數                     | 說明                 | 生產環境                             |
| ------------------------ | -------------------- | ------------------------------------ |
| `AZURE_AD_TENANT_ID`     | Azure AD 租戶 ID     | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| `AZURE_AD_CLIENT_ID`     | Azure AD 應用程式 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| `AZURE_AD_CLIENT_SECRET` | Azure AD 用戶端密碼  | your-client-secret                   |

#### 通知開關

控制非核心郵件通知是否發送。密碼重設連結與 2FA 驗證碼為核心功能，無法關閉。

| 變數                                 | 說明             | 預設    |
| ------------------------------------ | ---------------- | ------- |
| `MAIL_NOTIFY_PASSWORD_CHANGED`       | 密碼變更通知     | `true`  |
| `MAIL_NOTIFY_PROFILE_UPDATED`        | 個人資料更新通知 | `false` |
| `MAIL_NOTIFY_ACCOUNT_LOCKED`         | 帳號鎖定通知     | `true`  |
| `MAIL_NOTIFY_SESSION_REVOKED`        | 會話撤銷通知     | `false` |
| `MAIL_NOTIFY_BATCH_SESSIONS_REVOKED` | 批量會話撤銷通知 | `false` |
| `MAIL_NOTIFY_PAT`                    | 個人存取權杖通知 | `true`  |

#### 系統通知開關（鈴鐺 + 通知中心）

控制事件是否產生系統通知（出現在鈴鐺下拉選單和通知中心頁面）。

| 變數                                 | 說明             | 預設   |
| ------------------------------------ | ---------------- | ------ |
| `PUSH_NOTIFY_PASSWORD_CHANGED`       | 密碼變更通知     | `true` |
| `PUSH_NOTIFY_ACCOUNT_LOCKED`         | 帳號鎖定通知     | `true` |
| `PUSH_NOTIFY_SESSION_REVOKED`        | 會話撤銷通知     | `true` |
| `PUSH_NOTIFY_BATCH_SESSIONS_REVOKED` | 批量會話撤銷通知 | `true` |
| `PUSH_NOTIFY_PAT`                    | 個人存取權杖通知 | `true` |

### Mail Module 配置

`/src/mail/mail.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { MailService } from './mail.service';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: process.env.MAIL_HOST,
        port: parseInt(process.env.MAIL_PORT || '587'),
        secure: process.env.MAIL_SECURE === 'true',
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
      },
      defaults: {
        from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM}>`,
      },
      template: {
        dir: join(__dirname, 'templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
```

---

## Email 模板

### 1. 密碼重設 (password-reset.hbs)

**用途**: 用戶忘記密碼時發送重設連結

**模板變數**:

- `name`: 用戶名稱
- `url`: 密碼重設連結
- `ipAddress`: 請求 IP 地址
- `expiresIn`: 有效期（分鐘）
- `timestamp`: 發送時間戳

**範例**:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>密碼重設</title>
  </head>
  <body>
    <h1>您好，{{name}}</h1>
    <p>我們收到了您的密碼重設請求。</p>
    <p>請點擊以下連結重設您的密碼：</p>
    <a href="{{url}}">重設密碼</a>
    <p>此連結將在 {{expiresIn}} 分鐘後失效。</p>
    <p>請求來自 IP: {{ipAddress}}</p>
    <p>時間: {{timestamp}}</p>
    <p>如果這不是您的操作，請忽略此郵件。</p>
  </body>
</html>
```

### 2. 雙因素驗證碼 (two-factor-code.hbs)

**用途**: 發送 2FA 驗證碼

**模板變數**:

- `name`: 用戶名稱
- `code`: 6 位數驗證碼
- `expiryMinutes`: 有效期（10 分鐘）
- `purpose`: 用途（LOGIN/ENABLE/DISABLE）
- `ipAddress`: 請求 IP 地址
- `timestamp`: 發送時間戳

**範例**:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>雙因素驗證碼</title>
  </head>
  <body>
    <h1>您好，{{name}}</h1>
    <p>您的雙因素驗證碼是：</p>
    <h2 style="font-size: 32px; letter-spacing: 8px;">{{code}}</h2>
    <p>此驗證碼將在 {{expiryMinutes}} 分鐘後失效。</p>
    <p>用途: {{purpose}}</p>
    <p>請求來自 IP: {{ipAddress}}</p>
    <p>時間: {{timestamp}}</p>
    <p><strong>請勿將此驗證碼分享給任何人！</strong></p>
  </body>
</html>
```

### 3. 密碼變更通知 (password-changed.hbs)

**用途**: 密碼變更後的安全通知

**模板變數**:

- `name`: 用戶名稱
- `ipAddress`: 操作 IP 地址
- `timestamp`: 變更時間戳

**範例**:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>密碼已變更</title>
  </head>
  <body>
    <h1>您好，{{name}}</h1>
    <p>您的密碼已成功變更。</p>
    <p>變更時間: {{timestamp}}</p>
    <p>操作 IP: {{ipAddress}}</p>
    <p>如果這不是您的操作，請立即聯繫客服。</p>
  </body>
</html>
```

---

## 郵件種類與觸發邏輯

系統共有 **9 種郵件**（使用 9 個模板 × 2 語言 = 18 個模板檔案），分為**核心功能**、**帳號安全通知**和**業務模組通知**。

### 郵件總覽

#### 帳號安全（7 種）

| #   | 方法                            | 模板                     | 分類 | 開關                                 | 預設     |
| --- | ------------------------------- | ------------------------ | ---- | ------------------------------------ | -------- |
| 1   | `sendPasswordResetEmail`        | `password-reset`         | 核心 | —                                    | 永遠開啟 |
| 2   | `sendTwoFactorCode`             | `two-factor-code`        | 核心 | —                                    | 永遠開啟 |
| 3   | `sendPasswordChangedEmail`      | `password-changed`       | 通知 | `MAIL_NOTIFY_PASSWORD_CHANGED`       | `true`   |
| 4   | `sendProfileUpdatedEmail`       | `profile-updated`        | 通知 | `MAIL_NOTIFY_PROFILE_UPDATED`        | `false`  |
| 5   | `sendAccountLockedEmail`        | `account-locked`         | 通知 | `MAIL_NOTIFY_ACCOUNT_LOCKED`         | `true`   |
| 6   | `sendSessionRevokedEmail`       | `session-revoked`        | 通知 | `MAIL_NOTIFY_SESSION_REVOKED`        | `false`  |
| 7   | `sendBatchSessionsRevokedEmail` | `sessions-batch-revoked` | 通知 | `MAIL_NOTIFY_BATCH_SESSIONS_REVOKED` | `false`  |

#### PAT 通知

| #   | 方法                       | 模板               | 涵蓋事件                  | 開關              | 預設   |
| --- | -------------------------- | ------------------ | ------------------------- | ----------------- | ------ |
| 8   | `sendPatNotificationEmail` | `pat-notification` | 權杖建立/撤銷（2 種事件） | `MAIL_NOTIFY_PAT` | `true` |

> 業務模組可依需要新增自己的通知方法與模板。

### 各郵件觸發時機與呼叫者

#### 1. 密碼重設連結（核心）

- **觸發**：用戶點擊「忘記密碼」提交 email 後
- **呼叫者**：`PasswordResetService.requestPasswordReset()`
- **模板變數**：`name`, `url`, `expiresIn`, `ipAddress`, `timestamp`
- **備註**：連結有效期由 `PASSWORD_RESET_EXPIRE_MINUTES` 控制；URL 自動由 `APP_URL/reset-password` 產生

#### 2. 雙因素認證驗證碼（核心）

- **觸發**：
  - 啟用 2FA 的用戶登入時（`purpose: LOGIN`）
  - 用戶啟用 2FA 時（`purpose: ENABLE`）
  - 用戶停用 2FA 時（`purpose: DISABLE`）
- **呼叫者**：`TwoFactorAuthService.sendLoginCode()` / `requestEnable()` / `requestDisable()`
- **模板變數**：`name`, `code`, `expiryMinutes`, `purpose`, `ipAddress`, `timestamp`
- **備註**：6 位數驗證碼，10 分鐘有效，最多嘗試 5 次

#### 3. 密碼變更通知

- **觸發**：
  - 用戶透過重設連結成功設定新密碼
  - 用戶自行修改密碼
  - 管理員重設用戶密碼
- **呼叫者**：`PasswordResetService.resetPassword()` / `UserService.changePasswordSelf()` / `UserService.hqResetPassword()`
- **模板變數**：`name`, `ipAddress`, `timestamp`

#### 4. 個人資料更新通知

- **觸發**：用戶更新自己的姓名或 Email
- **呼叫者**：`UserService.updateUserSelf()`
- **模板變數**：`name`, `changes[]`（變更列表）, `ipAddress`, `timestamp`
- **備註**：預設關閉

#### 5. 帳號鎖定通知

- **觸發**：連續 5 次登入失敗，帳號被鎖定 15 分鐘
- **呼叫者**：`AccountLockoutService.recordFailedLogin()`
- **模板變數**：`name`, `lockoutMinutes`, `ipAddress`, `timestamp`
- **備註**：失敗計數器有 30 分鐘重設視窗

#### 6. 會話撤銷通知

- **觸發**：管理員撤銷單一用戶會話
- **呼叫者**：`HQSessionService.sendRevocationNotification()`
- **模板變數**：`userName`, `deviceInfo`, `browser`, `os`, `ipAddress`, `location`, `revokedByName`, `reason`, `customMessage`, `timestamp`
- **備註**：預設關閉

#### 7. 批量會話撤銷通知

- **觸發**：管理員批量撤銷用戶的多個會話
- **呼叫者**：`HQSessionService.sendBatchRevocationNotification()`
- **模板變數**：`userName`, `sessionCount`, `sessions[]`, `revokedByName`, `reason`, `customMessage`, `timestamp`
- **備註**：預設關閉

#### 8. 個人存取權杖通知

- **觸發**：
  - 建立 Token → Token 擁有者
  - 撤銷 Token → Token 擁有者
- **呼叫者**：`PersonalAccessTokenService.create()` / `PersonalAccessTokenService.revoke()`
- **模板變數**：`userName`, `isCreated`, `tokenName`, `tokenPrefix`, `scopes`, `expiresAt`, `timestamp`, `supportEmail`
- **備註**：同時觸發系統鈴鐺通知（`PUSH_NOTIFY_PAT`）與 Email 通知（`MAIL_NOTIFY_PAT`），按鈕連結指向 `APP_URL/settings/pat`

### 多語系 Email

Mail Service 支援根據用戶語言偏好發送對應語言的 Email。

**語言選擇邏輯**：

- 所有 send 方法都接受可選的 `lang` 參數
- 使用 `getLocale()` 方法驗證並回退語言：支援 `en`、`zh-TW`，`zh` 自動映射為 `zh-TW`，其餘回退至 `en`
- Email 主旨透過 `I18nService` 翻譯，模板路徑使用 `./${locale}/template-name` 格式
- 時間戳格式和時區根據語言自動調整（`zh-TW` 使用 `Asia/Taipei` 時區）

**前後端語言聯動**：

- 用戶的語言偏好儲存在 `profile.language` 欄位
- **Top Bar 語言切換**：切換介面語言時，自動呼叫 `updateMyProfileDetails` 同步更新 `profile.language`，確保後續寄出的 Email 語言與介面一致
- **登入自動跳轉**：登入成功後查詢 `profile.language`，若與當前 URL locale 不同，自動跳轉到對應語言的 Dashboard
- **Profile Settings**：個人資料設定頁的「偏好語言」欄位與 Top Bar 語言切換完全同步

詳細的 i18n 配置請參考 [後端 i18n 設置指南](I18N_SETUP.md)。

---

## 開發環境

MEAD 專案提供兩種開發環境的 Email 測試方案，您可以根據需求選擇：

### 方案一：Ethereal Email（線上測試）

**Ethereal Email** 是免費的虛擬 SMTP 服務，適合快速測試。

#### 1. 取得測試帳號

訪問 [https://ethereal.email](https://ethereal.email) 並點擊「Create Ethereal Account」自動生成測試帳號。

#### 2. 配置 .env

```env
MAIL_HOST=smtp.ethereal.email
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=your-ethereal-username@ethereal.email
MAIL_PASS=your-ethereal-password
MAIL_FROM=noreply@ethereal.email
MAIL_FROM_NAME=MEAD App (Dev)
```

#### 3. 查看發送的郵件

登入 [https://ethereal.email/login](https://ethereal.email/login) 使用相同的帳號密碼，即可查看所有發送的郵件。

**優點**:

- ✅ 免費無限制
- ✅ 不需要本地服務
- ✅ 可查看完整郵件內容和原始碼
- ✅ 支援附件和 HTML

**限制**:

- ❌ 郵件僅保留 24 小時
- ❌ 需要網路連接
- ❌ 無法發送到真實 Email 地址

---

### 方案二：Mailpit（本地測試）

**Mailpit** 是開源的本地 SMTP 測試工具，提供現代化的 Web UI，適合離線開發和團隊協作。

#### 1. Docker Compose 配置

MEAD 專案已整合 Mailpit 到 Docker Compose。服務配置位於 `docker-compose.yml`：

```yaml
services:
  mailpit:
    image: axllent/mailpit:latest
    container_name: mead-mailpit
    restart: unless-stopped
    ports:
      - '1025:1025' # SMTP 埠
      - '8025:8025' # Web UI 埠
    environment:
      MP_SMTP_AUTH_ACCEPT_ANY: 1
      MP_SMTP_AUTH_ALLOW_INSECURE: 1
    networks:
      - mead-network
```

#### 2. 環境變數配置

在 `apps/backend/.env` 中設定：

```env
MAIL_HOST=mailpit
MAIL_PORT=1025
MAIL_SECURE=false
MAIL_USER=any
MAIL_PASS=any
MAIL_FROM=noreply@localhost
MAIL_FROM_NAME=MEAD App (Dev)
```

#### 3. 啟動服務

使用 MEAD CLI 快速啟動：

```bash
# 啟動所有服務（包含 Mailpit）
./scripts/cli.sh dev

# 或單獨啟動 Mailpit
docker-compose up -d mailpit
```

#### 4. 存取 Web UI

Mailpit 啟動後，開啟瀏覽器訪問：

```text
http://localhost:8025
```

#### 5. 查看郵件

Web UI 提供以下功能：

- **郵件列表**：即時顯示所有接收的郵件
- **搜尋功能**：支援收件人、主旨、內容搜尋
- **附件下載**：直接下載郵件附件
- **HTML 預覽**：完整渲染 HTML 郵件
- **原始碼檢視**：查看郵件原始內容
- **批次刪除**：清空測試郵件

**優點**:

- ✅ 完全離線運行
- ✅ 現代化的 Web UI
- ✅ 支援 REST API
- ✅ 無需註冊帳號
- ✅ 郵件永久保存（直到容器重啟）
- ✅ 支援 WebSocket 即時更新

**限制**:

- ❌ 需要 Docker 環境
- ❌ 佔用本地埠 (1025, 8025)

---

### 開發環境方案比較

| 特性           | Ethereal Email | Mailpit        |
| -------------- | -------------- | -------------- |
| **部署方式**   | 線上服務       | 本地 Docker    |
| **網路要求**   | 需要           | 不需要         |
| **郵件保留**   | 24 小時        | 永久（重啟前） |
| **Web UI**     | 簡單           | 現代化         |
| **設定複雜度** | 低             | 中             |
| **團隊協作**   | 需分享帳號     | 共用本地服務   |
| **推薦場景**   | 快速測試       | 離線開發       |

---

## 郵件發送模式

### SMTP 模式（預設）

傳統 SMTP 協議，適用於開發環境與支援 SMTP 的生產環境。

```env
MAIL_PROVIDER=smtp
```

### Graph API 模式

使用 Microsoft Graph API 透過 OAuth2 Client Credentials Flow 發送郵件，適用於已導入 Microsoft 365 的組織。

```env
MAIL_PROVIDER=graph
```

**前置條件**：

1. 在 Azure AD 註冊應用程式
2. 授予 `Mail.Send` 應用程式權限（非委派權限）
3. 管理員同意（Admin Consent）
4. 設定 `AZURE_AD_TENANT_ID`、`AZURE_AD_CLIENT_ID`、`AZURE_AD_CLIENT_SECRET`

**運作流程**：

1. GraphMailService 使用 Client Credentials 向 Azure AD 取得 Access Token（自動快取）
2. MailService 使用 Handlebars 手動渲染模板為 HTML
3. 透過 `POST https://graph.microsoft.com/v1.0/users/{from}/sendMail` 發送郵件

**注意事項**：

- `MAIL_FROM` 必須是 Microsoft 365 中存在的信箱（共用信箱或授權信箱）
- Token 有效期約 1 小時，到期自動重新取得
- 若未設定 `MAIL_PROVIDER` 或值為空，預設使用 `graph` 模式

---

## 生產環境

### 推薦 SMTP 服務

| 服務           | 免費額度               | 價格          | 特色           |
| -------------- | ---------------------- | ------------- | -------------- |
| **SendGrid**   | 100 封/天              | $19.95/月起   | 穩定、API 豐富 |
| **Mailgun**    | 5,000 封/月            | $15/月起      | 強大的 API     |
| **Amazon SES** | 62,000 封/月（EC2 內） | $0.10/1000 封 | 便宜、可擴展   |
| **Postmark**   | 100 封/月              | $15/月起      | 高送達率       |

### 配置範例（SendGrid）

```env
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_SECURE=true
MAIL_USER=apikey
MAIL_PASS=SG.xxxxxxxxxxxxxxxxxxxxx
MAIL_FROM=noreply@yourdomain.com
MAIL_FROM_NAME=Your App Name
PASSWORD_RESET_EXPIRY=15
PASSWORD_RESET_URL=https://app.yourdomain.com/reset-password
```

### 安全最佳實踐

#### 1. 使用專用 API Key

```bash
# ❌ 不要使用主帳號密碼
MAIL_USER=your-email@gmail.com
MAIL_PASS=your-password

# ✅ 使用 API Key
MAIL_USER=apikey
MAIL_PASS=SG.xxxxxxxxxxxxxx
```

#### 2. 限制 API Key 權限

- 只授予「Mail Send」權限
- 不授予「Mail Settings」、「Billing」等權限

#### 3. 啟用 SPF 和 DKIM

在 DNS 中設置 SPF 記錄：

```text
TXT record: v=spf1 include:sendgrid.net ~all
```

#### 4. 監控發送狀態

```typescript
try {
  await this.mailService.sendPasswordResetEmail(...);
  this.logger.log(`Password reset email sent to ${email}`);
} catch (error) {
  this.logger.error(`Failed to send email: ${error.message}`);
  // 考慮使用備用通知方式（SMS、推送通知）
}
```

---

## 疑難排解

### 問題 1: 郵件無法發送

**症狀**: 報錯 `Error: Invalid login`

**解決方法**:

1. 檢查 SMTP 帳號密碼是否正確
2. 確認 MAIL_HOST 和 MAIL_PORT 正確
3. 檢查防火牆是否阻擋 587 埠

### 問題 2: 郵件進入垃圾郵件

**原因**:

- 缺少 SPF/DKIM 記錄
- 使用共享 IP（送達率低）
- 郵件內容被標記為垃圾

**解決方法**:

1. 設置 SPF 和 DKIM 記錄
2. 使用專用 IP（付費方案）
3. 避免垃圾郵件關鍵字
4. 加入退訂連結

### 問題 3: 開發環境看不到郵件

**檢查清單**:

- ✅ 確認已登入 Ethereal Email
- ✅ 檢查 .env 中的 MAIL_USER 是否與登入帳號一致
- ✅ 確認郵件在 24 小時內發送

### 問題 4: 模板變數未替換

**症狀**: 郵件中顯示 `{{name}}` 而非實際名稱

**解決方法**:

```typescript
// ❌ 錯誤：context 拼寫錯誤
await this.mailerService.sendMail({
  template: 'password-reset',
  contxt: { name: 'John' }, // 錯字！
});

// ✅ 正確
await this.mailerService.sendMail({
  template: 'password-reset',
  context: { name: 'John' },
});
```

### 問題 5: 連接超時

**症狀**: `Error: Connection timeout`

**解決方法**:

1. 檢查網路連接
2. 嘗試使用不同的 MAIL_PORT（25, 465, 587, 2525）
3. 確認 MAIL_SECURE 設置正確（465 使用 true，587 使用 false）

---

## 測試範例

### 單元測試

```typescript
import { Test } from '@nestjs/testing';
import { MailService } from './mail.service';
import { MailerService } from '@nestjs-modules/mailer';

describe('MailService', () => {
  let mailService: MailService;
  let mailerService: MailerService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: MailerService,
          useValue: {
            sendMail: jest.fn(),
          },
        },
      ],
    }).compile();

    mailService = module.get<MailService>(MailService);
    mailerService = module.get<MailerService>(MailerService);
  });

  it('should send password reset email', async () => {
    await mailService.sendPasswordResetEmail(
      'test@example.com',
      'Test User',
      'token123',
      '127.0.0.1',
    );

    expect(mailerService.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'test@example.com',
        subject: '密碼重設請求',
        template: 'password-reset',
      }),
    );
  });
});
```

---

## 相關檔案

### 後端

| 檔案                                                    | 說明                                |
| ------------------------------------------------------- | ----------------------------------- |
| `apps/backend/src/mail/mail.module.ts`                  | 模組定義（SMTP + Graph 雙模式註冊） |
| `apps/backend/src/mail/mail.service.ts`                 | 核心服務（路由 SMTP/Graph、多語系） |
| `apps/backend/src/mail/graph-mail.service.ts`           | Graph API 發送服務（OAuth2 Token）  |
| `apps/backend/src/mail/templates/en/`                   | 英文 Email 模板（9 個）             |
| `apps/backend/src/mail/templates/zh-TW/`                | 繁體中文 Email 模板（9 個）         |
| `apps/backend/src/notification/notification.service.ts` | 系統通知服務 + 多語系文案常數       |

### 模板檔案

| 模板                         | 用途             |
| ---------------------------- | ---------------- |
| `password-reset.hbs`         | 密碼重設連結     |
| `two-factor-code.hbs`        | 2FA 驗證碼       |
| `password-changed.hbs`       | 密碼變更通知     |
| `account-locked.hbs`         | 帳號鎖定通知     |
| `profile-updated.hbs`        | 個人資料更新通知 |
| `session-revoked.hbs`        | 會話撤銷通知     |
| `sessions-batch-revoked.hbs` | 批量會話撤銷通知 |
| `pat-notification.hbs`       | 個人存取權杖通知 |

### 相關文檔

| 文件                                                                   | 說明           |
| ---------------------------------------------------------------------- | -------------- |
| [TWO_FACTOR_AUTH.md](../authentication/TWO_FACTOR_AUTH.md)             | 2FA 驗證碼發送 |
| [REGISTRATION.md](../authentication/REGISTRATION.md)                   | 用戶註冊流程   |
| [ENVIRONMENT_VARIABLES.md](../infrastructure/ENVIRONMENT_VARIABLES.md) | 環境變數管理   |
