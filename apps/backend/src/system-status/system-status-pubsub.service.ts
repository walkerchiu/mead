import { Inject, Injectable } from '@nestjs/common';
import { PUB_SUB, IPubSubService } from '../common/services/pubsub.module';
import { SystemStatusGQLType } from './system-status.types';
import { logger } from '../common/services/logger.service';

/**
 * SystemStatusPubSubService
 *
 * 負責系統狀態的 PubSub 事件發布：
 * - 發布服務狀態變更事件
 * - 提供訂閱機制
 */
@Injectable()
export class SystemStatusPubSubService {
  private readonly TOPIC = 'system.status.changed';

  constructor(@Inject(PUB_SUB) private readonly pubSub: IPubSubService) {}

  /**
   * 發布系統狀態變更事件
   *
   * @param status - 系統狀態
   */
  async publishStatusChange(status: SystemStatusGQLType): Promise<void> {
    try {
      await this.pubSub.publish(this.TOPIC, {
        systemStatusChanged: status,
      });

      logger.debug('[SystemStatusPubSub] Published status change', {
        service: status.service,
        status: status.status,
        message: status.message,
      });
    } catch (error) {
      logger.error('[SystemStatusPubSub] Failed to publish status change', {
        error,
        status,
      });
    }
  }

  /**
   * 訂閱系統狀態變更
   *
   * @returns AsyncIterator for subscription
   */
  subscribeToStatusChanges() {
    return this.pubSub.asyncIterator(this.TOPIC);
  }
}
