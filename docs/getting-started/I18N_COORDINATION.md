# 前後端 i18n 協調機制

說明前端（next-intl）與後端（nestjs-i18n）如何協調語言設定，包含完整流程、CLI 工具與實現細節。

> **閱讀導覽**：本文件是 i18n 系列的**整合指南與入口**。若需了解單側實作細節，請參考：
>
> - [前端 i18n 設置](../frontend/I18N_SETUP.md) — Next.js（routing、useTranslations、Link）
> - [後端 i18n 設置](../backend/I18N_SETUP.md) — NestJS（I18nModule、Decorator、Email 模板）

---

## 目錄

- [概述](#概述)
- [為什麼前後端分開實現 i18n？](#為什麼前後端分開實現-i18n)
- [完整協調流程](#完整協調流程)
- [關鍵實現細節](#關鍵實現細節)
- [測試語言協調](#測試語言協調)
- [最佳實踐](#最佳實踐)
- [常見問題](#常見問題)
- [相關文檔](#相關文檔)

---

## 概述

本文檔說明前端（next-intl）與後端（nestjs-i18n）如何協調語言設定。

---

## 為什麼前後端分開實現 i18n？

### 職責分離

| 層級     | 使用框架    | 負責範圍                           |
| -------- | ----------- | ---------------------------------- |
| **前端** | next-intl   | UI 介面文字、路由、表單標籤        |
| **後端** | nestjs-i18n | API 錯誤訊息、Email 內容、驗證錯誤 |

### 分離的優勢

1. **獨立部署**：前後端可各自更新翻譯而不影響對方
2. **效能優化**：前端只載入當前語言檔案
3. **職責清晰**：前端處理 UI，後端處理業務邏輯訊息
4. **SEO 友善**：URL 路由包含語言資訊（`/en/...`、`/zh-TW/...`）

---

## 完整協調流程

### 流程圖

```text
┌──────────────────────────────────────────────────────────┐
│ 1. 用戶點擊語系切換                                        │
│    LanguageSwitcher: router.replace(pathname, {locale})  │
└──────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────┐
│ 2. URL 更新：/en/dashboard → /zh-TW/dashboard            │
│    Next.js middleware 驗證語言代碼                        │
└──────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────┐
│ 3. 前端重新渲染                                           │
│    - 載入 messages/zh-TW.json                            │
│    - useTranslations() 自動使用新語言                    │
└──────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────┐
│ 4. 前端發送 API 請求                                      │
│    Apollo Client langLink 從 URL 提取語言：              │
│    headers: { 'x-lang': 'zh-TW' }                        │
└──────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────┐
│ 5. 後端接收請求                                           │
│    @I18nLang() decorator 偵測語言：                      │
│    1. x-lang header (優先) ✅                            │
│    2. Accept-Language (fallback)                         │
│    3. 'en' (預設)                                        │
└──────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────┐
│ 6. 後端返回對應語言的訊息                                  │
│    - API 錯誤：i18n.translate('auth.error', {lang})      │
│    - Email：templates/zh-TW/password-reset.hbs           │
└──────────────────────────────────────────────────────────┘
```

---

## 關鍵實現細節

### 1. 前端：語言存儲在 URL

**檔案**：`apps/frontend/src/i18n/routing.ts`

```typescript
export const routing = defineRouting({
  locales: ['en', 'zh-TW'],
  defaultLocale: 'en',
  localePrefix: 'always', // URL 必須包含語言前綴
});
```

**URL 範例**：

- 英文：`https://example.com/en/dashboard`
- 中文：`https://example.com/zh-TW/dashboard`

**優點**：

- ✅ 可分享（語言已固定）
- ✅ 可書籤（含語言資訊）
- ✅ SEO 友善
- ✅ 不需要 state 管理

### 2. 前端：切換語言

**檔案**：`apps/frontend/src/components/atoms/LanguageSwitcher/LanguageSwitcher.tsx`

```typescript
const handleLanguageChange = (locale: Locale) => {
  if (locale === currentLocale) return;

  startTransition(() => {
    router.replace(pathname, { locale }); // 更新 URL
  });
};
```

**流程**：

1. 用戶點擊語言選單
2. `router.replace()` 更新 URL 路徑
3. Next.js middleware 攔截並驗證
4. 頁面重新渲染，載入新語言的翻譯

### 3. 前端：發送語言資訊給後端

**檔案**：`apps/frontend/src/lib/apollo-client.ts`

```typescript
// 語言 Link：從 URL 路徑提取當前語言
const langLink = setContext((_, { headers }) => {
  if (typeof window === 'undefined') {
    return { headers };
  }

  // 從 URL 提取語言（例如：/zh-TW/dashboard → zh-TW）
  const pathParts = window.location.pathname.split('/');
  const locale = pathParts[1];

  // 驗證是否為有效的語言代碼
  const validLocales = ['en', 'zh-TW'];
  const currentLocale = validLocales.includes(locale) ? locale : 'en';

  return {
    headers: {
      ...headers,
      'x-lang': currentLocale, // 👈 發送給後端
    },
  };
});

// Apollo Client 配置
const client = new ApolloClient({
  link: from([errorLink, langLink, authLink, httpLink]), // 👈 加入 langLink
  cache: new InMemoryCache(),
});
```

**關鍵點**：

- 每次 GraphQL 請求都會自動帶上 `x-lang` header
- 從瀏覽器的 `window.location.pathname` 提取
- 驗證語言代碼有效性

### 4. 後端：接收語言資訊

**檔案**：`apps/backend/src/common/decorators/i18n-lang.decorator.ts`

```typescript
export const I18nLang = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    // 支援 HTTP 和 GraphQL 兩種請求
    if (ctx.getType().toString() === 'graphql') {
      const gqlCtx = GqlExecutionContext.create(ctx);
      const req = gqlCtx.getContext().req;
      return extractLanguage(req);
    }

    const req = ctx.switchToHttp().getRequest();
    return extractLanguage(req);
  },
);

function extractLanguage(req: any): string {
  return (
    req?.headers?.['x-lang'] || // 優先：前端明確指定
    parseAcceptLanguage(req?.headers?.['accept-language']) || // 次要：瀏覽器設定
    'en' // 預設：英文
  );
}
```

**優先順序**：

1. **`x-lang` header** - 前端透過 Apollo Client 發送 ✅ 2. **`Accept-Language` header** - 瀏覽器自動發送（語言設定）
2. **`'en'`** - 預設 fallback

### 5. 後端：在 Resolver 中使用語言

**檔案**：`apps/backend/src/auth/auth.resolver.ts`

```typescript
@Mutation(() => AuthResponse)
async registerCustomer(
  @Args('email') email: string,
  @Args('password') password: string,
  @I18nLang() lang: string,  // 👈 自動注入語言
  @Context() context: { res: Response },
): Promise<AuthResponse> {
  // 將語言傳遞給 service
  return this.authService.registerCustomer(
    email,
    password,
    name,
    lang  // 👈 傳遞給 service
  );
}
```

### 6. 後端：在 Service 中翻譯訊息

**檔案**：`apps/backend/src/auth/auth.service.ts`

```typescript
async registerCustomer(
  email: string,
  password: string,
  name: string | undefined,
  lang: string,  // 👈 接收語言參數
) {
  // 檢查 email 是否已存在
  const existingUser = await this.findUserByEmail(email);
  if (existingUser) {
    throw new ConflictException(
      this.i18n.translate('auth.emailAlreadyRegistered', { lang })  // 👈 使用語言
    );
  }

  // ... 其他邏輯
}
```

### 7. 後端：Email 使用語言

**檔案**：`apps/backend/src/mail/mail.service.ts`

```typescript
async sendPasswordResetEmail(
  email: string,
  name: string | null,
  resetToken: string,
  resetUrl: string,
  lang?: string,  // 👈 接收語言參數
): Promise<void> {
  const locale = this.getLocale(lang);  // 正規化：'zh' → 'zh-TW'

  await this.mailerService.sendMail({
    to: email,
    subject: this.i18n.translate('email.passwordReset.subject', {
      lang: locale,
    }),
    template: `./${locale}/password-reset`,  // 👈 使用對應語言的模板
    context: {
      name: name || email,
      resetUrl,
      // ...
    },
  });
}

private getLocale(lang?: string): string {
  const supported = ['en', 'zh-TW'];
  if (lang && supported.includes(lang)) return lang;
  if (lang === 'zh') return 'zh-TW';  // 映射簡化代碼
  return 'en';  // 預設
}
```

**Email 模板結構**：

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

---

## 測試語言協調

### 1. 前端切換語言

```bash
# 訪問英文頁面
http://localhost:3000/en/dashboard

# 點擊語系切換 → 繁體中文
# URL 變更為：
http://localhost:3000/zh-TW/dashboard
```

### 2. 檢查 API 請求 Header

打開瀏覽器開發者工具 → Network → 選擇 GraphQL 請求：

```http
POST /graphql
Headers:
  x-lang: zh-TW          ← 👍 正確發送
  authorization: Bearer ...
```

### 3. 後端接收語言

在後端 resolver 中 log 語言：

```typescript
@Mutation(() => AuthResponse)
async login(
  @Args('email') email: string,
  @Args('password') password: string,
  @I18nLang() lang: string,
) {
  console.log('Received language:', lang);  // 👈 檢查接收到的語言
  // 應該輸出：Received language: zh-TW
}
```

### 4. 驗證錯誤訊息語言

```typescript
// 測試：故意輸入錯誤密碼
// 前端使用繁體中文時，後端應返回：
{
  "errors": [{
    "message": "帳號或密碼錯誤"  // 👈 繁體中文錯誤訊息
  }]
}
```

---

## 最佳實踐

### 1. 語言代碼一致性

確保前後端使用相同的語言代碼：

```typescript
// 前端
locales: ['en', 'zh-TW'];

// 後端
const supported = ['en', 'zh-TW'];
```

### 2. 提供 fallback

```typescript
// 後端正規化函式
private getLocale(lang?: string): string {
  const supported = ['en', 'zh-TW'];
  if (lang && supported.includes(lang)) return lang;
  if (lang === 'zh') return 'zh-TW';  // 映射變體
  return 'en';  // 預設
}
```

### 3. 驗證語言代碼

```typescript
// Apollo Client langLink 中驗證
const validLocales = ['en', 'zh-TW'];
const currentLocale = validLocales.includes(locale) ? locale : 'en';
```

### 4. 測試所有語言

```bash
# 測試註冊功能（英文）
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -H "x-lang: en" \
  -d '{"query":"mutation { register(...) }"}'

# 測試註冊功能（中文）
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -H "x-lang: zh-TW" \
  -d '{"query":"mutation { register(...) }"}'
```

---

## 常見問題

### Q1: 為什麼切換語言後錯誤訊息沒有更新？

**原因**：Apollo Client 可能快取了之前的錯誤

**解決**：

```typescript
// 在 createApolloClient 中設定
defaultOptions: {
  watchQuery: {
    fetchPolicy: 'cache-and-network',  // 👈 確保每次都發送請求
  },
}
```

### Q2: 後端收到的語言總是 'en'？

**檢查**：

1. 確認 Apollo Client 的 `langLink` 已加入 `from([...])` 陣列
2. 確認順序正確：`from([errorLink, langLink, authLink, httpLink])`
3. 檢查瀏覽器開發者工具中的請求 header 是否包含 `x-lang`

### Q3: Email 模板找不到？

**檢查**：

1. 模板檔案路徑：`apps/backend/src/mail/templates/{locale}/template-name.hbs`
2. 語言代碼大小寫：`zh-TW`（不是 `zh-tw` 或 `ZH-TW`）
3. 模板名稱：確認 `.hbs` 副檔名

---

## CLI 工具支援

前後端共用同一套 i18n CLI 工具，可執行翻譯完整性測試、類型生成、翻譯統計等。

### 互動式 CLI

```bash
# 啟動 NPT CLI
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
pnpm --filter @npt/backend generate-i18n-types

# 後端：測試翻譯完整性
pnpm --filter @npt/backend test src/i18n/i18n-completeness.spec.ts

# 前端：生成類型
pnpm --filter @npt/frontend generate-i18n-types

# 全專案類型檢查
pnpm type-check
```

---

## 相關文檔

- [前端 i18n 設置](../frontend/I18N_SETUP.md) — Next.js 端實作細節
- [後端 i18n 設置](../backend/I18N_SETUP.md) — NestJS 端實作細節
- [Apollo Client 配置](../frontend/FRONTEND_INTEGRATION.md)
