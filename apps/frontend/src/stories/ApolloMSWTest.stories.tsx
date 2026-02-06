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
 * 測試組件：簡單的登入表單
 * 用來驗證 Apollo Client + MSW 的集成
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
        setResult(`✅ 登入成功！用戶: ${data.user.email}`);
      } else if (data.__typename === 'TwoFactorLoginResponse') {
        setResult(`🔐 需要 2FA 驗證: ${data.message}`);
      }
    } catch (err: any) {
      setResult(`❌ 錯誤: ${err.message}`);
    }
  };

  return (
    <Box sx={{ maxWidth: 400, p: 3 }}>
      <Typography variant="h5" gutterBottom>
        測試登入表單
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        這個表單使用 Apollo Client + MSW 模擬 GraphQL API
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
            {loading ? '登入中...' : '登入'}
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
          <strong>測試帳號：</strong>
        </Typography>
        <Typography variant="caption" display="block">
          • customer@example.com / {MOCK_PASSWORD} (無 2FA)
        </Typography>
        <Typography variant="caption" display="block">
          • customer2fa@example.com / {MOCK_PASSWORD} (啟用 2FA)
        </Typography>
        <Typography variant="caption" display="block">
          • 錯誤密碼會顯示錯誤訊息
        </Typography>
      </Box>
    </Box>
  );
}

/**
 * Apollo Client + MSW 集成測試
 *
 * 這個 story 展示：
 * 1. Apollo Client 正確配置
 * 2. MSW 正確攔截 GraphQL 請求
 * 3. useMutation hook 正常運作
 * 4. 錯誤處理正確
 */
const meta = {
  title: 'Example/Apollo + MSW Test',
  component: TestLoginForm,
  parameters: {
    layout: 'centered',
    msw: {
      handlers: [
        // 這個 handler 會覆蓋全局的 handler
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
 * 預設狀態：顯示登入表單，可以測試不同的登入情境
 */
export const Default: Story = {};

/**
 * 登入成功（無 2FA）
 * 預填 customer@example.com / Password123!
 */
export const LoginSuccess: Story = {};

/**
 * 需要 2FA 驗證
 * 預填 customer2fa@example.com / Password123!
 */
export const LoginWith2FA: Story = {};
