import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import type { PlanTimelineYear } from '@/types/plan';
import { render, screen } from '@/test/test-utils';

import { PlanTimeline } from './PlanTimeline';

const MULTI_YEAR_TIMELINE: PlanTimelineYear[] = [
  {
    year: 2026,
    events: [
      {
        id: 'demo-2026',
        kind: 'range',
        precision: 'month',
        start: { month: 3 },
        end: { month: 5 },
        dateLabel: '3-5月',
        title: '校園巡迴展',
      },
    ],
  },
  {
    year: 2027,
    label: '隔年（2027）',
    events: [
      {
        id: 'demo-2027',
        kind: 'point',
        precision: 'month',
        start: { month: 9 },
        dateLabel: '9月',
        title: '出發',
      },
    ],
  },
];

describe('PlanTimeline', () => {
  it('does not lock body scroll when opening the year menu', async () => {
    const user = userEvent.setup();

    render(<PlanTimeline timelines={MULTI_YEAR_TIMELINE} />);

    await user.click(screen.getByRole('button', { name: /2026年/ }));

    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(document.body.style.overflow).not.toBe('hidden');
    expect(document.body.style.paddingRight).toBe('');
  });
});
