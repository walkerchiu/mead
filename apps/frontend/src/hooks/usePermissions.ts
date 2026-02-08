import { getAccessToken, parseJwt } from '@/lib/auth';

/**
 * Role to permissions mapping
 * 必須與後端 `apps/backend/database/prisma/seeds/base.ts` 保持一致
 */
const ROLE_PERMISSIONS: Record<string, string[]> = {
  // HQ_SCOPE roles
  CONTENT_EDITOR: [
    'users:read',
    'users:list',
    'users:create',
    'users:update',
    'users:delete',
    'users:restore',
    'users:reset_password',
    'roles:manage',
  ],
  VIEWER: ['users:read', 'users:list', 'audit-logs:read', 'roles:read'],

  // CUSTOMER_SCOPE roles
  OWNER: [
    'users:read',
    'users:list',
    'users:create',
    'users:update',
    'users:delete',
    'users:reset_password',
    'roles:manage',
  ],
  MANAGER: [
    'users:read',
    'users:list',
    'users:create',
    'users:update',
    'users:delete',
    'users:reset_password',
  ],
  MEMBER: ['users:read', 'users:list'],
  GUEST: [],
};

/**
 * usePermissions Hook
 *
 * Provides permission checking utilities based on user roles.
 *
 * @example
 * const { hasPermission, hasRole, hasScope } = usePermissions();
 *
 * if (hasPermission('users:create')) {
 *   // Show management UI
 * }
 */
export function usePermissions() {
  /**
   * Check if user has specified permission
   */
  const hasPermission = (requiredPermission: string): boolean => {
    const token = getAccessToken();
    if (!token) return false;

    const payload = parseJwt(token);
    if (!payload) return false;

    // Check access scopes (Scope level permissions, e.g., HQ_SCOPE)
    const accessScopes = payload.accessScopes as string[] | undefined;

    // If required permission is a scope (ends with _SCOPE), check directly in accessScopes
    if (requiredPermission.endsWith('_SCOPE')) {
      return accessScopes?.includes(requiredPermission) || false;
    }

    // Check roles (roleNames contains role names like 'MANAGER', not permissions)
    const roles = payload.roles as
      | Array<{ scope: string; roleNames: string[] }>
      | undefined;

    // Only SUPER_HQ role bypasses all permission checks
    const isSuperHQ =
      accessScopes?.includes('HQ_SCOPE') &&
      roles?.some((r) => r.roleNames?.includes('SUPER_HQ'));
    if (isSuperHQ) {
      return true;
    }
    if (!roles || !Array.isArray(roles)) return false;

    // Get all permissions from user's roles
    const userPermissions: string[] = [];
    for (const role of roles) {
      if (role.roleNames && Array.isArray(role.roleNames)) {
        for (const roleName of role.roleNames) {
          const permissions = ROLE_PERMISSIONS[roleName];
          if (permissions) {
            userPermissions.push(...permissions);
          }
        }
      }
    }

    // Check for direct permission match
    return userPermissions.includes(requiredPermission);
  };

  /**
   * Check if user has specified role
   */
  const hasRole = (requiredRole: string): boolean => {
    const token = getAccessToken();
    if (!token) return false;

    const payload = parseJwt(token);
    if (!payload) return false;

    const roles = payload.roles as
      | Array<{ scope: string; roleNames: string[] }>
      | undefined;
    if (!roles || !Array.isArray(roles)) return false;

    return roles.some((role) => role.roleNames?.includes(requiredRole));
  };

  /**
   * Check if user has specified scope
   */
  const hasScope = (requiredScope: string): boolean => {
    const token = getAccessToken();
    if (!token) return false;

    const payload = parseJwt(token);
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
