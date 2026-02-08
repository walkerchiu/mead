/**
 * FiltersSkeleton - 篩選器載入骨架屏
 * 提供篩選器元件載入時的佔位符
 */

import { Box, Skeleton } from '@mui/material';

interface FiltersSkeletonProps {
  /** 是否顯示搜尋框 */
  showSearch?: boolean;
  /** 篩選器數量 */
  filterCount?: number;
}

export function FiltersSkeleton({
  showSearch = true,
  filterCount = 2,
}: FiltersSkeletonProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 2,
        mb: 3,
      }}
    >
      {/* 搜尋框 Skeleton */}
      {showSearch && (
        <Skeleton
          variant="rounded"
          animation="wave"
          sx={{
            flex: 1,
            minWidth: { xs: '100%', sm: 200 },
            height: 56,
          }}
        />
      )}

      {/* 篩選器 Skeleton */}
      {Array.from({ length: filterCount }).map((_, index) => (
        <Skeleton
          key={index}
          variant="rounded"
          animation="wave"
          sx={{
            minWidth: { xs: '100%', sm: 150 },
            height: 56,
          }}
        />
      ))}
    </Box>
  );
}
