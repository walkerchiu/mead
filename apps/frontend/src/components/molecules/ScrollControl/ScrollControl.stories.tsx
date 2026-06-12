import type { Meta, StoryObj } from '@storybook/nextjs';
import { ScrollControl } from './ScrollControl';
import { Box, Typography } from '@mui/material';

const meta = {
  title: 'Shared/Molecules/ScrollControl',
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
      description: '元件位置',
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: '按鈕尺寸',
    },
    offset: {
      control: 'number',
      description: '每次點擊的捲動距離（px）',
    },
    visibilityThreshold: {
      control: 'number',
      description: '顯示門檻（px）',
    },
    showScrollUp: {
      control: 'boolean',
      description: '顯示向上捲動按鈕',
    },
    showScrollDown: {
      control: 'boolean',
      description: '顯示向下捲動按鈕',
    },
    showScrollToTop: {
      control: 'boolean',
      description: '顯示捲動至頂端按鈕',
    },
    showScrollToBottom: {
      control: 'boolean',
      description: '顯示捲動至底端按鈕',
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
 * 預設設定：右下位置，含向上捲動、向下捲動與回到頂端按鈕
 */
export const Default: Story = {
  args: {
    position: 'right-bottom',
  },
};

/**
 * 右上位置
 */
export const RightTop: Story = {
  args: {
    position: 'right-top',
  },
};

/**
 * 右側置中位置
 */
export const RightCenter: Story = {
  args: {
    position: 'right-center',
  },
};

/**
 * 左下位置
 */
export const LeftBottom: Story = {
  args: {
    position: 'left-bottom',
  },
};

/**
 * 左上位置
 */
export const LeftTop: Story = {
  args: {
    position: 'left-top',
  },
};

/**
 * 左側置中位置
 */
export const LeftCenter: Story = {
  args: {
    position: 'left-center',
  },
};

/**
 * 顯示所有按鈕（含捲動至底端）
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
 * 僅顯示捲動至頂端按鈕
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
 * 自訂位置（x: 100px、y: 100px）
 */
export const CustomPosition: Story = {
  args: {
    position: 'custom',
    customPosition: { x: 100, y: 100 },
  },
};

/**
 * 小尺寸按鈕
 */
export const SmallSize: Story = {
  args: {
    size: 'small',
  },
};

/**
 * 大尺寸按鈕
 */
export const LargeSize: Story = {
  args: {
    size: 'large',
  },
};

/**
 * 快速捲動（offset: 1000px）
 */
export const FastScroll: Story = {
  args: {
    offset: 1000,
  },
};

/**
 * 慢速捲動（offset: 200px）
 */
export const SlowScroll: Story = {
  args: {
    offset: 200,
  },
};

/**
 * 低顯示門檻（捲動 100px 後顯示）
 */
export const LowThreshold: Story = {
  args: {
    visibilityThreshold: 100,
  },
};

/**
 * 高顯示門檻（捲動 500px 後顯示）
 */
export const HighThreshold: Story = {
  args: {
    visibilityThreshold: 500,
  },
};
