/**
 * 統一五階角色階層（對齊 .NET 模板 nptc 的 RoleHierarchy，跟隨 npt）。
 *
 * 兩個管理 scope（HQ / CUSTOMER）共用：OWNER > ADMIN > MANAGER > OPERATOR > VIEWER。
 * MEMBER / GUEST（PUBLIC scope）與未知角色 rank 為 0。
 *
 * 「只能管理／指派 rank 嚴格低於自身者」的階層判斷以此為單一來源。
 */
export const ROLE_RANK: Readonly<Record<string, number>> = {
  OWNER: 5,
  ADMIN: 4,
  MANAGER: 3,
  OPERATOR: 2,
  VIEWER: 1,
};

/** 授予 HQ scope 的最低 rank（OWNER/ADMIN）。 */
export const ADMIN_RANK = ROLE_RANK.ADMIN;

/** 取得角色 rank（未知角色為 0）。 */
export function roleRank(roleName: string): number {
  return ROLE_RANK[roleName] ?? 0;
}

/** 取得一組角色名稱中的最高 rank（空集合為 0）。 */
export function maxRank(roleNames: string[]): number {
  return roleNames.reduce((max, name) => Math.max(max, roleRank(name)), 0);
}
