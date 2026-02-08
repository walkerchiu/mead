'use client';

import { createTheme, Theme } from '@mui/material/styles';

import { actionButtonTokens } from './tokens/actionButtonTokens';
import { breakpoints } from './tokens/breakpoints';
import { buttonTokens } from './tokens/buttonTokens';
import { buttonTokensDark } from './tokens/buttonTokensDark';
import { chipTokens } from './tokens/chipTokens';
import { iconButtonTokens } from './tokens/iconButtonTokens';
import { paletteBase } from './tokens/paletteBase';
import { paletteDark } from './tokens/paletteDark';
import { radioTokens } from './tokens/radioTokens';
import { switchTokens } from './tokens/switchTokens';
import { searchTokens } from './tokens/searchTokens';
import { textFieldTokens } from './tokens/textFieldTokens';
import { textFieldTokensDark } from './tokens/textFieldTokensDark';
import { tones } from './tokens/tones';
import { typography } from './tokens/typography';
import { getComponentOverrides } from './componentOverrides';

/**
 * Create MUI theme with specified mode
 * @param mode - Theme mode: 'light' or 'dark'
 */
export function createAppTheme(mode: 'light' | 'dark'): Theme {
  const isDark = mode === 'dark';

  return createTheme({
    breakpoints,
    palette: {
      mode,
      // Use dark mode tokens when in dark mode
      buttonTokens: isDark ? buttonTokensDark : buttonTokens,
      iconButtonTokens,
      actionButtonTokens,
      switchTokens,
      radioTokens,
      searchTokens,
      chipTokens,
      textFieldTokens: isDark ? textFieldTokensDark : textFieldTokens,
      tones,
      // Use appropriate palette for mode
      ...(isDark ? paletteDark : paletteBase),
    },
    typography,
    // Apply component-specific style overrides
    components: getComponentOverrides(mode),
  });
}

// Default light theme for backward compatibility
export const theme = createAppTheme('light');
