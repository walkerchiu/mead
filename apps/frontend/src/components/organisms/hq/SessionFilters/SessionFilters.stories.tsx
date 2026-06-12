import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';
import { SessionFilters } from './SessionFilters';
import { Box, Typography, Paper } from '@mui/material';

/**
 * SessionFilters 是 HQ session 管理的進階篩選元件。
 *
 * ## 何時使用
 * - HQ session 管理頁面
 * - 篩選大量 session 時
 * - 搜尋特定使用者 session 時
 *
 * ## 功能特性
 * - 統一的使用者搜尋（email、姓名或 ID）
 * - 狀態篩選（ACTIVE、EXPIRED、REVOKED）
 * - IP 位址篩選
 * - 裝置資訊篩選
 * - 位置篩選
 * - 撤銷方式篩選（條件式）
 * - 可收合面板
 * - 啟用中篩選的標籤
 * - 防抖搜尋（延遲 500ms）
 * - 結果數量顯示
 *
 * ## 篩選欄位
 * - **userSearch**：依 email、使用者名稱或使用者 ID 搜尋
 * - **status**：依 session 狀態篩選（ACTIVE、EXPIRED、REVOKED）
 * - **ipAddress**：依 IP 位址篩選
 * - **deviceInfo**：依裝置資訊篩選
 * - **location**：依地理位置篩選
 * - **revokedMethod**：依撤銷方式篩選（僅當狀態為 REVOKED 時）
 *
 * ## 最佳實踐
 * - 以收合狀態起始，保持介面簡潔
 * - 顯示結果數量以提供回饋
 * - 使用防抖以降低伺服器負載
 * - 一鍵輕鬆清除篩選
 * - 以標籤顯示啟用中的篩選
 */
const meta = {
  title: 'HQ Scope/Organisms/Sessions/Filters',
  component: SessionFilters,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'HQ session 管理的進階篩選元件，具備防抖搜尋、可收合面板與啟用中篩選標籤。',
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
      description: '篩選前的 session 總數',
      table: {
        type: { summary: 'number' },
      },
    },
  },
} satisfies Meta<typeof SessionFilters>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 預設狀態
 * 篩選面板展開且無啟用中的篩選
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
 * 收合狀態
 * 篩選面板預設為收合
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
 * 含啟用中的篩選
 * 以標籤顯示啟用中的篩選
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
 * 已撤銷 session 篩選
 * 當狀態為 REVOKED 時顯示撤銷方式篩選
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
 * 所有篩選皆啟用
 * 已套用最多篩選
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
 * 無結果
 * 已套用篩選但無相符結果
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
 * 大型資料集
 * 從大量 session 中篩選
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
 * 互動範例
 * 完全可互動的篩選展示
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
 * 狀態轉換
 * 顯示不同的狀態篩選狀態
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
 * 行動裝置檢視
 * 針對行動裝置最佳化
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
 * 深色模式
 * 在深色主題中顯示
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
