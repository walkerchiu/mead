import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { DataTable, type DataTableColumn } from './DataTable';
import { Badge } from '@/components/atoms';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';

/**
 * DataTable 是一個功能完整的數據表格組件。
 *
 * ## 特色
 * - 支援排序（可自訂排序邏輯）
 * - 支援篩選（可自訂篩選邏輯）
 * - 支援行高亮
 * - 支援展開/收合
 * - 支援多選
 * - 支援分頁
 * - 完整的 TypeScript 類型支援
 *
 * ## 使用場景
 * - 數據列表展示
 * - 管理後台表格
 * - 複雜數據查詢介面
 */
const meta = {
  title: 'Molecules/DataTable',
  component: DataTable,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: '功能完整的數據表格組件，支援排序、篩選、高亮、展開等功能。',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof DataTable>;

export default meta;
type Story = StoryObj<typeof meta>;

// 範例數據
interface User {
  id: string;
  name: string;
  email: string;
  age: number;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  department: string;
  joinDate: string;
}

const sampleUsers: User[] = [
  {
    id: '1',
    name: '王小明',
    email: 'wang@example.com',
    age: 28,
    role: 'Engineer',
    status: 'active',
    department: '技術部',
    joinDate: '2023-01-15',
  },
  {
    id: '2',
    name: '李小華',
    email: 'lee@example.com',
    age: 32,
    role: 'Manager',
    status: 'active',
    department: '管理部',
    joinDate: '2022-06-20',
  },
  {
    id: '3',
    name: '張小美',
    email: 'zhang@example.com',
    age: 25,
    role: 'Designer',
    status: 'inactive',
    department: '設計部',
    joinDate: '2023-03-10',
  },
  {
    id: '4',
    name: '陳小強',
    email: 'chen@example.com',
    age: 30,
    role: 'Engineer',
    status: 'active',
    department: '技術部',
    joinDate: '2022-11-05',
  },
  {
    id: '5',
    name: '林小芳',
    email: 'lin@example.com',
    age: 27,
    role: 'HR',
    status: 'pending',
    department: '人資部',
    joinDate: '2024-01-01',
  },
];

const basicColumns: DataTableColumn<User>[] = [
  { id: 'name', label: '姓名' },
  { id: 'email', label: '電子郵件' },
  { id: 'age', label: '年齡', align: 'center' },
  { id: 'role', label: '職位' },
  { id: 'department', label: '部門' },
];

/**
 * 基本表格
 * 最簡單的數據表格展示
 */
export const Basic: Story = {
  args: {
    columns: basicColumns,
    data: sampleUsers,
  },
};

/**
 * 可排序表格
 * 點擊列標題即可排序
 */
export const Sortable: Story = {
  args: {
    columns: [
      { id: 'name', label: '姓名', sortable: true },
      { id: 'email', label: '電子郵件', sortable: true },
      { id: 'age', label: '年齡', align: 'center', sortable: true },
      { id: 'role', label: '職位', sortable: true },
      { id: 'department', label: '部門', sortable: true },
    ],
    data: sampleUsers,
  },
};

/**
 * 可篩選表格
 * 每列都有篩選輸入框
 */
export const Filterable: Story = {
  args: {
    columns: [
      { id: 'name', label: '姓名', sortable: true, filterable: true },
      { id: 'email', label: '電子郵件', sortable: true, filterable: true },
      { id: 'age', label: '年齡', align: 'center', sortable: true },
      { id: 'role', label: '職位', sortable: true, filterable: true },
      { id: 'department', label: '部門', sortable: true, filterable: true },
    ],
    data: sampleUsers,
  },
};

/**
 * 自訂渲染
 * 使用 render 函數自訂列的顯示方式
 */
export const CustomRender: Story = {
  args: {
    columns: [
      { id: 'name', label: '姓名', sortable: true },
      { id: 'email', label: '電子郵件' },
      {
        id: 'age',
        label: '年齡',
        align: 'center',
        sortable: true,
        render: (value) => <Chip label={`${value} 歲`} size="small" />,
      },
      { id: 'role', label: '職位' },
      {
        id: 'status',
        label: '狀態',
        render: (value: 'active' | 'inactive' | 'pending') => {
          const colorMap = {
            active: 'success' as const,
            inactive: 'default' as const,
            pending: 'warning' as const,
          };
          const labelMap = {
            active: '啟用',
            inactive: '停用',
            pending: '待審核',
          };
          return (
            <Badge color={colorMap[value]} size="small">
              {labelMap[value]}
            </Badge>
          );
        },
      },
    ],
    data: sampleUsers,
  },
};

/**
 * 高亮行
 * 根據條件高亮特定行
 */
export const HighlightRows: Story = {
  args: {
    columns: [
      { id: 'name', label: '姓名', sortable: true },
      { id: 'email', label: '電子郵件' },
      { id: 'age', label: '年齡', align: 'center', sortable: true },
      { id: 'role', label: '職位' },
      {
        id: 'status',
        label: '狀態',
        render: (value: 'active' | 'inactive' | 'pending') => {
          const colorMap = {
            active: 'success' as const,
            inactive: 'default' as const,
            pending: 'warning' as const,
          };
          const labelMap = {
            active: '啟用',
            inactive: '停用',
            pending: '待審核',
          };
          return (
            <Badge color={colorMap[value]} size="small">
              {labelMap[value]}
            </Badge>
          );
        },
      },
    ],
    data: sampleUsers,
    highlightRow: (row) => row.status === 'pending',
    highlightColor: 'rgba(255, 152, 0, 0.08)',
  },
};

/**
 * 可展開表格
 * 點擊展開按鈕顯示詳細資訊
 */
export const Expandable: Story = {
  args: {
    columns: [
      { id: 'name', label: '姓名', sortable: true },
      { id: 'email', label: '電子郵件' },
      { id: 'role', label: '職位' },
      {
        id: 'status',
        label: '狀態',
        render: (value: 'active' | 'inactive' | 'pending') => {
          const colorMap = {
            active: 'success' as const,
            inactive: 'default' as const,
            pending: 'warning' as const,
          };
          const labelMap = {
            active: '啟用',
            inactive: '停用',
            pending: '待審核',
          };
          return (
            <Badge color={colorMap[value]} size="small">
              {labelMap[value]}
            </Badge>
          );
        },
      },
    ],
    data: sampleUsers,
    expandable: true,
    renderExpandedRow: (row: User) => (
      <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom>
          詳細資訊
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: 1 }}>
          <Typography color="text.secondary">部門：</Typography>
          <Typography>{row.department}</Typography>
          <Typography color="text.secondary">入職日期：</Typography>
          <Typography>{row.joinDate}</Typography>
          <Typography color="text.secondary">年齡：</Typography>
          <Typography>{row.age} 歲</Typography>
          <Typography color="text.secondary">電子郵件：</Typography>
          <Typography>{row.email}</Typography>
        </Box>
      </Box>
    ),
  },
};

/**
 * 可選擇表格
 * 支援多選行
 */
export const Selectable: Story = {
  render: function SelectableTable() {
    const [selected, setSelected] = useState<string[]>([]);

    return (
      <Box>
        <Typography variant="body2" sx={{ mb: 2 }}>
          已選擇：{selected.length} 行
        </Typography>
        <DataTable
          columns={[
            { id: 'name', label: '姓名', sortable: true },
            { id: 'email', label: '電子郵件' },
            { id: 'age', label: '年齡', align: 'center', sortable: true },
            { id: 'role', label: '職位' },
            { id: 'department', label: '部門' },
          ]}
          data={sampleUsers}
          selectable
          selectedRows={selected}
          onSelectionChange={setSelected}
        />
      </Box>
    );
  },
};

/**
 * 帶分頁表格
 * 顯示分頁控制
 */
export const WithPagination: Story = {
  render: function PaginatedTable() {
    const [page, setPage] = useState(1);

    return (
      <DataTable
        columns={[
          { id: 'name', label: '姓名', sortable: true },
          { id: 'email', label: '電子郵件' },
          { id: 'role', label: '職位' },
          { id: 'department', label: '部門' },
        ]}
        data={sampleUsers}
        pagination
        page={page}
        totalPages={3}
        onPageChange={setPage}
      />
    );
  },
};

/**
 * 載入中狀態
 * 顯示載入指示器
 */
export const Loading: Story = {
  args: {
    columns: basicColumns,
    data: sampleUsers,
    loading: true,
  },
};

/**
 * 空數據狀態
 * 無數據時的顯示
 */
export const Empty: Story = {
  args: {
    columns: basicColumns,
    data: [],
    emptyText: '目前沒有使用者資料',
  },
};

/**
 * 固定表頭
 * 滾動時表頭固定在頂部
 */
export const StickyHeader: Story = {
  args: {
    columns: [
      { id: 'name', label: '姓名', sortable: true },
      { id: 'email', label: '電子郵件' },
      { id: 'age', label: '年齡', align: 'center', sortable: true },
      { id: 'role', label: '職位' },
      { id: 'department', label: '部門' },
    ],
    data: [...sampleUsers, ...sampleUsers, ...sampleUsers],
    maxHeight: 400,
  },
};

/**
 * 展開圖標樣式 - 向下
 * 將展開圖標改為向下/向上樣式
 */
export const ExpandIconDown: Story = {
  args: {
    columns: [
      { id: 'name', label: '姓名', sortable: true },
      { id: 'email', label: '電子郵件' },
      { id: 'role', label: '職位' },
    ],
    data: sampleUsers,
    expandable: true,
    expandIconPosition: 'down',
    renderExpandedRow: (row: User) => (
      <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
        <Typography variant="subtitle2">詳細資訊</Typography>
        <Typography variant="body2">{row.department}</Typography>
      </Box>
    ),
  },
};

/**
 * 完整功能展示
 * 同時展示所有功能
 */
export const FullFeatures: Story = {
  render: function FullFeaturesTable() {
    const [selected, setSelected] = useState<string[]>([]);
    const [page, setPage] = useState(1);

    return (
      <Box>
        <Typography variant="body2" sx={{ mb: 2 }}>
          已選擇：{selected.length} 行 | 當前頁：{page}
        </Typography>
        <DataTable
          columns={[
            { id: 'name', label: '姓名', sortable: true, filterable: true },
            {
              id: 'email',
              label: '電子郵件',
              sortable: true,
              filterable: true,
            },
            {
              id: 'age',
              label: '年齡',
              align: 'center',
              sortable: true,
              render: (value) => <Chip label={`${value} 歲`} size="small" />,
            },
            { id: 'role', label: '職位', sortable: true, filterable: true },
            {
              id: 'status',
              label: '狀態',
              render: (value: 'active' | 'inactive' | 'pending') => {
                const colorMap = {
                  active: 'success' as const,
                  inactive: 'default' as const,
                  pending: 'warning' as const,
                };
                const labelMap = {
                  active: '啟用',
                  inactive: '停用',
                  pending: '待審核',
                };
                return (
                  <Badge color={colorMap[value]} size="small">
                    {labelMap[value]}
                  </Badge>
                );
              },
            },
          ]}
          data={sampleUsers}
          selectable
          selectedRows={selected}
          onSelectionChange={setSelected}
          expandable
          renderExpandedRow={(row: User) => (
            <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                詳細資訊
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '120px 1fr',
                  gap: 1,
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  部門：
                </Typography>
                <Typography variant="body2">{row.department}</Typography>
                <Typography variant="body2" color="text.secondary">
                  入職日期：
                </Typography>
                <Typography variant="body2">{row.joinDate}</Typography>
              </Box>
            </Box>
          )}
          highlightRow={(row) => row.status === 'pending'}
          highlightColor="rgba(255, 152, 0, 0.08)"
          pagination
          page={page}
          totalPages={2}
          onPageChange={setPage}
          maxHeight={500}
        />
      </Box>
    );
  },
};
