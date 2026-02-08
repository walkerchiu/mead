import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { DataTable, type DataTableColumn } from './DataTable';
import { Badge } from '@/components/atoms';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';

/**
 * DataTable is a fully-featured data table component.
 *
 * ## Features
 * - Supports sorting (customizable sorting logic)
 * - Supports filtering (customizable filtering logic)
 * - Supports row highlighting
 * - Supports expand/collapse
 * - Supports multi-select
 * - Supports pagination
 * - Full TypeScript type support
 *
 * ## Use Cases
 * - Data list display
 * - Admin backend tables
 * - Complex data query interfaces
 */
const meta = {
  title: 'Molecules/DataTable',
  component: DataTable,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Fully-featured data table component with sorting, filtering, highlighting, expand, and other features.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof DataTable>;

export default meta;
type Story = StoryObj<typeof meta>;

// Example data
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
    name: 'John Doe',
    email: 'john@example.com',
    age: 28,
    role: 'Engineer',
    status: 'active',
    department: 'Engineering',
    joinDate: '2023-01-15',
  },
  {
    id: '2',
    name: 'Emily Chen',
    email: 'emily@example.com',
    age: 32,
    role: 'Manager',
    status: 'active',
    department: 'Management',
    joinDate: '2022-06-20',
  },
  {
    id: '3',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    age: 25,
    role: 'Designer',
    status: 'inactive',
    department: 'Design',
    joinDate: '2023-03-10',
  },
  {
    id: '4',
    name: 'Michael Brown',
    email: 'michael@example.com',
    age: 30,
    role: 'Engineer',
    status: 'active',
    department: 'Engineering',
    joinDate: '2022-11-05',
  },
  {
    id: '5',
    name: 'Lisa Anderson',
    email: 'lisa@example.com',
    age: 27,
    role: 'HR',
    status: 'pending',
    department: 'Human Resources',
    joinDate: '2024-01-01',
  },
];

const basicColumns: DataTableColumn<User>[] = [
  { id: 'name', label: 'Name' },
  { id: 'email', label: 'Email' },
  { id: 'age', label: 'Age', align: 'center' },
  { id: 'role', label: 'Position' },
  { id: 'department', label: 'Department' },
];

/**
 * Basic table
 * Simplest data table display
 */
export const Basic: Story = {
  args: {
    columns: basicColumns,
    data: sampleUsers,
  },
};

/**
 * Sortable table
 * Click column header to sort
 */
export const Sortable: Story = {
  args: {
    columns: [
      { id: 'name', label: 'Name', sortable: true },
      { id: 'email', label: 'Email', sortable: true },
      { id: 'age', label: 'Age', align: 'center', sortable: true },
      { id: 'role', label: 'Role', sortable: true },
      { id: 'department', label: 'Department', sortable: true },
    ],
    data: sampleUsers,
  },
};

/**
 * Filterable table
 * Each column has a filter input
 */
export const Filterable: Story = {
  args: {
    columns: [
      { id: 'name', label: 'Name', sortable: true, filterable: true },
      { id: 'email', label: 'Email', sortable: true, filterable: true },
      { id: 'age', label: 'Age', align: 'center', sortable: true },
      { id: 'role', label: 'Role', sortable: true, filterable: true },
      {
        id: 'department',
        label: 'Department',
        sortable: true,
        filterable: true,
      },
    ],
    data: sampleUsers,
  },
};

/**
 * Custom rendering
 * Use render function to customize column display
 */
export const CustomRender: Story = {
  args: {
    columns: [
      { id: 'name', label: 'Name', sortable: true },
      { id: 'email', label: 'Email' },
      {
        id: 'age',
        label: 'Age',
        align: 'center',
        sortable: true,
        render: (value) => <Chip label={`${value} years old`} size="small" />,
      },
      { id: 'role', label: 'Role' },
      {
        id: 'status',
        label: 'Status',
        render: (value: 'active' | 'inactive' | 'pending') => {
          const colorMap = {
            active: 'success' as const,
            inactive: 'default' as const,
            pending: 'warning' as const,
          };
          const labelMap = {
            active: 'Active',
            inactive: 'Inactive',
            pending: 'Pending',
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
 * Highlight rows
 * Highlight specific rows based on conditions
 */
export const HighlightRows: Story = {
  args: {
    columns: [
      { id: 'name', label: 'Name', sortable: true },
      { id: 'email', label: 'Email' },
      { id: 'age', label: 'Age', align: 'center', sortable: true },
      { id: 'role', label: 'Role' },
      {
        id: 'status',
        label: 'Status',
        render: (value: 'active' | 'inactive' | 'pending') => {
          const colorMap = {
            active: 'success' as const,
            inactive: 'default' as const,
            pending: 'warning' as const,
          };
          const labelMap = {
            active: 'Active',
            inactive: 'Inactive',
            pending: 'Pending',
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
 * Expandable table
 * Click expand button to show details
 */
export const Expandable: Story = {
  args: {
    columns: [
      { id: 'name', label: 'Name', sortable: true },
      { id: 'email', label: 'Email' },
      { id: 'role', label: 'Role' },
      {
        id: 'status',
        label: 'Status',
        render: (value: 'active' | 'inactive' | 'pending') => {
          const colorMap = {
            active: 'success' as const,
            inactive: 'default' as const,
            pending: 'warning' as const,
          };
          const labelMap = {
            active: 'Active',
            inactive: 'Inactive',
            pending: 'Pending',
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
          Details
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: 1 }}>
          <Typography color="text.secondary">Department：</Typography>
          <Typography>{row.department}</Typography>
          <Typography color="text.secondary">Hire Date：</Typography>
          <Typography>{row.joinDate}</Typography>
          <Typography color="text.secondary">Age：</Typography>
          <Typography>{row.age} years old</Typography>
          <Typography color="text.secondary">Email：</Typography>
          <Typography>{row.email}</Typography>
        </Box>
      </Box>
    ),
  },
};

/**
 * Selectable table
 * Supports multi-select rows
 */
export const Selectable: Story = {
  render: function SelectableTable() {
    const [selected, setSelected] = useState<string[]>([]);

    return (
      <Box>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Selected: {selected.length} rows
        </Typography>
        <DataTable
          columns={[
            { id: 'name', label: 'Name', sortable: true },
            { id: 'email', label: 'Email' },
            { id: 'age', label: 'Age', align: 'center', sortable: true },
            { id: 'role', label: 'Role' },
            { id: 'department', label: 'Department' },
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
 * Paginated table
 * Display pagination controls
 */
export const WithPagination: Story = {
  render: function PaginatedTable() {
    const [page, setPage] = useState(1);

    return (
      <DataTable
        columns={[
          { id: 'name', label: 'Name', sortable: true },
          { id: 'email', label: 'Email' },
          { id: 'role', label: 'Role' },
          { id: 'department', label: 'Department' },
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
 * loadingStatus
 * Display loading indicator
 */
export const Loading: Story = {
  args: {
    columns: basicColumns,
    data: sampleUsers,
    loading: true,
  },
};

/**
 * empty dataStatus
 * Display when no data
 */
export const Empty: Story = {
  args: {
    columns: basicColumns,
    data: [],
    emptyText: 'No user data available',
  },
};

/**
 * Fixed header
 * Header fixed at top when scrolling
 */
export const StickyHeader: Story = {
  args: {
    columns: [
      { id: 'name', label: 'Name', sortable: true },
      { id: 'email', label: 'Email' },
      { id: 'age', label: 'Age', align: 'center', sortable: true },
      { id: 'role', label: 'Role' },
      { id: 'department', label: 'Department' },
    ],
    data: [...sampleUsers, ...sampleUsers, ...sampleUsers],
    maxHeight: 400,
  },
};

/**
 * Expand icon style - downward
 * Change expand icon to downward/upward style
 */
export const ExpandIconDown: Story = {
  args: {
    columns: [
      { id: 'name', label: 'Name', sortable: true },
      { id: 'email', label: 'Email' },
      { id: 'role', label: 'Role' },
    ],
    data: sampleUsers,
    expandable: true,
    expandIconPosition: 'down',
    renderExpandedRow: (row: User) => (
      <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
        <Typography variant="subtitle2">Details</Typography>
        <Typography variant="body2">{row.department}</Typography>
      </Box>
    ),
  },
};

/**
 * Full feature showcase
 * Showcase all features simultaneously
 */
export const FullFeatures: Story = {
  render: function FullFeaturesTable() {
    const [selected, setSelected] = useState<string[]>([]);
    const [page, setPage] = useState(1);

    return (
      <Box>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Selected: {selected.length} rows | Current page：{page}
        </Typography>
        <DataTable
          columns={[
            { id: 'name', label: 'Name', sortable: true, filterable: true },
            {
              id: 'email',
              label: 'Email',
              sortable: true,
              filterable: true,
            },
            {
              id: 'age',
              label: 'Age',
              align: 'center',
              sortable: true,
              render: (value) => (
                <Chip label={`${value} years old`} size="small" />
              ),
            },
            { id: 'role', label: 'Role', sortable: true, filterable: true },
            {
              id: 'status',
              label: 'Status',
              render: (value: 'active' | 'inactive' | 'pending') => {
                const colorMap = {
                  active: 'success' as const,
                  inactive: 'default' as const,
                  pending: 'warning' as const,
                };
                const labelMap = {
                  active: 'Active',
                  inactive: 'Inactive',
                  pending: 'Pending',
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
                Details
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '120px 1fr',
                  gap: 1,
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Department：
                </Typography>
                <Typography variant="body2">{row.department}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Hire Date：
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
