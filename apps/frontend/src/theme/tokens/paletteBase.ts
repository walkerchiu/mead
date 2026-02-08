import { tones } from './tones';

/**
 * 灰階 — 基於加雲聯網企業識別灰階
 * 100: PANTONE 428C (#dcdddd) 品牌淺灰
 * 300: PANTONE 429C (#b5b5b6) 品牌中灰
 * 600: PANTONE Cool Gray 11C (#595757) 品牌深灰
 */
export const grey = {
  50: '#F5F5F5',
  100: '#dcdddd', // ← PANTONE 428C
  200: '#C4C5C5',
  300: '#b5b5b6', // ← PANTONE 429C
  400: '#999999',
  500: '#797878',
  600: '#595757', // ← PANTONE Cool Gray 11C
  700: '#404040',
  800: '#2A2A2A',
  900: '#1A1A1A',
  950: '#0D0D0D',
} as const;

const white = tones.primary[0];

export const paletteBase = {
  primary: {
    light: tones.primary[100],
    main: tones.primary[600], // #0c3467 品牌深藍
    dark: tones.primary[800], // #00194e 品牌深色
    contrastText: white,
  },
  secondary: {
    light: tones.secondary[50],
    main: tones.secondary[600], // #008ec3 品牌亮藍
    dark: tones.secondary[700],
    contrastText: white,
  },
  accent: {
    light: tones.accent[100],
    main: tones.accent[600],
    dark: tones.accent[700],
    contrastText: white,
  },
  error: {
    light: tones.error[100],
    main: tones.error[600],
    dark: tones.error[700],
    contrastText: white,
  },
  warning: {
    light: tones.warning[100],
    main: tones.warning[600],
    dark: tones.warning[700],
    contrastText: white,
  },
  info: {
    light: tones.info[100],
    main: tones.info[600],
    dark: tones.info[700],
    contrastText: white,
  },
  success: {
    light: tones.success[100],
    main: tones.success[600],
    dark: tones.success[700],
    contrastText: white,
  },
  grey,
  background: {
    default: '#F5F7FA', // 極淺冷灰白
    paper: white,
  },
  divider: grey[100], // #dcdddd 品牌淺灰
  action: {
    active: tones.primary[900],
    disabled: grey[400],
    disabledBackground: grey[50],
  },
  text: {
    primary: tones.primary[900], // #001239 近黑深藍，強化品牌感
    secondary: grey[600], // #595757 品牌深灰
    disabled: grey[400],
  },
} as const;
