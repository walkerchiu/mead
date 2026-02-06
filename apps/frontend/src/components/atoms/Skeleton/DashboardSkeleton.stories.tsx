import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { DashboardSkeleton } from './DashboardSkeleton';
import Box from '@mui/material/Box';

/**
 * DashboardSkeleton 是 Dashboard 頁面載入骨架屏組件。
 *
 * ## 使用時機
 * - Dashboard 頁面載入時
 * - 受保護頁面的認證檢查時
 * - 資料擷取過程中
 *
 * ## 特性
 * - 模擬 AppBar 和內容區域
 * - 包含標題、描述、按鈕骨架
 * - 半透明背景色
 * - Material UI Skeleton 動畫
 *
 * ## 最佳實踐
 * - 用於 ProtectedRoute 組件
 * - 在資料載入前顯示
 * - 改善頁面載入體驗
 */
const meta = {
  title: 'Atoms/Skeleton/DashboardSkeleton',
  component: DashboardSkeleton,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Dashboard 頁面載入骨架屏，模擬完整的 Dashboard 結構，提供載入時的視覺回饋。',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof DashboardSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 預設顯示
 * 標準的 Dashboard 骨架屏
 */
export const Default: Story = {};

/**
 * 深色背景
 * 在深色背景下的顯示效果
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
 * 在淺色背景下的顯示效果
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
 * 完整頁面範例
 * 模擬實際載入場景
 */
export const FullPageExample: Story = {
  render: () => (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fafafa' }}>
      <DashboardSkeleton />
    </Box>
  ),
};

/**
 * 多個骨架屏
 * 展示多個連續的骨架屏（模擬多次重新載入）
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
 * 與實際內容對比
 * 展示骨架屏與實際內容的對應關係
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
                Logout
              </button>
            </div>
          </Box>
          <Box sx={{ p: 4 }}>
            <h1 style={{ marginTop: 0 }}>Welcome to Dashboard</h1>
            <p style={{ color: '#666' }}>
              This is your personal dashboard. Manage your settings and view
              your data here.
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
                Security Settings
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
                Back to Home
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
 * 模擬從骨架屏到實際內容的轉換
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
              Reload
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
            <h1 style={{ marginTop: 0 }}>Welcome to Dashboard</h1>
            <p style={{ color: '#666' }}>
              Content loaded successfully! Click "Reload" to see the skeleton
              again.
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
                Security Settings
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
                Back to Home
              </button>
            </div>
          </Box>
        </Box>
      </Box>
    );
  },
};

/**
 * 不同視窗大小
 * 展示在不同螢幕尺寸下的表現
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
