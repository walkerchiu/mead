import type { Meta, StoryObj } from '@storybook/nextjs';
import { FiltersSkeleton } from './FiltersSkeleton';

const meta = {
  title: 'Shared/Atoms/Skeleton/FiltersSkeleton',
  component: FiltersSkeleton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '內容載入時顯示於篩選工具列的骨架佔位元件。支援選用的搜尋列，以及可設定數量的篩選下拉選單。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    showSearch: {
      control: 'boolean',
      description: '是否顯示搜尋欄位骨架',
      table: {
        defaultValue: { summary: 'true' },
      },
    },
    filterCount: {
      control: { type: 'number', min: 0, max: 8 },
      description: '要顯示的篩選骨架項目數量',
      table: {
        defaultValue: { summary: '2' },
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '700px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FiltersSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    showSearch: true,
    filterCount: 2,
  },
};

export const WithSearchOnly: Story = {
  args: {
    showSearch: true,
    filterCount: 0,
  },
};

export const FiltersOnly: Story = {
  args: {
    showSearch: false,
    filterCount: 3,
  },
};

export const ManyFilters: Story = {
  args: {
    showSearch: true,
    filterCount: 4,
  },
};

export const SingleFilter: Story = {
  args: {
    showSearch: true,
    filterCount: 1,
  },
};
