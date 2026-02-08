/**
 * Desktop Notification Utility
 *
 * 提供瀏覽器桌面通知功能
 */

export type DesktopNotificationOptions = {
  title: string;
  body: string;
  icon?: string;
  tag?: string; // 用於識別和替換通知
  requireInteraction?: boolean; // 通知是否需要用戶互動才會關閉
  onClick?: () => void;
};

/**
 * 檢查瀏覽器是否支援桌面通知
 */
export function isDesktopNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * 取得當前的通知權限狀態
 */
export function getNotificationPermission(): NotificationPermission | null {
  if (!isDesktopNotificationSupported()) {
    return null;
  }
  return Notification.permission;
}

/**
 * 請求通知權限
 */
export async function requestNotificationPermission(): Promise<NotificationPermission | null> {
  if (!isDesktopNotificationSupported()) {
    console.warn(
      '[DesktopNotification] Browser does not support notifications',
    );
    return null;
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission === 'denied') {
    console.warn('[DesktopNotification] Notification permission denied');
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();
    console.log('[DesktopNotification] Permission result:', permission);
    return permission;
  } catch (error) {
    console.error('[DesktopNotification] Failed to request permission:', error);
    return null;
  }
}

/**
 * 顯示桌面通知
 */
export async function showDesktopNotification(
  options: DesktopNotificationOptions,
): Promise<Notification | null> {
  // 檢查瀏覽器支援
  if (!isDesktopNotificationSupported()) {
    console.warn(
      '[DesktopNotification] Browser does not support notifications',
    );
    return null;
  }

  // 檢查權限
  if (Notification.permission === 'default') {
    const permission = await requestNotificationPermission();
    if (permission !== 'granted') {
      return null;
    }
  }

  if (Notification.permission !== 'granted') {
    console.warn(
      '[DesktopNotification] Notification permission not granted:',
      Notification.permission,
    );
    return null;
  }

  try {
    // 建立通知
    const notification = new Notification(options.title, {
      body: options.body,
      icon: options.icon || '/favicon.ico',
      tag: options.tag,
      requireInteraction: options.requireInteraction || false,
      silent: false, // 允許系統音效
    });

    // 設定點擊事件
    if (options.onClick) {
      notification.onclick = () => {
        window.focus(); // 將焦點切換到視窗
        options.onClick?.();
        notification.close();
      };
    }

    // 自動關閉（如果沒有設定 requireInteraction）
    if (!options.requireInteraction) {
      setTimeout(() => {
        notification.close();
      }, 5000); // 5 秒後自動關閉
    }

    return notification;
  } catch (error) {
    console.error('[DesktopNotification] Failed to show notification:', error);
    return null;
  }
}

/**
 * 關閉所有通知（使用相同 tag）
 */
export function closeNotificationByTag(tag: string) {
  // 注意：目前沒有 API 可以直接關閉指定 tag 的通知
  // 只能在建立時使用相同的 tag 來替換舊通知
  console.log('[DesktopNotification] Tag-based closing requested:', tag);
}
