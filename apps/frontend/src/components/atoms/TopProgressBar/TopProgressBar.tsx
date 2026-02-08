'use client';

import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';

/**
 * TopProgressBar — fixed indeterminate progress bar at the top of the
 * viewport. Visual style matches `NextTopLoader` (height 4 + glow) so the
 * two indicators feel like the same UI.
 *
 * Used by `ProtectedRoute` while the auth init is still in flight (cold
 * page load, token refresh) so the user sees an immediate "something is
 * happening" cue instead of a blank screen — without the heavier
 * full-page-skeleton flash.
 */
export function TopProgressBar() {
  return (
    <Box
      role="progressbar"
      aria-label="Loading"
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        // 比 NextTopLoader 還高一階，避免被任何 sticky toolbar 蓋住
        zIndex: (theme) => theme.zIndex.tooltip + 1,
        pointerEvents: 'none',
      }}
    >
      <LinearProgress
        sx={{
          height: 4,
          backgroundColor: 'transparent',
          '& .MuiLinearProgress-bar': {
            backgroundColor: '#F59E0B',
            // 與 NextTopLoader shadow 一致的雙層 glow
            boxShadow: '0 0 10px #F59E0B, 0 0 4px #F59E0B',
          },
        }}
      />
    </Box>
  );
}

export default TopProgressBar;
