/* eslint-disable @typescript-eslint/no-explicit-any */

import { Inject, Injectable } from '@nestjs/common';
import { PUB_SUB, IPubSubService } from '../common/services/pubsub.module';
import { logger } from '../common/services/logger.service';

/**
 * Notification 事件常數
 */
export const NOTIFICATION_EVENTS = {
  CREATED: 'NOTIFICATION_CREATED',
  READ: 'NOTIFICATION_READ',
  BROADCAST: 'NOTIFICATION_BROADCAST',
} as const;

/**
 * NotificationPubSubService
 *
 * 負責發布通知相關事件到 PubSub 系統
 * 支援：
 * - 用戶特定通知
 * - 系統廣播通知
 * - 通知已讀事件
 */
@Injectable()
export class NotificationPubSubService {
  constructor(@Inject(PUB_SUB) private pubSub: IPubSubService) {}

  /**
   * 發布新通知事件到特定用戶
   *
   * @param userId - 目標用戶 ID
   * @param notification - 通知資料
   */
  async emitNotificationCreated(
    userId: string,
    notification: any,
  ): Promise<void> {
    const topic = `${NOTIFICATION_EVENTS.CREATED}.${userId}`;

    logger.debug('[NotificationPubSub] Emitting notification created event', {
      topic,
      notificationId: notification.id,
      userId,
      type: notification.type,
      title: notification.title,
    });

    await this.pubSub.publish(topic, {
      notificationCreated: notification,
    });

    logger.debug('[NotificationPubSub] Event emitted successfully');
  }

  /**
   * 訂閱特定用戶的新通知事件
   *
   * @param userId - 用戶 ID
   * @returns AsyncIterator for GraphQL subscription
   */
  subscribeToNotificationCreated(userId: string) {
    const topic = `${NOTIFICATION_EVENTS.CREATED}.${userId}`;

    logger.debug(
      '[NotificationPubSub] Creating subscription iterator for user notifications',
      { topic, userId },
    );

    return this.pubSub.asyncIterator([topic]);
  }

  /**
   * 發布系統廣播通知（給所有線上用戶）
   *
   * @param notification - 通知資料
   */
  async emitBroadcastNotification(notification: any): Promise<void> {
    logger.debug('[NotificationPubSub] Emitting broadcast notification', {
      notificationId: notification.id,
      type: notification.type,
      title: notification.title,
    });

    await this.pubSub.publish(NOTIFICATION_EVENTS.BROADCAST, {
      notificationBroadcast: notification,
    });

    logger.debug('[NotificationPubSub] Broadcast event emitted successfully');
  }

  /**
   * 訂閱系統廣播通知
   *
   * @returns AsyncIterator for GraphQL subscription
   */
  subscribeToBroadcast() {
    logger.debug(
      '[NotificationPubSub] Creating subscription iterator for broadcast notifications',
    );

    return this.pubSub.asyncIterator([NOTIFICATION_EVENTS.BROADCAST]);
  }

  /**
   * 發布通知已讀事件
   *
   * @param userId - 用戶 ID
   * @param notificationId - 通知 ID
   */
  async emitNotificationRead(
    userId: string,
    notificationId: string,
  ): Promise<void> {
    const topic = `${NOTIFICATION_EVENTS.READ}.${userId}`;

    logger.debug('[NotificationPubSub] Emitting notification read event', {
      topic,
      userId,
      notificationId,
    });

    await this.pubSub.publish(topic, {
      notificationRead: { id: notificationId, userId },
    });
  }
}
