import { Injectable, Logger } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';

/**
 * Memory PubSub Service
 * 用於開發環境的簡單 PubSub 實現
 * ⚠️ 不支持多實例部署，僅適用於單實例
 */
@Injectable()
export class MemoryPubSubService {
  private readonly logger = new Logger(MemoryPubSubService.name);
  private pubSub: PubSub;

  constructor() {
    this.pubSub = new PubSub();
    this.logger.log('✅ Memory PubSub initialized (single instance only)');
  }

  /**
   * 發布事件
   */
  async publish(triggerName: string, payload: unknown): Promise<void> {
    try {
      await this.pubSub.publish(triggerName, payload);
      this.logger.debug(`Published event: ${triggerName}`);
    } catch (error) {
      this.logger.error(`Failed to publish event ${triggerName}:`, error);
      throw error;
    }
  }

  /**
   * 訂閱事件
   */
  asyncIterator<T>(triggers: string | string[]): AsyncIterator<T> {
    const triggerArray = Array.isArray(triggers) ? triggers : [triggers];
    this.logger.debug(
      `Creating async iterator for triggers: ${triggerArray.join(', ')}`,
    );
    return this.pubSub.asyncIterator<T>(triggerArray);
  }

  /**
   * 健康檢查
   */
  async healthCheck(): Promise<boolean> {
    return true; // Memory PubSub 總是健康的
  }
}
