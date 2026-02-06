import { paletteBase } from './paletteBase';
import { tones } from './tones';

const grey = paletteBase.grey;
const white = tones.primary[0];

export const chipTokens = {
  sizes: {
    small: {
      height: 28,
      paddingX: 12,
      borderRadius: 999,
      gap: 8,
      fontSize: 14,
      fontWeight: 500,
      iconSize: 12,
      iconContainer: 16,
      dotSize: 10,
    },
    medium: {
      height: 36,
      paddingX: 16,
      borderRadius: 999,
      gap: 10,
      fontSize: 16,
      fontWeight: 500,
      iconSize: 14,
      iconContainer: 16,
      dotSize: 12,
    },
    large: {
      height: 44,
      paddingX: 20,
      borderRadius: 999,
      gap: 12,
      fontSize: 18,
      fontWeight: 500,
      iconSize: 16,
      iconContainer: 16,
      dotSize: 14,
    },
  },
  variants: {
    success: {
      bg: tones.success[50],
      text: tones.success[600],
      iconBg: tones.success[600],
      iconColor: white,
    },
    warning: {
      bg: tones.warning[50],
      text: tones.warning[600],
      iconBg: tones.warning[600],
      iconColor: white,
    },
    error: {
      bg: tones.error[50],
      text: tones.error[600],
      iconBg: tones.error[600],
      iconColor: white,
    },
    info: {
      bg: tones.info[50],
      text: tones.info[600],
      iconBg: tones.info[600],
      iconColor: white,
    },
    text: {
      bg: grey[50],
      text: grey[700],
      iconBg: grey[200],
      iconColor: grey[600],
    },
    another: {
      bg: grey[50],
      text: grey[700],
      iconBg: tones.accent[500],
      iconColor: white,
    },
  },
  disabled: {
    bg: grey[50],
    text: grey[300],
    iconBg: grey[200],
    iconColor: grey[300],
  },
} as const;
