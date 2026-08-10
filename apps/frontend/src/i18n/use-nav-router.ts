'use client';

import { useRouter as useIntlRouter } from '@/i18n/routing';
import { useProgress } from '@bprogress/next';

/**
 * useNavRouter — next-intl 的 localized router，但 push / replace / back /
 * forward 在被呼叫的瞬間先 fire `@bprogress/next` 的頂部進度條。
 *
 * 為什麼要包：
 * - `ProgressProvider` 內建只攔 anchor click（`<a>` / `<Link>`），程式式
 *   `router.push(…)` 不走 anchor 點擊事件，bar 不會 fire。
 * - 包一層在 user-initiated 方法插 `progress.start()`，全站 sidebar、Button
 *   onClick router.push、locale switcher、back button…
 *   每個程式式導航都會看到頂部進度條。
 *
 * 為什麼**不**直接放回 `@/i18n/routing`：
 * - 那個檔被 middleware (`src/proxy.ts`) import，跑在 Edge runtime。
 * - `@bprogress/next` 用 React `createContext`，Edge runtime 沒有完整 React，
 *   middleware 載到會炸 `createContext is not a function`。
 * - 所以 progress wrapper 必須關在 `'use client'` 模組裡，不能讓 server side
 *   碰到。
 *
 * 用法（client component 內使用）：
 *
 *   import { useNavRouter } from '@/i18n/use-nav-router';
 *   const router = useNavRouter();
 *   router.push('/dashboard');  // 進度條 fire
 *
 * 型別與 next-intl `useRouter` 完全一致 —`{ pathname, query }` 物件型 href
 * 也支援。
 */
export const useNavRouter: typeof useIntlRouter = () => {
  const router = useIntlRouter();
  const progress = useProgress();

  return {
    ...router,
    push: (href, options) => {
      progress.start();
      router.push(href, options);
    },
    replace: (href, options) => {
      progress.start();
      router.replace(href, options);
    },
    back: () => {
      progress.start();
      router.back();
    },
    forward: () => {
      progress.start();
      router.forward();
    },
  };
};
