import { paletteBase } from './paletteBase';
import { tones } from './tones';

const grey = paletteBase.grey;
const white = tones.primary[0];

export const textFieldTokens = {
  sizes: {
    large: {
      height: 48,
      paddingX: 16,
      borderRadius: 20,
      fontSize: 14,
      labelFontSize: 12,
    },
    medium: {
      height: 40,
      paddingX: 14,
      borderRadius: 20,
      fontSize: 14,
      labelFontSize: 12,
    },
    small: {
      height: 32,
      paddingX: 12,
      borderRadius: 16,
      fontSize: 13,
      labelFontSize: 12,
    },
  },
  colors: {
    bg: white,
    hoverBg: white,
    focusBg: white,
    border: grey[200],
    hoverBorder: grey[600],
    pressedBorder: tones.primary[600],
    focusBorder: tones.primary[500],
    disabledBorder: grey[200],
    disabledBg: grey[50],
    text: grey[900],
    disabledText: grey[300],
    placeholder: grey[300],
    label: grey[600],
    focusLabel: tones.primary[500],
    disabledLabel: grey[300],
    helper: grey[400],
    errorBorder: tones.error[500],
    errorBg: tones.error[50],
    errorLabel: tones.error[600],
    errorText: tones.error[600],
  },
} as const;
