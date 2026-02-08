import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Drawer, DrawerState } from './Drawer';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar,
} from '@mui/material';
import {
  Home as HomeIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';

/**
 * Drawer component provides sidebar functionality, supporting three states and three modes.
 *
 * **States**:
 * - `closed`: Completely closed (temporary and persistent only)
 * - `mini`: Semi-expanded, showing icons only
 * - `open`: Fully expanded, showing complete content
 *
 * **Variants**:
 * - `temporary`: Overlays content, suitable for mobile
 * - `persistent`: Pushes main content, suitable for toggleable desktop sidebar
 * - `permanent`: Permanently displayed, suitable for fixed desktop sidebar
 *
 * **Use Cases**:
 * - Application navigation sidebar
 * - Settings panel
 * - Notification panel
 */
const meta = {
  title: 'Organisms/Drawer',
  component: Drawer,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Flexible drawer component with support for temporary, persistent, and permanent modes, as well as mini (collapsed) state.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    state: {
      control: 'select',
      options: ['closed', 'mini', 'open'],
      description: 'Display state of the drawer',
      table: {
        defaultValue: { summary: 'open' },
      },
    },
    variant: {
      control: 'select',
      options: ['temporary', 'persistent', 'permanent'],
      description: 'Drawer behavior mode',
      table: {
        defaultValue: { summary: 'persistent' },
      },
    },
    anchor: {
      control: 'select',
      options: ['left', 'right'],
      description: 'Side of the screen where drawer appears',
      table: {
        defaultValue: { summary: 'left' },
      },
    },
    width: {
      control: 'number',
      description: 'Width when fully opened (px)',
      table: {
        defaultValue: { summary: '240' },
      },
    },
    miniWidth: {
      control: 'number',
      description: 'Width when in mini state (px)',
      table: {
        defaultValue: { summary: '64' },
      },
    },
    showToggleButton: {
      control: 'boolean',
      description: 'Show toggle button to change state',
      table: {
        defaultValue: { summary: 'true' },
      },
    },
  },
} satisfies Meta<typeof Drawer>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample menu items
const SampleMenuContent = () => (
  <List>
    <ListItem disablePadding>
      <ListItemButton>
        <ListItemIcon>
          <HomeIcon />
        </ListItemIcon>
        <ListItemText primary="Home" />
      </ListItemButton>
    </ListItem>
    <ListItem disablePadding>
      <ListItemButton>
        <ListItemIcon>
          <PersonIcon />
        </ListItemIcon>
        <ListItemText primary="Profile" />
      </ListItemButton>
    </ListItem>
    <ListItem disablePadding>
      <ListItemButton>
        <ListItemIcon>
          <SettingsIcon />
        </ListItemIcon>
        <ListItemText primary="Settings" />
      </ListItemButton>
    </ListItem>
    <ListItem disablePadding>
      <ListItemButton>
        <ListItemIcon>
          <LogoutIcon />
        </ListItemIcon>
        <ListItemText primary="Logout" />
      </ListItemButton>
    </ListItem>
  </List>
);

/**
 * Default persistent drawer with open state
 */
export const Default: Story = {
  render: (args) => (
    <Box sx={{ display: 'flex', height: '500px' }}>
      <Drawer {...args}>
        <SampleMenuContent />
      </Drawer>
      <Box sx={{ flexGrow: 1, p: 3, bgcolor: 'grey.50' }}>
        <Typography variant="h5">Main Content</Typography>
        <Typography>
          This is a default persistent drawer in open state.
        </Typography>
      </Box>
    </Box>
  ),
  args: {
    state: 'open',
    variant: 'persistent',
    header: <Typography variant="h6">My App</Typography>,
  },
};

/**
 * Mini (collapsed) state showing only icons
 */
export const Mini: Story = {
  render: (args) => (
    <Box sx={{ display: 'flex', height: '500px' }}>
      <Drawer {...args}>
        <SampleMenuContent />
      </Drawer>
      <Box sx={{ flexGrow: 1, p: 3, bgcolor: 'grey.50' }}>
        <Typography variant="h5">Main Content</Typography>
        <Typography>Mini (collapsed) drawer showing only icons.</Typography>
      </Box>
    </Box>
  ),
  args: {
    state: 'mini',
    variant: 'persistent',
    header: <Typography variant="h6">My App</Typography>,
  },
};

/**
 * Temporary drawer (mobile style) - overlays content
 */
export const Temporary: Story = {
  render: (args) => (
    <Box sx={{ position: 'relative', height: '500px', overflow: 'hidden' }}>
      <Drawer {...args}>
        <SampleMenuContent />
      </Drawer>
      <Box sx={{ p: 3, bgcolor: 'grey.50', height: '100%' }}>
        <Typography variant="h5">Main Content</Typography>
        <Typography>
          Temporary drawer overlays the content (mobile style).
        </Typography>
      </Box>
    </Box>
  ),
  args: {
    state: 'open',
    variant: 'temporary',
    header: <Typography variant="h6">My App</Typography>,
  },
};

/**
 * Permanent drawer - always visible
 */
export const Permanent: Story = {
  render: (args) => (
    <Box sx={{ display: 'flex', height: '500px' }}>
      <Drawer {...args}>
        <SampleMenuContent />
      </Drawer>
      <Box sx={{ flexGrow: 1, p: 3, bgcolor: 'grey.50' }}>
        <Typography variant="h5">Main Content</Typography>
        <Typography>
          Permanent drawer is always visible and cannot be closed.
        </Typography>
      </Box>
    </Box>
  ),
  args: {
    state: 'open',
    variant: 'permanent',
    header: <Typography variant="h6">My App</Typography>,
  },
};

/**
 * Right-anchored drawer
 */
export const RightAnchor: Story = {
  render: (args) => (
    <Box sx={{ display: 'flex', height: '500px' }}>
      <Box sx={{ flexGrow: 1, p: 3, bgcolor: 'grey.50' }}>
        <Typography variant="h5">Main Content</Typography>
        <Typography>
          Right-anchored drawer opens from the right side.
        </Typography>
      </Box>
      <Drawer {...args}>
        <SampleMenuContent />
      </Drawer>
    </Box>
  ),
  args: {
    state: 'open',
    variant: 'persistent',
    anchor: 'right',
    header: <Typography variant="h6">Settings</Typography>,
  },
};

/**
 * Custom widths
 */
export const CustomWidth: Story = {
  render: (args) => (
    <Box sx={{ display: 'flex', height: '500px' }}>
      <Drawer {...args}>
        <SampleMenuContent />
      </Drawer>
      <Box sx={{ flexGrow: 1, p: 3, bgcolor: 'grey.50' }}>
        <Typography variant="h5">Main Content</Typography>
        <Typography>
          This drawer has custom width (320px open, 80px mini).
        </Typography>
      </Box>
    </Box>
  ),
  args: {
    state: 'open',
    variant: 'persistent',
    width: 320,
    miniWidth: 80,
    header: <Typography variant="h6">Wide Drawer</Typography>,
  },
};

/**
 * With header and footer
 */
export const WithHeaderFooter: Story = {
  render: (args) => (
    <Box sx={{ display: 'flex', height: '500px' }}>
      <Drawer {...args}>
        <SampleMenuContent />
      </Drawer>
      <Box sx={{ flexGrow: 1, p: 3, bgcolor: 'grey.50' }}>
        <Typography variant="h5">Main Content</Typography>
        <Typography>Drawer with custom header and footer content.</Typography>
      </Box>
    </Box>
  ),
  args: {
    state: 'open',
    variant: 'persistent',
    header: (
      <Box>
        <Typography variant="h6">My App</Typography>
        <Typography variant="caption" color="text.secondary">
          v1.0.0
        </Typography>
      </Box>
    ),
    footer: (
      <Box>
        <Typography variant="caption">© 2026 My Company</Typography>
      </Box>
    ),
  },
};

/**
 * Comparison of all variants
 */
export const VariantComparison: Story = {
  render: () => {
    return (
      <Box>
        <Typography variant="h5" gutterBottom sx={{ p: 2 }}>
          Drawer Variants Comparison
        </Typography>

        <Box sx={{ display: 'flex', gap: 4, p: 2 }}>
          {/* Temporary */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Temporary
            </Typography>
            <Typography variant="caption" display="block" gutterBottom>
              Overlays content, dismissible
            </Typography>
            <Box
              sx={{
                width: 300,
                height: 400,
                border: '1px solid #ddd',
                position: 'relative',
              }}
            >
              <Drawer state="open" variant="temporary" showToggleButton={false}>
                <SampleMenuContent />
              </Drawer>
            </Box>
          </Box>

          {/* Persistent */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Persistent
            </Typography>
            <Typography variant="caption" display="block" gutterBottom>
              Pushes content, toggleable
            </Typography>
            <Box
              sx={{ display: 'flex', height: 400, border: '1px solid #ddd' }}
            >
              <Drawer
                state="open"
                variant="persistent"
                showToggleButton={false}
              >
                <SampleMenuContent />
              </Drawer>
              <Box sx={{ flexGrow: 1, p: 2, bgcolor: 'grey.100' }}>
                <Typography variant="body2">Main Content</Typography>
              </Box>
            </Box>
          </Box>

          {/* Permanent */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Permanent
            </Typography>
            <Typography variant="caption" display="block" gutterBottom>
              Always visible, can mini
            </Typography>
            <Box
              sx={{ display: 'flex', height: 400, border: '1px solid #ddd' }}
            >
              <Drawer state="mini" variant="permanent" showToggleButton={false}>
                <SampleMenuContent />
              </Drawer>
              <Box sx={{ flexGrow: 1, p: 2, bgcolor: 'grey.100' }}>
                <Typography variant="body2">Main Content</Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  },
};

/**
 * Interactive example with state control
 */
export const Interactive: Story = {
  render: (args) => {
    const [state, setState] = useState<DrawerState>('open');

    return (
      <Box sx={{ display: 'flex', height: '600px' }}>
        <Drawer
          {...args}
          state={state}
          onStateChange={setState}
          header={<Typography variant="h6">My App</Typography>}
        >
          <SampleMenuContent />
        </Drawer>

        <Box sx={{ flexGrow: 1, p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Main Content Area
          </Typography>
          <Typography paragraph>
            Current drawer state: <strong>{state}</strong>
          </Typography>
          <Typography paragraph>
            Click the toggle button in the drawer to switch between states.
          </Typography>
          <Typography>
            In <strong>persistent</strong> mode, the drawer pushes the main
            content.
          </Typography>
        </Box>
      </Box>
    );
  },
  args: {
    variant: 'persistent',
  },
};

/**
 * Application layout example with AppBar
 */
export const ApplicationLayout: Story = {
  render: () => {
    const [state, setState] = useState<DrawerState>('open');

    return (
      <Box sx={{ display: 'flex', height: '600px' }}>
        <AppBar
          position="fixed"
          sx={{
            zIndex: (theme) => theme.zIndex.drawer + 1,
          }}
        >
          <Toolbar>
            <Typography variant="h6" noWrap component="div">
              Dashboard Application
            </Typography>
          </Toolbar>
        </AppBar>

        <Drawer
          state={state}
          variant="permanent"
          onStateChange={setState}
          header={
            <Box sx={{ mt: 8 }}>
              <Typography variant="h6">Navigation</Typography>
            </Box>
          }
        >
          <SampleMenuContent />
        </Drawer>

        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Toolbar />
          <Typography variant="h4" gutterBottom>
            Welcome to Dashboard
          </Typography>
          <Typography paragraph>
            This is an example of a complete application layout with permanent
            drawer and top AppBar.
          </Typography>
          <Typography>
            Current drawer state: <strong>{state}</strong>
          </Typography>
        </Box>
      </Box>
    );
  },
};
