import { PrismaClient } from '@prisma/client';
import { seedBase } from './seeds/base';
import { seedDevelopment } from './seeds/development';

const prisma = new PrismaClient();

async function main() {
  const env = process.env.MEAD_ENV || process.env.NODE_ENV || 'development';

  console.log(`🌱 開始 Seed 資料...（環境: ${env}）`);

  // 所有環境都載入結構性資料（權限、角色、角色權限對應）
  await seedBase(prisma);

  if (env === 'production') {
    console.log('\n⚠️  Production 環境：僅載入結構性資料，跳過測試帳號');
  } else {
    // local / development / uat 共用同一組測試帳號
    await seedDevelopment(prisma);
  }

  console.log('\n🎉 Seed 完成！\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed 失敗:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
