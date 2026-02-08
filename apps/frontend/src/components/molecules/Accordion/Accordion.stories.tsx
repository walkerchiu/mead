import type { Meta, StoryObj } from '@storybook/nextjs';
import { Accordion } from './Accordion';
import { useState } from 'react';
import { Typography, Box } from '@mui/material';

const meta = {
  title: 'Molecules/Accordion',
  component: Accordion,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleItems = [
  {
    title: 'What is React?',
    content: 'React is a JavaScript library for building user interfaces.',
  },
  {
    title: 'What is TypeScript?',
    content:
      'TypeScript is a superset of JavaScript that adds static type checking.',
  },
  {
    title: 'What is Next.js?',
    content:
      'Next.js is a full-stack framework based on React, supporting SSR and SSG.',
  },
];

export const Default: Story = {
  args: {
    items: sampleItems,
  },
};

export const DefaultExpanded: Story = {
  args: {
    items: sampleItems,
    defaultExpanded: 0,
  },
};

export const WithDisabled: Story = {
  args: {
    items: [
      { title: 'Available Item One', content: 'This item can be expanded' },
      {
        title: 'Disabled Item',
        content: 'This item is disabled',
        disabled: true,
      },
      {
        title: 'Available Item Two',
        content: 'This item can also be expanded',
      },
    ],
  },
};

export const Multiple: Story = {
  args: {
    items: sampleItems,
    multiple: true,
  },
};

export const WithSubtitle: Story = {
  args: {
    items: [
      {
        title: 'Personal Information',
        subtitle: 'Manage your basic information',
        content: (
          <Box>
            <Typography>
              Here you can update your name, email, and other information.
            </Typography>
          </Box>
        ),
      },
      {
        title: 'Security Settings',
        subtitle: 'Password and two-factor authentication',
        content: (
          <Box>
            <Typography>
              Change password and enable two-factor authentication to protect
              your account.
            </Typography>
          </Box>
        ),
      },
      {
        title: 'Notification Preferences',
        subtitle: 'Customize your notification settings',
        content: (
          <Box>
            <Typography>
              Choose the types and frequency of notifications you want to
              receive.
            </Typography>
          </Box>
        ),
      },
    ],
  },
};

export const NoGutters: Story = {
  args: {
    items: sampleItems,
    disableGutters: true,
  },
};

export const Square: Story = {
  args: {
    items: sampleItems,
    square: true,
  },
};

export const RichContent: Story = {
  render: () => (
    <Box sx={{ width: '700px' }}>
      <Accordion
        items={[
          {
            title: (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: 'success.main',
                  }}
                />
                <Typography>Completed</Typography>
              </Box>
            ),
            content: (
              <Box>
                <Typography variant="body2" paragraph>
                  This task has been completed.
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Completed at: 2026-02-06 10:30
                </Typography>
              </Box>
            ),
          },
          {
            title: (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: 'warning.main',
                  }}
                />
                <Typography>In Progress</Typography>
              </Box>
            ),
            content: (
              <Box>
                <Typography variant="body2" paragraph>
                  This task is currently in progress.
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Expected completion: 2026-02-07
                </Typography>
              </Box>
            ),
          },
        ]}
      />
    </Box>
  ),
};

export const Controlled: Story = {
  render: () => {
    const [expanded, setExpanded] = useState<number | false>(0);
    return (
      <Box sx={{ width: '600px' }}>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Currently expanded panel: {expanded !== false ? expanded : 'None'}
        </Typography>
        <Accordion
          items={sampleItems}
          expanded={expanded}
          onChange={setExpanded}
        />
      </Box>
    );
  },
};

export const FAQ: Story = {
  args: {
    items: [
      {
        title: 'How do I register an account?',
        content:
          'Click the "Sign Up" button in the top right corner and fill in the required information to complete registration. You will need to provide a valid email address.',
      },
      {
        title: 'What if I forget my password?',
        content:
          'Click the "Forgot Password" link on the login page, enter your email address, and the system will send you a password reset link.',
      },
      {
        title: 'How do I change my personal information?',
        content:
          'After logging in, go to the "Settings" page, click the "Personal Information" tab, and you can edit your information. Remember to save your changes.',
      },
      {
        title: 'What payment methods are supported?',
        content:
          'We support various payment methods including credit cards, debit cards, PayPal, and bank transfers.',
      },
      {
        title: 'How do I contact customer support?',
        content:
          'You can contact us via email at support@example.com or use the live chat feature on the website.',
      },
    ],
    defaultExpanded: 0,
  },
};

export const Documentation: Story = {
  args: {
    items: [
      {
        title: 'Quick Start',
        subtitle: 'Get started in 5 minutes',
        content: (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Installation
            </Typography>
            <Typography
              variant="body2"
              component="pre"
              sx={{ bgcolor: '#f5f5f5', p: 1 }}
            >
              npm install @mui/material
            </Typography>
            <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
              Basic Usage
            </Typography>
            <Typography variant="body2">
              Import the required components and use them in your application.
            </Typography>
          </Box>
        ),
      },
      {
        title: 'API Reference',
        subtitle: 'Complete API documentation',
        content: (
          <Box>
            <Typography variant="body2">
              View the complete API documentation to learn about all available
              properties and methods.
            </Typography>
          </Box>
        ),
      },
      {
        title: 'Examples',
        subtitle: 'Practical usage examples',
        content: (
          <Box>
            <Typography variant="body2">
              Browse various practical examples to learn how to use components
              in different scenarios.
            </Typography>
          </Box>
        ),
      },
    ],
  },
};
