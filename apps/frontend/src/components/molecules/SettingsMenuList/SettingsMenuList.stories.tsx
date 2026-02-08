import type { Meta, StoryObj } from '@storybook/nextjs';
import { SettingsMenuList } from './SettingsMenuList';
import {
  Help,
  Info,
  Feedback,
  BugReport,
  Description,
  Language,
} from '@mui/icons-material';
import { Box } from '@mui/material';

/**
 * SettingsMenuList - Atomic Design: Molecule
 *
 * Settings menu item list that combines multiple SettingsMenuItem (Atom) components.
 */
const meta = {
  title: 'Molecules/SettingsMenuList',
  component: SettingsMenuList,
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
} satisfies Meta<typeof SettingsMenuList>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default style - Basic menu items
 */
export const Default: Story = {
  args: {
    items: [
      {
        id: 'help',
        label: 'Help',
        icon: <Help />,
        onClick: () => alert('Help clicked'),
      },
      {
        id: 'about',
        label: 'About',
        icon: <Info />,
        onClick: () => alert('About clicked'),
      },
    ],
  },
};

/**
 * Menu with dividers
 */
export const WithDividers: Story = {
  args: {
    items: [
      {
        id: 'help',
        label: 'Help Center',
        icon: <Help />,
        onClick: () => console.log('Help'),
      },
      {
        id: 'docs',
        label: 'Documentation',
        icon: <Description />,
        onClick: () => console.log('Docs'),
        dividerAfter: true,
      },
      {
        id: 'feedback',
        label: 'Send Feedback',
        icon: <Feedback />,
        onClick: () => console.log('Feedback'),
      },
      {
        id: 'bug',
        label: 'Report a Bug',
        icon: <BugReport />,
        onClick: () => console.log('Bug Report'),
        dividerAfter: true,
      },
      {
        id: 'about',
        label: 'About',
        icon: <Info />,
        onClick: () => console.log('About'),
      },
    ],
  },
};

/**
 * Menu using href for navigation
 */
export const WithHrefNavigation: Story = {
  args: {
    items: [
      {
        id: 'help',
        label: 'Help Center',
        icon: <Help />,
        href: '/help',
      },
      {
        id: 'docs',
        label: 'Documentation',
        icon: <Description />,
        href: '/docs',
      },
      {
        id: 'about',
        label: 'About',
        icon: <Info />,
        href: '/about',
      },
    ],
  },
};

/**
 * Menu mixing onClick and href
 */
export const MixedNavigation: Story = {
  args: {
    items: [
      {
        id: 'help',
        label: 'Help Center',
        icon: <Help />,
        href: '/help',
      },
      {
        id: 'docs',
        label: 'Documentation',
        icon: <Description />,
        href: '/docs',
        dividerAfter: true,
      },
      {
        id: 'feedback',
        label: 'Send Feedback',
        icon: <Feedback />,
        onClick: () => alert('Feedback form opened'),
      },
      {
        id: 'bug',
        label: 'Report a Bug',
        icon: <BugReport />,
        onClick: () => alert('Bug report form opened'),
      },
    ],
  },
};

/**
 * Menu items without icons
 */
export const WithoutIcons: Story = {
  args: {
    items: [
      {
        id: 'help',
        label: 'Help',
        onClick: () => console.log('Help'),
      },
      {
        id: 'about',
        label: 'About',
        onClick: () => console.log('About'),
      },
      {
        id: 'feedback',
        label: 'Feedback',
        onClick: () => console.log('Feedback'),
      },
    ],
  },
};

/**
 * Single item only
 */
export const SingleItem: Story = {
  args: {
    items: [
      {
        id: 'help',
        label: 'Help Center',
        icon: <Help />,
        onClick: () => alert('Help clicked'),
      },
    ],
  },
};

/**
 * Empty list
 */
export const Empty: Story = {
  args: {
    items: [],
  },
};

/**
 * Chinese labels example
 */
export const ChineseLabels: Story = {
  args: {
    items: [
      {
        id: 'help',
        label: '幫助中心',
        icon: <Help />,
        onClick: () => console.log('Help'),
      },
      {
        id: 'docs',
        label: '使用文檔',
        icon: <Description />,
        onClick: () => console.log('Docs'),
      },
      {
        id: 'feedback',
        label: '意見回饋',
        icon: <Feedback />,
        onClick: () => console.log('Feedback'),
        dividerAfter: true,
      },
      {
        id: 'about',
        label: '關於',
        icon: <Info />,
        onClick: () => console.log('About'),
      },
    ],
  },
};

/**
 * External links example
 */
export const ExternalLinks: Story = {
  args: {
    items: [
      {
        id: 'docs',
        label: 'Documentation',
        icon: <Description />,
        href: 'https://docs.example.com',
      },
      {
        id: 'community',
        label: 'Community Forum',
        icon: <Feedback />,
        href: 'https://forum.example.com',
      },
      {
        id: 'github',
        label: 'GitHub',
        icon: <Info />,
        href: 'https://github.com/example/project',
      },
    ],
  },
};

/**
 * Complete settings menu example
 */
export const CompleteSettingsMenu: Story = {
  args: {
    items: [
      {
        id: 'language',
        label: 'Language',
        icon: <Language />,
        onClick: () => console.log('Language'),
      },
      {
        id: 'help',
        label: 'Help Center',
        icon: <Help />,
        href: '/help',
      },
      {
        id: 'docs',
        label: 'Documentation',
        icon: <Description />,
        href: '/docs',
        dividerAfter: true,
      },
      {
        id: 'feedback',
        label: 'Send Feedback',
        icon: <Feedback />,
        onClick: () => alert('Feedback form'),
      },
      {
        id: 'bug',
        label: 'Report a Bug',
        icon: <BugReport />,
        onClick: () => alert('Bug report form'),
        dividerAfter: true,
      },
      {
        id: 'about',
        label: 'About',
        icon: <Info />,
        href: '/about',
      },
    ],
  },
};
