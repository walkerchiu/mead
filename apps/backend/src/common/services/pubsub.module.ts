import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DistributedPubSubService } from './distributed-pubsub.service';
import { MemoryPubSubService } from './memory-pubsub.service';
import { logger } from './logger.service';

/**
 * PubSub Token
 * 用於依賴注入
 */
export const PUB_SUB = 'PUB_SUB';

/**
 * PubSub 接口
 * 統一 Distributed (Redis-compatible) 和 Memory 實現的接口
 */
export interface IPubSubService {
  publish(triggerName: string, payload: unknown): Promise<void>;
  asyncIterator<T>(triggers: string | string[]): AsyncIterator<T>;
  healthCheck(): Promise<boolean>;
}

/**
 * PubSub Module
 * 根據環境自動切換 Distributed 或 Memory 實現
 *
 * - 生產環境: Distributed PubSub (支持多實例，Redis 協議兼容，當前使用 Dragonfly)
 * - 開發環境: Memory PubSub (單實例)
 */
@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    DistributedPubSubService,
    MemoryPubSubService,
    {
      provide: PUB_SUB,
      useFactory: (
        configService: ConfigService,
        distributedPubSub: DistributedPubSubService,
        memoryPubSub: MemoryPubSubService,
      ): IPubSubService => {
        const nodeEnv = configService.get<string>('NODE_ENV', 'development');
        const useDistributed =
          nodeEnv === 'production' ||
          nodeEnv === 'uat' ||
          nodeEnv === 'staging';

        if (useDistributed) {
          logger.info(
            '[PubSub] Using Distributed PubSub (multi-instance support, currently: Dragonfly)',
          );
          return distributedPubSub;
        } else {
          logger.info('[PubSub] Using Memory PubSub (single-instance only)');
          return memoryPubSub;
        }
      },
      inject: [ConfigService, DistributedPubSubService, MemoryPubSubService],
    },
  ],
  exports: [PUB_SUB],
})
export class PubSubModule {}
