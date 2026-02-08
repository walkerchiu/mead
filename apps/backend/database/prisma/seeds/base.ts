import { PrismaClient, AccessScope } from '@prisma/client';
import { seedCronJobConfigs } from './cron-job-configs';

export async function seedBase(prisma: PrismaClient) {
  // ==================== 0. 清理廢棄權限 ====================
  // 模板版本不再保留先前的業務模組權限（proposals / cases / projects / issues / departments / work_journals / committees）
  // Prisma 會自動 cascade 刪除 rolePermission 關聯（onDelete: Cascade）
  const deprecatedPermissionNames = [
    'profile:read',
    'profile:update',
    'permissions:manage',
    // 已移除模組的權限（若先前資料庫中存在則一併清除）
    'departments:read',
    'departments:manage',
    'proposals:create',
    'proposals:read',
    'proposals:read_all',
    'proposals:update',
    'proposals:delete',
    'proposals:submit',
    'proposals:review',
    'proposals:manage',
    'proposals:assign',
    'committees:manage',
    'cases:create',
    'cases:read',
    'cases:read_all',
    'cases:update',
    'cases:delete',
    'cases:submit',
    'cases:review',
    'cases:manage',
    'cases:assign',
    'projects:create',
    'projects:read',
    'projects:read_all',
    'projects:update',
    'projects:delete',
    'projects:manage',
    'projects:manage_members',
    'issues:create',
    'issues:read',
    'issues:update',
    'issues:delete',
    'issues:manage',
    'work_journals:read',
    'work_journals:write',
    'work_journals:manage',
    'work-calendar:read',
    'work-calendar:manage',
  ];
  const deleted = await prisma.permission.deleteMany({
    where: { name: { in: deprecatedPermissionNames } },
  });
  if (deleted.count > 0) {
    console.log(`\n🗑️  清理 ${deleted.count} 個廢棄權限`);
  }

  // ==================== 1. 創建權限 ====================
  console.log('\n📋 創建權限...');

  const permissions: Array<{
    name: string;
    resource: string;
    action: string;
    scope: AccessScope;
    description?: string;
  }> = [
    // HQ Scope Permissions — Users
    {
      name: 'users:create',
      resource: 'users',
      action: 'create',
      scope: AccessScope.HQ_SCOPE,
    },
    {
      name: 'users:read',
      resource: 'users',
      action: 'read',
      scope: AccessScope.HQ_SCOPE,
    },
    {
      name: 'users:list',
      resource: 'users',
      action: 'list',
      scope: AccessScope.HQ_SCOPE,
    },
    {
      name: 'users:update',
      resource: 'users',
      action: 'update',
      scope: AccessScope.HQ_SCOPE,
    },
    {
      name: 'users:delete',
      resource: 'users',
      action: 'delete',
      scope: AccessScope.HQ_SCOPE,
    },
    {
      name: 'users:restore',
      resource: 'users',
      action: 'restore',
      scope: AccessScope.HQ_SCOPE,
    },
    {
      name: 'users:reset_password',
      resource: 'users',
      action: 'reset_password',
      scope: AccessScope.HQ_SCOPE,
    },
    // HQ Scope — Audit Logs
    {
      name: 'audit-logs:read',
      resource: 'audit-logs',
      action: 'read',
      scope: AccessScope.HQ_SCOPE,
    },
    {
      name: 'audit-logs:export',
      resource: 'audit-logs',
      action: 'export',
      scope: AccessScope.HQ_SCOPE,
    },
    // HQ Scope — Roles
    {
      name: 'roles:manage',
      resource: 'roles',
      action: 'manage',
      scope: AccessScope.HQ_SCOPE,
    },
    {
      name: 'roles:read',
      resource: 'roles',
      action: 'read',
      scope: AccessScope.HQ_SCOPE,
      description: '讀取角色（viewer 用）',
    },

    // HQ Scope — Sessions
    {
      name: 'sessions:read',
      resource: 'sessions',
      action: 'read',
      scope: AccessScope.HQ_SCOPE,
    },
    {
      name: 'sessions:read_user',
      resource: 'sessions',
      action: 'read_user',
      scope: AccessScope.HQ_SCOPE,
    },
    {
      name: 'sessions:read_all',
      resource: 'sessions',
      action: 'read_all',
      scope: AccessScope.HQ_SCOPE,
    },
    {
      name: 'sessions:revoke',
      resource: 'sessions',
      action: 'revoke',
      scope: AccessScope.HQ_SCOPE,
    },
    {
      name: 'sessions:revoke_user',
      resource: 'sessions',
      action: 'revoke_user',
      scope: AccessScope.HQ_SCOPE,
    },
    {
      name: 'sessions:revoke_batch',
      resource: 'sessions',
      action: 'revoke_batch',
      scope: AccessScope.HQ_SCOPE,
    },
    {
      name: 'sessions:revoke_all',
      resource: 'sessions',
      action: 'revoke_all',
      scope: AccessScope.HQ_SCOPE,
    },

    // HQ Scope — Cron Jobs
    {
      name: 'cron_jobs:read',
      resource: 'cron_jobs',
      action: 'read',
      scope: AccessScope.HQ_SCOPE,
    },
    {
      name: 'cron_jobs:write',
      resource: 'cron_jobs',
      action: 'write',
      scope: AccessScope.HQ_SCOPE,
    },

    // Customer Scope — Users（基本查詢）
    {
      name: 'users:read',
      resource: 'users',
      action: 'read',
      scope: AccessScope.CUSTOMER_SCOPE,
    },
    {
      name: 'users:list',
      resource: 'users',
      action: 'list',
      scope: AccessScope.CUSTOMER_SCOPE,
    },
    {
      name: 'users:create',
      resource: 'users',
      action: 'create',
      scope: AccessScope.CUSTOMER_SCOPE,
      description: '建立用戶',
    },
    {
      name: 'users:update',
      resource: 'users',
      action: 'update',
      scope: AccessScope.CUSTOMER_SCOPE,
      description: '修改用戶資料',
    },
    {
      name: 'users:delete',
      resource: 'users',
      action: 'delete',
      scope: AccessScope.CUSTOMER_SCOPE,
      description: '刪除用戶',
    },
    {
      name: 'users:reset_password',
      resource: 'users',
      action: 'reset_password',
      scope: AccessScope.CUSTOMER_SCOPE,
      description: '重設用戶密碼',
    },
    {
      name: 'roles:manage',
      resource: 'roles',
      action: 'manage',
      scope: AccessScope.CUSTOMER_SCOPE,
      description: '管理用戶角色分配',
    },
  ];

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: {
        name_scope: {
          name: perm.name,
          scope: perm.scope,
        },
      },
      update: {},
      create: {
        name: perm.name,
        resource: perm.resource,
        action: perm.action,
        scope: perm.scope,
        description: perm.description,
      },
    });
  }

  console.log(`✅ 創建了 ${permissions.length} 個權限`);

  // ==================== 2. 創建 HQ Scope 角色 ====================
  console.log('\n👑 創建 HQ Scope 角色...');

  const superHQRole = await prisma.role.upsert({
    where: { name_scope: { name: 'SUPER_HQ', scope: AccessScope.HQ_SCOPE } },
    update: {},
    create: {
      name: 'SUPER_HQ',
      displayName: '超級管理員',
      scope: AccessScope.HQ_SCOPE,
      description: '擁有所有權限',
      isSystem: true,
    },
  });

  const contentEditorRole = await prisma.role.upsert({
    where: {
      name_scope: { name: 'CONTENT_EDITOR', scope: AccessScope.HQ_SCOPE },
    },
    update: {},
    create: {
      name: 'CONTENT_EDITOR',
      displayName: '內容編輯',
      scope: AccessScope.HQ_SCOPE,
      description: '可編輯客戶端資料，無法管理 HQ 設定',
      isSystem: true,
    },
  });

  const viewerRole = await prisma.role.upsert({
    where: { name_scope: { name: 'VIEWER', scope: AccessScope.HQ_SCOPE } },
    update: {},
    create: {
      name: 'VIEWER',
      displayName: '檢視者',
      scope: AccessScope.HQ_SCOPE,
      description: '僅能查看客戶端資料，無法編輯',
      isSystem: true,
    },
  });

  console.log('✅ HQ Scope 角色創建完成');

  // ==================== 3. 創建 Customer Scope 角色 ====================
  console.log('\n👤 創建 Customer Scope 角色...');

  const ownerRole = await prisma.role.upsert({
    where: { name_scope: { name: 'OWNER', scope: AccessScope.CUSTOMER_SCOPE } },
    update: {},
    create: {
      name: 'OWNER',
      displayName: '擁有者',
      scope: AccessScope.CUSTOMER_SCOPE,
      description: '擁有所有客戶端權限',
      isSystem: true,
    },
  });

  const managerRole = await prisma.role.upsert({
    where: {
      name_scope: { name: 'MANAGER', scope: AccessScope.CUSTOMER_SCOPE },
    },
    update: {},
    create: {
      name: 'MANAGER',
      displayName: '管理者',
      scope: AccessScope.CUSTOMER_SCOPE,
      description: '可管理工作日曆與一般用戶',
      isSystem: true,
    },
  });

  const memberRole = await prisma.role.upsert({
    where: {
      name_scope: { name: 'MEMBER', scope: AccessScope.CUSTOMER_SCOPE },
    },
    update: {},
    create: {
      name: 'MEMBER',
      displayName: '成員',
      scope: AccessScope.CUSTOMER_SCOPE,
      description: '一般成員，可查詢用戶與工作日曆',
      isSystem: true,
    },
  });

  const guestRole = await prisma.role.upsert({
    where: { name_scope: { name: 'GUEST', scope: AccessScope.CUSTOMER_SCOPE } },
    update: {},
    create: {
      name: 'GUEST',
      displayName: '訪客',
      scope: AccessScope.CUSTOMER_SCOPE,
      description: '僅能檢視',
      isSystem: true,
    },
  });

  console.log('✅ Customer Scope 角色創建完成');

  // ==================== 4. 分配權限給 HQ Roles ====================
  console.log('\n🔑 分配權限給 HQ Roles...');

  // SUPER_HQ: 所有 HQ_SCOPE 權限
  const hqPermissions = await prisma.permission.findMany({
    where: { scope: AccessScope.HQ_SCOPE },
  });

  for (const perm of hqPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: superHQRole.id,
          permissionId: perm.id,
        },
      },
      update: {},
      create: {
        roleId: superHQRole.id,
        permissionId: perm.id,
      },
    });
  }

  // 先清除 CONTENT_EDITOR 和 VIEWER 的既有權限
  await prisma.rolePermission.deleteMany({
    where: { roleId: contentEditorRole.id },
  });
  await prisma.rolePermission.deleteMany({
    where: { roleId: viewerRole.id },
  });

  // CONTENT_EDITOR: HQ_SCOPE 用戶管理權限
  const editorHQPermissionNames = [
    'users:read',
    'users:list',
    'users:create',
    'users:update',
    'users:delete',
    'users:restore',
    'users:reset_password',
  ];
  for (const permName of editorHQPermissionNames) {
    const perm = await prisma.permission.findFirst({
      where: { name: permName, scope: AccessScope.HQ_SCOPE },
    });
    if (perm) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: contentEditorRole.id,
            permissionId: perm.id,
          },
        },
        update: {},
        create: {
          roleId: contentEditorRole.id,
          permissionId: perm.id,
        },
      });
    }
  }

  // CONTENT_EDITOR: CUSTOMER_SCOPE 編輯用戶
  const editorCustomerPermissionNames = [
    'users:read',
    'users:list',
    'users:create',
    'users:update',
    'users:delete',
    'users:reset_password',
    'roles:manage',
  ];
  for (const permName of editorCustomerPermissionNames) {
    const perm = await prisma.permission.findFirst({
      where: { name: permName, scope: AccessScope.CUSTOMER_SCOPE },
    });
    if (perm) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: contentEditorRole.id,
            permissionId: perm.id,
          },
        },
        update: {},
        create: {
          roleId: contentEditorRole.id,
          permissionId: perm.id,
        },
      });
    }
  }

  // VIEWER: HQ_SCOPE 查詢權限
  const viewerHQPermissionNames = [
    'users:read',
    'users:list',
    'audit-logs:read',
    'roles:read',
  ];
  for (const permName of viewerHQPermissionNames) {
    const perm = await prisma.permission.findFirst({
      where: { name: permName, scope: AccessScope.HQ_SCOPE },
    });
    if (perm) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: viewerRole.id,
            permissionId: perm.id,
          },
        },
        update: {},
        create: {
          roleId: viewerRole.id,
          permissionId: perm.id,
        },
      });
    }
  }

  // VIEWER: CUSTOMER_SCOPE 查詢權限
  const viewerCustomerPermissionNames = ['users:read', 'users:list'];
  for (const permName of viewerCustomerPermissionNames) {
    const perm = await prisma.permission.findFirst({
      where: { name: permName, scope: AccessScope.CUSTOMER_SCOPE },
    });
    if (perm) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: viewerRole.id,
            permissionId: perm.id,
          },
        },
        update: {},
        create: {
          roleId: viewerRole.id,
          permissionId: perm.id,
        },
      });
    }
  }

  console.log('✅ HQ 權限分配完成');

  // ==================== 5. 分配權限給 Customer Roles ====================
  console.log('\n🔑 分配權限給 Customer Roles...');

  // OWNER: 所有 CUSTOMER_SCOPE 權限
  const customerPermissions = await prisma.permission.findMany({
    where: { scope: AccessScope.CUSTOMER_SCOPE },
  });

  for (const perm of customerPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: ownerRole.id,
          permissionId: perm.id,
        },
      },
      update: {},
      create: {
        roleId: ownerRole.id,
        permissionId: perm.id,
      },
    });
  }

  // MANAGER: 用戶管理
  await prisma.rolePermission.deleteMany({ where: { roleId: managerRole.id } });
  const managerPermissionNames = [
    'users:read',
    'users:list',
    'users:create',
    'users:update',
    'users:delete',
    'users:reset_password',
  ];
  for (const permName of managerPermissionNames) {
    const perm = await prisma.permission.findFirst({
      where: { name: permName, scope: AccessScope.CUSTOMER_SCOPE },
    });
    if (perm) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: managerRole.id,
            permissionId: perm.id,
          },
        },
        update: {},
        create: {
          roleId: managerRole.id,
          permissionId: perm.id,
        },
      });
    }
  }

  // MEMBER: 一般成員，僅查詢
  await prisma.rolePermission.deleteMany({ where: { roleId: memberRole.id } });
  const memberPermissionNames = ['users:read', 'users:list'];
  for (const permName of memberPermissionNames) {
    const perm = await prisma.permission.findFirst({
      where: { name: permName, scope: AccessScope.CUSTOMER_SCOPE },
    });
    if (perm) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: memberRole.id,
            permissionId: perm.id,
          },
        },
        update: {},
        create: {
          roleId: memberRole.id,
          permissionId: perm.id,
        },
      });
    }
  }

  // GUEST: 無任何權限
  await prisma.rolePermission.deleteMany({
    where: { roleId: guestRole.id },
  });

  console.log('✅ Customer 權限分配完成');

  // ==================== 6. 創建 Cron Job 配置 ====================
  await seedCronJobConfigs(prisma);
}
