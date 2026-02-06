'use client';

import { createTheme } from '@mui/material/styles';

import { actionButtonTokens } from './tokens/actionButtonTokens';
import { breakpoints } from './tokens/breakpoints';
import { buttonTokens } from './tokens/buttonTokens';
import { chipTokens } from './tokens/chipTokens';
import { iconButtonTokens } from './tokens/iconButtonTokens';
import { paletteBase } from './tokens/paletteBase';
import { radioTokens } from './tokens/radioTokens';
import { switchTokens } from './tokens/switchTokens';
import { searchTokens } from './tokens/searchTokens';
import { textFieldTokens } from './tokens/textFieldTokens';
import { tones } from './tokens/tones';
import { typography } from './tokens/typography';

export const theme = createTheme({
  breakpoints,
  palette: {
    mode: 'light',
    buttonTokens,
    iconButtonTokens,
    actionButtonTokens,
    switchTokens,
    radioTokens,
    searchTokens,
    chipTokens,
    textFieldTokens,
    tones,
    ...paletteBase,
  },
  typography,
});
