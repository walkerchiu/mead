/**
 * 測試腳本：手動觸發審計日誌歸檔 Cron Job
 *
 * 使用方法:
 * 1. 確保 backend 正在運行
 * 2. 執行: npx ts-node src/scripts/test-audit-log-archiving.ts
 *
 * 這個腳本會：
 * - 連接到資料庫
 * - 查詢超過 180 天的舊審計日誌
 * - 顯示清理結果（模擬模式）
 * - 可選：實際執行清理
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testAuditLogArchiving() {
  console.log('🧹 開始測試審計日誌歸檔...\n');

  const startTime = Date.now();
  const retentionDays = 180;

  try {
    // 1. 計算截止日期
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    console.log(`📅 保留期限: ${retentionDays} 天`);
    console.log(`📅 截止日期: ${cutoffDate.toISOString()}\n`);

    // 2. 查詢超過保留期限的審計日誌
    const oldLogs = await prisma.auditLog.findMany({
      where: {
        timestamp: {
          lt: cutoffDate,
        },
      },
      take: 10, // 只查詢前 10 筆作為範例
      orderBy: {
        timestamp: 'asc',
      },
    });

    // 3. 統計總數
    const totalOldLogs = await prisma.auditLog.count({
      where: {
        timestamp: {
          lt: cutoffDate,
        },
      },
    });

    console.log(
      `📊 找到 ${totalOldLogs} 筆超過 ${retentionDays} 天的審計日誌\n`,
    );

    if (totalOldLogs === 0) {
      console.log('✅ 沒有需要歸檔的審計日誌');
      return;
    }

    // 4. 顯示前 10 筆範例
    console.log('📋 前 10 筆舊審計日誌：');
    oldLogs.forEach((log, index) => {
      console.log(
        `  ${index + 1}. ${log.action} - ${log.entity} - ${log.timestamp.toISOString()}`,
      );
    });
    console.log('');

    // 5. 模擬清理流程
    console.log('📝 模擬清理流程：');
    console.log(`  1. 刪除 ${totalOldLogs} 筆超過 ${retentionDays} 天的記錄`);
    console.log('  2. 清除相關快取');
    console.log('  3. 記錄清理結果');
    console.log('');

    console.log('⚠️  這將會永久刪除這些審計日誌');
    console.log('⚠️  如需實際執行，請取消下方程式碼的註解');
    console.log('');

    // 6. 實際執行（取消下面的註解來真正執行）
    /*
    const result = await prisma.auditLog.deleteMany({
      where: {
        timestamp: {
          lt: cutoffDate,
        },
      },
    });

    console.log(`\n✅ 成功刪除 ${result.count} 筆審計日誌`);
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

testAuditLogArchiving()
  .then(() => {
    console.log('\n✅ 測試完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ 測試失敗:', error);
    process.exit(1);
  });
