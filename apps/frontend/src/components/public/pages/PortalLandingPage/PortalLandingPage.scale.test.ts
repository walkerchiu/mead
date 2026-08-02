import { describe, expect, it } from 'vitest';

import { calculatePlanStageScale } from './PortalLandingPage';

describe('calculatePlanStageScale', () => {
  it('scales the desktop plan stage up while preserving vertical spacing', () => {
    const scale = calculatePlanStageScale({
      viewportWidth: 1800,
      viewportHeight: 1100,
    });

    expect(scale).toBeGreaterThan(1);
    expect(561 * scale + (120 + 110) * scale).toBeLessThanOrEqual(1100);
  });

  it('scales the desktop plan stage down for short viewports', () => {
    const scale = calculatePlanStageScale({
      viewportWidth: 1280,
      viewportHeight: 620,
    });

    expect(scale).toBeLessThan(1);
    expect(561 * scale + (120 + 110) * scale).toBeLessThanOrEqual(620);
  });
});
