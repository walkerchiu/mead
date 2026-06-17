import { PrismaClient, AccessScope } from '@prisma/client';
import * as bcrypt from 'bcrypt';

/**
 * 開發 / UAT / 本機測試帳號（對齊 .NET 模板 nptc DataSeeder 的 12 個角色帳號，跟隨 npt）。
 *
 * 每個系統角色一個帳號，命名規則：
 *   - accountName：<scope>_<role>（小寫），如 hq_owner / cust_admin / pub_guest
 *   - email：<scope>-<role>@example.com
 *   - 單一角色、accessScopes = 該角色 scope、首登強制改密（mustChangePassword=true）
 *   - 密碼一律 Password123!
 */

interface AccountSpec {
  accountName: string;
  email: string;
  name: string;
  scope: AccessScope;
  roleName: string;
}

const SCOPE_KEY: Record<AccessScope, string> = {
  HQ_SCOPE: 'hq',
  CUSTOMER_SCOPE: 'cust',
  PUBLIC_SCOPE: 'pub',
};

const SCOPE_LABEL: Record<AccessScope, string> = {
  HQ_SCOPE: '總部',
  CUSTOMER_SCOPE: '客戶',
  PUBLIC_SCOPE: '終端',
};

const ROLE_LABEL: Record<string, string> = {
  OWNER: '擁有者',
  ADMIN: '系統管理員',
  MANAGER: '管理者',
  OPERATOR: '操作者',
  VIEWER: '檢視者',
  MEMBER: '成員',
  GUEST: '訪客',
};

// VIEWER 在 HQ 與 customer/public 用字不同（對齊角色 displayName）：
// HQ scope = 檢視員、其餘 = 檢視者。帳號名稱須與角色 displayName 一致。
function roleLabel(scope: AccessScope, roleName: string): string {
  if (roleName === 'VIEWER' && scope === AccessScope.HQ_SCOPE) return '檢視員';
  return ROLE_LABEL[roleName];
}

function buildAccounts(): AccountSpec[] {
  const fiveTier = ['OWNER', 'ADMIN', 'MANAGER', 'OPERATOR', 'VIEWER'];
  const matrix: Array<{ scope: AccessScope; roles: string[] }> = [
    { scope: AccessScope.HQ_SCOPE, roles: fiveTier },
    { scope: AccessScope.CUSTOMER_SCOPE, roles: fiveTier },
    { scope: AccessScope.PUBLIC_SCOPE, roles: ['MEMBER', 'GUEST'] },
  ];
  const accounts: AccountSpec[] = [];
  for (const { scope, roles } of matrix) {
    const sk = SCOPE_KEY[scope];
    for (const roleName of roles) {
      const rk = roleName.toLowerCase();
      accounts.push({
        accountName: `${sk}_${rk}`,
        email: `${sk}-${rk}@example.com`,
        name: `${SCOPE_LABEL[scope]}${roleLabel(scope, roleName)}`,
        scope,
        roleName,
      });
    }
  }
  return accounts;
}

export async function seedDevelopment(prisma: PrismaClient) {
  console.log('\n👥 創建測試用戶（12 個角色帳號）...');

  const hashedPassword = await bcrypt.hash('Password123!', 10);
  const accounts = buildAccounts();

  for (const spec of accounts) {
    const role = await prisma.role.findFirstOrThrow({
      where: { name: spec.roleName, scope: spec.scope },
    });

    const user = await prisma.user.upsert({
      where: { accountName: spec.accountName },
      update: {
        email: spec.email,
        name: spec.name,
        accessScopes: [spec.scope],
        mustChangePassword: true,
        deletedAt: null,
      },
      create: {
        accountName: spec.accountName,
        email: spec.email,
        name: spec.name,
        password: hashedPassword,
        accessScopes: [spec.scope],
        mustChangePassword: true,
      },
    });

    // 重設角色：清空後指派唯一的 canonical 角色（確保與 5 階模型一致）。
    await prisma.userRole.deleteMany({ where: { userId: user.id } });
    await prisma.userRole.create({
      data: { userId: user.id, roleId: role.id },
    });

    await prisma.profile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        bio: `${spec.name}（示範帳號）`,
        language: 'zh-TW',
      },
    });
  }

  // 清除舊版示範帳號（已被 12 個角色帳號取代）。
  // 注意：不可含 hq_admin——新模型亦使用該 accountName（HQ ADMIN），upsert 已就地轉換，
  // 列入清除會把剛建好的帳號刪掉。僅清除名稱不在新集合中的舊帳號。
  const obsoleteAccountNames = ['customer_admin', 'public_user'];
  const removed = await prisma.user.deleteMany({
    where: { accountName: { in: obsoleteAccountNames } },
  });
  if (removed.count > 0) {
    console.log(`🗑️  清理 ${removed.count} 個舊版示範帳號`);
  }

  console.log('✅ 測試用戶創建完成');
  console.log(
    '\n測試帳號（登入身分為「帳號」，非 email；密碼 Password123!）：',
  );
  for (const spec of accounts) {
    console.log(
      `  - ${spec.accountName.padEnd(13)} (${spec.email}, ${spec.scope} / ${spec.roleName})`,
    );
  }
}
