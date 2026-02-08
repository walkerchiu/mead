'use client';

import { TopProgressBar } from '@/components/atoms/TopProgressBar';
import { ErrorDisplay } from '@/components/molecules';
import { useNavRouter as useRouter } from '@/i18n/use-nav-router';
import {
  getAccessToken,
  isAuthenticated,
  parseJwt,
  refreshAccessToken,
  AUTH_INIT_COMPLETE_EVENT,
  isAuthInitComplete,
} from '@/lib/auth';
import { useTranslations } from 'next-intl';
import { createContext, useContext, useEffect, useState } from 'react';

// Context to notify children when auth is ready
const AuthReadyContext = createContext<boolean>(false);

export function useAuthReady() {
  return useContext(AuthReadyContext);
}

/**
 * Check if user has any of the required scopes
 */
function hasAnyScope(requiredScopes: string[]): boolean {
  if (!requiredScopes || requiredScopes.length === 0) return true;

  const token = getAccessToken();
  if (!token) return false;

  const payload = parseJwt(token);
  if (!payload) return false;

  const accessScopes = (payload.accessScopes as string[]) || [];
  return requiredScopes.some((scope) => accessScopes.includes(scope));
}

/**
 * Check if user has any of the required permissions (using JWT permissions array)
 */
function hasAnyPermission(requiredPermissions: string[]): boolean {
  if (!requiredPermissions || requiredPermissions.length === 0) return true;

  const token = getAccessToken();
  if (!token) return false;

  const payload = parseJwt(token);
  if (!payload) return false;

  // Use permissions array from JWT payload
  const userPermissions = (payload.permissions as string[]) || [];

  // Only SUPER_HQ role bypasses all permission checks
  const accessScopes = (payload.accessScopes as string[]) || [];
  const roles =
    (payload.roles as Array<{ scope: string; roleNames: string[] }>) || [];
  const isSuperHQ =
    accessScopes.includes('HQ_SCOPE') &&
    roles.some((r) => r.roleNames?.includes('SUPER_HQ'));
  if (isSuperHQ) {
    return true;
  }

  // Check if user has any of the required permissions
  return requiredPermissions.some((permission) =>
    userPermissions.includes(permission),
  );
}

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string; // Legacy support (single permission)
  requiredPermissions?: string[]; // Array of permissions (any match)
  requiredScopes?: string[]; // Array of scopes (any match)
}

export default function ProtectedRoute({
  children,
  requiredPermission,
  requiredPermissions,
  requiredScopes,
}: ProtectedRouteProps) {
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

    const checkPermissions = (): boolean => {
      // Check scopes if required
      if (requiredScopes && !hasAnyScope(requiredScopes)) {
        return false;
      }

      // Check permissions if required
      const permsToCheck =
        requiredPermissions || (requiredPermission ? [requiredPermission] : []);
      if (permsToCheck.length > 0 && !hasAnyPermission(permsToCheck)) {
        return false;
      }

      return true;
    };

    const check = async () => {
      try {
        // ✅ prioritize checking whether authenticated（avoid repeated calls to refreshAccessToken）
        if (isAuthenticated()) {
          console.log(
            '[ProtectedRoute] Already authenticated, setting authReady to true',
          );

          // check permissions and scopes
          if (!checkPermissions()) {
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

        // ⚠️ no token，等待 useAuthInit 初始化完成（事件驅動，避免長時間輪詢）
        console.log(
          '[ProtectedRoute] Waiting for authentication to complete...',
        );

        const authenticated = await new Promise<boolean>((resolve) => {
          // 若 initializeAuth 已完成（事件已觸發過），直接檢查結果
          if (isAuthInitComplete()) {
            console.log(
              '[ProtectedRoute] Auth init already complete, checking result...',
            );
            resolve(isAuthenticated());
            return;
          }

          const timeout = setTimeout(() => {
            window.removeEventListener(AUTH_INIT_COMPLETE_EVENT, handler);
            resolve(isAuthenticated());
          }, 5000);

          const handler = () => {
            clearTimeout(timeout);
            window.removeEventListener(AUTH_INIT_COMPLETE_EVENT, handler);
            resolve(isAuthenticated());
          };

          window.addEventListener(AUTH_INIT_COMPLETE_EVENT, handler);
        });

        if (authenticated) {
          // check permissions and scopes
          if (!checkPermissions()) {
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

        // 如果 auth init 已完成且確認未登入，直接重導，不再重試 refresh
        if (isAuthInitComplete()) {
          console.log(
            '[ProtectedRoute] Auth init completed but not authenticated, redirecting to login',
          );
          setChecking(false);
          router.push('/login');
          return;
        }

        // last resort: try using refresh token to recover (only when useAuthInit fails)
        console.log(
          '[ProtectedRoute] useAuthInit did not restore session, trying refresh token...',
        );
        const refreshed = await refreshAccessToken('protected-route-fallback');

        if (refreshed) {
          // check permissions and scopes
          if (!checkPermissions()) {
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
  }, [requiredPermission, requiredPermissions, requiredScopes, router, t]);

  // Authentication checking — show a thin fixed top progress bar (NextTopLoader-style)
  // so the user gets immediate feedback instead of staring at a blank page.
  if (checking) {
    return <TopProgressBar />;
  }

  // Authentication error - displayError message
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

  // not authenticated — redirecting to login page; keep the progress bar so
  // the brief navigation gap doesn't flash to a fully blank screen.
  if (!authed) {
    return <TopProgressBar />;
  }

  // authenticated - use Context NotificationsChildcomponent
  return (
    <AuthReadyContext.Provider value={authReady}>
      {children}
    </AuthReadyContext.Provider>
  );
}
