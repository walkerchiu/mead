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
 * Check if user has specified permissions
 */
function hasPermission(requiredPermission: string): boolean {
  const token = getAccessToken();
  if (!token) return false;

  const payload = parseJwt(token);
  if (!payload) return false;

  // Check access scopes（Scope level permissions, e.g., ADMIN_SCOPE）
  const accessScopes = payload.accessScopes as string[] | undefined;

  // If required permission is a scope (ends with _SCOPE), check directly in accessScopes
  if (requiredPermission.endsWith('_SCOPE')) {
    return accessScopes?.includes(requiredPermission) || false;
  }

  // Admin has all non-scope level permissions
  if (accessScopes?.includes('ADMIN_SCOPE')) {
    return true;
  }

  // Check roles（Detailed permissions, e.g., sessions:read_all）
  const roles = payload.roles as
    | Array<{ scope: string; roleNames: string[] }>
    | undefined;
  if (!roles || !Array.isArray(roles)) return false;

  // iterate all scope permissions
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
        // ✅ prioritize checking whether authenticated（avoid repeated calls to refreshAccessToken）
        if (isAuthenticated()) {
          console.log(
            '[ProtectedRoute] Already authenticated, setting authReady to true',
          );

          // check permissions
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

        // ⚠️ no token，Wait a moment for useAuthInit initialization complete
        // useAuthInit will automatically call initializeAuth() on application startup
        await new Promise((resolve) => setTimeout(resolve, 500));

        // check again whether authenticated (useAuthInit may have already recovered session)
        if (isAuthenticated()) {
          // check permissions
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

        // last resort: try using refresh token to recover (only when useAuthInit fails)
        console.log(
          '[ProtectedRoute] useAuthInit did not restore session, trying refresh token...',
        );
        const refreshed = await refreshAccessToken('protected-route-fallback');

        if (refreshed) {
          // check permissions
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

  // Authentication checking - show loading screen
  if (checking) {
    return <DashboardSkeleton />;
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

  // not authenticated - redirecting tologinPage（render nothingContent）
  if (!authed) {
    return <DashboardSkeleton />;
  }

  // authenticated - use Context NotificationsChildcomponent
  return (
    <AuthReadyContext.Provider value={authReady}>
      {children}
    </AuthReadyContext.Provider>
  );
}
