import createMiddleware from 'next-intl/middleware';
import type { NextRequest } from 'next/server';
import { routing } from './i18n/routing';

/**
 * CSP Nonce Proxy Middleware
 *
 * 結合 next-intl 路由處理和 CSP nonce 生成。
 * 為每個請求生成唯一的 nonce 值，用於 Content Security Policy。
 * 這允許我們移除 'unsafe-inline' 和 'unsafe-eval'，提高安全性。
 *
 * 工作流程：
 * 1. 先執行 next-intl 的路由處理
 * 2. 為每個請求生成隨機 nonce
 * 3. 將 nonce 添加到 request headers（供 layout 使用）
 * 4. 將 nonce 注入到 CSP headers 中
 *
 * 參考：https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy
 */

const intlMiddleware = createMiddleware(routing);

/**
 * 生成隨機 nonce 使用 Web Crypto API
 * Edge Runtime 不支援 Node.js crypto 模組，所以使用 Web Crypto API
 */
function generateNonce(): string {
  const array = crypto.getRandomValues(new Uint8Array(16));
  // 使用 btoa 進行 base64 編碼（Web API）
  // 逐個字節轉換避免展開運算符可能的問題
  let binary = '';
  for (let i = 0; i < array.length; i++) {
    binary += String.fromCharCode(array[i]);
  }
  return btoa(binary);
}

export default function middleware(request: NextRequest) {
  // 生成隨機 nonce
  const nonce = generateNonce();

  // ✅ 把 nonce 注入到 *request* headers，供 server components（layout.tsx 等）
  //    透過 next/headers 的 headers() 讀取。
  request.headers.set('x-nonce', nonce);

  // 執行 next-intl 路由處理（讀取 request 並產生 NextResponse）
  const response = intlMiddleware(request);

  const isDevelopment = process.env.NODE_ENV === 'development';

  // 構建 CSP policy
  const cspHeader = [
    "default-src 'self'",
    // 開發環境：Next.js dev mode 的 React Refresh / HMR 需要 'unsafe-eval'
    isDevelopment
      ? `script-src 'self' 'nonce-${nonce}' 'unsafe-eval' 'strict-dynamic'`
      : `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    // 開發環境：Vite/HMR/bprogress 等動態注入 inline style；生產用 nonce
    isDevelopment
      ? `style-src 'self' 'unsafe-inline'`
      : `style-src 'self' 'nonce-${nonce}'`,
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    // 純展示入口網讀同源靜態資料，無外部 API；connect-src 僅需 'self'。
    "connect-src 'self'",
    "media-src 'self'",
    "frame-src 'self' blob:",
    "worker-src 'self' blob:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    ...(isDevelopment ? [] : ['upgrade-insecure-requests']),
  ]
    .join('; ')
    .replace(/\s{2,}/g, ' ')
    .trim();

  response.headers.set('x-nonce', nonce);
  response.headers.set('Content-Security-Policy', cspHeader);

  return response;
}

export const config = {
  matcher: [
    /*
     * 匹配所有路徑，除了：
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    {
      source:
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|json|ico)$).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
