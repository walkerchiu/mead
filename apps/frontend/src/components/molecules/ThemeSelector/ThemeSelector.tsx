import { forwardRef } from 'react';
import { Box, Typography, ToggleButtonGroup } from '@mui/material';
import { Palette as PaletteIcon } from '@mui/icons-material';
import { SxProps, Theme } from '@mui/material/styles';
import {
  ThemeToggleButton,
  ThemeMode,
} from '@/components/atoms/ThemeToggleButton';

/**
 * ThemeSelector Component - Atomic Design: Molecule
 *
 * Theme selector that includes a title and theme toggle button group.
 *
 * @example
 * ```tsx
 * <ThemeSelector
 *   currentTheme="light"
 *   onThemeChange={(theme) => console.log('changed to:', theme)}
 *   title="Theme"
 *   themes={[
 *     { value: 'light', label: 'Light' },
 *     { value: 'dark', label: 'Dark' },
 *     { value: 'system', label: 'System' },
 *   ]}
 * />
 * ```
 */

export interface ThemeSelectorTheme {
  value: ThemeMode;
  label: string;
}

export interface ThemeSelectorProps {
  /**
   * Current theme
   */
  currentTheme: ThemeMode;

  /**
   * Theme change callback
   */
  onThemeChange: (theme: ThemeMode) => void;

  /**
   * Title text
   * @default 'Appearance'
   */
  title?: string;

  /**
   * Available theme list
   * @default [{ value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }, { value: 'system', label: 'System' }]
   */
  themes?: ThemeSelectorTheme[];

  /**
   * Custom styles
   */
  sx?: SxProps<Theme>;
}

export const ThemeSelector = forwardRef<HTMLDivElement, ThemeSelectorProps>(
  (
    {
      currentTheme,
      onThemeChange,
      title = 'Appearance',
      themes = [
        { value: 'light' as ThemeMode, label: 'Light' },
        { value: 'dark' as ThemeMode, label: 'Dark' },
        { value: 'system' as ThemeMode, label: 'System' },
      ],
      sx,
    },
    ref,
  ) => {
    const handleThemeChange = (
      _event: React.MouseEvent<HTMLElement>,
      newTheme: ThemeMode | null,
    ) => {
      if (newTheme !== null) {
        onThemeChange(newTheme);
      }
    };

    return (
      <Box ref={ref} sx={sx}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <PaletteIcon sx={{ mr: 1, fontSize: 'small' }} />
          <Typography variant="body2">{title}</Typography>
        </Box>
        <ToggleButtonGroup
          value={currentTheme}
          exclusive
          onChange={handleThemeChange}
          size="small"
          fullWidth
          aria-label="theme selection"
        >
          {themes.map((theme) => (
            <ThemeToggleButton
              key={theme.value}
              value={theme.value}
              label={theme.label}
            />
          ))}
        </ToggleButtonGroup>
      </Box>
    );
  },
);

ThemeSelector.displayName = 'ThemeSelector';

export default ThemeSelector;
