/**
 * ErrorDisplay - Page-level error display component
 *
 * **Purpose: Page-level error display**
 *
 * Use cases:
 * - 404 Page not found
 * - 403 Insufficient permissions
 * - 500 Server error
 * - Network connection failed
 * - Session Expired
 * - Data load failed
 *
 * **Note**：For inline messages within forms or pages, use AlertMessage component
 *
 * @example
 * ```tsx
 * // 404 Error
 * <ErrorDisplay
 *   title="Page not found"
 *   message="The page you visited does not exist or has been removed。"
 *   severity="error"
 *   showRetry
 *   retryText="Back to home"
 *   onRetry={() => router.push('/')}
 * />
 *
 * // Insufficient permissions
 * <ErrorDisplay
 *   title="Insufficient permissions"
 *   message="You do not have permission to access this page。"
 *   severity="warning"
 *   action={<Button variant="contained">Request permission</Button>}
 * />
 * ```
 */

import { Box, Stack, Typography } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import { Button } from '@/components/atoms';

export type ErrorSeverity = 'error' | 'warning' | 'info';

interface ErrorDisplayProps {
  /** ErrorTitle */
  title?: string;
  /** Error message */
  message: string;
  /** error severity */
  severity?: ErrorSeverity;
  /** whether to showRetryButton */
  showRetry?: boolean;
  /** RetryButtontext */
  retryText?: string;
  /** Retrycallback function */
  onRetry?: () => void;
  /** extraAction button */
  action?: React.ReactNode;
  /** iconsize */
  iconSize?: number;
  /** minimumheight */
  minHeight?: string;
}

const iconMap = {
  error: ErrorOutlineIcon,
  warning: WarningAmberIcon,
  info: InfoOutlinedIcon,
};

/**
 * ErrorDisplay - Page-level error display component
 *
 * occupies large space, center displays large icon and error message, suitable as error display for entire page or main content area。
 */
export function ErrorDisplay({
  title,
  message,
  severity = 'error',
  showRetry = false,
  retryText = 'Retry',
  onRetry,
  action,
  iconSize = 80,
  minHeight = '50vh',
}: ErrorDisplayProps) {
  const Icon = iconMap[severity];

  return (
    <Box
      sx={{
        minHeight,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
      }}
    >
      <Stack
        spacing={3}
        alignItems="center"
        sx={{ maxWidth: 500, textAlign: 'center' }}
      >
        <Icon
          sx={{
            fontSize: iconSize,
            color: `${severity}.main`,
            opacity: 0.8,
          }}
        />

        {title && (
          <Typography variant="h5" component="h2" color="text.primary">
            {title}
          </Typography>
        )}

        <Typography variant="body1" color="text.secondary">
          {message}
        </Typography>

        <Stack direction="row" spacing={2}>
          {showRetry && onRetry && (
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={onRetry}
            >
              {retryText}
            </Button>
          )}
          {action}
        </Stack>
      </Stack>
    </Box>
  );
}
