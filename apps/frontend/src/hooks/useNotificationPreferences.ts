import { useEffect } from 'react';
import { useQuery, useMutation, useApolloClient } from '@apollo/client/react';
import { useSnackbar } from 'notistack';
import {
  GET_NOTIFICATION_PREFERENCES,
  UPDATE_NOTIFICATION_PREFERENCES,
  NotificationPreferences,
  UpdateNotificationPreferencesInput,
} from '@/graphql/notification';
import { useAuthReady } from '@/components/auth/ProtectedRoute';

/**
 * useNotificationPreferences Hook
 *
 * 提供通知偏好設定的所有功能：
 * - 查詢通知偏好設定
 * - 更新通知偏好設定
 * - 檢查特定類型的通知是否啟用
 */
export function useNotificationPreferences(options?: { skip?: boolean }) {
  const { enqueueSnackbar } = useSnackbar();
  const apolloClient = useApolloClient();
  const authReady = useAuthReady();

  // 查詢通知偏好設定
  const { data, loading, error, refetch } = useQuery<{
    myNotificationPreferences: NotificationPreferences;
  }>(GET_NOTIFICATION_PREFERENCES, {
    skip: !authReady || options?.skip,
    fetchPolicy: 'cache-and-network',
  });

  // Log errors using useEffect instead of onError callback
  useEffect(() => {
    if (error) {
      console.error(
        '[useNotificationPreferences] Failed to fetch preferences:',
        error,
      );
    }
  }, [error]);

  // 更新通知偏好設定
  const [updatePreferencesMutation, { loading: updating }] = useMutation<
    { updateMyNotificationPreferences: NotificationPreferences },
    { input: UpdateNotificationPreferencesInput }
  >(UPDATE_NOTIFICATION_PREFERENCES, {
    onCompleted: (data) => {
      console.log(
        '[useNotificationPreferences] Preferences updated:',
        data.updateMyNotificationPreferences,
      );
      enqueueSnackbar('通知設定已成功儲存', { variant: 'success' });

      // 手動更新快取
      apolloClient.cache.writeQuery({
        query: GET_NOTIFICATION_PREFERENCES,
        data: {
          myNotificationPreferences: data.updateMyNotificationPreferences,
        },
      });
    },
    onError: (error) => {
      console.error(
        '[useNotificationPreferences] Failed to update preferences:',
        error,
      );
      enqueueSnackbar('儲存通知設定失敗', { variant: 'error' });
    },
  });

  const preferences = data?.myNotificationPreferences;

  /**
   * 更新通知偏好設定
   */
  const updatePreferences = async (
    input: UpdateNotificationPreferencesInput,
  ) => {
    try {
      await updatePreferencesMutation({ variables: { input } });
    } catch (error) {
      console.error(
        '[useNotificationPreferences] Update preferences error:',
        error,
      );
      throw error;
    }
  };

  /**
   * 檢查特定類型的通知是否啟用
   */
  const isNotificationTypeEnabled = (
    type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR',
  ): boolean => {
    if (!preferences) return true; // 預設啟用

    switch (type) {
      case 'INFO':
        return preferences.enableInfo;
      case 'SUCCESS':
        return preferences.enableSuccess;
      case 'WARNING':
        return preferences.enableWarning;
      case 'ERROR':
        return preferences.enableError;
      default:
        return true;
    }
  };

  /**
   * 檢查瀏覽器通知是否啟用
   */
  const isBrowserNotificationEnabled = (): boolean => {
    return preferences?.enableBrowser ?? true;
  };

  /**
   * 檢查通知音效是否啟用
   */
  const isSoundEnabled = (): boolean => {
    return preferences?.enableSound ?? true;
  };

  /**
   * 檢查桌面通知是否啟用
   */
  const isDesktopNotificationEnabled = (): boolean => {
    return preferences?.enableDesktop ?? true;
  };

  return {
    // 資料
    preferences,
    loading,
    error,

    // 操作方法
    updatePreferences,
    refetch,

    // 檢查方法
    isNotificationTypeEnabled,
    isBrowserNotificationEnabled,
    isSoundEnabled,
    isDesktopNotificationEnabled,

    // 狀態
    updating,
  };
}
