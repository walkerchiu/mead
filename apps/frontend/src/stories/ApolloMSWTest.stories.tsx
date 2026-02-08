import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import { graphql, HttpResponse } from 'msw';
import { MOCK_PASSWORD } from '../mocks/fixtures/users';

// Simple login mutation for testing
const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      ... on AuthResponse {
        accessToken
        user {
          id
          email
          name
        }
      }
      ... on TwoFactorLoginResponse {
        temporaryToken
        message
      }
    }
  }
`;

/**
 * Test component: Simple login form
 * Used to verify Apollo Client + MSW integration
 */
function TestLoginForm() {
  const [email, setEmail] = useState('customer@example.com');
  const [password, setPassword] = useState(MOCK_PASSWORD);
  const [result, setResult] = useState<string>('');

  const [login, { loading, error }] = useMutation(LOGIN_MUTATION);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult('');

    try {
      const response = await login({
        variables: { email, password },
      });

      const data = response.data?.login;

      if (data.__typename === 'AuthResponse') {
        setResult(`✅ Login successful! User: ${data.user.email}`);
      } else if (data.__typename === 'TwoFactorLoginResponse') {
        setResult(`🔐 2FA verification required: ${data.message}`);
      }
    } catch (err: any) {
      setResult(`❌ Error: ${err.message}`);
    }
  };

  return (
    <Box sx={{ maxWidth: 400, p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Test Login Form
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        This form uses Apollo Client + MSW to mock GraphQL API
      </Typography>

      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            size="small"
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            size="small"
          />
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            fullWidth
          >
            {loading ? 'Logging in...' : 'login'}
          </Button>

          {error && <Alert severity="error">{error.message}</Alert>}

          {result && (
            <Alert
              severity={
                result.includes('✅')
                  ? 'success'
                  : result.includes('🔐')
                    ? 'info'
                    : 'error'
              }
            >
              {result}
            </Alert>
          )}
        </Stack>
      </form>

      <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
        <Typography variant="caption" display="block" gutterBottom>
          <strong>Test Accounts:</strong>
        </Typography>
        <Typography variant="caption" display="block">
          • customer@example.com / {MOCK_PASSWORD} (without 2FA)
        </Typography>
        <Typography variant="caption" display="block">
          • customer2fa@example.com / {MOCK_PASSWORD} (with 2FA enabled)
        </Typography>
        <Typography variant="caption" display="block">
          • Wrong password will display error message
        </Typography>
      </Box>
    </Box>
  );
}

/**
 * Apollo Client + MSW Integration Test
 *
 * This story demonstrates:
 * 1. Apollo Client correctly configured
 * 2. MSW correctly intercepts GraphQL requests
 * 3. useMutation hook works properly
 * 4. Error handling is correct
 */
const meta = {
  title: 'Example/Apollo + MSW Test',
  component: TestLoginForm,
  parameters: {
    layout: 'centered',
    msw: {
      handlers: [
        // This handler will override the global handler
        graphql.mutation('Login', ({ variables }) => {
          const { email, password } = variables as {
            email: string;
            password: string;
          };

          if (password !== MOCK_PASSWORD) {
            return HttpResponse.json({
              errors: [
                {
                  message: 'Invalid credentials',
                  extensions: { code: 'UNAUTHENTICATED' },
                },
              ],
            });
          }

          if (email === 'customer2fa@example.com') {
            return HttpResponse.json({
              data: {
                login: {
                  __typename: 'TwoFactorLoginResponse',
                  temporaryToken: 'temp-token-123',
                  message: 'Please enter your 2FA code',
                },
              },
            });
          }

          return HttpResponse.json({
            data: {
              login: {
                __typename: 'AuthResponse',
                accessToken: 'mock-access-token',
                user: {
                  id: 'user-1',
                  email,
                  name: 'Test User',
                },
              },
            },
          });
        }),
      ],
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof TestLoginForm>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default state: Shows login form, can test different login scenarios
 */
export const Default: Story = {};

/**
 * login successful（without 2FA）
 * Pre-filled with customer@example.com / Password123!
 */
export const LoginSuccess: Story = {};

/**
 * 2FA verification required
 * Pre-filled with customer2fa@example.com / Password123!
 */
export const LoginWith2FA: Story = {};
