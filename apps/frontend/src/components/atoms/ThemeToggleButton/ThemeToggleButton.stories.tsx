import type { Meta, StoryObj } from '@storybook/nextjs';
import { ThemeToggleButton } from './ThemeToggleButton';
import { useState } from 'react';
import { Box, Typography } from '@mui/material';

/**
 * ThemeToggleButton - Atomic Design: Atom
 *
 * Single theme toggle button for selecting Light, Dark, or System theme.
 */
const meta = {
  title: 'Shared/Atoms/ThemeToggleButton',
  component: ThemeToggleButton,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: 'select',
      options: ['light', 'dark', 'system'],
    },
    selected: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof ThemeToggleButton>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Light theme button (unselected)
 */
export const Light: Story = {
  args: {
    value: 'light',
    label: 'Light',
    selected: false,
    onClick: () => alert('Light theme selected'),
  },
};

/**
 * Dark theme button (unselected)
 */
export const Dark: Story = {
  args: {
    value: 'dark',
    label: 'Dark',
    selected: false,
    onClick: () => alert('Dark theme selected'),
  },
};

/**
 * System theme button (unselected)
 */
export const System: Story = {
  args: {
    value: 'system',
    label: 'System',
    selected: false,
    onClick: () => alert('System theme selected'),
  },
};

/**
 * Light theme button (selected)
 */
export const LightSelected: Story = {
  args: {
    value: 'light',
    label: 'Light',
    selected: true,
    onClick: () => alert('Light theme selected'),
  },
};

/**
 * Dark theme button (selected)
 */
export const DarkSelected: Story = {
  args: {
    value: 'dark',
    label: 'Dark',
    selected: true,
    onClick: () => alert('Dark theme selected'),
  },
};

/**
 * System theme button (selected)
 */
export const SystemSelected: Story = {
  args: {
    value: 'system',
    label: 'System',
    selected: true,
    onClick: () => alert('System theme selected'),
  },
};

/**
 * Interactive example - Complete theme toggle group
 */
export const InteractiveGroup: Story = {
  render: () => {
    const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');

    return (
      <Box>
        <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
          Current theme: <strong>{theme}</strong>
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <ThemeToggleButton
            value="light"
            label="Light"
            selected={theme === 'light'}
            onClick={() => setTheme('light')}
          />
          <ThemeToggleButton
            value="dark"
            label="Dark"
            selected={theme === 'dark'}
            onClick={() => setTheme('dark')}
          />
          <ThemeToggleButton
            value="system"
            label="System"
            selected={theme === 'system'}
            onClick={() => setTheme('system')}
          />
        </Box>
      </Box>
    );
  },
};

/**
 * All three buttons displayed side by side (unselected state)
 */
export const AllUnselected: Story = {
  render: () => (
    <Box sx={{ display: 'flex', gap: 1 }}>
      <ThemeToggleButton
        value="light"
        label="Light"
        selected={false}
        onClick={() => console.log('Light')}
      />
      <ThemeToggleButton
        value="dark"
        label="Dark"
        selected={false}
        onClick={() => console.log('Dark')}
      />
      <ThemeToggleButton
        value="system"
        label="System"
        selected={false}
        onClick={() => console.log('System')}
      />
    </Box>
  ),
};

/**
 * Light theme selected state
 */
export const LightThemeSelected: Story = {
  render: () => (
    <Box sx={{ display: 'flex', gap: 1 }}>
      <ThemeToggleButton
        value="light"
        label="Light"
        selected={true}
        onClick={() => console.log('Light')}
      />
      <ThemeToggleButton
        value="dark"
        label="Dark"
        selected={false}
        onClick={() => console.log('Dark')}
      />
      <ThemeToggleButton
        value="system"
        label="System"
        selected={false}
        onClick={() => console.log('System')}
      />
    </Box>
  ),
};

/**
 * Dark theme selected state
 */
export const DarkThemeSelected: Story = {
  render: () => (
    <Box sx={{ display: 'flex', gap: 1 }}>
      <ThemeToggleButton
        value="light"
        label="Light"
        selected={false}
        onClick={() => console.log('Light')}
      />
      <ThemeToggleButton
        value="dark"
        label="Dark"
        selected={true}
        onClick={() => console.log('Dark')}
      />
      <ThemeToggleButton
        value="system"
        label="System"
        selected={false}
        onClick={() => console.log('System')}
      />
    </Box>
  ),
};

/**
 * System theme selected state
 */
export const SystemThemeSelected: Story = {
  render: () => (
    <Box sx={{ display: 'flex', gap: 1 }}>
      <ThemeToggleButton
        value="light"
        label="Light"
        selected={false}
        onClick={() => console.log('Light')}
      />
      <ThemeToggleButton
        value="dark"
        label="Dark"
        selected={false}
        onClick={() => console.log('Dark')}
      />
      <ThemeToggleButton
        value="system"
        label="System"
        selected={true}
        onClick={() => console.log('System')}
      />
    </Box>
  ),
};
