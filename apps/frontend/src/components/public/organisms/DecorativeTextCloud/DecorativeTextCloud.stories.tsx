import type { Meta, StoryObj } from '@storybook/nextjs';

import { getLocalPhotos } from '@/lib/portal/plans';
import { idcPlan, sposadPlan, tisdcPlan } from '@/mocks/fixtures/plans';
import type { Plan } from '@/types/plan';

import { DecorativeTextCloud, type ShapeContent } from './DecorativeTextCloud';

const contentOf = (plan: Plan): ShapeContent => ({
  words: plan.decorativeText,
  photos: getLocalPhotos(plan)
    .map((p) => p.src)
    .filter((s): s is string => Boolean(s)),
});

/**
 * 入口網 hero 文字雲：三圖形組合的橘色色塊 + 環繞裝飾性文字。
 * 整片雲一次顯示「目前作用中計畫」的裝飾文字（預設菁培）；hover 某色塊
 * （左/中/右 = 菁培 / 設計戰國策 / 創意設計大賽）即切換成該計畫的文字並於塊內顯示其照片。
 */
const meta = {
  title: 'Public Scope/Organisms/DecorativeTextCloud',
  component: DecorativeTextCloud,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta<typeof DecorativeTextCloud>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 三計畫並陳（依 PLAN_ORDER sposad → idc → tisdc 對應左/中/右）。 */
export const Default: Story = {
  args: {
    shapeContents: [
      contentOf(sposadPlan),
      contentOf(idcPlan),
      contentOf(tisdcPlan),
    ],
  },
};
