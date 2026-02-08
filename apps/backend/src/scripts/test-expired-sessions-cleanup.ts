/**
 * 測試腳本：手動觸發過期會話清理 Cron Job
 *
 * 使用方法:
 * 1. 確保 backend 正在運行
 * 2. 執行: npx ts-node src/scripts/test-expired-sessions-cleanup.ts
 *
 * 這個腳本會：
 * - 連接到資料庫
 * - 手動觸發過期會話清理邏輯
 * - 顯示清理結果
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testExpiredSessionsCleanup() {
  console.log('🧹 開始測試過期會話清理...\n');

  const startTime = Date.now();
  const now = new Date();

  try {
    // 1. 查詢所有過期但尚未標記的會話
    const expiredSessions = await prisma.session.findMany({
      where: {
        expiresAt: { lt: now },
        revokedAt: null,
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

    console.log(`📊 找到 ${expiredSessions.length} 個過期會話需要處理\n`);

    if (expiredSessions.length === 0) {
      console.log('✅ 沒有過期會話需要處理');
      return;
    }

    // 2. 顯示前 5 個過期會話的詳情
    console.log('📋 前 5 個過期會話：');
    expiredSessions.slice(0, 5).forEach((session, index) => {
      console.log(
        `  ${index + 1}. ${session.user.email} - 過期時間: ${session.expiresAt.toISOString()}`,
      );
    });
    console.log('');

    // 3. 確認是否要繼續
    console.log('⚠️  這將會標記這些會話為 AUTO_EXPIRE');
    console.log('⚠️  並記錄審計日誌');
    console.log('');

    // 模擬處理（不實際執行，只顯示會做什麼）
    console.log('📝 模擬處理流程：');
    console.log('  1. 更新 revokedAt = now');
    console.log('  2. 更新 revokedMethod = AUTO_EXPIRE');
    console.log('  3. 更新 revokedReason = "Session expired automatically"');
    console.log('  4. 記錄 SESSION_EXPIRED 審計日誌');
    console.log('');

    // 4. 實際執行（取消下面的註解來真正執行）
    /*
    let successCount = 0;
    const batchSize = 100;

    for (let i = 0; i < expiredSessions.length; i += batchSize) {
      const batch = expiredSessions.slice(i, i + batchSize);

      await prisma.$transaction(async (tx) => {
        for (const session of batch) {
          await tx.session.update({
            where: { id: session.id },
            data: {
              revokedAt: now,
              revokedMethod: RevokedMethod.AUTO_EXPIRE,
              revokedReason: 'Session expired automatically',
            },
          });

          // 記錄審計日誌
          await tx.auditLog.create({
            data: {
              requestId: crypto.randomUUID(),
              userId: session.userId,
              action: 'SESSION_EXPIRED',
              entity: 'Session',
              entityId: session.id,
              status: 'SUCCESS',
              details: {
                reason: 'Session expired automatically',
                revokedMethod: RevokedMethod.AUTO_EXPIRE,
                expiresAt: session.expiresAt,
                deviceInfo: session.deviceInfo,
                ipAddress: session.ipAddress,
              },
            },
          });

          successCount++;
        }
      });

      console.log(`  處理批次 ${i / batchSize + 1}: ${batch.length} 個會話`);
    }

    console.log(`\n✅ 成功處理 ${successCount} 個過期會話`);
    */

    const duration = Date.now() - startTime;
    console.log(`⏱️  執行時間: ${duration}ms`);
  } catch (error) {
    console.error('❌ 錯誤:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testExpiredSessionsCleanup()
  .then(() => {
    console.log('\n✅ 測試完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ 測試失敗:', error);
    process.exit(1);
  });
