import type { Meta, StoryObj } from '@storybook/nextjs';

import { useState } from 'react';

import Box from '@mui/material/Box';

import { plansFixture } from '@/mocks/fixtures/plans';

import { PlanCarousel } from './PlanCarousel';

/**
 * 三大計畫輪播：中央計畫卡片、左右露出相鄰計畫照片、下方指示點，支援自動輪播。
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
    activeIndex: 0,
    onActiveIndexChange: () => {},
  },
  render: function CarouselWithState(args) {
    const [active, setActive] = useState(0);
    return (
      <PlanCarousel
        {...args}
        activeIndex={active}
        onActiveIndexChange={setActive}
      />
    );
  },
};

export const AutoRotateOff: Story = {
  args: {
    plans: plansFixture,
    activeIndex: 0,
    onActiveIndexChange: () => {},
    autoRotateMs: 0,
  },
  render: function CarouselStatic(args) {
    const [active, setActive] = useState(0);
    return (
      <PlanCarousel
        {...args}
        activeIndex={active}
        onActiveIndexChange={setActive}
      />
    );
  },
};
