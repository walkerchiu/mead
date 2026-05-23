'use client';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/atoms';
import { PortalLandingPage } from '@/components/public';
import { usePlans } from '@/hooks/usePlans';

/**
 * 首頁 — 教育部藝術設計三大計畫入口網。
 *
 * 於 client 端載入 `public/data/plans.json`，再交由 PortalLandingPage 呈現。
 */
export default function Home() {
  const t = useTranslations('portal');
  const { plans, loading, error } = usePlans();

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          bgcolor: '#EAEAEA',
        }}
      >
        <CircularProgress />
        <Typography sx={{ color: '#6E6E6E' }}>{t('loading')}</Typography>
      </Box>
    );
  }

  if (error || plans.length === 0) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          bgcolor: '#EAEAEA',
        }}
      >
        <Typography sx={{ color: '#6E6E6E' }}>{t('error')}</Typography>
        <Button variant="outlined" onClick={() => window.location.reload()}>
          {t('retry')}
        </Button>
      </Box>
    );
  }

  return <PortalLandingPage plans={plans} />;
}
