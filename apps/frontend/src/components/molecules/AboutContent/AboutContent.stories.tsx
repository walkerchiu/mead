import type { Meta, StoryObj } from '@storybook/nextjs';
import { AboutContent } from './AboutContent';
import Box from '@mui/material/Box';

const meta = {
  title: 'Shared/Molecules/AboutContent',
  component: AboutContent,
  parameters: {
    docs: {
      description: {
        component:
          '顯示應用程式資訊，包含版本詳情、技術堆疊、授權與聯絡資訊。設計用於 Modal 內或作為獨立的可捲動內容，並會依目前語系調整。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {},
  decorators: [
    (Story) => (
      <Box sx={{ maxWidth: 600, mx: 'auto', p: 2 }}>
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof AboutContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const InScrollableContainer: Story = {
  render: () => (
    <Box
      sx={{
        maxWidth: 600,
        maxHeight: 500,
        overflowY: 'auto',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        p: 3,
      }}
    >
      <AboutContent />
    </Box>
  ),
};
