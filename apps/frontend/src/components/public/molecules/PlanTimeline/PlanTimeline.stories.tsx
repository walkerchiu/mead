import type { Meta, StoryObj } from '@storybook/nextjs';

import Box from '@mui/material/Box';

import type { PlanTimelineYear } from '@/types/plan';

import { PlanTimeline } from './PlanTimeline';

/**
 * 計畫時程軸（資料驅動）：年度固定 1–12 月軸，期間以長條、時間點以圓點呈現，
 * 重疊期間自動分列，hover／點擊顯示 tooltip；多年度以年度切換鈕呈現。
 */
const meta = {
  title: 'Public Scope/Molecules/PlanTimeline',
  component: PlanTimeline,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <Box sx={{ maxWidth: 640, mx: 'auto' }}>
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof PlanTimeline>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 月份精度：單一年度、點與期間混合。 */
const MONTH_TIMELINE: PlanTimelineYear[] = [
  {
    year: 2026,
    events: [
      {
        id: 'demo-campus',
        kind: 'range',
        precision: 'month',
        start: { month: 3 },
        end: { month: 5 },
        dateLabel: '3-5月',
        title: '校園巡迴展',
      },
      {
        id: 'demo-grant',
        kind: 'range',
        precision: 'month',
        start: { month: 6 },
        end: { month: 7 },
        dateLabel: '6-7月',
        title: '獎勵金申請開放',
      },
      {
        id: 'demo-ceremony',
        kind: 'point',
        precision: 'month',
        start: { month: 12 },
        dateLabel: '12月',
        title: '頒獎典禮',
      },
    ],
  },
];

/** 日期精度：期間重疊，會自動分列（lane）。 */
const DAY_TIMELINE: PlanTimelineYear[] = [
  {
    year: 2026,
    events: [
      {
        id: 'demo-promo',
        kind: 'range',
        precision: 'month',
        start: { month: 1 },
        end: { month: 7 },
        dateLabel: '1-7月',
        title: '宣傳期',
      },
      {
        id: 'demo-reg',
        kind: 'range',
        precision: 'day',
        start: { month: 4, day: 27 },
        end: { month: 7, day: 6 },
        dateLabel: '4/27(一)-7/6(一)',
        title: '報名期間',
        note: '開放線上報名與作品資料送件。',
      },
      {
        id: 'demo-final',
        kind: 'point',
        precision: 'day',
        start: { month: 10, day: 1 },
        dateLabel: '10/1(四)',
        title: '實體決選',
      },
    ],
  },
];

/** 多年度：以年度切換鈕在當年／隔年之間切換。 */
const MULTI_YEAR: PlanTimelineYear[] = [
  MONTH_TIMELINE[0],
  {
    year: 2027,
    label: '隔年（2027）',
    events: [
      {
        id: 'demo-overseas',
        kind: 'range',
        precision: 'month',
        start: { month: 1 },
        end: { month: 5 },
        dateLabel: '1-5月',
        title: '海外決選',
      },
      {
        id: 'demo-depart',
        kind: 'point',
        precision: 'month',
        start: { month: 9 },
        dateLabel: '9月',
        title: '出發',
      },
    ],
  },
];

export const MonthPrecision: Story = {
  args: { timelines: MONTH_TIMELINE },
};

export const DayPrecisionOverlap: Story = {
  args: { timelines: DAY_TIMELINE },
};

export const MultiYear: Story = {
  args: { timelines: MULTI_YEAR },
};

/** 窄版（手機卡片）：月份固定寬、整排超出容器寬，可橫向滑動閱讀。 */
export const Scroll: Story = {
  args: { timelines: MONTH_TIMELINE, variant: 'scroll' },
  decorators: [
    (Story) => (
      <Box sx={{ maxWidth: 320, mx: 'auto' }}>
        <Story />
      </Box>
    ),
  ],
};
