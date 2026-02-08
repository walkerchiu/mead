/**
 * useAuthInit - 應用啟動時初始化認證狀態
 *
 * 在應用根元件使用此 hook，負責：
 * 1. 調用 initializeAuth() 使用 refresh token 恢復 session
 * 2. 確保 access token 在頁面重新整理後能自動恢復
 *
 * 注意：Apollo Client 引用已經在 createApolloClient() 中通過
 * setApolloClientRef() 設置，所以這裡不需要再傳入
 */

import { useEffect, useRef } from 'react';
import { initializeAuth } from '@/lib/auth';

export function useAuthInit() {
  const initRef = useRef(false);

  useEffect(() => {
    // 防止重複初始化
    if (initRef.current) {
      console.log('[useAuthInit] Already initialized, skipping');
      return;
    }

    console.log('[useAuthInit] 🚀 Starting authentication initialization...');
    initRef.current = true;

    // 初始化認證狀態（使用 refresh token 恢復 session）
    initializeAuth()
      .then((success) => {
        if (success) {
          console.log(
            '[useAuthInit] ✅ Authentication initialized successfully',
          );
        } else {
          console.log(
            '[useAuthInit] ⚠️  No valid session found (user needs to login)',
          );
        }
      })
      .catch((error) => {
        console.error(
          '[useAuthInit] ❌ Authentication initialization failed:',
          error,
        );
      });
  }, []);
}
