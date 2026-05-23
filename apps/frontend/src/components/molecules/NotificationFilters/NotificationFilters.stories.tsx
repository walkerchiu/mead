import type { Meta, StoryObj } from '@storybook/nextjs';
import { NotificationFilters } from './NotificationFilters';
import { useState } from 'react';
import type {
  NotificationTypeFilter,
  ReadStatusFilter,
} from './NotificationFilters';

const meta = {
  title: 'HQ Scope/Molecules/NotificationFilters',
  component: NotificationFilters,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof NotificationFilters>;

export default meta;
type Story = StoryObj<typeof meta>;

// Interactive story with state
export const Default: Story = {
  render: () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] =
      useState<NotificationTypeFilter>('all');
    const [readStatus, setReadStatus] = useState<ReadStatusFilter>('all');

    return (
      <NotificationFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        readStatus={readStatus}
        onReadStatusChange={setReadStatus}
        defaultExpanded={true}
        resultCount={156}
        totalCount={156}
      />
    );
  },
};

export const WithSearch: Story = {
  render: () => {
    const [searchQuery, setSearchQuery] = useState('test query');
    const [selectedType, setSelectedType] =
      useState<NotificationTypeFilter>('all');
    const [readStatus, setReadStatus] = useState<ReadStatusFilter>('all');

    return (
      <NotificationFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        readStatus={readStatus}
        onReadStatusChange={setReadStatus}
        defaultExpanded={true}
        resultCount={23}
        totalCount={156}
      />
    );
  },
};

export const FilteredByType: Story = {
  render: () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] =
      useState<NotificationTypeFilter>('ERROR');
    const [readStatus, setReadStatus] = useState<ReadStatusFilter>('all');

    return (
      <NotificationFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        readStatus={readStatus}
        onReadStatusChange={setReadStatus}
        defaultExpanded={true}
        resultCount={8}
        totalCount={156}
      />
    );
  },
};

export const FilteredByStatus: Story = {
  render: () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] =
      useState<NotificationTypeFilter>('all');
    const [readStatus, setReadStatus] = useState<ReadStatusFilter>('unread');

    return (
      <NotificationFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        readStatus={readStatus}
        onReadStatusChange={setReadStatus}
        defaultExpanded={true}
        resultCount={42}
        totalCount={156}
      />
    );
  },
};

export const AllFiltersActive: Story = {
  render: () => {
    const [searchQuery, setSearchQuery] = useState('notification');
    const [selectedType, setSelectedType] =
      useState<NotificationTypeFilter>('INFO');
    const [readStatus, setReadStatus] = useState<ReadStatusFilter>('unread');

    return (
      <NotificationFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        readStatus={readStatus}
        onReadStatusChange={setReadStatus}
        defaultExpanded={true}
        resultCount={12}
        totalCount={156}
      />
    );
  },
};

export const Collapsed: Story = {
  render: () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] =
      useState<NotificationTypeFilter>('all');
    const [readStatus, setReadStatus] = useState<ReadStatusFilter>('all');

    return (
      <NotificationFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        readStatus={readStatus}
        onReadStatusChange={setReadStatus}
        defaultExpanded={false}
        resultCount={156}
        totalCount={156}
      />
    );
  },
};
