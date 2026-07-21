import { describe, expect, it } from 'vitest';

import { idcPlan, sposadPlan, tisdcPlan } from '@/mocks/fixtures/plans';

import { getDecorStarPhotos } from './PlanCarousel';

describe('PlanCarousel decor star photos', () => {
  it('uses second-layer background photos without depending on plans.json photo order', () => {
    expect(getDecorStarPhotos(sposadPlan)).toEqual([
      '/images/portal/second-layer/sposad_01.jpg',
      '/images/portal/second-layer/sposad_02.jpg',
      '/images/portal/second-layer/sposad_03.jpg',
    ]);
    expect(getDecorStarPhotos(idcPlan)).toEqual([
      '/images/portal/second-layer/idc_01.jpg',
      '/images/portal/second-layer/idc_02.jpg',
      '/images/portal/second-layer/idc_03.jpg',
    ]);
    expect(getDecorStarPhotos(tisdcPlan)).toEqual([
      '/images/portal/second-layer/tisdc_01.jpg',
      '/images/portal/second-layer/tisdc_02.jpg',
      '/images/portal/second-layer/tisdc_03.jpg',
    ]);
  });
});
