import { describe, expect, it } from 'vitest';

import { calculatePlanStageScale } from './PortalLandingPage';

describe('calculatePlanStageScale', () => {
  it('scales the desktop plan stage up on large viewports', () => {
    const scale = calculatePlanStageScale({
      viewportWidth: 2048,
      viewportHeight: 1432,
    });

    expect(scale).toBeCloseTo(1.46, 2);
    expect(561 * scale + (112 + 82) * scale).toBeLessThanOrEqual(1432);
  });

  it('scales the desktop plan stage down for short viewports', () => {
    const scale = calculatePlanStageScale({
      viewportWidth: 1280,
      viewportHeight: 620,
    });

    expect(scale).toBeLessThan(1);
    expect(561 * scale + (112 + 82) * scale).toBeLessThanOrEqual(620);
  });
});
