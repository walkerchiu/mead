# 前端 i18n 設置指南

Next.js 多語系國際化完整設置與使用指南。

> **閱讀導覽**：本文件專注於**前端（Next.js）**的 i18n 實作細節。若需了解整體協作流程、CLI 工具使用或後端實作，請參考：
>
> - [前後端 i18n 協調機制](../getting-started/I18N_COORDINATION.md) — 整合流程、CLI 工具、測試
> - [後端 i18n 設置指南](../backend/I18N_SETUP.md) — NestJS 端實作

---

## 目錄

- [前端 i18n 設置指南](#前端-i18n-設置指南)
  - [目錄](#目錄)
  - [概述](#概述)
    - [技術棧](#技術棧)
  - [檔案結構](#檔案結構)
  - [Routing 配置](#routing-配置)
  - [Request 配置](#request-配置)
  - [Middleware](#middleware)
  - [Layout 架構](#layout-架構)
    - [Root Layout（`app/layout.tsx`）](#root-layoutapplayouttsx)
    - [Locale Layout（`app/[locale]/layout.tsx`）](#locale-layoutapplocalelayouttsx)
    - [Providers（`app/[locale]/providers.tsx`）](#providersapplocaleproviderstsx)
  - [翻譯檔案](#翻譯檔案)
    - [Namespace 設計](#namespace-設計)
    - [範例（`messages/en.json` 節錄）](#範例messagesenjson-節錄)
  - [TypeScript 類型安全](#typescript-類型安全)
    - [類型生成腳本](#類型生成腳本)
    - [執行類型生成](#執行類型生成)
    - [自動生成的類型](#自動生成的類型)
    - [類型安全使用](#類型安全使用)
    - [更新類型工作流程](#更新類型工作流程)
  - [在元件中使用翻譯](#在元件中使用翻譯)
    - [Client Component](#client-component)
    - [Server Component](#server-component)
  - [路由導航](#路由導航)
    - [Link 元件](#link-元件)
    - [useRouter](#userouter)
    - [usePathname](#usepathname)
  - [語言偏好聯動](#語言偏好聯動)
    - [聯動機制](#聯動機制)
    - [相關元件](#相關元件)
  - [Storybook 整合](#storybook-整合)
  - [新增語言](#新增語言)
    - [步驟 1：更新 routing 配置](#步驟-1更新-routing-配置)
    - [步驟 2：建立翻譯檔案](#步驟-2建立翻譯檔案)
    - [步驟 3：驗證](#步驟-3驗證)
    - [步驟 4：生成類型](#步驟-4生成類型)
  - [CLI 工具支援](#cli-工具支援)
  - [相關文檔](#相關文檔)

---

## 概述

本專案使用 [next-intl](https://next-intl.dev/) 實現前端國際化，支援 URL 前綴式路由和 Server/Client Component 翻譯。

### 技術棧

- **i18n 框架**: next-intl
- **支援語言**: English (`en`)、繁體中文 (`zh-TW`)
- **預設語言**: `en`
- **URL 策略**: 所有路徑包含 locale 前綴（`localePrefix: 'always'`）

---

## 檔案結構

```text
apps/frontend/
├── messages/                        # 翻譯檔案
│   ├── en.json                      # 英文翻譯
│   └── zh-TW.json                   # 繁體中文翻譯
├── src/
│   ├── i18n/
│   │   ├── routing.ts               # 路由配置（locales、defaultLocale）
│   │   └── request.ts               # Server-side 訊息載入
│   ├── types/
│   │   └── i18n.types.ts            # 自動生成的類型定義
│   ├── middleware.ts                # Locale 偵測與路由重定向
│   ├── components/
│   │   └── atoms/
│   │       └── LanguageSwitcher/    # 語系切換元件
│   │           ├── LanguageSwitcher.tsx
│   │           ├── LanguageSwitcher.stories.tsx
│   │           └── index.ts
│   └── app/
│       ├── layout.tsx               # Root Layout（<html><body>）
│       └── [locale]/
│           ├── layout.tsx           # Locale Layout（NextIntlClientProvider）
│           ├── providers.tsx        # Client Providers
│           ├── login/page.tsx       # /en/login 或 /zh-TW/login
│           ├── dashboard/page.tsx   # /en/dashboard 或 /zh-TW/dashboard
│           └── ...
├── generate-i18n-types.ts           # 類型生成腳本
└── .storybook/
    └── preview.tsx                  # Storybook i18n 整合
```

---

## Routing 配置

`src/i18n/routing.ts` 定義支援的語言和路由行為。

```typescript
import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['en', 'zh-TW'],
  defaultLocale: 'en',
  localePrefix: 'always',
});

export type Locale = (typeof routing.locales)[number];

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
```

**重點**：

- `localePrefix: 'always'` 表示所有 URL 都包含 locale 前綴，例如 `/en/login`、`/zh-TW/login`。
- `createNavigation` 匯出 locale-aware 的導航工具，應優先使用這些而非 Next.js 原生的 `Link` 和 `useRouter`。

---

## Request 配置

`src/i18n/request.ts` 處理 Server Component 的訊息載入。

```typescript
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }
  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
```

**重點**：

- 透過動態 `import()` 載入對應語言的翻譯檔案，支援 tree-shaking。
- 若 locale 無效，自動回退至 `defaultLocale`。

---

## Middleware

`src/middleware.ts` 負責 locale 偵測和路由重定向。

```typescript
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: ['/((?!api|_next|.*\..*).*)'],
};
```

**行為**：

- 訪問 `/login` 會自動重定向到 `/en/login`（基於瀏覽器語言偵測）。
- 排除 `api`、`_next` 和靜態檔案路徑。

---

## Layout 架構

採用兩層 Layout 設計：

### Root Layout（`app/layout.tsx`）

提供基礎 HTML 結構：

```typescript
import { ReactNode } from 'react';
import './globals.css';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
```

### Locale Layout（`app/[locale]/layout.tsx`）

Server Component，負責載入翻譯訊息並注入 `NextIntlClientProvider`：

```typescript
import { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Providers } from './providers';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <Providers>{children}</Providers>
    </NextIntlClientProvider>
  );
}
```

### Providers（`app/[locale]/providers.tsx`）

Client Component，包裹 Theme、Apollo Client、Snackbar 等 Provider。

---

## 翻譯檔案

翻譯檔案位於 `messages/` 目錄，使用 JSON 格式，以 namespace 分類。

### Namespace 設計

| Namespace    | 用途         | 範例 key                                                     |
| ------------ | ------------ | ------------------------------------------------------------ |
| `common`     | 通用 UI 標籤 | `common.loading`、`common.submit`                            |
| `nav`        | 導航列       | `nav.home`、`nav.dashboard`                                  |
| `auth`       | 認證流程     | `auth.login.title`、`auth.forgotPassword.title`              |
| `validation` | 表單驗證訊息 | `validation.email.required`、`validation.password.minLength` |
| `pages`      | 頁面特定內容 | `pages.home.title`、`pages.dashboard.welcome`                |

### 範例（`messages/en.json` 節錄）

```json
{
  "common": {
    "loading": "Loading...",
    "submit": "Submit",
    "cancel": "Cancel"
  },
  "nav": {
    "home": "Home",
    "dashboard": "Dashboard"
  },
  "auth": {
    "login": {
      "title": "Sign In",
      "emailLabel": "Email",
      "passwordLabel": "Password"
    }
  },
  "validation": {
    "email": {
      "required": "Email is required"
    },
    "password": {
      "minLength": "Password must be at least 8 characters"
    }
  }
}
```

---

## TypeScript 類型安全

本專案使用自動生成的類型定義，提供編譯時的翻譯 key 驗證。

### 類型生成腳本

**位置**: `apps/frontend/generate-i18n-types.ts`

此腳本讀取英文翻譯檔案（`messages/en.json`），生成完整的 TypeScript 類型定義。

### 執行類型生成

```bash
# 在 frontend 目錄
cd apps/frontend
pnpm generate-i18n-types

# 或從根目錄
pnpm --filter @npt/frontend generate-i18n-types
```

### 自動生成的類型

**檔案**: `src/types/i18n.types.ts` (自動生成，請勿手動編輯)

```typescript
/**
 * 完整翻譯訊息結構
 */
export interface Messages {
  common: {
    loading: string;
    submit: string;
    cancel: string;
    // ...
  };
  nav: {
    home: string;
    dashboard: string;
    // ...
  };
  auth: {
    login: {
      title: string;
      emailLabel: string;
      passwordLabel: string;
      // ...
    };
    forgotPassword: {
      title: string;
      // ...
    };
  };
  validation: {
    email: {
      required: string;
      invalid: string;
    };
    password: {
      required: string;
      minLength: string;
      // ...
    };
  };
  pages: {
    home: {
      title: string;
      // ...
    };
  };
}

/**
 * 所有可能的翻譯 key（點記法）
 */
export type TranslationKey =
  | 'common.loading'
  | 'common.submit'
  | 'auth.login.title'
  | 'auth.login.emailLabel'
  | 'validation.email.required'
  | 'validation.password.minLength';
// ...

/**
 * 可用的語言
 */
export type Locale = 'en' | 'zh-TW';
```

### 類型安全使用

```typescript
'use client';

import { useTranslations } from 'next-intl';
import type { TranslationKey } from '@/types/i18n.types';

export function LoginForm() {
  const t = useTranslations('auth.login');
  const tv = useTranslations('validation');

  // ✅ 類型安全：IDE 會自動補全
  const titleText = t('title');  // 推斷為 string
  const emailError = tv('email.required');  // 推斷為 string

  // ❌ 編譯錯誤（如果啟用嚴格模式）
  // const invalid = t('nonExistentKey');

  return (
    <form>
      <h1>{t('title')}</h1>
      <label>{t('emailLabel')}</label>
      <label>{t('passwordLabel')}</label>
    </form>
  );
}
```

### 更新類型工作流程

1. 修改翻譯檔案（`messages/en.json` 或 `messages/zh-TW.json`）
2. 執行 `pnpm generate-i18n-types`
3. 新的 key 立即可用且類型安全
4. IDE 會自動提示新增的翻譯 key

---

## 在元件中使用翻譯

### Client Component

```typescript
'use client';

import { useTranslations } from 'next-intl';

export function LoginForm() {
  const t = useTranslations('auth.login');

  return (
    <form>
      <h1>{t('title')}</h1>
      <label>{t('emailLabel')}</label>
      <label>{t('passwordLabel')}</label>
    </form>
  );
}
```

### Server Component

```typescript
import { useTranslations } from 'next-intl';

export default function HomePage() {
  const t = useTranslations('pages.home');

  return <h1>{t('title')}</h1>;
}
```

---

## 路由導航

使用從 `@/i18n/routing` 匯出的 locale-aware 導航工具，而非 Next.js 原生版本。

### Link 元件

```typescript
import { Link } from '@/i18n/routing';

// 自動加上當前 locale 前綴
<Link href="/dashboard">Dashboard</Link>
// 渲染為 /en/dashboard 或 /zh-TW/dashboard
```

### useRouter

Client component 內呼叫 `router.push/replace/back/forward` 時，請改用 `useNavRouter`（locale-aware + 自動觸發頂部進度條）：

```typescript
'use client';

import { useNavRouter as useRouter } from '@/i18n/use-nav-router';

export function LoginButton() {
  const router = useRouter();

  const handleLogin = () => {
    router.push('/dashboard');
    // 自動導航至 /en/dashboard 或 /zh-TW/dashboard
    // 並在點擊瞬間 fire 頂部 4px 琥珀色進度條
  };
}
```

**為什麼不直接 `from '@/i18n/routing'`**：原 `useRouter` 不會觸發 `@bprogress/next` 的進度條（bprogress 只攔 `<Link>` / anchor click），程式式 `router.push(...)` 會讓使用者點完按鈕後到下一個頁面 mount 完成那段時間沒有任何視覺回饋。`useNavRouter` 是同型別的 wrapper，每次程式式導航前先 `progress.start()`。

**例外**：middleware (`src/proxy.ts`) 與 server component 仍然使用 `from '@/i18n/routing'`（`useNavRouter` 是 `'use client'`，無法在 Edge runtime 載入）。

### usePathname

```typescript
import { usePathname } from '@/i18n/routing';

// 回傳不含 locale 前綴的路徑
const pathname = usePathname(); // "/dashboard" 而非 "/en/dashboard"
```

---

## 語言偏好聯動

前端介面語言與後端 `profile.language` 自動同步，確保 Email 通知語言與介面一致。

### 聯動機制

| 情境                      | 行為                                                                                 |
| ------------------------- | ------------------------------------------------------------------------------------ |
| **Top Bar 切換語言**      | URL locale 變更 + 自動呼叫 `updateMyProfileDetails({ language })` 同步後端           |
| **登入成功**              | 查詢 `me.profile.language`，若與當前 URL locale 不同，自動跳轉到對應語言的 Dashboard |
| **Profile Settings 修改** | 儲存後 `profile.language` 更新，下次登入會以新語言顯示                               |
| **未登入時切換**          | 僅變更 URL locale，不呼叫 API                                                        |

### 相關元件

| 元件                | 檔案                                                             | 說明                                   |
| ------------------- | ---------------------------------------------------------------- | -------------------------------------- |
| LanguageSwitcher    | `src/components/molecules/LanguageSwitcher/LanguageSwitcher.tsx` | Top Bar 語言切換，已登入時同步 profile |
| LoginPage           | `src/app/[locale]/login/page.tsx`                                | 登入後根據 profile.language 跳轉       |
| ProfileSettingsPage | `src/app/[locale]/settings/profile/page.tsx`                     | 偏好語言下拉選單                       |

---

## Storybook 整合

`.storybook/preview.tsx` 中加入 `NextIntlClientProvider`，使 Storybook 中的元件可以正常使用 `useTranslations`。

```typescript
import { NextIntlClientProvider } from 'next-intl';
import enMessages from '../messages/en.json';

const preview: Preview = {
  decorators: [
    (Story) => (
      <NextIntlClientProvider locale="en" messages={enMessages}>
        <Story />
      </NextIntlClientProvider>
    ),
  ],
};
```

**注意**：Storybook 預設使用英文翻譯。如需測試其他語言，可自行調整 `locale` 和 `messages` 參數。

---

## 新增語言

以新增日文（`ja`）為例：

### 步驟 1：更新 routing 配置

```typescript
// src/i18n/routing.ts
export const routing = defineRouting({
  locales: ['en', 'zh-TW', 'ja'],
  defaultLocale: 'en',
  localePrefix: 'always',
});
```

### 步驟 2：建立翻譯檔案

```bash
cp messages/en.json messages/ja.json
```

編輯 `messages/ja.json`，翻譯所有 key。

### 步驟 3：驗證

啟動開發伺服器，訪問 `/ja/login` 確認翻譯正確顯示。

```bash
# 啟動開發伺服器
pnpm --filter @npt/frontend dev

# 訪問
# http://localhost:3000/ja/login
# http://localhost:3000/ja/dashboard
```

### 步驟 4：生成類型

```bash
# 重新生成類型以包含新語言
pnpm --filter @npt/frontend generate-i18n-types
```

---

## CLI 工具支援

> 詳細的 CLI 工具說明（互動式選單、手動命令、類型生成、翻譯統計）集中在 [前後端 i18n 協調機制 — CLI 工具支援](../getting-started/I18N_COORDINATION.md#cli-工具支援)，以避免文件重複。

---

## 相關文檔

- [前後端 i18n 協調機制](../getting-started/I18N_COORDINATION.md) - 整合流程與 CLI 工具
- [後端 i18n 設置](../backend/I18N_SETUP.md) - 後端國際化配置
- [前端認證整合](FRONTEND_INTEGRATION.md) - 認證系統與 i18n 路由
- [組件庫開發指南](COMPONENT_LIBRARY.md) - Storybook 組件開發
