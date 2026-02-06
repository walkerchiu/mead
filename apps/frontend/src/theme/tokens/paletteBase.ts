import { tones } from './tones';

export const grey = {
  50: '#F6F7F9',
  100: '#ECEFF2',
  200: '#D4DAE3',
  300: '#AFBACA',
  400: '#8396AD',
  500: '#637994',
  600: '#4F617A',
  700: '#414F63',
  800: '#384354',
  900: '#2A313C',
  950: '#212630',
} as const;

const white = tones.primary[0];

export const paletteBase = {
  primary: {
    light: tones.primary[100],
    main: tones.primary[600],
    dark: tones.primary[700],
    contrastText: white,
  },
  secondary: {
    light: tones.secondary[100],
    main: tones.secondary[600],
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
    default: tones.primary[50],
    paper: white,
  },
  divider: grey[200],
  action: {
    active: grey[950],
    disabled: grey[400],
    disabledBackground: grey[100],
  },
  text: {
    primary: grey[900],
    secondary: grey[800],
    disabled: grey[400],
  },
} as const;
