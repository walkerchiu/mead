import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { PlanTimelineYear } from '@/types/plan';
import { render, screen, waitFor } from '@/test/test-utils';

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
  beforeEach(() => {
    Object.defineProperty(window, 'scrollTo', {
      configurable: true,
      value: vi.fn(),
    });
  });

  it('does not lock body scroll when opening the year menu', async () => {
    const user = userEvent.setup();

    render(<PlanTimeline timelines={MULTI_YEAR_TIMELINE} />);

    await user.click(screen.getByRole('button', { name: /2026年/ }));

    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(document.body.style.overflow).not.toBe('hidden');
    expect(document.body.style.paddingRight).toBe('');
  });

  it('keeps focus on the year trigger when opening the year menu', async () => {
    const user = userEvent.setup();

    render(<PlanTimeline timelines={MULTI_YEAR_TIMELINE} />);

    const trigger = screen.getByRole('button', { name: /2026年/ });
    await user.click(trigger);

    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(document.activeElement).toBe(trigger);
  });

  it('defaults the tooltip to the current month instead of the earliest month-covering event', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 7, 5));

    try {
      render(
        <PlanTimeline
          timelines={[
            {
              year: 2026,
              events: [
                {
                  id: 'late-july-selection',
                  kind: 'range',
                  precision: 'day',
                  start: { month: 7, day: 27 },
                  end: { month: 8, day: 2 },
                  dateLabel: '7/27(一)-8/2(日)',
                  title: '初選',
                },
                {
                  id: 'august-announcement',
                  kind: 'point',
                  precision: 'day',
                  start: { month: 8, day: 24 },
                  dateLabel: '8/24(一)',
                  title: '入圍公告',
                },
              ],
            },
          ]}
        />,
      );

      await waitFor(() =>
        expect(screen.getByRole('tooltip')).toHaveTextContent('8/24(一)'),
      );
      expect(screen.getByRole('tooltip')).toHaveTextContent('入圍公告');
    } finally {
      vi.useRealTimers();
    }
  });
});
