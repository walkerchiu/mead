import type { Meta, StoryObj } from '@storybook/nextjs';
import { ScrollButton } from './ScrollButton';

const meta = {
  title: 'Atoms/ScrollButton',
  component: ScrollButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    direction: {
      control: 'select',
      options: ['up', 'down', 'toTop', 'toBottom'],
      description: 'Button direction',
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'Button size',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the button is disabled',
    },
    visible: {
      control: 'boolean',
      description: 'Whether the button is visible',
    },
    tooltip: {
      control: 'text',
      description: 'Tooltip text',
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
