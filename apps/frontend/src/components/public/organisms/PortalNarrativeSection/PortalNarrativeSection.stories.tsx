import type { Meta, StoryObj } from '@storybook/nextjs';

import { idcPlan } from '@/mocks/fixtures/plans';

import { PortalNarrativeSection } from './PortalNarrativeSection';

/**
 * 計畫敘事區塊：前導段落 → 重點標語 → 收尾段落。
 */
const meta = {
  title: 'Public Scope/Organisms/PortalNarrativeSection',
  component: PortalNarrativeSection,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta<typeof PortalNarrativeSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    leadParagraph: idcPlan.intro,
    statement:
      '加強跨領域文化創意產業人才培育，帶動文創產業整體的發展與水準的提升。',
  },
};
