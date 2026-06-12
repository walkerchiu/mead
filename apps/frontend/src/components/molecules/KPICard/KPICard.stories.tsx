import type { Meta, StoryObj } from '@storybook/nextjs';
import { Box, Grid } from '@mui/material';
import {
  People as UsersIcon,
  RateReview as ReviewIcon,
  NotificationsNone as NotificationIcon,
  Assessment as AuditIcon,
  Devices as SessionIcon,
  Schedule as CronIcon,
} from '@mui/icons-material';
import { KPICard } from './KPICard';

/**
 * KPICard 用於 Dashboard 首頁展示關鍵指標數據。
 *
 * **設計重點**：
 * - 單一卡片聚焦一個數值，避免資訊過載
 * - 支援 icon、主數值、副標、提示訊息（hint）四層資訊
 * - 可點擊導航（`href`）或自訂 `onClick`
 * - 內建 loading skeleton
 * - 可透過 `accentColor` 切換強調色（token 形式：`primary.main`、`warning.main` 等）
 * - 在 Grid 中會自動撐滿容器高度，方便同列對齊
 *
 * **使用位置**：
 * - Dashboard 首頁（`/dashboard`）
 * - HQ 系統健康度區塊
 *
 * **相關元件**：
 * - 若需要展示**結構化內容**（圖片、長文、多按鈕等），請改用 [`<Card>`](/docs/molecules-card--docs) — 它是通用的卡片容器。
 * - 兩者底層都使用 MUI `<Card>` 作為容器，視覺基調（elevation / border / radius）一致。
 */
const meta = {
  title: 'Shared/Molecules/KPICard',
  component: KPICard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Dashboard KPI card — displays a single key metric with support for icon, value, subtitle, hint, click-through navigation, and loading skeleton.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text', description: 'Card title' },
    value: {
      control: 'text',
      description: 'Main value (number | string | ReactNode)',
    },
    subtitle: {
      control: 'text',
      description: 'Subtitle (usually a unit or state description)',
    },
    accentColor: {
      control: 'select',
      options: [
        'primary.main',
        'secondary.main',
        'error.main',
        'warning.main',
        'info.main',
        'success.main',
      ],
      description: 'Accent color for the icon and hover border',
      table: { defaultValue: { summary: 'primary.main' } },
    },
    href: {
      control: 'text',
      description: 'Click-through path (mutually exclusive with onClick)',
    },
    loading: { control: 'boolean', description: 'Loading skeleton' },
    hint: { control: 'text', description: 'Hint text at bottom-right' },
    hintColor: {
      control: 'select',
      options: ['default', 'warning', 'error', 'success'],
      description: 'Hint text color tone',
      table: { defaultValue: { summary: 'default' } },
    },
  },
  decorators: [
    (Story) => (
      <Box sx={{ width: 280 }}>
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof KPICard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Basic card */
export const Default: Story = {
  args: {
    title: 'Active Sessions',
    value: 147,
    subtitle: 'currently online',
    icon: <SessionIcon />,
    href: '/hq/sessions',
  },
};

/** Loading skeleton */
export const Loading: Story = {
  args: {
    title: 'Active Sessions',
    icon: <SessionIcon />,
    loading: true,
  },
};

/** With warning hint (e.g. items needing attention) */
export const WithWarningHint: Story = {
  args: {
    title: 'Cron Jobs',
    value: 12,
    subtitle: 'jobs configured',
    icon: <CronIcon />,
    hint: '2 failed last 24h',
    hintColor: 'warning',
    accentColor: 'warning.main',
    href: '/hq/cron-jobs',
  },
};

/** Success hint (cleared state) */
export const WithSuccessHint: Story = {
  args: {
    title: 'Pending Review',
    value: 0,
    subtitle: 'items',
    icon: <ReviewIcon />,
    hint: 'All caught up ✓',
    hintColor: 'success',
  },
};

/** No value (degrades to link card) */
export const NoValue: Story = {
  args: {
    title: 'Activity Log',
    value: '—',
    icon: <AuditIcon />,
    href: '/hq/audit-logs',
  },
};

/** 自訂 onClick（非 href 導航）*/
export const ClickHandler: Story = {
  args: {
    title: '未讀通知',
    value: 5,
    subtitle: '則',
    icon: <NotificationIcon />,
    accentColor: 'warning.main',
    onClick: () => alert('點擊！'),
  },
};

/** 各種狀態色 */
export const AccentColors: Story = {
  render: () => (
    <Grid container spacing={2} sx={{ width: 900 }}>
      {[
        { title: 'Primary', color: 'primary.main' },
        { title: 'Secondary', color: 'secondary.main' },
        { title: 'Info', color: 'info.main' },
        { title: 'Success', color: 'success.main' },
        { title: 'Warning', color: 'warning.main' },
        { title: 'Error', color: 'error.main' },
      ].map((c) => (
        <Grid key={c.title} size={4}>
          <KPICard
            title={c.title}
            value={42}
            subtitle="件"
            icon={<UsersIcon />}
            accentColor={c.color}
            href="#"
          />
        </Grid>
      ))}
    </Grid>
  ),
  parameters: { layout: 'padded' },
};

/** HQ Dashboard 系統健康度 */
export const SystemHealth: Story = {
  render: () => (
    <Grid container spacing={2} sx={{ width: 700 }}>
      <Grid size={6}>
        <KPICard
          title="活躍會話"
          value={147}
          icon={<SessionIcon />}
          accentColor="info.main"
          href="/hq/sessions"
        />
      </Grid>
      <Grid size={6}>
        <KPICard
          title="Cron 健康度"
          value="100%"
          icon={<CronIcon />}
          accentColor="success.main"
          hint="All OK"
          hintColor="success"
          href="/hq/cron-jobs"
        />
      </Grid>
    </Grid>
  ),
  parameters: { layout: 'padded' },
};
