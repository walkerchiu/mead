import type { Meta, StoryObj } from '@storybook/nextjs';

import Box from '@mui/material/Box';

import { PlanPeekNavButton } from './PlanPeekNavButton';

/**
 * 計畫輪播左右探頭導覽鈕：貼著第二屏左右緣、自兩側 peek 細條上半部探出的白色膠囊鈕，
 * 點擊切換到上一個 / 下一個計畫。下方 decorator 以相對定位容器模擬第二屏邊緣。
 */
const meta = {
  title: 'Public Scope/Molecules/PlanPeekNavButton',
  component: PlanPeekNavButton,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  argTypes: {
    direction: { control: 'inline-radio', options: ['prev', 'next'] },
  },
  decorators: [
    (Story) => (
      <Box
        sx={{
          position: 'relative',
          height: 360,
          overflow: 'hidden',
          bgcolor: '#f1efe9',
        }}
      >
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof PlanPeekNavButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Prev: Story = {
  args: {
    direction: 'prev',
    planName: '教育部 藝術與設計菁英海外培訓計畫',
    markSrc: '/images/plans/01_sposad/logo/mark.png',
  },
};

export const Next: Story = {
  args: {
    direction: 'next',
    planName: '臺灣國際學生創意設計大賽',
    markSrc: '/images/plans/02_tisdc/logo/mark.png',
  },
};
