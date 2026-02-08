import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SystemStatusPubSubService } from './system-status-pubsub.service';
import {
  ServiceType,
  ServiceStatus,
  SystemStatusGQLType,
} from './system-status.types';
import { logger } from '../common/services/logger.service';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

/**
 * SystemMonitorService
 *
 * 負責監控系統各服務的健康狀態：
 * - 定期檢查資料庫、Redis、RabbitMQ 等服務
 * - 發布狀態變更事件
 * - 提供即時健康檢查
 */
@Injectable()
export class SystemMonitorService implements OnModuleInit {
  private redis: Redis | null = null;
  private lastStatuses: Map<ServiceType, ServiceStatus> = new Map();
  private monitoringInterval: NodeJS.Timeout | null = null;
  private readonly CHECK_INTERVAL = 30000; // 30 秒檢查一次

  constructor(
    private readonly prisma: PrismaService,
    private readonly systemStatusPubSub: SystemStatusPubSubService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    // 初始化 Redis 連線（用於健康檢查）
    try {
      const redisUrl = this.configService.get<string>('REDIS_URL');
      if (redisUrl) {
        this.redis = new Redis(redisUrl, {
          maxRetriesPerRequest: 1,
          enableReadyCheck: true,
        });
      }
    } catch (error) {
      logger.error('[SystemMonitor] Failed to initialize Redis client', error);
    }

    // 啟動定期監控
    this.startMonitoring();

    logger.info('[SystemMonitor] Service monitoring started');
  }

  /**
   * 啟動定期監控
   */
  private startMonitoring() {
    // 立即執行一次檢查
    this.checkAllServices();

    // 設定定期檢查
    this.monitoringInterval = setInterval(() => {
      this.checkAllServices();
    }, this.CHECK_INTERVAL);
  }

  /**
   * 停止監控
   */
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  /**
   * 檢查所有服務
   */
  async checkAllServices(): Promise<SystemStatusGQLType[]> {
    const results = await Promise.all([
      this.checkDatabase(),
      this.checkRedis(),
      this.checkGraphQL(),
    ]);

    return results;
  }

  /**
   * 檢查資料庫狀態
   */
  private async checkDatabase(): Promise<SystemStatusGQLType> {
    const service = ServiceType.DATABASE;
    const timestamp = new Date();
    const startTime = Date.now();

    try {
      // 執行簡單的查詢測試連線
      await this.prisma.$queryRaw`SELECT 1`;

      const responseTime = Date.now() - startTime;
      const status = ServiceStatus.HEALTHY;

      const result: SystemStatusGQLType = {
        service,
        status,
        message: 'Database is healthy',
        timestamp,
        responseTime,
      };

      await this.publishIfChanged(service, result);

      return result;
    } catch (error) {
      const status = ServiceStatus.DOWN;

      const result: SystemStatusGQLType = {
        service,
        status,
        message: 'Database connection failed',
        timestamp,
        details: error instanceof Error ? error.message : 'Unknown error',
      };

      await this.publishIfChanged(service, result);

      logger.error('[SystemMonitor] Database health check failed', error);

      return result;
    }
  }

  /**
   * 檢查 Redis 狀態
   */
  private async checkRedis(): Promise<SystemStatusGQLType> {
    const service = ServiceType.REDIS;
    const timestamp = new Date();
    const startTime = Date.now();

    try {
      if (!this.redis) {
        const status = ServiceStatus.DOWN;
        const result: SystemStatusGQLType = {
          service,
          status,
          message: 'Redis client not initialized',
          timestamp,
          details: 'Redis URL not configured',
        };

        await this.publishIfChanged(service, result);
        return result;
      }

      // 執行 PING 測試連線
      const response = await this.redis.ping();

      if (response === 'PONG') {
        const responseTime = Date.now() - startTime;
        const status = ServiceStatus.HEALTHY;

        const result: SystemStatusGQLType = {
          service,
          status,
          message: 'Redis is healthy',
          timestamp,
          responseTime,
        };

        await this.publishIfChanged(service, result);

        return result;
      } else {
        const status = ServiceStatus.DEGRADED;

        const result: SystemStatusGQLType = {
          service,
          status,
          message: 'Redis responded with unexpected value',
          timestamp,
          details: `Expected PONG, got ${response}`,
        };

        await this.publishIfChanged(service, result);

        return result;
      }
    } catch (error) {
      const status = ServiceStatus.DOWN;

      const result: SystemStatusGQLType = {
        service,
        status,
        message: 'Redis connection failed',
        timestamp,
        details: error instanceof Error ? error.message : 'Unknown error',
      };

      await this.publishIfChanged(service, result);

      logger.error('[SystemMonitor] Redis health check failed', error);

      return result;
    }
  }

  /**
   * 檢查 GraphQL 狀態
   */
  private async checkGraphQL(): Promise<SystemStatusGQLType> {
    const service = ServiceType.GRAPHQL;
    const timestamp = new Date();

    // GraphQL 服務如果能執行到這裡，表示它是正常的
    const status = ServiceStatus.HEALTHY;

    const result: SystemStatusGQLType = {
      service,
      status,
      message: 'GraphQL server is healthy',
      timestamp,
    };

    await this.publishIfChanged(service, result);

    return result;
  }

  /**
   * 僅在狀態變更時發布事件
   */
  private async publishIfChanged(
    service: ServiceType,
    status: SystemStatusGQLType,
  ) {
    const lastStatus = this.lastStatuses.get(service);

    // 如果狀態改變，發布事件
    if (lastStatus !== status.status) {
      logger.info('[SystemMonitor] Service status changed', {
        service,
        from: lastStatus,
        to: status.status,
      });

      await this.systemStatusPubSub.publishStatusChange(status);
      this.lastStatuses.set(service, status.status);
    }
  }

  /**
   * 取得系統整體健康狀態
   */
  async getSystemHealth() {
    const services = await this.checkAllServices();

    // 計算整體狀態
    let overallStatus = ServiceStatus.HEALTHY;

    for (const service of services) {
      if (service.status === ServiceStatus.DOWN) {
        overallStatus = ServiceStatus.DOWN;
        break;
      } else if (service.status === ServiceStatus.DEGRADED) {
        overallStatus = ServiceStatus.DEGRADED;
      }
    }

    return {
      overallStatus,
      services,
      checkedAt: new Date(),
      uptime: process.uptime(),
    };
  }

  /**
   * 清理資源
   */
  async onModuleDestroy() {
    this.stopMonitoring();

    if (this.redis) {
      await this.redis.quit();
    }
  }
}
