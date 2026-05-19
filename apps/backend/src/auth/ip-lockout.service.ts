import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { logger } from '../common/services/logger.service';

export interface IpLockInfo {
  isLocked: boolean;
  failedAttempts: number;
  remainingMinutes: number;
}

/**
 * Per-IP brute-force 防護 — 跟 AccountLockoutService 互補：
 *
 * - AccountLockoutService 鎖「user」：駭客拿對 username + 任意錯密碼可 DoS 該帳號。
 * - IpLockoutService 鎖「IP」：同一 IP 對任意帳號累計失敗超過閾值就鎖 IP 一段時間，
 *   不影響該帳號被其他 IP 正常登入；正常 user 鎖在自己網段不會牽連他人。
 *
 * 計數策略：失敗 → IP counter +1（TTL = WindowMinutes，rolling window）；
 *             成功 → IP counter reset 0；
 *             counter ≥ Max → 寫 lock key `auth:iplock:{ip}` TTL = LockoutMinutes。
 *
 * 用 @nestjs/cache-manager（背後是 Redis / Dragonfly），跟既有 DistributedLockService
 * 同一條 cacheManager，無新依賴。
 */
@Injectable()
export class IpLockoutService {
  // 觸發 IP 鎖定的失敗次數門檻
  private readonly MAX_FAILED_ATTEMPTS = 20;
  // 鎖定持續時間（分鐘）
  private readonly LOCKOUT_MINUTES = 60;
  // 失敗計數的滾動視窗（分鐘）— counter TTL
  private readonly WINDOW_MINUTES = 15;

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  private counterKey(ip: string): string {
    return `auth:ipfail:${ip}`;
  }

  private lockKey(ip: string): string {
    return `auth:iplock:${ip}`;
  }

  async check(ipAddress?: string): Promise<IpLockInfo> {
    if (!ipAddress) {
      return { isLocked: false, failedAttempts: 0, remainingMinutes: 0 };
    }
    try {
      const lockMarker = await this.cacheManager.get<string>(
        this.lockKey(ipAddress),
      );
      if (!lockMarker) {
        return { isLocked: false, failedAttempts: 0, remainingMinutes: 0 };
      }
      const attemptsRaw = await this.cacheManager.get<string | number>(
        this.counterKey(ipAddress),
      );
      const attempts =
        typeof attemptsRaw === 'number'
          ? attemptsRaw
          : Number.parseInt(String(attemptsRaw ?? '0'), 10) || 0;
      // cache-manager 沒統一 TTL 查詢介面；不嚴格，用設定上限近似
      return {
        isLocked: true,
        failedAttempts: attempts,
        remainingMinutes: this.LOCKOUT_MINUTES,
      };
    } catch (err) {
      // Redis 不可用就放行，不阻擋登入（fail-open）
      logger.warn('[IpLockout] check failed, bypassing', {
        ip: ipAddress,
        error: (err as Error).message,
      });
      return { isLocked: false, failedAttempts: 0, remainingMinutes: 0 };
    }
  }

  async recordFailedLogin(ipAddress?: string): Promise<IpLockInfo> {
    if (!ipAddress) {
      return { isLocked: false, failedAttempts: 0, remainingMinutes: 0 };
    }
    try {
      const counter = this.counterKey(ipAddress);
      // cache-manager 沒原生 INCR，用 get + set 模擬（race condition 可接受 — 防 brute force 不需精確）
      const prevRaw = await this.cacheManager.get<string | number>(counter);
      const prev =
        typeof prevRaw === 'number'
          ? prevRaw
          : Number.parseInt(String(prevRaw ?? '0'), 10) || 0;
      const attempts = prev + 1;
      await this.cacheManager.set(
        counter,
        attempts,
        this.WINDOW_MINUTES * 60 * 1000,
      );

      if (attempts >= this.MAX_FAILED_ATTEMPTS) {
        await this.cacheManager.set(
          this.lockKey(ipAddress),
          '1',
          this.LOCKOUT_MINUTES * 60 * 1000,
        );
        logger.warn(
          `[IpLockout] IP ${ipAddress} locked for ${this.LOCKOUT_MINUTES} min ` +
            `after ${attempts} failed logins within ${this.WINDOW_MINUTES} min`,
        );
        return {
          isLocked: true,
          failedAttempts: attempts,
          remainingMinutes: this.LOCKOUT_MINUTES,
        };
      }
      return { isLocked: false, failedAttempts: attempts, remainingMinutes: 0 };
    } catch (err) {
      logger.warn('[IpLockout] record failed, bypassing', {
        ip: ipAddress,
        error: (err as Error).message,
      });
      return { isLocked: false, failedAttempts: 0, remainingMinutes: 0 };
    }
  }

  async reset(ipAddress?: string): Promise<void> {
    if (!ipAddress) return;
    try {
      await this.cacheManager.del(this.counterKey(ipAddress));
      // 故意不刪 lock marker — 已鎖的 IP 即使後續猜對也要等鎖滿
    } catch (err) {
      logger.warn('[IpLockout] reset failed, bypassing', {
        ip: ipAddress,
        error: (err as Error).message,
      });
    }
  }
}
