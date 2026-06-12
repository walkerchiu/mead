import type { Meta, StoryObj } from '@storybook/nextjs';
import { NotificationMenuList } from './NotificationMenuList';
import { NotificationType } from '@/types/notification';

/**
 * NotificationMenuList - Atomic Design: Molecule
 *
 * 為下拉選單設計的通知列表元件，使用 MenuItem 顯示通知。
 * 此元件設計用於 NotificationMenu（Organism）之中。
 *
 * 遵循 Atomic Design 架構：
 * - Atom: MenuItem（MUI 元件）
 * - Molecule: NotificationMenuList（組合多個 MenuItem）
 * - Organism: NotificationMenu（使用 NotificationMenuList + NotificationBadge + Header/Footer）
 */
const meta = {
  title: 'Shared/Molecules/NotificationMenuList',
  component: NotificationMenuList,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    maxDisplay: {
      control: 'number',
      description: '最多顯示的項目數量',
    },
    locale: {
      control: 'select',
      options: ['en', 'zh-TW'],
      description: '語系代碼（用於日期格式化）',
    },
    emptyIconSize: {
      control: 'number',
      description: '空狀態圖示尺寸',
    },
  },
} satisfies Meta<typeof NotificationMenuList>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample notification data
const sampleNotifications = [
  {
    id: '1',
    type: NotificationType.INFO,
    title: 'System Update',
    message:
      'System maintenance will be performed tonight at 10:00 PM, estimated 30 minutes.',
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
    isRead: false,
  },
  {
    id: '2',
    type: NotificationType.SUCCESS,
    title: 'Operation Successful',
    message: 'Your data has been updated successfully.',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    isRead: false,
  },
  {
    id: '3',
    type: NotificationType.WARNING,
    title: 'Important Notice',
    message: 'Your password will expire in 7 days, please update it soon.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    isRead: true,
  },
  {
    id: '4',
    type: NotificationType.ERROR,
    title: 'Operation Failed',
    message: 'Unable to connect to server, please try again later.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    isRead: true,
  },
  {
    id: '5',
    type: NotificationType.SYSTEM,
    title: 'System Notification',
    message: 'Two-factor authentication has been enabled for your account.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
    isRead: true,
  },
];

/**
 * 預設樣式 - 顯示多則通知
 */
export const Default: Story = {
  args: {
    notifications: sampleNotifications,
    maxDisplay: 5,
    locale: 'en',
    onNotificationClick: (notification) =>
      console.log('Clicked:', notification),
  },
};

/**
 * 所有通知類型
 */
export const AllTypes: Story = {
  args: {
    notifications: [
      {
        id: '1',
        type: NotificationType.INFO,
        title: 'Info Notification',
        message: 'This is an informational notification',
        createdAt: new Date().toISOString(),
        isRead: false,
      },
      {
        id: '2',
        type: NotificationType.SUCCESS,
        title: 'Success Notification',
        message: 'This is a success notification',
        createdAt: new Date().toISOString(),
        isRead: false,
      },
      {
        id: '3',
        type: NotificationType.WARNING,
        title: 'Warning Notification',
        message: 'This is a warning notification',
        createdAt: new Date().toISOString(),
        isRead: false,
      },
      {
        id: '4',
        type: NotificationType.ERROR,
        title: 'Error Notification',
        message: 'This is an error notification',
        createdAt: new Date().toISOString(),
        isRead: false,
      },
      {
        id: '5',
        type: NotificationType.SYSTEM,
        title: 'System Notification',
        message: 'This is a system notification',
        createdAt: new Date().toISOString(),
        isRead: false,
      },
    ],
    locale: 'en',
    onNotificationClick: (notification) =>
      console.log('Clicked:', notification),
  },
};

/**
 * 僅未讀
 */
export const UnreadOnly: Story = {
  args: {
    notifications: sampleNotifications.filter((n) => !n.isRead),
    maxDisplay: 5,
    locale: 'en',
    onNotificationClick: (notification) =>
      console.log('Clicked:', notification),
  },
};

/**
 * 限制顯示數量（僅顯示 3 則）
 */
export const LimitedDisplay: Story = {
  args: {
    notifications: sampleNotifications,
    maxDisplay: 3,
    locale: 'en',
    onNotificationClick: (notification) =>
      console.log('Clicked:', notification),
  },
};

/**
 * 單則通知
 */
export const SingleNotification: Story = {
  args: {
    notifications: [sampleNotifications[0]],
    locale: 'en',
    onNotificationClick: (notification) =>
      console.log('Clicked:', notification),
  },
};

/**
 * 長內容處理
 */
export const LongContent: Story = {
  args: {
    notifications: [
      {
        id: '1',
        type: NotificationType.INFO,
        title:
          'This is a very very very very very very long notification title to test text overflow behavior',
        message:
          'This is a very very very long notification message content to test how the component handles overflow text. This text should be limited to a certain number of lines and the overflow part will be displayed with ellipsis. Let us add more text to make sure it is really long enough.',
        createdAt: new Date().toISOString(),
        isRead: false,
      },
      {
        id: '2',
        type: NotificationType.SUCCESS,
        title: 'Normal length title',
        message: 'Normal length content',
        createdAt: new Date().toISOString(),
        isRead: true,
      },
    ],
    locale: 'en',
    onNotificationClick: (notification) =>
      console.log('Clicked:', notification),
  },
};

/**
 * 中文語系
 */
export const ChineseLocale: Story = {
  args: {
    notifications: [
      {
        id: '1',
        type: NotificationType.INFO,
        title: '系統更新',
        message: '系統將在今晚 10:00 進行維護更新。',
        createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        isRead: false,
      },
      {
        id: '2',
        type: NotificationType.SUCCESS,
        title: '操作成功',
        message: '您的資料已成功更新。',
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        isRead: false,
      },
      {
        id: '3',
        type: NotificationType.WARNING,
        title: '警告',
        message: '您的密碼將在 7 天後過期。',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        isRead: true,
      },
    ],
    maxDisplay: 5,
    locale: 'zh-TW',
    emptyText: '沒有通知',
    onNotificationClick: (notification) =>
      console.log('Clicked:', notification),
  },
};

/**
 * 空狀態 - 沒有通知
 */
export const Empty: Story = {
  args: {
    notifications: [],
    emptyText: 'No notifications',
    locale: 'en',
  },
};

/**
 * 自訂空狀態
 */
export const CustomEmpty: Story = {
  args: {
    notifications: [],
    emptyText: '🎉 Great! You have read all notifications',
    emptyIconSize: 64,
    locale: 'en',
  },
};
