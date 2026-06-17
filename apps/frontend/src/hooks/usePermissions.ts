import { useEffect, useState } from 'react';
import {
  getAccessToken,
  parseJwt,
  isAuthInitComplete,
  AUTH_INIT_COMPLETE_EVENT,
} from '@/lib/auth';

type JwtPayload = Record<string, unknown> | null;

/**
 * usePermissions Hook
 *
 * 直接讀取 JWT 的 `permissions` claim 判斷權限（後端於簽發時以角色權限展開），
 * 不再使用前端硬編碼的角色→權限對照表，也不再有 SUPER_HQ 繞過——
 * OWNER/ADMIN 透過種子權限自然取得完整存取，與後端 PermissionGuard 一致。
 *
 * @example
 * const { hasPermission, hasRole, hasScope } = usePermissions();
 * if (hasPermission('users:create')) { ... }
 */
export function usePermissions() {
  // localStorage 在 SSR 不存在；token 必須 mount 後讀進 state，
  // 由 state 變更觸發 re-render，否則首屏永遠拿到空 permissions。
  const [payload, setPayload] = useState<JwtPayload>(null);

  useEffect(() => {
    const sync = () => {
      const token = getAccessToken();
      setPayload(token ? parseJwt(token) : null);
    };
    if (isAuthInitComplete()) sync();
    window.addEventListener(AUTH_INIT_COMPLETE_EVENT, sync);
    return () => window.removeEventListener(AUTH_INIT_COMPLETE_EVENT, sync);
  }, []);

  /**
   * 是否具備指定權限。
   * - 以 `_SCOPE` 結尾者視為 scope 檢查（對照 accessScopes）。
   * - 其餘對照 JWT 的 permissions claim（resource:action）。
   */
  const hasPermission = (requiredPermission: string): boolean => {
    if (!payload) return false;

    const accessScopes = payload.accessScopes as string[] | undefined;
    if (requiredPermission.endsWith('_SCOPE')) {
      return accessScopes?.includes(requiredPermission) || false;
    }

    const permissions = (payload.permissions as string[] | undefined) || [];
    return permissions.includes(requiredPermission);
  };

  /**
   * 是否具備指定角色（任一 scope）。
   */
  const hasRole = (requiredRole: string): boolean => {
    if (!payload) return false;
    const roles = payload.roles as
      | Array<{ scope: string; roleNames: string[] }>
      | undefined;
    if (!roles || !Array.isArray(roles)) return false;
    return roles.some((role) => role.roleNames?.includes(requiredRole));
  };

  /**
   * 是否具備指定 scope。
   */
  const hasScope = (requiredScope: string): boolean => {
    if (!payload) return false;
    const accessScopes = payload.accessScopes as string[] | undefined;
    return accessScopes?.includes(requiredScope) || false;
  };

  return {
    hasPermission,
    hasRole,
    hasScope,
  };
}
