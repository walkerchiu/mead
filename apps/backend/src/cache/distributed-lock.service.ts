import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { logger } from '../common/services/logger.service';

/**
 * DistributedLockService
 *
 * 使用 Redis 實作分散式鎖，防止多實例環境下重複執行任務。
 *
 * 特點：
 * - 自動過期（避免死鎖）
 * - 唯一鎖持有者識別（防止錯誤釋放）
 * - 重試機制（可選）
 */
@Injectable()
export class DistributedLockService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  /**
   * 獲取分散式鎖
   *
   * @param lockKey - 鎖的唯一識別鍵
   * @param ttl - 鎖的過期時間（秒），預設 300 秒（5 分鐘）
   * @param retryTimes - 重試次數，預設 0（不重試）
   * @param retryDelay - 重試延遲（毫秒），預設 1000ms
   * @returns lockId - 成功時返回唯一的鎖 ID，失敗時返回 null
   */
  async acquireLock(
    lockKey: string,
    ttl: number = 300,
    retryTimes: number = 0,
    retryDelay: number = 1000,
  ): Promise<string | null> {
    const lockId = this.generateLockId();
    const fullLockKey = `lock:${lockKey}`;

    for (let attempt = 0; attempt <= retryTimes; attempt++) {
      try {
        // 使用 SET NX EX 命令：只有當 key 不存在時才設置，並設置過期時間
        // 這是 Redis 官方推薦的分散式鎖實作方式
        const store = (this.cacheManager as any).store;
        const client = store?.client;

        // ✅ 如果 Redis 不可用（開發環境），直接返回鎖 ID
        if (!client) {
          logger.warn('[DistributedLock] Redis not available, bypassing lock', {
            lockKey,
          });
          return lockId;
        }

        // SET key value NX EX seconds
        const result = await client.set(fullLockKey, lockId, 'NX', 'EX', ttl);

        if (result === 'OK') {
          logger.info('[DistributedLock] Lock acquired', {
            lockKey,
            lockId,
            ttl,
            attempt: attempt + 1,
          });
          return lockId;
        }

        // 如果獲取失敗且還有重試次數，等待後重試
        if (attempt < retryTimes) {
          logger.debug('[DistributedLock] Lock acquire failed, retrying', {
            lockKey,
            attempt: attempt + 1,
            retryTimes,
          });
          await this.sleep(retryDelay);
        }
      } catch (error) {
        logger.error('[DistributedLock] Error acquiring lock', {
          lockKey,
          attempt: attempt + 1,
          error: error instanceof Error ? error.message : String(error),
        });
        throw error;
      }
    }

    logger.warn('[DistributedLock] Failed to acquire lock after retries', {
      lockKey,
      retryTimes,
    });
    return null;
  }

  /**
   * 釋放分散式鎖
   *
   * 使用 Lua 腳本確保只有鎖的持有者才能釋放鎖
   *
   * @param lockKey - 鎖的唯一識別鍵
   * @param lockId - 獲取鎖時返回的鎖 ID
   * @returns 是否成功釋放
   */
  async releaseLock(lockKey: string, lockId: string): Promise<boolean> {
    const fullLockKey = `lock:${lockKey}`;

    try {
      const store = (this.cacheManager as any).store;
      const client = store?.client;

      // ✅ 如果 Redis 不可用，直接返回成功
      if (!client) {
        logger.debug(
          '[DistributedLock] Redis not available, bypassing unlock',
          {
            lockKey,
          },
        );
        return true;
      }

      // 使用 Lua 腳本原子性地檢查並刪除鎖
      // 只有當 lockId 匹配時才刪除，防止誤刪其他實例的鎖
      const luaScript = `
        if redis.call("get", KEYS[1]) == ARGV[1] then
          return redis.call("del", KEYS[1])
        else
          return 0
        end
      `;

      const result = await client.eval(luaScript, 1, fullLockKey, lockId);

      if (result === 1) {
        logger.info('[DistributedLock] Lock released', {
          lockKey,
          lockId,
        });
        return true;
      } else {
        logger.warn(
          '[DistributedLock] Lock not released (not owner or expired)',
          {
            lockKey,
            lockId,
          },
        );
        return false;
      }
    } catch (error) {
      logger.error('[DistributedLock] Error releasing lock', {
        lockKey,
        lockId,
        error: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  }

  /**
   * 使用鎖執行任務的輔助方法
   *
   * 自動處理鎖的獲取和釋放
   *
   * @param lockKey - 鎖的唯一識別鍵
   * @param task - 要執行的任務函數
   * @param ttl - 鎖的過期時間（秒）
   * @param retryTimes - 重試次數
   * @returns 任務執行結果，如果無法獲取鎖則返回 null
   */
  async executeWithLock<T>(
    lockKey: string,
    task: () => Promise<T>,
    ttl: number = 300,
    retryTimes: number = 0,
  ): Promise<T | null> {
    const lockId = await this.acquireLock(lockKey, ttl, retryTimes);

    if (!lockId) {
      logger.warn('[DistributedLock] Cannot acquire lock, skipping task', {
        lockKey,
      });
      return null;
    }

    try {
      logger.info('[DistributedLock] Executing task with lock', { lockKey });
      const result = await task();
      logger.info('[DistributedLock] Task completed successfully', { lockKey });
      return result;
    } catch (error) {
      logger.error('[DistributedLock] Task execution failed', {
        lockKey,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    } finally {
      // 確保釋放鎖
      await this.releaseLock(lockKey, lockId);
    }
  }

  /**
   * 生成唯一的鎖 ID
   */
  private generateLockId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * 睡眠輔助方法
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * 檢查鎖是否存在
   *
   * @param lockKey - 鎖的唯一識別鍵
   * @returns 鎖是否存在
   */
  async isLocked(lockKey: string): Promise<boolean> {
    const fullLockKey = `lock:${lockKey}`;

    try {
      const store = (this.cacheManager as any).store;
      const client = store?.client;

      // ✅ 如果 Redis 不可用，返回未鎖定
      if (!client) {
        return false;
      }

      const result = await client.get(fullLockKey);
      return result !== null;
    } catch (error) {
      logger.error('[DistributedLock] Error checking lock', {
        lockKey,
        error: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  }

  /**
   * 獲取鎖的剩餘 TTL（秒）
   *
   * @param lockKey - 鎖的唯一識別鍵
   * @returns 剩餘 TTL（秒），-1 表示鎖不存在，-2 表示沒有設置過期時間
   */
  async getLockTTL(lockKey: string): Promise<number> {
    const fullLockKey = `lock:${lockKey}`;

    try {
      const store = (this.cacheManager as any).store;
      const client = store?.client;

      // ✅ 如果 Redis 不可用，返回 -1（不存在）
      if (!client) {
        return -1;
      }

      const ttl = await client.ttl(fullLockKey);
      return ttl;
    } catch (error) {
      logger.error('[DistributedLock] Error getting lock TTL', {
        lockKey,
        error: error instanceof Error ? error.message : String(error),
      });
      return -1;
    }
  }
}
