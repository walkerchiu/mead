/**
 * 統一的通知類型定義
 *
 * 此文件定義了整個應用中通知數據的統一接口,作為單一數據源 (Single Source of Truth)。
 * 所有組件都應該使用這個統一的接口,避免多個不同的接口定義。
 */

/**
 * 通知類型枚舉
 */
export enum NotificationType {
  INFO = 'INFO',
  SUCCESS = 'SUCCESS',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  SYSTEM = 'SYSTEM',
}

/**
 * 統一的通知接口
 *
 * 這是應用中所有通知數據的標準格式。
 * 無論數據來自 GraphQL、REST API 或本地狀態,都應該轉換為此格式。
 */
export interface UnifiedNotification {
  /**
   * 通知唯一識別碼
   */
  id: string;

  /**
   * 通知類型
   */
  type: NotificationType;

  /**
   * 通知標題
   */
  title: string;

  /**
   * 通知內容
   */
  message: string;

  /**
   * 是否已讀
   */
  isRead: boolean;

  /**
   * 建立時間 (ISO 8601 字串)
   */
  createdAt: string;

  /**
   * 已讀時間 (ISO 8601 字串)
   */
  readAt?: string;

  /**
   * 附加數據 (可選)
   */
  data?: Record<string, unknown>;

  /**
   * 動作 URL (可選,點擊通知時導航的目標)
   */
  actionUrl?: string;

  /**
   * 頭像 URL (可選,用於顯示通知來源的頭像)
   */
  avatar?: string;
}

/**
 * 從 GraphQL 格式轉換為統一格式
 *
 * @param gql - GraphQL 查詢返回的通知對象
 * @returns 統一格式的通知對象
 *
 * @example
 * ```typescript
 * const gqlNotifications = await fetchNotifications();
 * const notifications = gqlNotifications.map(fromGraphQLNotification);
 * ```
 */
export function fromGraphQLNotification(
  gql: import('@/graphql/notification').Notification,
): UnifiedNotification {
  // Extract actionUrl and avatar from data field
  const actionUrl =
    gql.data && typeof gql.data === 'object' && 'actionUrl' in gql.data
      ? String(gql.data.actionUrl)
      : undefined;
  const avatar =
    gql.data && typeof gql.data === 'object' && 'avatar' in gql.data
      ? String(gql.data.avatar)
      : undefined;

  return {
    id: gql.id,
    type: gql.type as NotificationType,
    title: gql.title,
    message: gql.message,
    isRead: gql.isRead,
    createdAt: gql.createdAt,
    readAt: gql.readAt,
    data: gql.data,
    actionUrl,
    avatar,
  };
}

/**
 * 轉換為 NotificationMenu 舊格式
 *
 * 此函數提供向後兼容性,用於漸進式重構。
 * 當 NotificationMenu 完全更新後,此函數可以移除。
 *
 * @param notification - 統一格式的通知對象
 * @returns NotificationMenu 使用的格式
 *
 * @deprecated 此函數僅用於向後兼容,新代碼應直接使用 UnifiedNotification
 */
export function toNotificationMenuFormat(notification: UnifiedNotification): {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  avatar?: string;
} {
  return {
    id: notification.id,
    type: notification.type.toLowerCase() as
      | 'info'
      | 'success'
      | 'warning'
      | 'error'
      | 'system',
    title: notification.title,
    message: notification.message,
    timestamp: new Date(notification.createdAt),
    read: notification.isRead,
    actionUrl: notification.actionUrl,
    avatar: notification.avatar,
  };
}

/**
 * 通知統計信息
 */
export interface NotificationStats {
  /**
   * 總通知數
   */
  total: number;

  /**
   * 未讀通知數
   */
  unreadCount: number;
}

/**
 * 通知列表回應 (用於分頁查詢)
 */
export interface NotificationListResponse {
  /**
   * 通知列表
   */
  notifications: UnifiedNotification[];

  /**
   * 總通知數
   */
  total: number;

  /**
   * 未讀通知數
   */
  unreadCount: number;

  /**
   * 分頁資訊 (可選)
   */
  pageInfo?: {
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

/**
 * 通知篩選選項
 */
export interface NotificationFilter {
  /**
   * 按類型篩選
   */
  type?: NotificationType;

  /**
   * 按已讀狀態篩選
   */
  isRead?: boolean;

  /**
   * 開始日期
   */
  fromDate?: string;

  /**
   * 結束日期
   */
  toDate?: string;
}
