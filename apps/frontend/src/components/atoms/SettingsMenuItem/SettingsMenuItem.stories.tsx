import type { Meta, StoryObj } from '@storybook/nextjs';
import { SettingsMenuItem } from './SettingsMenuItem';
import {
  Help,
  Info,
  Feedback,
  BugReport,
  Description,
} from '@mui/icons-material';
import { Box } from '@mui/material';

/**
 * SettingsMenuItem - Atomic Design: Atom
 *
 * Single settings menu item that supports icon, label, click events, and link navigation.
 */
const meta = {
  title: 'Atoms/SettingsMenuItem',
  component: SettingsMenuItem,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <Box
        sx={{
          width: 280,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
        }}
      >
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof SettingsMenuItem>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default style
 */
export const Default: Story = {
  args: {
    icon: <Help />,
    label: 'Help',
    onClick: () => alert('Help clicked'),
  },
};

/**
 * Different icon examples
 */
export const WithInfoIcon: Story = {
  args: {
    icon: <Info />,
    label: 'About',
    onClick: () => alert('About clicked'),
  },
};

export const WithFeedbackIcon: Story = {
  args: {
    icon: <Feedback />,
    label: 'Send Feedback',
    onClick: () => alert('Feedback clicked'),
  },
};

export const WithBugReportIcon: Story = {
  args: {
    icon: <BugReport />,
    label: 'Report a Bug',
    onClick: () => alert('Bug report clicked'),
  },
};

export const WithDocumentIcon: Story = {
  args: {
    icon: <Description />,
    label: 'Documentation',
    onClick: () => alert('Documentation clicked'),
  },
};

/**
 * Without icon
 */
export const WithoutIcon: Story = {
  args: {
    label: 'Simple Menu Item',
    onClick: () => alert('Clicked'),
  },
};

/**
 * Using href for navigation
 */
export const WithHref: Story = {
  args: {
    icon: <Help />,
    label: 'Help Center',
    href: '/help',
  },
};

/**
 * External link
 */
export const ExternalLink: Story = {
  args: {
    icon: <Info />,
    label: 'Visit Website',
    href: 'https://example.com',
  },
};

/**
 * Multiple items combined display
 */
export const MenuItemList: Story = {
  render: () => (
    <Box
      sx={{
        width: 280,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
      }}
    >
      <SettingsMenuItem
        icon={<Help />}
        label="Help Center"
        onClick={() => console.log('Help')}
      />
      <SettingsMenuItem
        icon={<Info />}
        label="About"
        onClick={() => console.log('About')}
      />
      <SettingsMenuItem
        icon={<Feedback />}
        label="Send Feedback"
        onClick={() => console.log('Feedback')}
      />
      <SettingsMenuItem
        icon={<BugReport />}
        label="Report a Bug"
        onClick={() => console.log('Bug Report')}
      />
      <SettingsMenuItem
        icon={<Description />}
        label="Documentation"
        href="/docs"
      />
    </Box>
  ),
};
