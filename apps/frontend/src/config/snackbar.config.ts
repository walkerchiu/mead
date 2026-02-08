import { SnackbarOrigin } from 'notistack';

/**
 * Snackbar (Toast) 通知配置
 *
 * 可以根據需求調整通知的位置、持續時間和最大顯示數量
 */

export interface SnackbarConfig {
  /** 通知顯示位置 */
  anchorOrigin: SnackbarOrigin;
  /** 自動隱藏時間（毫秒） */
  autoHideDuration: number;
  /** 最大同時顯示的通知數量 */
  maxSnack: number;
}

/**
 * 預設 Snackbar 配置
 *
 * 可以通過修改此對象來改變全局通知位置和行為
 */
export const snackbarConfig: SnackbarConfig = {
  // 通知位置：下方中央
  // 可選值：
  // - top-left, top-center, top-right
  // - bottom-left, bottom-center, bottom-right
  anchorOrigin: {
    vertical: 'bottom',
    horizontal: 'center',
  },

  // 自動隱藏時間：1.5 秒
  // 建議範圍：1000-5000ms
  autoHideDuration: 1500,

  // 最大同時顯示數量：3 個
  // 建議範圍：1-5
  maxSnack: 3,
};

/**
 * 預定義的位置配置
 *
 * 快速切換常用位置
 */
export const snackbarPositions = {
  topRight: {
    vertical: 'top' as const,
    horizontal: 'right' as const,
  },
  topCenter: {
    vertical: 'top' as const,
    horizontal: 'center' as const,
  },
  topLeft: {
    vertical: 'top' as const,
    horizontal: 'left' as const,
  },
  bottomRight: {
    vertical: 'bottom' as const,
    horizontal: 'right' as const,
  },
  bottomCenter: {
    vertical: 'bottom' as const,
    horizontal: 'center' as const,
  },
  bottomLeft: {
    vertical: 'bottom' as const,
    horizontal: 'left' as const,
  },
};
