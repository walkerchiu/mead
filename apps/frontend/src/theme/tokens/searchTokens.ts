import { paletteBase } from './paletteBase';
import { tones } from './tones';

const grey = paletteBase.grey;
const white = tones.primary[0];

export const searchTokens = {
  sizes: {
    medium: {
      height: 48,
      paddingX: 18,
      iconGap: 10,
      iconSize: 24,
      clearSize: 28,
    },
    small: {
      height: 40,
      paddingX: 14,
      iconGap: 8,
      iconSize: 20,
      clearSize: 24,
    },
    large: {
      height: 56,
      paddingX: 22,
      iconGap: 12,
      iconSize: 26,
      clearSize: 32,
    },
  },
  variants: {
    pill: {
      borderRadius: 999,
    },
    rounded: {
      borderRadius: 20,
    },
  },
  colors: {
    bg: white,
    border: grey[200],
    hoverBorder: grey[600],
    focusBorder: tones.primary[500],
    activeBorder: tones.primary[500],
    disabledBorder: grey[200],
    disabledBg: grey[50],
    text: grey[900],
    placeholder: grey[300],
    icon: grey[900],
    clearBg: grey[300],
    clearIcon: white,
  },
} as const;
