import type { Meta, StoryObj } from '@storybook/nextjs';
import { SettingsMenuItem } from './SettingsMenuItem';
import {
  Help,
  Info,
  Feedback,
  BugReport,
  Description,
} from '@mui/icons-material';
import { Box } from '@mui/material';

/**
 * SettingsMenuItem - Atomic Design: Atom
 *
 * 單一設定選單項目，支援圖示、標籤、點擊事件與連結導覽。
 */
const meta = {
  title: 'Shared/Atoms/SettingsMenuItem',
  component: SettingsMenuItem,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <Box
        sx={{
          width: 280,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
        }}
      >
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof SettingsMenuItem>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 預設樣式
 */
export const Default: Story = {
  args: {
    icon: <Help />,
    label: 'Help',
    onClick: () => alert('Help clicked'),
  },
};

/**
 * 不同圖示範例
 */
export const WithInfoIcon: Story = {
  args: {
    icon: <Info />,
    label: 'About',
    onClick: () => alert('About clicked'),
  },
};

export const WithFeedbackIcon: Story = {
  args: {
    icon: <Feedback />,
    label: 'Send Feedback',
    onClick: () => alert('Feedback clicked'),
  },
};

export const WithBugReportIcon: Story = {
  args: {
    icon: <BugReport />,
    label: 'Report a Bug',
    onClick: () => alert('Bug report clicked'),
  },
};

export const WithDocumentIcon: Story = {
  args: {
    icon: <Description />,
    label: 'Documentation',
    onClick: () => alert('Documentation clicked'),
  },
};

/**
 * 不含圖示
 */
export const WithoutIcon: Story = {
  args: {
    label: 'Simple Menu Item',
    onClick: () => alert('Clicked'),
  },
};

/**
 * 使用 href 進行導覽
 */
export const WithHref: Story = {
  args: {
    icon: <Help />,
    label: 'Help Center',
    href: '/help',
  },
};

/**
 * 外部連結
 */
export const ExternalLink: Story = {
  args: {
    icon: <Info />,
    label: 'Visit Website',
    href: 'https://example.com',
  },
};

/**
 * 多個項目組合顯示
 */
export const MenuItemList: Story = {
  render: () => (
    <Box
      sx={{
        width: 280,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
      }}
    >
      <SettingsMenuItem
        icon={<Help />}
        label="Help Center"
        onClick={() => console.log('Help')}
      />
      <SettingsMenuItem
        icon={<Info />}
        label="About"
        onClick={() => console.log('About')}
      />
      <SettingsMenuItem
        icon={<Feedback />}
        label="Send Feedback"
        onClick={() => console.log('Feedback')}
      />
      <SettingsMenuItem
        icon={<BugReport />}
        label="Report a Bug"
        onClick={() => console.log('Bug Report')}
      />
      <SettingsMenuItem
        icon={<Description />}
        label="Documentation"
        href="/docs"
      />
    </Box>
  ),
};
