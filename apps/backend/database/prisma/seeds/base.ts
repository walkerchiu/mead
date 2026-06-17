import { PrismaClient, AccessScope } from '@prisma/client';
import { seedCronJobConfigs } from './cron-job-configs';

/**
 * 系統預設 RBAC 資料 single source of truth（對齊 .NET 模板 nptc 的 SystemDefaults，跟隨 npt）。
 *
 * 統一五階角色：HQ 與 CUSTOMER 兩 scope 皆 OWNER > ADMIN > MANAGER > OPERATOR > VIEWER；
 * MEMBER / GUEST 改隸 PUBLIC scope。角色權限由 glob 展開（"*" / "resource:*" / 明確名稱），
 * 對應功能權限矩陣的預設值（runtime 可調整）。權限目錄沿用 mead 實際功能面
 * （無 profile/customer-sessions 模組，故不納入；保留 HQ sessions 全集）。
 */

interface PermissionDef {
  resource: string;
  action: string;
  scope: AccessScope;
  description?: string;
}

interface RoleDef {
  name: string;
  displayName: string;
  scope: AccessScope;
  description: string;
  /** 權限 glob：'*'（該 scope 全部）/ 'resource:*'（該 resource 全動作）/ 'resource:action'（單一） */
  globs: string[];
}

// ============================================================
// Permissions（命名規則 resource:action，每個 scope 獨立）
// ============================================================
const PERMISSIONS: PermissionDef[] = [
  // HQ scope
  { resource: 'users', action: 'create', scope: AccessScope.HQ_SCOPE },
  { resource: 'users', action: 'read', scope: AccessScope.HQ_SCOPE },
  { resource: 'users', action: 'list', scope: AccessScope.HQ_SCOPE },
  { resource: 'users', action: 'update', scope: AccessScope.HQ_SCOPE },
  { resource: 'users', action: 'delete', scope: AccessScope.HQ_SCOPE },
  { resource: 'users', action: 'restore', scope: AccessScope.HQ_SCOPE },
  { resource: 'users', action: 'reset_password', scope: AccessScope.HQ_SCOPE },
  { resource: 'audit-logs', action: 'read', scope: AccessScope.HQ_SCOPE },
  { resource: 'audit-logs', action: 'export', scope: AccessScope.HQ_SCOPE },
  { resource: 'roles', action: 'manage', scope: AccessScope.HQ_SCOPE },
  {
    resource: 'roles',
    action: 'read',
    scope: AccessScope.HQ_SCOPE,
    description: '讀取角色（viewer 用）',
  },
  { resource: 'sessions', action: 'read', scope: AccessScope.HQ_SCOPE },
  { resource: 'sessions', action: 'read_user', scope: AccessScope.HQ_SCOPE },
  { resource: 'sessions', action: 'read_all', scope: AccessScope.HQ_SCOPE },
  { resource: 'sessions', action: 'revoke', scope: AccessScope.HQ_SCOPE },
  { resource: 'sessions', action: 'revoke_user', scope: AccessScope.HQ_SCOPE },
  { resource: 'sessions', action: 'revoke_batch', scope: AccessScope.HQ_SCOPE },
  { resource: 'sessions', action: 'revoke_all', scope: AccessScope.HQ_SCOPE },
  { resource: 'cron_jobs', action: 'read', scope: AccessScope.HQ_SCOPE },
  { resource: 'cron_jobs', action: 'manage', scope: AccessScope.HQ_SCOPE },

  // Customer scope
  { resource: 'users', action: 'read', scope: AccessScope.CUSTOMER_SCOPE },
  { resource: 'users', action: 'list', scope: AccessScope.CUSTOMER_SCOPE },
  { resource: 'users', action: 'create', scope: AccessScope.CUSTOMER_SCOPE },
  { resource: 'users', action: 'update', scope: AccessScope.CUSTOMER_SCOPE },
  { resource: 'users', action: 'delete', scope: AccessScope.CUSTOMER_SCOPE },
  {
    resource: 'users',
    action: 'reset_password',
    scope: AccessScope.CUSTOMER_SCOPE,
  },
  { resource: 'roles', action: 'manage', scope: AccessScope.CUSTOMER_SCOPE },

  // Public scope（系統角色；public 功能存取由 customer 端決定，本期最小化）
  { resource: 'public', action: 'read', scope: AccessScope.PUBLIC_SCOPE },
];

// ============================================================
// Roles（全 isSystem=true）
// 兩個管理 scope 共用 5 階；rank 與「只能管理階層嚴格低於自身者」見 role-hierarchy。
// OWNER/ADMIN 預設全功能讀寫（ADMIN 差別僅在不可管理 OWNER）。
// ============================================================
const ROLES: RoleDef[] = [
  // HQ scope（5 階）
  {
    name: 'OWNER',
    displayName: '擁有者',
    scope: AccessScope.HQ_SCOPE,
    description: '擁有所有 HQ 權限',
    globs: ['*'],
  },
  {
    name: 'ADMIN',
    displayName: '系統管理員',
    scope: AccessScope.HQ_SCOPE,
    description: '預設等同擁有者，但不可管理擁有者',
    globs: ['*'],
  },
  {
    name: 'MANAGER',
    displayName: '管理者',
    scope: AccessScope.HQ_SCOPE,
    description: '管理用戶與會話，稽核／排程唯讀',
    globs: [
      'users:*',
      'sessions:*',
      'audit-logs:read',
      'cron_jobs:read',
      'roles:manage',
      'roles:read',
    ],
  },
  {
    name: 'OPERATOR',
    displayName: '操作者',
    scope: AccessScope.HQ_SCOPE,
    description: '操作用戶，其餘唯讀',
    globs: [
      'users:*',
      'audit-logs:read',
      'sessions:read_user',
      'sessions:read_all',
      'cron_jobs:read',
      'roles:manage',
      'roles:read',
    ],
  },
  {
    name: 'VIEWER',
    displayName: '檢視員',
    scope: AccessScope.HQ_SCOPE,
    description: '全功能唯讀',
    globs: [
      'users:read',
      'users:list',
      'audit-logs:read',
      'sessions:read_user',
      'sessions:read_all',
      'cron_jobs:read',
      'roles:read',
    ],
  },

  // Customer scope（5 階）
  {
    name: 'OWNER',
    displayName: '擁有者',
    scope: AccessScope.CUSTOMER_SCOPE,
    description: '擁有所有客戶端權限',
    globs: ['*'],
  },
  {
    name: 'ADMIN',
    displayName: '系統管理員',
    scope: AccessScope.CUSTOMER_SCOPE,
    description: '預設等同擁有者，但不可管理擁有者',
    globs: ['*'],
  },
  {
    name: 'MANAGER',
    displayName: '管理者',
    scope: AccessScope.CUSTOMER_SCOPE,
    description: '管理客戶端用戶',
    globs: ['users:*', 'roles:manage'],
  },
  {
    name: 'OPERATOR',
    displayName: '操作者',
    scope: AccessScope.CUSTOMER_SCOPE,
    description: '操作客戶端用戶',
    globs: ['users:*', 'roles:manage'],
  },
  {
    name: 'VIEWER',
    displayName: '檢視者',
    scope: AccessScope.CUSTOMER_SCOPE,
    description: '唯讀，不可管理任何人',
    globs: ['users:read', 'users:list'],
  },

  // Public scope（系統角色；public 功能存取由 customer 端決定，本期最小化）
  {
    name: 'MEMBER',
    displayName: '一般成員',
    scope: AccessScope.PUBLIC_SCOPE,
    description: '終端一般成員，可查詢公開資料',
    globs: ['public:read'],
  },
  {
    name: 'GUEST',
    displayName: '訪客',
    scope: AccessScope.PUBLIC_SCOPE,
    description: '終端訪客，僅檢視公開資料',
    globs: ['public:read'],
  },
];

/** 將角色的 glob 展開為該 scope 下符合的 permission 名稱集合。 */
function expandGlobs(
  globs: string[],
  scopePerms: PermissionDef[],
): Set<string> {
  const matched = new Set<string>();
  for (const glob of globs) {
    for (const p of scopePerms) {
      const name = `${p.resource}:${p.action}`;
      if (
        glob === '*' ||
        (glob.endsWith(':*') && p.resource === glob.slice(0, -2)) ||
        glob === name
      ) {
        matched.add(name);
      }
    }
  }
  return matched;
}

export async function seedBase(prisma: PrismaClient) {
  // ==================== 1. 創建 / 更新權限 ====================
  console.log('\n📋 創建權限...');

  for (const perm of PERMISSIONS) {
    const name = `${perm.resource}:${perm.action}`;
    await prisma.permission.upsert({
      where: { name_scope: { name, scope: perm.scope } },
      update: { resource: perm.resource, action: perm.action },
      create: {
        name,
        resource: perm.resource,
        action: perm.action,
        scope: perm.scope,
        description: perm.description,
      },
    });
  }

  // 清除不在 catalog 內的舊權限（舊 cron_jobs:write、profile:*、已移除模組權限等）。
  // rolePermission 關聯由 Prisma cascade 自動清除。
  const keepPermKeys = new Set(
    PERMISSIONS.map((p) => `${p.resource}:${p.action}::${p.scope}`),
  );
  const allPerms = await prisma.permission.findMany({
    select: { id: true, name: true, scope: true },
  });
  const obsoletePermIds = allPerms
    .filter((p) => !keepPermKeys.has(`${p.name}::${p.scope}`))
    .map((p) => p.id);
  if (obsoletePermIds.length > 0) {
    await prisma.permission.deleteMany({
      where: { id: { in: obsoletePermIds } },
    });
    console.log(`🗑️  清理 ${obsoletePermIds.length} 個廢棄權限`);
  }
  console.log(`✅ 創建了 ${PERMISSIONS.length} 個權限`);

  // ==================== 2. 創建 / 更新角色 + 重建角色權限 ====================
  console.log('\n👑 創建統一五階角色...');

  for (const roleDef of ROLES) {
    const role = await prisma.role.upsert({
      where: { name_scope: { name: roleDef.name, scope: roleDef.scope } },
      update: {
        displayName: roleDef.displayName,
        description: roleDef.description,
        isSystem: true,
      },
      create: {
        name: roleDef.name,
        displayName: roleDef.displayName,
        scope: roleDef.scope,
        description: roleDef.description,
        isSystem: true,
      },
    });

    const scopePerms = PERMISSIONS.filter((p) => p.scope === roleDef.scope);
    const wanted = expandGlobs(roleDef.globs, scopePerms);
    const wantedPerms = await prisma.permission.findMany({
      where: { scope: roleDef.scope, name: { in: [...wanted] } },
      select: { id: true },
    });

    // 重建該角色的 rolePermission（先清空再插入），確保與 glob 完全一致。
    await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });
    if (wantedPerms.length > 0) {
      await prisma.rolePermission.createMany({
        data: wantedPerms.map((p) => ({
          roleId: role.id,
          permissionId: p.id,
        })),
        skipDuplicates: true,
      });
    }
  }

  // 清除不在 catalog 內的舊角色（HQ SUPER_HQ / CONTENT_EDITOR、CUSTOMER MEMBER / GUEST 等）。
  // userRole / rolePermission 關聯由 cascade 清除；dev 環境會重新 seed 帳號。
  const keepRoleKeys = new Set(ROLES.map((r) => `${r.name}::${r.scope}`));
  const allRoles = await prisma.role.findMany({
    select: { id: true, name: true, scope: true },
  });
  const obsoleteRoleIds = allRoles
    .filter((r) => !keepRoleKeys.has(`${r.name}::${r.scope}`))
    .map((r) => r.id);
  if (obsoleteRoleIds.length > 0) {
    await prisma.role.deleteMany({ where: { id: { in: obsoleteRoleIds } } });
    console.log(`🗑️  清理 ${obsoleteRoleIds.length} 個廢棄角色`);
  }
  console.log(`✅ 統一五階角色創建完成（${ROLES.length} 個）`);

  // ==================== 3. 創建 Cron Job 配置 ====================
  await seedCronJobConfigs(prisma);
}
