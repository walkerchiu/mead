import type { Meta, StoryObj } from '@storybook/nextjs';

import { useState } from 'react';

import { CarouselDots } from './CarouselDots';

/**
 * 入口網輪播指示點：三種形狀（微鋸齒星形／近圓多邊形／六邊形），
 * 作用中為品牌橘、其餘淺灰。
 */
const meta = {
  title: 'Public Scope/Atoms/CarouselDots',
  component: CarouselDots,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof CarouselDots>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { count: 3, activeIndex: 0 },
};

export const Interactive: Story = {
  args: { count: 3, activeIndex: 0 },
  render: function InteractiveDots(args) {
    const [active, setActive] = useState(0);
    return <CarouselDots {...args} activeIndex={active} onSelect={setActive} />;
  },
};
