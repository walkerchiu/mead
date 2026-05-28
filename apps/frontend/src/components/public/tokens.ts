/**
 * Public Scope — 三大計畫入口網設計 token
 *
 * 數值由設計稿（匯出圖）目測估算，非 Figma 精確量測值，後續可微調。
 * 字型沿用 mead theme（Roboto + Noto Sans TC）；此處僅補入口網特有的
 * 橘色品牌色、灰階背景與圓角／陰影。
 */
export const portalTokens = {
  color: {
    /** 品牌橘 — 強調色（hover 強調 / 時程 highlight / 主標關鍵字 / 指示點） */
    brandOrange: '#E84C1F',
    brandOrangeSoft: '#F4914E',
    /** hero 文字雲色塊漸層 */
    blobOrangeFrom: '#F0682A',
    blobOrangeTo: '#F7AA68',
    blobGrey: '#D7D7D7',
    /** 頁面底色 — 依 IMPLEMENTATION.md §2 常數表 */
    pageBg: '#E4E4E4',
    surface: '#FFFFFF',
    surfaceMuted: '#F2F2F2',
    footerBg: '#E3E3E3',
    /** 文字 */
    ink: '#1E1E1E',
    inkSecondary: '#6E6E6E',
    inkMuted: '#9A9A9A',
  },
  radius: {
    card: 24,
    control: 12,
    pill: 999,
  },
  shadow: {
    card: '0 24px 60px -24px rgba(0, 0, 0, 0.22)',
    pill: '0 6px 20px -8px rgba(0, 0, 0, 0.28)',
    soft: '0 8px 24px -12px rgba(0, 0, 0, 0.18)',
  },
  layout: {
    /** 內容最大寬度 */
    maxWidth: 1200,
    /** 左右留白 */
    gutter: 24,
    /** 斷點 — 對齊設計稿的 <420 / <834 / >834 */
    breakpointMobile: 420,
    breakpointTablet: 834,
  },
  /**
   * 媒體查詢 — 對齊設計稿的三斷點（手機 <420 / 平板 <834 / 桌機 >834）。
   * mead theme 的 MUI 斷點為 xs360/sm768/md1024，與設計稿不符，
   * 故 Public Scope 一律以這組原生 media query 控制響應式。
   */
  mq: {
    /** ≥ 420px：平板（含）以上 */
    mobileUp: '@media (min-width:420px)',
    /** ≥ 834px：桌機版型 */
    tabletUp: '@media (min-width:834px)',
  },
} as const;

export type PortalTokens = typeof portalTokens;
