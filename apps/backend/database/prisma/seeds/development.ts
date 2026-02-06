import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

export async function seedDevelopment(prisma: PrismaClient) {
  // ==================== 6. 創建測試使用者 ====================
  console.log('\n👥 創建測試使用者...');

  const hashedPassword = await bcrypt.hash('Password123!', 10);

  // 取得角色
  const superAdminRole = await prisma.role.findFirstOrThrow({
    where: { name: 'SUPER_ADMIN', scope: 'ADMIN_SCOPE' },
  });
  const contentEditorRole = await prisma.role.findFirstOrThrow({
    where: { name: 'CONTENT_EDITOR', scope: 'ADMIN_SCOPE' },
  });
  const ownerRole = await prisma.role.findFirstOrThrow({
    where: { name: 'OWNER', scope: 'CUSTOMER_SCOPE' },
  });
  const memberRole = await prisma.role.findFirstOrThrow({
    where: { name: 'MEMBER', scope: 'CUSTOMER_SCOPE' },
  });

  // Super Admin 使用者
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Super Admin',
      accessScopes: ['ADMIN_SCOPE'],
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: superAdminRole.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: superAdminRole.id,
    },
  });

  // Customer Owner 使用者
  const customerUser = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      email: 'customer@example.com',
      password: hashedPassword,
      name: 'Customer Owner',
      accessScopes: ['CUSTOMER_SCOPE'],
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: customerUser.id,
        roleId: ownerRole.id,
      },
    },
    update: {},
    create: {
      userId: customerUser.id,
      roleId: ownerRole.id,
    },
  });

  // 混合使用者 (Admin + Customer)
  const hybridUser = await prisma.user.upsert({
    where: { email: 'hybrid@example.com' },
    update: {},
    create: {
      email: 'hybrid@example.com',
      password: hashedPassword,
      name: 'Hybrid User',
      accessScopes: ['ADMIN_SCOPE', 'CUSTOMER_SCOPE'],
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: hybridUser.id,
        roleId: contentEditorRole.id,
      },
    },
    update: {},
    create: {
      userId: hybridUser.id,
      roleId: contentEditorRole.id,
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: hybridUser.id,
        roleId: memberRole.id,
      },
    },
    update: {},
    create: {
      userId: hybridUser.id,
      roleId: memberRole.id,
    },
  });

  // Public 使用者
  const publicUser = await prisma.user.upsert({
    where: { email: 'public@example.com' },
    update: {},
    create: {
      email: 'public@example.com',
      password: hashedPassword,
      name: 'Public User',
      accessScopes: ['PUBLIC_SCOPE'],
    },
  });

  console.log('✅ 測試使用者創建完成');

  // ==================== 7. 創建測試 Profile ====================
  console.log('\n📝 創建測試 Profile...');

  await prisma.profile.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: {
      userId: adminUser.id,
      bio: 'Super Admin of the system',
      phone: '+886-912-345-678',
      address: 'Taipei, Taiwan',
      website: 'https://admin.example.com',
      language: 'zh-TW',
    },
  });

  await prisma.profile.upsert({
    where: { userId: customerUser.id },
    update: {},
    create: {
      userId: customerUser.id,
      bio: 'Customer Owner account',
      phone: '+886-922-345-678',
      address: 'Taichung, Taiwan',
      website: 'https://customer.example.com',
      language: 'zh-TW',
    },
  });

  await prisma.profile.upsert({
    where: { userId: hybridUser.id },
    update: {},
    create: {
      userId: hybridUser.id,
      bio: 'Hybrid user with multiple scopes',
      phone: '+886-932-345-678',
      address: 'Kaohsiung, Taiwan',
      language: 'en',
    },
  });

  await prisma.profile.upsert({
    where: { userId: publicUser.id },
    update: {},
    create: {
      userId: publicUser.id,
      bio: 'Public user account',
      language: 'en',
    },
  });

  console.log('✅ 測試 Profile 創建完成');

  console.log('\n測試帳號：');
  console.log('  - admin@example.com (SUPER_ADMIN in ADMIN_SCOPE)');
  console.log('  - customer@example.com (OWNER in CUSTOMER_SCOPE)');
  console.log(
    '  - hybrid@example.com (CONTENT_EDITOR in ADMIN + MEMBER in CUSTOMER)',
  );
  console.log('  - public@example.com (PUBLIC_SCOPE only, no roles)');
  console.log('  密碼: Password123!');
}
