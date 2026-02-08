import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationPubSubService } from './notification-pubsub.service';
import { CacheService } from '../cache/cache.service';
import { DistributedLockService } from '../cache/distributed-lock.service';
import { CronJobMonitorService } from '../cron-monitoring/cron-job-monitor.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CronJobStatus } from '@prisma/client';
import {
  NotificationType as PrismaNotificationType,
  Notification,
  Prisma,
} from '@prisma/client';
import { logger } from '../common/services/logger.service';
import { RequestContextService } from '../common/request-context/request-context.service';
import {
  CreateNotificationInput,
  CreateBulkNotificationsInput,
} from './notification.types';

/**
 * 帳號安全通知的多語系文案
 */
const SECURITY_NOTIFICATION_MESSAGES: Record<
  string,
  Record<
    string,
    { title: string; message: string | ((...args: any[]) => string) }
  >
> = {
  PASSWORD_CHANGED_SELF: {
    en: {
      title: 'Password Changed',
      message: 'Your password has been changed successfully.',
    },
    'zh-TW': { title: '密碼已變更', message: '您的密碼已成功變更。' },
  },
  PASSWORD_CHANGED_RESET: {
    en: {
      title: 'Password Changed',
      message: 'Your password has been changed via password reset.',
    },
    'zh-TW': {
      title: '密碼已變更',
      message: '您的密碼已透過密碼重設功能成功變更。',
    },
  },
  PASSWORD_CHANGED_HQ: {
    en: {
      title: 'Password Reset by Admin',
      message:
        'An administrator has reset your password. Please sign in with your new password.',
    },
    'zh-TW': {
      title: '密碼已被管理員重設',
      message: '管理員已重設您的密碼。請使用新密碼登入。',
    },
  },
  ACCOUNT_LOCKED: {
    en: {
      title: 'Account Temporarily Locked',
      message: (attempts: number, minutes: number) =>
        `Your account has been locked for ${minutes} minutes due to ${attempts} consecutive failed login attempts.`,
    },
    'zh-TW': {
      title: '帳號已暫時鎖定',
      message: (attempts: number, minutes: number) =>
        `您的帳號因連續 ${attempts} 次登入失敗已被鎖定 ${minutes} 分鐘。`,
    },
  },
  SESSION_REVOKED: {
    en: {
      title: 'Session Terminated',
      message: (admin: string, device: string, reason: string) =>
        `Administrator ${admin} has terminated your session (${device}). Reason: ${reason}`,
    },
    'zh-TW': {
      title: '會話已被終止',
      message: (admin: string, device: string, reason: string) =>
        `管理員 ${admin} 已終止您的一個登入會話（${device}）。原因：${reason}`,
    },
  },
  BATCH_SESSIONS_REVOKED: {
    en: {
      title: 'Multiple Sessions Terminated',
      message: (admin: string, count: number, reason: string) =>
        `Administrator ${admin} has terminated ${count} of your sessions. Reason: ${reason}`,
    },
    'zh-TW': {
      title: '多個會話已被終止',
      message: (admin: string, count: number, reason: string) =>
        `管理員 ${admin} 已終止您的 ${count} 個登入會話。原因：${reason}`,
    },
  },
  PAT_CREATED: {
    en: {
      title: 'Personal Access Token Created',
      message: (tokenName: string, expiresInDays: number) =>
        `A new personal access token "${tokenName}" has been created, valid for ${expiresInDays} days.`,
    },
    'zh-TW': {
      title: '個人存取權杖已建立',
      message: (tokenName: string, expiresInDays: number) =>
        `已建立新的個人存取權杖「${tokenName}」，有效期 ${expiresInDays} 天。`,
    },
  },
  PAT_REVOKED: {
    en: {
      title: 'Personal Access Token Revoked',
      message: (tokenName: string) =>
        `Your personal access token "${tokenName}" has been revoked and can no longer be used.`,
    },
    'zh-TW': {
      title: '個人存取權杖已撤銷',
      message: (tokenName: string) =>
        `您的個人存取權杖「${tokenName}」已被撤銷，無法再使用。`,
    },
  },
};

// 合併所有通知文案到一個 map
const ALL_NOTIFICATION_MESSAGES: Record<
  string,
  Record<
    string,
    { title: string; message: string | ((...args: any[]) => string) }
  >
> = {
  ...SECURITY_NOTIFICATION_MESSAGES,
};

/**
 * NotificationService
 *
 * 負責通知的業務邏輯：
 * - 建立通知（單一/批次）
 * - 查詢通知列表
 * - 標記已讀
 * - 刪除通知
 * - 統計未讀數量
 */
@Injectable()
export class NotificationService {
  constructor(
    private prisma: PrismaService,
    private notificationPubSub: NotificationPubSubService,
    private cacheService: CacheService,
    private distributedLockService: DistributedLockService,
    @Inject(forwardRef(() => CronJobMonitorService))
    private cronMonitorService: CronJobMonitorService,
    @Inject(forwardRef(() => AuditLogService))
    private auditLogService: AuditLogService,
    private requestContext: RequestContextService,
  ) {}

  /**
   * 建立並發送通知給單一用戶
   *
   * @param input - 通知資料
   * @returns 建立的通知
   */
  async createNotification(input: CreateNotificationInput) {
    // 檢查用戶是否啟用了此類型的通知
    const typeEnabled = await this.isNotificationTypeEnabled(
      input.userId,
      input.type as 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR',
    );
    if (!typeEnabled) {
      logger.debug(
        `[NotificationService] User ${input.userId} has ${input.type} notifications disabled, skipping`,
      );
      return null;
    }

    logger.info('[NotificationService] Creating notification', {
      userId: input.userId,
      type: input.type,
      title: input.title,
    });

    const notification = await this.prisma.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        title: input.title,
        message: input.message,
        data: input.data,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    // 即時推送通知
    await this.notificationPubSub.emitNotificationCreated(
      input.userId,
      notification,
    );

    // 清除快取
    await this.cacheService.invalidateUserNotifications(input.userId);
    await this.cacheService.invalidateUnreadCount(input.userId);

    logger.info('[NotificationService] Notification created and emitted', {
      id: notification.id,
      userId: notification.userId,
    });

    return notification;
  }

  /**
   * 建立多語系通知 — 自動根據用戶的 profile.language 選擇對應語言文案
   *
   * @param userId - 用戶 ID
   * @param type - 通知類型
   * @param messageKey - SECURITY_NOTIFICATION_MESSAGES 中的鍵名
   * @param messageArgs - 訊息模板的動態參數
   * @param data - 附加資料
   */
  async createLocalizedNotification(
    userId: string,
    type: PrismaNotificationType,
    messageKey: string,
    messageArgs: any[] = [],
    data?: any,
  ) {
    // 查詢用戶偏好語言
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { language: true },
    });
    const lang = profile?.language || 'en';

    const messages = ALL_NOTIFICATION_MESSAGES[messageKey];
    if (!messages) {
      logger.warn(`[NotificationService] Unknown message key: ${messageKey}`);
      return;
    }

    const localized = messages[lang] || messages['en'];
    const title = localized.title;
    const message =
      typeof localized.message === 'function'
        ? localized.message(...messageArgs)
        : localized.message;

    return this.createNotification({ userId, type, title, message, data });
  }

  /**
   * 批次建立多語系通知 — 對多位用戶分別查詢語言偏好，排除指定的觸發者
   *
   * @param userIds - 用戶 ID 列表
   * @param excludeUserId - 要排除的觸發者 ID
   * @param type - 通知類型
   * @param messageKey - 通知文案鍵名
   * @param messageArgs - 訊息模板的動態參數
   * @param data - 附加資料
   */
  async createBulkLocalizedNotifications(
    userIds: string[],
    excludeUserId: string,
    type: PrismaNotificationType,
    messageKey: string,
    messageArgs: any[] = [],
    data?: any,
  ) {
    const filteredIds = [...new Set(userIds)].filter(
      (id) => id !== excludeUserId,
    );
    if (filteredIds.length === 0) return;

    const results = await Promise.allSettled(
      filteredIds.map((userId) =>
        this.createLocalizedNotification(
          userId,
          type,
          messageKey,
          messageArgs,
          data,
        ),
      ),
    );

    const failed = results.filter((r) => r.status === 'rejected');
    if (failed.length > 0) {
      logger.warn(
        `[NotificationService] ${failed.length}/${filteredIds.length} bulk localized notifications failed`,
      );
    }
  }

  /**
   * 批次建立並發送通知給多個用戶
   *
   * @param input - 批次通知資料
   * @returns 建立的通知數量
   */
  async createBulkNotifications(input: CreateBulkNotificationsInput) {
    logger.info('[NotificationService] Creating bulk notifications', {
      userCount: input.userIds.length,
      type: input.type,
      title: input.title,
    });

    const notifications = await Promise.all(
      input.userIds.map((userId) =>
        this.createNotification({
          userId,
          type: input.type,
          title: input.title,
          message: input.message,
          data: input.data,
        }),
      ),
    );

    logger.info('[NotificationService] Bulk notifications created', {
      count: notifications.length,
    });

    return notifications;
  }

  /**
   * 取得用戶的通知列表
   *
   * @param userId - 用戶 ID
   * @param options - 查詢選項
   * @returns 通知列表和總數
   */
  async getUserNotifications(
    userId: string,
    options?: {
      isRead?: boolean;
      type?: PrismaNotificationType;
      limit?: number;
      offset?: number;
    },
  ) {
    // 建立快取鍵（使用選項參數）
    const cacheKey = JSON.stringify({
      isRead: options?.isRead,
      type: options?.type,
      limit: options?.limit || 20,
      offset: options?.offset || 0,
    });

    // 嘗試從快取讀取
    const cached = await this.cacheService.getCachedNotifications<{
      notifications: Notification[];
      total: number;
      unreadCount: number;
    }>(userId, cacheKey);

    if (cached) {
      logger.debug('[NotificationService] Cache HIT for getUserNotifications', {
        userId,
      });
      return cached;
    }

    logger.debug('[NotificationService] Cache MISS for getUserNotifications', {
      userId,
    });

    const where: Prisma.NotificationWhereInput = {
      userId,
      ...(options?.isRead !== undefined && { isRead: options.isRead }),
      ...(options?.type && { type: options.type }),
    };

    const [notifications, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: options?.limit || 20,
        skip: options?.offset || 0,
      }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({
        where: {
          userId,
          isRead: false,
        },
      }),
    ]);

    const result = {
      notifications: notifications || [],
      total: total || 0,
      unreadCount: unreadCount || 0,
    };

    // 存入快取 (3 分鐘)
    await this.cacheService.cacheNotifications(userId, cacheKey, result, 180);

    return result;
  }

  /**
   * 取得單一通知
   *
   * @param notificationId - 通知 ID
   * @param userId - 用戶 ID（用於權限檢查）
   * @returns 通知
   */
  async getNotification(notificationId: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to access this notification',
      );
    }

    return notification;
  }

  /**
   * 標記通知為已讀
   *
   * @param notificationId - 通知 ID
   * @param userId - 用戶 ID（用於權限檢查）
   * @returns 更新後的通知
   */
  async markAsRead(notificationId: string, userId: string) {
    logger.info('[NotificationService] Marking notification as read', {
      notificationId,
      userId,
    });

    // 先檢查通知是否存在且屬於該用戶
    const notification = await this.getNotification(notificationId, userId);

    if (notification.isRead) {
      logger.debug('[NotificationService] Notification already read', {
        notificationId,
      });
      return notification;
    }

    const updatedNotification = await this.prisma.notification.update({
      where: {
        id: notificationId,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    // 發布已讀事件
    await this.notificationPubSub.emitNotificationRead(userId, notificationId);

    // 清除快取
    await this.cacheService.invalidateUserNotifications(userId);
    await this.cacheService.invalidateUnreadCount(userId);

    // 記錄審計日誌
    await this.auditLogService.create({
      requestId: this.requestContext.getRequestIdOrGenerate(),
      userId,
      action: 'MARK_NOTIFICATION_AS_READ',
      entity: 'Notification',
      entityId: notificationId,
      status: 'SUCCESS',
      method: 'NOTIFICATION',
      details: {
        notificationId,
        title: notification.title,
        type: notification.type,
      },
    });

    logger.info('[NotificationService] Notification marked as read', {
      notificationId,
      userId,
    });

    return updatedNotification;
  }

  /**
   * 標記所有通知為已讀
   *
   * @param userId - 用戶 ID
   * @returns 更新的數量
   */
  async markAllAsRead(userId: string) {
    logger.info('[NotificationService] Marking all notifications as read', {
      userId,
    });

    const result = await this.prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    // 清除快取
    await this.cacheService.invalidateUserNotifications(userId);
    await this.cacheService.invalidateUnreadCount(userId);

    // 記錄審計日誌
    await this.auditLogService.create({
      requestId: this.requestContext.getRequestIdOrGenerate(),
      userId,
      action: 'MARK_ALL_NOTIFICATIONS_AS_READ',
      entity: 'Notification',
      status: 'SUCCESS',
      method: 'NOTIFICATION',
      details: {
        count: result.count,
      },
    });

    logger.info('[NotificationService] All notifications marked as read', {
      userId,
      count: result.count,
    });

    return result.count;
  }

  /**
   * 刪除通知
   *
   * @param notificationId - 通知 ID
   * @param userId - 用戶 ID（用於權限檢查）
   */
  async deleteNotification(notificationId: string, userId: string) {
    logger.info('[NotificationService] Deleting notification', {
      notificationId,
      userId,
    });

    // 先檢查通知是否存在且屬於該用戶
    const notification = await this.getNotification(notificationId, userId);

    await this.prisma.notification.delete({
      where: { id: notificationId },
    });

    // 清除快取
    await this.cacheService.invalidateUserNotifications(userId);
    await this.cacheService.invalidateUnreadCount(userId);

    // 記錄審計日誌
    await this.auditLogService.create({
      requestId: this.requestContext.getRequestIdOrGenerate(),
      userId,
      action: 'DELETE_NOTIFICATION',
      entity: 'Notification',
      entityId: notificationId,
      status: 'SUCCESS',
      method: 'NOTIFICATION',
      details: {
        notificationId,
        title: notification.title,
        type: notification.type,
        isRead: notification.isRead,
      },
    });

    logger.info('[NotificationService] Notification deleted', {
      notificationId,
      userId,
    });
  }

  /**
   * 批次刪除已讀通知
   *
   * @param userId - 用戶 ID
   * @returns 刪除的數量
   */
  async deleteReadNotifications(userId: string) {
    logger.info('[NotificationService] Deleting read notifications', {
      userId,
    });

    const result = await this.prisma.notification.deleteMany({
      where: {
        userId,
        isRead: true,
      },
    });

    // 清除快取
    await this.cacheService.invalidateUserNotifications(userId);
    await this.cacheService.invalidateUnreadCount(userId);

    // 記錄審計日誌
    await this.auditLogService.create({
      requestId: this.requestContext.getRequestIdOrGenerate(),
      userId,
      action: 'DELETE_READ_NOTIFICATIONS',
      entity: 'Notification',
      status: 'SUCCESS',
      method: 'NOTIFICATION',
      details: {
        count: result.count,
      },
    });

    logger.info('[NotificationService] Read notifications deleted', {
      userId,
      count: result.count,
    });

    return result.count;
  }

  /**
   * 取得未讀通知數量
   *
   * @param userId - 用戶 ID
   * @returns 未讀數量
   */
  async getUnreadCount(userId: string): Promise<number> {
    // 嘗試從快取讀取
    const cached = await this.cacheService.getCachedUnreadCount(userId);
    if (cached !== null) {
      logger.debug('[NotificationService] Cache HIT for getUnreadCount', {
        userId,
        count: cached,
      });
      return cached;
    }

    logger.debug('[NotificationService] Cache MISS for getUnreadCount', {
      userId,
    });

    const count = await this.prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });

    // 存入快取 (2 分鐘)
    await this.cacheService.cacheUnreadCount(userId, count, 120);

    return count;
  }

  /**
   * 清理舊通知（例如：刪除 30 天前的已讀通知）
   * 此方法應該被排程任務呼叫
   *
   * @param daysOld - 天數（預設 30 天）
   * @returns 刪除的數量
   */
  async cleanupOldNotifications(daysOld: number = 30) {
    logger.info('[NotificationService] Cleaning up old notifications', {
      daysOld,
    });

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await this.prisma.notification.deleteMany({
      where: {
        isRead: true,
        readAt: {
          lte: cutoffDate,
        },
      },
    });

    logger.info('[NotificationService] Old notifications cleaned up', {
      count: result.count,
      cutoffDate,
    });

    return result.count;
  }

  /**
   * 取得用戶通知偏好設定
   * 如果不存在，自動建立預設設定
   *
   * @param userId - 用戶 ID
   * @returns 通知偏好設定
   */
  async getNotificationPreferences(userId: string) {
    try {
      logger.info('[NotificationService] Getting notification preferences', {
        userId,
      });

      let preferences = await this.prisma.notificationPreferences.findUnique({
        where: { userId },
      });

      logger.info('[NotificationService] Query result', {
        userId,
        found: !!preferences,
        preferencesId: preferences?.id || null,
      });

      // 如果不存在，建立預設設定
      if (!preferences) {
        logger.info(
          '[NotificationService] Preferences not found, creating default',
          {
            userId,
          },
        );

        try {
          // 先檢查用戶是否存在
          const user = await this.prisma.user.findUnique({
            where: { id: userId },
          });

          logger.info('[NotificationService] User lookup result', {
            userId,
            found: !!user,
            userEmail: user?.email || null,
          });

          if (!user) {
            logger.error('[NotificationService] User not found', { userId });
            throw new Error(`User not found: ${userId}`);
          }

          logger.info('[NotificationService] Creating preferences', {
            userId,
          });

          preferences = await this.prisma.notificationPreferences.create({
            data: {
              userId,
              // 預設值已在 Prisma schema 中定義
            },
          });

          logger.info('[NotificationService] Default preferences created', {
            userId,
            preferencesId: preferences.id,
            preferences: preferences,
          });
        } catch (error) {
          logger.error('[NotificationService] Failed to create preferences', {
            userId,
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
          });
          throw error;
        }
      }

      logger.info('[NotificationService] Returning preferences', {
        userId,
        preferencesId: preferences?.id || null,
        hasAllFields: !!(
          preferences?.id &&
          preferences?.userId &&
          preferences?.createdAt &&
          preferences?.updatedAt
        ),
      });

      return preferences;
    } catch (error) {
      logger.error('[NotificationService] getNotificationPreferences error', {
        userId,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }

  /**
   * 更新用戶通知偏好設定
   *
   * @param userId - 用戶 ID
   * @param data - 更新的資料
   * @returns 更新後的通知偏好設定
   */
  async updateNotificationPreferences(
    userId: string,
    data: {
      enableInfo?: boolean;
      enableSuccess?: boolean;
      enableWarning?: boolean;
      enableError?: boolean;
      enableBrowser?: boolean;
      enableEmail?: boolean;
      enablePush?: boolean;
      enableSound?: boolean;
      enableDesktop?: boolean;
      enableMobile?: boolean;
    },
  ) {
    logger.info('[NotificationService] Updating notification preferences', {
      userId,
      data,
    });

    // 確保偏好設定存在
    await this.getNotificationPreferences(userId);

    // 更新設定
    const preferences = await this.prisma.notificationPreferences.update({
      where: { userId },
      data,
    });

    logger.info('[NotificationService] Notification preferences updated', {
      userId,
      preferencesId: preferences?.id,
      hasId: !!preferences?.id,
      hasUserId: !!preferences?.userId,
      allFields: Object.keys(preferences || {}),
    });

    logger.info('[NotificationService] Full preferences object:', preferences);

    return preferences;
  }

  /**
   * 檢查用戶是否啟用了特定類型的通知
   * 用於過濾通知發送
   *
   * @param userId - 用戶 ID
   * @param type - 通知類型
   * @returns 是否啟用
   */
  async isNotificationTypeEnabled(
    userId: string,
    type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR',
  ): Promise<boolean> {
    const preferences = await this.getNotificationPreferences(userId);

    switch (type) {
      case 'INFO':
        return preferences.enableInfo;
      case 'SUCCESS':
        return preferences.enableSuccess;
      case 'WARNING':
        return preferences.enableWarning;
      case 'ERROR':
        return preferences.enableError;
      default:
        return true;
    }
  }

  /**
   * 定期清理舊通知（Cron Job）
   *
   * 排程：每天凌晨 02:00（台北時區）
   * 保留期限：30 天（已讀通知）
   *
   * 此 Cron Job 會自動清理已讀且超過 30 天的舊通知，
   * 以保持資料庫整潔並減少儲存空間使用。
   *
   * 使用分散式鎖防止多實例重複執行
   */
  @Cron('0 2 * * *', {
    name: 'cleanup-old-notifications',
    timeZone: 'Asia/Taipei',
  })
  async handleNotificationCleanup(): Promise<void> {
    const jobName = 'cleanup-old-notifications';
    const jobType = 'cleanup';
    const instanceId = process.env.INSTANCE_ID || 'default';

    // 記錄執行開始
    const executionId = await this.cronMonitorService.startExecution({
      jobName,
      jobType,
      instanceId,
    });

    try {
      // 使用分散式鎖執行任務
      // TTL: 600 秒（10 分鐘），足夠執行整個清理任務
      await this.distributedLockService.executeWithLock(
        'cron:cleanup-old-notifications',
        async () => {
          logger.info(
            '[Notification Cron] Starting scheduled notification cleanup',
            {
              executionId,
            },
          );

          const deletedCount = await this.cleanupOldNotifications(30);

          logger.info(
            '[Notification Cron] Notification cleanup completed successfully',
            {
              deletedCount,
              retentionDays: 30,
              nextRun: 'Tomorrow 02:00',
            },
          );

          // 記錄執行成功
          await this.cronMonitorService.completeExecution({
            executionId,
            status: CronJobStatus.SUCCESS,
            processedCount: deletedCount,
            successCount: deletedCount,
            errorCount: 0,
            details: {
              retentionDays: 30,
            },
          });
        },
        600, // TTL: 10 分鐘
      );
    } catch (error) {
      logger.error('[Notification Cron] Notification cleanup failed', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        executionId,
      });

      // 記錄執行失敗
      await this.cronMonitorService.completeExecution({
        executionId,
        status: CronJobStatus.FAILED,
        errorMessage: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined,
      });

      // 檢查告警
      await this.cronMonitorService.checkAndAlert(executionId);

      throw error;
    }
  }
}
