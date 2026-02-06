'use client';

import { DashboardSkeleton } from '@/components/atoms';
import { ErrorDisplay } from '@/components/molecules';
import { useRouter } from '@/i18n/routing';
import {
  getAccessToken,
  isAuthenticated,
  parseJwt,
  refreshAccessToken,
} from '@/lib/auth';
import { useTranslations } from 'next-intl';
import { createContext, useContext, useEffect, useState } from 'react';

// Context to notify children when auth is ready
const AuthReadyContext = createContext<boolean>(false);

export function useAuthReady() {
  return useContext(AuthReadyContext);
}

/**
 * 檢查用戶是否有指定權限
 */
function hasPermission(requiredPermission: string): boolean {
  const token = getAccessToken();
  if (!token) return false;

  const payload = parseJwt(token);
  if (!payload) return false;

  // 檢查 accessScopes（scope 級別權限，例如 ADMIN_SCOPE）
  const accessScopes = payload.accessScopes as string[] | undefined;

  // 如果所需權限是 scope（以 _SCOPE 結尾），直接在 accessScopes 中檢查
  if (requiredPermission.endsWith('_SCOPE')) {
    return accessScopes?.includes(requiredPermission) || false;
  }

  // Admin 有所有非 scope 級別的權限
  if (accessScopes?.includes('ADMIN_SCOPE')) {
    return true;
  }

  // 檢查 roles（詳細權限，例如 sessions:read_all）
  const roles = payload.roles as
    | Array<{ scope: string; roleNames: string[] }>
    | undefined;
  if (!roles || !Array.isArray(roles)) return false;

  // 遍歷所有 scope 的權限
  for (const role of roles) {
    if (
      role.roleNames &&
      Array.isArray(role.roleNames) &&
      role.roleNames.includes(requiredPermission)
    ) {
      return true;
    }
  }

  return false;
}

export default function ProtectedRoute({
  children,
  requiredPermission,
}: {
  children: React.ReactNode;
  requiredPermission?: string;
}) {
  const router = useRouter();
  const t = useTranslations('common.error');
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [error, setError] = useState<string>();
  const [isPermissionError, setIsPermissionError] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    console.log(
      '[ProtectedRoute] Running auth check, isAuthenticated:',
      isAuthenticated(),
    );

    const check = async () => {
      try {
        // ✅ 優先檢查是否已認證（避免重複調用 refreshAccessToken）
        if (isAuthenticated()) {
          console.log(
            '[ProtectedRoute] Already authenticated, setting authReady to true',
          );

          // 檢查權限
          if (requiredPermission && !hasPermission(requiredPermission)) {
            setError(t('permissionDeniedMessage'));
            setIsPermissionError(true);
            setChecking(false);
            return;
          }

          setAuthed(true);
          setChecking(false);
          setAuthReady(true);
          return;
        }

        // ⚠️ 沒有 token，等待一小段時間讓 useAuthInit 完成初始化
        // useAuthInit 會在應用啟動時自動調用 initializeAuth()
        await new Promise((resolve) => setTimeout(resolve, 500));

        // 再次檢查是否已認證（可能 useAuthInit 已經恢復了 session）
        if (isAuthenticated()) {
          // 檢查權限
          if (requiredPermission && !hasPermission(requiredPermission)) {
            setError(t('permissionDeniedMessage'));
            setIsPermissionError(true);
            setChecking(false);
            return;
          }

          setAuthed(true);
          setChecking(false);
          setAuthReady(true);
          return;
        }

        // 最後手段：嘗試用 refresh token 恢復（僅在 useAuthInit 失敗時）
        console.log(
          '[ProtectedRoute] useAuthInit did not restore session, trying refresh token...',
        );
        const refreshed = await refreshAccessToken('protected-route-fallback');

        if (refreshed) {
          // 檢查權限
          if (requiredPermission && !hasPermission(requiredPermission)) {
            setError(t('permissionDeniedMessage'));
            setIsPermissionError(true);
            setChecking(false);
            return;
          }

          setAuthed(true);
          setChecking(false);
          setAuthReady(true);
        } else {
          setChecking(false);
          router.push('/login');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Authentication failed');
        setChecking(false);
      }
    };

    check();
  }, [requiredPermission, router, t]);

  // 認證檢查中 - 顯示載入畫面
  if (checking) {
    return <DashboardSkeleton />;
  }

  // 認證錯誤 - 顯示錯誤訊息
  if (error) {
    return (
      <ErrorDisplay
        title={
          isPermissionError ? t('permissionDenied') : 'Authentication Error'
        }
        message={isPermissionError ? t('permissionDeniedDescription') : error}
        severity={isPermissionError ? 'warning' : 'error'}
        showRetry
        retryText={isPermissionError ? t('backToHome') : 'Back to Login'}
        onRetry={() => router.push(isPermissionError ? '/dashboard' : '/login')}
      />
    );
  }

  // 未認證 - 正在導向登入頁（不渲染任何內容）
  if (!authed) {
    return <DashboardSkeleton />;
  }

  // 已認證 - 使用 Context 通知子组件
  return (
    <AuthReadyContext.Provider value={authReady}>
      {children}
    </AuthReadyContext.Provider>
  );
}
