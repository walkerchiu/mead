import type { Meta, StoryObj } from '@storybook/nextjs';
import { DetailRow } from './DetailRow';
import {
  Person,
  Email,
  Phone,
  LocationOn,
  CalendarToday,
  Description,
  Link as LinkIcon,
} from '@mui/icons-material';
import { Box, Paper } from '@mui/material';

/**
 * DetailRow is a unified detail information display component that supports three layout modes:
 *
 * ## Layout Modes
 * - **horizontal**: Horizontal layout (icon-label-value arranged horizontally)
 * - **vertical**: Vertical layout (label on top, value below)
 * - **auto**: Automatic mode (chooses layout based on content length)
 *
 * ## Features
 * - Optional icon display
 * - Copy functionality
 * - Custom styling
 * - Responsive layout
 *
 * ## When to Use
 * - Displaying detail information in modals
 * - Showing key-value pairs in cards
 * - Presenting structured data
 * - Audit log details
 * - Session information
 */
const meta = {
  title: 'Molecules/DetailRow',
  component: DetailRow,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
DetailRow is a unified detail information display component that supports three layout modes:

- **horizontal**: Horizontal layout (icon-label-value arranged horizontally)
- **vertical**: Vertical layout (label on top, value below)
- **auto**: Automatic mode (chooses layout based on content length)

Optional features include:
- Icon display
- Copy functionality
- Custom styling
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    icon: {
      control: false,
      description: 'Optional icon element',
    },
    label: {
      control: 'text',
      description: 'Field label',
    },
    value: {
      control: 'text',
      description: 'Field value',
    },
    copyable: {
      control: 'boolean',
      description: 'Enable copy functionality',
    },
    fieldName: {
      control: 'text',
      description: 'Field name for copy status tracking',
    },
    layout: {
      control: 'select',
      options: ['horizontal', 'vertical', 'auto'],
      description: 'Layout mode',
    },
    autoThreshold: {
      control: 'number',
      description: 'Threshold for auto mode (character count)',
    },
  },
} satisfies Meta<typeof DetailRow>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Horizontal layout mode, suitable for shorter content
 */
export const Horizontal: Story = {
  args: {
    icon: <Person fontSize="small" />,
    label: 'Username',
    value: 'John Doe',
    layout: 'horizontal',
  },
};

/**
 * Vertical layout mode, suitable for longer content
 */
export const Vertical: Story = {
  args: {
    icon: <Description fontSize="small" />,
    label: 'Description',
    value:
      'This is a long description that requires vertical layout to display properly. It contains multiple lines of text and detailed information.',
    layout: 'vertical',
  },
};

/**
 * Auto mode - short content uses horizontal layout
 */
export const AutoShort: Story = {
  args: {
    icon: <Email fontSize="small" />,
    label: 'Email',
    value: 'user@example.com',
    layout: 'auto',
    autoThreshold: 30,
  },
};

/**
 * Auto mode - long content uses vertical layout
 */
export const AutoLong: Story = {
  args: {
    icon: <LocationOn fontSize="small" />,
    label: 'Address',
    value:
      "No. 123, Section 4, Roosevelt Road, Da'an District, Taipei City 106, Taiwan",
    layout: 'auto',
    autoThreshold: 30,
  },
};

/**
 * Horizontal layout with copy functionality
 */
export const CopyableHorizontal: Story = {
  args: {
    icon: <LinkIcon fontSize="small" />,
    label: 'Request ID',
    value: 'req_1234567890abcdef',
    copyable: true,
    fieldName: 'requestId',
    layout: 'horizontal',
  },
};

/**
 * Vertical layout with copy functionality
 */
export const CopyableVertical: Story = {
  args: {
    icon: <LinkIcon fontSize="small" />,
    label: 'API Token',
    value:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ',
    copyable: true,
    fieldName: 'apiToken',
    layout: 'vertical',
  },
};

/**
 * Horizontal layout without icon
 */
export const WithoutIcon: Story = {
  args: {
    label: 'Phone',
    value: '+886-2-1234-5678',
    layout: 'horizontal',
  },
};

/**
 * Vertical layout with ReactNode value
 */
export const WithReactNode: Story = {
  args: {
    icon: <CalendarToday fontSize="small" />,
    label: 'Created At',
    value: (
      <Box>
        <Box component="span" sx={{ fontWeight: 600 }}>
          2024-01-15 10:30:45
        </Box>
        <Box component="span" sx={{ ml: 1, color: 'text.secondary' }}>
          (2 hours ago)
        </Box>
      </Box>
    ),
    layout: 'vertical',
  },
};

/**
 * Custom styling
 */
export const CustomStyle: Story = {
  args: {
    icon: <Person fontSize="small" />,
    label: 'User ID',
    value: 'usr_9876543210',
    copyable: true,
    layout: 'horizontal',
    sx: {
      bgcolor: 'grey.50',
      px: 2,
      borderRadius: 1,
    },
  },
};

/**
 * Multiple DetailRows combined
 */
export const MultipleRows: Story = {
  render: () => (
    <Paper sx={{ p: 3 }}>
      <DetailRow
        icon={<Person fontSize="small" />}
        label="Username"
        value="John Doe"
        layout="horizontal"
      />
      <DetailRow
        icon={<Email fontSize="small" />}
        label="Email"
        value="john.doe@example.com"
        copyable
        fieldName="email"
        layout="horizontal"
      />
      <DetailRow
        icon={<Phone fontSize="small" />}
        label="Phone"
        value="+886-2-1234-5678"
        copyable
        fieldName="phone"
        layout="horizontal"
      />
      <DetailRow
        icon={<LocationOn fontSize="small" />}
        label="Address"
        value="No. 123, Section 4, Roosevelt Road, Da'an District, Taipei City 106, Taiwan"
        layout="vertical"
      />
      <DetailRow
        icon={<Description fontSize="small" />}
        label="Notes"
        value="This is a sample note with some additional information about the user."
        layout="vertical"
      />
    </Paper>
  ),
};

/**
 * Auto mode threshold comparison
 */
export const AutoThresholdComparison: Story = {
  render: () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ mb: 2, fontWeight: 600 }}>
          Threshold = 20 (shorter text becomes vertical)
        </Box>
        <DetailRow
          label="Short text"
          value="Short text"
          layout="auto"
          autoThreshold={20}
        />
        <DetailRow
          label="Medium length text"
          value="This is medium length"
          layout="auto"
          autoThreshold={20}
        />
        <DetailRow
          label="Long text"
          value="This is a longer text that exceeds threshold"
          layout="auto"
          autoThreshold={20}
        />
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Box sx={{ mb: 2, fontWeight: 600 }}>
          Threshold = 50 (only longer text becomes vertical)
        </Box>
        <DetailRow
          label="Short text"
          value="Short text"
          layout="auto"
          autoThreshold={50}
        />
        <DetailRow
          label="Medium length text"
          value="This is medium length"
          layout="auto"
          autoThreshold={50}
        />
        <DetailRow
          label="Long text"
          value="This is a much longer text that definitely exceeds the threshold"
          layout="auto"
          autoThreshold={50}
        />
      </Paper>
    </Box>
  ),
};

/**
 * Audit log details example
 */
export const AuditLogExample: Story = {
  render: () => (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ mb: 3, pb: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ fontWeight: 600, fontSize: '1.1rem', mb: 1 }}>
          Basic Information
        </Box>
      </Box>
      <DetailRow
        icon={<CalendarToday fontSize="small" />}
        label="Timestamp"
        value="2024-01-15 10:30:45 (2 hours ago)"
        layout="horizontal"
      />
      <DetailRow
        icon={<LinkIcon fontSize="small" />}
        label="Request ID"
        value="req_1234567890abcdef"
        copyable
        fieldName="requestId"
        layout="horizontal"
      />
      <DetailRow
        icon={<Person fontSize="small" />}
        label="User"
        value="John Doe (john.doe@example.com)"
        layout="horizontal"
      />
      <DetailRow
        icon={<Description fontSize="small" />}
        label="Action"
        value="UPDATE_USER_PROFILE"
        layout="horizontal"
      />
      <DetailRow
        icon={<Description fontSize="small" />}
        label="Description"
        value="User updated their profile information including name, email, and phone number"
        layout="vertical"
      />
    </Paper>
  ),
};

/**
 * Session details example
 */
export const SessionExample: Story = {
  render: () => (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ mb: 3, pb: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ fontWeight: 600, fontSize: '1.1rem', mb: 1 }}>
          Session Information
        </Box>
      </Box>
      <DetailRow
        label="Session ID"
        value="sess_abcdef1234567890"
        copyable
        fieldName="sessionId"
        layout="horizontal"
      />
      <DetailRow
        label="User ID"
        value="usr_9876543210"
        copyable
        fieldName="userId"
        layout="horizontal"
      />
      <DetailRow
        label="IP Address"
        value="192.168.1.100"
        copyable
        fieldName="ipAddress"
        layout="horizontal"
      />
      <DetailRow
        label="Device Info"
        value="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        layout="vertical"
      />
      <DetailRow
        label="Created At"
        value="2024-01-15 08:00:00"
        layout="horizontal"
      />
      <DetailRow
        label="Last Activity"
        value="2024-01-15 10:30:45 (just now)"
        layout="horizontal"
      />
    </Paper>
  ),
};
