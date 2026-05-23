import type { Meta, StoryObj } from '@storybook/nextjs';

import { plansFixture } from '@/mocks/fixtures/plans';

import { PortalLandingPage } from './PortalLandingPage';

/**
 * 教育部藝術設計三大計畫入口網首頁 — 完整頁面組裝。
 *
 * hero 文字雲 → 主標題 → 三大計畫輪播 → 頁尾，切換計畫時文字雲同步更新。
 */
const meta = {
  title: 'Public Scope/Pages/PortalLandingPage',
  component: PortalLandingPage,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof PortalLandingPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    plans: plansFixture,
  },
};
