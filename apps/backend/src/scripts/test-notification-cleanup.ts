/**
 * 測試腳本：手動觸發通知清理 Cron Job
 *
 * 使用方法:
 * 1. 確保 backend 正在運行
 * 2. 執行: npx ts-node src/scripts/test-notification-cleanup.ts
 *
 * 這個腳本會：
 * - 連接到資料庫
 * - 查詢已讀且超過 30 天的舊通知
 * - 顯示清理結果（模擬模式）
 * - 可選：實際執行清理
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testNotificationCleanup() {
  console.log('🧹 開始測試通知清理...\n');

  const startTime = Date.now();
  const retentionDays = 30;

  try {
    // 1. 計算截止日期
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    console.log(`📅 保留期限: ${retentionDays} 天（僅針對已讀通知）`);
    console.log(`📅 截止日期: ${cutoffDate.toISOString()}\n`);

    // 2. 查詢已讀且超過保留期限的通知
    const oldNotifications = await prisma.notification.findMany({
      where: {
        isRead: true,
        readAt: {
          lte: cutoffDate,
        },
      },
      take: 10, // 只查詢前 10 筆作為範例
      orderBy: {
        readAt: 'asc',
      },
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });

    // 3. 統計總數
    const totalOldNotifications = await prisma.notification.count({
      where: {
        isRead: true,
        readAt: {
          lte: cutoffDate,
        },
      },
    });

    console.log(
      `📊 找到 ${totalOldNotifications} 筆已讀且超過 ${retentionDays} 天的通知\n`,
    );

    if (totalOldNotifications === 0) {
      console.log('✅ 沒有需要清理的通知');
      return;
    }

    // 4. 顯示前 10 筆範例
    console.log('📋 前 10 筆舊通知：');
    oldNotifications.forEach((notification, index) => {
      const readAtStr = notification.readAt
        ? notification.readAt.toISOString()
        : 'N/A';
      console.log(
        `  ${index + 1}. ${notification.user.email} - ${notification.type} - ${readAtStr}`,
      );
      console.log(`     標題: ${notification.title}`);
    });
    console.log('');

    // 5. 統計各類型通知數量
    const notificationsByType = await prisma.notification.groupBy({
      by: ['type'],
      where: {
        isRead: true,
        readAt: {
          lte: cutoffDate,
        },
      },
      _count: {
        id: true,
      },
    });

    console.log('📊 各類型通知統計：');
    notificationsByType.forEach((group) => {
      console.log(`  ${group.type}: ${group._count.id} 筆`);
    });
    console.log('');

    // 6. 模擬清理流程
    console.log('📝 模擬清理流程：');
    console.log(
      `  1. 刪除 ${totalOldNotifications} 筆已讀且超過 ${retentionDays} 天的通知`,
    );
    console.log('  2. 記錄清理結果');
    console.log('');

    console.log('⚠️  這將會永久刪除這些通知');
    console.log('⚠️  如需實際執行，請取消下方程式碼的註解');
    console.log('');

    // 7. 實際執行（取消下面的註解來真正執行）
    /*
    const result = await prisma.notification.deleteMany({
      where: {
        isRead: true,
        readAt: {
          lte: cutoffDate,
        },
      },
    });

    console.log(`\n✅ 成功刪除 ${result.count} 筆通知`);
    */

    const duration = Date.now() - startTime;
    console.log(`⏱️  執行時間: ${duration}ms`);
  } catch (error) {
    console.error('❌ 錯誤:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

testNotificationCleanup()
  .then(() => {
    console.log('\n✅ 測試完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ 測試失敗:', error);
    process.exit(1);
  });
