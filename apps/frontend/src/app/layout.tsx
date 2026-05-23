import { ReactNode } from 'react';
import { Noto_Sans_TC, Roboto, Roboto_Mono } from 'next/font/google';
import { getLocale, getTranslations } from 'next-intl/server';
import { GlobalLoadingProgress } from '@/components/atoms/GlobalLoadingProgress';
import { ClientErrorBoundary } from '@/components/errors';
import { headers } from 'next/headers';
import './globals.css';

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
  variable: '--font-roboto',
});

const notoSansTc = Noto_Sans_TC({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
  variable: '--font-noto-sans-tc',
});

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
  variable: '--font-roboto-mono',
});

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
    <html
      lang={locale}
      className={`${roboto.variable} ${notoSansTc.variable} ${robotoMono.variable}`}
    >
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
          階段就觸發 bar，比 nextjs-toploader 的 router event 觸發早 50~250ms。

          這裡只保留 Apollo in-flight progress：訂閱 GraphQL operation 計數
          而不是 router events，覆蓋路由切完之後資料還在抓的時間。
          兩者視覺一致（4px navy + glow），任一在跑都看到同款 bar。
        */}
        <GlobalLoadingProgress />
        <ClientErrorBoundary>{children}</ClientErrorBoundary>
      </body>
    </html>
  );
}
