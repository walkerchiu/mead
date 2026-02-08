import { Injectable, Logger, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

/**
 * Cache Service
 *
 * 提供統一的快取管理介面，支援:
 * - 通用快取操作 (get, set, del, clear)
 * - Cache hit rate 監控
 * - 自動 TTL 管理
 * - 快取失效策略
 */
@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  // Cache hit rate 統計
  private hitCount = 0;
  private missCount = 0;
  private totalRequests = 0;

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  /**
   * 通用快取 GET 方法
   * @param key 快取鍵
   * @returns 快取值或 null
   */
  async get<T>(key: string): Promise<T | null> {
    this.totalRequests++;

    try {
      const value = await this.cacheManager.get<T>(key);

      if (value !== undefined && value !== null) {
        this.hitCount++;
        this.logger.debug(`Cache HIT: ${key}`);
        return value;
      }

      this.missCount++;
      this.logger.debug(`Cache MISS: ${key}`);
      return null;
    } catch (error) {
      this.logger.error(`Cache GET error for key ${key}:`, error);
      this.missCount++;
      return null;
    }
  }

  /**
   * 通用快取 SET 方法
   * @param key 快取鍵
   * @param value 快取值
   * @param ttl TTL（秒），預設 300 秒（5 分鐘）
   */
  async set<T>(key: string, value: T, ttl = 300): Promise<void> {
    try {
      await this.cacheManager.set(key, value, ttl * 1000); // cache-manager 使用毫秒
      this.logger.debug(`Cache SET: ${key} (TTL: ${ttl}s)`);
    } catch (error) {
      this.logger.error(`Cache SET error for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * 刪除特定快取鍵
   * @param key 快取鍵
   */
  async del(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
      this.logger.debug(`Cache DEL: ${key}`);
    } catch (error) {
      this.logger.error(`Cache DEL error for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * 批量刪除快取鍵（支援 pattern matching）
   * @param pattern 快取鍵模式（例如: "user:*", "notification:*"）
   */
  async delPattern(pattern: string): Promise<void> {
    try {
      // cache-manager-ioredis-yet 支援 pattern 刪除
      // 使用 any 類型來訪問底層 store
      const store = (this.cacheManager as any).store;
      if (store && store.keys && store.del) {
        const keys = await store.keys(pattern);
        if (keys.length > 0) {
          await Promise.all(keys.map((key: string) => this.del(key)));
          this.logger.debug(
            `Cache DEL Pattern: ${pattern} (${keys.length} keys)`,
          );
        }
      } else {
        this.logger.warn(
          `Pattern deletion not supported for pattern: ${pattern}`,
        );
      }
    } catch (error) {
      this.logger.error(`Cache DEL Pattern error for ${pattern}:`, error);
      // 不拋出錯誤,避免影響主要流程
    }
  }

  /**
   * 清空所有快取
   */
  async reset(): Promise<void> {
    try {
      // cache-manager v5+ 可能沒有 reset 方法
      // 使用 any 來訪問可能存在的方法
      const manager = this.cacheManager as any;
      if (manager.reset) {
        await manager.reset();
      } else if (manager.store && manager.store.reset) {
        await manager.store.reset();
      } else {
        this.logger.warn('Cache reset not supported by current store');
      }
      this.logger.warn('Cache RESET: All cache cleared');
    } catch (error) {
      this.logger.error('Cache RESET error:', error);
      throw error;
    }
  }

  /**
   * 獲取 Cache Hit Rate 統計
   */
  getCacheStats() {
    const hitRate =
      this.totalRequests > 0 ? (this.hitCount / this.totalRequests) * 100 : 0;

    return {
      hitCount: this.hitCount,
      missCount: this.missCount,
      totalRequests: this.totalRequests,
      hitRate: hitRate.toFixed(2) + '%',
    };
  }

  /**
   * 重置統計數據
   */
  resetStats() {
    this.hitCount = 0;
    this.missCount = 0;
    this.totalRequests = 0;
    this.logger.log('Cache stats reset');
  }

  // ======================================
  // 業務快取方法（針對特定場景優化）
  // ======================================

  /**
   * 快取用戶資料
   * @param userId 用戶 ID
   * @param userData 用戶資料
   * @param ttl TTL（秒），預設 600 秒（10 分鐘）
   */
  async cacheUser(userId: string, userData: unknown, ttl = 600): Promise<void> {
    await this.set(`user:${userId}`, userData, ttl);
  }

  /**
   * 獲取快取的用戶資料
   * @param userId 用戶 ID
   */
  async getCachedUser<T>(userId: string): Promise<T | null> {
    return this.get<T>(`user:${userId}`);
  }

  /**
   * 清除用戶快取
   * @param userId 用戶 ID
   */
  async invalidateUser(userId: string): Promise<void> {
    await this.del(`user:${userId}`);
  }

  /**
   * 快取通知列表
   * @param userId 用戶 ID
   * @param filters 過濾條件（序列化為字串）
   * @param notifications 通知列表
   * @param ttl TTL（秒），預設 180 秒（3 分鐘）
   */
  async cacheNotifications(
    userId: string,
    filters: string,
    notifications: unknown,
    ttl = 180,
  ): Promise<void> {
    const key = `notifications:${userId}:${filters}`;
    await this.set(key, notifications, ttl);
  }

  /**
   * 獲取快取的通知列表
   * @param userId 用戶 ID
   * @param filters 過濾條件（序列化為字串）
   */
  async getCachedNotifications<T>(
    userId: string,
    filters: string,
  ): Promise<T | null> {
    const key = `notifications:${userId}:${filters}`;
    return this.get<T>(key);
  }

  /**
   * 清除用戶的所有通知快取
   * @param userId 用戶 ID
   */
  async invalidateUserNotifications(userId: string): Promise<void> {
    // 嘗試使用 pattern 刪除
    await this.delPattern(`notifications:${userId}:*`);

    // 由於 pattern 刪除可能不支援，明確刪除常見的快取鍵
    // 這些是 getUserNotifications 最常用的 filter 組合
    const commonFilters = [
      JSON.stringify({ limit: 20, offset: 0 }), // 預設查詢
      JSON.stringify({ isRead: false, limit: 20, offset: 0 }), // 未讀通知
      JSON.stringify({ isRead: true, limit: 20, offset: 0 }), // 已讀通知
      JSON.stringify({ limit: 10, offset: 0 }), // 較小的 limit
      JSON.stringify({ limit: 50, offset: 0 }), // 較大的 limit
    ];

    // 刪除這些常見快取鍵
    await Promise.all(
      commonFilters.map((filter) =>
        this.del(`notifications:${userId}:${filter}`),
      ),
    );

    this.logger.debug(`Invalidated notification cache for user: ${userId}`);
  }

  /**
   * 快取 Session 統計資料
   * @param stats 統計資料
   * @param ttl TTL（秒），預設 300 秒（5 分鐘）
   */
  async cacheSessionStats(stats: unknown, ttl = 300): Promise<void> {
    await this.set('session:stats', stats, ttl);
  }

  /**
   * 獲取快取的 Session 統計資料
   */
  async getCachedSessionStats<T>(): Promise<T | null> {
    return this.get<T>('session:stats');
  }

  /**
   * 清除 Session 統計快取
   */
  async invalidateSessionStats(): Promise<void> {
    await this.del('session:stats');
  }

  /**
   * 快取未讀通知數量
   * @param userId 用戶 ID
   * @param count 未讀數量
   * @param ttl TTL（秒），預設 120 秒（2 分鐘）
   */
  async cacheUnreadCount(
    userId: string,
    count: number,
    ttl = 120,
  ): Promise<void> {
    await this.set(`unread:${userId}`, count, ttl);
  }

  /**
   * 獲取快取的未讀通知數量
   * @param userId 用戶 ID
   */
  async getCachedUnreadCount(userId: string): Promise<number | null> {
    return this.get<number>(`unread:${userId}`);
  }

  /**
   * 清除未讀數量快取
   * @param userId 用戶 ID
   */
  async invalidateUnreadCount(userId: string): Promise<void> {
    await this.del(`unread:${userId}`);
  }
}
