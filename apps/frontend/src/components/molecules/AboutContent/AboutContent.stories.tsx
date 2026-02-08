import type { Meta, StoryObj } from '@storybook/nextjs';
import { AboutContent } from './AboutContent';
import Box from '@mui/material/Box';

const meta = {
  title: 'Molecules/AboutContent',
  component: AboutContent,
  parameters: {
    docs: {
      description: {
        component:
          'Displays application information including version details, technology stack, license, and contact information. Designed to be used inside a Modal or as standalone scrollable content. Responds to the active locale.',
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
