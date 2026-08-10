import { colorsDark, greyDark } from './paletteDark';

export const textFieldTokensDark = {
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
    bg: greyDark[200], // Slightly lighter for visibility
    hoverBg: greyDark[300],
    focusBg: greyDark[200],
    border: greyDark[400], // Clear but not harsh
    hoverBorder: greyDark[500],
    pressedBorder: colorsDark.primary.main,
    focusBorder: colorsDark.primary.light,
    disabledBorder: greyDark[300],
    disabledBg: greyDark[100],
    text: greyDark[900], // Very readable
    disabledText: greyDark[600],
    placeholder: greyDark[600], // Subtle but visible
    label: greyDark[700],
    focusLabel: colorsDark.primary.light,
    disabledLabel: greyDark[600],
    helper: greyDark[700],
    errorBorder: colorsDark.error.main,
    errorBg: 'rgba(245, 101, 101, 0.08)',
    errorLabel: colorsDark.error.light,
    errorText: colorsDark.error.light,
  },
} as const;
