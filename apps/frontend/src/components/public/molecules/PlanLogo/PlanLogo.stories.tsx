import type { Meta, StoryObj } from '@storybook/nextjs';

import { idcPlan, sposadPlan, tisdcPlan } from '@/mocks/fixtures/plans';

import { PlanLogo } from './PlanLogo';

/**
 * 計畫識別：徽記 + 中英文名稱。尚無 logo 圖檔時以替代徽記呈現。
 */
const meta = {
  title: 'Public Scope/Molecules/PlanLogo',
  component: PlanLogo,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta<typeof PlanLogo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Sposad: Story = {
  args: { name: sposadPlan.name, planId: sposadPlan.id },
};

export const Tisdc: Story = {
  args: { name: tisdcPlan.name, planId: tisdcPlan.id },
};

export const Idc: Story = {
  args: { name: idcPlan.name, planId: idcPlan.id },
};
