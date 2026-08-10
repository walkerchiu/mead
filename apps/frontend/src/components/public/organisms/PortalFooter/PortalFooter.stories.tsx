import type { Meta, StoryObj } from '@storybook/nextjs';

import { PortalFooter } from './PortalFooter';

/**
 * 入口網頁尾：網站識別 + 三欄連結 + 版權聲明。
 */
const meta = {
  title: 'Public Scope/Organisms/PortalFooter',
  component: PortalFooter,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta<typeof PortalFooter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
