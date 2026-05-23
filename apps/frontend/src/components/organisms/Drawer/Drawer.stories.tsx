import type { Meta, StoryObj } from '@storybook/nextjs';
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
 * Drawer - Atomic Design: Organism
 *
 * A flexible drawer/sidebar component that supports three display states and three behavior modes.
 * Perfect for navigation sidebars, settings panels, and collapsible content areas in responsive applications.
 *
 * ## Key Features
 *
 * - **Three Variants**: temporary (overlay), persistent (push content), permanent (always visible)
 * - **Three States**: closed, mini (icon-only), open (full width)
 * - **Smooth Transitions**: Animated state changes with Material-UI transitions
 * - **Responsive**: Automatically adapts layout based on variant
 * - **Customizable**: Custom widths, header, footer, and toggle button
 *
 * ## When to Use
 *
 * - **temporary**: Mobile navigation menus, modal-like side panels
 * - **persistent**: Desktop application sidebars that can be toggled
 * - **permanent**: Always-visible navigation in desktop dashboards
 *
 * ## Behavior Details
 *
 * **States**:
 * - `closed`: Completely hidden (temporary and persistent only)
 * - `mini`: Collapsed view showing only icons (56-80px wide)
 * - `open`: Fully expanded showing complete content (240-320px wide)
 *
 * **Variants**:
 * - `temporary`: Overlays content, dismissible by clicking outside or close button
 * - `persistent`: Pushes main content aside, toggleable via button
 * - `permanent`: Always visible, can switch between open and mini states
 *
 * ## Common Use Cases
 *
 * - Application navigation sidebar
 * - Dashboard side panels
 * - Settings and configuration panels
 * - Document outline viewers
 * - Multi-level navigation menus
 */
const meta = {
  title: 'HQ Scope/Organisms/Drawer',
  component: Drawer,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A flexible drawer/sidebar component with support for three behavioral modes (temporary, persistent, permanent) and three display states (closed, mini, open). Perfect for responsive navigation and collapsible side panels.',
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
 * Default persistent drawer - starts closed, toggle to open.
 *
 * The persistent drawer pushes the main content aside when open. Use the Controls panel
 * below to change the state to 'open' or 'mini'. This is the most common variant for desktop applications.
 *
 * **Note**: Switch to Canvas view above to interact with this example.
 */
export const Default: Story = {
  render: (args) => (
    <Box
      sx={{
        display: 'flex',
        height: '500px',
        border: '1px solid #ddd',
        overflow: 'hidden',
      }}
    >
      <Drawer {...args}>
        <SampleMenuContent />
      </Drawer>
      <Box sx={{ flexGrow: 1, p: 3, bgcolor: 'grey.50' }}>
        <Typography variant="h5">Main Content</Typography>
        <Typography>
          Persistent drawer example. Use the Controls below to change the state.
        </Typography>
      </Box>
    </Box>
  ),
  args: {
    state: 'closed',
    variant: 'persistent',
    header: <Typography variant="h6">My App</Typography>,
  },
  parameters: {
    layout: 'padded',
    docs: {
      canvas: {
        sourceState: 'shown',
      },
    },
  },
};

/**
 * Mini (collapsed) state showing only icons.
 *
 * In mini state, the drawer displays a narrow column with icons only, saving screen space
 * while keeping navigation accessible. Perfect for maximizing content area on desktop.
 *
 * **Note**: Switch to Canvas view above to see the full example.
 */
export const Mini: Story = {
  render: (args) => (
    <Box
      sx={{
        display: 'flex',
        height: '500px',
        border: '1px solid #ddd',
        overflow: 'hidden',
      }}
    >
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
  parameters: {
    layout: 'padded',
    docs: {
      story: {
        inline: false,
        iframeHeight: 550,
      },
    },
  },
};

/**
 * Temporary drawer (mobile style) - starts closed.
 *
 * The temporary drawer slides over the content like a modal. Use the Controls below to set
 * state to 'open' to see it appear. Can be dismissed by clicking outside. Ideal for mobile navigation menus.
 *
 * **Note**: Switch to Canvas view above to interact with this example.
 */
export const Temporary: Story = {
  render: (args) => (
    <Box
      sx={{
        position: 'relative',
        height: '500px',
        border: '1px solid #ddd',
        overflow: 'hidden',
      }}
    >
      <Drawer {...args}>
        <SampleMenuContent />
      </Drawer>
      <Box sx={{ p: 3, bgcolor: 'grey.50', height: '100%' }}>
        <Typography variant="h5">Main Content</Typography>
        <Typography>
          Temporary drawer example. Use the Controls below to open it.
        </Typography>
      </Box>
    </Box>
  ),
  args: {
    state: 'closed',
    variant: 'temporary',
    header: <Typography variant="h6">My App</Typography>,
  },
  parameters: {
    layout: 'padded',
    docs: {
      story: {
        inline: false,
        iframeHeight: 550,
      },
    },
  },
};

/**
 * Permanent drawer - starts in mini state.
 *
 * The permanent drawer is always visible and cannot be completely closed. It can toggle
 * between open and mini states. Use the Controls below to switch to 'open' state.
 * Best for desktop dashboards with persistent navigation.
 *
 * **Note**: Switch to Canvas view above to interact with this example.
 */
export const Permanent: Story = {
  render: (args) => (
    <Box
      sx={{
        display: 'flex',
        height: '500px',
        border: '1px solid #ddd',
        overflow: 'hidden',
      }}
    >
      <Drawer {...args}>
        <SampleMenuContent />
      </Drawer>
      <Box sx={{ flexGrow: 1, p: 3, bgcolor: 'grey.50' }}>
        <Typography variant="h5">Main Content</Typography>
        <Typography>
          Permanent drawer example. Use the Controls below to expand it.
        </Typography>
      </Box>
    </Box>
  ),
  args: {
    state: 'mini',
    variant: 'permanent',
    header: <Typography variant="h6">My App</Typography>,
  },
  parameters: {
    layout: 'padded',
    docs: {
      story: {
        inline: false,
        iframeHeight: 550,
      },
    },
  },
};

/**
 * Right-anchored drawer - starts closed.
 *
 * The drawer can be anchored to the right side of the screen instead of the left.
 * Use the Controls below to set state to 'open' or 'mini'.
 * Useful for settings panels, filters, or secondary navigation.
 */
export const RightAnchor: Story = {
  render: (args) => (
    <Box
      sx={{
        display: 'flex',
        height: '500px',
        border: '1px solid #ddd',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ flexGrow: 1, p: 3, bgcolor: 'grey.50' }}>
        <Typography variant="h5">Main Content</Typography>
        <Typography>
          Right-anchored drawer example. Use the Controls below to open it.
        </Typography>
      </Box>
      <Drawer {...args}>
        <SampleMenuContent />
      </Drawer>
    </Box>
  ),
  args: {
    state: 'closed',
    variant: 'persistent',
    anchor: 'right',
    header: <Typography variant="h6">Settings</Typography>,
  },
  parameters: {
    layout: 'padded',
    docs: {
      story: {
        inline: false,
        iframeHeight: 550,
      },
    },
  },
};

/**
 * Drawer with custom widths - starts in mini state.
 *
 * You can customize both the open width and mini width to fit your design needs.
 * This example shows a wider drawer (320px open, 80px mini). Use the Controls below to expand it.
 */
export const CustomWidth: Story = {
  render: (args) => (
    <Box
      sx={{
        display: 'flex',
        height: '500px',
        border: '1px solid #ddd',
        overflow: 'hidden',
      }}
    >
      <Drawer {...args}>
        <SampleMenuContent />
      </Drawer>
      <Box sx={{ flexGrow: 1, p: 3, bgcolor: 'grey.50' }}>
        <Typography variant="h5">Main Content</Typography>
        <Typography>
          Custom width drawer (320px open, 80px mini). Use the Controls below.
        </Typography>
      </Box>
    </Box>
  ),
  args: {
    state: 'mini',
    variant: 'persistent',
    width: 320,
    miniWidth: 80,
    header: <Typography variant="h6">Wide Drawer</Typography>,
  },
  parameters: {
    layout: 'padded',
    docs: {
      story: {
        inline: false,
        iframeHeight: 550,
      },
    },
  },
};

/**
 * Drawer with custom header and footer - starts in mini state.
 *
 * Add custom header content (like app name, logo) and footer content (like version info,
 * copyright) to create a complete branded navigation experience. Use the Controls below to expand.
 */
export const WithHeaderFooter: Story = {
  render: (args) => (
    <Box
      sx={{
        display: 'flex',
        height: '500px',
        border: '1px solid #ddd',
        overflow: 'hidden',
      }}
    >
      <Drawer {...args}>
        <SampleMenuContent />
      </Drawer>
      <Box sx={{ flexGrow: 1, p: 3, bgcolor: 'grey.50' }}>
        <Typography variant="h5">Main Content</Typography>
        <Typography>
          Drawer with custom header and footer. Use the Controls below.
        </Typography>
      </Box>
    </Box>
  ),
  args: {
    state: 'mini',
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
  parameters: {
    layout: 'padded',
    docs: {
      story: {
        inline: false,
        iframeHeight: 550,
      },
    },
  },
};

/**
 * Side-by-side comparison of all three drawer variants.
 *
 * This example demonstrates the visual and behavioral differences between temporary,
 * persistent, and permanent drawers to help you choose the right variant for your use case.
 */
export const VariantComparison: Story = {
  render: () => {
    return (
      <Box sx={{ border: '1px solid #ddd', p: 2 }}>
        <Typography variant="h5" gutterBottom>
          Drawer Variants Comparison
        </Typography>

        <Box sx={{ display: 'flex', gap: 4 }}>
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
  parameters: {
    layout: 'padded',
    docs: {
      story: {
        inline: false,
        iframeHeight: 550,
      },
    },
  },
};

/**
 * Interactive example with state control - fully functional.
 *
 * This example starts in mini state. Click the toggle button inside the drawer (arrow icon)
 * to switch between open and mini states. This demonstrates how the drawer integrates with
 * your application state management. The current state is displayed in the main content area.
 */
export const Interactive: Story = {
  render: (args) => {
    const [state, setState] = useState<DrawerState>('mini');

    return (
      <Box
        sx={{
          display: 'flex',
          height: '600px',
          border: '1px solid #ddd',
          overflow: 'hidden',
        }}
      >
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
            Click the toggle button (arrow icon) in the drawer to switch between
            states.
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
  parameters: {
    layout: 'padded',
    docs: {
      story: {
        inline: false,
        iframeHeight: 650,
      },
    },
  },
};

/**
 * Complete application layout with AppBar and permanent drawer - fully functional.
 *
 * This example shows a real-world dashboard layout combining a top AppBar with a permanent
 * drawer navigation. The drawer starts in mini state. Click the toggle button (arrow icon)
 * inside the drawer to expand it. This is a common pattern for hq dashboards and web applications.
 */
export const ApplicationLayout: Story = {
  render: () => {
    const [state, setState] = useState<DrawerState>('mini');

    return (
      <Box
        sx={{
          display: 'flex',
          height: '600px',
          border: '1px solid #ddd',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <AppBar
          position="absolute"
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
            Complete application layout with permanent drawer and top AppBar.
            Click the arrow icon in the drawer to toggle it.
          </Typography>
          <Typography>
            Current drawer state: <strong>{state}</strong>
          </Typography>
        </Box>
      </Box>
    );
  },
  parameters: {
    layout: 'padded',
    docs: {
      story: {
        inline: false,
        iframeHeight: 650,
      },
    },
  },
};
