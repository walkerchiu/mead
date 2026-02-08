import { gql } from '@apollo/client';

/**
 * Notification Fragment
 * 通知的完整欄位定義
 */
export const NOTIFICATION_FRAGMENT = gql`
  fragment NotificationFields on NotificationGQLType {
    id
    userId
    type
    title
    message
    isRead
    data
    createdAt
    readAt
  }
`;

/**
 * Query: 取得通知列表
 */
export const GET_NOTIFICATIONS = gql`
  ${NOTIFICATION_FRAGMENT}
  query GetNotifications($filter: NotificationFilterInput) {
    notifications(filter: $filter) {
      notifications {
        ...NotificationFields
      }
      total
      unreadCount
    }
  }
`;

/**
 * Query: 取得未讀通知數量
 */
export const GET_UNREAD_COUNT = gql`
  query GetUnreadNotificationCount {
    unreadNotificationCount
  }
`;

/**
 * Mutation: 標記通知為已讀
 */
export const MARK_NOTIFICATION_AS_READ = gql`
  ${NOTIFICATION_FRAGMENT}
  mutation MarkNotificationAsRead($id: String!) {
    markNotificationAsRead(id: $id) {
      ...NotificationFields
    }
  }
`;

/**
 * Mutation: 標記所有通知為已讀
 */
export const MARK_ALL_NOTIFICATIONS_AS_READ = gql`
  mutation MarkAllNotificationsAsRead {
    markAllNotificationsAsRead
  }
`;

/**
 * Mutation: 刪除通知
 */
export const DELETE_NOTIFICATION = gql`
  mutation DeleteNotification($id: String!) {
    deleteNotification(id: $id)
  }
`;

/**
 * Mutation: 刪除所有已讀通知
 */
export const DELETE_READ_NOTIFICATIONS = gql`
  mutation DeleteReadNotifications {
    deleteReadNotifications
  }
`;

/**
 * Subscription: 訂閱新通知
 */
export const ON_NOTIFICATION_CREATED = gql`
  ${NOTIFICATION_FRAGMENT}
  subscription OnNotificationCreated {
    notificationCreated {
      ...NotificationFields
    }
  }
`;

/**
 * Subscription: 訂閱系統廣播通知
 */
export const ON_NOTIFICATION_BROADCAST = gql`
  ${NOTIFICATION_FRAGMENT}
  subscription OnNotificationBroadcast {
    notificationBroadcast {
      ...NotificationFields
    }
  }
`;

/**
 * Notification Types
 */
export enum NotificationType {
  INFO = 'INFO',
  WARNING = 'WARNING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

/**
 * Notification Interface
 */
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  data?: Record<string, unknown>;
  createdAt: string;
  readAt?: string;
}

/**
 * Notification List Response
 */
export interface NotificationListResponse {
  notifications: Notification[];
  total: number;
  unreadCount: number;
}

/**
 * Query: 取得用戶通知偏好設定
 */
export const GET_NOTIFICATION_PREFERENCES = gql`
  query GetNotificationPreferences {
    myNotificationPreferences {
      id
      userId
      enableInfo
      enableSuccess
      enableWarning
      enableError
      enableBrowser
      enableEmail
      enablePush
      enableSound
      enableDesktop
      enableMobile
      createdAt
      updatedAt
    }
  }
`;

/**
 * Mutation: 更新用戶通知偏好設定
 */
export const UPDATE_NOTIFICATION_PREFERENCES = gql`
  mutation UpdateNotificationPreferences(
    $input: UpdateNotificationPreferencesInput!
  ) {
    updateMyNotificationPreferences(input: $input) {
      id
      userId
      enableInfo
      enableSuccess
      enableWarning
      enableError
      enableBrowser
      enableEmail
      enablePush
      enableSound
      enableDesktop
      enableMobile
      createdAt
      updatedAt
    }
  }
`;

/**
 * Notification Preferences Interface
 */
export interface NotificationPreferences {
  id: string;
  userId: string;
  enableInfo: boolean;
  enableSuccess: boolean;
  enableWarning: boolean;
  enableError: boolean;
  enableBrowser: boolean;
  enableEmail: boolean;
  enablePush: boolean;
  enableSound: boolean;
  enableDesktop: boolean;
  enableMobile: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Update Notification Preferences Input
 */
export interface UpdateNotificationPreferencesInput {
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
}
