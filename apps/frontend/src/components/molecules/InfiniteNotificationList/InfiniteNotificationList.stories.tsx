import type { Meta, StoryObj } from '@storybook/nextjs';
import { InfiniteNotificationList } from './InfiniteNotificationList';
import { NotificationType, UnifiedNotification } from '@/types/notification';
import { useState } from 'react';

const meta = {
  title: 'Molecules/InfiniteNotificationList',
  component: InfiniteNotificationList,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof InfiniteNotificationList>;

export default meta;
type Story = StoryObj<typeof meta>;

// Generate mock notifications
const generateNotifications = (
  count: number,
  startIndex: number = 0,
): UnifiedNotification[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `notification-${startIndex + i}`,
    type: NotificationType.INFO,
    title: `Notification ${startIndex + i + 1}`,
    message: `This is the content of notification ${startIndex + i + 1}`,
    isRead: Math.random() > 0.5,
    createdAt: new Date(Date.now() - i * 3600000).toISOString(),
  }));
};

// Interactive story with state management
export const Default: Story = {
  render: () => {
    const [notifications, setNotifications] = useState<UnifiedNotification[]>(
      generateNotifications(20),
    );
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const handleLoadMore = () => {
      if (loading || !hasMore) return;

      setLoading(true);
      // Simulate API delay
      setTimeout(() => {
        const newNotifications = generateNotifications(
          20,
          notifications.length,
        );
        setNotifications((prev) => [...prev, ...newNotifications]);
        setLoading(false);

        // Simulate max 100 notifications
        if (notifications.length >= 80) {
          setHasMore(false);
        }
      }, 1000);
    };

    const handleMarkAsRead = (id: string) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
      console.log('Mark as read:', id);
    };

    const handleNotificationClick = (id: string) => {
      handleMarkAsRead(id);
      console.log('Notification clicked:', id);
    };

    const handleNotificationDelete = (id: string) => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      console.log('Notification deleted:', id);
    };

    const handleMarkAllAsRead = () => {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      console.log('Mark all as read');
    };

    const handleClearRead = () => {
      setNotifications((prev) => prev.filter((n) => !n.isRead));
      console.log('Clear read notifications');
    };

    return (
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <InfiniteNotificationList
          notifications={notifications}
          loading={loading}
          hasMore={hasMore}
          onLoadMore={handleLoadMore}
          onMarkAsRead={handleMarkAsRead}
          onNotificationClick={handleNotificationClick}
          onNotificationDelete={handleNotificationDelete}
          onMarkAllAsRead={handleMarkAllAsRead}
          onClearRead={handleClearRead}
        />
      </div>
    );
  },
};

export const Empty: Story = {
  args: {
    notifications: [],
    loading: false,
    hasMore: false,
    onLoadMore: () => console.log('Load more'),
  },
};

export const Loading: Story = {
  args: {
    notifications: generateNotifications(5),
    loading: true,
    hasMore: true,
    onLoadMore: () => console.log('Load more'),
  },
};

export const NoMore: Story = {
  args: {
    notifications: generateNotifications(20),
    loading: false,
    hasMore: false,
    onLoadMore: () => console.log('Load more'),
  },
};
