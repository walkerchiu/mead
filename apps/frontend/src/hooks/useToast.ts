/**
 * useToast Hook
 * 提供全站統一的 Toast 通知功能
 */

import { useState, useCallback } from 'react';

export type ToastSeverity = 'success' | 'error' | 'warning' | 'info';

export interface ToastState {
  open: boolean;
  message: string;
  severity: ToastSeverity;
}

export interface ToastOptions {
  /**
   * 通知訊息
   */
  message: string;
  /**
   * 通知類型
   * @default 'info'
   */
  severity?: ToastSeverity;
  /**
   * 自動隱藏時間（毫秒）
   * @default 6000
   */
  autoHideDuration?: number;
}

export function useToast() {
  const [toast, setToast] = useState<ToastState>({
    open: false,
    message: '',
    severity: 'info',
  });

  /**
   * 顯示 Toast 通知
   */
  const showToast = useCallback((options: ToastOptions) => {
    setToast({
      open: true,
      message: options.message,
      severity: options.severity || 'info',
    });
  }, []);

  /**
   * 顯示成功通知（綠色）
   */
  const showSuccess = useCallback(
    (message: string) => {
      showToast({ message, severity: 'success' });
    },
    [showToast],
  );

  /**
   * 顯示錯誤通知（紅色）
   */
  const showError = useCallback(
    (message: string) => {
      showToast({ message, severity: 'error' });
    },
    [showToast],
  );

  /**
   * 顯示警告通知（橘色）
   */
  const showWarning = useCallback(
    (message: string) => {
      showToast({ message, severity: 'warning' });
    },
    [showToast],
  );

  /**
   * 顯示資訊通知（藍色）
   */
  const showInfo = useCallback(
    (message: string) => {
      showToast({ message, severity: 'info' });
    },
    [showToast],
  );

  /**
   * 關閉 Toast
   */
  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, open: false }));
  }, []);

  return {
    toast,
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    hideToast,
  };
}
