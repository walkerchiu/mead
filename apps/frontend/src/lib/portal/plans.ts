/**
 * 三大計畫入口網 — 計畫資料存取與輔助函式
 *
 * 資料來源為靜態 JSON（`public/data/plans.json`），於執行時以 fetch 取得。
 * 呼叫端透過此模組存取資料，不依賴檔案路徑細節。
 */
import type { Plan, PlanImage } from '@/types/plan';
import type { PlansData } from '@/types/plan';

/** plans.json 於 /public 下的對外路徑 */
export const PLANS_DATA_URL = '/data/plans.json';

/**
 * 取得三大計畫資料。於 client 端呼叫（相對路徑 fetch）。
 * @throws 當 HTTP 回應非 2xx 時
 */
export async function fetchPlansData(signal?: AbortSignal): Promise<PlansData> {
  const res = await fetch(PLANS_DATA_URL, { signal });
  if (!res.ok) {
    throw new Error(`Failed to load plans.json (HTTP ${res.status})`);
  }
  return (await res.json()) as PlansData;
}

/** 取得計畫的代表性 banner — 優先本機圖檔，其次遠端連結 */
export function getPrimaryBanner(plan: Plan): PlanImage | undefined {
  return (
    plan.banners.find((b) => b.type === 'local' && b.src) ?? plan.banners[0]
  );
}

/** 取得計畫可直接顯示的本機照片（過濾掉純遠端連結） */
export function getLocalPhotos(plan: Plan): PlanImage[] {
  return plan.photos.filter((p) => p.type === 'local' && p.src);
}

/** 取得指定平台的社群連結網址 */
export function getSocialUrl(plan: Plan, platform: string): string | undefined {
  return plan.socialLinks.find(
    (s) => s.platform.toLowerCase() === platform.toLowerCase(),
  )?.url;
}
