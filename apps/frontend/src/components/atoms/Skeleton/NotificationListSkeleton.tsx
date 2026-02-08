/**
 * NotificationListSkeleton - 通知列表載入骨架屏
 * 提供通知列表載入時的佔位符，提升用戶體驗
 */

import { Box, Skeleton, Stack, Paper } from '@mui/material';

interface NotificationListSkeletonProps {
  /** 顯示的通知項目數量 */
  count?: number;
  /** 是否顯示容器 */
  showContainer?: boolean;
  /** 是否顯示操作按鈕 */
  showActions?: boolean;
}

export function NotificationListSkeleton({
  count = 5,
  showContainer = true,
  showActions = true,
}: NotificationListSkeletonProps) {
  const content = (
    <Box>
      {/* 操作按鈕區 */}
      {showActions && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2,
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Skeleton variant="text" width={120} height={32} />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Skeleton variant="circular" width={40} height={40} />
            <Skeleton variant="circular" width={40} height={40} />
          </Box>
        </Box>
      )}

      {/* 通知項目列表 */}
      <Stack
        spacing={0}
        divider={<Box sx={{ borderBottom: 1, borderColor: 'divider' }} />}
      >
        {Array.from({ length: count }).map((_, index) => (
          <Box
            key={index}
            sx={{
              p: 2,
              display: 'flex',
              gap: 2,
            }}
          >
            {/* 左側圖標 */}
            <Skeleton
              variant="circular"
              width={40}
              height={40}
              sx={{ flexShrink: 0 }}
            />

            {/* 中間內容區 */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              {/* 標題 */}
              <Skeleton
                variant="text"
                width="70%"
                height={24}
                sx={{ mb: 0.5 }}
              />
              {/* 描述 */}
              <Skeleton
                variant="text"
                width="90%"
                height={20}
                sx={{ mb: 0.5 }}
              />
              {/* 時間戳記 */}
              <Skeleton variant="text" width="30%" height={16} />
            </Box>

            {/* 右側操作按鈕 */}
            <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
              <Skeleton variant="circular" width={32} height={32} />
              <Skeleton variant="circular" width={32} height={32} />
            </Box>
          </Box>
        ))}
      </Stack>
    </Box>
  );

  if (showContainer) {
    return (
      <Paper elevation={1} sx={{ overflow: 'hidden' }}>
        {content}
      </Paper>
    );
  }

  return content;
}
