# Email 服務配置指南 (Email Configuration)

完整的 Email 服務設定，支援 SMTP 和多語系模板，可用於密碼重設和通知發送。

---

## 📋 目錄

- [Email 服務配置指南 (Email Configuration)](#email-服務配置指南-email-configuration)
  - [📋 目錄](#-目錄)
  - [📖 概述](#-概述)
    - [技術棧](#技術棧)
    - [檔案結構](#檔案結構)
  - [🚀 快速開始](#-快速開始)
    - [1. 安裝依賴](#1-安裝依賴)
    - [2. 環境變數配置](#2-環境變數配置)
    - [3. 啟動服務](#3-啟動服務)
    - [4. 測試 Email](#4-測試-email)
  - [🔧 配置說明](#-配置說明)
    - [環境變數](#環境變數)
    - [Mail Module 配置](#mail-module-配置)
  - [📝 Email 模板](#-email-模板)
    - [1. 密碼重設 (password-reset.hbs)](#1-密碼重設-password-resethbs)
    - [2. 雙因素驗證碼 (two-factor-code.hbs)](#2-雙因素驗證碼-two-factor-codehbs)
    - [3. 密碼變更通知 (password-changed.hbs)](#3-密碼變更通知-password-changedhbs)
  - [✨ 支援功能](#-支援功能)
    - [Mail Service API](#mail-service-api)
      - [1. sendPasswordResetEmail()](#1-sendpasswordresetemail)
      - [2. sendTwoFactorCode()](#2-sendtwofactorcode)
      - [3. sendPasswordChangedEmail()](#3-sendpasswordchangedemail)
    - [多語系 Email](#多語系-email)
  - [🔧 開發環境](#-開發環境)
    - [Ethereal Email 設置](#ethereal-email-設置)
      - [1. 取得測試帳號](#1-取得測試帳號)
      - [2. 配置 .env](#2-配置-env)
      - [3. 查看發送的郵件](#3-查看發送的郵件)
  - [🚀 生產環境](#-生產環境)
    - [推薦 SMTP 服務](#推薦-smtp-服務)
    - [配置範例（SendGrid）](#配置範例sendgrid)
    - [安全最佳實踐](#安全最佳實踐)
      - [1. 使用專用 API Key](#1-使用專用-api-key)
      - [2. 限制 API Key 權限](#2-限制-api-key-權限)
      - [3. 啟用 SPF 和 DKIM](#3-啟用-spf-和-dkim)
      - [4. 監控發送狀態](#4-監控發送狀態)
  - [🚨 疑難排解](#-疑難排解)
    - [問題 1: 郵件無法發送](#問題-1-郵件無法發送)
    - [問題 2: 郵件進入垃圾郵件](#問題-2-郵件進入垃圾郵件)
    - [問題 3: 開發環境看不到郵件](#問題-3-開發環境看不到郵件)
    - [問題 4: 模板變數未替換](#問題-4-模板變數未替換)
    - [問題 5: 連接超時](#問題-5-連接超時)
  - [🧪 測試範例](#-測試範例)
    - [單元測試](#單元測試)
  - [📚 相關文檔](#-相關文檔)

---

## 📖 概述

Starter 專案使用 `@nestjs-modules/mailer` 作為 Email 服務，支援 SMTP 協議和 Handlebars 模板引擎。

### 技術棧

- **框架**: @nestjs-modules/mailer
- **模板引擎**: Handlebars (.hbs)
- **傳輸協議**: SMTP
- **開發測試**: Ethereal Email (虛擬 SMTP)

### 檔案結構

```text
apps/backend/src/mail/
├── mail.service.ts              # Email 服務核心（含多語系支援）
├── mail.module.ts               # NestJS 模組配置
└── templates/                   # Email 模板目錄（按語言分類）
    ├── en/                      # 英文模板
    │   ├── password-reset.hbs
    │   ├── two-factor-code.hbs
    │   └── password-changed.hbs
    └── zh-TW/                   # 繁體中文模板
        ├── password-reset.hbs
        ├── two-factor-code.hbs
        └── password-changed.hbs
```

---

## 🚀 快速開始

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
cp apps/backend/.env.production.example apps/backend/.env.production
```

### 3. 啟動服務

```bash
# 使用 Starter CLI
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

## 🔧 配置說明

### 環境變數

| 變數                    | 說明                   | 開發環境                             | 生產環境                               |
| ----------------------- | ---------------------- | ------------------------------------ | -------------------------------------- |
| `MAIL_HOST`             | SMTP 伺服器            | smtp.ethereal.email                  | smtp.example.com                       |
| `MAIL_PORT`             | SMTP 埠號              | 587                                  | 587                                    |
| `MAIL_SECURE`           | 是否使用 TLS           | false                                | true                                   |
| `MAIL_USER`             | SMTP 帳號              | (Ethereal 帳號)                      | (真實帳號)                             |
| `MAIL_PASS`             | SMTP 密碼              | (Ethereal 密碼)                      | (真實密碼)                             |
| `MAIL_FROM`             | 寄件者 Email           | noreply@ethereal.email               | noreply@example.com                    |
| `MAIL_FROM_NAME`        | 寄件者名稱             | Starter App                          | Your App Name                          |
| `PASSWORD_RESET_EXPIRY` | 密碼重設有效期（分鐘） | 30                                   | 15                                     |
| `PASSWORD_RESET_URL`    | 密碼重設頁面 URL       | http://localhost:3000/reset-password | https://app.example.com/reset-password |

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

## 📝 Email 模板

### 1. 密碼重設 (password-reset.hbs)

**用途**: 使用者忘記密碼時發送重設連結

**模板變數**:

- `name`: 使用者名稱
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

- `name`: 使用者名稱
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

- `name`: 使用者名稱
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

## ✨ 支援功能

### Mail Service API

`/src/mail/mail.service.ts`

#### 1. sendPasswordResetEmail()

```typescript
async sendPasswordResetEmail(
  email: string,
  name: string | null,
  resetToken: string,
  resetUrl: string,
  ipAddress?: string,
  lang?: string,
): Promise<void> {
  const locale = this.getLocale(lang);
  const url = `${resetUrl}?token=${resetToken}`;

  await this.mailerService.sendMail({
    to: email,
    subject: this.i18n.translate('email.passwordReset.subject', {
      lang: locale,
    }),
    template: `./${locale}/password-reset`,
    context: {
      name: name || email,
      url,
      ipAddress: ipAddress || this.i18n.translate('common.unknown', { lang: locale }),
      expiresIn: locale === 'zh-TW' ? '30 分鐘' : '30 minutes',
      timestamp: new Date().toLocaleString(
        locale === 'zh-TW' ? 'zh-TW' : 'en-US',
        { timeZone: locale === 'zh-TW' ? 'Asia/Taipei' : 'UTC' },
      ),
    },
  });
}
```

**使用範例**:

```typescript
await this.mailService.sendPasswordResetEmail(
  'user@example.com',
  '張三',
  'reset-token-123',
  'http://localhost:3000/reset-password',
  '192.168.1.1',
  'zh-TW',
);
```

#### 2. sendTwoFactorCode()

```typescript
async sendTwoFactorCode(
  email: string,
  name: string,
  code: string,
  expiryMinutes: number,
  purpose: string,
  ipAddress?: string,
  lang?: string,
): Promise<void> {
  const locale = this.getLocale(lang);

  const subjectKey =
    {
      LOGIN: 'email.twoFactorCode.login',
      ENABLE: 'email.twoFactorCode.enable',
      DISABLE: 'email.twoFactorCode.disable',
    }[purpose] || 'email.twoFactorCode.default';

  await this.mailerService.sendMail({
    to: email,
    subject: this.i18n.translate(subjectKey, { lang: locale }),
    template: `./${locale}/two-factor-code`,
    context: {
      name,
      code,
      expiryMinutes,
      purpose,
      ipAddress: ipAddress || this.i18n.translate('common.unknown', { lang: locale }),
      timestamp: new Date().toLocaleString(
        locale === 'zh-TW' ? 'zh-TW' : 'en-US',
        { timeZone: locale === 'zh-TW' ? 'Asia/Taipei' : 'UTC' },
      ),
    },
  });
}
```

**使用範例**:

```typescript
await this.mailService.sendTwoFactorCode(
  'user@example.com',
  '張三',
  '123456',
  10,
  'LOGIN',
  '192.168.1.1',
  'zh-TW',
);
```

#### 3. sendPasswordChangedEmail()

```typescript
async sendPasswordChangedEmail(
  email: string,
  name: string | null,
  ipAddress?: string,
  lang?: string,
): Promise<void> {
  const locale = this.getLocale(lang);

  await this.mailerService.sendMail({
    to: email,
    subject: this.i18n.translate('email.passwordChanged.subject', {
      lang: locale,
    }),
    template: `./${locale}/password-changed`,
    context: {
      name: name || email,
      ipAddress: ipAddress || this.i18n.translate('common.unknown', { lang: locale }),
      timestamp: new Date().toLocaleString(
        locale === 'zh-TW' ? 'zh-TW' : 'en-US',
        { timeZone: locale === 'zh-TW' ? 'Asia/Taipei' : 'UTC' },
      ),
    },
  });
}
```

**使用範例**:

```typescript
await this.mailService.sendPasswordChangedEmail(
  'user@example.com',
  '張三',
  '192.168.1.1',
  'zh-TW',
);
```

### 多語系 Email

Mail Service 支援根據使用者語言偏好發送對應語言的 Email。

**語言選擇邏輯**：

- 所有 send 方法都接受可選的 `lang` 參數。
- 使用 `getLocale()` 方法驗證並回退語言：支援 `en`、`zh-TW`，`zh` 自動映射為 `zh-TW`，其餘回退至 `en`。
- Email 主旨透過 `I18nService` 翻譯，模板路徑使用 `./${locale}/template-name` 格式。
- 時間戳格式和時區根據語言自動調整（`zh-TW` 使用 `Asia/Taipei` 時區）。

詳細的 i18n 配置請參考 [後端 i18n 設置指南](I18N_SETUP.md)。

---

## 🔧 開發環境

### Ethereal Email 設置

**Ethereal Email** 是免費的虛擬 SMTP 服務，用於開發測試。

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
MAIL_FROM_NAME=Starter App (Dev)
```

#### 3. 查看發送的郵件

登入 [https://ethereal.email/login](https://ethereal.email/login) 使用相同的帳號密碼，即可查看所有發送的郵件。

**優點**:

- ✅ 免費無限制
- ✅ 不需要真實 SMTP 伺服器
- ✅ 可查看完整郵件內容和原始碼
- ✅ 支援附件和 HTML

**限制**:

- ❌ 郵件僅保留 24 小時
- ❌ 無法發送到真實 Email 地址

---

## 🚀 生產環境

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

## 🚨 疑難排解

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

## 🧪 測試範例

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

## 📚 相關文檔

- [TWO_FACTOR_AUTH.md](../authentication/TWO_FACTOR_AUTH.md) - 2FA 驗證碼發送
- [REGISTRATION.md](../authentication/REGISTRATION.md) - 使用者註冊流程
- [ENVIRONMENT_VARIABLES.md](../infrastructure/ENVIRONMENT_VARIABLES.md) - 環境變數管理
