import type { Meta, StoryObj } from '@storybook/nextjs';
import { HelpContent } from './HelpContent';
import Box from '@mui/material/Box';

const meta = {
  title: 'HQ Scope/Molecules/HelpContent',
  component: HelpContent,
  parameters: {
    docs: {
      description: {
        component:
          'Displays help and documentation content including a quick-start guide, expandable FAQ accordion, common feature descriptions, and contact information. Designed to be used inside a Modal or as standalone scrollable content. Responds to the active locale.',
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
