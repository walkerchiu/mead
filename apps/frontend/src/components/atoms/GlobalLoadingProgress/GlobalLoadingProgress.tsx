'use client';

import { useEffect, useState } from 'react';
import { TopProgressBar } from '@/components/atoms/TopProgressBar';
import { subscribeApolloLoading } from '@/lib/apollo-loading-link';

/**
 * GlobalLoadingProgress — 全站任一 Apollo HTTP operation in-flight 時顯示
 * 頂部進度條。和 `NextTopLoader`（router events）+ `ProtectedRoute` 內的
 * `TopProgressBar`（auth check）一起組成三層覆蓋：
 *
 * - NextTopLoader：點 `<Link>` / `router.push` 起到頁面 mount 完
 * - ProtectedRoute：頁面 mount 完起到 auth check 結束
 * - GlobalLoadingProgress（本元件）：auth 通過後 useQuery / useMutation
 *   在跑期間
 *
 * 三層視覺一致（都是 navy 4px glow），對使用者來說是同一條條表現「網頁
 * 還在做事」的訊號，不會有「點完之後一片白等很久」的疑惑。
 *
 * 計數邏輯由 `apolloLoadingLink` 維護；本元件只訂閱、render。
 */
export function GlobalLoadingProgress() {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return subscribeApolloLoading(setLoading);
  }, []);

  if (!loading) return null;
  return <TopProgressBar />;
}

export default GlobalLoadingProgress;
