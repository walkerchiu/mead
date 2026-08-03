import { describe, expect, it } from 'vitest';

import { tisdcPlan } from '@/mocks/fixtures/plans';
import { render, screen } from '@/test/test-utils';

import { PlanLogo } from './PlanLogo';

describe('PlanLogo', () => {
  it('renders the TISDC mark and names as separate elements', () => {
    expect(tisdcPlan.logoNameplate).toEqual({
      mark: '/images/plans/02_tisdc/logo/mark.png',
      nameZh: ['臺灣國際學生', '創意設計大賽'],
      nameEn: 'Taiwan International Student Design Competition',
    });

    render(
      <PlanLogo
        name={tisdcPlan.name}
        planId={tisdcPlan.id}
        logoSrc={tisdcPlan.logoUrl}
        nameplate={tisdcPlan.logoNameplate}
      />,
    );

    expect(
      document.querySelector('img[src="/images/plans/02_tisdc/logo/mark.png"]'),
    ).toHaveAttribute('src', '/images/plans/02_tisdc/logo/mark.png');
    expect(screen.getByText('臺灣國際學生')).toBeInTheDocument();
    expect(screen.getByText('創意設計大賽')).toBeInTheDocument();
    expect(
      screen.getByText('Taiwan International Student Design Competition'),
    ).toBeInTheDocument();
    expect(
      screen.queryByAltText('臺灣國際學生創意設計大賽'),
    ).not.toBeInTheDocument();
  });
});
