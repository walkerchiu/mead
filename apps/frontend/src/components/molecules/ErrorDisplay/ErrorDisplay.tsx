/**
 * ErrorDisplay - 頁面級錯誤顯示組件
 *
 * **用途：頁面級錯誤顯示**
 *
 * 適用場景：
 * - 404 頁面未找到
 * - 403 權限不足
 * - 500 伺服器錯誤
 * - 網路連線失敗
 * - Session 過期
 * - 資料載入失敗
 *
 * **注意**：表單內或頁面內的內嵌訊息請使用 AlertMessage 組件
 *
 * @example
 * ```tsx
 * // 404 錯誤
 * <ErrorDisplay
 *   title="頁面未找到"
 *   message="您訪問的頁面不存在或已被移除。"
 *   severity="error"
 *   showRetry
 *   retryText="返回首頁"
 *   onRetry={() => router.push('/')}
 * />
 *
 * // 權限不足
 * <ErrorDisplay
 *   title="權限不足"
 *   message="您沒有權限訪問此頁面。"
 *   severity="warning"
 *   action={<Button variant="contained">申請權限</Button>}
 * />
 * ```
 */

import { Box, Button, Stack, Typography } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';

export type ErrorSeverity = 'error' | 'warning' | 'info';

interface ErrorDisplayProps {
  /** 錯誤標題 */
  title?: string;
  /** 錯誤訊息 */
  message: string;
  /** 錯誤嚴重性 */
  severity?: ErrorSeverity;
  /** 是否顯示重試按鈕 */
  showRetry?: boolean;
  /** 重試按鈕文字 */
  retryText?: string;
  /** 重試回調函數 */
  onRetry?: () => void;
  /** 額外操作按鈕 */
  action?: React.ReactNode;
  /** 圖示大小 */
  iconSize?: number;
  /** 最小高度 */
  minHeight?: string;
}

const iconMap = {
  error: ErrorOutlineIcon,
  warning: WarningAmberIcon,
  info: InfoOutlinedIcon,
};

/**
 * ErrorDisplay - 頁面級錯誤顯示組件
 *
 * 佔據大空間，中央顯示大圖示和錯誤訊息，適合作為整個頁面或主要內容區域的錯誤提示。
 */
export function ErrorDisplay({
  title,
  message,
  severity = 'error',
  showRetry = false,
  retryText = '重試',
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
