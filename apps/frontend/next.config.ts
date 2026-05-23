import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import path from 'path';
import bundleAnalyzer from '@next/bundle-analyzer';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Security Headers Configuration
 *
 * 注意：Content-Security-Policy 由 proxy.ts（middleware）處理（nonce-based），
 * 為每個請求生成唯一 nonce，移除 'unsafe-inline' / 'unsafe-eval'。
 */
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
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  // HSTS 僅於正式環境輸出（避免在本機 http://localhost 被瀏覽器強制升級 https）。
  // 不含 `preload` —— preload 一旦被瀏覽器收錄幾乎不可逆，待上線穩定後再視需要加。
  ...(isProduction
    ? [
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=63072000; includeSubDomains',
        },
      ]
    : []),
  // CSP 由 proxy.ts（middleware）處理（nonce-based）
];

const nextConfig: NextConfig = {
  // 自架部署：產出獨立執行檔（含追蹤過的最小 node_modules），供 Docker 使用
  output: 'standalone',
  // monorepo：standalone 追蹤需以 workspace root 為基準
  outputFileTracingRoot: path.resolve(__dirname, '../..'),
  // 明確設定 workspace root，避免 lockfile 警告
  turbopack: {
    root: path.resolve(__dirname, '../..'),
  },
  // 移除回應的 X-Powered-By: Next.js 標頭（避免洩漏框架資訊）
  poweredByHeader: false,
  // 開發期額外檢查（重複 render 找出副作用問題）；不影響正式環境
  reactStrictMode: true,
  // 禁用開發工具指示器（左上角的 DevTools 按鈕）
  devIndicators: false,
  // 效能優化設定
  compiler: {
    // 移除 console.log (生產環境)
    removeConsole: isProduction,
  },
  // 圖片優化
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // 入口網圖片幾乎不變動，拉長最佳化快取（1 天）減少重複轉檔
    minimumCacheTTL: 86400,
  },
  // 註：本專案以 Turbopack 建置（Next.js 16 預設），自訂 webpack 的 splitChunks
  // 在 Turbopack 下不會生效（且會觸發警告），故移除；Turbopack 已內建 chunk 切分最佳化。
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/:locale(en|zh-TW)/admin/:path*',
        destination: '/:locale/hq/:path*',
        permanent: true, // 308 永久重定向
      },
    ];
  },
};

export default withBundleAnalyzer(withNextIntl(nextConfig));
