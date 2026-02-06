# 後端 i18n 設置指南 (Backend i18n Setup)

完整的後端國際化實作，支援錯誤訊息、Email 模板和 API 回應多語系。

---

## 📋 目錄

- [後端 i18n 設置指南 (Backend i18n Setup)](#後端-i18n-設置指南-backend-i18n-setup)
  - [📋 目錄](#-目錄)
  - [📖 概述](#-概述)
    - [技術棧](#技術棧)
  - [🔧 I18nModule 配置](#-i18nmodule-配置)
  - [📐 翻譯檔案結構](#-翻譯檔案結構)
    - [範例（`en/auth.json` 節錄）](#範例enauthjson-節錄)
    - [範例（`zh-TW/auth.json` 節錄）](#範例zh-twauthjson-節錄)
  - [🔒 TypeScript 類型安全](#-typescript-類型安全)
    - [類型生成腳本](#類型生成腳本)
    - [執行類型生成](#執行類型生成)
    - [自動生成的類型](#自動生成的類型)
    - [類型安全使用](#類型安全使用)
    - [更新類型工作流程](#更新類型工作流程)
  - [🧪 翻譯完整性測試](#-翻譯完整性測試)
    - [測試內容](#測試內容)
    - [執行測試](#執行測試)
    - [測試失敗範例](#測試失敗範例)
  - [🔍 語言偵測順序](#-語言偵測順序)
  - [📝 I18nLang Decorator](#-i18nlang-decorator)
  - [🔧 Service 中使用 I18nService](#-service-中使用-i18nservice)
  - [📝 Resolver 中傳遞語言參數](#-resolver-中傳遞語言參數)
  - [📧 Email 模板多語系](#-email-模板多語系)
    - [模板結構](#模板結構)
    - [Mail Service 語言選擇](#mail-service-語言選擇)
  - [✨ 新增語言](#-新增語言)
    - [步驟 1：建立翻譯檔案](#步驟-1建立翻譯檔案)
    - [步驟 2：建立 Email 模板](#步驟-2建立-email-模板)
    - [步驟 3：更新 Mail Service](#步驟-3更新-mail-service)
    - [步驟 4：驗證](#步驟-4驗證)
  - [🛠️ CLI 工具支援](#️-cli-工具支援)
    - [翻譯測試與類型生成](#翻譯測試與類型生成)
    - [手動執行命令](#手動執行命令)
  - [📚 相關文檔](#-相關文檔)

---

## 📖 概述

本專案使用 [nestjs-i18n](https://nestjs-i18n.com/) 實現後端國際化，支援錯誤訊息、Email 內容的多語系翻譯。

### 技術棧

- **i18n 框架**: nestjs-i18n
- **支援語言**: English (`en`)、繁體中文 (`zh-TW`)
- **預設語言**: `en`
- **語言偵測**: `x-lang` header → `Accept-Language` header → fallback `en`

---

## 🔧 I18nModule 配置

在 `src/app.module.ts` 中配置 `I18nModule`：

```typescript
import {
  I18nModule,
  AcceptLanguageResolver,
  HeaderResolver,
} from 'nestjs-i18n';
import * as path from 'path';

@Module({
  imports: [
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.join(__dirname, '/i18n/'),
        watch: true,
      },
      resolvers: [new HeaderResolver(['x-lang']), AcceptLanguageResolver],
    }),
  ],
})
export class AppModule {}
```

**重點**：

- `fallbackLanguage: 'en'`：找不到翻譯時回退至英文。
- `watch: true`：開發環境下修改翻譯檔案會自動重新載入。
- `resolvers` 陣列按優先順序排列。

---

## 📐 翻譯檔案結構

```text
apps/backend/src/i18n/
├── en/                           # 英文翻譯
│   ├── auth.json                 # 認證相關訊息
│   ├── validation.json           # 輸入驗證訊息
│   ├── twoFactor.json            # 雙因素認證訊息
│   ├── email.json                # Email 主旨與用途
│   └── common.json               # 通用訊息（權限、禁止等）
├── zh-TW/                        # 繁體中文翻譯
│   ├── auth.json
│   ├── validation.json
│   ├── twoFactor.json
│   ├── email.json
│   └── common.json
├── i18n.types.ts                 # 自動生成的類型定義
└── i18n-completeness.spec.ts     # 翻譯完整性測試
```

### 範例（`en/auth.json` 節錄）

```json
{
  "emailAlreadyRegistered": "Email is already registered",
  "invalidCredentials": "Invalid credentials",
  "userNotFound": "User not found",
  "twoFactorCodeSent": "Verification code has been sent to your email"
}
```

### 範例（`zh-TW/auth.json` 節錄）

```json
{
  "emailAlreadyRegistered": "此 Email 已被註冊",
  "invalidCredentials": "帳號或密碼錯誤",
  "userNotFound": "找不到使用者",
  "twoFactorCodeSent": "驗證碼已發送至您的 Email"
}
```

---

## 🔒 TypeScript 類型安全

本專案使用自動生成的類型定義，提供編譯時的翻譯 key 驗證。

### 類型生成腳本

**位置**: `apps/backend/generate-i18n-types.ts`

此腳本讀取所有 namespace 的翻譯檔案（從 `src/i18n/en/` 目錄），生成完整的 TypeScript 類型定義。

### 執行類型生成

```bash
# 在 backend 目錄
cd apps/backend
pnpm generate-i18n-types

# 或從根目錄
pnpm --filter @starter/backend generate-i18n-types
```

### 自動生成的類型

**檔案**: `src/i18n/i18n.types.ts` (自動生成，請勿手動編輯)

```typescript
// 個別 namespace 介面
export interface AuthTranslations {
  emailAlreadyRegistered: string;
  invalidCredentials: string;
  userNotFound: string;
  // ...
}

export interface ValidationTranslations {
  password: {
    required: string;
    minLength: string;
    maxLength: string;
    // ...
  };
  email: {
    required: string;
    invalid: string;
  };
  // ...
}

// 完整翻譯結構
export interface I18nTranslations {
  auth: AuthTranslations;
  common: CommonTranslations;
  email: EmailTranslations;
  twoFactor: TwoFactorTranslations;
  validation: ValidationTranslations;
}

// 所有可能的翻譯 key（點記法）
export type I18nKey =
  | 'auth.emailAlreadyRegistered'
  | 'auth.invalidCredentials'
  | 'validation.password.required'
  | 'validation.password.minLength';
// ...

// 可用的語言
export type Locale = 'en' | 'zh-TW';
```

### 類型安全使用

```typescript
import { I18nService } from 'nestjs-i18n';
import type { I18nKey } from '@/i18n/i18n.types';

@Injectable()
export class AuthService {
  constructor(private i18n: I18nService) {}

  async register(email: string, lang: string) {
    // ✅ 類型安全：IDE 會自動補全和驗證
    const message = this.i18n.translate<I18nKey>(
      'auth.emailAlreadyRegistered',
      { lang },
    );

    // ❌ 編譯錯誤：key 不存在
    // const invalid = this.i18n.translate('auth.nonExistentKey', { lang });
  }
}
```

### 更新類型工作流程

1. 修改翻譯檔案（例如 `src/i18n/en/auth.json`）
2. 執行 `pnpm generate-i18n-types`
3. 新的 key 立即可用且類型安全
4. IDE 會自動提示新增的翻譯 key

---

## 🧪 翻譯完整性測試

**檔案**: `src/i18n/i18n-completeness.spec.ts`

此測試確保所有語言的翻譯檔案具有相同的 key 結構，防止遺漏翻譯。

### 測試內容

```typescript
describe('I18n Translations Completeness', () => {
  it('should have the same keys in all language files', () => {
    const enFiles = fs.readdirSync(enDir);
    const zhTWFiles = fs.readdirSync(zhTWDir);

    // 確保檔案數量相同
    expect(enFiles.length).toBe(zhTWFiles.length);

    enFiles.forEach((file) => {
      // 確保每個 namespace 都有對應的中文版本
      expect(zhTWFiles).toContain(file);

      const enContent = JSON.parse(fs.readFileSync(path.join(enDir, file)));
      const zhTWContent = JSON.parse(fs.readFileSync(path.join(zhTWDir, file)));

      // 遞迴檢查 key 結構一致性
      compareKeys(enContent, zhTWContent, file);
    });
  });
});
```

### 執行測試

```bash
# 在 backend 目錄
pnpm test src/i18n/i18n-completeness.spec.ts

# 或從根目錄
pnpm --filter @starter/backend test src/i18n/i18n-completeness.spec.ts
```

### 測試失敗範例

```text
❌ FAIL  src/i18n/i18n-completeness.spec.ts
  ● I18n Translations Completeness › should have the same keys in all language files

    Missing key in zh-TW/auth.json: 'twoFactorRequired'
    Extra key in zh-TW/validation.json: 'outdatedKey'
```

當測試失敗時：

1. 檢查提示的 namespace 和 key
2. 補上遺漏的翻譯
3. 移除多餘的 key
4. 重新執行測試確認通過

---

## 🔍 語言偵測順序

| 優先順序 | 來源                     | 說明                            |
| -------- | ------------------------ | ------------------------------- |
| 1        | `x-lang` header          | 自訂 header，前端可明確指定語言 |
| 2        | `Accept-Language` header | 瀏覽器自動發送的語言偏好        |
| 3        | fallback `en`            | 以上都不存在時的預設語言        |

前端呼叫 API 時，可透過 `x-lang` header 指定語言：

```typescript
fetch('/api/users', {
  headers: {
    'x-lang': 'zh-TW',
  },
});
```

---

## 📝 I18nLang Decorator

自訂的 `@I18nLang()` 裝飾器（`src/common/decorators/i18n-lang.decorator.ts`）從 request 中提取語言參數，同時支援 HTTP 和 GraphQL 請求。

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const I18nLang = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    if (ctx.getType().toString() === 'graphql') {
      const gqlCtx = GqlExecutionContext.create(ctx);
      const req = gqlCtx.getContext().req;
      return (
        req?.headers?.['x-lang'] ||
        req?.headers?.['accept-language']?.split(',')[0]?.split('-')[0] ||
        'en'
      );
    }
    const req = ctx.switchToHttp().getRequest();
    return (
      req?.headers?.['x-lang'] ||
      req?.headers?.['accept-language']?.split(',')[0]?.split('-')[0] ||
      'en'
    );
  },
);
```

**重點**：

- 在 GraphQL resolver 中透過 `GqlExecutionContext` 取得 request。
- 在 HTTP controller 中透過 `switchToHttp()` 取得 request。
- 回傳值為語言代碼字串（如 `en`、`zh-TW`）。

---

## 🔧 Service 中使用 I18nService

注入 `I18nService` 並使用 `translate()` 翻譯訊息：

```typescript
import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class AuthService {
  constructor(private readonly i18n: I18nService) {}

  async login(email: string, password: string, ip: string, lang: string) {
    const user = await this.findUser(email);
    if (!user) {
      throw new NotFoundException(
        this.i18n.translate('auth.userNotFound', { lang }),
      );
    }
    // ...
  }
}
```

**`translate()` 參數**：

- 第一個參數：翻譯 key，格式為 `檔案名.key`（例如 `auth.userNotFound`）。
- 第二個參數：選項物件，`lang` 指定翻譯語言。

---

## 📝 Resolver 中傳遞語言參數

在 GraphQL resolver 中使用 `@I18nLang()` 取得語言，並傳遞給 service：

```typescript
import { Resolver, Mutation, Args, Context } from '@nestjs/graphql';
import { I18nLang } from '../common/decorators/i18n-lang.decorator';

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => LoginResult)
  async login(
    @Args('email') email: string,
    @Args('password') password: string,
    @Context() context: { req: { ip: string } },
    @I18nLang() lang: string,
  ): Promise<typeof LoginResult> {
    return this.authService.login(email, password, context.req.ip, lang);
  }

  @Mutation(() => AuthResponse)
  async register(
    @Args('email') email: string,
    @Args('password') password: string,
    @Args('name', { nullable: true }) name: string | undefined,
    @I18nLang() lang: string,
  ): Promise<AuthResponse> {
    return this.authService.registerCustomer(email, password, name, lang);
  }
}
```

---

## 📧 Email 模板多語系

Email 模板按語言分目錄存放，Mail Service 根據 `lang` 參數選擇對應的模板。

### 模板結構

```text
apps/backend/src/mail/templates/
├── en/
│   ├── password-reset.hbs
│   ├── password-changed.hbs
│   └── two-factor-code.hbs
└── zh-TW/
    ├── password-reset.hbs
    ├── password-changed.hbs
    └── two-factor-code.hbs
```

### Mail Service 語言選擇

```typescript
@Injectable()
export class MailService {
  constructor(
    private mailerService: MailerService,
    private i18n: I18nService,
  ) {}

  private getLocale(lang?: string): string {
    const supported = ['en', 'zh-TW'];
    if (lang && supported.includes(lang)) return lang;
    if (lang === 'zh') return 'zh-TW';
    return 'en';
  }

  async sendPasswordResetEmail(
    email: string,
    name: string | null,
    resetToken: string,
    resetUrl: string,
    ipAddress?: string,
    lang?: string,
  ): Promise<void> {
    const locale = this.getLocale(lang);
    await this.mailerService.sendMail({
      to: email,
      subject: this.i18n.translate('email.passwordReset.subject', {
        lang: locale,
      }),
      template: `./${locale}/password-reset`,
      // ...
    });
  }
}
```

**重點**：

- `getLocale()` 方法處理語言回退，包括 `zh` → `zh-TW` 的映射。
- Email 主旨透過 `I18nService` 翻譯。
- 模板路徑使用 `./${locale}/template-name` 格式。

詳細的 Email 配置請參考 [Email 服務配置](EMAIL_CONFIGURATION.md)。

---

## ✨ 新增語言

以新增日文（`ja`）為例：

### 步驟 1：建立翻譯檔案

```bash
mkdir -p apps/backend/src/i18n/ja
cp apps/backend/src/i18n/en/*.json apps/backend/src/i18n/ja/
```

編輯 `ja/` 目錄下的所有 JSON 檔案，翻譯所有 value。

### 步驟 2：建立 Email 模板

```bash
mkdir -p apps/backend/src/mail/templates/ja
cp apps/backend/src/mail/templates/en/*.hbs apps/backend/src/mail/templates/ja/
```

編輯模板內容，翻譯 HTML 文字。

### 步驟 3：更新 Mail Service

在 `getLocale()` 方法中加入 `ja`：

```typescript
private getLocale(lang?: string): string {
  const supported = ['en', 'zh-TW', 'ja'];
  if (lang && supported.includes(lang)) return lang;
  if (lang === 'zh') return 'zh-TW';
  return 'en';
}
```

### 步驟 4：驗證

發送 API 請求時帶入 `x-lang: ja` header，確認回應訊息和 Email 內容使用日文。

```bash
# 測試翻譯
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -H "x-lang: ja" \
  -d '{"query":"{ __typename }"}'

# 執行完整性測試
pnpm --filter @starter/backend test src/i18n/i18n-completeness.spec.ts

# 重新生成類型
pnpm --filter @starter/backend generate-i18n-types
```

---

## 🛠️ CLI 工具支援

### 翻譯測試與類型生成

```bash
# 啟動 Starter CLI
./scripts/cli.sh

# 選擇 14（i18n 多語系管理）
# 可執行：
# 1) 測試翻譯檔案（執行完整性測試）
# 2) 生成類型定義（前後端）
# 3) 查看翻譯統計
```

### 手動執行命令

```bash
# 後端：生成類型
pnpm --filter @starter/backend generate-i18n-types

# 後端：測試翻譯完整性
pnpm --filter @starter/backend test src/i18n/i18n-completeness.spec.ts

# 前端：生成類型
pnpm --filter @starter/frontend generate-i18n-types
```

---

## 📚 相關文檔

- [前端 i18n 設置](../frontend/I18N_SETUP.md) - 前端國際化配置
- [Email 服務配置](EMAIL_CONFIGURATION.md) - SMTP 配置與多語系 Email 模板
- [API 回應格式規範](API_RESPONSE_FORMAT.md) - 錯誤訊息格式
