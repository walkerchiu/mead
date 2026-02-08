'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import {
  Box,
  CircularProgress,
  Typography,
  Card,
  CardContent,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { NotificationList } from '../NotificationList/NotificationList';
import { UnifiedNotification } from '@/types/notification';

/**
 * InfiniteNotificationList Component - Atomic Design: Molecule
 *
 * Infinite scroll notification list component
 * Uses Intersection Observer API to automatically load more notifications
 *
 * @example
 * ```tsx
 * <InfiniteNotificationList
 *   notifications={notifications}
 *   loading={loading}
 *   hasMore={hasMore}
 *   onLoadMore={loadMore}
 *   onMarkAsRead={markAsRead}
 *   onNotificationClick={handleClick}
 * />
 * ```
 */

export interface InfiniteNotificationListProps {
  /**
   * Notification list
   */
  notifications: UnifiedNotification[];

  /**
   * Whether data is loading
   */
  loading: boolean;

  /**
   * Whether there are more notifications to load
   */
  hasMore: boolean;

  /**
   * Total count of notifications (optional, for display)
   */
  totalCount?: number;

  /**
   * Load more callback
   */
  onLoadMore: () => void;

  /**
   * Mark as read callback
   */
  onMarkAsRead?: (id: string) => void;

  /**
   * Notification click callback
   */
  onNotificationClick?: (id: string) => void;

  /**
   * Notification delete callback
   */
  onNotificationDelete?: (id: string) => void;

  /**
   * Mark all as read callback
   */
  onMarkAllAsRead?: () => void;

  /**
   * Clear read notifications callback
   */
  onClearRead?: () => void;
}

export const InfiniteNotificationList: React.FC<
  InfiniteNotificationListProps
> = ({
  notifications,
  loading,
  hasMore,
  onLoadMore,
  onNotificationClick,
  onNotificationDelete,
  onMarkAllAsRead,
  onClearRead,
}) => {
  const t = useTranslations('pages.settings.notificationCenter');
  const observerTarget = useRef<HTMLDivElement>(null);

  // Intersection Observer to automatically load more
  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting && hasMore && !loading) {
        onLoadMore();
      }
    },
    [hasMore, loading, onLoadMore],
  );

  useEffect(() => {
    const observer = new IntersectionObserver(handleIntersection, {
      threshold: 0.1,
      rootMargin: '100px', // Start loading 100px early
    });

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [handleIntersection]);

  return (
    <Box>
      <Card elevation={2}>
        <CardContent>
          {/* Notification List */}
          <NotificationList
            notifications={notifications}
            loading={false} // Don't show loading in list itself, show at bottom
            showContainer={false}
            showHeader={false}
            showFilterTabs={true}
            showActions={true}
            showDeleteButton={true}
            maxHeight="100vh"
            onNotificationClick={onNotificationClick}
            onNotificationDelete={onNotificationDelete}
            onMarkAllRead={onMarkAllAsRead}
            onClearRead={onClearRead}
          />
        </CardContent>
      </Card>

      {/* Loading indicator - shown when loading more */}
      {hasMore && (
        <Box
          ref={observerTarget}
          sx={{
            py: 3,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 80,
          }}
        >
          {loading && <CircularProgress size={32} />}
        </Box>
      )}

      {/* End message - shown when no more */}
      {!hasMore && notifications.length > 0 && (
        <Box
          sx={{
            py: 3,
            textAlign: 'center',
          }}
        >
          <Typography variant="body2" color="text.disabled">
            {t('endOfList')}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default InfiniteNotificationList;
