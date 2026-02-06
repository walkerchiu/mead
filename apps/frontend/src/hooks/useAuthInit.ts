'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { initializeAuth } from '@/lib/auth';

// 公開頁面路徑（不需要認證初始化）
const PUBLIC_PATHS = [
  '/', // 首頁
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
];

/**
 * 認證初始化 Hook
 * 在 App 啟動時自動嘗試恢復 session 並啟動自動刷新機制
 *
 * ⚠️ 注意：公開頁面（如登入頁）會跳過初始化，避免不必要的錯誤訊息
 */
export const useAuthInit = () => {
  const pathname = usePathname();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // 檢查是否為公開頁面
    // 移除 locale 前綴後再檢查
    const pathWithoutLocale = pathname?.replace(/^\/(en|zh-TW)/, '') || '/';
    const isPublicPage = PUBLIC_PATHS.some(
      (path) =>
        pathWithoutLocale === path || pathWithoutLocale.startsWith(path + '/'),
    );

    if (isPublicPage) {
      // 公開頁面不需要初始化認證
      setIsInitialized(true);
      setIsAuthenticated(false);
      return;
    }

    let isMounted = true;

    const initialize = async () => {
      try {
        console.log('[useAuthInit] Initializing auth...');
        const success = await initializeAuth();

        if (isMounted) {
          setIsAuthenticated(success);
          setIsInitialized(true);
        }
      } catch (error) {
        console.error('[useAuthInit] Initialization error:', error);
        if (isMounted) {
          setIsAuthenticated(false);
          setIsInitialized(true);
        }
      }
    };

    initialize();

    return () => {
      isMounted = false;
    };
    // ✅ 移除 pathname 依賴，只在組件掛載時初始化一次
    // initializeAuth 內部的 idempotency 機制會確保不重複初始化
    // eslint-disable-next-line
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    isInitialized,
    isAuthenticated,
  };
};
