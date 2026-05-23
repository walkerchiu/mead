import Stack from '@mui/material/Stack';
import type { Meta, StoryObj } from '@storybook/nextjs';
import { TextArea } from './TextArea';

/**
 * TextArea is a multiline text input component for entering longer text content.
 *
 * ## When to Use
 * - Comments and feedback
 * - Descriptions and notes
 * - Messages and content creation
 * - Any text input requiring multiple lines
 *
 * ## Best Practices
 * - Always provide a clear label
 * - Set appropriate number of rows based on expected content length
 * - Use helperText for character limits or instructions
 * - Show specific error messages when validation fails
 */
const meta = {
  title: 'HQ Scope/Atoms/Fields/TextArea',
  component: TextArea,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Specialized multiline text input component built on MUI TextField, optimized for textarea use cases.',
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
      description: 'Label for the textarea',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text for the textarea',
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
      description: 'Whether textarea is disabled',
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
      description: 'Size of the textarea',
    },
    rows: {
      control: 'number',
      description: 'Number of rows to display',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '500px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TextArea>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic usage
 * Simple multiline text input
 */
export const Default: Story = {
  args: {
    label: 'Description',
    placeholder: 'Enter your description here...',
    rows: 4,
  },
};

/**
 * With default value
 * Shows how textarea displays existing content
 */
export const WithValue: Story = {
  args: {
    label: 'Comments',
    rows: 4,
    defaultValue:
      'This is a sample comment.\nIt supports multiple lines of text.\nYou can add as many lines as you need.',
    helperText: 'Share your thoughts',
  },
};

/**
 * With character limit
 * Displays character count guidance
 */
export const WithCharacterLimit: Story = {
  args: {
    label: 'Bio',
    rows: 5,
    placeholder: 'Tell us about yourself...',
    helperText: 'Maximum 500 characters',
    inputProps: {
      maxLength: 500,
    },
  },
};

/**
 * Required field
 * Marked as required
 */
export const Required: Story = {
  args: {
    label: 'Message',
    required: true,
    rows: 4,
    placeholder: 'Enter your message...',
    helperText: 'This field is required',
  },
};

/**
 * Error state
 * Shows validation error
 */
export const Error: Story = {
  args: {
    label: 'Message',
    rows: 4,
    defaultValue: 'Too short',
    error: true,
    helperText: 'Message must be at least 20 characters',
  },
};

/**
 * Disabled state
 * Non-editable textarea
 */
export const Disabled: Story = {
  args: {
    label: 'Notes',
    rows: 3,
    defaultValue: 'This is a read-only note.\nIt cannot be edited by the user.',
    disabled: true,
    helperText: 'This field is read-only',
  },
};

/**
 * Different row heights
 * Demonstrates various textarea heights
 */
export const DifferentRows: Story = {
  render: () => (
    <Stack spacing={2}>
      <TextArea label="2 Rows" rows={2} placeholder="Compact textarea" />
      <TextArea
        label="4 Rows (Default)"
        rows={4}
        placeholder="Standard textarea"
      />
      <TextArea label="6 Rows" rows={6} placeholder="Larger textarea" />
      <TextArea label="8 Rows" rows={8} placeholder="Extra large textarea" />
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
      <TextArea
        label="Small Size"
        size="small"
        rows={3}
        placeholder="Small size textarea"
      />
      <TextArea
        label="Medium Size"
        size="medium"
        rows={3}
        placeholder="Medium size textarea"
      />
      <TextArea
        label="Large Size"
        size="large"
        rows={3}
        placeholder="Large size textarea"
      />
    </Stack>
  ),
};

/**
 * Auto-expanding textarea
 * Grows with content using minRows and maxRows
 */
export const AutoExpanding: Story = {
  args: {
    label: 'Flexible Notes',
    minRows: 2,
    maxRows: 8,
    placeholder: 'This textarea will expand as you type...',
    helperText: 'Automatically adjusts height based on content',
  },
};

/**
 * Form example
 * Typical feedback form textarea
 */
export const FormExample: Story = {
  render: () => (
    <Stack spacing={2}>
      <TextArea
        label="Feedback"
        required
        rows={6}
        placeholder="Please share your feedback..."
        helperText="Tell us what you think - minimum 50 characters"
      />
      <TextArea
        label="Additional Comments"
        rows={4}
        placeholder="Any other comments? (optional)"
      />
    </Stack>
  ),
};
