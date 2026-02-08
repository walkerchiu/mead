import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { HealthController } from './health.controller';
import { RedisHealthIndicator } from './indicators/redis.health';
import { PrismaModule } from '../prisma/prisma.module';
import { CacheModule } from '../cache/cache.module';

/**
 * Health Module
 *
 * 提供系統健康檢查功能
 * - 資料庫健康檢查
 * - Redis 健康檢查
 * - 記憶體健康檢查
 * - 磁碟空間健康檢查
 */
@Module({
  imports: [TerminusModule, HttpModule, PrismaModule, CacheModule],
  controllers: [HealthController],
  providers: [RedisHealthIndicator],
})
export class HealthModule {}
