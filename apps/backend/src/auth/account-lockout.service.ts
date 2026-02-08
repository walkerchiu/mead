import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { NotificationService } from '../notification/notification.service';
import { logger } from '../common/services/logger.service';

export interface AccountLockInfo {
  isLocked: boolean;
  lockedUntil?: Date;
  remainingMinutes?: number;
  failedAttempts: number;
}

@Injectable()
export class AccountLockoutService {
  // 配置常數
  private readonly MAX_FAILED_ATTEMPTS = 5; // 最大失敗次數
  private readonly LOCKOUT_DURATION_MINUTES = 15; // 鎖定時長（分鐘）
  private readonly RESET_WINDOW_MINUTES = 30; // 失敗次數重設視窗（分鐘）

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private mailService: MailService,
    private notificationService: NotificationService,
  ) {}

  /**
   * 檢查帳號是否被鎖定
   */
  async isAccountLocked(userId: string): Promise<AccountLockInfo> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        failedLoginAttempts: true,
        lastFailedLoginAt: true,
        lockedUntil: true,
      },
    });

    if (!user) {
      return { isLocked: false, failedAttempts: 0 };
    }

    // 檢查是否仍在鎖定期
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const remainingMs = user.lockedUntil.getTime() - Date.now();
      const remainingMinutes = Math.ceil(remainingMs / 60000);

      logger.warn('[AccountLockout] Account is locked', {
        userId,
        lockedUntil: user.lockedUntil,
        remainingMinutes,
      });

      return {
        isLocked: true,
        lockedUntil: user.lockedUntil,
        remainingMinutes,
        failedAttempts: user.failedLoginAttempts,
      };
    }

    // 鎖定期已過，自動解鎖
    if (user.lockedUntil && user.lockedUntil <= new Date()) {
      await this.unlockAccount(userId);
      return { isLocked: false, failedAttempts: 0 };
    }

    return {
      isLocked: false,
      failedAttempts: user.failedLoginAttempts,
    };
  }

  /**
   * 記錄登入失敗
   */
  async recordFailedLogin(
    userId: string,
    email: string,
    ipAddress?: string,
  ): Promise<AccountLockInfo> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        failedLoginAttempts: true,
        lastFailedLoginAt: true,
      },
    });

    if (!user) {
      return { isLocked: false, failedAttempts: 0 };
    }

    // 檢查是否需要重設失敗計數器（超過視窗時間）
    let failedAttempts = user.failedLoginAttempts + 1;
    if (user.lastFailedLoginAt) {
      const minutesSinceLastFailed =
        (Date.now() - user.lastFailedLoginAt.getTime()) / 60000;
      if (minutesSinceLastFailed > this.RESET_WINDOW_MINUTES) {
        failedAttempts = 1; // 重設為1
      }
    }

    const shouldLock = failedAttempts >= this.MAX_FAILED_ATTEMPTS;
    const lockedUntil = shouldLock
      ? new Date(Date.now() + this.LOCKOUT_DURATION_MINUTES * 60000)
      : null;

    // 更新資料庫
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        failedLoginAttempts: failedAttempts,
        lastFailedLoginAt: new Date(),
        lockedUntil,
      },
    });

    logger.warn('[AccountLockout] Login failed recorded', {
      userId,
      email,
      failedAttempts,
      shouldLock,
      ipAddress,
    });

    // 如果剛被鎖定，發送通知
    if (shouldLock) {
      logger.error('[AccountLockout] Account locked due to failed attempts', {
        userId,
        email,
        failedAttempts,
        lockedUntil,
      });

      // 發送鎖定通知（email + 系統通知）
      try {
        await this.mailService.sendAccountLockedEmail(
          email,
          user.name,
          this.LOCKOUT_DURATION_MINUTES,
          ipAddress,
        );
      } catch (error) {
        logger.error('[AccountLockout] Failed to send lock email', {
          error,
        });
      }

      if (
        this.config.get<string>('PUSH_NOTIFY_ACCOUNT_LOCKED', 'true') !==
        'false'
      ) {
        try {
          await this.notificationService.createLocalizedNotification(
            userId,
            'WARNING',
            'ACCOUNT_LOCKED',
            [failedAttempts, this.LOCKOUT_DURATION_MINUTES],
            {
              event: 'ACCOUNT_LOCKED',
              failedAttempts,
              lockoutMinutes: this.LOCKOUT_DURATION_MINUTES,
              ipAddress,
            },
          );
        } catch (error) {
          logger.error(
            '[AccountLockout] Failed to create system notification',
            {
              error,
            },
          );
        }
      }

      return {
        isLocked: true,
        lockedUntil,
        remainingMinutes: this.LOCKOUT_DURATION_MINUTES,
        failedAttempts,
      };
    }

    return {
      isLocked: false,
      failedAttempts,
    };
  }

  /**
   * 重設失敗次數（登入成功時調用）
   */
  async resetFailedAttempts(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        failedLoginAttempts: 0,
        lastFailedLoginAt: null,
        lockedUntil: null,
      },
    });

    logger.debug('[AccountLockout] Failed attempts reset', { userId });
  }

  /**
   * 手動解鎖帳號（管理員功能）
   */
  async unlockAccount(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        failedLoginAttempts: 0,
        lastFailedLoginAt: null,
        lockedUntil: null,
      },
    });

    logger.info('[AccountLockout] Account manually unlocked', { userId });
  }

  /**
   * 取得帳號鎖定狀態
   */
  async getAccountStatus(userId: string): Promise<AccountLockInfo> {
    return this.isAccountLocked(userId);
  }
}
