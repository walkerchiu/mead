import type { Meta, StoryObj } from '@storybook/nextjs';
import { ScrollButton } from './ScrollButton';

const meta = {
  title: 'Shared/Atoms/ScrollButton',
  component: ScrollButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    direction: {
      control: 'select',
      options: ['up', 'down', 'toTop', 'toBottom'],
      description: '按鈕方向',
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: '按鈕尺寸',
    },
    disabled: {
      control: 'boolean',
      description: '按鈕是否停用',
    },
    visible: {
      control: 'boolean',
      description: '按鈕是否顯示',
    },
    tooltip: {
      control: 'text',
      description: '工具提示文字',
    },
  },
} satisfies Meta<typeof ScrollButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ScrollUp: Story = {
  args: {
    direction: 'up',
    tooltip: 'Scroll up',
    size: 'medium',
  },
};

export const ScrollDown: Story = {
  args: {
    direction: 'down',
    tooltip: 'Scroll down',
    size: 'medium',
  },
};

export const ScrollToTop: Story = {
  args: {
    direction: 'toTop',
    tooltip: 'Back to top',
    size: 'medium',
  },
};

export const ScrollToBottom: Story = {
  args: {
    direction: 'toBottom',
    tooltip: 'Scroll to bottom',
    size: 'medium',
  },
};

export const Small: Story = {
  args: {
    direction: 'up',
    tooltip: 'Scroll up',
    size: 'small',
  },
};

export const Large: Story = {
  args: {
    direction: 'up',
    tooltip: 'Scroll up',
    size: 'large',
  },
};

export const Disabled: Story = {
  args: {
    direction: 'up',
    tooltip: 'Scroll up',
    disabled: true,
  },
};

export const Hidden: Story = {
  args: {
    direction: 'up',
    tooltip: 'Scroll up',
    visible: false,
  },
};
