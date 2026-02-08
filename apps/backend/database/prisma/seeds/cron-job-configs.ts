/**
 * Cron Job Configs Seed
 * 為現有的 Cron Jobs 創建初始配置
 */

import { PrismaClient } from '@prisma/client';

export async function seedCronJobConfigs(prismaInstance?: PrismaClient) {
  const prisma = prismaInstance || new PrismaClient();
  console.log('\n⏰ 創建 Cron Job 配置...');

  const configs = [
    {
      jobName: 'cleanup-expired-sessions',
      displayName: '清理過期會話',
      description: '定期掃描並標記所有過期的用戶會話，維護資料庫清潔',
      jobType: 'cleanup',
      category: 'maintenance',
      cronExpression: '0 */6 * * *',
      timeZone: 'Asia/Taipei',
      isEnabled: true,
      alertOnFailure: true,
      alertOnTimeout: true,
      failureThreshold: 3,
      timeoutThresholdMs: 600000, // 10 分鐘
      alertRecipients: ['system'],
      alertMethods: ['system', 'email'],
      maxExecutionTimeMs: 600000,
      retryOnFailure: false,
      maxRetries: 0,
      retryDelayMs: 60000,
      concurrencyControl: true,
    },
    {
      jobName: 'cleanup-audit-logs',
      displayName: '歸檔審計日誌',
      description: '刪除超過 180 天的舊審計日誌，以維持資料庫效能和儲存空間',
      jobType: 'archiving',
      category: 'maintenance',
      cronExpression: '0 0 * * 0',
      timeZone: 'Asia/Taipei',
      isEnabled: true,
      alertOnFailure: true,
      alertOnTimeout: true,
      failureThreshold: 2,
      timeoutThresholdMs: 1800000, // 30 分鐘
      alertRecipients: ['system'],
      alertMethods: ['system', 'email'],
      maxExecutionTimeMs: 1800000,
      retryOnFailure: false,
      maxRetries: 0,
      retryDelayMs: 60000,
      concurrencyControl: true,
    },
    {
      jobName: 'cleanup-old-notifications',
      displayName: '清理舊通知',
      description: '刪除已讀且超過 30 天的舊通知，保持資料庫整潔',
      jobType: 'cleanup',
      category: 'maintenance',
      cronExpression: '0 2 * * *',
      timeZone: 'Asia/Taipei',
      isEnabled: true,
      alertOnFailure: true,
      alertOnTimeout: true,
      failureThreshold: 3,
      timeoutThresholdMs: 600000, // 10 分鐘
      alertRecipients: ['system'],
      alertMethods: ['system'],
      maxExecutionTimeMs: 600000,
      retryOnFailure: false,
      maxRetries: 0,
      retryDelayMs: 60000,
      concurrencyControl: true,
    },
  ];

  for (const config of configs) {
    await prisma.cronJobConfig.upsert({
      where: { jobName: config.jobName },
      update: {
        displayName: config.displayName,
        description: config.description,
        cronExpression: config.cronExpression,
        alertOnFailure: config.alertOnFailure,
        alertOnTimeout: config.alertOnTimeout,
        failureThreshold: config.failureThreshold,
        timeoutThresholdMs: config.timeoutThresholdMs,
      },
      create: config,
    });

    console.log(`  ✓ Created/Updated config for: ${config.jobName}`);
  }

  console.log('✅ Cron Job 配置創建完成');

  // 只有在直接執行時才斷開連接
  if (!prismaInstance) {
    await prisma.$disconnect();
  }
}

// 如果直接執行此檔案
if (require.main === module) {
  seedCronJobConfigs().catch((e) => {
    console.error('❌ Error seeding cron job configs:', e);
    process.exit(1);
  });
}
