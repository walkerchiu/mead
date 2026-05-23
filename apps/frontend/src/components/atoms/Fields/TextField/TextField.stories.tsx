import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { Meta, StoryObj } from '@storybook/nextjs';
import { TextField } from './TextField';

/**
 * TextField is the basic text input component.
 *
 * ## When to Use
 * - Single-line text input (name, email, phone, etc.)
 * - Password input
 * - Number input
 * - Date selection
 *
 * ## Best Practices
 * - Always provide a clear label
 * - Use helperText to provide additional instructions
 * - Show specific error messages when there are errors
 * - Use appropriate type attribute (email, password, number, etc.)
 */
const meta = {
  title: 'HQ Scope/Atoms/Fields/TextField',
  component: TextField,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Wrapper around MUI TextField providing unified input field styles and behavior.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: false,
      table: {
        disable: true,
      },
    },
    label: {
      control: 'text',
      description: 'Label for the input field',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text for the input field',
    },
    helperText: {
      control: 'text',
      description: 'Helper text or error message',
    },
    error: {
      control: 'boolean',
      description: 'Whether to show error state',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether input field is disabled',
    },
    required: {
      control: 'boolean',
      description: 'Whether field is required',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Whether to span full width of parent container',
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'Size of the input field',
    },
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'url'],
      description: 'Input type',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '400px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic usage
 * Simple text input field
 */
export const Default: Story = {
  args: {
    label: 'Name',
    placeholder: 'Enter your name',
  },
};

/**
 * With helper text
 * Provides additional instructions or hints
 */
export const WithHelperText: Story = {
  args: {
    label: 'Email',
    type: 'email',
    placeholder: 'user@example.com',
    helperText: "We won't share your email address",
  },
};

/**
 * Required field
 * Marked as required using the required attribute
 */
export const Required: Story = {
  args: {
    label: 'Username',
    required: true,
    helperText: 'This field is required',
  },
};

/**
 * Error state
 * Displays validation errors
 */
export const Error: Story = {
  args: {
    label: 'Password',
    type: 'password',
    error: true,
    helperText: 'Password must be at least 8 characters',
    defaultValue: '123',
  },
};

/**
 * Disabled state
 * Input field is not editable
 */
export const Disabled: Story = {
  args: {
    label: 'Email',
    disabled: true,
    defaultValue: 'user@example.com',
    helperText: 'This field cannot be modified',
  },
};

/**
 * Password input
 * Uses password type to hide input content
 */
export const Password: Story = {
  args: {
    label: 'Password',
    type: 'password',
    placeholder: 'Enter password',
    helperText:
      'At least 8 characters, including uppercase, lowercase letters and numbers',
  },
};

/**
 * Number input
 * Uses number type to restrict to numeric input only
 */
export const Number: Story = {
  args: {
    label: 'Age',
    type: 'number',
    helperText: 'Enter your age',
  },
};

/**
 * All input types
 * Demonstrates different input types
 */
export const InputTypes: Story = {
  render: () => (
    <Stack spacing={2}>
      <TextField label="Text" type="text" placeholder="General text" />
      <TextField label="Email" type="email" placeholder="user@example.com" />
      <TextField
        label="Password"
        type="password"
        placeholder="Enter password"
      />
      <TextField label="Phone" type="tel" placeholder="0912-345-678" />
      <TextField label="URL" type="url" placeholder="https://example.com" />
      <TextField label="Number" type="number" defaultValue="42" />
    </Stack>
  ),
};

/**
 * Form example
 * Typical login form fields
 */
export const FormExample: Story = {
  render: () => (
    <Stack spacing={2}>
      <TextField
        label="Email"
        type="email"
        placeholder="user@example.com"
        required
      />
      <TextField
        label="Password"
        type="password"
        placeholder="Enter password"
        required
        helperText="At least 8 characters"
      />
    </Stack>
  ),
};

/**
 * Size variations
 * Small, Medium, and Large sizes
 */
export const Sizes: Story = {
  render: () => (
    <Stack spacing={2}>
      <TextField label="Small Size" size="medium" defaultValue="Small size" />
      <TextField label="Medium Size" size="medium" defaultValue="Medium size" />
      <TextField label="Large Size" size="large" defaultValue="Large size" />
    </Stack>
  ),
};

const TextFieldRow = ({
  size,
  hasValue,
}: {
  size: 'small' | 'medium' | 'large';
  hasValue: boolean;
}) => (
  <Stack spacing={1}>
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '120px repeat(5, 220px)',
        columnGap: 16,
        alignItems: 'center',
      }}
    >
      <Box />
      <Typography variant="caption">Enable</Typography>
      <Typography variant="caption">Hover</Typography>
      <Typography variant="caption">Focus</Typography>
      <Typography variant="caption">Disable</Typography>
      <Typography variant="caption">Error</Typography>
    </Box>
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '120px repeat(5, 220px)',
        columnGap: 16,
        alignItems: 'center',
      }}
    >
      <Typography variant="body2">
        {hasValue ? `${size}, Value=True` : `${size}, Value=False`}
      </Typography>
      <TextField
        size={size}
        label="title"
        placeholder="Input text"
        defaultValue={hasValue ? 'Input text' : undefined}
      />
      <TextField
        size={size}
        label="title"
        placeholder="Input text"
        defaultValue={hasValue ? 'Input text' : undefined}
        className="preview-hover"
      />
      <TextField
        size={size}
        label="title"
        placeholder="Input text"
        defaultValue={hasValue ? 'Input text' : undefined}
        className="preview-focus"
      />
      <TextField
        size={size}
        label="title"
        placeholder="Input text"
        defaultValue={hasValue ? 'Input text' : undefined}
        disabled
      />
      <TextField
        size={size}
        label="title"
        placeholder="Input text"
        defaultValue={hasValue ? 'Input text' : undefined}
        error
        helperText="description"
      />
    </Box>
  </Stack>
);

export const Variants: Story = {
  render: () => (
    <Stack spacing={4}>
      <TextFieldRow size="large" hasValue />
      <TextFieldRow size="medium" hasValue />
      <TextFieldRow size="medium" hasValue />
      <TextFieldRow size="large" hasValue={false} />
      <TextFieldRow size="medium" hasValue={false} />
      <TextFieldRow size="medium" hasValue={false} />
    </Stack>
  ),
};
