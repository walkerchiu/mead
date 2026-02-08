'use client';

import { useMemo, useEffect, useState } from 'react';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { createAppTheme } from './theme';

export function ThemeRegistry({
  children,
  nonce,
}: {
  children: React.ReactNode;
  nonce?: string;
}) {
  // 管理主題模式狀態
  // 初始化時檢查 HTML class 以避免閃爍
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(() => {
    // 在客戶端環境下，從 HTML class 讀取初始主題（由 blocking script 設定）
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark-mode')
        ? 'dark'
        : 'light';
    }
    return 'light';
  });
  const [isClient, setIsClient] = useState(false);

  // 客戶端初始化
  useEffect(() => {
    setIsClient(true);
  }, []);

  // 監聽主題變化
  useEffect(() => {
    if (!isClient) return;

    // 讀取儲存的主題設定
    const updateTheme = () => {
      const savedTheme = localStorage.getItem('theme') || 'system';
      let effectiveMode: 'light' | 'dark' = 'light';

      if (savedTheme === 'system') {
        // 跟隨系統設定
        effectiveMode = window.matchMedia('(prefers-color-scheme: dark)')
          .matches
          ? 'dark'
          : 'light';
      } else {
        effectiveMode = savedTheme as 'light' | 'dark';
      }

      // 同步更新 HTML class (與 blocking script 保持一致)
      if (effectiveMode === 'dark') {
        document.documentElement.classList.add('dark-mode');
      } else {
        document.documentElement.classList.remove('dark-mode');
      }

      setThemeMode(effectiveMode);
    };

    // 初始更新
    updateTheme();

    // 監聽 localStorage 變化（跨頁面同步）
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'theme') {
        updateTheme();
      }
    };

    // 監聽系統主題變化
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleMediaChange = () => {
      const savedTheme = localStorage.getItem('theme') || 'system';
      if (savedTheme === 'system') {
        updateTheme();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    mediaQuery.addEventListener('change', handleMediaChange);

    // 監聽自定義事件（同頁面即時更新）
    const handleThemeChange = () => {
      updateTheme();
    };
    window.addEventListener('theme-change', handleThemeChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      mediaQuery.removeEventListener('change', handleMediaChange);
      window.removeEventListener('theme-change', handleThemeChange);
    };
  }, [isClient]);

  // 根據當前模式創建主題
  const muiTheme = useMemo(() => createAppTheme(themeMode), [themeMode]);

  // 使用 MUI 官方的 Next.js App Router 整合，自動處理 SSR emotion cache 與 CSP nonce
  return (
    <AppRouterCacheProvider options={{ key: 'mui', nonce, prepend: true }}>
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
