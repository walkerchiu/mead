import type { Meta, StoryObj } from '@storybook/nextjs';

import Stack from '@mui/material/Stack';

import { SocialIconButton } from './SocialIconButton';

/**
 * 入口網社群圓形圖示按鈕，深色底、白色圖示，hover 轉為品牌橘。
 */
const meta = {
  title: 'Public Scope/Atoms/SocialIconButton',
  component: SocialIconButton,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof SocialIconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Facebook: Story = {
  args: { platform: 'facebook', url: 'https://facebook.com' },
};

export const AllPlatforms: Story = {
  args: { platform: 'facebook', url: '#' },
  render: () => (
    <Stack direction="row" spacing={1.5}>
      <SocialIconButton platform="facebook" url="#" />
      <SocialIconButton platform="instagram" url="#" />
      <SocialIconButton platform="youtube" url="#" />
      <SocialIconButton platform="website" url="#" />
      <SocialIconButton platform="linktree" url="#" />
    </Stack>
  ),
};
