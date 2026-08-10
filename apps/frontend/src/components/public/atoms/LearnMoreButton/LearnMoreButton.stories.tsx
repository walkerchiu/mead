import type { Meta, StoryObj } from '@storybook/nextjs';

import { LearnMoreButton } from './LearnMoreButton';

/**
 * 入口網「了解更多 ↗」白色膠囊按鈕，用於計畫卡片導向詳細頁或外部連結。
 */
const meta = {
  title: 'Public Scope/Atoms/LearnMoreButton',
  component: LearnMoreButton,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'inline-radio', options: ['small', 'medium'] },
  },
} satisfies Meta<typeof LearnMoreButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { label: '了解更多' },
};

export const Small: Story = {
  args: { label: '了解更多', size: 'small' },
};

export const AsLink: Story = {
  args: { label: '前往官網', href: 'https://www.example.com' },
};
