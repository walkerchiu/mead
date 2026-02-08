import { Controller, Get } from '@nestjs/common';
import {
  HealthCheckService,
  HealthCheck,
  PrismaHealthIndicator,
  MemoryHealthIndicator,
} from '@nestjs/terminus';
import { PrismaService } from '../prisma/prisma.service';
import { RedisHealthIndicator } from './indicators/redis.health';

/**
 * Health Controller
 *
 * 提供系統健康檢查端點
 * - /health: 完整健康檢查（資料庫、Redis、RabbitMQ、記憶體）
 * - /health/liveness: 存活檢查（應用程式是否運行）
 * - /health/readiness: 就緒檢查（是否可以接收流量）
 */
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prismaHealth: PrismaHealthIndicator,
    private redisHealth: RedisHealthIndicator,
    private memoryHealth: MemoryHealthIndicator,
    private prisma: PrismaService,
  ) {}

  /**
   * 完整健康檢查
   * 檢查所有關鍵服務的狀態
   */
  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      // 資料庫檢查
      () => this.prismaHealth.pingCheck('database', this.prisma),

      // Redis（Dragonfly）檢查
      () => this.redisHealth.isHealthy('redis'),

      // 記憶體檢查（heap 不超過 500MB）
      () => this.memoryHealth.checkHeap('memory_heap', 500 * 1024 * 1024),
    ]);
  }

  /**
   * 存活檢查（Liveness Probe）
   * 檢查應用程式是否存活（不檢查依賴服務）
   * Kubernetes 會使用此端點決定是否需要重啟 Pod
   */
  @Get('liveness')
  @HealthCheck()
  checkLiveness() {
    return this.health.check([
      // 只檢查記憶體，不檢查外部依賴
      () => this.memoryHealth.checkHeap('memory_heap', 500 * 1024 * 1024),
    ]);
  }

  /**
   * 就緒檢查（Readiness Probe）
   * 檢查應用程式是否準備好接收流量
   * Kubernetes 會使用此端點決定是否將流量導向此 Pod
   */
  @Get('readiness')
  @HealthCheck()
  checkReadiness() {
    return this.health.check([
      // 檢查資料庫連線
      () => this.prismaHealth.pingCheck('database', this.prisma),

      // 檢查 Redis（Dragonfly）連線
      () => this.redisHealth.isHealthy('redis'),
    ]);
  }
}
