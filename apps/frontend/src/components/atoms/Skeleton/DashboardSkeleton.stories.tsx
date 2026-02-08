import type { Meta, StoryObj } from '@storybook/nextjs';
import React from 'react';
import { DashboardSkeleton } from './DashboardSkeleton';
import Box from '@mui/material/Box';

/**
 * DashboardSkeleton is the loading skeleton component for Dashboard pages.
 *
 * ## When to Use
 * - When Dashboard page is loading
 * - During authentication check for protected pages
 * - During data fetching
 *
 * ## Features
 * - Simulates AppBar and content area
 * - Includes title, description, button skeletons
 * - Semi-transparent background
 * - Material UI Skeleton animation
 *
 * ## Best Practices
 * - Use in ProtectedRoute component
 * - Display before data loads
 * - Improve page loading experience
 */
const meta = {
  title: 'Atoms/Skeleton/DashboardSkeleton',
  component: DashboardSkeleton,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Dashboard page loading skeleton that simulates complete Dashboard structure, providing visual feedback during loading.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof DashboardSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default display
 * Standard Dashboard skeleton
 */
export const Default: Story = {};

/**
 * Dark background
 * Display effect on dark background
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
 * Light background
 * Display effect on light background
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
 * Full page example
 * Simulate actual loading scenario
 */
export const FullPageExample: Story = {
  render: () => (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fafafa' }}>
      <DashboardSkeleton />
    </Box>
  ),
};

/**
 * Multiple skeletons
 * Show multiple continuous skeletons (simulate multiple reloads)
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
 * Comparison with actual content
 * Show correspondence between skeleton and actual content
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
 * Loading sequence animation
 * Simulate transition from skeleton to actual content
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
 * Different viewport sizes
 * Show performance on different screen sizes
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
