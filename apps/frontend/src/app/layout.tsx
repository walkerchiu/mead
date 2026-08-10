import { ReactNode } from 'react';
import { getLocale, getTranslations } from 'next-intl/server';
import { ClientErrorBoundary } from '@/components/errors';
import { headers } from 'next/headers';
// 自帶字體（@fontsource，從 npm 取得、隨映像打包）：Docker build 不向 fonts.gstatic.com
// 抓取字體子集，避免在受限網路 / 模擬建置下因 gstatic 連線失敗導致 build 中斷。
// 字族名（Inter / Roboto / Roboto Mono / Noto Sans TC）對應 globals.css 與 theme
// typography 的 --font-* 變數。權重 300 / 400 / 500 / 700。300（Light）供 SPOSAD
// 入口網第一屏的裝飾性文字使用（較細一級）。
import '@fontsource/inter/300.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/700.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import '@fontsource/roboto-mono/400.css';
import '@fontsource/roboto-mono/500.css';
import '@fontsource/roboto-mono/700.css';
import '@fontsource/noto-sans-tc/300.css';
import '@fontsource/noto-sans-tc/400.css';
import '@fontsource/noto-sans-tc/500.css';
import '@fontsource/noto-sans-tc/700.css';
import './globals.css';

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  // 注意：nonce 不應該應用到 <html> 標籤
  // nonce 會通過 [locale]/layout.tsx 傳遞給 Providers 和 Emotion cache
  // CSP header 已在 proxy.ts 中設置

  // 讀取 nonce 用於 blocking script
  const headersList = await headers();
  const nonce = headersList.get('x-nonce') || undefined;

  // 依當前語系設定 <html lang>（無障礙必要屬性 / 政府網站規範）
  let locale = 'zh-TW';
  let skipToContent = '跳至主要內容';
  try {
    locale = await getLocale();
    const t = await getTranslations('a11y');
    skipToContent = t('skipToContent');
  } catch {
    /* fallback outside locale routes — 使用 zh-TW 預設字串 */
  }

  return (
    <html lang={locale}>
      <head>
        {/*
          Blocking script to prevent theme flashing (FOUC)
          This script runs BEFORE the page renders, ensuring the correct theme is applied immediately.
          It reads from localStorage and applies the theme class to <html> element.
        */}
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: `
(function() {
  try {
    var theme = localStorage.getItem('theme') || 'system';
    var effectiveMode = 'light';

    if (theme === 'system') {
      effectiveMode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else {
      effectiveMode = theme;
    }

    // Apply theme class to html element immediately
    if (effectiveMode === 'dark') {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
  } catch (e) {
    // Fallback to light mode if localStorage is unavailable
  }
})();
            `,
          }}
        />
      </head>
      <body>
        {/* 跳至主要內容 — 鍵盤使用者的無障礙快捷（focus 時才顯示） */}
        <a href="#main-content" className="skip-link">
          {skipToContent}
        </a>
        {/*
          全站路由 progress bar 由 @bprogress/next 的 ProgressProvider 處理
          （掛在 [locale]/providers.tsx）— bprogress 在 anchor click 的 capture
          階段就觸發 bar，使用者按下後幾乎是立即看到。
        */}
        <ClientErrorBoundary>{children}</ClientErrorBoundary>
      </body>
    </html>
  );
}
