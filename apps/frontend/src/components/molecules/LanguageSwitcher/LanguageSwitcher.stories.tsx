import type { Meta, StoryObj } from '@storybook/nextjs';
import { LanguageSwitcher } from './LanguageSwitcher';
import { AppBar, Toolbar, Typography, Box, Paper } from '@mui/material';

/**
 * LanguageSwitcher allows users to change the application language.
 *
 * Features:
 * - Displays current language with flag
 * - Dropdown menu with all available languages
 * - Seamless language switching without page reload
 * - Supports multiple display modes (icon-only or with label)
 * - Accessible with ARIA labels
 */
const meta = {
  title: 'Molecules/LanguageSwitcher',
  component: LanguageSwitcher,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A language switcher component that allows users to change the application language. Built with Material-UI and next-intl.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    showLabel: {
      control: 'boolean',
      description: 'Show language name next to icon',
      table: {
        defaultValue: { summary: 'false' },
      },
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'Size of the icon button',
      table: {
        defaultValue: { summary: 'medium' },
      },
    },
    color: {
      control: 'select',
      options: ['inherit', 'primary', 'secondary', 'default'],
      description: 'Color of the button',
      table: {
        defaultValue: { summary: 'inherit' },
      },
    },
  },
} satisfies Meta<typeof LanguageSwitcher>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default icon-only display
 */
export const Default: Story = {
  args: {},
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
 * With language label displayed
 */
export const WithLabel: Story = {
  args: {
    showLabel: true,
    color: 'primary',
  },
};

/**
 * Different sizes comparison
 */
export const SizeComparison: Story = {
  render: () => (
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="caption" display="block" sx={{ mb: 1 }}>
          Small
        </Typography>
        <LanguageSwitcher size="small" color="primary" />
      </Box>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="caption" display="block" sx={{ mb: 1 }}>
          Medium
        </Typography>
        <LanguageSwitcher size="medium" color="primary" />
      </Box>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="caption" display="block" sx={{ mb: 1 }}>
          Large
        </Typography>
        <LanguageSwitcher size="large" color="primary" />
      </Box>
    </Box>
  ),
};

/**
 * Color variants comparison
 */
export const ColorVariants: Story = {
  render: () => (
    <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <Typography variant="body2" sx={{ width: 100 }}>
          Default:
        </Typography>
        <LanguageSwitcher color="default" />
      </Box>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <Typography variant="body2" sx={{ width: 100 }}>
          Primary:
        </Typography>
        <LanguageSwitcher color="primary" />
      </Box>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <Typography variant="body2" sx={{ width: 100 }}>
          Secondary:
        </Typography>
        <LanguageSwitcher color="secondary" />
      </Box>
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          alignItems: 'center',
          bgcolor: 'primary.main',
          p: 2,
          borderRadius: 1,
        }}
      >
        <Typography variant="body2" sx={{ width: 100, color: 'white' }}>
          Inherit:
        </Typography>
        <LanguageSwitcher color="inherit" />
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
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
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
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
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
 * In settings panel
 */
export const InSettingsPanel: Story = {
  args: {
    color: 'primary',
    showLabel: true,
  },
  decorators: [
    (Story) => (
      <Paper sx={{ p: 3, width: 400 }}>
        <Typography variant="h6" gutterBottom>
          Language Settings
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Choose your preferred language
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="body1" sx={{ flexGrow: 1 }}>
            Current Language:
          </Typography>
          <Story />
        </Box>
      </Paper>
    ),
  ],
};

/**
 * Interactive example with instructions
 */
export const Interactive: Story = {
  args: {
    color: 'primary',
  },
  decorators: [
    (Story) => (
      <Box sx={{ textAlign: 'center' }}>
        <Paper sx={{ p: 3, mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Try the Language Switcher
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Click the button below to open the language menu
          </Typography>
          <Story />
        </Paper>
        <Typography variant="caption" color="text.secondary">
          Note: In Storybook, the actual language switch may not persist due to
          routing limitations
        </Typography>
      </Box>
    ),
  ],
};

/**
 * Real-world example in a dashboard header
 */
export const DashboardHeader: Story = {
  render: () => (
    <Box sx={{ width: '100%', minWidth: 800 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            My Dashboard
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <LanguageSwitcher color="inherit" />
            <Box
              component="span"
              sx={{ color: 'inherit', px: 2, py: 1, cursor: 'pointer' }}
            >
              Profile
            </Box>
            <Box
              component="span"
              sx={{ color: 'inherit', px: 2, py: 1, cursor: 'pointer' }}
            >
              Logout
            </Box>
          </Box>
        </Toolbar>
      </AppBar>
      <Paper sx={{ p: 3, mt: 2 }}>
        <Typography variant="h5" gutterBottom>
          Welcome Back!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Use the language switcher in the top right corner to change the
          interface language.
        </Typography>
      </Paper>
    </Box>
  ),
};
