import { AccessScope } from '../common/enums/access-scope.enum';

/**
 * 功能權限矩陣的單一功能定義（對齊 nptc ScopeFeatures，跟隨 npt）：
 * 以一組「檢視」與「管理」權限名稱（resource:action）對應到一個功能。
 * 矩陣的每個格子（讀／寫）即增刪角色對這些權限的持有。label 由前端依 key 做 i18n。
 */
export interface FeatureDef {
  key: string;
  readPermissions: string[];
  writePermissions: string[];
}

const HQ_FEATURES: FeatureDef[] = [
  {
    key: 'user-management',
    readPermissions: ['users:read', 'users:list'],
    writePermissions: [
      'users:create',
      'users:update',
      'users:delete',
      'users:restore',
      'users:reset_password',
    ],
  },
  {
    key: 'audit-logs',
    readPermissions: ['audit-logs:read'],
    writePermissions: ['audit-logs:export'],
  },
  {
    key: 'sessions',
    readPermissions: ['sessions:read_user', 'sessions:read_all'],
    writePermissions: [
      'sessions:revoke_user',
      'sessions:revoke_batch',
      'sessions:revoke_all',
    ],
  },
  {
    key: 'cron-jobs',
    readPermissions: ['cron_jobs:read'],
    writePermissions: ['cron_jobs:manage'],
  },
];

const CUSTOMER_FEATURES: FeatureDef[] = [
  {
    key: 'user-management',
    readPermissions: ['users:read', 'users:list'],
    writePermissions: [
      'users:create',
      'users:update',
      'users:delete',
      'users:reset_password',
    ],
  },
];

/** 取得某 scope 可被功能矩陣管理的功能清單。 */
export function featuresForScope(scope: AccessScope): FeatureDef[] {
  switch (scope) {
    case AccessScope.HQ_SCOPE:
      return HQ_FEATURES;
    case AccessScope.CUSTOMER_SCOPE:
      return CUSTOMER_FEATURES;
    default:
      return [];
  }
}

/** 取得某 scope 下指定 key 的功能定義（找不到回 null）。 */
export function findFeature(
  scope: AccessScope,
  key: string,
): FeatureDef | null {
  return featuresForScope(scope).find((f) => f.key === key) ?? null;
}
