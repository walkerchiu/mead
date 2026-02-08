import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import Redis, { RedisOptions } from 'ioredis';

/**
 * Distributed PubSub Service
 * 支持多實例部署的 PubSub 實現
 *
 * 使用 Redis 協議連接分布式消息服務（Dragonfly/Redis/Valkey 等）
 * 注意：完全兼容 Redis 協議，使用 ioredis 客戶端
 */
@Injectable()
export class DistributedPubSubService implements OnModuleDestroy {
  private readonly logger = new Logger(DistributedPubSubService.name);
  private pubSub: RedisPubSub;

  constructor(private configService: ConfigService) {
    const redisHost = this.configService.get<string>('REDIS_HOST', 'localhost');
    const redisPort = this.configService.get<number>('REDIS_PORT', 6379);
    const redisPassword = this.configService.get<string>('REDIS_PASSWORD');

    this.logger.log(
      `Initializing Distributed PubSub (Redis-compatible) - Host: ${redisHost}, Port: ${redisPort}`,
    );

    const options: RedisOptions = {
      host: redisHost,
      port: redisPort,
      password: redisPassword,
      retryStrategy: (times: number) => {
        // 限制最大重試次數為 10 次，之後返回 null 停止重試
        if (times > 10) {
          this.logger.warn(
            `Distributed PubSub connection failed after ${times} attempts, stopping retries`,
          );
          return null; // 停止重試
        }
        const delay = Math.min(times * 50, 2000);
        this.logger.warn(
          `Distributed PubSub connection retry attempt ${times}, delay: ${delay}ms`,
        );
        return delay;
      },
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      showFriendlyErrorStack: true,
      lazyConnect: true, // 延遲連接，不阻塞啟動
    };

    try {
      const publisher = new Redis(options);
      const subscriber = new Redis(options);

      // 添加錯誤處理，防止未處理的錯誤導致進程崩潰
      publisher.on('error', (err) => {
        this.logger.warn(`Redis publisher connection error: ${err.message}`);
        // 不拋出錯誤，讓應用繼續運行
      });

      subscriber.on('error', (err) => {
        this.logger.warn(`Redis subscriber connection error: ${err.message}`);
        // 不拋出錯誤，讓應用繼續運行
      });

      this.pubSub = new RedisPubSub({
        publisher,
        subscriber,
      });

      this.logger.log('✅ Distributed PubSub initialized successfully');
    } catch (error) {
      this.logger.error('❌ Failed to initialize Distributed PubSub:', error);
      throw error;
    }
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
   * 清理資源
   */
  async onModuleDestroy() {
    this.logger.log('Closing Distributed PubSub connections...');
    try {
      await this.pubSub.close();
      this.logger.log('✅ Distributed PubSub connections closed');
    } catch (error) {
      this.logger.error('❌ Error closing Distributed PubSub:', error);
    }
  }

  /**
   * 健康檢查
   */
  async healthCheck(): Promise<boolean> {
    try {
      // 發布一個測試事件
      await this.publish('HEALTH_CHECK', { timestamp: Date.now() });
      return true;
    } catch (error) {
      this.logger.error('Health check failed:', error);
      return false;
    }
  }
}
