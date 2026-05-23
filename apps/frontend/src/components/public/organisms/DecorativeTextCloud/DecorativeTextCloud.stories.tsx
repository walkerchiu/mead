import type { Meta, StoryObj } from '@storybook/nextjs';

import { getLocalPhotos } from '@/lib/portal/plans';
import { idcPlan, sposadPlan, tisdcPlan } from '@/mocks/fixtures/plans';
import type { Plan } from '@/types/plan';

import { DecorativeTextCloud } from './DecorativeTextCloud';

const photoSrcs = (plan: Plan): string[] =>
  getLocalPhotos(plan)
    .map((p) => p.src)
    .filter((s): s is string => Boolean(s));

/**
 * 入口網 hero 文字雲：三圖形組合的橘色色塊 + 環繞裝飾性文字。
 * hover 任一圖形會在該圖形內顯示計畫照片。
 */
const meta = {
  title: 'Public Scope/Organisms/DecorativeTextCloud',
  component: DecorativeTextCloud,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta<typeof DecorativeTextCloud>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Sposad: Story = {
  args: {
    words: sposadPlan.decorativeText,
    photos: photoSrcs(sposadPlan),
  },
};

export const Tisdc: Story = {
  args: {
    words: tisdcPlan.decorativeText,
    photos: photoSrcs(tisdcPlan),
  },
};

export const Idc: Story = {
  args: {
    words: idcPlan.decorativeText,
    photos: photoSrcs(idcPlan),
  },
};
