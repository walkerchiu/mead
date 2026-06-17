import { getAccessToken, parseJwt } from '@/lib/auth';

/**
 * 統一角色階層 rank（與後端 role-hierarchy 對齊）：
 * OWNER > ADMIN > MANAGER > OPERATOR > VIEWER；其餘（如 public 的 MEMBER/GUEST）為 0。
 * 使用者只能管理／設定階層嚴格低於自身者。
 */
export function roleRank(roleName: string): number {
  switch (roleName) {
    case 'OWNER':
      return 5;
    case 'ADMIN':
      return 4;
    case 'MANAGER':
      return 3;
    case 'OPERATOR':
      return 2;
    case 'VIEWER':
      return 1;
    default:
      return 0;
  }
}

/**
 * 呼叫者在指定 scope 的最高角色 rank（讀自 JWT）。
 * 當設定 customer 矩陣時若呼叫者具 HQ scope，視為由上層全權管理 → 回傳 Infinity。
 */
export function callerRankInScope(
  scope: 'HQ_SCOPE' | 'CUSTOMER_SCOPE',
): number {
  const token = getAccessToken();
  const payload = token ? parseJwt(token) : null;
  const scopes = (payload?.accessScopes as string[]) || [];

  // HQ 呼叫者管理 customer 矩陣時可全編。
  if (scope === 'CUSTOMER_SCOPE' && scopes.includes('HQ_SCOPE')) {
    return Number.POSITIVE_INFINITY;
  }

  const roles =
    (payload?.roles as Array<{ scope: string; roleNames: string[] }>) || [];
  return roles
    .filter((r) => r.scope === scope)
    .flatMap((r) => r.roleNames || [])
    .reduce((max, name) => Math.max(max, roleRank(name)), 0);
}
