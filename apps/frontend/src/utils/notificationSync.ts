/**
 * 通知同步機制
 *
 * 使用 BroadcastChannel API 在同一瀏覽器的不同組件（鈴鐺選單、通知中心）之間同步通知操作
 */

type NotificationSyncEvent =
  | { type: 'NOTIFICATION_MARKED_READ'; id: string }
  | { type: 'ALL_NOTIFICATIONS_MARKED_READ' }
  | { type: 'NOTIFICATION_DELETED'; id: string }
  | { type: 'READ_NOTIFICATIONS_CLEARED' };

type NotificationSyncHandler = (event: NotificationSyncEvent) => void;

class NotificationSyncManager {
  private channel: BroadcastChannel | null = null;
  private handlers: Set<NotificationSyncHandler> = new Set();

  constructor() {
    // 只在瀏覽器環境中初始化
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.channel = new BroadcastChannel('notification-sync');

      // 監聽來自其他組件的消息
      this.channel.onmessage = (event: MessageEvent<NotificationSyncEvent>) => {
        console.log('[NotificationSync] Received event:', event.data);
        this.handlers.forEach((handler) => handler(event.data));
      };
    }
  }

  /**
   * 發送同步事件
   *
   * 注意：BroadcastChannel 不會向同一個頁面發送訊息，
   * 所以我們需要手動觸發本地監聽器以支援同頁面內的同步
   */
  broadcast(event: NotificationSyncEvent) {
    console.log('[NotificationSync] Broadcasting event:', event);

    // 1. 廣播到其他 tabs/windows
    if (this.channel) {
      this.channel.postMessage(event);
    }

    // 2. 立即觸發本地監聽器（解決同頁面內的同步問題）
    this.handlers.forEach((handler) => {
      try {
        handler(event);
      } catch (error) {
        console.error('[NotificationSync] Handler error:', error);
      }
    });
  }

  /**
   * 註冊事件監聽器
   */
  subscribe(handler: NotificationSyncHandler) {
    this.handlers.add(handler);

    // 返回取消訂閱函數
    return () => {
      this.handlers.delete(handler);
    };
  }

  /**
   * 清理資源
   */
  destroy() {
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
    this.handlers.clear();
  }
}

// 全局單例
export const notificationSync = new NotificationSyncManager();

// 便捷方法
export const broadcastNotificationMarkedRead = (id: string) => {
  notificationSync.broadcast({ type: 'NOTIFICATION_MARKED_READ', id });
};

export const broadcastAllNotificationsMarkedRead = () => {
  notificationSync.broadcast({ type: 'ALL_NOTIFICATIONS_MARKED_READ' });
};

export const broadcastNotificationDeleted = (id: string) => {
  notificationSync.broadcast({ type: 'NOTIFICATION_DELETED', id });
};

export const broadcastReadNotificationsCleared = () => {
  notificationSync.broadcast({ type: 'READ_NOTIFICATIONS_CLEARED' });
};
