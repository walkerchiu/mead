/**
 * 三大計畫資料 fixture — 供 Storybook story 使用。
 *
 * 直接匯入 `public/data/plans.json`（單一資料來源），避免與正式資料分歧。
 */
import type { Plan, PlansData } from '@/types/plan';

import plansJson from '../../../public/data/plans.json';

export const plansData = plansJson as PlansData;

/** 三大計畫陣列 */
export const plansFixture: Plan[] = plansData.plans;

const byId = (id: string): Plan => {
  const plan = plansFixture.find((p) => p.id === id);
  if (!plan) throw new Error(`Plan fixture not found: ${id}`);
  return plan;
};

/** 教育部 藝術與設計菁英海外培訓計畫 */
export const sposadPlan: Plan = byId('sposad');
/** 臺灣國際學生創意設計大賽 */
export const tisdcPlan: Plan = byId('tisdc');
/** 教育部鼓勵學生參加藝術與設計類國際競賽計畫 */
export const idcPlan: Plan = byId('idc');
