import type { Meta, StoryObj } from '@storybook/react';
import { SettingsMenu, createSettingsMenuItems } from './SettingsMenu';
import { AppBar, Toolbar, Typography, Box, Paper } from '@mui/material';
import Link from 'next/link';
import React from 'react';

// Default menu items (using labels from i18n)
const defaultMenuItems = createSettingsMenuItems({
  onHelpClick: () => console.log('Help clicked'),
  onAboutClick: () => console.log('About clicked'),
  helpUrl: '/help',
  aboutUrl: '/about',
  helpLabel: 'Help Documentation', // Corresponds to i18n: components.settingsMenu.help
  aboutLabel: 'About', // Corresponds to i18n: components.settingsMenu.about
});

/**
 * SettingsMenu provides quick access to theme settings, help, and about.
 *
 * **Features**:
 * - Inline theme toggle (Light/Dark/System)
 * - Help documentation link
 * - About information link
 * - Icon-only or with label display modes
 * - Accessible with ARIA labels
 */
const meta = {
  title: 'Atoms/SettingsMenu',
  component: SettingsMenu,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A settings menu component that provides quick access to theme settings, help documentation, and about information.',
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
    currentTheme: {
      control: 'select',
      options: ['light', 'dark', 'system'],
      description: 'Current theme setting',
      table: {
        defaultValue: { summary: 'system' },
      },
    },
    onThemeChange: {
      action: 'theme changed',
    },
    onHelpClick: {
      action: 'help clicked',
    },
    onAboutClick: {
      action: 'about clicked',
    },
  },
} satisfies Meta<typeof SettingsMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default icon-only display with system theme
 */
export const Default: Story = {
  args: {
    showThemeToggle: true,
    currentTheme: 'system',
    menuItems: defaultMenuItems,
  },
};

/**
 * Light theme selected
 */
export const LightTheme: Story = {
  args: {
    showThemeToggle: true,
    currentTheme: 'light',
    menuItems: defaultMenuItems,
  },
};

/**
 * Dark theme selected
 */
export const DarkTheme: Story = {
  args: {
    showThemeToggle: true,
    currentTheme: 'dark',
    menuItems: defaultMenuItems,
  },
};

/**
 * With "Settings" label
 */
export const WithLabel: Story = {
  args: {
    showLabel: true,
    showThemeToggle: true,
    currentTheme: 'system',
    menuItems: defaultMenuItems,
  },
};

/**
 * Small size button
 */
export const Small: Story = {
  args: {
    size: 'small',
    showThemeToggle: true,
    currentTheme: 'light',
    menuItems: defaultMenuItems,
  },
};

/**
 * Large size button
 */
export const Large: Story = {
  args: {
    size: 'large',
    showThemeToggle: true,
    currentTheme: 'dark',
    menuItems: defaultMenuItems,
  },
};

/**
 * Primary color
 */
export const Primary: Story = {
  args: {
    color: 'primary',
    showThemeToggle: true,
    currentTheme: 'system',
    menuItems: defaultMenuItems,
  },
};

/**
 * Different theme states
 */
export const ThemeStates: Story = {
  render: () => (
    <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography sx={{ width: 100 }}>Light:</Typography>
        <SettingsMenu
          showThemeToggle
          currentTheme="light"
          color="primary"
          menuItems={defaultMenuItems}
        />
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography sx={{ width: 100 }}>Dark:</Typography>
        <SettingsMenu
          showThemeToggle
          currentTheme="dark"
          color="primary"
          menuItems={defaultMenuItems}
        />
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography sx={{ width: 100 }}>System:</Typography>
        <SettingsMenu
          showThemeToggle
          currentTheme="system"
          color="primary"
          menuItems={defaultMenuItems}
        />
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
    showThemeToggle: true,
    currentTheme: 'light',
    menuItems: defaultMenuItems,
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
    showThemeToggle: true,
    currentTheme: 'dark',
    menuItems: defaultMenuItems,
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
 * In AppBar with other elements
 */
export const InAppBarWithOthers: Story = {
  args: {
    color: 'inherit',
    showThemeToggle: true,
    currentTheme: 'system',
    menuItems: defaultMenuItems,
  },
  decorators: [
    (Story) => (
      <Box sx={{ width: '100%', minWidth: 800 }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              My Application
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Box
                component="span"
                sx={{
                  color: 'inherit',
                  px: 2,
                  py: 1,
                  cursor: 'pointer',
                  borderRadius: 1,
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                🔔 3
              </Box>
              <Box
                component="span"
                sx={{
                  color: 'inherit',
                  px: 2,
                  py: 1,
                  cursor: 'pointer',
                  borderRadius: 1,
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                🌐 EN
              </Box>
              <Box
                component="span"
                sx={{
                  color: 'inherit',
                  px: 2,
                  py: 1,
                  cursor: 'pointer',
                  borderRadius: 1,
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                👤 User
              </Box>
              <Story />
            </Box>
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
    showThemeToggle: true,
    currentTheme: 'light',
    menuItems: defaultMenuItems,
  },
  decorators: [
    (Story) => (
      <Paper sx={{ p: 3, width: 400 }}>
        <Typography variant="h6" gutterBottom>
          Application Settings
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Customize your preferences
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="body1" sx={{ flexGrow: 1 }}>
            Settings:
          </Typography>
          <Story />
        </Box>
      </Paper>
    ),
  ],
};

/**
 * Interactive example with theme switching
 */
export const Interactive: Story = {
  render: () => {
    const [theme, setTheme] = React.useState<'light' | 'dark' | 'system'>(
      'system',
    );

    return (
      <Box sx={{ textAlign: 'center' }}>
        <Paper sx={{ p: 3, mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Try the Settings Menu
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Current theme: <strong>{theme}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Click the settings icon to change theme
          </Typography>
          <SettingsMenu
            showThemeToggle
            currentTheme={theme}
            onThemeChange={setTheme}
            color="primary"
            menuItems={defaultMenuItems}
          />
        </Paper>
        <Typography variant="caption" color="text.secondary">
          Theme switching will be reflected in the menu
        </Typography>
      </Box>
    );
  },
};

/**
 * All size comparison
 */
export const SizeComparison: Story = {
  render: () => (
    <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="caption" display="block" sx={{ mb: 1 }}>
          Small
        </Typography>
        <SettingsMenu
          size="small"
          color="primary"
          showThemeToggle
          currentTheme="light"
          menuItems={defaultMenuItems}
        />
      </Box>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="caption" display="block" sx={{ mb: 1 }}>
          Medium
        </Typography>
        <SettingsMenu
          size="medium"
          color="primary"
          showThemeToggle
          currentTheme="dark"
          menuItems={defaultMenuItems}
        />
      </Box>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="caption" display="block" sx={{ mb: 1 }}>
          Large
        </Typography>
        <SettingsMenu
          size="large"
          color="primary"
          showThemeToggle
          currentTheme="system"
          menuItems={defaultMenuItems}
        />
      </Box>
    </Box>
  ),
};
