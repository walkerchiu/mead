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

/** 識別牌：純標誌圖（∞）＋另排名稱文字（中文逐行＋英文），依設計稿 node 1:2。 */
export const Nameplate: Story = {
  args: {
    name: sposadPlan.name,
    nameplate: {
      mark: '/images/plans/01_sposad/logo/mark.png',
      nameZh: ['教育部', '藝術與設計菁英', '海外培訓計畫'],
      nameEn: 'MOE Scholarship Program for Overseas Study in Arts and Design',
    },
  },
};
