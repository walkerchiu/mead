import type { Meta, StoryObj } from '@storybook/nextjs';
import { FormSkeleton } from './FormSkeleton';
import Box from '@mui/material/Box';

/**
 * FormSkeleton is the loading skeleton component for form components.
 *
 * ## When to Use
 * - When form is loading
 * - During authentication forms loading
 * - During settings page forms loading
 * - Any form that requires data fetching before display
 *
 * ## Features
 * - Configurable number of input fields
 * - Optional title and subtitle
 * - Optional submit button
 * - Optional form links (e.g., forgot password)
 * - Material UI Skeleton animation
 *
 * ## Best Practices
 * - Match the skeleton structure with actual form layout
 * - Use same number of fields as actual form
 * - Show/hide elements consistently with actual form
 * - Display during initial load and data fetching
 */
const meta = {
  title: 'Shared/Atoms/Skeleton/FormSkeleton',
  component: FormSkeleton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Form loading skeleton that simulates various form structures, providing visual feedback during form loading.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    fields: {
      control: { type: 'number', min: 1, max: 10 },
      description: 'Number of input fields to display',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '2' },
      },
    },
    showTitle: {
      control: 'boolean',
      description: 'Whether to display title skeleton',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    showSubtitle: {
      control: 'boolean',
      description: 'Whether to display subtitle skeleton',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    showButton: {
      control: 'boolean',
      description: 'Whether to display submit button skeleton',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    showLinks: {
      control: 'boolean',
      description: 'Whether to display link skeleton (e.g., forgot password)',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
  },
} satisfies Meta<typeof FormSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default display
 * Standard form skeleton with 2 fields
 */
export const Default: Story = {
  args: {},
};

/**
 * Minimal form
 * Only fields and button, no title or subtitle
 */
export const MinimalForm: Story = {
  args: {
    fields: 2,
    showTitle: false,
    showSubtitle: false,
    showButton: true,
    showLinks: false,
  },
};

/**
 * With links
 * Form with additional links (e.g., forgot password, sign up)
 */
export const WithLinks: Story = {
  args: {
    fields: 2,
    showTitle: true,
    showSubtitle: true,
    showButton: true,
    showLinks: true,
  },
};

/**
 * Many fields
 * Form with multiple input fields (e.g., registration form)
 */
export const ManyFields: Story = {
  args: {
    fields: 5,
    showTitle: true,
    showSubtitle: true,
    showButton: true,
    showLinks: false,
  },
};

/**
 * Without button
 * Form without submit button (e.g., auto-save form)
 */
export const WithoutButton: Story = {
  args: {
    fields: 3,
    showTitle: true,
    showSubtitle: false,
    showButton: false,
    showLinks: false,
  },
};

/**
 * Login form simulation
 * Typical login form structure (email + password)
 */
export const LoginForm: Story = {
  args: {
    fields: 2,
    showTitle: true,
    showSubtitle: true,
    showButton: true,
    showLinks: true,
  },
};

/**
 * Signup form simulation
 * Typical registration form structure
 */
export const SignupForm: Story = {
  args: {
    fields: 4,
    showTitle: true,
    showSubtitle: true,
    showButton: true,
    showLinks: true,
  },
};

/**
 * Single field form
 * Simple form with only one input (e.g., email subscription)
 */
export const SingleField: Story = {
  args: {
    fields: 1,
    showTitle: false,
    showSubtitle: false,
    showButton: true,
    showLinks: false,
  },
};

/**
 * Dark background
 * Display effect on dark background
 */
export const DarkBackground: Story = {
  args: {
    fields: 2,
    showTitle: true,
    showSubtitle: true,
    showButton: true,
    showLinks: true,
  },
  decorators: [
    (Story) => (
      <Box
        sx={{
          bgcolor: '#121212',
          p: 4,
          borderRadius: 2,
          minHeight: '600px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Story />
      </Box>
    ),
  ],
};

/**
 * Light background
 * Display effect on light background
 */
export const LightBackground: Story = {
  args: {
    fields: 2,
    showTitle: true,
    showSubtitle: true,
    showButton: true,
    showLinks: false,
  },
  decorators: [
    (Story) => (
      <Box
        sx={{
          bgcolor: '#f5f5f5',
          p: 4,
          borderRadius: 2,
          minHeight: '600px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Story />
      </Box>
    ),
  ],
};

/**
 * Multiple forms
 * Show multiple form skeletons (e.g., multi-step forms)
 */
export const MultipleForms: Story = {
  render: () => (
    <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
      <Box>
        <h3 style={{ textAlign: 'center', marginBottom: 16 }}>Step 1</h3>
        <FormSkeleton fields={2} />
      </Box>
      <Box>
        <h3 style={{ textAlign: 'center', marginBottom: 16 }}>Step 2</h3>
        <FormSkeleton fields={3} />
      </Box>
      <Box>
        <h3 style={{ textAlign: 'center', marginBottom: 16 }}>Step 3</h3>
        <FormSkeleton fields={2} showLinks={true} />
      </Box>
    </Box>
  ),
};

/**
 * All variants comparison
 * Show all configuration variants side by side
 */
export const AllVariants: Story = {
  render: () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Box>
        <h3 style={{ marginBottom: 16 }}>Default (2 fields, all elements)</h3>
        <FormSkeleton />
      </Box>
      <Box>
        <h3 style={{ marginBottom: 16 }}>Minimal (no title/subtitle)</h3>
        <FormSkeleton showTitle={false} showSubtitle={false} />
      </Box>
      <Box>
        <h3 style={{ marginBottom: 16 }}>With Links</h3>
        <FormSkeleton showLinks={true} />
      </Box>
      <Box>
        <h3 style={{ marginBottom: 16 }}>Many Fields (5 fields)</h3>
        <FormSkeleton fields={5} />
      </Box>
      <Box>
        <h3 style={{ marginBottom: 16 }}>Without Button</h3>
        <FormSkeleton showButton={false} />
      </Box>
    </Box>
  ),
  parameters: {
    layout: 'padded',
  },
};
