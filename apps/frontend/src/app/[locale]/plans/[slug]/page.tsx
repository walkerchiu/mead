'use client';

import { use } from 'react';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/atoms';
import { PlanDetailPage } from '@/components/public';
import { usePlans } from '@/hooks/usePlans';
import { useNavRouter } from '@/i18n/use-nav-router';

/**
 * 計畫詳細頁路由 — /[locale]/plans/[slug]。
 *
 * 於 client 端載入 plans.json，依 slug 找出計畫並交由 PlanDetailPage 呈現。
 */
export default function PlanDetailRoute({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug } = use(params);
  const t = useTranslations('portal');
  const router = useNavRouter();
  const { plans, loading, error } = usePlans();

  const centered = {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    bgcolor: '#EAEAEA',
  };

  if (loading) {
    return (
      <Box sx={centered}>
        <CircularProgress />
        <Typography sx={{ color: '#6E6E6E' }}>{t('detail.loading')}</Typography>
      </Box>
    );
  }

  const plan = plans.find((p) => p.slug === slug);

  if (error || !plan) {
    return (
      <Box sx={centered}>
        <Typography sx={{ color: '#6E6E6E' }}>
          {error ? t('error') : t('detail.notFound')}
        </Typography>
        <Button variant="outlined" onClick={() => router.push('/')}>
          {t('detail.back')}
        </Button>
      </Box>
    );
  }

  return <PlanDetailPage plan={plan} onBack={() => router.push('/')} />;
}
