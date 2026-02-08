/**
 * Cron Job 監控 GraphQL Resolver
 */

import {
  Resolver,
  Query,
  Mutation,
  Args,
  Int,
  Subscription,
  Context,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionGuard } from '../common/guards/permission.guard';
import { RequiresPermission } from '../common/decorators/requires-permission.decorator';
import { RequiresScope } from '../common/decorators/requires-scope.decorator';
import { AccessScope } from '../common/enums/access-scope.enum';
import { CronJobMonitorService } from './cron-job-monitor.service';
import { CronJobPubSubService } from './cron-job-pubsub.service';
import {
  CronJobExecutionHistoryType,
  CronJobConfigType,
  CronJobStatisticsType,
  TriggerCronJobInput,
  TriggerCronJobResult,
  CronJobExecutionType,
} from './cron-job-monitor.graphql-types';
import { logger } from '../common/services/logger.service';

@Resolver()
@UseGuards(JwtAuthGuard, PermissionGuard)
@RequiresScope(AccessScope.HQ_SCOPE)
export class CronJobMonitorResolver {
  constructor(
    private readonly cronMonitorService: CronJobMonitorService,
    private readonly pubSubService: CronJobPubSubService,
  ) {
    logger.info('[CronJobResolver] ✅ Resolver instantiated!');
  }

  /**
   * 查詢 Cron Job 執行歷史（分頁）
   * 需要權限：cron_jobs:read
   */
  @Query(() => CronJobExecutionHistoryType, {
    name: 'cronJobExecutions',
    description: '查詢 Cron Job 執行歷史（分頁）',
  })
  @RequiresPermission('cron_jobs:read')
  async getCronJobExecutions(
    @Args('jobName', {
      type: () => String,
      nullable: true,
      description: 'Job 名稱',
    })
    jobName?: string,
    @Args('jobType', {
      type: () => String,
      nullable: true,
      description: 'Job 類型',
    })
    jobType?: string,
    @Args('status', {
      type: () => String,
      nullable: true,
      description: '執行狀態',
    })
    status?: string,
    @Args('startDate', {
      type: () => String,
      nullable: true,
      description: '開始日期（ISO 8601）',
    })
    startDate?: string,
    @Args('endDate', {
      type: () => String,
      nullable: true,
      description: '結束日期（ISO 8601）',
    })
    endDate?: string,
    @Args('page', {
      type: () => Int,
      defaultValue: 1,
      description: '頁碼',
    })
    page: number = 1,
    @Args('limit', {
      type: () => Int,
      defaultValue: 50,
      description: '每頁數量',
    })
    limit: number = 50,
  ): Promise<CronJobExecutionHistoryType> {
    logger.info('[CronJobResolver] 🔍 getCronJobExecutions called', {
      jobName,
      jobType,
      status,
      startDate,
      endDate,
      page,
      limit,
    });

    try {
      // 轉換 string 格式的日期為 Date 物件
      const startDateObj = startDate ? new Date(startDate) : undefined;
      const endDateObj = endDate ? new Date(endDate) : undefined;

      // 調用 service 獲取執行歷史
      const result = await this.cronMonitorService.getExecutionHistory({
        jobName,
        jobType,
        status: status as any,
        startDate: startDateObj,
        endDate: endDateObj,
        page,
        limit,
      });

      logger.info('[CronJobResolver] 📊 Service returned result', {
        executionsCount: result.executions?.length ?? 0,
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      });

      // 轉成 CONVENTIONS §3.1 標準 { data, pageInfo } 分頁格式
      return {
        data: result.executions,
        pageInfo: {
          currentPage: result.page,
          totalPages: result.totalPages,
          totalCount: result.total,
          limit: result.limit,
          hasNextPage: result.page < result.totalPages,
          hasPreviousPage: result.page > 1,
        },
      };
    } catch (err) {
      const error = err as Error;
      logger.error('[CronJobResolver] ❌ Failed to fetch executions', {
        error: error.message || String(err),
        stack: error.stack,
      });
      throw err;
    }
  }

  /**
   * 測試 query - 最簡單的查詢
   */
  @Query(() => String, {
    name: 'testCronQuery',
    description: '測試查詢',
  })
  @RequiresPermission('cron_jobs:read')
  async testCronQuery(): Promise<string> {
    console.error('🎯🎯🎯 TEST QUERY CALLED! 🎯🎯🎯');
    return 'TEST SUCCESS';
  }

  /**
   * 查詢所有 Cron Job 配置
   * 需要權限：cron_jobs:read
   */
  @Query(() => [CronJobConfigType], {
    name: 'cronJobConfigs',
    description: '查詢所有 Cron Job 配置',
  })
  @RequiresPermission('cron_jobs:read')
  async getCronJobConfigs(): Promise<any[]> {
    try {
      logger.info('[CronJobResolver] Fetching all job configs');

      const configs = await this.cronMonitorService[
        'prisma'
      ].cronJobConfig.findMany({
        orderBy: { jobName: 'asc' },
      });

      return configs;
    } catch (error) {
      logger.error('[CronJobResolver] Failed to fetch job configs', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * 查詢 Cron Job 統計資料
   * 需要權限：cron_jobs:read
   */
  @Query(() => CronJobStatisticsType, {
    name: 'cronJobStatistics',
    description: '查詢 Cron Job 統計資料',
  })
  @RequiresPermission('cron_jobs:read')
  async getCronJobStatistics(
    @Args('jobName', {
      type: () => String,
      nullable: true,
      description: 'Job 名稱',
    })
    jobName?: string,
    @Args('jobType', {
      type: () => String,
      nullable: true,
      description: 'Job 類型',
    })
    jobType?: string,
    @Args('startDate', {
      type: () => String,
      nullable: true,
      description: '開始日期（ISO 8601）',
    })
    startDate?: string,
    @Args('endDate', {
      type: () => String,
      nullable: true,
      description: '結束日期（ISO 8601）',
    })
    endDate?: string,
  ): Promise<CronJobStatisticsType> {
    try {
      logger.info('[CronJobResolver] Fetching statistics', {
        jobName,
        jobType,
        startDate,
        endDate,
      });

      // 轉換 string 格式的日期為 Date 物件
      const startDateObj = startDate ? new Date(startDate) : undefined;
      const endDateObj = endDate ? new Date(endDate) : undefined;

      const stats = await this.cronMonitorService.getExecutionStatistics({
        jobName,
        jobType,
        startDate: startDateObj,
        endDate: endDateObj,
      });

      return stats;
    } catch (error) {
      logger.error('[CronJobResolver] Failed to fetch statistics', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * 更新 Cron Job 配置
   * 需要權限：cron_jobs:write
   */
  @Mutation(() => CronJobConfigType, {
    name: 'updateCronJobConfig',
    description: '更新 Cron Job 配置',
  })
  @RequiresPermission('cron_jobs:write')
  async updateCronJobConfig(
    @Args('jobName', { type: () => String, description: 'Job 名稱' })
    jobName: string,
    @Args('displayName', {
      type: () => String,
      nullable: true,
      description: '顯示名稱',
    })
    displayName?: string,
    @Args('description', {
      type: () => String,
      nullable: true,
      description: '描述',
    })
    description?: string,
    @Args('isEnabled', {
      type: () => Boolean,
      nullable: true,
      description: '是否啟用',
    })
    isEnabled?: boolean,
    @Args('alertOnFailure', {
      type: () => Boolean,
      nullable: true,
      description: '失敗時告警',
    })
    alertOnFailure?: boolean,
    @Args('alertOnTimeout', {
      type: () => Boolean,
      nullable: true,
      description: '超時時告警',
    })
    alertOnTimeout?: boolean,
    @Args('failureThreshold', {
      type: () => Int,
      nullable: true,
      description: '連續失敗幾次後告警',
    })
    failureThreshold?: number,
    @Args('timeoutThresholdMs', {
      type: () => Int,
      nullable: true,
      description: '超時閾值（毫秒）',
    })
    timeoutThresholdMs?: number,
  ): Promise<CronJobConfigType> {
    try {
      logger.info('[CronJobResolver] Updating job config', {
        jobName,
        displayName,
        description,
        isEnabled,
        alertOnFailure,
        alertOnTimeout,
        failureThreshold,
        timeoutThresholdMs,
      });

      // 先檢查 Job 是否存在
      const existing = await this.cronMonitorService[
        'prisma'
      ].cronJobConfig.findUnique({
        where: { jobName },
      });

      if (!existing) {
        logger.error('[CronJobResolver] Job not found', { jobName });
        throw new Error(`Job not found: ${jobName}`);
      }

      logger.debug('[CronJobResolver] Existing config found', {
        jobName,
        currentIsEnabled: existing.isEnabled,
      });

      // 構建更新資料
      const updateData: any = {};

      if (displayName !== undefined) updateData.displayName = displayName;
      if (description !== undefined) updateData.description = description;
      if (isEnabled !== undefined) updateData.isEnabled = isEnabled;
      if (alertOnFailure !== undefined)
        updateData.alertOnFailure = alertOnFailure;
      if (alertOnTimeout !== undefined)
        updateData.alertOnTimeout = alertOnTimeout;
      if (failureThreshold !== undefined)
        updateData.failureThreshold = failureThreshold;
      if (timeoutThresholdMs !== undefined)
        updateData.timeoutThresholdMs = timeoutThresholdMs;

      logger.debug('[CronJobResolver] Update data prepared', { updateData });

      // 使用 Prisma 直接更新
      const updatedConfig = await this.cronMonitorService[
        'prisma'
      ].cronJobConfig.update({
        where: { jobName },
        data: updateData,
      });

      logger.info('[CronJobResolver] Prisma update completed', {
        jobName,
        updatedConfigKeys: Object.keys(updatedConfig || {}),
        hasJobName: !!updatedConfig?.jobName,
        updatedIsEnabled: updatedConfig?.isEnabled,
      });

      // 驗證返回的數據
      if (!updatedConfig) {
        logger.error('[CronJobResolver] Prisma returned null');
        throw new Error('Update operation returned null');
      }

      if (!updatedConfig.jobName) {
        logger.error('[CronJobResolver] Updated config missing jobName', {
          config: JSON.stringify(updatedConfig),
        });
        throw new Error('Updated config is missing required fields');
      }

      logger.info('[CronJobResolver] Job config updated successfully', {
        jobName,
        isEnabled: updatedConfig.isEnabled,
      });

      // 🔔 發布配置更新事件（用於 GraphQL Subscription）
      try {
        await this.pubSubService.emitConfigUpdated(updatedConfig);
        logger.debug('[CronJobResolver] Config updated event emitted');
      } catch (error) {
        logger.warn('[CronJobResolver] Failed to emit config updated event', {
          error: error instanceof Error ? error.message : String(error),
        });
      }

      return updatedConfig;
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('[CronJobResolver] Failed to update job config', {
        jobName,
        error: err.message || String(error),
        stack: err.stack,
      });
      throw error;
    }
  }

  /**
   * 手動觸發 Cron Job 執行
   * 需要權限：cron_jobs:write
   */
  @Mutation(() => TriggerCronJobResult, {
    name: 'triggerCronJob',
    description: '手動觸發指定的 Cron Job 執行',
  })
  @RequiresPermission('cron_jobs:write')
  async triggerCronJob(
    @Args('input') input: TriggerCronJobInput,
    @Context() context: any,
  ): Promise<TriggerCronJobResult> {
    console.error(
      '🚨🚨🚨 [CronJobResolver] triggerCronJob MUTATION CALLED! 🚨🚨🚨',
    );
    logger.info('[CronJobResolver] triggerCronJob mutation called', { input });

    const { jobName, force = false } = input;
    const userId = context?.req?.user?.id; // 從 JWT token 中獲取用戶 ID

    try {
      logger.info('[CronJobResolver] Triggering cron job manually', {
        jobName,
        force,
        userId,
      });

      // 調用 service 方法執行 Job (傳遞 userId 用於審計日誌)
      const result = await this.cronMonitorService.triggerJob(
        jobName,
        force,
        userId,
      );

      logger.info('[CronJobResolver] Service returned result', {
        jobName,
        resultType: typeof result,
        resultIsNull: result === null,
        resultIsUndefined: result === undefined,
        result: JSON.stringify(result),
      });

      // 檢查 result 是否為 null 或 undefined
      if (!result) {
        logger.error('[CronJobResolver] Service returned null or undefined!', {
          jobName,
          result,
        });
        return {
          success: false,
          message: 'Service 返回了無效的結果',
          executionId: undefined,
        };
      }

      logger.info('[CronJobResolver] Cron job triggered successfully', {
        jobName,
        success: result.success,
        message: result.message,
        executionId: result.executionId,
      });

      // 確保返回值符合 GraphQL schema
      const response: TriggerCronJobResult = {
        success: Boolean(result.success ?? false),
        message: result.message ?? '執行完成',
        executionId: result.executionId ?? undefined,
      };

      logger.info('[CronJobResolver] Returning response', {
        response: JSON.stringify(response),
        successType: typeof response.success,
        successValue: response.success,
      });

      return response;
    } catch (error) {
      logger.error('[CronJobResolver] Failed to trigger cron job', {
        jobName,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });

      // 確保始終返回有效的結果對象
      const errorResponse: TriggerCronJobResult = {
        success: false,
        message: error instanceof Error ? error.message : '觸發 Job 失敗',
        executionId: undefined,
      };

      logger.error('[CronJobResolver] Returning error response', {
        errorResponse: JSON.stringify(errorResponse),
      });

      return errorResponse;
    }
  }

  /**
   * 訂閱 Cron Job 執行記錄創建事件（即時推送）
   * 權限檢查在 filter 中進行（因為 Guards 在 Subscription 中不生效）
   */
  @Subscription(() => CronJobExecutionType, {
    name: 'cronJobExecutionCreated',
    description: '訂閱新的 Cron Job 執行記錄（需要 HQ_SCOPE + cron_jobs:read）',
    filter: (payload, variables, context) => {
      // 🔍 從 connectionParams 解析 JWT 獲取 user
      try {
        const authHeader = context?.connectionParams?.authorization || '';
        const token = authHeader.replace('Bearer ', '');

        if (!token) {
          logger.debug('[Subscription Filter] No token in connectionParams');
          return false;
        }

        // 解析 JWT（不驗證簽名，因為 onConnect 已經驗證過）
        const payload = JSON.parse(
          Buffer.from(token.split('.')[1], 'base64').toString(),
        );

        const user = {
          id: payload.sub,
          email: payload.email,
          accessScopes: payload.accessScopes || [],
          permissions: payload.permissions || [],
        };

        logger.debug('[Subscription Filter] User parsed from token', {
          userId: user.id,
          email: user.email,
          accessScopes: user.accessScopes,
        });

        // 檢查是否有 HQ_SCOPE
        const hasHQScope = user.accessScopes.includes('HQ_SCOPE');
        if (!hasHQScope) {
          logger.debug('[Subscription Filter] User lacks HQ_SCOPE');
          return false;
        }

        // 檢查是否有 cron_jobs:read 權限
        const hasPermission = user.permissions.some(
          (p: any) => p.name === 'cron_jobs:read' || p.resource === 'cron_jobs',
        );

        if (!hasPermission && user.permissions.length > 0) {
          logger.debug(
            '[Subscription Filter] User lacks cron_jobs:read permission',
          );
          return false;
        }

        logger.debug('[Subscription Filter] All checks passed, allowing event');
        return true;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        logger.warn('[Subscription Filter] Error parsing token', {
          error: errorMessage,
        });
        return false;
      }
    },
  })
  cronJobExecutionCreated(@Context() _context: any) {
    logger.debug('[Subscription Resolver] cronJobExecutionCreated called');
    return this.pubSubService.subscribeToExecutionCreated();
  }

  /**
   * 訂閱 Cron Job 配置更新事件（即時推送）
   * 權限檢查在 filter 中進行（因為 Guards 在 Subscription 中不生效）
   */
  @Subscription(() => CronJobConfigType, {
    name: 'cronJobConfigUpdated',
    description: '訂閱 Cron Job 配置更新（需要 HQ_SCOPE + cron_jobs:read）',
    filter: (payload, variables, context) => {
      // 🔍 從 connectionParams 解析 JWT 獲取 user
      try {
        const authHeader = context?.connectionParams?.authorization || '';
        const token = authHeader.replace('Bearer ', '');

        if (!token) {
          logger.debug('[Subscription Filter] No token in connectionParams');
          return false;
        }

        // 解析 JWT（不驗證簽名，因為 onConnect 已經驗證過）
        const payload = JSON.parse(
          Buffer.from(token.split('.')[1], 'base64').toString(),
        );

        const user = {
          id: payload.sub,
          email: payload.email,
          accessScopes: payload.accessScopes || [],
          permissions: payload.permissions || [],
        };

        // 檢查是否有 HQ_SCOPE
        const hasHQScope = user.accessScopes.includes('HQ_SCOPE');
        if (!hasHQScope) {
          logger.debug('[Subscription Filter] User lacks HQ_SCOPE');
          return false;
        }

        // 檢查是否有 cron_jobs:read 權限
        const hasPermission = user.permissions.some(
          (p: any) => p.name === 'cron_jobs:read' || p.resource === 'cron_jobs',
        );

        if (!hasPermission && user.permissions.length > 0) {
          logger.debug(
            '[Subscription Filter] User lacks cron_jobs:read permission',
          );
          return false;
        }

        return true;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        logger.warn('[Subscription Filter] Error parsing token', {
          error: errorMessage,
        });
        return false;
      }
    },
  })
  cronJobConfigUpdated(@Context() _context: any) {
    logger.debug('[Subscription Resolver] cronJobConfigUpdated called');
    return this.pubSubService.subscribeToConfigUpdated();
  }
}
