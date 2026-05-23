import AddIcon from '@mui/icons-material/Add';
import Stack from '@mui/material/Stack';
import type { Meta, StoryObj } from '@storybook/nextjs';
import { Button } from './Button';

/**
 * Button is the most basic interactive component used to trigger actions.
 *
 * ## When to Use
 * - Submit forms
 * - Trigger dialogs
 * - Navigate to other pages
 * - Execute any user action
 *
 * ## Variant Selection
 * - **contained**: Most important actions (e.g., "Submit", "Confirm")
 * - **outlined**: Secondary actions (e.g., "Cancel", "Back")
 * - **text**: Less important actions (e.g., "Learn More")
 */
const meta = {
  title: 'HQ Scope/Atoms/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Wrapper around MUI Button providing unified button styles and loading state support.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'contained',
        'outlined',
        'text',
        'elevated',
        'tagContained',
        'tagText',
        'iconGradient',
      ],
      description: 'Visual style of the button',
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'Size of the button',
    },
    loading: {
      control: 'boolean',
      description: 'Whether to show loading state',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether button is disabled',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Whether button spans full width of parent container',
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Primary button style (Contained)
 * Used for most important actions, such as form submission, confirmation, etc.
 */
export const Primary: Story = {
  args: {
    children: 'Primary Button',
    variant: 'contained',
    color: 'primary',
  },
};

/**
 * Secondary button style (Outlined)
 * Used for secondary actions, such as cancel, back, etc.
 */
export const Secondary: Story = {
  args: {
    children: 'Secondary Button',
    variant: 'outlined',
    color: 'secondary',
  },
};

/**
 * Text button
 * Used for less important actions
 */
export const Text: Story = {
  args: {
    children: 'Text Button',
    variant: 'text',
  },
};

/**
 * Loading state
 * Displayed when executing asynchronous operations
 */
export const Loading: Story = {
  args: {
    children: 'Processing...',
    loading: true,
  },
};

/**
 * Disabled state
 * When action is temporarily unavailable
 */
export const Disabled: Story = {
  args: {
    children: 'Disabled Button',
    disabled: true,
  },
};

/**
 * Full width button
 * Spans the entire width of parent container
 */
export const FullWidth: Story = {
  args: {
    children: 'Full Width Button',
    fullWidth: true,
  },
  decorators: [
    (Story) => (
      <div style={{ width: '400px' }}>
        <Story />
      </div>
    ),
  ],
};

/**
 * All sizes
 * Three sizes: small, medium, large
 */
export const Sizes: Story = {
  render: () => (
    <Stack direction="row" spacing={2} alignItems="center">
      <Button size="small">Small Button</Button>
      <Button size="medium">Medium Button</Button>
      <Button size="large">Large Button</Button>
    </Stack>
  ),
};

export const Elevated: Story = {
  args: {
    children: 'Button',
    variant: 'elevated',
  },
};

export const TagContained: Story = {
  args: {
    children: 'Button',
    variant: 'tagContained',
  },
};

export const TagText: Story = {
  args: {
    children: 'Button',
    variant: 'tagText',
  },
};

export const IconGradient: Story = {
  args: {
    children: 'Button',
    variant: 'iconGradient',
    startIcon: <AddIcon />,
  },
};

export const WithAddIcon: Story = {
  args: {
    children: 'Button',
    variant: 'contained',
    startIcon: <AddIcon />,
  },
};

/**
 * All variant combinations
 * Contained, Outlined, Text, Elevated, Tag, Icon Gradient
 */
export const Variants: Story = {
  render: () => (
    <Stack spacing={2}>
      <Stack direction="row" spacing={2}>
        <Button variant="contained">Contained</Button>
        <Button variant="outlined">Outlined</Button>
        <Button variant="text">Text</Button>
        <Button variant="elevated">Elevated</Button>
        <Button variant="tagContained">Tag Contained</Button>
        <Button variant="tagText">Tag Text</Button>
        <Button variant="iconGradient" startIcon={<AddIcon />}>
          Icon Gradient
        </Button>
      </Stack>
      <Stack direction="row" spacing={2}>
        <Button variant="contained" color="error">
          Delete
        </Button>
        <Button variant="outlined" color="error">
          Cancel
        </Button>
        <Button variant="text" color="error">
          Learn More
        </Button>
      </Stack>
    </Stack>
  ),
};

/**
 * Form actions example
 * Typical form submit and cancel button combination
 */
export const FormActions: Story = {
  render: () => (
    <Stack direction="row" spacing={2}>
      <Button variant="outlined" color="inherit">
        Cancel
      </Button>
      <Button variant="contained" color="primary">
        Submit
      </Button>
    </Stack>
  ),
};
