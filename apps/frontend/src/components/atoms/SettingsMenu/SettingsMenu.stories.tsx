import type { Meta, StoryObj } from '@storybook/react';
import { SettingsMenu } from './SettingsMenu';
import { AppBar, Toolbar, Typography, Box } from '@mui/material';
import Link from 'next/link';
import { MainAppBar } from '@/components/layout';

/**
 * SettingsMenu provides quick access to profile, security settings, and logout.
 *
 * Features:
 * - Dropdown menu with profile and security options
 * - Logout option with divider
 * - Icon-only or with label display modes
 * - Follows Material-UI Menu pattern
 * - Accessible with ARIA labels
 */
const meta = {
  title: 'Molecules/SettingsMenu',
  component: SettingsMenu,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A settings menu component that provides quick navigation to profile settings, security settings, and logout functionality.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    showLabel: {
      control: 'boolean',
      description: 'Show "Settings" text next to icon',
      table: {
        defaultValue: { summary: 'false' },
      },
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'Size of the button',
      table: {
        defaultValue: { summary: 'medium' },
      },
    },
    color: {
      control: 'select',
      options: [
        'inherit',
        'primary',
        'secondary',
        'success',
        'error',
        'info',
        'warning',
      ],
      description: 'Color of the button',
      table: {
        defaultValue: { summary: 'inherit' },
      },
    },
    onLogout: {
      action: 'logout',
      description: 'Custom logout handler (optional)',
    },
  },
} satisfies Meta<typeof SettingsMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default icon-only display
 */
export const Default: Story = {
  args: {},
};

/**
 * Icon-only with primary color
 */
export const Primary: Story = {
  args: {
    color: 'primary',
  },
};

/**
 * Icon-only with secondary color
 */
export const Secondary: Story = {
  args: {
    color: 'secondary',
  },
};

/**
 * With "Settings" label
 */
export const WithLabel: Story = {
  args: {
    showLabel: true,
    color: 'primary',
  },
};

/**
 * Small size button
 */
export const Small: Story = {
  args: {
    size: 'small',
    color: 'primary',
  },
};

/**
 * Large size button
 */
export const Large: Story = {
  args: {
    size: 'large',
    color: 'primary',
  },
};

/**
 * Size comparison
 */
export const SizeComparison: Story = {
  render: () => (
    <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="caption" display="block" sx={{ mb: 1 }}>
          Small
        </Typography>
        <SettingsMenu size="small" color="primary" />
      </Box>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="caption" display="block" sx={{ mb: 1 }}>
          Medium
        </Typography>
        <SettingsMenu size="medium" color="primary" />
      </Box>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="caption" display="block" sx={{ mb: 1 }}>
          Large
        </Typography>
        <SettingsMenu size="large" color="primary" />
      </Box>
    </Box>
  ),
};

/**
 * In AppBar (typical use case)
 */
export const InAppBar: Story = {
  args: {
    color: 'inherit',
  },
  decorators: [
    (Story) => (
      <Box sx={{ width: '100%', minWidth: 600 }}>
        <AppBar position="static">
          <Toolbar>
            <Typography
              variant="h6"
              component={Link}
              href="/dashboard"
              sx={{
                flexGrow: 1,
                color: 'inherit',
                textDecoration: 'none',
                '&:hover': {
                  opacity: 0.8,
                },
              }}
            >
              Dashboard
            </Typography>
            <Story />
          </Toolbar>
        </AppBar>
      </Box>
    ),
  ],
};

/**
 * In AppBar with label
 */
export const InAppBarWithLabel: Story = {
  args: {
    color: 'inherit',
    showLabel: true,
  },
  decorators: [
    (Story) => (
      <Box sx={{ width: '100%', minWidth: 600 }}>
        <AppBar position="static">
          <Toolbar>
            <Typography
              variant="h6"
              component={Link}
              href="/dashboard"
              sx={{
                flexGrow: 1,
                color: 'inherit',
                textDecoration: 'none',
                '&:hover': {
                  opacity: 0.8,
                },
              }}
            >
              Dashboard
            </Typography>
            <Story />
          </Toolbar>
        </AppBar>
      </Box>
    ),
  ],
};

/**
 * Dashboard header with language switcher and settings menu
 */
export const DashboardHeader: Story = {
  render: () => (
    <Box sx={{ width: '100%', minWidth: 800 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography
            variant="h6"
            component={Link}
            href="/dashboard"
            sx={{
              flexGrow: 1,
              color: 'inherit',
              textDecoration: 'none',
              '&:hover': {
                opacity: 0.8,
              },
            }}
          >
            My Dashboard
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Box
              component="span"
              sx={{
                color: 'inherit',
                px: 1,
                py: 0.5,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              🌐
            </Box>
            <SettingsMenu color="inherit" />
          </Box>
        </Toolbar>
      </AppBar>
    </Box>
  ),
};

/**
 * Complete page header with MainAppBar component (with back button, title link, and settings menu)
 * This demonstrates the real-world usage scenario like the audit logs and session management pages
 */
export const WithMainAppBar: Story = {
  render: () => (
    <Box>
      <MainAppBar
        title="Audit Logs"
        titleLink="/admin/audit-logs"
        showBackButton
        backPath="/dashboard"
      />
      <Box sx={{ p: 3, bgcolor: 'grey.50', minHeight: '400px' }}>
        <Typography variant="h5" gutterBottom>
          Page Content
        </Typography>
        <Typography variant="body1" color="text.secondary">
          This story demonstrates the complete navigation bar with:
        </Typography>
        <Box component="ul" sx={{ mt: 2 }}>
          <li>Back button (clicking will navigate to /dashboard)</li>
          <li>Clickable title "Audit Logs" (links to /admin/audit-logs)</li>
          <li>Language switcher</li>
          <li>Settings menu with Profile, Security, and Logout options</li>
        </Box>
      </Box>
    </Box>
  ),
};
