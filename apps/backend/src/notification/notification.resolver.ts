/* eslint-disable @typescript-eslint/no-explicit-any */

import { Query, Resolver, Mutation, Subscription, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationPubSubService } from './notification-pubsub.service';
import {
  NotificationGQLType,
  NotificationListResponse,
  NotificationFilterInput,
} from './notification.types';
import {
  NotificationPreferencesGQLType,
  UpdateNotificationPreferencesInput,
} from './notification-preferences.types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { logger } from '../common/services/logger.service';

/**
 * NotificationResolver
 *
 * 提供通知相關的 GraphQL API：
 * - 查詢：通知列表、未讀數量
 * - 變更：標記已讀、刪除通知
 * - 訂閱：即時通知推送
 */
@Resolver(() => NotificationGQLType)
export class NotificationResolver {
  constructor(
    private notificationService: NotificationService,
    private notificationPubSub: NotificationPubSubService,
  ) {}

  /**
   * 查詢：取得用戶通知列表
   */
  @Query(() => NotificationListResponse, {
    description: '取得用戶通知列表',
  })
  @UseGuards(JwtAuthGuard)
  async notifications(
    @CurrentUser() user: any,
    @Args('filter', { nullable: true }) filter?: NotificationFilterInput,
  ): Promise<NotificationListResponse> {
    logger.debug('[NotificationResolver] Fetching notifications', {
      userId: user?.id || user?.userId || user?.sub,
      filter,
    });

    return this.notificationService.getUserNotifications(
      user?.id || user?.userId || user?.sub,
      {
        isRead: filter?.isRead,
        type: filter?.type,
        limit: filter?.limit,
        offset: filter?.offset,
      },
    );
  }

  /**
   * 查詢：取得未讀通知數量
   */
  @Query(() => Number, {
    description: '取得未讀通知數量',
  })
  @UseGuards(JwtAuthGuard)
  async unreadNotificationCount(@CurrentUser() user: any): Promise<number> {
    logger.debug('[NotificationResolver] Fetching unread count', {
      userId: user?.id || user?.userId || user?.sub,
    });

    return this.notificationService.getUnreadCount(
      user?.id || user?.userId || user?.sub,
    );
  }

  /**
   * 變更：標記通知為已讀
   */
  @Mutation(() => NotificationGQLType, {
    description: '標記通知為已讀',
  })
  @UseGuards(JwtAuthGuard)
  async markNotificationAsRead(
    @CurrentUser() user: any,
    @Args('id') id: string,
  ): Promise<NotificationGQLType> {
    logger.debug('[NotificationResolver] Marking notification as read', {
      userId: user?.id || user?.userId || user?.sub,
      notificationId: id,
    });

    return this.notificationService.markAsRead(
      id,
      user?.id || user?.userId || user?.sub,
    );
  }

  /**
   * 變更：標記所有通知為已讀
   */
  @Mutation(() => Number, {
    description: '標記所有通知為已讀',
  })
  @UseGuards(JwtAuthGuard)
  async markAllNotificationsAsRead(@CurrentUser() user: any): Promise<number> {
    logger.debug('[NotificationResolver] Marking all notifications as read', {
      userId: user?.id || user?.userId || user?.sub,
    });

    return this.notificationService.markAllAsRead(
      user?.id || user?.userId || user?.sub,
    );
  }

  /**
   * 變更：刪除通知
   */
  @Mutation(() => Boolean, {
    description: '刪除通知',
  })
  @UseGuards(JwtAuthGuard)
  async deleteNotification(
    @CurrentUser() user: any,
    @Args('id') id: string,
  ): Promise<boolean> {
    logger.debug('[NotificationResolver] Deleting notification', {
      userId: user?.id || user?.userId || user?.sub,
      notificationId: id,
    });

    await this.notificationService.deleteNotification(
      id,
      user?.id || user?.userId || user?.sub,
    );
    return true;
  }

  /**
   * 變更：刪除所有已讀通知
   */
  @Mutation(() => Number, {
    description: '刪除所有已讀通知',
  })
  @UseGuards(JwtAuthGuard)
  async deleteReadNotifications(@CurrentUser() user: any): Promise<number> {
    logger.debug('[NotificationResolver] Deleting read notifications', {
      userId: user?.id || user?.userId || user?.sub,
    });

    return this.notificationService.deleteReadNotifications(
      user?.id || user?.userId || user?.sub,
    );
  }

  /**
   * 查詢：取得用戶通知偏好設定
   */
  @Query(() => NotificationPreferencesGQLType, {
    description: '取得用戶通知偏好設定',
  })
  @UseGuards(JwtAuthGuard)
  async myNotificationPreferences(
    @CurrentUser() user: any,
  ): Promise<NotificationPreferencesGQLType> {
    // user 物件可能有 id, userId, 或 sub 屬性
    const userId = user?.id || user?.userId || user?.sub;

    logger.info('[NotificationResolver] Fetching notification preferences', {
      hasUser: !!user,
      userId,
      userKeys: user ? Object.keys(user) : [],
    });

    if (!user || !userId) {
      logger.error('[NotificationResolver] User not found or missing ID', {
        user,
      });
      throw new Error('User not authenticated or missing ID');
    }

    return this.notificationService.getNotificationPreferences(userId);
  }

  /**
   * 變更：更新用戶通知偏好設定
   */
  @Mutation(() => NotificationPreferencesGQLType, {
    description: '更新用戶通知偏好設定',
  })
  @UseGuards(JwtAuthGuard)
  async updateMyNotificationPreferences(
    @CurrentUser() user: any,
    @Args('input') input: UpdateNotificationPreferencesInput,
  ): Promise<NotificationPreferencesGQLType> {
    const userId = user?.id || user?.userId || user?.sub;

    logger.info('[NotificationResolver] Updating notification preferences', {
      userId,
      input,
    });

    if (!userId) {
      throw new Error('User not authenticated or missing ID');
    }

    return this.notificationService.updateNotificationPreferences(
      userId,
      input,
    );
  }

  /**
   * 訂閱：用戶通知（即時推送）
   *
   * 權限檢查在 filter 中進行（因為 Guards 在 Subscription 中不生效）
   * 用戶只能訂閱自己的通知
   */
  @Subscription(() => NotificationGQLType, {
    name: 'notificationCreated',
    description: '訂閱新通知（即時推送）',
    filter: (payload, variables, context) => {
      try {
        // 從 connectionParams 解析 JWT 獲取 user
        const authHeader = context?.connectionParams?.authorization || '';
        const token = authHeader.replace('Bearer ', '');

        if (!token) {
          logger.debug(
            '[Notification Subscription Filter] No token in connectionParams',
          );
          return false;
        }

        // 解析 JWT（不驗證簽名，因為 onConnect 已經驗證過）
        const jwtPayload = JSON.parse(
          Buffer.from(token.split('.')[1], 'base64').toString(),
        );

        const userId = jwtPayload.sub;
        const notificationUserId = payload.notificationCreated.userId;

        logger.debug(
          '[Notification Subscription Filter] Checking notification ownership',
          {
            userId,
            notificationUserId,
            match: userId === notificationUserId,
          },
        );

        // 確保用戶只能收到自己的通知
        return userId === notificationUserId;
      } catch (error) {
        logger.error(
          '[Notification Subscription Filter] Error parsing token',
          error,
        );
        return false;
      }
    },
  })
  notificationCreated(@CurrentUser() user: any) {
    logger.debug(
      '[NotificationResolver] Setting up notification subscription',
      {
        userId: user?.id || 'unknown',
      },
    );

    // 如果 user 不存在（在 filter 中會被驗證），使用一個不會匹配的 ID
    const userId = user?.id || 'invalid-user-id';

    return this.notificationPubSub.subscribeToNotificationCreated(userId);
  }

  /**
   * 訂閱：系統廣播通知（所有用戶）
   *
   * 任何已認證的用戶都可以訂閱
   */
  @Subscription(() => NotificationGQLType, {
    name: 'notificationBroadcast',
    description: '訂閱系統廣播通知',
    filter: (payload, variables, context) => {
      try {
        // 只需檢查是否有有效的 token
        const authHeader = context?.connectionParams?.authorization || '';
        const token = authHeader.replace('Bearer ', '');

        if (!token) {
          logger.debug(
            '[Broadcast Subscription Filter] No token in connectionParams',
          );
          return false;
        }

        logger.debug(
          '[Broadcast Subscription Filter] Valid token, allowing subscription',
        );

        return true;
      } catch (error) {
        logger.error(
          '[Broadcast Subscription Filter] Error validating token',
          error,
        );
        return false;
      }
    },
  })
  @UseGuards(JwtAuthGuard)
  notificationBroadcast() {
    logger.debug('[NotificationResolver] Setting up broadcast subscription');

    return this.notificationPubSub.subscribeToBroadcast();
  }
}
