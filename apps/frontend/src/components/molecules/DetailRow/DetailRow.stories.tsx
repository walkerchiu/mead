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
 * DetailRow 是統一的詳細資訊顯示元件，支援三種版面模式：
 *
 * ## 版面模式
 * - **horizontal**：水平版面（圖示-標籤-值水平排列）
 * - **vertical**：垂直版面（標籤在上、值在下）
 * - **auto**：自動模式（依內容長度選擇版面）
 *
 * ## 功能特性
 * - 選用的圖示顯示
 * - 複製功能
 * - 自訂樣式
 * - 響應式版面
 *
 * ## 何時使用
 * - 在 modal 中顯示詳細資訊
 * - 在卡片中顯示鍵值對
 * - 呈現結構化資料
 * - 稽核日誌詳情
 * - session 資訊
 */
const meta = {
  title: 'Shared/Molecules/DetailRow',
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
      description: '選用的圖示元素',
    },
    label: {
      control: 'text',
      description: '欄位標籤',
    },
    value: {
      control: 'text',
      description: '欄位值',
    },
    copyable: {
      control: 'boolean',
      description: '啟用複製功能',
    },
    fieldName: {
      control: 'text',
      description: '用於追蹤複製狀態的欄位名稱',
    },
    layout: {
      control: 'select',
      options: ['horizontal', 'vertical', 'auto'],
      description: '版面模式',
    },
    autoThreshold: {
      control: 'number',
      description: 'auto 模式的門檻（字元數）',
    },
  },
} satisfies Meta<typeof DetailRow>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 水平版面模式，適合較短的內容
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
 * 垂直版面模式，適合較長的內容
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
 * auto 模式 - 短內容使用水平版面
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
 * auto 模式 - 長內容使用垂直版面
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
 * 含複製功能的水平版面
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
 * 含複製功能的垂直版面
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
 * 不含圖示的水平版面
 */
export const WithoutIcon: Story = {
  args: {
    label: 'Phone',
    value: '+886-2-1234-5678',
    layout: 'horizontal',
  },
};

/**
 * 含 ReactNode 值的垂直版面
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
 * 自訂樣式
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
 * 多個 DetailRow 組合
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
 * auto 模式門檻比較
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
 * 稽核日誌詳情範例
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
 * Session 詳情範例
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
