import type { Meta, StoryObj } from '@storybook/nextjs';
import { ScrollControl } from './ScrollControl';
import { Box, Typography } from '@mui/material';

const meta = {
  title: 'Molecules/ScrollControl',
  component: ScrollControl,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    position: {
      control: 'select',
      options: [
        'right-top',
        'right-center',
        'right-bottom',
        'left-top',
        'left-center',
        'left-bottom',
        'custom',
      ],
      description: 'Component position',
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'Button size',
    },
    offset: {
      control: 'number',
      description: 'Scroll offset per click (px)',
    },
    visibilityThreshold: {
      control: 'number',
      description: 'Visibility threshold (px)',
    },
    showScrollUp: {
      control: 'boolean',
      description: 'Show scroll up button',
    },
    showScrollDown: {
      control: 'boolean',
      description: 'Show scroll down button',
    },
    showScrollToTop: {
      control: 'boolean',
      description: 'Show scroll to top button',
    },
    showScrollToBottom: {
      control: 'boolean',
      description: 'Show scroll to bottom button',
    },
  },
  decorators: [
    (Story) => (
      <Box sx={{ height: '200vh', p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Scroll down to see the scroll control buttons
        </Typography>
        <Typography variant="body1" paragraph>
          This is a long page example. Please scroll down to see the scroll
          control buttons appear.
        </Typography>
        {Array.from({ length: 30 }, (_, i) => (
          <Typography key={i} paragraph>
            Paragraph {i + 1}: This is demo content. Lorem ipsum dolor sit amet,
            consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut
            labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
            exercitation ullamco laboris nisi ut aliquip ex ea commodo
            consequat.
          </Typography>
        ))}
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof ScrollControl>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default configuration: bottom-right position with scroll up, scroll down, and back to top buttons
 */
export const Default: Story = {
  args: {
    position: 'right-bottom',
  },
};

/**
 * Top-right position
 */
export const RightTop: Story = {
  args: {
    position: 'right-top',
  },
};

/**
 * Right-center position
 */
export const RightCenter: Story = {
  args: {
    position: 'right-center',
  },
};

/**
 * Bottom-left position
 */
export const LeftBottom: Story = {
  args: {
    position: 'left-bottom',
  },
};

/**
 * Top-left position
 */
export const LeftTop: Story = {
  args: {
    position: 'left-top',
  },
};

/**
 * Left-center position
 */
export const LeftCenter: Story = {
  args: {
    position: 'left-center',
  },
};

/**
 * Show all buttons (including scroll to bottom)
 */
export const WithAllButtons: Story = {
  args: {
    position: 'right-bottom',
    showScrollUp: true,
    showScrollDown: true,
    showScrollToTop: true,
    showScrollToBottom: true,
  },
};

/**
 * Show only scroll to top button
 */
export const OnlyScrollToTop: Story = {
  args: {
    showScrollUp: false,
    showScrollDown: false,
    showScrollToTop: true,
    showScrollToBottom: false,
  },
};

/**
 * Custom position (x: 100px, y: 100px)
 */
export const CustomPosition: Story = {
  args: {
    position: 'custom',
    customPosition: { x: 100, y: 100 },
  },
};

/**
 * Small button size
 */
export const SmallSize: Story = {
  args: {
    size: 'small',
  },
};

/**
 * Large button size
 */
export const LargeSize: Story = {
  args: {
    size: 'large',
  },
};

/**
 * Fast scrolling (offset: 1000px)
 */
export const FastScroll: Story = {
  args: {
    offset: 1000,
  },
};

/**
 * Slow scrolling (offset: 200px)
 */
export const SlowScroll: Story = {
  args: {
    offset: 200,
  },
};

/**
 * Low visibility threshold (shows after scrolling 100px)
 */
export const LowThreshold: Story = {
  args: {
    visibilityThreshold: 100,
  },
};

/**
 * High visibility threshold (shows after scrolling 500px)
 */
export const HighThreshold: Story = {
  args: {
    visibilityThreshold: 500,
  },
};
