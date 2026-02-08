/**
 * Cron Job 監控服務
 * 負責記錄和追蹤 Cron Job 執行狀態
 */

import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { PrismaService } from '../prisma/prisma.service';
import { CronJobStatus } from '@prisma/client';
import { AlertService } from './alert.service';
import { CronJobPubSubService } from './cron-job-pubsub.service';
import { RequestContextService } from '../common/request-context/request-context.service';
import {
  StartExecutionParams,
  CompleteExecutionParams,
  RecordSkippedParams,
  GetExecutionHistoryParams,
  ExecutionHistoryResult,
  GetExecutionStatisticsParams,
  ExecutionStatistics,
  UpdateJobConfigParams,
  JobConfig,
  ExecutionRecord,
  JobNameStatistics,
  JobTypeStatistics,
} from './cron-job-monitor.types';

@Injectable()
export class CronJobMonitorService {
  private readonly logger = new Logger(CronJobMonitorService.name);
  private auditLogService: any; // Lazy loaded to avoid circular dependency

  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => AlertService))
    private readonly alertService: AlertService,
    private readonly moduleRef: ModuleRef,
    @Inject(forwardRef(() => CronJobPubSubService))
    private readonly pubSubService: CronJobPubSubService,
    private readonly requestContext: RequestContextService,
  ) {}

  /**
   * 開始執行 - 創建執行記錄
   */
  async startExecution(params: StartExecutionParams): Promise<string> {
    const { jobName, jobType, instanceId, lockId } = params;

    try {
      // 檢查 Job 是否啟用
      const config = await this.prisma.cronJobConfig.findUnique({
        where: { jobName },
      });

      if (config && !config.isEnabled) {
        this.logger.warn(`[CronMonitor] Job is disabled, skipping execution`, {
          jobName,
          instanceId,
        });
        throw new Error(`Job is disabled: ${jobName}`);
      }

      const execution = await this.prisma.cronJobExecution.create({
        data: {
          jobName,
          jobType,
          instanceId,
          lockId,
          status: CronJobStatus.RUNNING,
          startedAt: new Date(),
        },
      });

      this.logger.log(`[CronMonitor] Execution started`, {
        executionId: execution.id,
        jobName,
        jobType,
        instanceId,
      });

      // 📝 創建審計日誌：排程執行開始
      await this.createAuditLog({
        userId: undefined, // 排程執行沒有用戶
        action: 'CRON_JOB_STARTED',
        entity: 'CronJob',
        entityId: jobName,
        status: 'SUCCESS',
        details: {
          jobName,
          jobType,
          executionId: execution.id,
          instanceId,
        },
      });

      return execution.id;
    } catch (error) {
      this.logger.error(`[CronMonitor] Failed to start execution`, {
        jobName,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * 完成執行 - 更新執行記錄
   */
  async completeExecution(params: CompleteExecutionParams): Promise<void> {
    const {
      executionId,
      status,
      processedCount,
      successCount,
      errorCount,
      details,
      errorMessage,
      errorStack,
      nextRunAt,
    } = params;

    try {
      // 獲取執行記錄以計算 duration
      const execution = await this.prisma.cronJobExecution.findUnique({
        where: { id: executionId },
      });

      if (!execution) {
        throw new Error(`Execution ${executionId} not found`);
      }

      const completedAt = new Date();
      const duration = completedAt.getTime() - execution.startedAt.getTime();

      // 更新執行記錄
      const updatedExecution = await this.prisma.cronJobExecution.update({
        where: { id: executionId },
        data: {
          status,
          completedAt,
          duration,
          processedCount,
          successCount,
          errorCount,
          details,
          errorMessage,
          errorStack,
          nextRunAt,
        },
      });

      // 更新 Job 配置統計
      await this.updateJobConfigStats(
        execution.jobName,
        status,
        duration,
        errorMessage,
        nextRunAt,
      );

      this.logger.log(`[CronMonitor] Execution completed`, {
        executionId,
        jobName: execution.jobName,
        status,
        duration,
        processedCount,
        errorCount,
      });

      // 🔔 發布執行記錄創建事件（用於 GraphQL Subscription）
      try {
        await this.pubSubService.emitExecutionCreated(updatedExecution);
      } catch (error) {
        this.logger.warn(
          '[CronMonitor] Failed to emit execution created event',
          {
            error: error instanceof Error ? error.message : String(error),
          },
        );
      }

      // 📝 創建審計日誌：排程執行完成
      await this.createAuditLog({
        userId: undefined, // 排程執行沒有用戶，使用 undefined
        action: 'CRON_JOB_EXECUTED',
        entity: 'CronJob',
        entityId: execution.jobName,
        status: status === CronJobStatus.SUCCESS ? 'SUCCESS' : 'FAILURE',
        details: {
          jobName: execution.jobName,
          jobType: execution.jobType,
          executionId,
          status,
          duration,
          processedCount,
          successCount,
          errorCount,
          errorMessage: errorMessage || undefined,
        },
      });
    } catch (error) {
      this.logger.error(`[CronMonitor] Failed to complete execution`, {
        executionId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * 記錄跳過執行（無法獲取鎖）
   */
  async recordSkipped(params: RecordSkippedParams): Promise<void> {
    const { jobName, jobType, instanceId, reason, nextRunAt } = params;

    try {
      await this.prisma.cronJobExecution.create({
        data: {
          jobName,
          jobType,
          instanceId,
          status: CronJobStatus.SKIPPED,
          startedAt: new Date(),
          completedAt: new Date(),
          duration: 0,
          errorMessage: reason,
          nextRunAt,
        },
      });

      this.logger.log(`[CronMonitor] Execution skipped`, {
        jobName,
        reason,
        instanceId,
      });
    } catch (error) {
      this.logger.error(`[CronMonitor] Failed to record skipped execution`, {
        jobName,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * 查詢執行歷史（分頁）
   */
  async getExecutionHistory(
    params: GetExecutionHistoryParams,
  ): Promise<ExecutionHistoryResult> {
    console.error('🚀🚀🚀 [CronMonitor] getExecutionHistory CALLED! 🚀🚀🚀');
    this.logger.log('🚀 [CronMonitor] getExecutionHistory method invoked!', {
      params,
    });

    const {
      jobName,
      jobType,
      status,
      startDate,
      endDate,
      page = 1,
      limit = 50,
    } = params;

    try {
      const where: any = {};

      if (jobName) where.jobName = jobName;
      if (jobType) where.jobType = jobType;
      if (status) where.status = status;

      if (startDate || endDate) {
        where.startedAt = {};
        if (startDate) where.startedAt.gte = startDate;
        if (endDate) where.startedAt.lte = endDate;
      }

      console.error('🔍 [CronMonitor] Query params:', { where, page, limit });
      this.logger.log(`🔍 [CronMonitor] Querying executions with where:`, {
        where: JSON.stringify(where),
        page,
        limit,
        skip: (page - 1) * limit,
      });

      const [executions, total] = await Promise.all([
        this.prisma.cronJobExecution.findMany({
          where,
          orderBy: { startedAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
          select: {
            id: true,
            jobName: true,
            jobType: true,
            startedAt: true,
            completedAt: true,
            duration: true,
            status: true,
            processedCount: true,
            successCount: true,
            errorCount: true,
            errorMessage: true,
            instanceId: true,
          },
        }),
        this.prisma.cronJobExecution.count({ where }),
      ]);

      this.logger.log(`[CronMonitor] Execution history query result`, {
        where,
        executionsCount: executions.length,
        total,
        page,
        limit,
        firstExecution:
          executions.length > 0
            ? {
                id: executions[0].id,
                jobName: executions[0].jobName,
                status: executions[0].status,
              }
            : null,
      });

      return {
        executions: executions as ExecutionRecord[],
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      this.logger.error(`[CronMonitor] Failed to get execution history`, {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * 獲取執行統計
   */
  async getExecutionStatistics(
    params: GetExecutionStatisticsParams,
  ): Promise<ExecutionStatistics> {
    const { jobName, jobType, startDate, endDate } = params;

    try {
      const where: any = {};

      if (jobName) where.jobName = jobName;
      if (jobType) where.jobType = jobType;

      if (startDate || endDate) {
        where.startedAt = {};
        if (startDate) where.startedAt.gte = startDate;
        if (endDate) where.startedAt.lte = endDate;
      }

      // 基礎統計
      const [
        totalExecutions,
        successfulExecutions,
        failedExecutions,
        timeoutExecutions,
        skippedExecutions,
        avgDuration,
        totalProcessed,
        totalErrors,
        recentExecutions,
      ] = await Promise.all([
        this.prisma.cronJobExecution.count({ where }),
        this.prisma.cronJobExecution.count({
          where: { ...where, status: CronJobStatus.SUCCESS },
        }),
        this.prisma.cronJobExecution.count({
          where: { ...where, status: CronJobStatus.FAILED },
        }),
        this.prisma.cronJobExecution.count({
          where: { ...where, status: CronJobStatus.TIMEOUT },
        }),
        this.prisma.cronJobExecution.count({
          where: { ...where, status: CronJobStatus.SKIPPED },
        }),
        this.prisma.cronJobExecution.aggregate({
          where: { ...where, duration: { not: null } },
          _avg: { duration: true },
        }),
        this.prisma.cronJobExecution.aggregate({
          where: { ...where, processedCount: { not: null } },
          _sum: { processedCount: true },
        }),
        this.prisma.cronJobExecution.aggregate({
          where: { ...where, errorCount: { not: null } },
          _sum: { errorCount: true },
        }),
        this.prisma.cronJobExecution.findMany({
          where,
          orderBy: { startedAt: 'desc' },
          take: 10,
          select: {
            id: true,
            jobName: true,
            jobType: true,
            startedAt: true,
            completedAt: true,
            duration: true,
            status: true,
            processedCount: true,
            successCount: true,
            errorCount: true,
            errorMessage: true,
            instanceId: true,
          },
        }),
      ]);

      // 按 Job 名稱統計
      const byJobName = await this.getStatisticsByJobName(where);

      // 按 Job 類型統計
      const byJobType = await this.getStatisticsByJobType(where);

      const successRate =
        totalExecutions > 0
          ? (successfulExecutions / totalExecutions) * 100
          : 0;

      return {
        totalExecutions,
        successfulExecutions,
        failedExecutions,
        timeoutExecutions,
        skippedExecutions,
        successRate: Math.round(successRate * 100) / 100,
        averageDuration: Math.round(avgDuration._avg.duration || 0),
        totalProcessed: totalProcessed._sum.processedCount || 0,
        totalErrors: totalErrors._sum.errorCount || 0,
        byJobName,
        byJobType,
        recentExecutions: recentExecutions as ExecutionRecord[],
      };
    } catch (error) {
      this.logger.error(`[CronMonitor] Failed to get execution statistics`, {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * 按 Job 名稱統計（內部方法）
   */
  private async getStatisticsByJobName(
    baseWhere: any,
  ): Promise<JobNameStatistics[]> {
    const executions = await this.prisma.cronJobExecution.groupBy({
      by: ['jobName'],
      where: baseWhere,
      _count: { id: true },
      _avg: { duration: true },
    });

    const statistics: JobNameStatistics[] = [];

    for (const exec of executions) {
      const [successCount, failedCount, lastExecution] = await Promise.all([
        this.prisma.cronJobExecution.count({
          where: {
            ...baseWhere,
            jobName: exec.jobName,
            status: CronJobStatus.SUCCESS,
          },
        }),
        this.prisma.cronJobExecution.count({
          where: {
            ...baseWhere,
            jobName: exec.jobName,
            status: CronJobStatus.FAILED,
          },
        }),
        this.prisma.cronJobExecution.findFirst({
          where: { ...baseWhere, jobName: exec.jobName },
          orderBy: { startedAt: 'desc' },
          select: { startedAt: true, status: true },
        }),
      ]);

      statistics.push({
        jobName: exec.jobName,
        totalExecutions: exec._count.id,
        successfulExecutions: successCount,
        failedExecutions: failedCount,
        averageDuration: Math.round(exec._avg.duration || 0),
        lastExecutedAt: lastExecution?.startedAt || null,
        lastStatus: lastExecution?.status || null,
      });
    }

    return statistics;
  }

  /**
   * 按 Job 類型統計（內部方法）
   */
  private async getStatisticsByJobType(
    baseWhere: any,
  ): Promise<JobTypeStatistics[]> {
    const executions = await this.prisma.cronJobExecution.groupBy({
      by: ['jobType'],
      where: baseWhere,
      _count: { id: true },
      _avg: { duration: true },
    });

    const statistics: JobTypeStatistics[] = [];

    for (const exec of executions) {
      const [successCount, failedCount] = await Promise.all([
        this.prisma.cronJobExecution.count({
          where: {
            ...baseWhere,
            jobType: exec.jobType,
            status: CronJobStatus.SUCCESS,
          },
        }),
        this.prisma.cronJobExecution.count({
          where: {
            ...baseWhere,
            jobType: exec.jobType,
            status: CronJobStatus.FAILED,
          },
        }),
      ]);

      statistics.push({
        jobType: exec.jobType,
        totalExecutions: exec._count.id,
        successfulExecutions: successCount,
        failedExecutions: failedCount,
        averageDuration: Math.round(exec._avg.duration || 0),
      });
    }

    return statistics;
  }

  /**
   * 更新 Job 配置統計（內部方法）
   */
  private async updateJobConfigStats(
    jobName: string,
    status: CronJobStatus,
    duration: number,
    errorMessage: string | undefined,
    nextRunAt: Date | undefined,
  ): Promise<void> {
    try {
      const config = await this.prisma.cronJobConfig.findUnique({
        where: { jobName },
      });

      if (!config) {
        // 如果配置不存在，不做處理（由系統管理員手動創建配置）
        return;
      }

      const isFailure =
        status === CronJobStatus.FAILED || status === CronJobStatus.TIMEOUT;

      await this.prisma.cronJobConfig.update({
        where: { jobName },
        data: {
          lastExecutedAt: new Date(),
          lastStatus: status,
          lastDuration: duration,
          lastErrorMessage: errorMessage || null,
          nextRunAt: nextRunAt || null,
          consecutiveFailures: isFailure ? config.consecutiveFailures + 1 : 0,
          totalExecutions: config.totalExecutions + 1,
          totalFailures: isFailure
            ? config.totalFailures + 1
            : config.totalFailures,
        },
      });
    } catch (error) {
      this.logger.error(`[CronMonitor] Failed to update job config stats`, {
        jobName,
        error: error instanceof Error ? error.message : String(error),
      });
      // 不拋出錯誤，避免影響主流程
    }
  }

  /**
   * 獲取 Job 配置
   */
  async getJobConfig(jobName: string): Promise<JobConfig | null> {
    try {
      const config = await this.prisma.cronJobConfig.findUnique({
        where: { jobName },
      });

      return config as JobConfig | null;
    } catch (error) {
      this.logger.error(`[CronMonitor] Failed to get job config`, {
        jobName,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * 獲取所有 Job 配置
   */
  async getAllJobConfigs(): Promise<JobConfig[]> {
    try {
      const configs = await this.prisma.cronJobConfig.findMany({
        orderBy: { jobName: 'asc' },
      });

      return configs as JobConfig[];
    } catch (error) {
      this.logger.error(`[CronMonitor] Failed to get all job configs`, {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * 更新 Job 配置
   */
  async updateJobConfig(params: UpdateJobConfigParams): Promise<void> {
    const {
      jobName,
      lastExecutedAt,
      lastStatus,
      lastDuration,
      lastErrorMessage,
      nextRunAt,
      consecutiveFailures,
      totalExecutions,
      totalFailures,
    } = params;

    try {
      const updateData: any = {};

      if (lastExecutedAt !== undefined)
        updateData.lastExecutedAt = lastExecutedAt;
      if (lastStatus !== undefined) updateData.lastStatus = lastStatus;
      if (lastDuration !== undefined) updateData.lastDuration = lastDuration;
      if (lastErrorMessage !== undefined)
        updateData.lastErrorMessage = lastErrorMessage;
      if (nextRunAt !== undefined) updateData.nextRunAt = nextRunAt;
      if (consecutiveFailures !== undefined)
        updateData.consecutiveFailures = consecutiveFailures;
      if (totalExecutions !== undefined)
        updateData.totalExecutions = totalExecutions;
      if (totalFailures !== undefined) updateData.totalFailures = totalFailures;

      await this.prisma.cronJobConfig.update({
        where: { jobName },
        data: updateData,
      });

      this.logger.log(`[CronMonitor] Job config updated`, { jobName });
    } catch (error) {
      this.logger.error(`[CronMonitor] Failed to update job config`, {
        jobName,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * 檢查是否需要告警
   */
  async checkAndAlert(executionId: string): Promise<void> {
    try {
      const execution = await this.prisma.cronJobExecution.findUnique({
        where: { id: executionId },
      });

      if (!execution) {
        return;
      }

      const config = await this.prisma.cronJobConfig.findUnique({
        where: { jobName: execution.jobName },
      });

      if (!config) {
        return;
      }

      // 檢查是否需要告警
      const shouldAlert =
        (execution.status === CronJobStatus.FAILED && config.alertOnFailure) ||
        (execution.status === CronJobStatus.TIMEOUT && config.alertOnTimeout);

      if (!shouldAlert) {
        return;
      }

      // 檢查連續失敗次數是否達到閾值
      if (
        config.consecutiveFailures >= config.failureThreshold &&
        config.alertOnFailure
      ) {
        this.logger.warn(`[CronMonitor] Alert threshold reached`, {
          jobName: execution.jobName,
          consecutiveFailures: config.consecutiveFailures,
          threshold: config.failureThreshold,
        });

        // 發送告警
        await this.alertService.sendAlert(
          {
            jobName: execution.jobName,
            jobType: execution.jobType,
            status: execution.status,
            executionId: execution.id,
            errorMessage: execution.errorMessage || undefined,
            duration: execution.duration || undefined,
            consecutiveFailures: config.consecutiveFailures,
          },
          {
            alertMethods: config.alertMethods as string[] | undefined,
            alertRecipients: config.alertRecipients as any[] | undefined,
          },
        );
      }
    } catch (error) {
      this.logger.error(`[CronMonitor] Failed to check and alert`, {
        executionId,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * 懶加載 AuditLogService (避免循環依賴)
   */
  private async getAuditLogService() {
    if (!this.auditLogService) {
      const { AuditLogService } =
        await import('../audit-log/audit-log.service');
      this.auditLogService = this.moduleRef.get(AuditLogService, {
        strict: false,
      });
    }
    return this.auditLogService;
  }

  /**
   * 創建審計日誌記錄
   */
  private async createAuditLog(params: {
    userId?: string;
    action: string;
    entity: string;
    entityId?: string;
    status: 'SUCCESS' | 'FAILURE';
    details?: any;
    errorMessage?: string;
  }) {
    try {
      this.logger.debug('[CronMonitor] Creating audit log', {
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        userId: params.userId,
      });

      const auditLogService = await this.getAuditLogService();

      // requestId：cron 場景無 ALS scope，會 fallback 自生 uuidv7
      const requestId = this.requestContext.getRequestIdOrGenerate();

      // 注意: entityId 必須是 UUID，CronJob 名稱不是 UUID，所以設為 undefined
      // 將 CronJob 名稱放在 details 中
      const auditDetails = {
        ...params.details,
        jobName: params.entityId, // 將 job 名稱放在 details 中
      };

      const auditData = {
        requestId,
        userId: params.userId || undefined, // 使用 undefined 讓 Prisma 設為 NULL
        action: params.action,
        entity: params.entity,
        entityId: undefined, // CronJob 沒有 UUID entityId，設為 undefined
        status: params.status,
        method: 'CRON',
        path: `/cron/${params.entityId || 'unknown'}`,
        ipAddress: undefined,
        userAgent: 'CRON-System',
        details: auditDetails,
        duration: 0,
      };

      // 打印詳細的數據以調試 UUID 錯誤
      this.logger.debug('[CronMonitor] Audit data to be created:', {
        requestId: auditData.requestId,
        requestIdType: typeof auditData.requestId,
        requestIdLength: auditData.requestId?.length,
        userId: auditData.userId,
        userIdType: typeof auditData.userId,
        entityId: auditData.entityId,
        entityIdType: typeof auditData.entityId,
        action: auditData.action,
        entity: auditData.entity,
        status: auditData.status,
        method: auditData.method,
        path: auditData.path,
      });

      const result = await auditLogService.createDirect(auditData);

      this.logger.debug('[CronMonitor] Audit log created successfully', {
        action: params.action,
        result: !!result,
        auditLogId: result?.id,
      });
    } catch (error) {
      // 審計日誌失敗不應影響主要邏輯
      this.logger.error('[CronMonitor] Failed to create audit log', {
        action: params.action,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
    }
  }

  /**
   * 手動觸發 Job 執行
   * @param jobName Job 名稱
   * @param force 是否強制執行（跳過 isEnabled 檢查和鎖檢查）
   * @param userId 觸發用戶的 ID (用於審計日誌)
   * @returns 觸發結果
   */
  async triggerJob(
    jobName: string,
    force: boolean = false,
    userId?: string,
  ): Promise<{ success: boolean; message?: string; executionId?: string }> {
    this.logger.log(`[CronMonitor] triggerJob called`, {
      jobName,
      force,
      userId,
    });

    try {
      // 1. 查詢 Job 配置
      const config = await this.prisma.cronJobConfig.findUnique({
        where: { jobName },
      });

      this.logger.log(`[CronMonitor] Config found`, {
        jobName,
        configExists: !!config,
        isEnabled: config?.isEnabled,
      });

      if (!config) {
        const result = {
          success: false,
          message: `Job 配置不存在: ${jobName}`,
        };
        this.logger.warn(`[CronMonitor] Returning: config not found`, result);
        return result;
      }

      // 2. 檢查 Job 是否啟用（除非強制執行）
      if (!force && !config.isEnabled) {
        return {
          success: false,
          message: `Job 未啟用: ${jobName}`,
        };
      }

      // 3. 檢查是否有正在執行的實例（除非強制執行）
      if (!force) {
        const runningExecution = await this.prisma.cronJobExecution.findFirst({
          where: {
            jobName,
            status: CronJobStatus.RUNNING,
          },
        });

        if (runningExecution) {
          return {
            success: false,
            message: `Job 正在執行中，請稍後再試`,
          };
        }
      }

      // 4. 根據 jobName 調用對應的 Service 方法
      this.logger.log(`[CronMonitor] Manually triggering job: ${jobName}`);

      let executionId: string;

      switch (jobName) {
        case 'cleanup-expired-sessions': {
          // 動態獲取 SessionManagementService
          const { SessionManagementService } =
            await import('../auth/session-management.service');
          const sessionService = this.moduleRef.get(SessionManagementService, {
            strict: false,
          });

          // 調用 Job 方法（這個方法內部已經包含了監控邏輯）
          await sessionService.handleExpiredSessionsCleanup();

          // 獲取最新的執行記錄
          const latestExecution = await this.prisma.cronJobExecution.findFirst({
            where: { jobName },
            orderBy: { startedAt: 'desc' },
          });

          executionId = latestExecution?.id || '';
          break;
        }

        case 'cleanup-audit-logs': {
          // 動態獲取 AuditLogService
          const { AuditLogService } =
            await import('../audit-log/audit-log.service');
          const auditLogService = this.moduleRef.get(AuditLogService, {
            strict: false,
          });

          // 調用 Cron Job 方法（會創建執行記錄）
          await auditLogService.handleAuditLogArchiving();

          // 獲取最新的執行記錄
          const latestExecution = await this.prisma.cronJobExecution.findFirst({
            where: { jobName },
            orderBy: { startedAt: 'desc' },
          });

          executionId = latestExecution?.id || '';
          break;
        }

        case 'cleanup-old-notifications': {
          // 動態獲取 NotificationService
          const { NotificationService } =
            await import('../notification/notification.service');
          const notificationService = this.moduleRef.get(NotificationService, {
            strict: false,
          });

          // 調用 Cron Job 方法（會創建執行記錄）
          await notificationService.handleNotificationCleanup();

          // 獲取最新的執行記錄
          const latestExecution = await this.prisma.cronJobExecution.findFirst({
            where: { jobName },
            orderBy: { startedAt: 'desc' },
          });

          executionId = latestExecution?.id || '';
          break;
        }

        default:
          return {
            success: false,
            message: `未知的 Job: ${jobName}`,
          };
      }

      this.logger.log(`[CronMonitor] Job triggered successfully: ${jobName}`);

      // 創建審計日誌：手動觸發成功
      await this.createAuditLog({
        userId,
        action: force ? 'TRIGGER_CRON_JOB_FORCE' : 'TRIGGER_CRON_JOB',
        entity: 'CronJob',
        entityId: jobName,
        status: 'SUCCESS',
        details: {
          jobName,
          displayName: config.displayName,
          force,
          executionId: executionId || undefined,
        },
      });

      const successResult = {
        success: true as boolean,
        message: `Job 已成功觸發: ${config.displayName}`,
        executionId: executionId || undefined,
      };

      this.logger.log(`[CronMonitor] Returning success result`, {
        successResult: JSON.stringify(successResult),
        successType: typeof successResult.success,
        successValue: successResult.success,
      });

      return successResult;
    } catch (error) {
      this.logger.error(`[CronMonitor] Failed to trigger job`, {
        jobName,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });

      // 創建審計日誌：手動觸發失敗
      await this.createAuditLog({
        userId,
        action: force ? 'TRIGGER_CRON_JOB_FORCE' : 'TRIGGER_CRON_JOB',
        entity: 'CronJob',
        entityId: jobName,
        status: 'FAILURE',
        details: {
          jobName,
          force,
          error: error instanceof Error ? error.message : String(error),
        },
      });

      const errorResult = {
        success: false,
        message: error instanceof Error ? error.message : '觸發 Job 失敗',
      };

      this.logger.error(`[CronMonitor] Returning error result`, errorResult);
      return errorResult;
    }
  }
}
