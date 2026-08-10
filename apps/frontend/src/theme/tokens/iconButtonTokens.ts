import { paletteBase } from './paletteBase';
import { tones } from './tones';

const grey = paletteBase.grey;
const white = tones.primary[0];

export const iconButtonTokens = {
  default: {
    size: 32,
    borderRadius: '50%',
    bg: white,
    hoverBg: grey[50],
    pressedBg: grey[100],
    icon: grey[900],
    disabledBg: grey[50],
    disabledIcon: grey[300],
  },
  tonal: {
    size: 32,
    borderRadius: '50%',
    bg: tones.primary[50],
    hoverBg: tones.primary[100],
    pressedBg: tones.primary[200],
    icon: tones.primary[500],
    disabledBg: grey[50],
    disabledIcon: grey[300],
  },
  outline: {
    size: 32,
    borderRadius: '50%',
    border: grey[200],
    bg: white,
    hoverBg: grey[50],
    pressedBg: grey[100],
    icon: grey[900],
    disabledBorder: grey[200],
    disabledIcon: grey[300],
  },
  toggle: {
    size: 32,
    borderRadius: 10,
    border: tones.primary[100],
    bg: white,
    hoverBg: tones.primary[50],
    pressedBg: tones.primary[100],
    icon: tones.primary[500],
    disabledBorder: grey[200],
    disabledIcon: grey[300],
  },
} as const;
