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
          'Skeleton placeholder for filter toolbars shown while content is loading. Supports an optional search bar and a configurable number of filter dropdowns.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    showSearch: {
      control: 'boolean',
      description: 'Whether to show the search field skeleton',
      table: {
        defaultValue: { summary: 'true' },
      },
    },
    filterCount: {
      control: { type: 'number', min: 0, max: 8 },
      description: 'Number of filter skeleton items to display',
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
