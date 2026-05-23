import type { Meta, StoryObj } from '@storybook/nextjs';

import { idcPlan, sposadPlan, tisdcPlan } from '@/mocks/fixtures/plans';

import { PlanDetailPage } from './PlanDetailPage';

/**
 * 單一計畫詳細頁。設計稿未涵蓋此頁，依入口網視覺語言設計。
 */
const meta = {
  title: 'Public Scope/Pages/PlanDetailPage',
  component: PlanDetailPage,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof PlanDetailPage>;

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
