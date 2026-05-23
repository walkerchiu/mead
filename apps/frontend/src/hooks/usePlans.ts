'use client';

/**
 * usePlans — 於 client 端載入三大計畫資料（public/data/plans.json）。
 */
import { useEffect, useState } from 'react';

import { fetchPlansData } from '@/lib/portal/plans';
import type { Plan } from '@/types/plan';

export interface UsePlansResult {
  plans: Plan[];
  loading: boolean;
  error: Error | null;
}

export function usePlans(): UsePlansResult {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    fetchPlansData(controller.signal)
      .then((data) => {
        setPlans(data.plans);
        setError(null);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err : new Error(String(err)));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, []);

  return { plans, loading, error };
}
