import type { Meta, StoryObj } from '@storybook/nextjs';
import { ThemeSelector } from './ThemeSelector';
import { useState } from 'react';
import { Box } from '@mui/material';
import { ThemeMode } from '@/components/atoms/ThemeToggleButton';

/**
 * ThemeSelector - Atomic Design: Molecule
 *
 * 主題選擇器，結合標題與多個 ThemeToggleButton（Atom）元件。
 * 提供 Light、Dark 與 System 主題切換功能。
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
 * 預設樣式 - 包含所有主題切換功能（Light、Dark、System）
 */
export const Default: Story = {
  args: {
    currentTheme: 'system',
    onThemeChange: (theme) => alert(`Theme changed to: ${theme}`),
  },
};

/**
 * 自訂標題
 */
export const CustomTitle: Story = {
  args: {
    title: 'Appearance Settings',
    currentTheme: 'light',
    onThemeChange: (theme) => console.log(`Theme changed to: ${theme}`),
  },
};

/**
 * 不含標題
 */
export const WithoutTitle: Story = {
  args: {
    title: '',
    currentTheme: 'dark',
    onThemeChange: (theme) => console.log(`Theme changed to: ${theme}`),
  },
};

/**
 * 自訂主題選項標籤
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
 * 互動範例 - 主題切換
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
 * 含中文標籤的互動範例
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
 * 選單情境中的使用範例
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
