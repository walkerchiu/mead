/**
 * 錯誤訊息映射表（映射到翻譯鍵）
 * 返回 null 表示使用原始錯誤訊息或 fallback
 */
export function getErrorTranslationKey(errorMessage: string): string | null {
  const lowerMessage = errorMessage.toLowerCase();

  if (lowerMessage.includes('session not found')) {
    return 'sessionNotFound';
  }
  if (lowerMessage.includes('session already revoked')) {
    return 'sessionAlreadyRevoked';
  }
  if (
    lowerMessage.includes('cannot revoke your current session') ||
    lowerMessage.includes('cannot revoke current session')
  ) {
    return 'cannotRevokeCurrent';
  }
  if (
    lowerMessage.includes('cannot access hq') ||
    lowerMessage.includes('cannot revoke other hq') ||
    lowerMessage.includes('cannot revoke hq')
  ) {
    return 'cannotRevokeHQ';
  }
  if (lowerMessage.includes('user not authenticated')) {
    return 'notAuthenticated';
  }
  if (lowerMessage.includes('only access your own sessions')) {
    return 'ownSessionsOnly';
  }
  if (lowerMessage.includes('target user not found')) {
    return 'userNotFound';
  }

  return null;
}

/**
 * 從 Apollo 錯誤中提取可讀的錯誤訊息
 *
 * @param error - 捕獲的錯誤物件
 * @param fallback - 當無法提取錯誤訊息時的預設訊息
 * @returns 錯誤訊息字串，如果是 AbortError 或 token refresh 錯誤則返回空字串
 */
export function getErrorMessage(error: unknown, fallback: string): string {
  // 檢查是否為 AbortError（用戶取消請求）
  if (error instanceof Error && error.name === 'AbortError') {
    return ''; // 不顯示 AbortError
  }

  // 檢查是否為 Apollo GraphQL 錯誤 (有 graphQLErrors 或 networkError)
  if (
    error &&
    typeof error === 'object' &&
    ('graphQLErrors' in error || 'networkError' in error)
  ) {
    const apolloError = error as {
      graphQLErrors?: Array<{ message: string }>;
      networkError?: { message?: string; name?: string } | null;
      message?: string;
    };

    // 檢查 networkError 是否為 AbortError
    if (apolloError.networkError?.name === 'AbortError') {
      return ''; // 不顯示 AbortError
    }

    // 優先使用 GraphQL 錯誤訊息
    if (apolloError.graphQLErrors && apolloError.graphQLErrors.length > 0) {
      const errorMessage = apolloError.graphQLErrors[0].message;

      // ✅ 只過濾 token refresh 相關的錯誤（由認證系統自動處理）
      if (
        errorMessage.includes('Refresh token not found') ||
        errorMessage.includes('Invalid refresh token')
      ) {
        return ''; // 不顯示 token refresh 錯誤
      }

      // 過濾掉 GraphQL schema 驗證錯誤，使用 fallback 訊息
      if (
        errorMessage.includes('Cannot return null for non-nullable field') ||
        (errorMessage.includes('Field') &&
          errorMessage.includes('of required type') &&
          errorMessage.includes('was not provided'))
      ) {
        return fallback; // 使用 fallback 訊息（通常是翻譯後的友善訊息）
      }

      return errorMessage;
    }
    // 網路錯誤
    if (apolloError.networkError?.message) {
      return apolloError.networkError.message;
    }
    // 預設 Apollo 錯誤訊息
    if (apolloError.message) {
      const errorMessage = apolloError.message;

      // 過濾掉 GraphQL schema 驗證錯誤，使用 fallback 訊息
      if (
        errorMessage.includes('Cannot return null for non-nullable field') ||
        (errorMessage.includes('Field') &&
          errorMessage.includes('of required type') &&
          errorMessage.includes('was not provided'))
      ) {
        return fallback; // 使用 fallback 訊息（通常是翻譯後的友善訊息）
      }

      return errorMessage;
    }
  }

  // 一般 Error
  if (error instanceof Error) {
    return error.message;
  }

  // 字串錯誤
  if (typeof error === 'string') {
    return error;
  }

  // 未知錯誤
  return fallback;
}
