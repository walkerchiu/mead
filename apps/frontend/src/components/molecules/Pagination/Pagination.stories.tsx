import type { Meta, StoryObj } from '@storybook/nextjs';
import { Pagination } from './Pagination';
import { useState } from 'react';
import { Box, Typography } from '@mui/material';

const meta = {
  title: 'HQ Scope/Molecules/Pagination',
  component: Pagination,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    count: {
      control: { type: 'number', min: 1, max: 100 },
      description: 'Total pages',
    },
    page: {
      control: { type: 'number', min: 1 },
      description: 'Current page number',
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'Component size',
    },
    variant: {
      control: 'select',
      options: ['text', 'outlined'],
      description: 'Component variant',
    },
    shape: {
      control: 'select',
      options: ['circular', 'rounded'],
      description: 'Button shape',
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'standard'],
      description: 'Component color',
    },
  },
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

// 1. Default - Basic pagination
export const Default: Story = {
  args: {
    count: 10,
    page: 1,
    onChange: () => {},
  },
};

// 2. WithInfo - Display pagination information
export const WithInfo: Story = {
  args: {
    count: 10,
    page: 1,
    showInfo: true,
    totalItems: 95,
    itemsPerPage: 10,
    onChange: () => {},
  },
};

// 3. Disabled - Disabled state
export const Disabled: Story = {
  args: {
    count: 10,
    page: 5,
    disabled: true,
    onChange: () => {},
  },
};

// 4. AllVariants - All variant combinations
export const AllVariants: Story = {
  render: () => {
    const [page, setPage] = useState(5);
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
            Text (default)
          </Typography>
          <Pagination
            count={10}
            page={page}
            onChange={setPage}
            variant="text"
          />
        </Box>
        <Box>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
            Outlined
          </Typography>
          <Pagination
            count={10}
            page={page}
            onChange={setPage}
            variant="outlined"
          />
        </Box>
        <Box>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
            Rounded
          </Typography>
          <Pagination
            count={10}
            page={page}
            onChange={setPage}
            shape="rounded"
          />
        </Box>
        <Box>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
            Secondary Color
          </Typography>
          <Pagination
            count={10}
            page={page}
            onChange={setPage}
            color="secondary"
          />
        </Box>
      </Box>
    );
  },
};

// 5. Sizes - All size variants
export const Sizes: Story = {
  render: () => {
    const [page, setPage] = useState(5);
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
            Small
          </Typography>
          <Pagination count={10} page={page} onChange={setPage} size="small" />
        </Box>
        <Box>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
            Medium (default)
          </Typography>
          <Pagination count={10} page={page} onChange={setPage} size="medium" />
        </Box>
        <Box>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
            Large
          </Typography>
          <Pagination count={10} page={page} onChange={setPage} size="large" />
        </Box>
      </Box>
    );
  },
};

// 6. WithFirstLast - Show first and last page buttons
export const WithFirstLast: Story = {
  args: {
    count: 20,
    page: 10,
    showFirstButton: true,
    showLastButton: true,
    onChange: () => {},
  },
};

// 7. CustomSiblingCount - Control number of sibling pages shown
export const CustomSiblingCount: Story = {
  render: () => {
    const [page, setPage] = useState(10);
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
            siblingCount = 0
          </Typography>
          <Pagination
            count={20}
            page={page}
            onChange={setPage}
            siblingCount={0}
          />
        </Box>
        <Box>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
            siblingCount = 1 (default)
          </Typography>
          <Pagination
            count={20}
            page={page}
            onChange={setPage}
            siblingCount={1}
          />
        </Box>
        <Box>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
            siblingCount = 2
          </Typography>
          <Pagination
            count={20}
            page={page}
            onChange={setPage}
            siblingCount={2}
          />
        </Box>
      </Box>
    );
  },
};

// 8. Interactive - Interactive pagination with current page display
export const Interactive: Story = {
  render: () => {
    const [page, setPage] = useState(1);
    const totalItems = 95;
    const itemsPerPage = 10;

    return (
      <Box>
        <Typography variant="body2" sx={{ mb: 2, textAlign: 'center' }}>
          Current page: {page} / {Math.ceil(totalItems / itemsPerPage)}
        </Typography>
        <Pagination
          count={Math.ceil(totalItems / itemsPerPage)}
          page={page}
          onChange={setPage}
          showInfo
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
        />
      </Box>
    );
  },
};

// 9. ManyPages - Pagination with many pages
export const ManyPages: Story = {
  render: () => {
    const [page, setPage] = useState(50);
    return (
      <Box>
        <Typography variant="body2" sx={{ mb: 2, textAlign: 'center' }}>
          Current page: {page} / 100
        </Typography>
        <Pagination
          count={100}
          page={page}
          onChange={setPage}
          showFirstButton
          showLastButton
        />
      </Box>
    );
  },
};

// 10. TablePagination - Real-world table pagination example
export const TablePagination: Story = {
  render: () => {
    const [page, setPage] = useState(1);
    const itemsPerPage = 10;
    const totalItems = 156;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    return (
      <Box sx={{ width: '100%' }}>
        <Typography variant="h6" gutterBottom>
          User List
        </Typography>
        <Box
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            p: 2,
            mb: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            [Table content will be displayed here]
          </Typography>
        </Box>
        <Pagination
          count={totalPages}
          page={page}
          onChange={setPage}
          showInfo
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          showFirstButton
          showLastButton
        />
      </Box>
    );
  },
};
