import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';
import { CodeInput } from './CodeInput';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';

/**
 * CodeInput is a component specifically designed for verification code input.
 *
 * ## Features
 * - Auto-focus to next input box
 * - Support pasting complete verification code
 * - Backspace auto-returns to previous box
 * - Only allow numeric input
 * - Auto-trigger callback on completion
 *
 * ## Use Cases
 * - 2FA two-factor authentication
 * - Email or SMS verification code
 * - Password reset verification
 */
const meta = {
  title: 'HQ Scope/Atoms/CodeInput',
  component: CodeInput,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Component designed for verification code input, providing smooth input experience.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ minWidth: '500px', padding: '20px' }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    length: {
      control: { type: 'number', min: 4, max: 8 },
      description: 'Verification code length',
    },
    error: {
      control: 'boolean',
      description: 'Whether to show error state',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether to disable input',
    },
    onChange: {
      description: 'Callback when verification code changes',
    },
    onComplete: {
      description: 'Callback when input is complete',
    },
  },
} satisfies Meta<typeof CodeInput>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic usage
 * 6-digit verification code input
 */
export const Default: Story = {
  render: function DefaultExample() {
    const [code, setCode] = useState('');

    return (
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          6-digit verification code
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Most common verification code length, used for email or SMS
          verification
        </Typography>

        <CodeInput length={6} value={code} onChange={setCode} />

        <Alert severity="info" sx={{ mt: 2, textAlign: 'left' }}>
          <Typography variant="body2">
            <strong>Current Input:</strong>
            {code || '(not entered yet)'}
            <br />
            <strong>Length:</strong>
            {code.length} / 6<br />
            <strong>Example:</strong>Try entering 123456
          </Typography>
        </Alert>
      </Box>
    );
  },
};

/**
 * 4-digit verification code
 * Shorter verification code (e.g., PIN code)
 */
export const FourDigits: Story = {
  render: function FourDigitsExample() {
    const [code, setCode] = useState('');

    return (
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          4-digit verification code
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Shorter verification code, commonly used for ATM PIN, phone unlock
        </Typography>

        <CodeInput length={4} value={code} onChange={setCode} />

        <Alert severity="info" sx={{ mt: 2, textAlign: 'left' }}>
          <Typography variant="body2">
            <strong>Current Input:</strong>
            {code || '(not entered yet)'}
            <br />
            <strong>Length:</strong>
            {code.length} / 4<br />
            <strong>Example:</strong>Try entering 1234
          </Typography>
        </Alert>
      </Box>
    );
  },
};

/**
 * 8-digit verification code
 * Longer verification code
 */
export const EightDigits: Story = {
  render: function EightDigitsExample() {
    const [code, setCode] = useState('');

    return (
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          8-digit verification code
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Longer verification code, provides higher security, used for sensitive
          operations
        </Typography>

        <CodeInput length={8} value={code} onChange={setCode} />

        <Alert severity="info" sx={{ mt: 2, textAlign: 'left' }}>
          <Typography variant="body2">
            <strong>Current Input:</strong>
            {code || '(not entered yet)'}
            <br />
            <strong>Length:</strong>
            {code.length} / 8<br />
            <strong>Example:</strong>Try entering 12345678
          </Typography>
        </Alert>
      </Box>
    );
  },
};

/**
 * Error state
 * Display red border when verification fails
 */
export const Error: Story = {
  args: {
    length: 6,
    error: true,
    value: '123456',
  },
};

/**
 * Disabled state
 * Input boxes are not editable
 */
export const Disabled: Story = {
  args: {
    length: 6,
    disabled: true,
    value: '123456',
  },
};

/**
 * Interactive Example
 * Demonstrate callback after completion
 */
export const Interactive: Story = {
  render: function InteractiveCodeInput() {
    const [code, setCode] = useState('');
    const [completed, setCompleted] = useState(false);

    const handleComplete = (value: string) => {
      setCompleted(true);
      console.log('Verification code input complete:', value);
    };

    return (
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          Enter 6-digit verification code
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Verification code has been sent to your email
        </Typography>

        <CodeInput
          length={6}
          value={code}
          onChange={setCode}
          onComplete={handleComplete}
        />

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Current Input: {code || '(not entered yet)'}
        </Typography>

        {completed && (
          <Alert severity="success" sx={{ mt: 2 }}>
            Verification code input complete!
          </Alert>
        )}
      </Box>
    );
  },
};

/**
 * Verification Flow Example
 * Complete verification code input and verification flow
 */
export const VerificationFlow: Story = {
  render: function VerificationFlowExample() {
    const [code, setCode] = useState('');
    const [status, setStatus] = useState<
      'idle' | 'verifying' | 'success' | 'error'
    >('idle');
    const correctCode = '123456';

    const handleComplete = (value: string) => {
      setStatus('verifying');

      // Simulate API verification
      setTimeout(() => {
        if (value === correctCode) {
          setStatus('success');
        } else {
          setStatus('error');
          setCode(''); // Clear incorrect verification code
        }
      }, 1000);
    };

    return (
      <Box sx={{ textAlign: 'center', width: '400px' }}>
        <Typography variant="h6" gutterBottom>
          Two-Factor Authentication
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Enter the 6-digit verification code sent to your email
        </Typography>

        <CodeInput
          length={6}
          value={code}
          onChange={setCode}
          onComplete={handleComplete}
          error={status === 'error'}
          disabled={status === 'verifying' || status === 'success'}
        />

        <Box sx={{ mt: 2, minHeight: '60px' }}>
          {status === 'idle' && (
            <Typography variant="caption" color="text.secondary">
              Hint: The correct verification code is {correctCode}
            </Typography>
          )}

          {status === 'verifying' && (
            <Alert severity="info">Verifying...</Alert>
          )}

          {status === 'success' && (
            <Alert severity="success">Verification successful!</Alert>
          )}

          {status === 'error' && (
            <Alert severity="error">
              Verification code is incorrect, please try again
            </Alert>
          )}
        </Box>
      </Box>
    );
  },
};

/**
 * Paste Test
 * Test the paste complete verification code feature
 */
export const PasteTest: Story = {
  render: function PasteTestExample() {
    const [code, setCode] = useState('');

    return (
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          Paste Test
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Try copying this verification code and pasting it into the input box:
          <strong>789012</strong>
        </Typography>

        <CodeInput length={6} value={code} onChange={setCode} />

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Current value: {code || '(not entered yet)'}
        </Typography>
      </Box>
    );
  },
};
