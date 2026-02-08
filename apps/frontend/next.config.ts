import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import path from 'path';
import bundleAnalyzer from '@next/bundle-analyzer';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/**
 * Security Headers Configuration
 *
 * 注意：Content-Security-Policy 現在由 middleware.ts 處理（使用 nonce-based 方案）
 * 這樣可以為每個請求生成唯一的 nonce，移除 'unsafe-inline' 和 'unsafe-eval'
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
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  // CSP 現在由 middleware.ts 處理（nonce-based）
];

const nextConfig: NextConfig = {
  // 明確設定 workspace root，避免 lockfile 警告
  turbopack: {
    root: path.resolve(__dirname, '../..'),
  },
  // 禁用開發工具指示器（左上角的 DevTools 按鈕）
  devIndicators: false,
  // 效能優化設定
  compiler: {
    // 移除 console.log (生產環境)
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // 圖片優化
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
  // Webpack 優化
  webpack: (config, { isServer }) => {
    // 優化 bundle 大小
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // Vendor chunk for node_modules
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /node_modules/,
              priority: 20,
            },
            // Common chunk for shared code
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 10,
              reuseExistingChunk: true,
              enforce: true,
            },
            // MUI 單獨打包
            mui: {
              test: /[\\/]node_modules[\\/]@mui[\\/]/,
              name: 'mui',
              chunks: 'all',
              priority: 30,
            },
            // Apollo Client 單獨打包
            apollo: {
              test: /[\\/]node_modules[\\/]@apollo[\\/]/,
              name: 'apollo',
              chunks: 'all',
              priority: 30,
            },
          },
        },
      };
    }
    return config;
  },
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
