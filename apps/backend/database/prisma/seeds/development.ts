import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

export async function seedDevelopment(prisma: PrismaClient) {
  // ==================== 創建測試用戶 ====================
  console.log('\n👥 創建測試用戶...');

  const hashedPassword = await bcrypt.hash('Password123!', 10);

  // 取得角色
  const superHQRole = await prisma.role.findFirstOrThrow({
    where: { name: 'SUPER_HQ', scope: 'HQ_SCOPE' },
  });
  const managerRole = await prisma.role.findFirstOrThrow({
    where: { name: 'MANAGER', scope: 'CUSTOMER_SCOPE' },
  });
  const ownerRole = await prisma.role.findFirstOrThrow({
    where: { name: 'OWNER', scope: 'CUSTOMER_SCOPE' },
  });

  // Super HQ 用戶（同時擁有 HQ_SCOPE 和 CUSTOMER_SCOPE）
  const hqUser = await prisma.user.upsert({
    where: { email: 'hq@example.com' },
    update: {
      accessScopes: ['HQ_SCOPE', 'CUSTOMER_SCOPE'],
    },
    create: {
      email: 'hq@example.com',
      password: hashedPassword,
      name: 'Super HQ',
      accessScopes: ['HQ_SCOPE', 'CUSTOMER_SCOPE'],
    },
  });

  // 賦予 HQ_SCOPE 的 SUPER_HQ 角色
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: hqUser.id,
        roleId: superHQRole.id,
      },
    },
    update: {},
    create: {
      userId: hqUser.id,
      roleId: superHQRole.id,
    },
  });

  // 賦予 CUSTOMER_SCOPE 的 MANAGER 角色
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: hqUser.id,
        roleId: managerRole.id,
      },
    },
    update: {},
    create: {
      userId: hqUser.id,
      roleId: managerRole.id,
    },
  });

  // Customer Admin 用戶（純 CUSTOMER_SCOPE，OWNER 角色）
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {
      accessScopes: ['CUSTOMER_SCOPE'],
    },
    create: {
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Customer Admin',
      accessScopes: ['CUSTOMER_SCOPE'],
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: ownerRole.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: ownerRole.id,
    },
  });

  // Public 用戶
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

  console.log('✅ 測試用戶創建完成');

  // ==================== 創建測試 Profile ====================
  console.log('\n📝 創建測試 Profile...');

  await prisma.profile.upsert({
    where: { userId: hqUser.id },
    update: {},
    create: {
      userId: hqUser.id,
      bio: 'Super HQ of the system',
      phone: '+886-912-345-678',
      address: 'Taipei, Taiwan',
      website: 'https://hq.example.com',
      language: 'zh-TW',
    },
  });

  await prisma.profile.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: {
      userId: adminUser.id,
      bio: 'Customer scope OWNER (demo admin)',
      language: 'zh-TW',
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
  console.log(
    '  - hq@example.com (SUPER_HQ in HQ_SCOPE + MANAGER in CUSTOMER_SCOPE)',
  );
  console.log('  - admin@example.com (OWNER in CUSTOMER_SCOPE)');
  console.log('  - public@example.com (PUBLIC_SCOPE only, no roles)');
  console.log('  密碼: Password123!');
}
