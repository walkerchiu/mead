import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';
import { AuditLogFilters } from './AuditLogFilters';
import { Box, Typography, Paper } from '@mui/material';

/**
 * AuditLogFilters 是 HQ 稽核日誌管理的進階篩選元件。
 *
 * ## 何時使用
 * - HQ 稽核日誌頁面
 * - 安全監控儀表板
 * - 合規報表介面
 * - 篩選大量稽核日誌時
 *
 * ## 功能特性
 * - 統一的使用者搜尋（email、姓名或 ID）
 * - 操作篩選（LOGIN、LOGOUT、CREATE、UPDATE、DELETE 等）
 * - entity 篩選（User、Session、Role 等）
 * - 狀態篩選（SUCCESS、FAILURE、PENDING）
 * - 可收合面板
 * - 啟用中篩選的標籤
 * - 防抖搜尋（延遲 500ms）
 * - 結果數量顯示
 *
 * ## 篩選欄位
 * - **userSearch**：依 email、使用者名稱或使用者 ID 搜尋
 * - **action**：依操作類型篩選（LOGIN、LOGOUT、CREATE、UPDATE、DELETE）
 * - **entity**：依 entity 類型篩選（User、Session、Role、Permission）
 * - **status**：依日誌狀態篩選（SUCCESS、FAILURE、PENDING）
 *
 * ## 使用情境
 * - **安全稽核**：找出失敗的登入嘗試
 * - **合規**：追蹤特定使用者操作
 * - **疑難排解**：依 entity 與 action 篩選
 * - **報表**：產生經篩選的稽核報表
 *
 * ## 最佳實踐
 * - 以收合狀態起始，保持介面簡潔
 * - 顯示結果數量以提供回饋
 * - 使用防抖以降低伺服器負載
 * - 一鍵輕鬆清除篩選
 * - 以標籤顯示啟用中的篩選
 */
const meta = {
  title: 'HQ Scope/Organisms/Audit Logs/Filters',
  component: AuditLogFilters,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'HQ 稽核日誌管理的進階篩選元件，具備防抖搜尋、可收合面板與啟用中篩選標籤。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    defaultExpanded: {
      control: 'boolean',
      description: '篩選面板預設是否展開',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    resultCount: {
      control: 'number',
      description: '篩選結果數量',
      table: {
        type: { summary: 'number' },
      },
    },
    totalCount: {
      control: 'number',
      description: '篩選前的稽核日誌總數',
      table: {
        type: { summary: 'number' },
      },
    },
  },
} satisfies Meta<typeof AuditLogFilters>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 預設狀態
 * 篩選面板展開且無啟用中的篩選
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
 * 收合狀態
 * 篩選面板預設為收合
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
 * 含啟用中的篩選
 * 以標籤顯示啟用中的篩選
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
 * 安全稽核 - 失敗的登入
 * 找出所有失敗的登入嘗試
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
 * 使用者活動追蹤
 * 追蹤特定使用者的操作
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
 * 刪除操作稽核
 * 找出所有刪除操作
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
 * 所有篩選皆啟用
 * 已套用最多篩選
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
 * 無結果
 * 已套用篩選但無相符結果
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
 * 大型資料集
 * 從大量稽核日誌中篩選
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
 * 互動範例
 * 完全可互動的篩選展示
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
 * 操作類型比較
 * 顯示不同的操作篩選狀態
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
 * 狀態比較
 * 顯示不同的狀態篩選狀態
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
 * 行動裝置檢視
 * 針對行動裝置最佳化
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
 * 深色模式
 * 在深色主題中顯示
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
 * 合規報表
 * 以合規為重點的篩選範例
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
