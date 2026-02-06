import MuiAlert, { AlertProps as MuiAlertProps } from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import CloseIcon from '@mui/icons-material/Close';
import RefreshIcon from '@mui/icons-material/Refresh';

/**
 * AlertMessage 組件 - Atomic Design: Molecule
 *
 * **用途：所有內嵌訊息顯示**
 *
 * 適用場景：
 * - 表單驗證結果
 * - 操作成功/失敗回饋
 * - API 錯誤提示
 * - 頁面內通知
 * - 警告和資訊提示
 *
 * **注意**：頁面級錯誤請使用 ErrorDisplay 組件
 *
 * @example
 * ```tsx
 * // 基本使用
 * <AlertMessage severity="success">
 *   操作已成功完成
 * </AlertMessage>
 *
 * // 帶重試功能
 * <AlertMessage
 *   severity="error"
 *   showRetry
 *   onRetry={handleRetry}
 * >
 *   無法連線到伺服器
 * </AlertMessage>
 *
 * // 帶標題和自訂操作
 * <AlertMessage
 *   severity="warning"
 *   title="警告"
 *   action={<Button size="small">了解更多</Button>}
 * >
 *   您的密碼即將過期
 * </AlertMessage>
 * ```
 */

export interface AlertMessageProps extends Omit<
  MuiAlertProps,
  'title' | 'action'
> {
  /**
   * 訊息類型
   */
  severity?: 'success' | 'error' | 'warning' | 'info';

  /**
   * 標題（可選）
   */
  title?: string;

  /**
   * 是否可關閉
   */
  closable?: boolean;

  /**
   * 關閉時的回調
   */
  onClose?: () => void;

  /**
   * 是否顯示重試按鈕
   */
  showRetry?: boolean;

  /**
   * 重試按鈕文字
   */
  retryText?: string;

  /**
   * 重試回調函數
   */
  onRetry?: () => void;

  /**
   * 自訂操作按鈕（會取代重試按鈕）
   */
  action?: React.ReactNode;
}

/**
 * AlertMessage 組件 - 用於所有內嵌訊息顯示
 */
export function AlertMessage({
  severity = 'info',
  title,
  closable = false,
  onClose,
  showRetry = false,
  retryText = '重試',
  onRetry,
  action,
  children,
  ...props
}: AlertMessageProps) {
  // 決定 action 內容
  let actionContent: React.ReactNode = undefined;

  if (action) {
    // 優先使用自訂 action
    actionContent = action;
  } else if (showRetry && onRetry) {
    // 顯示重試按鈕
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
    // 顯示關閉按鈕
    actionContent = (
      <IconButton
        aria-label="關閉"
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
