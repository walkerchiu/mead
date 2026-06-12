import type { Meta, StoryObj } from '@storybook/nextjs';
import { ThemeToggleButton } from './ThemeToggleButton';
import { useState } from 'react';
import { Box, Typography } from '@mui/material';

/**
 * ThemeToggleButton - Atomic Design: Atom
 *
 * 單一主題切換按鈕，用於選擇 Light、Dark 或 System 主題。
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
 * 淺色主題按鈕（未選取）
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
 * 深色主題按鈕（未選取）
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
 * 系統主題按鈕（未選取）
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
 * 淺色主題按鈕（已選取）
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
 * 深色主題按鈕（已選取）
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
 * 系統主題按鈕（已選取）
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
 * 互動範例 - 完整的主題切換群組
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
 * 三個按鈕並列顯示（未選取狀態）
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
 * 淺色主題已選取狀態
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
 * 深色主題已選取狀態
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
 * 系統主題已選取狀態
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
