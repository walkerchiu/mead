import type { Meta, StoryObj } from '@storybook/nextjs';
import { SettingsMenu } from './SettingsMenu';
import {
  Help,
  Info,
  Feedback,
  BugReport,
  Description,
} from '@mui/icons-material';
import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { ThemeMode } from '@/components/atoms/ThemeToggleButton';

/**
 * SettingsMenu - Atomic Design: Organism
 *
 * 完整的設定選單元件，結合：
 * - SettingsButton（Atom）- 觸發按鈕
 * - ThemeSelector（Molecule）- 主題選擇器
 * - SettingsMenuList（Molecule）- 選單項目列表
 *
 * 如同 Notification 系統一般，完全遵循 Atomic Design 架構。
 */
const meta = {
  title: 'Shared/Organisms/SettingsMenu',
  component: SettingsMenu,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    showLabel: {
      control: 'boolean',
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
    },
    color: {
      control: 'select',
      options: [
        'inherit',
        'primary',
        'secondary',
        'success',
        'error',
        'info',
        'warning',
      ],
    },
    showThemeToggle: {
      control: 'boolean',
    },
    currentTheme: {
      control: 'select',
      options: ['light', 'dark', 'system'],
    },
  },
} satisfies Meta<typeof SettingsMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultMenuItems = [
  {
    id: 'help',
    label: 'Help',
    icon: <Help />,
    onClick: () => alert('Help clicked'),
  },
  {
    id: 'about',
    label: 'About',
    icon: <Info />,
    onClick: () => alert('About clicked'),
  },
];

/**
 * 預設樣式 - 不含主題切換
 */
export const Default: Story = {
  args: {
    menuItems: defaultMenuItems,
  },
};

/**
 * 最簡設定
 */
export const Minimal: Story = {
  args: {
    menuItems: [
      {
        id: 'help',
        label: 'Help',
        icon: <Help />,
        onClick: () => alert('Help clicked'),
      },
    ],
  },
};

/**
 * 顯示按鈕標籤
 */
export const WithLabel: Story = {
  args: {
    menuItems: defaultMenuItems,
    showLabel: true,
  },
};

/**
 * 含主題切換功能
 */
export const WithThemeToggle: Story = {
  args: {
    menuItems: defaultMenuItems,
    showThemeToggle: true,
    currentTheme: 'system',
    onThemeChange: (theme) => alert(`Theme changed to: ${theme}`),
  },
};

/**
 * 含標籤與主題切換
 */
export const WithLabelAndTheme: Story = {
  args: {
    menuItems: defaultMenuItems,
    showLabel: true,
    showThemeToggle: true,
    currentTheme: 'light',
    onThemeChange: (theme) => console.log(`Theme: ${theme}`),
  },
};

/**
 * 不同尺寸 - small、medium、large
 */
export const Sizes: Story = {
  render: () => (
    <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
      <Box>
        <Typography variant="caption" display="block" gutterBottom>
          Small
        </Typography>
        <SettingsMenu menuItems={defaultMenuItems} size="small" />
      </Box>
      <Box>
        <Typography variant="caption" display="block" gutterBottom>
          Medium
        </Typography>
        <SettingsMenu menuItems={defaultMenuItems} size="medium" />
      </Box>
      <Box>
        <Typography variant="caption" display="block" gutterBottom>
          Large
        </Typography>
        <SettingsMenu menuItems={defaultMenuItems} size="large" />
      </Box>
    </Box>
  ),
};

/**
 * 不同顏色 - primary、secondary
 */
export const Colors: Story = {
  render: () => (
    <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
      <Box>
        <Typography variant="caption" display="block" gutterBottom>
          Primary
        </Typography>
        <SettingsMenu menuItems={defaultMenuItems} color="primary" />
      </Box>
      <Box>
        <Typography variant="caption" display="block" gutterBottom>
          Secondary
        </Typography>
        <SettingsMenu menuItems={defaultMenuItems} color="secondary" />
      </Box>
    </Box>
  ),
};

/**
 * 主題變體 - light、dark、system
 */
export const ThemeVariants: Story = {
  render: () => (
    <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
      <Box>
        <Typography variant="caption" display="block" gutterBottom>
          Light Theme
        </Typography>
        <SettingsMenu
          menuItems={defaultMenuItems}
          showThemeToggle
          currentTheme="light"
          onThemeChange={(theme) => console.log(`Theme: ${theme}`)}
        />
      </Box>
      <Box>
        <Typography variant="caption" display="block" gutterBottom>
          Dark Theme
        </Typography>
        <SettingsMenu
          menuItems={defaultMenuItems}
          showThemeToggle
          currentTheme="dark"
          onThemeChange={(theme) => console.log(`Theme: ${theme}`)}
        />
      </Box>
      <Box>
        <Typography variant="caption" display="block" gutterBottom>
          System Theme
        </Typography>
        <SettingsMenu
          menuItems={defaultMenuItems}
          showThemeToggle
          currentTheme="system"
          onThemeChange={(theme) => console.log(`Theme: ${theme}`)}
        />
      </Box>
    </Box>
  ),
};

/**
 * 僅主題切換 - 無其他選單項目
 */
export const OnlyThemeToggle: Story = {
  args: {
    menuItems: [],
    showThemeToggle: true,
    currentTheme: 'dark',
    onThemeChange: (theme) => alert(`Theme changed to: ${theme}`),
  },
};

/**
 * 延伸的選單項目
 */
export const ExtendedMenuItems: Story = {
  args: {
    menuItems: [
      {
        id: 'help',
        label: 'Help Center',
        icon: <Help />,
        onClick: () => console.log('Help'),
      },
      {
        id: 'docs',
        label: 'Documentation',
        icon: <Description />,
        onClick: () => console.log('Docs'),
      },
      {
        id: 'feedback',
        label: 'Send Feedback',
        icon: <Feedback />,
        onClick: () => console.log('Feedback'),
      },
      {
        id: 'bug',
        label: 'Report a Bug',
        icon: <BugReport />,
        onClick: () => console.log('Bug Report'),
      },
      {
        id: 'about',
        label: 'About',
        icon: <Info />,
        onClick: () => console.log('About'),
      },
    ],
    showThemeToggle: true,
    currentTheme: 'system',
    onThemeChange: (theme) => console.log(`Theme: ${theme}`),
  },
};

/**
 * 使用 href 進行導覽
 */
export const WithHrefNavigation: Story = {
  args: {
    menuItems: [
      {
        id: 'help',
        label: 'Help Center',
        icon: <Help />,
        href: '/help',
      },
      {
        id: 'docs',
        label: 'Documentation',
        icon: <Description />,
        href: '/docs',
      },
      {
        id: 'about',
        label: 'About',
        icon: <Info />,
        href: '/about',
      },
    ],
    showThemeToggle: true,
    currentTheme: 'system',
    onThemeChange: (theme) => console.log(`Theme: ${theme}`),
  },
};

/**
 * 中文標籤範例
 */
export const ChineseLabels: Story = {
  render: () => {
    const [theme, setTheme] = useState<ThemeMode>('system');

    return (
      <SettingsMenu
        menuItems={[
          {
            id: 'help',
            label: '幫助中心',
            icon: <Help />,
            onClick: () => alert('幫助'),
          },
          {
            id: 'docs',
            label: '使用文檔',
            icon: <Description />,
            onClick: () => alert('文檔'),
          },
          {
            id: 'feedback',
            label: '意見回饋',
            icon: <Feedback />,
            onClick: () => alert('回饋'),
          },
          {
            id: 'about',
            label: '關於',
            icon: <Info />,
            onClick: () => alert('關於'),
          },
        ]}
        showThemeToggle
        currentTheme={theme}
        onThemeChange={setTheme}
      />
    );
  },
};

/**
 * 互動範例 - 主題切換
 */
export const Interactive: Story = {
  render: () => {
    const [theme, setTheme] = useState<ThemeMode>('system');

    return (
      <SettingsMenu
        menuItems={[
          {
            id: 'help',
            label: 'Help',
            icon: <Help />,
            onClick: () => alert('Help clicked'),
          },
          {
            id: 'about',
            label: 'About',
            icon: <Info />,
            onClick: () => alert('About clicked'),
          },
        ]}
        showThemeToggle
        currentTheme={theme}
        onThemeChange={setTheme}
      />
    );
  },
};

/**
 * 完整設定 - 啟用所有功能
 */
export const FullConfiguration: Story = {
  render: () => {
    const [theme, setTheme] = useState<ThemeMode>('system');

    return (
      <SettingsMenu
        menuItems={[
          {
            id: 'help',
            label: 'Help Center',
            icon: <Help />,
            onClick: () => console.log('Help'),
          },
          {
            id: 'docs',
            label: 'Documentation',
            icon: <Description />,
            href: '/docs',
          },
          {
            id: 'feedback',
            label: 'Send Feedback',
            icon: <Feedback />,
            onClick: () => console.log('Feedback'),
          },
          {
            id: 'bug',
            label: 'Report a Bug',
            icon: <BugReport />,
            onClick: () => console.log('Bug Report'),
          },
          {
            id: 'about',
            label: 'About',
            icon: <Info />,
            href: '/about',
          },
        ]}
        showLabel
        showThemeToggle
        currentTheme={theme}
        onThemeChange={setTheme}
        size="medium"
        color="inherit"
      />
    );
  },
};
