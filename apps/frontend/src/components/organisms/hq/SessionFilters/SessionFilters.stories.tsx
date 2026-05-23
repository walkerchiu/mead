import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';
import { SessionFilters } from './SessionFilters';
import { Box, Typography, Paper } from '@mui/material';

/**
 * SessionFilters is an advanced filter component for hq session management.
 *
 * ## When to Use
 * - HQ session management page
 * - When filtering large numbers of sessions
 * - When searching for specific user sessions
 *
 * ## Features
 * - Unified user search (email, name, or ID)
 * - Status filter (ACTIVE, EXPIRED, REVOKED)
 * - IP address filter
 * - Device info filter
 * - Location filter
 * - Revoked method filter (conditional)
 * - Collapsible panel
 * - Filter chips for active filters
 * - Debounced search (500ms delay)
 * - Result count display
 *
 * ## Filter Fields
 * - **userSearch**: Search by email, username, or user ID
 * - **status**: Filter by session status (ACTIVE, EXPIRED, REVOKED)
 * - **ipAddress**: Filter by IP address
 * - **deviceInfo**: Filter by device information
 * - **location**: Filter by geographic location
 * - **revokedMethod**: Filter by revocation method (only when status is REVOKED)
 *
 * ## Best Practices
 * - Start with collapsed state for clean UI
 * - Show result count to provide feedback
 * - Use debouncing to reduce server load
 * - Clear filters easily with one click
 * - Show active filters as chips
 */
const meta = {
  title: 'HQ Scope/Organisms/Sessions/Filters',
  component: SessionFilters,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Advanced filter component for hq session management with debounced search, collapsible panel, and active filter chips.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    defaultExpanded: {
      control: 'boolean',
      description: 'Whether the filter panel is expanded by default',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    resultCount: {
      control: 'number',
      description: 'Number of filtered results',
      table: {
        type: { summary: 'number' },
      },
    },
    totalCount: {
      control: 'number',
      description: 'Total number of sessions before filtering',
      table: {
        type: { summary: 'number' },
      },
    },
  },
} satisfies Meta<typeof SessionFilters>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default state
 * Filters panel expanded with no active filters
 */
export const Default: Story = {
  args: {
    filters: {},
    onFiltersChange: (filters) => console.log('Filters changed:', filters),
    defaultExpanded: true,
    resultCount: 150,
    totalCount: 150,
  },
};

/**
 * Collapsed state
 * Filters panel collapsed by default
 */
export const Collapsed: Story = {
  args: {
    filters: {},
    onFiltersChange: (filters) => console.log('Filters changed:', filters),
    defaultExpanded: false,
    resultCount: 150,
    totalCount: 150,
  },
};

/**
 * With active filters
 * Shows filter chips for active filters
 */
export const WithActiveFilters: Story = {
  args: {
    filters: {
      userSearch: 'john@example.com',
      status: 'ACTIVE',
      ipAddress: '192.168.1.',
    },
    onFiltersChange: (filters) => console.log('Filters changed:', filters),
    defaultExpanded: true,
    resultCount: 12,
    totalCount: 150,
  },
};

/**
 * Revoked sessions filter
 * Shows revoked method filter when status is REVOKED
 */
export const RevokedSessionsFilter: Story = {
  args: {
    filters: {
      status: 'REVOKED',
      revokedMethod: 'HQ_FORCE',
    },
    onFiltersChange: (filters) => console.log('Filters changed:', filters),
    defaultExpanded: true,
    resultCount: 8,
    totalCount: 150,
  },
};

/**
 * All filters active
 * Maximum filters applied
 */
export const AllFiltersActive: Story = {
  args: {
    filters: {
      userSearch: 'hq',
      status: 'REVOKED',
      ipAddress: '10.0.0.',
      deviceInfo: 'Chrome',
      location: 'Taipei',
      revokedMethod: 'SECURITY_MEASURE',
    },
    onFiltersChange: (filters) => console.log('Filters changed:', filters),
    defaultExpanded: true,
    resultCount: 3,
    totalCount: 150,
  },
};

/**
 * No results
 * Filters applied but no matching results
 */
export const NoResults: Story = {
  args: {
    filters: {
      userSearch: 'nonexistent@example.com',
    },
    onFiltersChange: (filters) => console.log('Filters changed:', filters),
    defaultExpanded: true,
    resultCount: 0,
    totalCount: 150,
  },
};

/**
 * Large dataset
 * Filtering from a large number of sessions
 */
export const LargeDataset: Story = {
  args: {
    filters: {
      status: 'ACTIVE',
    },
    onFiltersChange: (filters) => console.log('Filters changed:', filters),
    defaultExpanded: true,
    resultCount: 8542,
    totalCount: 15230,
  },
};

/**
 * Interactive example
 * Fully interactive filter demonstration
 */
export const Interactive: Story = {
  render: function InteractiveExample() {
    const [filters, setFilters] = useState<{
      userSearch?: string;
      status?: 'ACTIVE' | 'EXPIRED' | 'REVOKED';
      ipAddress?: string;
      deviceInfo?: string;
      location?: string;
      revokedMethod?: string;
    }>({});

    // Simulate filtering logic
    const totalSessions = 150;
    let filteredCount = totalSessions;

    if (filters.userSearch) filteredCount = Math.floor(filteredCount * 0.5);
    if (filters.status) filteredCount = Math.floor(filteredCount * 0.6);
    if (filters.ipAddress) filteredCount = Math.floor(filteredCount * 0.7);
    if (filters.deviceInfo) filteredCount = Math.floor(filteredCount * 0.8);
    if (filters.location) filteredCount = Math.floor(filteredCount * 0.9);
    if (filters.revokedMethod) filteredCount = Math.floor(filteredCount * 0.5);

    return (
      <Box>
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            會話管理 - 篩選器示範
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            使用下方的篩選器來搜尋特定會話。輸入會在 500ms 後自動套用。
          </Typography>

          <SessionFilters
            filters={filters}
            onFiltersChange={setFilters}
            defaultExpanded={true}
            resultCount={filteredCount}
            totalCount={totalSessions}
          />
        </Paper>

        <Paper elevation={1} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            當前篩選器狀態
          </Typography>
          <Box
            component="pre"
            sx={{
              p: 2,
              bgcolor: 'grey.100',
              borderRadius: 1,
              overflow: 'auto',
              fontSize: '0.875rem',
            }}
          >
            {JSON.stringify(filters, null, 2)}
          </Box>
          <Typography variant="body2" sx={{ mt: 2 }}>
            顯示 {filteredCount} / {totalSessions} 個會話
          </Typography>
        </Paper>
      </Box>
    );
  },
};

/**
 * Status transitions
 * Shows different status filter states
 */
export const StatusTransitions: Story = {
  render: () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Paper elevation={1} sx={{ p: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Status: ACTIVE
        </Typography>
        <SessionFilters
          filters={{ status: 'ACTIVE' }}
          onFiltersChange={(f) => console.log(f)}
          resultCount={85}
          totalCount={150}
        />
      </Paper>

      <Paper elevation={1} sx={{ p: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Status: EXPIRED
        </Typography>
        <SessionFilters
          filters={{ status: 'EXPIRED' }}
          onFiltersChange={(f) => console.log(f)}
          resultCount={42}
          totalCount={150}
        />
      </Paper>

      <Paper elevation={1} sx={{ p: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Status: REVOKED (shows revoked method filter)
        </Typography>
        <SessionFilters
          filters={{ status: 'REVOKED', revokedMethod: 'HQ_FORCE' }}
          onFiltersChange={(f) => console.log(f)}
          resultCount={23}
          totalCount={150}
        />
      </Paper>
    </Box>
  ),
};

/**
 * Mobile view
 * Optimized for mobile devices
 */
export const MobileView: Story = {
  args: {
    filters: {
      userSearch: 'user@example.com',
      status: 'ACTIVE',
    },
    onFiltersChange: (filters) => console.log('Filters changed:', filters),
    defaultExpanded: false,
    resultCount: 28,
    totalCount: 150,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

/**
 * Dark mode
 * Display in dark theme
 */
export const DarkMode: Story = {
  args: {
    filters: {
      userSearch: 'hq',
      status: 'ACTIVE',
    },
    onFiltersChange: (filters) => console.log('Filters changed:', filters),
    defaultExpanded: true,
    resultCount: 15,
    totalCount: 150,
  },
  decorators: [
    (Story) => (
      <Box sx={{ bgcolor: '#121212', p: 4, minHeight: 600, borderRadius: 2 }}>
        <Story />
      </Box>
    ),
  ],
  parameters: {
    backgrounds: { default: 'dark' },
  },
};
