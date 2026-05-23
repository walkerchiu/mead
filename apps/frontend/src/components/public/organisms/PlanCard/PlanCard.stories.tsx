import type { Meta, StoryObj } from '@storybook/nextjs';

import Box from '@mui/material/Box';

import { idcPlan, sposadPlan, tisdcPlan } from '@/mocks/fixtures/plans';

import { PlanCard } from './PlanCard';

/**
 * 三大計畫介紹卡片 — 入口網輪播的核心元件。
 *
 * 整合計畫識別、簡介、執行單位、時程軸、數據成果、代表圖與社群連結。
 */
const meta = {
  title: 'Public Scope/Organisms/PlanCard',
  component: PlanCard,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <Box sx={{ maxWidth: 760, mx: 'auto' }}>
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof PlanCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Sposad: Story = {
  args: { plan: sposadPlan },
};

export const Tisdc: Story = {
  args: { plan: tisdcPlan },
};

export const Idc: Story = {
  args: { plan: idcPlan },
};
