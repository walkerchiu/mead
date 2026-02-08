import { Injectable } from '@nestjs/common';
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';

/**
 * Redis Health Indicator
 *
 * 檢查 Redis（Dragonfly）連線狀態
 */
@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      // 嘗試寫入和讀取測試值
      const testKey = '__health_check__';
      const testValue = Date.now().toString();

      // 設定測試值（1 秒後過期）
      await this.cacheManager.set(testKey, testValue, 1000);

      // 讀取測試值
      const result = await this.cacheManager.get(testKey);

      // 驗證讀取的值是否正確
      if (result === testValue) {
        return this.getStatus(key, true, {
          message: 'Redis is healthy',
        });
      } else {
        throw new Error('Redis read/write test failed');
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new HealthCheckError(
        'Redis check failed',
        this.getStatus(key, false, {
          message: errorMessage,
        }),
      );
    }
  }
}
