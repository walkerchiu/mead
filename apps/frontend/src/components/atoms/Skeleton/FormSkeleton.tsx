/**
 * FormSkeleton - Form loading skeleton
 * Placeholder for form loading, provides better user experience
 */

import { Box, Skeleton, Stack } from '@mui/material';

interface FormSkeletonProps {
  /** Number of input fields */
  fields?: number;
  /** whether to showTitle */
  showTitle?: boolean;
  /** whether to show secondaryTitle */
  showSubtitle?: boolean;
  /** whether to show button */
  showButton?: boolean;
  /** whether to show links */
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
