import type { Meta, StoryObj } from '@storybook/nextjs';

import Box from '@mui/material/Box';

import { sposadPlan, tisdcPlan } from '@/mocks/fixtures/plans';

import { PlanStatsBar } from './PlanStatsBar';

/**
 * 計畫數據成果橫列，資料取自 plans.json 的 `stats`。
 */
const meta = {
  title: 'Public Scope/Molecules/PlanStatsBar',
  component: PlanStatsBar,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <Box sx={{ maxWidth: 880, mx: 'auto' }}>
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof PlanStatsBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Sposad: Story = {
  args: { stats: sposadPlan.stats },
};

export const Tisdc: Story = {
  args: { stats: tisdcPlan.stats },
};
