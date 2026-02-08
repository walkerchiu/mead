import type { Meta, StoryObj } from '@storybook/react';
import { Pagination } from './Pagination';
import { useState } from 'react';
import { Box, Typography } from '@mui/material';

const meta = {
  title: 'Molecules/Pagination',
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

export const Default: Story = {
  args: {
    count: 10,
    page: 1,
    onChange: () => {},
  },
};

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

export const Outlined: Story = {
  args: {
    count: 10,
    page: 5,
    variant: 'outlined',
    onChange: () => {},
  },
};

export const Rounded: Story = {
  args: {
    count: 10,
    page: 5,
    shape: 'rounded',
    onChange: () => {},
  },
};

export const Small: Story = {
  args: {
    count: 10,
    page: 5,
    size: 'small',
    onChange: () => {},
  },
};

export const Large: Story = {
  args: {
    count: 10,
    page: 5,
    size: 'large',
    onChange: () => {},
  },
};

export const WithFirstLast: Story = {
  args: {
    count: 20,
    page: 10,
    showFirstButton: true,
    showLastButton: true,
    onChange: () => {},
  },
};

export const Secondary: Story = {
  args: {
    count: 10,
    page: 5,
    color: 'secondary',
    onChange: () => {},
  },
};

export const Disabled: Story = {
  args: {
    count: 10,
    page: 5,
    disabled: true,
    onChange: () => {},
  },
};

export const Interactive: Story = {
  render: () => {
    const [page, setPage] = useState(1);
    return (
      <Box>
        <Typography variant="body2" sx={{ mb: 2, textAlign: 'center' }}>
          Current page: {page}
        </Typography>
        <Pagination count={10} page={page} onChange={setPage} />
      </Box>
    );
  },
};

export const WithInfoInteractive: Story = {
  render: () => {
    const [page, setPage] = useState(1);
    const totalItems = 95;
    const itemsPerPage = 10;

    return (
      <Box>
        <Typography variant="body2" sx={{ mb: 2, textAlign: 'center' }}>
          Current page: {page} / 10
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

export const CustomSiblingCount: Story = {
  render: () => {
    const [page, setPage] = useState(10);
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box>
          <Typography variant="body2" sx={{ mb: 1 }}>
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
          <Typography variant="body2" sx={{ mb: 1 }}>
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
          <Typography variant="body2" sx={{ mb: 1 }}>
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

export const Variants: Story = {
  render: () => {
    const [page, setPage] = useState(5);
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box>
          <Typography variant="body2" sx={{ mb: 1 }}>
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
          <Typography variant="body2" sx={{ mb: 1 }}>
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
          <Typography variant="body2" sx={{ mb: 1 }}>
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
          <Typography variant="body2" sx={{ mb: 1 }}>
            Outlined + Rounded
          </Typography>
          <Pagination
            count={10}
            page={page}
            onChange={setPage}
            variant="outlined"
            shape="rounded"
          />
        </Box>
      </Box>
    );
  },
};

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
