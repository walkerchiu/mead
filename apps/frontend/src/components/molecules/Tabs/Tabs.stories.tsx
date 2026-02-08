import type { Meta, StoryObj } from '@storybook/react';
import { Tabs } from './Tabs';
import { useState } from 'react';
import { Box, Typography } from '@mui/material';

const meta = {
  title: 'Molecules/Tabs',
  component: Tabs,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleTabs = [
  {
    label: 'Tab One',
    content: (
      <Box>
        <Typography variant="h6">First Tab Content</Typography>
        <Typography>This is the content of the first tab panel.</Typography>
      </Box>
    ),
  },
  {
    label: 'Tab Two',
    content: (
      <Box>
        <Typography variant="h6">Second Tab Content</Typography>
        <Typography>This is the content of the second tab panel.</Typography>
      </Box>
    ),
  },
  {
    label: 'Tab Three',
    content: (
      <Box>
        <Typography variant="h6">Third Tab Content</Typography>
        <Typography>This is the content of the third tab panel.</Typography>
      </Box>
    ),
  },
];

export const Default: Story = {
  args: {
    tabs: sampleTabs,
  },
};

export const FullWidth: Story = {
  args: {
    tabs: sampleTabs,
    variant: 'fullWidth',
  },
};

export const Centered: Story = {
  args: {
    tabs: sampleTabs,
    centered: true,
  },
};

export const Scrollable: Story = {
  args: {
    tabs: [
      { label: 'Tab One', content: <Typography>Content One</Typography> },
      { label: 'Tab Two', content: <Typography>Content Two</Typography> },
      { label: 'Tab Three', content: <Typography>Content Three</Typography> },
      { label: 'Tab Four', content: <Typography>Content Four</Typography> },
      { label: 'Tab Five', content: <Typography>Content Five</Typography> },
      { label: 'Tab Six', content: <Typography>Content Six</Typography> },
      { label: 'Tab Seven', content: <Typography>Content Seven</Typography> },
      { label: 'Tab Eight', content: <Typography>Content Eight</Typography> },
    ],
    variant: 'scrollable',
  },
};

export const WithDisabled: Story = {
  args: {
    tabs: [
      {
        label: 'Enabled',
        content: <Typography>This tab is enabled</Typography>,
      },
      {
        label: 'Disabled',
        content: <Typography>This tab is disabled</Typography>,
        disabled: true,
      },
      {
        label: 'Enabled',
        content: <Typography>This tab is also enabled</Typography>,
      },
    ],
  },
};

export const SecondaryColor: Story = {
  args: {
    tabs: sampleTabs,
    indicatorColor: 'secondary',
    textColor: 'secondary',
  },
};

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState(0);
    return (
      <Box>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Current tab index: {value}
        </Typography>
        <Tabs tabs={sampleTabs} value={value} onChange={setValue} />
      </Box>
    );
  },
};

export const SettingsTabs: Story = {
  args: {
    tabs: [
      {
        label: 'Profile',
        content: (
          <Box>
            <Typography variant="h6" gutterBottom>
              Profile Settings
            </Typography>
            <Typography>
              Manage your personal information and preferences
            </Typography>
          </Box>
        ),
      },
      {
        label: 'Security',
        content: (
          <Box>
            <Typography variant="h6" gutterBottom>
              Security Settings
            </Typography>
            <Typography>
              Manage your password and two-factor authentication
            </Typography>
          </Box>
        ),
      },
      {
        label: 'Notifications',
        content: (
          <Box>
            <Typography variant="h6" gutterBottom>
              Notification Settings
            </Typography>
            <Typography>Customize your notification preferences</Typography>
          </Box>
        ),
      },
      {
        label: 'Privacy',
        content: (
          <Box>
            <Typography variant="h6" gutterBottom>
              Privacy Settings
            </Typography>
            <Typography>
              Control your privacy and data sharing settings
            </Typography>
          </Box>
        ),
      },
    ],
  },
};

export const Vertical: Story = {
  render: () => (
    <Box sx={{ width: '600px', height: '400px' }}>
      <Tabs
        orientation="vertical"
        tabs={[
          {
            label: 'Overview',
            content: (
              <Box>
                <Typography variant="h6">Overview</Typography>
                <Typography>View system overview and statistics</Typography>
              </Box>
            ),
          },
          {
            label: 'User Management',
            content: (
              <Box>
                <Typography variant="h6">User Management</Typography>
                <Typography>Manage system users and permissions</Typography>
              </Box>
            ),
          },
          {
            label: 'System Settings',
            content: (
              <Box>
                <Typography variant="h6">System Settings</Typography>
                <Typography>Configure system parameters and options</Typography>
              </Box>
            ),
          },
          {
            label: 'Logs',
            content: (
              <Box>
                <Typography variant="h6">Logs</Typography>
                <Typography>View system activity logs</Typography>
              </Box>
            ),
          },
        ]}
      />
    </Box>
  ),
};
