import type { Meta, StoryObj } from '@storybook/nextjs';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

import { AnimatedSlogan } from './AnimatedSlogan';

/**
 * slogan 逐字「展延」進場動畫，呼應設計稿的 slogan 展延效果。
 * 以 React `key` 重新掛載即可重播。
 */
const meta = {
  title: 'Public Scope/Atoms/AnimatedSlogan',
  component: AnimatedSlogan,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof AnimatedSlogan>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    text: '值得你期待的設計公費留學品牌',
    sx: { fontSize: 28, fontWeight: 700 },
  },
};

export const Replayable: Story = {
  args: {
    text: '讓世界透過設計看見臺灣',
    sx: { fontSize: 28, fontWeight: 700 },
  },
  render: function ReplayableSlogan(args) {
    const [nonce, setNonce] = useState(0);
    return (
      <Box sx={{ textAlign: 'center' }}>
        <AnimatedSlogan key={nonce} {...args} />
        <Box sx={{ mt: 3 }}>
          <Button variant="outlined" onClick={() => setNonce((n) => n + 1)}>
            重播動畫
          </Button>
        </Box>
      </Box>
    );
  },
};
