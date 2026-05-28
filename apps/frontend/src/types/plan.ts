/**
 * 教育部藝術設計三大計畫入口網 — 計畫資料型別
 *
 * 對應 `public/data/plans.json`（由參考資料
 * `SPOSAD設計入口網建置資料/data/plans.json` 正規化而來，鍵名改為英文）。
 */

/** 中英雙語文字，缺項為 null */
export interface LocalizedText {
  zh: string | null;
  en: string | null;
}

export type PlanImageType = 'local' | 'remote' | 'remote_folder';

/** 計畫圖片 — 本機圖檔（`src`）或遠端連結（`url`），擇一有值 */
export interface PlanImage {
  type: PlanImageType;
  /** 本機圖片於 /public 下的路徑（type === 'local'），否則為 null */
  src: string | null;
  /** 遠端連結（type 為 remote / remote_folder），否則為 null */
  url: string | null;
}

/** 計畫數據成果的單筆指標 */
export interface PlanStat {
  /** 數字，例如 "20+"、"160萬" */
  value: string;
  /** 單位，例如 "年計畫辦理" */
  unit: string;
  /** 項目說明 */
  description: string;
}

/** 社群連結 */
export interface PlanSocialLink {
  /** 平台名稱：官網 / Facebook / Instagram / YouTube / Linktree */
  platform: string;
  url: string;
}

/** 單一計畫 */
export interface Plan {
  /** 程式用穩定識別碼：sposad / tisdc / idc */
  id: string;
  /** 網址路由用代號 */
  slug: string;
  /** 對應素材資料夾：01_sposad / 02_tisdc / 03_idc */
  folderName: string;
  /** 計畫官方 logo（完整組合圖：標誌＋品牌字標）於 /public 下的路徑 */
  logoUrl?: string;
  name: { zh: string; en: string | null };
  slogan: LocalizedText;
  /** 計畫介紹 */
  intro: string;
  /** 計畫官方網站 —「了解更多」按鈕的連結 */
  officialUrl?: string;
  /** 計畫目的（部分計畫提供，例如 idc） */
  objective?: string;
  /** 具體執行項目（部分計畫提供，例如 idc） */
  executionItems?: string[];
  /** 執行項目補充說明（部分計畫提供） */
  executionNote?: string;
  /** 執行單位 */
  organizers: string[];
  /** 計畫數據成果 */
  stats: PlanStat[];
  banners: PlanImage[];
  socialLinks: PlanSocialLink[];
  /** 精彩照片 */
  photos: PlanImage[];
  /** 裝飾性文字（用於 hero 文字雲） */
  decorativeText: LocalizedText[];
}

/** plans.json 的最上層結構 */
export interface PlansData {
  /** 資料版本，例如 "2026-05-15" */
  version: string;
  plans: Plan[];
}
