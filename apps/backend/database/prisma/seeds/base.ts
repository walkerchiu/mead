import { PrismaClient } from '@prisma/client';

export async function seedBase(prisma: PrismaClient) {
  // ==================== 1. 創建權限 ====================
  console.log('\n📋 創建權限...');

  const permissions = [
    // Admin Scope Permissions
    {
      name: 'users:create',
      resource: 'users',
      action: 'create',
      scope: 'ADMIN_SCOPE',
    },
    {
      name: 'users:read',
      resource: 'users',
      action: 'read',
      scope: 'ADMIN_SCOPE',
    },
    {
      name: 'users:list',
      resource: 'users',
      action: 'list',
      scope: 'ADMIN_SCOPE',
    },
    {
      name: 'users:update',
      resource: 'users',
      action: 'update',
      scope: 'ADMIN_SCOPE',
    },
    {
      name: 'users:delete',
      resource: 'users',
      action: 'delete',
      scope: 'ADMIN_SCOPE',
    },
    {
      name: 'users:restore',
      resource: 'users',
      action: 'restore',
      scope: 'ADMIN_SCOPE',
    },
    {
      name: 'audit-logs:read',
      resource: 'audit-logs',
      action: 'read',
      scope: 'ADMIN_SCOPE',
    },
    {
      name: 'audit-logs:export',
      resource: 'audit-logs',
      action: 'export',
      scope: 'ADMIN_SCOPE',
    },
    {
      name: 'roles:manage',
      resource: 'roles',
      action: 'manage',
      scope: 'ADMIN_SCOPE',
    },
    {
      name: 'permissions:manage',
      resource: 'permissions',
      action: 'manage',
      scope: 'ADMIN_SCOPE',
    },

    // Session Management Permissions (Admin Scope)
    {
      name: 'sessions:read',
      resource: 'sessions',
      action: 'read',
      scope: 'ADMIN_SCOPE',
    },
    {
      name: 'sessions:read_user',
      resource: 'sessions',
      action: 'read_user',
      scope: 'ADMIN_SCOPE',
    },
    {
      name: 'sessions:read_all',
      resource: 'sessions',
      action: 'read_all',
      scope: 'ADMIN_SCOPE',
    },
    {
      name: 'sessions:revoke',
      resource: 'sessions',
      action: 'revoke',
      scope: 'ADMIN_SCOPE',
    },
    {
      name: 'sessions:revoke_user',
      resource: 'sessions',
      action: 'revoke_user',
      scope: 'ADMIN_SCOPE',
    },
    {
      name: 'sessions:revoke_batch',
      resource: 'sessions',
      action: 'revoke_batch',
      scope: 'ADMIN_SCOPE',
    },
    {
      name: 'sessions:revoke_all',
      resource: 'sessions',
      action: 'revoke_all',
      scope: 'ADMIN_SCOPE',
    },

    // Customer Scope Permissions
    {
      name: 'users:read',
      resource: 'users',
      action: 'read',
      scope: 'CUSTOMER_SCOPE',
    },
    {
      name: 'users:list',
      resource: 'users',
      action: 'list',
      scope: 'CUSTOMER_SCOPE',
    },
    {
      name: 'users:update',
      resource: 'users',
      action: 'update',
      scope: 'CUSTOMER_SCOPE',
    },
    {
      name: 'projects:create',
      resource: 'projects',
      action: 'create',
      scope: 'CUSTOMER_SCOPE',
    },
    {
      name: 'projects:read',
      resource: 'projects',
      action: 'read',
      scope: 'CUSTOMER_SCOPE',
    },
    {
      name: 'projects:update',
      resource: 'projects',
      action: 'update',
      scope: 'CUSTOMER_SCOPE',
    },
    {
      name: 'projects:delete',
      resource: 'projects',
      action: 'delete',
      scope: 'CUSTOMER_SCOPE',
    },
    {
      name: 'billing:view',
      resource: 'billing',
      action: 'view',
      scope: 'CUSTOMER_SCOPE',
    },
    {
      name: 'billing:manage',
      resource: 'billing',
      action: 'manage',
      scope: 'CUSTOMER_SCOPE',
    },

    // Public Scope Permissions (minimal)
    {
      name: 'profile:read',
      resource: 'profile',
      action: 'read',
      scope: 'PUBLIC_SCOPE',
    },
    {
      name: 'profile:update',
      resource: 'profile',
      action: 'update',
      scope: 'PUBLIC_SCOPE',
    },
  ];

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: {
        name_scope: {
          name: perm.name,
          scope: perm.scope as string,
        },
      },
      update: {},
      create: perm,
    });
  }

  console.log(`✅ 創建了 ${permissions.length} 個權限`);

  // ==================== 2. 創建 Admin Scope 角色 ====================
  console.log('\n👑 創建 Admin Scope 角色...');

  const superAdminRole = await prisma.role.upsert({
    where: { name_scope: { name: 'SUPER_ADMIN', scope: 'ADMIN_SCOPE' } },
    update: {},
    create: {
      name: 'SUPER_ADMIN',
      displayName: '超級管理員',
      scope: 'ADMIN_SCOPE',
      description: '擁有所有權限',
      isSystem: true,
    },
  });

  const contentEditorRole = await prisma.role.upsert({
    where: { name_scope: { name: 'CONTENT_EDITOR', scope: 'ADMIN_SCOPE' } },
    update: {},
    create: {
      name: 'CONTENT_EDITOR',
      displayName: '內容編輯',
      scope: 'ADMIN_SCOPE',
      description: '可管理使用者和內容',
      isSystem: true,
    },
  });

  const viewerRole = await prisma.role.upsert({
    where: { name_scope: { name: 'VIEWER', scope: 'ADMIN_SCOPE' } },
    update: {},
    create: {
      name: 'VIEWER',
      displayName: '檢視者',
      scope: 'ADMIN_SCOPE',
      description: '僅能檢視稽核日誌',
      isSystem: true,
    },
  });

  console.log('✅ Admin Scope 角色創建完成');

  // ==================== 3. 創建 Customer Scope 角色 ====================
  console.log('\n👤 創建 Customer Scope 角色...');

  const ownerRole = await prisma.role.upsert({
    where: { name_scope: { name: 'OWNER', scope: 'CUSTOMER_SCOPE' } },
    update: {},
    create: {
      name: 'OWNER',
      displayName: '擁有者',
      scope: 'CUSTOMER_SCOPE',
      description: '擁有所有客戶端權限',
      isSystem: true,
    },
  });

  const memberRole = await prisma.role.upsert({
    where: { name_scope: { name: 'MEMBER', scope: 'CUSTOMER_SCOPE' } },
    update: {},
    create: {
      name: 'MEMBER',
      displayName: '成員',
      scope: 'CUSTOMER_SCOPE',
      description: '可建立和編輯專案',
      isSystem: true,
    },
  });

  const guestRole = await prisma.role.upsert({
    where: { name_scope: { name: 'GUEST', scope: 'CUSTOMER_SCOPE' } },
    update: {},
    create: {
      name: 'GUEST',
      displayName: '訪客',
      scope: 'CUSTOMER_SCOPE',
      description: '僅能檢視',
      isSystem: true,
    },
  });

  console.log('✅ Customer Scope 角色創建完成');

  // ==================== 4. 分配權限給 Admin Roles ====================
  console.log('\n🔑 分配權限給 Admin Roles...');

  // SUPER_ADMIN: 所有 ADMIN_SCOPE 權限
  const adminPermissions = await prisma.permission.findMany({
    where: { scope: 'ADMIN_SCOPE' },
  });

  for (const perm of adminPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: superAdminRole.id,
          permissionId: perm.id,
        },
      },
      update: {},
      create: {
        roleId: superAdminRole.id,
        permissionId: perm.id,
      },
    });
  }

  // CONTENT_EDITOR: users:*, audit-logs:read, sessions (limited)
  const editorPermissionNames = [
    'users:create',
    'users:read',
    'users:list',
    'users:update',
    'users:delete',
    'users:restore',
    'audit-logs:read',
    'sessions:read',
    'sessions:read_user',
    'sessions:revoke',
    'sessions:revoke_user',
  ];
  for (const permName of editorPermissionNames) {
    const perm = await prisma.permission.findFirst({
      where: { name: permName, scope: 'ADMIN_SCOPE' },
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

  // VIEWER: audit-logs:read
  const viewerPerm = await prisma.permission.findFirst({
    where: { name: 'audit-logs:read', scope: 'ADMIN_SCOPE' },
  });
  if (viewerPerm) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: viewerRole.id,
          permissionId: viewerPerm.id,
        },
      },
      update: {},
      create: {
        roleId: viewerRole.id,
        permissionId: viewerPerm.id,
      },
    });
  }

  console.log('✅ Admin 權限分配完成');

  // ==================== 5. 分配權限給 Customer Roles ====================
  console.log('\n🔑 分配權限給 Customer Roles...');

  // OWNER: 所有 CUSTOMER_SCOPE 權限
  const customerPermissions = await prisma.permission.findMany({
    where: { scope: 'CUSTOMER_SCOPE' },
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

  // MEMBER: projects:*, users:read
  const memberPermissionNames = [
    'projects:create',
    'projects:read',
    'projects:update',
    'projects:delete',
    'users:read',
    'users:list',
  ];
  for (const permName of memberPermissionNames) {
    const perm = await prisma.permission.findFirst({
      where: { name: permName, scope: 'CUSTOMER_SCOPE' },
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

  // GUEST: projects:read, users:read
  const guestPermissionNames = ['projects:read', 'users:read'];
  for (const permName of guestPermissionNames) {
    const perm = await prisma.permission.findFirst({
      where: { name: permName, scope: 'CUSTOMER_SCOPE' },
    });
    if (perm) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: guestRole.id,
            permissionId: perm.id,
          },
        },
        update: {},
        create: {
          roleId: guestRole.id,
          permissionId: perm.id,
        },
      });
    }
  }

  console.log('✅ Customer 權限分配完成');
}
