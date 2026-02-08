'use client';

import { forwardRef, useEffect, useState, useCallback, useRef } from 'react';
import { Alert, Box, LinearProgress } from '@mui/material';
import { CustomContentProps, useSnackbar } from 'notistack';

/**
 * Custom Snackbar component with countdown progress bar
 *
 * Features:
 * - Visual countdown progress bar
 * - Auto-close after duration
 * - Manual close button (inherited from Alert)
 * - Supports all Material-UI Alert severities
 */
export const SnackbarWithProgress = forwardRef<
  HTMLDivElement,
  CustomContentProps
>((props, ref) => {
  const {
    id,
    message,
    variant = 'default',
    autoHideDuration = 1500,
    style,
    // Extract and exclude notistack-specific props that shouldn't be passed to DOM
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    persist,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    action,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    anchorOrigin,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    iconVariant,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    hideIconVariant,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ...other
  } = props;

  const { closeSnackbar } = useSnackbar();
  const [progress, setProgress] = useState(100);
  const [isMounted, setIsMounted] = useState(false);
  const startTimeRef = useRef<number>(Date.now());

  const handleClose = useCallback(() => {
    closeSnackbar(id);
  }, [id, closeSnackbar]);

  // Prevent hydration mismatch by only rendering progress after mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!autoHideDuration) return;

    // Record the actual start time (when this effect runs)
    startTimeRef.current = Date.now();

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, 100 - (elapsed / autoHideDuration) * 100);

      setProgress(remaining);

      // Stop the timer when progress reaches 0
      // The snackbar will be closed by notistack's autoHideDuration
      if (remaining === 0) {
        clearInterval(timer);
      }
    }, 50); // Update every 50ms for smooth animation

    return () => clearInterval(timer);
  }, [autoHideDuration]);

  // Map notistack variants to MUI Alert severities
  const severity =
    variant === 'default'
      ? 'info'
      : variant === 'error'
        ? 'error'
        : variant === 'success'
          ? 'success'
          : variant === 'warning'
            ? 'warning'
            : 'info';

  return (
    <Box ref={ref} sx={{ minWidth: 300 }} style={style}>
      <Alert
        severity={severity}
        variant="filled"
        onClose={handleClose}
        sx={{
          width: '100%',
          '& .MuiAlert-message': {
            width: '100%',
          },
        }}
      >
        {typeof message === 'string' ? message : message}
        {autoHideDuration && isMounted && (
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              mt: 1,
              height: 2,
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
              '& .MuiLinearProgress-bar': {
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
              },
            }}
          />
        )}
      </Alert>
    </Box>
  );
});

SnackbarWithProgress.displayName = 'SnackbarWithProgress';
