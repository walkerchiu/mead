import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import path from 'path';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const securityHeaders = [
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      // ⚠️ Next.js 需要 'unsafe-inline' 和 'unsafe-eval' 才能正常運作
      // 包括：hydration、動態導入、React 等核心功能
      // 要實現更嚴格的 CSP，需使用 nonce-based 方案（複雜度高）
      // 參考：https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      // 允許連接到後端 API 和 WebSocket
      "connect-src 'self' " +
        (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000') +
        ' ' +
        (process.env.NEXT_PUBLIC_GRAPHQL_WS_ENDPOINT ||
          'ws://localhost:4000/graphql') +
        (process.env.NODE_ENV === 'development' ? ' webpack://*' : ''),
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
    ].join('; '),
  },
];

const nextConfig: NextConfig = {
  // 明確設定 workspace root，避免 lockfile 警告
  turbopack: {
    root: path.resolve(__dirname, '../..'),
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
