import type { Meta, StoryObj } from '@storybook/nextjs';

import { useState } from 'react';

import Box from '@mui/material/Box';

import { plansFixture } from '@/mocks/fixtures/plans';

import { PlanCarousel } from './PlanCarousel';

/**
 * 三大計畫展開／收合互動區：預設展開第一個計畫的大卡，兩側為可點的收合計畫卡，
 * 點擊收合卡以放大淡入轉場展開該計畫；hover 卡片回報索引供主標切換 slogan。
 */
const meta = {
  title: 'Public Scope/Organisms/PlanCarousel',
  component: PlanCarousel,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <Box sx={{ bgcolor: '#EAEAEA', py: 6 }}>
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof PlanCarousel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    plans: plansFixture,
    expandedIndex: null,
    onExpandedIndexChange: () => {},
  },
  render: function CarouselWithState(args) {
    const [expanded, setExpanded] = useState<number | null>(null);
    return (
      <PlanCarousel
        {...args}
        expandedIndex={expanded}
        onExpandedIndexChange={setExpanded}
      />
    );
  },
};
