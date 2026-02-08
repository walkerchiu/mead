/**
 * Toast 組件
 * 全站統一的通知提示組件
 */

import { Snackbar, Alert } from '@mui/material';
import type { ToastState } from '@/hooks/useToast';

interface ToastProps {
  /**
   * Toast 狀態
   */
  toast: ToastState;
  /**
   * 關閉回調
   */
  onClose: () => void;
  /**
   * 自動隱藏時間（毫秒）
   * @default 6000
   */
  autoHideDuration?: number;
}

/**
 * Toast 組件
 *
 * 統一規格：
 * - 位置：畫面底部中間
 * - 成功：綠色
 * - 錯誤：紅色
 * - 警告：橘色
 * - 資訊：藍色
 *
 * @example
 * ```tsx
 * import { useToast } from '@/hooks/useToast';
 * import { Toast } from '@/components/molecules';
 *
 * function MyComponent() {
 *   const { toast, showSuccess, showError, hideToast } = useToast();
 *
 *   return (
 *     <>
 *       <button onClick={() => showSuccess('操作成功！')}>成功</button>
 *       <button onClick={() => showError('操作失敗！')}>失敗</button>
 *       <Toast toast={toast} onClose={hideToast} />
 *     </>
 *   );
 * }
 * ```
 */
export function Toast({ toast, onClose, autoHideDuration = 6000 }: ToastProps) {
  return (
    <Snackbar
      open={toast.open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      sx={{
        bottom: { xs: 80, sm: 24 }, // 手機版避免被底部導航遮擋
      }}
    >
      <Alert
        onClose={onClose}
        severity={toast.severity}
        variant="filled"
        sx={{
          width: '100%',
          boxShadow: 3,
          // 確保顏色正確顯示
          ...(toast.severity === 'error' && {
            backgroundColor: 'error.main',
            color: 'error.contrastText',
          }),
          ...(toast.severity === 'success' && {
            backgroundColor: 'success.main',
            color: 'success.contrastText',
          }),
          ...(toast.severity === 'warning' && {
            backgroundColor: 'warning.main',
            color: 'warning.contrastText',
          }),
          ...(toast.severity === 'info' && {
            backgroundColor: 'info.main',
            color: 'info.contrastText',
          }),
        }}
      >
        {toast.message}
      </Alert>
    </Snackbar>
  );
}
