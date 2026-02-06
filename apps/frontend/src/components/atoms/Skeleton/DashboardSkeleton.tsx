/**
 * DashboardSkeleton - Dashboard 載入骨架屏
 * 用於 Dashboard 頁面載入時的佔位符
 */

import { Box, Container, Paper, Skeleton, Stack } from '@mui/material';

export function DashboardSkeleton() {
  return (
    <>
      {/* AppBar Skeleton */}
      <Box sx={{ bgcolor: 'primary.main', height: 64, mb: 4 }}>
        <Container maxWidth="lg">
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ height: 64 }}
          >
            <Skeleton
              variant="text"
              width={150}
              height={32}
              sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}
            />
            <Skeleton
              variant="rectangular"
              width={80}
              height={36}
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 1 }}
            />
          </Stack>
        </Container>
      </Box>

      {/* Content Skeleton */}
      <Container maxWidth="lg">
        <Paper sx={{ p: 4 }}>
          {/* Title */}
          <Skeleton variant="text" width="40%" height={48} sx={{ mb: 2 }} />

          {/* Description */}
          <Skeleton variant="text" width="80%" height={24} />
          <Skeleton variant="text" width="70%" height={24} sx={{ mb: 4 }} />

          {/* Buttons */}
          <Stack direction="row" spacing={2}>
            <Skeleton variant="rounded" width={180} height={42} />
            <Skeleton variant="rounded" width={150} height={42} />
          </Stack>
        </Paper>
      </Container>
    </>
  );
}
