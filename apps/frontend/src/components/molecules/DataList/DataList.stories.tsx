import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';
import { DataList, type DataListItem } from './DataList';
import { Icon } from '@/components/atoms';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const meta = {
  title: 'Shared/Molecules/DataList',
  component: DataList,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof DataList>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleItems: DataListItem[] = [
  {
    id: '1',
    title: 'Important Notification',
    subtitle: 'System maintenance scheduled for tonight',
    badge: { label: 'Urgent', color: 'error' },
    priority: 'high',
  },
  {
    id: '2',
    title: 'New Feature Launch',
    subtitle: 'We have launched a brand new dashboard',
    badge: { label: 'New', color: 'info' },
    priority: 'normal',
  },
  {
    id: '3',
    title: 'Meeting Reminder',
    subtitle: 'Meeting tomorrow at 2 PM',
    badge: { label: 'To Do', color: 'warning' },
    priority: 'normal',
  },
];

export const Basic: Story = {
  args: {
    items: sampleItems,
  },
};

export const WithIcons: Story = {
  args: {
    items: sampleItems.map((item) => ({
      ...item,
      icon: <Icon>📌</Icon>,
    })),
  },
};

export const Expandable: Story = {
  args: {
    items: sampleItems,
    expandable: true,
    renderExpandedContent: (item) => (
      <Box>
        <Typography variant="body2">Details: {item.subtitle}</Typography>
      </Box>
    ),
  },
};

export const Selectable: Story = {
  render: function SelectableList() {
    const [selected, setSelected] = useState<string[]>([]);
    return (
      <Box>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Selected: {selected.length} items
        </Typography>
        <DataList
          items={sampleItems}
          selectable
          selectedItems={selected}
          onSelectionChange={setSelected}
        />
      </Box>
    );
  },
};

export const WithFilter: Story = {
  render: function FilterableList() {
    const [filter, setFilter] = useState('');
    const filtered = sampleItems.filter(
      (item) => item.title.includes(filter) || item.subtitle?.includes(filter),
    );
    return (
      <DataList
        items={filtered}
        filterValue={filter}
        onFilterChange={setFilter}
      />
    );
  },
};

export const ExpandIconDown: Story = {
  args: {
    items: sampleItems,
    expandable: true,
    expandIconPosition: 'down',
    renderExpandedContent: (item) => (
      <Box>
        <Typography variant="body2">Details: {item.subtitle}</Typography>
      </Box>
    ),
  },
};

export const FullFeatures: Story = {
  render: function FullList() {
    const [selected, setSelected] = useState<string[]>([]);
    const [filter, setFilter] = useState('');
    const [sort, setSort] = useState('title');
    const filtered = sampleItems.filter((item) => item.title.includes(filter));
    return (
      <DataList
        items={filtered}
        selectable
        selectedItems={selected}
        onSelectionChange={setSelected}
        expandable
        renderExpandedContent={(item) => (
          <Typography>{item.subtitle}</Typography>
        )}
        filterValue={filter}
        onFilterChange={setFilter}
        sortOptions={[
          { value: 'title', label: 'Title' },
          { value: 'priority', label: 'Priority' },
        ]}
        sortBy={sort}
        onSortChange={setSort}
        highlightItem={(item) => item.badge?.color === 'error'}
      />
    );
  },
};
