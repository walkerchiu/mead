import type { Meta, StoryObj } from '@storybook/nextjs';
import React from 'react';
import { DashboardSkeleton } from './DashboardSkeleton';
import Box from '@mui/material/Box';

/**
 * DashboardSkeleton 是儀表板頁面的載入骨架元件。
 *
 * ## 何時使用
 * - 當儀表板頁面載入時
 * - 在受保護頁面進行身分驗證檢查期間
 * - 在取得資料期間
 *
 * ## 功能特性
 * - 模擬 AppBar 與內容區
 * - 包含標題、說明、按鈕骨架
 * - 半透明背景
 * - Material UI Skeleton 動畫
 *
 * ## 最佳實踐
 * - 在 ProtectedRoute 元件中使用
 * - 在資料載入前顯示
 * - 改善頁面載入體驗
 */
const meta = {
  title: 'Shared/Atoms/Skeleton/DashboardSkeleton',
  component: DashboardSkeleton,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          '儀表板頁面載入骨架，模擬完整的 Dashboard 結構，於載入期間提供視覺回饋。',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof DashboardSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 預設顯示
 * 標準的儀表板骨架
 */
export const Default: Story = {};

/**
 * 深色背景
 * 在深色背景上的顯示效果
 */
export const DarkBackground: Story = {
  decorators: [
    (Story) => (
      <Box sx={{ bgcolor: '#121212', minHeight: '100vh' }}>
        <Story />
      </Box>
    ),
  ],
};

/**
 * 淺色背景
 * 在淺色背景上的顯示效果
 */
export const LightBackground: Story = {
  decorators: [
    (Story) => (
      <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh' }}>
        <Story />
      </Box>
    ),
  ],
};

/**
 * 整頁範例
 * 模擬實際的載入情境
 */
export const FullPageExample: Story = {
  render: () => (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fafafa' }}>
      <DashboardSkeleton />
    </Box>
  ),
};

/**
 * 多個骨架
 * 顯示多個連續骨架（模擬多次重新載入）
 */
export const Multiple: Story = {
  render: () => (
    <Box>
      <DashboardSkeleton />
      <Box sx={{ height: 40 }} />
      <DashboardSkeleton />
    </Box>
  ),
};

/**
 * 與實際內容的比較
 * 顯示骨架與實際內容之間的對應關係
 */
export const ComparisonWithActual: Story = {
  render: () => (
    <Box sx={{ display: 'flex', gap: 4 }}>
      <Box sx={{ flex: 1 }}>
        <h3 style={{ textAlign: 'center', marginBottom: 16 }}>
          Skeleton (Loading)
        </h3>
        <Box
          sx={{
            border: '2px solid #e0e0e0',
            borderRadius: 1,
            overflow: 'hidden',
          }}
        >
          <DashboardSkeleton />
        </Box>
      </Box>
      <Box sx={{ flex: 1 }}>
        <h3 style={{ textAlign: 'center', marginBottom: 16 }}>
          Actual Content
        </h3>
        <Box
          sx={{
            border: '2px solid #e0e0e0',
            borderRadius: 1,
            overflow: 'hidden',
          }}
        >
          <Box sx={{ bgcolor: 'primary.main', color: 'white', p: 2 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <h2 style={{ margin: 0 }}>Dashboard</h2>
              <button
                style={{
                  background: 'white',
                  color: '#1976d2',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: 4,
                  cursor: 'pointer',
                }}
              >
                登出
              </button>
            </div>
          </Box>
          <Box sx={{ p: 4 }}>
            <h1 style={{ marginTop: 0 }}>歡迎使用 Dashboard</h1>
            <p style={{ color: '#666' }}>
              這是你的個人 dashboard。可在此管理你的設定並 檢視你的資料。
            </p>
            <div style={{ display: 'flex', gap: 16, marginTop: 32 }}>
              <button
                style={{
                  background: '#1976d2',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: 4,
                  cursor: 'pointer',
                }}
              >
                安全設定
              </button>
              <button
                style={{
                  background: 'white',
                  color: '#1976d2',
                  border: '1px solid #1976d2',
                  padding: '12px 24px',
                  borderRadius: 4,
                  cursor: 'pointer',
                }}
              >
                返回首頁
              </button>
            </div>
          </Box>
        </Box>
      </Box>
    </Box>
  ),
  parameters: {
    layout: 'padded',
  },
};

/**
 * 載入序列動畫
 * 模擬從骨架過渡到實際內容
 */
export const LoadingSequence: Story = {
  render: function LoadingSequenceExample() {
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
      const timer = setTimeout(() => {
        setLoading(false);
      }, 3000);

      return () => clearTimeout(timer);
    }, []);

    const handleReload = () => {
      setLoading(true);
      setTimeout(() => setLoading(false), 3000);
    };

    if (loading) {
      return <DashboardSkeleton />;
    }

    return (
      <Box>
        <Box sx={{ bgcolor: 'primary.main', color: 'white', p: 2 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              maxWidth: '1200px',
              margin: '0 auto',
            }}
          >
            <h2 style={{ margin: 0 }}>Dashboard</h2>
            <button
              onClick={handleReload}
              style={{
                background: 'white',
                color: '#1976d2',
                border: 'none',
                padding: '8px 16px',
                borderRadius: 4,
                cursor: 'pointer',
              }}
            >
              重新載入
            </button>
          </div>
        </Box>
        <Box sx={{ maxWidth: '1200px', margin: '32px auto', p: 3 }}>
          <Box
            sx={{
              bgcolor: 'white',
              p: 4,
              borderRadius: 2,
              boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
            }}
          >
            <h1 style={{ marginTop: 0 }}>歡迎使用 Dashboard</h1>
            <p style={{ color: '#666' }}>
              內容已成功載入！點選「重新載入」即可再次檢視 骨架畫面。
            </p>
            <div style={{ display: 'flex', gap: 16, marginTop: 32 }}>
              <button
                style={{
                  background: '#1976d2',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: 4,
                  cursor: 'pointer',
                }}
              >
                安全設定
              </button>
              <button
                style={{
                  background: 'white',
                  color: '#1976d2',
                  border: '1px solid #1976d2',
                  padding: '12px 24px',
                  borderRadius: 4,
                  cursor: 'pointer',
                }}
              >
                返回首頁
              </button>
            </div>
          </Box>
        </Box>
      </Box>
    );
  },
};

/**
 * 不同的視窗尺寸
 * 展示在不同螢幕尺寸上的表現
 */
export const DifferentViewportSizes: Story = {
  render: () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Box>
        <h3 style={{ marginBottom: 16 }}>Mobile (375px)</h3>
        <Box sx={{ width: 375, border: '1px solid #ddd', overflow: 'hidden' }}>
          <DashboardSkeleton />
        </Box>
      </Box>
      <Box>
        <h3 style={{ marginBottom: 16 }}>Tablet (768px)</h3>
        <Box sx={{ width: 768, border: '1px solid #ddd', overflow: 'hidden' }}>
          <DashboardSkeleton />
        </Box>
      </Box>
      <Box>
        <h3 style={{ marginBottom: 16 }}>Desktop (1200px)</h3>
        <Box sx={{ width: 1200, border: '1px solid #ddd', overflow: 'hidden' }}>
          <DashboardSkeleton />
        </Box>
      </Box>
    </Box>
  ),
  parameters: {
    layout: 'padded',
  },
};
