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

/** 時程事件的日期端點：僅月份（`precision: 'month'`）或含日（`precision: 'day'`） */
export interface TimelineDate {
  /** 月份 1–12 */
  month: number;
  /** 日 1–31（`precision: 'day'` 才有） */
  day?: number;
}

/**
 * 時程事件。`kind: 'range'` 為期間（長條）、`kind: 'point'` 為單一時間點（圓點）。
 * `precision: 'month'` 只有月份、`precision: 'day'` 含日期，位置比例依此換算。
 */
export interface TimelineEvent {
  /** 穩定識別碼，例如 "sposad-2026-brief" */
  id: string;
  kind: 'point' | 'range';
  precision: 'month' | 'day';
  /** 起點（point 亦用此欄） */
  start: TimelineDate;
  /** 期間終點（`kind: 'range'` 才有） */
  end?: TimelineDate;
  /** 顯示用日期標籤，例如 "3月"、"4/27(一)-7/6(一)" */
  dateLabel: string;
  title: string;
  /** 補充說明（tooltip／列表用）；未提供時不顯示 */
  note?: string;
}

/** 單一年度的時程（固定 1–12 月軸） */
export interface PlanTimelineYear {
  /** 年度西元年，例如 2026 */
  year: number;
  /** 年度顯示標籤，例如 "隔年（2027）"；未提供時以 `${year}年` 呈現 */
  label?: string;
  events: TimelineEvent[];
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
  /**
   * 計畫識別牌：純標誌圖＋另排名稱文字（依設計稿）。提供時識別區以「標誌圖＋名稱
   * 文字」呈現（文字保持向量銳利、可雙語），取代 `logoUrl` 完整組合圖。
   * `nameZh` 為依設計稿手動斷行的中文逐行；`nameEn` 為英文（隨容器自然換行）。
   */
  logoNameplate?: { mark: string; nameZh: string[]; nameEn: string };
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
  /** 計畫時程（依年度分組；可含多個年度，例如菁培的當年與隔年） */
  timelines?: PlanTimelineYear[];
}

/** plans.json 的最上層結構 */
export interface PlansData {
  /** 資料版本，例如 "2026-05-15" */
  version: string;
  plans: Plan[];
}
