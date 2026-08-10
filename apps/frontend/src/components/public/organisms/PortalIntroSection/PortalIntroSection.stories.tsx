import type { Meta, StoryObj } from '@storybook/nextjs';

import { PortalIntroSection } from './PortalIntroSection';

/**
 * 入口網主標題區塊：小標 + 大標題。
 */
const meta = {
  title: 'Public Scope/Organisms/PortalIntroSection',
  component: PortalIntroSection,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta<typeof PortalIntroSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
