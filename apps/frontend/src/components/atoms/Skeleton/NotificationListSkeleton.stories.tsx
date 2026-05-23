import type { Meta, StoryObj } from '@storybook/nextjs';
import { NotificationListSkeleton } from './NotificationListSkeleton';
import { Box } from '@mui/material';

const meta = {
  title: 'HQ Scope/Atoms/Skeleton/NotificationListSkeleton',
  component: NotificationListSkeleton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '通知列表載入骨架屏，提供通知列表載入時的佔位符，提升用戶體驗。',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <Box sx={{ width: 800, maxWidth: '100%' }}>
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof NotificationListSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 預設狀態 - 顯示 5 個通知項目骨架，帶容器和操作按鈕
 */
export const Default: Story = {
  args: {
    count: 5,
    showContainer: true,
    showActions: true,
  },
};

/**
 * 少量項目 - 顯示 3 個通知項目
 */
export const FewItems: Story = {
  args: {
    count: 3,
    showContainer: true,
    showActions: true,
  },
};

/**
 * 多項目 - 顯示 8 個通知項目
 */
export const ManyItems: Story = {
  args: {
    count: 8,
    showContainer: true,
    showActions: true,
  },
};

/**
 * 無容器 - 不顯示 Paper 容器
 */
export const NoContainer: Story = {
  args: {
    count: 5,
    showContainer: false,
    showActions: true,
  },
};

/**
 * 無操作按鈕 - 不顯示頂部操作按鈕區
 */
export const NoActions: Story = {
  args: {
    count: 5,
    showContainer: true,
    showActions: false,
  },
};

/**
 * 簡潔模式 - 無容器且無操作按鈕
 */
export const Minimal: Story = {
  args: {
    count: 5,
    showContainer: false,
    showActions: false,
  },
};

/**
 * 初始載入 - 模擬頁面初次載入狀態
 */
export const InitialLoading: Story = {
  args: {
    count: 10,
    showContainer: true,
    showActions: true,
  },
  parameters: {
    docs: {
      description: {
        story: '模擬通知中心頁面初次載入時的狀態',
      },
    },
  },
};
