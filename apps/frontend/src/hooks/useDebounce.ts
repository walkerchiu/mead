import { useState, useEffect } from 'react';

/**
 * useDebounce Hook
 *
 * 延遲更新值，避免頻繁觸發昂貴的操作（如 API 請求）
 *
 * @param value - 要 debounce 的值
 * @param delay - 延遲時間（毫秒），預設 500ms
 * @returns debounced 值
 *
 * @example
 * ```tsx
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearchTerm = useDebounce(searchTerm, 500);
 *
 * useEffect(() => {
 *   // 只有在用戶停止輸入 500ms 後才會執行
 *   if (debouncedSearchTerm) {
 *     searchAPI(debouncedSearchTerm);
 *   }
 * }, [debouncedSearchTerm]);
 * ```
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // 設定 timer 延遲更新值
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // 清理函數：當 value 或 delay 改變時，取消前一個 timer
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
