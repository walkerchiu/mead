import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

export async function seedUat(prisma: PrismaClient) {
  console.log('\n👥 創建 UAT 測試使用者...');

  const hashedPassword = await bcrypt.hash('Password123!', 10);

  // 取得角色
  const superAdminRole = await prisma.role.findFirstOrThrow({
    where: { name: 'SUPER_ADMIN', scope: 'ADMIN_SCOPE' },
  });

  // UAT Admin 使用者
  const uatAdmin = await prisma.user.upsert({
    where: { email: 'uat-admin@example.com' },
    update: {},
    create: {
      email: 'uat-admin@example.com',
      password: hashedPassword,
      name: 'UAT Admin',
      accessScopes: ['ADMIN_SCOPE'],
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: uatAdmin.id,
        roleId: superAdminRole.id,
      },
    },
    update: {},
    create: {
      userId: uatAdmin.id,
      roleId: superAdminRole.id,
    },
  });

  console.log('✅ UAT 測試使用者創建完成');

  console.log('\nUAT 測試帳號：');
  console.log('  - uat-admin@example.com (SUPER_ADMIN in ADMIN_SCOPE)');
  console.log('  密碼: Password123!');
}
