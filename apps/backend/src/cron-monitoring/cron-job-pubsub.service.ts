/* eslint-disable @typescript-eslint/no-explicit-any */

import { Inject, Injectable } from '@nestjs/common';
import { PUB_SUB, IPubSubService } from '../common/services/pubsub.module';
import { logger } from '../common/services/logger.service';

export const CRON_JOB_EVENTS = {
  EXECUTION_CREATED: 'CRON_JOB_EXECUTION_CREATED',
  CONFIG_UPDATED: 'CRON_JOB_CONFIG_UPDATED',
} as const;

@Injectable()
export class CronJobPubSubService {
  constructor(@Inject(PUB_SUB) private pubSub: IPubSubService) {}

  /**
   * 發布新執行記錄事件
   */
  async emitExecutionCreated(execution: any): Promise<void> {
    logger.debug('[CronJobPubSub] Emitting execution created event', {
      id: execution.id,
      jobName: execution.jobName,
      status: execution.status,
    });
    await this.pubSub.publish(CRON_JOB_EVENTS.EXECUTION_CREATED, {
      cronJobExecutionCreated: execution,
    });
    logger.debug(
      '[CronJobPubSub] Execution created event emitted successfully',
    );
  }

  /**
   * 訂閱執行記錄創建事件
   */
  subscribeToExecutionCreated() {
    logger.debug(
      '[CronJobPubSub] Creating subscription iterator for CRON_JOB_EXECUTION_CREATED',
    );
    return this.pubSub.asyncIterator([CRON_JOB_EVENTS.EXECUTION_CREATED]);
  }

  /**
   * 發布配置更新事件
   */
  async emitConfigUpdated(config: any): Promise<void> {
    logger.debug('[CronJobPubSub] Emitting config updated event', {
      jobName: config.jobName,
      isEnabled: config.isEnabled,
    });
    await this.pubSub.publish(CRON_JOB_EVENTS.CONFIG_UPDATED, {
      cronJobConfigUpdated: config,
    });
    logger.debug('[CronJobPubSub] Config updated event emitted successfully');
  }

  /**
   * 訂閱配置更新事件
   */
  subscribeToConfigUpdated() {
    logger.debug(
      '[CronJobPubSub] Creating subscription iterator for CRON_JOB_CONFIG_UPDATED',
    );
    return this.pubSub.asyncIterator([CRON_JOB_EVENTS.CONFIG_UPDATED]);
  }
}
