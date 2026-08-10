import type { Meta, StoryObj } from '@storybook/nextjs';

import { idcPlan, sposadPlan } from '@/mocks/fixtures/plans';

import { SocialLinkBar } from './SocialLinkBar';

/**
 * 社群圖示列 + 「了解更多」按鈕，社群連結取自 plans.json 的 `socialLinks`。
 */
const meta = {
  title: 'Public Scope/Molecules/SocialLinkBar',
  component: SocialLinkBar,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta<typeof SocialLinkBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Sposad: Story = {
  args: { socialLinks: sposadPlan.socialLinks },
};

export const Idc: Story = {
  args: { socialLinks: idcPlan.socialLinks },
};

export const WithoutLearnMore: Story = {
  args: { socialLinks: sposadPlan.socialLinks, showLearnMore: false },
};
