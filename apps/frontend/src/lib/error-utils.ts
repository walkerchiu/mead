/**
 * 錯誤訊息映射表（映射到翻譯鍵）
 * 返回 null 表示使用原始錯誤訊息或 fallback
 */
export function getErrorTranslationKey(errorMessage: string): string | null {
  const lowerMessage = errorMessage.toLowerCase();

  if (
    lowerMessage.includes('failed to load') ||
    lowerMessage.includes('load plans.json')
  ) {
    return 'dataLoadFailed';
  }

  return null;
}

/**
 * 從未知錯誤中提取可讀的錯誤訊息
 *
 * @param error - 捕獲的錯誤物件
 * @param fallback - 當無法提取錯誤訊息時的預設訊息
 * @returns 錯誤訊息字串；AbortError 代表使用者取消請求，不顯示訊息
 */
export function getErrorMessage(error: unknown, fallback: string): string {
  // 檢查是否為 AbortError（用戶取消請求）
  if (error instanceof Error && error.name === 'AbortError') {
    return ''; // 不顯示 AbortError
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
