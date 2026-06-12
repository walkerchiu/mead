import type { Meta, StoryObj } from '@storybook/nextjs';

import Box from '@mui/material/Box';

import { PlanTimeline } from './PlanTimeline';

/**
 * 計畫時程軸：年份選擇器 + 月份條，作用月份以品牌橘標示。
 */
const meta = {
  title: 'Public Scope/Molecules/PlanTimeline',
  component: PlanTimeline,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <Box sx={{ maxWidth: 640, mx: 'auto' }}>
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof PlanTimeline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const ActiveMonth: Story = {
  args: {
    year: 2026,
    activeMonth: 6,
    calloutText: '115年度 甄選報名期間',
  },
};

/** 窄版（手機卡片）：月份固定寬、整排超出容器寬，可橫向滑動閱讀。 */
export const Scroll: Story = {
  args: { variant: 'scroll' },
  decorators: [
    (Story) => (
      <Box sx={{ maxWidth: 320, mx: 'auto' }}>
        <Story />
      </Box>
    ),
  ],
};
