import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';
import { logger } from '../common/services/logger.service';
import { resolveDatabaseUrl } from './database-url';

/**
 * PrismaService
 *
 * 提供 Prisma Client 的 NestJS 整合
 * 包含:
 * - 慢查詢日誌
 * - 連線池優化
 * - 查詢效能監控
 */
@Injectable()
export class PrismaService
  extends PrismaClient<Prisma.PrismaClientOptions, 'query'>
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    // 從環境變數讀取慢查詢閾值（毫秒），預設 1000ms
    const slowQueryThreshold = parseInt(
      process.env.PRISMA_SLOW_QUERY_THRESHOLD || '1000',
      10,
    );

    super({
      // 連線池設定
      // 透過 resolveDatabaseUrl() 將 DATABASE_SSL_MODE / SSL_CA / APPLICATION_NAME
      // 等 env 合併進 DATABASE_URL（Prisma 連線參數一律從 URL 解析）
      datasources: {
        db: {
          url: resolveDatabaseUrl(),
        },
      },
      // 日誌設定
      log: [
        {
          emit: 'event',
          level: 'query',
        },
        {
          emit: 'stdout',
          level: 'error',
        },
        {
          emit: 'stdout',
          level: 'warn',
        },
      ],
    });

    // 監聽查詢事件,記錄慢查詢
    this.$on('query', (e: Prisma.QueryEvent) => {
      const duration = e.duration;

      // 記錄慢查詢
      if (duration >= slowQueryThreshold) {
        logger.warn('[Prisma] Slow Query Detected', {
          duration: `${duration}ms`,
          query: e.query,
          params: e.params,
          target: e.target,
          timestamp: e.timestamp,
        });
      }

      // 在開發環境記錄所有查詢（DEBUG）
      if (process.env.NODE_ENV === 'development' && duration > 100) {
        logger.debug('[Prisma] Query', {
          duration: `${duration}ms`,
          query: e.query.substring(0, 200), // 截斷長查詢
        });
      }
    });
  }

  async onModuleInit() {
    await this.$connect();
    logger.info('[Prisma] Database connected successfully');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    logger.info('[Prisma] Database disconnected');
  }
}
