import type { Meta, StoryObj } from '@storybook/nextjs';
import { HelpContent } from './HelpContent';
import Box from '@mui/material/Box';

const meta = {
  title: 'Shared/Molecules/HelpContent',
  component: HelpContent,
  parameters: {
    docs: {
      description: {
        component:
          '顯示說明與文件內容，包含快速入門指南、可展開的 FAQ 摺疊面板、常見功能說明與聯絡資訊。設計用於 Modal 內或作為獨立的可捲動內容，並會依目前語系調整。',
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
} satisfies Meta<typeof HelpContent>;

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
      <HelpContent />
    </Box>
  ),
};
