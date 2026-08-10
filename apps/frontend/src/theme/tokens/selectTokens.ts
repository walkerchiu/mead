import { paletteBase } from './paletteBase';
import { tones } from './tones';

const grey = paletteBase.grey;
const white = tones.primary[0];

export const selectTokens = {
  sizes: {
    large: {
      height: 48,
      paddingX: 16,
      borderRadius: 50,
      fontSize: 14,
      labelFontSize: 12,
    },
    medium: {
      height: 40,
      paddingX: 14,
      borderRadius: 50,
      fontSize: 14,
      labelFontSize: 12,
    },
    small: {
      height: 32,
      paddingX: 12,
      borderRadius: 50,
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
    focusBorder: tones.primary[600],
    pressedBorder: tones.primary[600],
    text: grey[900],
    placeholder: grey[300],
    label: grey[600],
    focusLabel: tones.primary[600],
    icon: grey[900],
    disabledBg: grey[50],
    disabledBorder: grey[200],
    disabledText: grey[300],
    disabledIcon: grey[300],
    errorBorder: tones.error[500],
    errorLabel: tones.error[500],
    errorText: tones.error[500],
    helper: grey[400],
    menuBg: white,
    menuBorder: grey[200],
    menuShadow: '0 4px 12px rgba(33, 38, 48, 0.12)',
    optionText: grey[900],
    optionHoverBg: tones.primary[50],
    optionSelectedBg: tones.primary[100],
    checkColor: tones.primary[600],
    checkboxBorder: grey[200],
    checkboxBg: white,
    checkboxIndeterminate: grey[300],
  },
} as const;
