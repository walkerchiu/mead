import { paletteBase } from './paletteBase';
import { tones } from './tones';

const grey = paletteBase.grey;
const white = tones.primary[0];

export const radioTokens = {
  sizes: {
    large: {
      size: 24,
      dot: 14,
      borderWidth: 1,
    },
    medium: {
      size: 20,
      dot: 12,
      borderWidth: 1,
    },
    small: {
      size: 16,
      dot: 10,
      borderWidth: 1,
    },
  },
  colors: {
    unchecked: {
      border: grey[200],
      bg: white,
      hoverBorder: grey[300],
      hoverBg: grey[50],
      pressedBorder: grey[400],
      pressedBg: grey[100],
      disabledBorder: grey[100],
      disabledBg: white,
    },
    checked: {
      border: tones.primary[500],
      bg: tones.primary[50],
      dot: tones.primary[500],
      hoverBorder: tones.primary[600],
      hoverBg: tones.primary[100],
      hoverDot: tones.primary[600],
      pressedBorder: tones.primary[700],
      pressedBg: tones.primary[200],
      pressedDot: tones.primary[700],
      disabledBorder: grey[200],
      disabledBg: white,
      disabledDot: grey[300],
    },
  },
} as const;
