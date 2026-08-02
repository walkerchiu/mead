import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { idcPlan, sposadPlan, tisdcPlan } from '@/mocks/fixtures/plans';
import { render, screen } from '@/test/test-utils';

import { PlanCarousel } from './PlanCarousel';

function mockDesktopViewport() {
  Object.defineProperty(window, 'innerWidth', {
    configurable: true,
    value: 1440,
  });
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: query.includes('min-width:1200px'),
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
  Object.defineProperty(window, 'ResizeObserver', {
    configurable: true,
    value: class ResizeObserver {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    },
  });
}

describe('PlanCarousel desktop stage', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows one expanded plan and two collapsed side plans on desktop', () => {
    mockDesktopViewport();

    render(
      <PlanCarousel
        plans={[sposadPlan, idcPlan, tisdcPlan]}
        expandedIndex={0}
        onExpandedIndexChange={vi.fn()}
      />,
    );

    expect(screen.getByTestId('desktop-plan-stage')).toBeInTheDocument();
    expect(screen.getByTestId('desktop-plan-main')).toHaveAttribute(
      'data-plan-id',
      'sposad',
    );
    expect(screen.getAllByTestId('desktop-plan-side')).toHaveLength(2);
    expect(screen.getAllByTestId('desktop-plan-back-photo')).toHaveLength(2);
  });

  it('marks desktop back photos as hoverable motion elements', () => {
    mockDesktopViewport();

    render(
      <PlanCarousel
        plans={[sposadPlan, idcPlan, tisdcPlan]}
        expandedIndex={0}
        onExpandedIndexChange={vi.fn()}
      />,
    );

    expect(screen.getAllByTestId('desktop-plan-back-photo')).toHaveLength(2);
    expect(screen.getAllByTestId('desktop-plan-back-photo-layer')).toHaveLength(
      2,
    );
    screen.getAllByTestId('desktop-plan-back-photo').forEach((photo) => {
      expect(photo).toHaveAttribute('data-hover-effect', 'true');
      expect(photo).toHaveAttribute('data-hover-trigger', 'self');
    });
    screen.getAllByTestId('desktop-plan-back-photo-layer').forEach((layer) => {
      expect(layer).toHaveAttribute('data-hover-layer', 'self');
    });
  });

  it('switches to a collapsed side plan when selected on desktop', async () => {
    const user = userEvent.setup();
    const onExpandedIndexChange = vi.fn();
    mockDesktopViewport();

    render(
      <PlanCarousel
        plans={[sposadPlan, idcPlan, tisdcPlan]}
        expandedIndex={0}
        onExpandedIndexChange={onExpandedIndexChange}
      />,
    );

    await user.click(screen.getAllByTestId('desktop-plan-side')[0]);

    expect(onExpandedIndexChange).toHaveBeenCalledWith(1);
  });

  it('uses a compact desktop intro text size', () => {
    mockDesktopViewport();

    render(
      <PlanCarousel
        plans={[sposadPlan, idcPlan, tisdcPlan]}
        expandedIndex={0}
        onExpandedIndexChange={vi.fn()}
      />,
    );

    expect(screen.getByText(sposadPlan.intro)).toHaveStyle({
      fontSize: '10.8px',
      lineHeight: '1.75',
    });
  });

  it('advances to the next plan when the desktop progress ring completes', () => {
    vi.useFakeTimers();
    const onExpandedIndexChange = vi.fn();
    mockDesktopViewport();

    render(
      <PlanCarousel
        plans={[sposadPlan, idcPlan, tisdcPlan]}
        expandedIndex={0}
        onExpandedIndexChange={onExpandedIndexChange}
      />,
    );

    expect(screen.getByTestId('desktop-rotate-ring')).toBeInTheDocument();

    vi.advanceTimersByTime(5999);
    expect(onExpandedIndexChange).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(onExpandedIndexChange).toHaveBeenCalledWith(1);
  });
});
