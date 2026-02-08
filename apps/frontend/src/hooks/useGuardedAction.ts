'use client';

import { useCallback, useRef, useState } from 'react';

/**
 * 防止非同步操作被重複觸發。
 * 當操作正在執行時，再次呼叫會被忽略。
 *
 * @example
 * const { execute, loading } = useGuardedAction(async () => {
 *   await submitForm();
 * });
 * <Button onClick={execute} disabled={loading}>提交</Button>
 */
export function useGuardedAction<T extends (...args: any[]) => Promise<any>>(
  action: T,
) {
  const [loading, setLoading] = useState(false);
  const lockRef = useRef(false);

  const execute = useCallback(
    async (...args: Parameters<T>): Promise<ReturnType<T> | undefined> => {
      if (lockRef.current) return undefined;
      lockRef.current = true;
      setLoading(true);
      try {
        const result = await action(...args);
        return result;
      } finally {
        lockRef.current = false;
        setLoading(false);
      }
    },
    [action],
  ) as (...args: Parameters<T>) => Promise<ReturnType<T> | undefined>;

  return { execute, loading };
}
