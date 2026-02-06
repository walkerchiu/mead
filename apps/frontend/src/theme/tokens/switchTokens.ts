import { paletteBase } from './paletteBase';
import { tones } from './tones';

const grey = paletteBase.grey;
const white = tones.primary[0];

export const switchTokens = {
  sizes: {
    medium: {
      width: 44,
      height: 24,
      padding: 2,
      thumbSize: 20,
      trackRadius: 12,
    },
    small: {
      width: 36,
      height: 20,
      padding: 2,
      thumbSize: 16,
      trackRadius: 10,
    },
  },
  colors: {
    trackOff: grey[200],
    trackOn: tones.primary[500],
    trackDisabled: grey[100],
    thumb: white,
    thumbDisabled: grey[200],
  },
} as const;
