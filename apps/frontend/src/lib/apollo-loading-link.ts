import { ApolloLink, Observable } from '@apollo/client';

/**
 * apolloLoadingLink — counts in-flight HTTP operations (queries / mutations).
 *
 * 配合 `<GlobalLoadingProgress>` 在頂部跑一條進度條，全站任一頁有 Apollo
 * request 還沒回來就會看到 visual cue。
 *
 * 設計重點：
 * - 不掛在 WebSocket subscription 那條 link，避免長連線把計數卡在 >0
 * - cleanup 走 unsubscribe（observer 被 React 解掉、AbortController 觸發等）
 *   也會 decrement，不會因為 user 中途換頁就讓計數漏 decrement
 * - 計數合併（next 不 decrement、error/complete/unsubscribe 才 decrement）
 *   避免一個 operation 因為發多筆 result 多次 decrement
 */

let activeCount = 0;
type Listener = (loading: boolean) => void;
const listeners = new Set<Listener>();

function notify(): void {
  const loading = activeCount > 0;
  listeners.forEach((fn) => fn(loading));
}

export function subscribeApolloLoading(fn: Listener): () => void {
  listeners.add(fn);
  // 訂閱時立刻同步當前狀態，避免訂閱者開一個瞬間錯過事件
  fn(activeCount > 0);
  return () => {
    listeners.delete(fn);
  };
}

/** test-only：清掉計數（被測試 race condition 殘留時用） */
export function _resetApolloLoadingCount(): void {
  activeCount = 0;
  notify();
}

export const apolloLoadingLink = new ApolloLink((operation, forward) => {
  activeCount += 1;
  notify();

  return new Observable((observer) => {
    let decremented = false;
    const decrement = (): void => {
      if (decremented) return;
      decremented = true;
      activeCount = Math.max(0, activeCount - 1);
      notify();
    };

    const sub = forward(operation).subscribe({
      next: (value) => observer.next(value),
      error: (err) => {
        decrement();
        observer.error(err);
      },
      complete: () => {
        decrement();
        observer.complete();
      },
    });

    return () => {
      decrement();
      sub.unsubscribe();
    };
  });
});
