/**
 * FormSkeleton - 表單載入骨架屏
 * 用於表單載入時的佔位符，提供更好的使用者體驗
 */

import { Box, Skeleton, Stack } from '@mui/material';

interface FormSkeletonProps {
  /** 輸入欄位數量 */
  fields?: number;
  /** 是否顯示標題 */
  showTitle?: boolean;
  /** 是否顯示副標題 */
  showSubtitle?: boolean;
  /** 是否顯示按鈕 */
  showButton?: boolean;
  /** 是否顯示連結 */
  showLinks?: boolean;
}

export function FormSkeleton({
  fields = 2,
  showTitle = true,
  showSubtitle = true,
  showButton = true,
  showLinks = false,
}: FormSkeletonProps) {
  return (
    <Box sx={{ width: '100%', maxWidth: 400 }}>
      {/* Title */}
      {showTitle && (
        <Skeleton
          variant="text"
          width="60%"
          height={48}
          sx={{ mx: 'auto', mb: 1 }}
        />
      )}

      {/* Subtitle */}
      {showSubtitle && (
        <Skeleton
          variant="text"
          width="80%"
          height={24}
          sx={{ mx: 'auto', mb: 3 }}
        />
      )}

      {/* Form Fields */}
      <Stack spacing={2}>
        {Array.from({ length: fields }).map((_, index) => (
          <Box key={index}>
            <Skeleton variant="text" width="30%" height={20} sx={{ mb: 0.5 }} />
            <Skeleton variant="rounded" width="100%" height={56} />
          </Box>
        ))}
      </Stack>

      {/* Links */}
      {showLinks && (
        <Box sx={{ mt: 1, mb: 2, textAlign: 'right' }}>
          <Skeleton
            variant="text"
            width="40%"
            height={20}
            sx={{ ml: 'auto' }}
          />
        </Box>
      )}

      {/* Submit Button */}
      {showButton && (
        <Skeleton
          variant="rounded"
          width="100%"
          height={48}
          sx={{ mt: 2, borderRadius: 1 }}
        />
      )}
    </Box>
  );
}
