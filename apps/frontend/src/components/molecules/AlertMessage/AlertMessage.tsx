import MuiAlert, { AlertProps as MuiAlertProps } from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import CloseIcon from '@mui/icons-material/Close';
import RefreshIcon from '@mui/icons-material/Refresh';

/**
 * AlertMessage Component - Atomic Design: Molecule
 *
 * **Purpose: All inline message display**
 *
 * Use cases:
 * - Form validation results
 * - Operation success/failure feedback
 * - API error messages
 * - In-page notification
 * - Warning and information prompts
 *
 * **Note**：For page-level errors, use ErrorDisplay component
 *
 * @example
 * ```tsx
 * // basic usage
 * <AlertMessage severity="success">
 *   Operation completed successfully
 * </AlertMessage>
 *
 * // With retry feature
 * <AlertMessage
 *   severity="error"
 *   showRetry
 *   onRetry={handleRetry}
 * >
 *   Unable to connect to server
 * </AlertMessage>
 *
 * // with title and custom actions
 * <AlertMessage
 *   severity="warning"
 *   title="Warning"
 *   action={<Button size="small">Learn more</Button>}
 * >
 *   Your password will expire soon
 * </AlertMessage>
 * ```
 */

export interface AlertMessageProps extends Omit<
  MuiAlertProps,
  'title' | 'action'
> {
  /**
   * message type
   */
  severity?: 'success' | 'error' | 'warning' | 'info';

  /**
   * Title（Optional）
   */
  title?: string;

  /**
   * whetherclosable
   */
  closable?: boolean;

  /**
   * callback on close
   */
  onClose?: () => void;

  /**
   * whether to showRetryButton
   */
  showRetry?: boolean;

  /**
   * RetryButtontext
   */
  retryText?: string;

  /**
   * Retrycallback function
   */
  onRetry?: () => void;

  /**
   * custom action button (will replace retry button)
   */
  action?: React.ReactNode;
}

/**
 * AlertMessage component - for all inline message display
 */
export function AlertMessage({
  severity = 'info',
  title,
  closable = false,
  onClose,
  showRetry = false,
  retryText = 'Retry',
  onRetry,
  action,
  children,
  ...props
}: AlertMessageProps) {
  // determine action Content
  let actionContent: React.ReactNode = undefined;

  if (action) {
    // prioritize usingcustom action
    actionContent = action;
  } else if (showRetry && onRetry) {
    // show retry button
    actionContent = (
      <Button
        color="inherit"
        size="small"
        onClick={onRetry}
        startIcon={<RefreshIcon />}
      >
        {retryText}
      </Button>
    );
  } else if (closable && onClose) {
    // Show close button
    actionContent = (
      <IconButton
        aria-label="close"
        color="inherit"
        size="small"
        onClick={onClose}
      >
        <CloseIcon fontSize="inherit" />
      </IconButton>
    );
  }

  return (
    <MuiAlert severity={severity} {...props} action={actionContent}>
      {title && <AlertTitle>{title}</AlertTitle>}
      {children}
    </MuiAlert>
  );
}

export default AlertMessage;
