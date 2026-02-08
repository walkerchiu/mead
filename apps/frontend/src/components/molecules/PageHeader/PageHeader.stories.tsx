import type { Meta, StoryObj } from '@storybook/nextjs';
import { PageHeader } from './PageHeader';
import { Button, IconButton, Box } from '@mui/material';
import {
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Settings as SettingsIcon,
  Assessment as AssessmentIcon,
  Computer as ComputerIcon,
} from '@mui/icons-material';

const meta = {
  title: 'Molecules/PageHeader',
  component: PageHeader,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
PageHeader component provides a consistent page title area following Material Design 3 and HQ UI best practices.

**Features:**
- Clear visual hierarchy
- Breadcrumb navigation support
- Flexible action button area
- Responsive design
- Full accessibility support

**Use Cases:**
- HQ dashboard pages
- Data list pages
- Detail pages
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'Page title',
    },
    description: {
      control: 'text',
      description: 'Page description',
    },
    showBackButton: {
      control: 'boolean',
      description: 'Whether to show back button',
    },
    elevated: {
      control: 'boolean',
      description: 'Whether to use card style',
    },
    icon: {
      control: false,
      description: 'Page icon',
    },
    breadcrumbs: {
      control: 'object',
      description: 'Breadcrumb navigation',
    },
    actions: {
      control: false,
      description: 'Right side action buttons',
    },
  },
} satisfies Meta<typeof PageHeader>;

export default meta;
type Story = StoryObj<typeof PageHeader>;

/**
 * Basic usage - Title only
 */
export const Basic: Story = {
  args: {
    title: 'Basic Title',
  },
  render: (args) => (
    <Box sx={{ p: 3, bgcolor: 'background.default', minHeight: '400px' }}>
      <PageHeader {...args} />
    </Box>
  ),
};

/**
 * With description
 */
export const WithDescription: Story = {
  args: {
    title: 'Page Title',
    description:
      'This is a description text that explains the main features and purpose of this page.',
  },
  render: (args) => (
    <Box sx={{ p: 3, bgcolor: 'background.default', minHeight: '400px' }}>
      <PageHeader {...args} />
    </Box>
  ),
};

/**
 * With icon
 */
export const WithIcon: Story = {
  args: {
    title: 'Audit Logs',
    description:
      'View system operation records, user activities, and security events',
    icon: '📊',
  },
  render: (args) => (
    <Box sx={{ p: 3, bgcolor: 'background.default', minHeight: '400px' }}>
      <PageHeader {...args} />
    </Box>
  ),
};

/**
 * With back button
 */
export const WithBackButton: Story = {
  args: {
    title: 'Detail Page',
    description: 'View detailed information',
    showBackButton: true,
    onBack: () => alert('Back to previous page'),
    backAriaLabel: 'Back to list',
  },
  render: (args) => (
    <Box sx={{ p: 3, bgcolor: 'background.default', minHeight: '400px' }}>
      <PageHeader {...args} />
    </Box>
  ),
};

/**
 * With breadcrumbs
 */
export const WithBreadcrumbs: Story = {
  args: {
    title: 'Audit Logs',
    description:
      'View system operation records, user activities, and security events',
    icon: <AssessmentIcon sx={{ fontSize: '2rem', color: 'primary.main' }} />,
    breadcrumbs: [
      { label: 'Home', href: '/', onClick: () => console.log('Home') },
      { label: 'HQ', href: '/hq', onClick: () => console.log('HQ') },
      { label: 'Audit Logs' },
    ],
  },
  render: (args) => (
    <Box sx={{ p: 3, bgcolor: 'background.default', minHeight: '400px' }}>
      <PageHeader {...args} />
    </Box>
  ),
};

/**
 * With single action button
 */
export const WithSingleAction: Story = {
  args: {
    title: 'Session Management',
    description:
      'Manage user login status, revoke sessions, and monitor device activity',
    icon: <ComputerIcon sx={{ fontSize: '2rem', color: 'primary.main' }} />,
    showBackButton: true,
    onBack: () => alert('Back'),
    actions: (
      <Button variant="outlined" startIcon={<RefreshIcon />}>
        Refresh
      </Button>
    ),
  },
  render: (args) => (
    <Box sx={{ p: 3, bgcolor: 'background.default', minHeight: '400px' }}>
      <PageHeader {...args} />
    </Box>
  ),
};

/**
 * With multiple action buttons
 */
export const WithMultipleActions: Story = {
  args: {
    title: 'Audit Logs',
    description:
      'View system operation records, user activities, and security events',
    icon: <AssessmentIcon sx={{ fontSize: '2rem', color: 'primary.main' }} />,
    showBackButton: true,
    onBack: () => alert('Back'),
    breadcrumbs: [
      { label: 'Home', href: '/' },
      { label: 'HQ', href: '/hq' },
      { label: 'Audit Logs' },
    ],
    actions: (
      <Box sx={{ display: 'flex', gap: 1 }}>
        <IconButton aria-label="Download">
          <DownloadIcon />
        </IconButton>
        <IconButton aria-label="Settings">
          <SettingsIcon />
        </IconButton>
        <Button variant="contained" startIcon={<RefreshIcon />}>
          Refresh
        </Button>
      </Box>
    ),
  },
  render: (args) => (
    <Box sx={{ p: 3, bgcolor: 'background.default', minHeight: '400px' }}>
      <PageHeader {...args} />
    </Box>
  ),
};

/**
 * Non-elevated style (flat)
 */
export const NonElevated: Story = {
  args: {
    title: 'Flat Style Title',
    description: 'No card style, displayed directly on the background',
    icon: '🎨',
    elevated: false,
    actions: (
      <Button variant="outlined" startIcon={<RefreshIcon />}>
        Refresh
      </Button>
    ),
  },
  render: (args) => (
    <Box sx={{ p: 3, bgcolor: 'background.default', minHeight: '400px' }}>
      <PageHeader {...args} />
    </Box>
  ),
};

/**
 * Audit Logs complete example
 */
export const AuditLogsExample: Story = {
  args: {
    title: 'Audit Logs',
    description:
      'View system operation records, user activities, and security events',
    icon: <AssessmentIcon sx={{ fontSize: '2rem', color: 'primary.main' }} />,
    showBackButton: true,
    onBack: () => alert('Back to Dashboard'),
    breadcrumbs: [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'HQ', href: '/hq' },
      { label: 'Audit Logs' },
    ],
    actions: (
      <Button
        variant="outlined"
        startIcon={<RefreshIcon />}
        onClick={() => alert('Refresh')}
      >
        Refresh
      </Button>
    ),
  },
  render: (args) => (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', p: 3 }}>
      <PageHeader {...args} />
      <Box sx={{ mt: 3, p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
        <p>Page content area...</p>
      </Box>
    </Box>
  ),
};

/**
 * Session Management complete example
 */
export const SessionsExample: Story = {
  args: {
    title: 'Session Management',
    description:
      'Manage user login status, revoke sessions, and monitor device activity',
    icon: <ComputerIcon sx={{ fontSize: '2rem', color: 'primary.main' }} />,
    showBackButton: true,
    onBack: () => alert('Back to Dashboard'),
    breadcrumbs: [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'HQ', href: '/hq' },
      { label: 'Session Management' },
    ],
    actions: (
      <Button
        variant="outlined"
        startIcon={<RefreshIcon />}
        onClick={() => alert('Refresh')}
      >
        Refresh
      </Button>
    ),
  },
  render: (args) => (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', p: 3 }}>
      <PageHeader {...args} />
      <Box sx={{ mt: 3, p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
        <p>Page content area...</p>
      </Box>
    </Box>
  ),
};

/**
 * Responsive demonstration
 */
export const Responsive: Story = {
  args: {
    title: 'Responsive Title',
    description: 'Automatically adjusts style based on different screen sizes',
    icon: '📱',
    showBackButton: true,
    onBack: () => alert('Back'),
    actions: (
      <Button variant="contained" startIcon={<RefreshIcon />}>
        Action
      </Button>
    ),
  },
  render: (args) => (
    <Box sx={{ bgcolor: 'background.default', minHeight: '400px', p: 3 }}>
      <PageHeader {...args} />
      <Box sx={{ mt: 2, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
        <p>💡 Tip: Resize your browser window to see responsive effects</p>
      </Box>
    </Box>
  ),
};
