import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { PasswordField } from './PasswordField';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';

/**
 * PasswordField is a component specifically designed for password input.
 *
 * ## Features
 * - Show/hide password toggle
 * - Password strength indicator (optional)
 * - Automatic password strength calculation
 * - Supports all TextField properties
 *
 * ## Password Strength Scoring Rules
 * - Length ≥ 8: +25 points
 * - Length ≥ 12: +10 points
 * - Length ≥ 16: +10 points
 * - Contains lowercase letters: +15 points
 * - Contains uppercase letters: +15 points
 * - Contains numbers: +15 points
 * - Contains special characters: +10 points
 */
const meta = {
  title: 'Molecules/PasswordField',
  component: PasswordField,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Component designed for password input, providing show/hide toggle and password strength indication.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    showStrength: {
      control: 'boolean',
      description: 'Whether to show password strength indicator',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '400px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PasswordField>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic Usage
 * Simplest password input field
 */
export const Default: Story = {
  args: {
    label: 'Password',
    placeholder: 'Enter password',
  },
};

/**
 * With Strength Indicator
 * Shows password strength visual feedback
 */
export const WithStrength: Story = {
  args: {
    label: 'Password',
    placeholder: 'Enter password',
    showStrength: true,
    helperText:
      'At least 8 characters, including uppercase, lowercase letters and numbers',
  },
};

/**
 * Required Field
 */
export const Required: Story = {
  args: {
    label: 'Password',
    required: true,
    showStrength: true,
  },
};

/**
 * Error State
 */
export const Error: Story = {
  args: {
    label: 'Password',
    defaultValue: '123',
    error: true,
    helperText: 'Password is too weak, please use a stronger password',
    showStrength: true,
  },
};

/**
 * Disabled State
 */
export const Disabled: Story = {
  args: {
    label: 'Password',
    defaultValue: 'MyPassword123!',
    disabled: true,
  },
};

/**
 * Interactive Example
 * Shows real-time password strength changes
 */
export const Interactive: Story = {
  render: function InteractiveExample() {
    const [password, setPassword] = useState('');

    return (
      <Stack spacing={2}>
        <Typography variant="h6">Set Password</Typography>
        <Typography variant="body2" color="text.secondary">
          Try entering different passwords to see strength changes
        </Typography>

        <PasswordField
          label="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          showStrength
          helperText="At least 8 characters"
        />

        <Typography variant="caption" color="text.secondary">
          Current length: {password.length} characters
        </Typography>
      </Stack>
    );
  },
};

/**
 * Password Strength Examples
 * Demonstrates different strength passwords
 */
export const StrengthExamples: Story = {
  render: () => (
    <Stack spacing={3}>
      <div>
        <Typography variant="subtitle2" gutterBottom>
          Weak Password
        </Typography>
        <PasswordField label="Password" defaultValue="abc123" showStrength />
      </div>

      <div>
        <Typography variant="subtitle2" gutterBottom>
          Medium Password
        </Typography>
        <PasswordField label="Password" defaultValue="Abc12345" showStrength />
      </div>

      <div>
        <Typography variant="subtitle2" gutterBottom>
          Strong Password
        </Typography>
        <PasswordField
          label="Password"
          defaultValue="MyPassword123"
          showStrength
        />
      </div>

      <div>
        <Typography variant="subtitle2" gutterBottom>
          Very Strong Password
        </Typography>
        <PasswordField
          label="Password"
          defaultValue="MyP@ssw0rd!2024"
          showStrength
        />
      </div>
    </Stack>
  ),
};

/**
 * Registration Form Example
 * Includes password and confirm password
 */
export const RegisterForm: Story = {
  render: function RegisterFormExample() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const handleConfirmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setConfirmPassword(value);

      if (value && value !== password) {
        setError('Passwords do not match');
      } else {
        setError('');
      }
    };

    return (
      <Stack spacing={2}>
        <Typography variant="h6">Create New Account</Typography>

        <PasswordField
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          showStrength
          helperText="At least 8 characters, including uppercase, lowercase letters and numbers"
          required
        />

        <PasswordField
          label="Confirm Password"
          value={confirmPassword}
          onChange={handleConfirmChange}
          error={Boolean(error)}
          helperText={error || 'Please enter password again'}
          required
        />
      </Stack>
    );
  },
};

/**
 * Password Requirements Tooltip
 * Shows password rules checklist
 */
export const WithRequirements: Story = {
  render: function WithRequirementsExample() {
    const [password, setPassword] = useState('');

    const requirements = [
      { label: 'At least 8 characters', met: password.length >= 8 },
      { label: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
      { label: 'Contains lowercase letter', met: /[a-z]/.test(password) },
      { label: 'Contains number', met: /\d/.test(password) },
      {
        label: 'Contains special character',
        met: /[^a-zA-Z\d]/.test(password),
      },
    ];

    return (
      <Stack spacing={2}>
        <Typography variant="h6">Set Password</Typography>

        <PasswordField
          label="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          showStrength
        />

        <List dense>
          <Typography variant="subtitle2" gutterBottom>
            Password must meet the following requirements:
          </Typography>
          {requirements.map((req, index) => (
            <ListItem key={index} sx={{ py: 0 }}>
              <ListItemText
                primary={req.label}
                primaryTypographyProps={{
                  variant: 'caption',
                  color: req.met ? 'success.main' : 'text.secondary',
                  sx: { fontWeight: req.met ? 600 : 400 },
                }}
              />
              <Typography
                variant="caption"
                color={req.met ? 'success.main' : 'text.disabled'}
              >
                {req.met ? '✓' : '○'}
              </Typography>
            </ListItem>
          ))}
        </List>
      </Stack>
    );
  },
};
