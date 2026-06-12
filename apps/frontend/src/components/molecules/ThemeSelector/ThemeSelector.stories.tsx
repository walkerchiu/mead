import type { Meta, StoryObj } from '@storybook/nextjs';
import { ThemeSelector } from './ThemeSelector';
import { useState } from 'react';
import { Box } from '@mui/material';
import { ThemeMode } from '@/components/atoms/ThemeToggleButton';

/**
 * ThemeSelector - Atomic Design: Molecule
 *
 * Theme selector that combines a title and multiple ThemeToggleButton (Atom) components.
 * Provides Light, Dark, and System theme switching functionality.
 */
const meta = {
  title: 'Shared/Molecules/ThemeSelector',
  component: ThemeSelector,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    currentTheme: {
      control: 'select',
      options: ['light', 'dark', 'system'],
    },
  },
  decorators: [
    (Story) => (
      <Box
        sx={{
          width: 280,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          p: 2,
        }}
      >
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof ThemeSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default style - Includes all theme switching functionality (Light, Dark, System)
 */
export const Default: Story = {
  args: {
    currentTheme: 'system',
    onThemeChange: (theme) => alert(`Theme changed to: ${theme}`),
  },
};

/**
 * Custom title
 */
export const CustomTitle: Story = {
  args: {
    title: 'Appearance Settings',
    currentTheme: 'light',
    onThemeChange: (theme) => console.log(`Theme changed to: ${theme}`),
  },
};

/**
 * Without title
 */
export const WithoutTitle: Story = {
  args: {
    title: '',
    currentTheme: 'dark',
    onThemeChange: (theme) => console.log(`Theme changed to: ${theme}`),
  },
};

/**
 * Custom theme option labels
 */
export const CustomLabels: Story = {
  args: {
    currentTheme: 'system',
    themes: [
      { value: 'light', label: 'Bright' },
      { value: 'dark', label: 'Dark' },
      { value: 'system', label: 'Follow System' },
    ],
    onThemeChange: (theme) => console.log(`Theme changed to: ${theme}`),
  },
};

/**
 * Interactive example - Theme switching
 */
export const Interactive: Story = {
  render: () => {
    const [theme, setTheme] = useState<ThemeMode>('system');

    return (
      <Box
        sx={{
          width: 280,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          p: 2,
        }}
      >
        <ThemeSelector
          title="Appearance"
          currentTheme={theme}
          onThemeChange={setTheme}
          themes={[
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
            { value: 'system', label: 'System' },
          ]}
        />
        <Box sx={{ mt: 2, p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
          <Box component="pre" sx={{ m: 0, fontSize: '0.75rem' }}>
            Current theme: {theme}
          </Box>
        </Box>
      </Box>
    );
  },
};

/**
 * Interactive example with Chinese labels
 */
export const InteractiveZhTW: Story = {
  render: () => {
    const [theme, setTheme] = useState<ThemeMode>('system');

    return (
      <Box
        sx={{
          width: 280,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          p: 2,
        }}
      >
        <ThemeSelector
          title="Appearance"
          currentTheme={theme}
          onThemeChange={setTheme}
          themes={[
            { value: 'light', label: 'Bright' },
            { value: 'dark', label: 'Dark' },
            { value: 'system', label: 'Follow System' },
          ]}
        />
        <Box sx={{ mt: 2, p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
          <Box component="pre" sx={{ m: 0, fontSize: '0.75rem' }}>
            Current theme:{' '}
            {theme === 'light'
              ? 'Bright'
              : theme === 'dark'
                ? 'Dark'
                : 'Follow System'}
          </Box>
        </Box>
      </Box>
    );
  },
};

/**
 * Usage example in menu context
 */
export const InMenuContext: Story = {
  render: () => {
    const [theme, setTheme] = useState<ThemeMode>('system');

    return (
      <Box sx={{ width: 280 }}>
        <Box
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            overflow: 'hidden',
          }}
        >
          {/* Simulated menu items */}
          <Box
            sx={{
              px: 2,
              py: 1.5,
              borderBottom: 1,
              borderColor: 'divider',
              bgcolor: 'background.paper',
            }}
          >
            <ThemeSelector
              title="Appearance"
              currentTheme={theme}
              onThemeChange={setTheme}
              themes={[
                { value: 'light', label: 'Light' },
                { value: 'dark', label: 'Dark' },
                { value: 'system', label: 'System' },
              ]}
            />
          </Box>

          {/* Other menu items */}
          <Box sx={{ py: 1 }}>
            <Box
              sx={{
                px: 2,
                py: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                cursor: 'pointer',
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <Box>Help</Box>
            </Box>
            <Box
              sx={{
                px: 2,
                py: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                cursor: 'pointer',
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <Box>About</Box>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  },
};
