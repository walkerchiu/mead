import { tones } from './tones';

/**
 * Dark mode 色彩配置
 *
 * 設計原則：
 * - 保留品牌深藍識別：primary 使用提亮版本（400 階）而非改換色相
 * - 柔和對比：避免純黑白造成眼睛疲勞
 * - 品牌一致性：Light/Dark 使用同一品牌色系，只調整亮度
 */

export const greyDark = {
  50: '#0D0D0D', // Darkest - main background
  100: '#1A1A1A', // Very dark - paper/card
  200: '#262626', // Dark - hover states
  300: '#2E2E2E', // Medium dark - borders
  400: '#404040', // Medium - disabled elements
  500: '#595757', // Medium light - PANTONE Cool Gray 11C
  600: '#797878', // Light - placeholder text
  700: '#999999', // Lighter - secondary text
  800: '#b5b5b6', // Very light - PANTONE 429C
  900: '#dcdddd', // Near white - PANTONE 428C
  950: '#F5F5F5', // Almost white - emphasized text
} as const;

const white = tones.primary[0];

// Dark mode：以品牌色提亮版本為主，保留品牌識別
export const colorsDark = {
  // 深色背景下的提亮版本（400 階），保持品牌藍識別
  primary: {
    light: tones.primary[300],
    main: tones.primary[400], // #658BBF 提亮深藍
    dark: tones.primary[600], // #0c3467 原始品牌色
    contrastText: white,
  },
  // 品牌亮藍在深色下更搶眼，使用略淺版本
  secondary: {
    light: tones.secondary[200],
    main: tones.secondary[300], // #5FB0CF 提亮亮藍
    dark: tones.secondary[600],
    contrastText: white,
  },
  accent: {
    light: tones.accent[200],
    main: tones.accent[400],
    dark: tones.accent[600],
    contrastText: white,
  },
  // 語意色：提亮版本
  error: {
    light: tones.error[300],
    main: tones.error[400], // #F87171
    dark: tones.error[600],
    contrastText: white,
  },
  warning: {
    light: tones.warning[300],
    main: tones.warning[400], // #FBBF24
    dark: tones.warning[600],
    contrastText: white,
  },
  info: {
    light: tones.info[200],
    main: tones.info[300], // 與 secondary 一致（品牌亮藍提亮版）
    dark: tones.info[600],
    contrastText: white,
  },
  success: {
    light: tones.success[300],
    main: tones.success[400], // #34D399
    dark: tones.success[600],
    contrastText: white,
  },
} as const;

export const paletteDark = {
  ...colorsDark,
  grey: greyDark,
  background: {
    default: '#0D0D0D', // 純深灰黑
    paper: '#1A1A1A', // 稍亮的卡片底
  },
  divider: 'rgba(255, 255, 255, 0.12)',
  action: {
    active: 'rgba(255, 255, 255, 0.92)',
    hover: 'rgba(255, 255, 255, 0.04)',
    selected: 'rgba(255, 255, 255, 0.08)',
    disabled: 'rgba(255, 255, 255, 0.26)',
    disabledBackground: 'rgba(255, 255, 255, 0.08)',
    focus: 'rgba(255, 255, 255, 0.12)',
  },
  text: {
    primary: 'rgba(255, 255, 255, 0.92)',
    secondary: 'rgba(255, 255, 255, 0.65)',
    disabled: 'rgba(255, 255, 255, 0.38)',
  },
} as const;
