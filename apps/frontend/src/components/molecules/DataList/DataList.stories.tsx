import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { DataList, type DataListItem } from './DataList';
import { Icon } from '@/components/atoms';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const meta = {
  title: 'Molecules/DataList',
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
    title: '重要通知',
    subtitle: '系統將於今晚進行維護',
    badge: { label: '緊急', color: 'error' },
    priority: 'high',
  },
  {
    id: '2',
    title: '新功能上線',
    subtitle: '我們推出了全新的儀表板',
    badge: { label: '新', color: 'info' },
    priority: 'normal',
  },
  {
    id: '3',
    title: '會議提醒',
    subtitle: '明天下午 2 點開會',
    badge: { label: '待辦', color: 'warning' },
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
        <Typography variant="body2">詳細內容：{item.subtitle}</Typography>
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
          已選擇：{selected.length} 項
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
        <Typography variant="body2">詳細內容：{item.subtitle}</Typography>
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
          { value: 'title', label: '標題' },
          { value: 'priority', label: '優先級' },
        ]}
        sortBy={sort}
        onSortChange={setSort}
        highlightItem={(item) => item.badge?.color === 'error'}
      />
    );
  },
};
