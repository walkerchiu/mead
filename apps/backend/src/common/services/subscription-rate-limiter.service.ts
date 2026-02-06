import { Injectable, Logger } from '@nestjs/common';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

/**
 * Subscription Rate Limiter
 * 限制訂閱操作的頻率，防止濫用
 */
@Injectable()
export class SubscriptionRateLimiterService {
  private readonly logger = new Logger(SubscriptionRateLimiterService.name);

  // 不同操作的速率限制配置
  private readonly limits = {
    // 每個用戶每分鐘最多訂閱 10 次
    subscribe: { max: 10, windowMs: 60 * 1000 },
    // 每個訂閱每秒最多接收 5 個事件
    event: { max: 5, windowMs: 1000 },
  };

  // userId -> operation -> RateLimitRecord
  private readonly records = new Map<string, Map<string, RateLimitRecord>>();

  /**
   * 檢查是否允許操作
   */
  checkLimit(
    userId: string,
    operation: 'subscribe' | 'event',
    key?: string,
  ): { allowed: boolean; retryAfter?: number } {
    const limitKey = key ? `${operation}:${key}` : operation;
    const config = this.limits[operation];

    if (!this.records.has(userId)) {
      this.records.set(userId, new Map());
    }

    const userRecords = this.records.get(userId);
    const now = Date.now();

    let record = userRecords.get(limitKey);

    // 如果沒有記錄或已過期，創建新記錄
    if (!record || now >= record.resetAt) {
      record = {
        count: 1,
        resetAt: now + config.windowMs,
      };
      userRecords.set(limitKey, record);
      return { allowed: true };
    }

    // 檢查是否超過限制
    if (record.count >= config.max) {
      const retryAfter = Math.ceil((record.resetAt - now) / 1000);

      this.logger.warn(
        `Rate limit exceeded for user ${userId}, operation: ${operation}, retryAfter: ${retryAfter}s`,
      );

      return {
        allowed: false,
        retryAfter,
      };
    }

    // 未超過限制，增加計數
    record.count++;
    return { allowed: true };
  }

  /**
   * 重置用戶的速率限制（管理員功能）
   */
  resetUserLimits(userId: string): void {
    this.records.delete(userId);
    this.logger.log(`Reset rate limits for user ${userId}`);
  }

  /**
   * 清理過期記錄（定期執行）
   */
  cleanup(): void {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [userId, userRecords] of this.records.entries()) {
      for (const [key, record] of userRecords.entries()) {
        if (now >= record.resetAt) {
          userRecords.delete(key);
          cleanedCount++;
        }
      }

      // 如果用戶沒有任何記錄了，刪除整個用戶映射
      if (userRecords.size === 0) {
        this.records.delete(userId);
      }
    }

    if (cleanedCount > 0) {
      this.logger.debug(
        `Cleaned up ${cleanedCount} expired rate limit records`,
      );
    }
  }

  /**
   * 獲取統計資訊
   */
  getStats() {
    const stats = {
      totalUsers: this.records.size,
      totalRecords: 0,
      limits: this.limits,
    };

    for (const userRecords of this.records.values()) {
      stats.totalRecords += userRecords.size;
    }

    return stats;
  }
}
