/**
 * Token 管理和認證輔助函數
 *
 * Access Token 儲存在記憶體中，避免 XSS 攻擊透過 localStorage 竊取。
 * Refresh Token 透過 HttpOnly Cookie 傳遞，前端無法直接存取。
 * 頁面重新整理後 access token 會遺失，需透過 refresh token cookie 重新取得。
 */

import { REFRESH_TOKEN_MUTATION } from './graphql';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ApolloClientType = any;

// 記憶體儲存（不暴露給 XSS）
let accessToken: string | null = null;

// Apollo Client 實例引用（由 apollo-client.ts 設定）
let apolloClientRef: ApolloClientType | null = null;

// 自動刷新計時器
let refreshTimer: NodeJS.Timeout | null = null;

// ✅ 防止並發刷新的 Promise
let refreshPromise: Promise<boolean> | null = null;

// ✅ 防止重複初始化的標誌（存儲在 window 上以避免模塊重新載入時丟失）
// 擴展 Window 介面以包含 __authInitialized 屬性
declare global {
  interface Window {
    __authInitialized?: boolean;
  }
}

const getIsInitialized = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!window.__authInitialized;
};

const setIsInitialized = (value: boolean): void => {
  if (typeof window !== 'undefined') {
    window.__authInitialized = value;
  }
};

/**
 * 設定 Apollo Client 引用（避免循環依賴）
 */
export const setApolloClientRef = (client: ApolloClientType): void => {
  apolloClientRef = client;
};

/**
 * 儲存 access token（內部使用，不設置自動刷新）
 */
const setAccessToken = (token: string): void => {
  accessToken = token;
};

/**
 * 儲存 access token 並啟動自動刷新
 */
export const setAuthTokens = (tokens: { accessToken: string }): void => {
  setAccessToken(tokens.accessToken);
  scheduleTokenRefresh(tokens.accessToken);
};

/**
 * 取得 Access Token
 */
export const getAccessToken = (): string | null => {
  return accessToken;
};

/**
 * 清除 access token
 */
export const clearAuthTokens = (): void => {
  accessToken = null;
  refreshPromise = null; // ✅ 清除刷新 Promise
  setIsInitialized(false); // ✅ 重置初始化標誌，允許重新初始化
  cancelTokenRefresh();
};

/**
 * 檢查使用者是否已登入
 */
export const isAuthenticated = (): boolean => {
  return !!getAccessToken();
};

/**
 * 透過 HttpOnly Cookie 中的 refresh token 重新取得 access token
 * 返回是否刷新成功
 *
 * ✅ 防止並發刷新：如果已有刷新正在進行，返回現有的 Promise
 *
 * @param source - 調用來源（用於調試追蹤）
 */
export const refreshAccessToken = async (
  source: string = 'unknown',
): Promise<boolean> => {
  // ✅ 如果已有刷新正在進行，返回現有的 Promise
  if (refreshPromise) {
    console.log(
      `[Auth] Token refresh already in progress, waiting... (source: ${source})`,
    );
    return refreshPromise;
  }

  if (!apolloClientRef) {
    console.error('[Auth] Apollo Client not initialized yet');
    return false;
  }

  // ✅ 創建新的刷新 Promise
  refreshPromise = (async () => {
    try {
      console.log(`[Auth] 🔄 Starting token refresh (source: ${source})...`);
      const result = await apolloClientRef!.mutate({
        mutation: REFRESH_TOKEN_MUTATION,
        fetchPolicy: 'no-cache',
      });

      const data = result.data?.refreshToken;
      if (data?.accessToken) {
        setAccessToken(data.accessToken);
        scheduleTokenRefresh(data.accessToken);
        console.log(`[Auth] ✅ Token refresh successful (source: ${source})`);
        return true;
      }

      console.error('[Auth] No access token in refresh response');
      return false;
    } catch (error: unknown) {
      // 只記錄非預期的錯誤，忽略 "refresh token not found" 錯誤
      const errorMessage = error instanceof Error ? error.message : '';
      if (
        !errorMessage.includes('Refresh token not found') &&
        !errorMessage.includes('Invalid refresh token')
      ) {
        console.error(
          `[Auth] Token refresh failed (source: ${source}):`,
          errorMessage,
        );
      }
      return false;
    } finally {
      // ✅ 清除 Promise，允許下次刷新
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

/**
 * 取得當前 locale 前綴
 */
const getLocalePrefix = (): string => {
  if (typeof window === 'undefined') return '/en';
  const match = window.location.pathname.match(/^\/(en|zh-TW)/);
  return match ? `/${match[1]}` : '/en';
};

/**
 * 取得登入頁路徑（含 locale 前綴）
 */
export const getLoginPath = (): string => `${getLocalePrefix()}/login`;

/**
 * 登出（調用後端 API 清除 refresh token cookie，並清除前端 tokens）
 */
export const logout = async (): Promise<void> => {
  // ⚠️ 重要：必須先調用後端 API（需要 accessToken），再清除前端 tokens
  if (apolloClientRef) {
    try {
      const { LOGOUT_MUTATION } = await import('./graphql');
      await apolloClientRef!.mutate({
        mutation: LOGOUT_MUTATION,
      });
    } catch (error) {
      console.error('[Auth] Logout mutation failed:', error);
      // 即使後端調用失敗，前端也應該清除 token 並導向登入頁
    }
  }

  // 清除前端 tokens（必須在後端調用之後）
  clearAuthTokens();

  // 清除錯誤追蹤的使用者資訊
  if (typeof window !== 'undefined') {
    try {
      const { clearErrorTrackingUser } = await import('./error-user-tracking');
      clearErrorTrackingUser();
    } catch (error) {
      console.error('[Auth] Failed to clear error tracking user:', error);
    }
  }

  // 導向登入頁
  if (typeof window !== 'undefined') {
    window.location.href = getLoginPath();
  }
};

/**
 * 從 JWT token 中解析 payload（不驗證簽名，僅供前端 UI 顯示用途）
 * 所有授權判斷必須由後端執行
 */
export const parseJwt = (token: string): Record<string, unknown> | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

/**
 * 檢查 token 是否過期
 */
export const isTokenExpired = (token: string): boolean => {
  const payload = parseJwt(token);
  if (!payload || !payload.exp) return true;

  const expirationTime = (payload.exp as number) * 1000; // 轉換為毫秒
  return Date.now() >= expirationTime;
};

/**
 * 獲取 token 剩餘時間（毫秒）
 */
export const getTokenRemainingTime = (token: string): number => {
  const payload = parseJwt(token);
  if (!payload || !payload.exp) return 0;

  const expirationTime = (payload.exp as number) * 1000;
  const remaining = expirationTime - Date.now();
  return Math.max(0, remaining);
};

/**
 * 取消自動刷新計時器
 */
const cancelTokenRefresh = (): void => {
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }
};

/**
 * 排程 Token 自動刷新
 * 策略：Token 有效期 15 分鐘，在到期前 5 分鐘刷新（即 10 分鐘後）
 */
const scheduleTokenRefresh = (token: string): void => {
  cancelTokenRefresh(); // 取消舊的計時器

  const remainingTime = getTokenRemainingTime(token);
  if (remainingTime <= 0) {
    console.log('[Auth] Token already expired, not scheduling refresh');
    return;
  }

  // 在 Token 到期前 5 分鐘刷新
  const REFRESH_BEFORE_EXPIRY = 5 * 60 * 1000; // 5 分鐘
  const refreshIn = remainingTime - REFRESH_BEFORE_EXPIRY;

  console.log(
    `[Auth] Scheduling token refresh in ${Math.round(refreshIn / 1000 / 60)} minutes (remaining: ${Math.round(remainingTime / 1000 / 60)} min)`,
  );

  if (refreshIn <= 0) {
    // Token 剩餘時間不到 5 分鐘，但不立即刷新
    // 等待 1 分鐘後再刷新，避免頻繁刷新
    console.log(
      '[Auth] Token expires soon (< 5 min), scheduling refresh in 1 minute',
    );
    refreshTimer = setTimeout(async () => {
      const success = await refreshAccessToken('scheduled-soon');
      if (success) {
        const newToken = getAccessToken();
        if (newToken) {
          scheduleTokenRefresh(newToken);
        }
      }
    }, 60 * 1000); // 1 分鐘後刷新
    return;
  }

  refreshTimer = setTimeout(async () => {
    console.log('[Auth] ⏰ Scheduled refresh time reached');
    const success = await refreshAccessToken('scheduled');

    if (success) {
      // 刷新成功後，重新排程下一次刷新
      const newToken = getAccessToken();
      if (newToken) {
        scheduleTokenRefresh(newToken);
      }
    }
  }, refreshIn);
};

/**
 * 啟動時初始化 Token 刷新（由 App 啟動時調用）
 *
 * ✅ 冪等設計：多次調用不會重複初始化，只會在首次調用時執行
 */
export const initializeAuth = async (): Promise<boolean> => {
  // ✅ 如果已經初始化過，直接返回當前認證狀態
  const alreadyInitialized = getIsInitialized();
  console.log(
    `[Auth] 🔍 Checking initialization status: ${alreadyInitialized}`,
  );

  if (alreadyInitialized) {
    console.log('[Auth] ✅ Already initialized, skipping...');
    const token = getAccessToken();
    return !!(token && !isTokenExpired(token));
  }

  console.log('[Auth] 🔵 Initializing authentication...');
  setIsInitialized(true);
  console.log(
    `[Auth] 🔍 Set initialization flag to true, current value: ${getIsInitialized()}`,
  );

  // 如果已有 access token 且未過期，排程刷新
  const token = getAccessToken();
  if (token && !isTokenExpired(token)) {
    // ✅ 只在首次初始化時排程刷新
    // 後續的刷新會由 refreshAccessToken 中的 scheduleTokenRefresh 處理
    if (refreshTimer === null) {
      scheduleTokenRefresh(token);
    } else {
      console.log('[Auth] Token refresh already scheduled, skipping schedule');
    }
    return true;
  }

  // 沒有有效 token，嘗試使用 refresh token 恢復 session
  const success = await refreshAccessToken('initialization');

  // refreshAccessToken 已經會調用 scheduleTokenRefresh，這裡不需要再調用

  return success;
};
