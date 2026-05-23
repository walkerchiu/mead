import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';
import { AuditLogFilters } from './AuditLogFilters';
import { Box, Typography, Paper } from '@mui/material';

/**
 * AuditLogFilters is an advanced filter component for hq audit log management.
 *
 * ## When to Use
 * - HQ audit log page
 * - Security monitoring dashboards
 * - Compliance reporting interfaces
 * - When filtering large numbers of audit logs
 *
 * ## Features
 * - Unified user search (email, name, or ID)
 * - Action filter (LOGIN, LOGOUT, CREATE, UPDATE, DELETE, etc.)
 * - Entity filter (User, Session, Role, etc.)
 * - Status filter (SUCCESS, FAILURE, PENDING)
 * - Collapsible panel
 * - Filter chips for active filters
 * - Debounced search (500ms delay)
 * - Result count display
 *
 * ## Filter Fields
 * - **userSearch**: Search by email, username, or user ID
 * - **action**: Filter by action type (LOGIN, LOGOUT, CREATE, UPDATE, DELETE)
 * - **entity**: Filter by entity type (User, Session, Role, Permission)
 * - **status**: Filter by log status (SUCCESS, FAILURE, PENDING)
 *
 * ## Use Cases
 * - **Security Audits**: Find failed login attempts
 * - **Compliance**: Track specific user actions
 * - **Troubleshooting**: Filter by entity and action
 * - **Reporting**: Generate filtered audit reports
 *
 * ## Best Practices
 * - Start with collapsed state for clean UI
 * - Show result count to provide feedback
 * - Use debouncing to reduce server load
 * - Clear filters easily with one click
 * - Show active filters as chips
 */
const meta = {
  title: 'HQ Scope/Organisms/Audit Logs/Filters',
  component: AuditLogFilters,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Advanced filter component for hq audit log management with debounced search, collapsible panel, and active filter chips.',
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
      description: 'Total number of audit logs before filtering',
      table: {
        type: { summary: 'number' },
      },
    },
  },
} satisfies Meta<typeof AuditLogFilters>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default state
 * Filters panel expanded with no active filters
 */
export const Default: Story = {
  args: {
    filters: {},
    onChange: (filters) => console.log('Filters changed:', filters),
    defaultExpanded: true,
    resultCount: 1250,
    totalCount: 1250,
  },
};

/**
 * Collapsed state
 * Filters panel collapsed by default
 */
export const Collapsed: Story = {
  args: {
    filters: {},
    onChange: (filters) => console.log('Filters changed:', filters),
    defaultExpanded: false,
    resultCount: 1250,
    totalCount: 1250,
  },
};

/**
 * With active filters
 * Shows filter chips for active filters
 */
export const WithActiveFilters: Story = {
  args: {
    filters: {
      userSearch: 'hq@example.com',
      action: 'LOGIN',
      status: 'SUCCESS',
    },
    onChange: (filters) => console.log('Filters changed:', filters),
    defaultExpanded: true,
    resultCount: 85,
    totalCount: 1250,
  },
};

/**
 * Security audit - Failed logins
 * Find all failed login attempts
 */
export const SecurityAuditFailedLogins: Story = {
  args: {
    filters: {
      action: 'LOGIN',
      status: 'FAILURE',
    },
    onChange: (filters) => console.log('Filters changed:', filters),
    defaultExpanded: true,
    resultCount: 23,
    totalCount: 1250,
  },
};

/**
 * User activity tracking
 * Track specific user's actions
 */
export const UserActivityTracking: Story = {
  args: {
    filters: {
      userSearch: 'john.doe@company.com',
      entity: 'User',
    },
    onChange: (filters) => console.log('Filters changed:', filters),
    defaultExpanded: true,
    resultCount: 47,
    totalCount: 1250,
  },
};

/**
 * Delete operations audit
 * Find all delete operations
 */
export const DeleteOperationsAudit: Story = {
  args: {
    filters: {
      action: 'DELETE',
      status: 'SUCCESS',
    },
    onChange: (filters) => console.log('Filters changed:', filters),
    defaultExpanded: true,
    resultCount: 12,
    totalCount: 1250,
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
      action: 'UPDATE',
      entity: 'Role',
      status: 'SUCCESS',
    },
    onChange: (filters) => console.log('Filters changed:', filters),
    defaultExpanded: true,
    resultCount: 5,
    totalCount: 1250,
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
      action: 'DELETE',
    },
    onChange: (filters) => console.log('Filters changed:', filters),
    defaultExpanded: true,
    resultCount: 0,
    totalCount: 1250,
  },
};

/**
 * Large dataset
 * Filtering from a large number of audit logs
 */
export const LargeDataset: Story = {
  args: {
    filters: {
      action: 'LOGIN',
    },
    onChange: (filters) => console.log('Filters changed:', filters),
    defaultExpanded: true,
    resultCount: 48523,
    totalCount: 125480,
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
      action?: string;
      entity?: string;
      status?: string;
    }>({});

    // Simulate filtering logic
    const totalLogs = 1250;
    let filteredCount = totalLogs;

    if (filters.userSearch) filteredCount = Math.floor(filteredCount * 0.4);
    if (filters.action) filteredCount = Math.floor(filteredCount * 0.6);
    if (filters.entity) filteredCount = Math.floor(filteredCount * 0.7);
    if (filters.status) filteredCount = Math.floor(filteredCount * 0.8);

    return (
      <Box>
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            審計日誌 - 篩選器示範
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            使用下方的篩選器來搜尋特定審計日誌。輸入會在 500ms 後自動套用。
          </Typography>

          <AuditLogFilters
            filters={filters}
            onChange={setFilters}
            defaultExpanded={true}
            resultCount={filteredCount}
            totalCount={totalLogs}
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
            顯示 {filteredCount} / {totalLogs} 條審計日誌
          </Typography>
        </Paper>

        <Paper elevation={1} sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            常見使用場景
          </Typography>
          <Box component="ul" sx={{ m: 0, pl: 2 }}>
            <Typography variant="body2" component="li">
              <strong>安全稽核</strong>：篩選 action=LOGIN + status=FAILURE
              找出失敗的登入嘗試
            </Typography>
            <Typography variant="body2" component="li">
              <strong>合規報告</strong>：篩選特定用戶的所有操作
            </Typography>
            <Typography variant="body2" component="li">
              <strong>問題排查</strong>：篩選 entity + action 找出特定操作
            </Typography>
            <Typography variant="body2" component="li">
              <strong>刪除追蹤</strong>：篩選 action=DELETE 查看所有刪除操作
            </Typography>
          </Box>
        </Paper>
      </Box>
    );
  },
};

/**
 * Action types comparison
 * Shows different action filter states
 */
export const ActionTypes: Story = {
  render: () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Paper elevation={1} sx={{ p: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Action: LOGIN
        </Typography>
        <AuditLogFilters
          filters={{ action: 'LOGIN' }}
          onChange={(f) => console.log(f)}
          resultCount={423}
          totalCount={1250}
        />
      </Paper>

      <Paper elevation={1} sx={{ p: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Action: CREATE
        </Typography>
        <AuditLogFilters
          filters={{ action: 'CREATE' }}
          onChange={(f) => console.log(f)}
          resultCount={187}
          totalCount={1250}
        />
      </Paper>

      <Paper elevation={1} sx={{ p: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Action: UPDATE
        </Typography>
        <AuditLogFilters
          filters={{ action: 'UPDATE' }}
          onChange={(f) => console.log(f)}
          resultCount={345}
          totalCount={1250}
        />
      </Paper>

      <Paper elevation={1} sx={{ p: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Action: DELETE (Critical Operations)
        </Typography>
        <AuditLogFilters
          filters={{ action: 'DELETE' }}
          onChange={(f) => console.log(f)}
          resultCount={28}
          totalCount={1250}
        />
      </Paper>
    </Box>
  ),
};

/**
 * Status comparison
 * Shows different status filter states
 */
export const StatusComparison: Story = {
  render: () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Paper elevation={1} sx={{ p: 2 }}>
        <Typography
          variant="subtitle2"
          gutterBottom
          sx={{ color: 'success.main' }}
        >
          Status: SUCCESS
        </Typography>
        <AuditLogFilters
          filters={{ status: 'SUCCESS' }}
          onChange={(f) => console.log(f)}
          resultCount={1128}
          totalCount={1250}
        />
      </Paper>

      <Paper elevation={1} sx={{ p: 2 }}>
        <Typography
          variant="subtitle2"
          gutterBottom
          sx={{ color: 'error.main' }}
        >
          Status: FAILURE (Requires Attention)
        </Typography>
        <AuditLogFilters
          filters={{ status: 'FAILURE' }}
          onChange={(f) => console.log(f)}
          resultCount={97}
          totalCount={1250}
        />
      </Paper>

      <Paper elevation={1} sx={{ p: 2 }}>
        <Typography
          variant="subtitle2"
          gutterBottom
          sx={{ color: 'warning.main' }}
        >
          Status: PENDING
        </Typography>
        <AuditLogFilters
          filters={{ status: 'PENDING' }}
          onChange={(f) => console.log(f)}
          resultCount={25}
          totalCount={1250}
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
      action: 'LOGIN',
      status: 'FAILURE',
    },
    onChange: (filters) => console.log('Filters changed:', filters),
    defaultExpanded: false,
    resultCount: 23,
    totalCount: 1250,
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
      action: 'DELETE',
      status: 'SUCCESS',
    },
    onChange: (filters) => console.log('Filters changed:', filters),
    defaultExpanded: true,
    resultCount: 12,
    totalCount: 1250,
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

/**
 * Compliance reporting
 * Example of compliance-focused filtering
 */
export const ComplianceReporting: Story = {
  render: () => (
    <Box>
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          合規性報告範例
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          追蹤管理員對角色權限的變更操作
        </Typography>
        <AuditLogFilters
          filters={{
            action: 'UPDATE',
            entity: 'Role',
            status: 'SUCCESS',
          }}
          onChange={(f) => console.log(f)}
          resultCount={18}
          totalCount={1250}
        />
      </Paper>

      <Paper elevation={1} sx={{ p: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          說明
        </Typography>
        <Typography variant="body2">
          此篩選器配置可用於產生合規性報告，追蹤所有成功的角色更新操作， 符合
          GDPR、SOC 2 等法規要求的稽核追蹤需求。
        </Typography>
      </Paper>
    </Box>
  ),
};
