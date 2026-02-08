/**
 * MonitoredCron 裝飾器
 * 自動為 Cron Job 添加執行監控
 */

import { CronJobStatus } from '@prisma/client';
import { logger } from '../common/services/logger.service';

export interface MonitoredCronOptions {
  jobName: string;
  jobType: string;
  instanceId?: string;
}

/**
 * MonitoredCron 裝飾器
 * 包裝 Cron Job 方法，自動記錄執行開始/完成/失敗
 *
 * @example
 * ```typescript
 * @MonitoredCron({
 *   jobName: 'cleanup-expired-sessions',
 *   jobType: 'cleanup',
 * })
 * @Cron('0 *\/6 * * *')
 * async handleExpiredSessionsCleanup() {
 *   // your cron job logic
 * }
 * ```
 */
export function MonitoredCron(options: MonitoredCronOptions) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (this: any, ...args: any[]) {
      const monitorService = this.cronMonitorService;

      if (!monitorService) {
        logger.warn(
          `[MonitoredCron] CronJobMonitorService not found in ${target.constructor.name}`,
        );
        return originalMethod.apply(this, args);
      }

      const instanceId =
        options.instanceId || process.env.INSTANCE_ID || 'default';
      let executionId: string | null = null;

      try {
        // 記錄開始執行
        executionId = await monitorService.startExecution({
          jobName: options.jobName,
          jobType: options.jobType,
          instanceId,
        });

        // 執行原始方法
        const result = await originalMethod.apply(this, args);

        // 記錄執行成功
        await monitorService.completeExecution({
          executionId,
          status: CronJobStatus.SUCCESS,
          processedCount: result?.processedCount,
          successCount: result?.successCount,
          errorCount: result?.errorCount,
          details: result?.details,
          nextRunAt: result?.nextRunAt,
        });

        // 檢查是否需要告警
        await monitorService.checkAndAlert(executionId);

        return result;
      } catch (error) {
        logger.error(`[MonitoredCron] ${options.jobName} failed`, {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        });

        if (executionId) {
          // 記錄執行失敗
          await monitorService.completeExecution({
            executionId,
            status: CronJobStatus.FAILED,
            errorMessage:
              error instanceof Error ? error.message : String(error),
            errorStack: error instanceof Error ? error.stack : undefined,
          });

          // 檢查是否需要告警
          await monitorService.checkAndAlert(executionId);
        }

        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * 手動監控輔助函數
 * 用於在 Cron Job 中手動控制監控（例如：無法獲取鎖時記錄為 SKIPPED）
 */
export class CronMonitorHelper {
  /**
   * 記錄跳過執行（無法獲取鎖）
   */
  static async recordSkipped(
    monitorService: any,
    options: MonitoredCronOptions,
    reason: string,
  ): Promise<void> {
    const instanceId =
      options.instanceId || process.env.INSTANCE_ID || 'default';

    await monitorService.recordSkipped({
      jobName: options.jobName,
      jobType: options.jobType,
      instanceId,
      reason,
    });
  }
}
