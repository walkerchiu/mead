'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Button } from '@/components/atoms';
import {
  ArrowForward as ArrowForwardIcon,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import { useNavRouter as useRouter } from '@/i18n/use-nav-router';

export default function Home() {
  const t = useTranslations('pages.home');
  const router = useRouter();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#ffffff',
      }}
    >
      <Box
        sx={{
          textAlign: 'center',
          px: 3,
          maxWidth: 1200,
        }}
      >
        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontWeight: 800,
            letterSpacing: '-0.02em',
            color: '#1a1a1a',
            mb: 1,
          }}
        >
          {t('title')}
        </Typography>

        <Typography
          variant="body1"
          sx={{ color: '#666', mb: 4, fontSize: '1.1rem' }}
        >
          {t('subtitle')}
        </Typography>

        <Box sx={{ mb: 6, display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="outlined"
            size="large"
            startIcon={<DashboardIcon />}
            endIcon={<ArrowForwardIcon sx={{ fontSize: 18 }} />}
            onClick={() => router.push('/dashboard')}
            sx={{
              borderColor: 'primary.main',
              color: 'primary.main',
              px: 4,
              py: 1.25,
              fontSize: '1rem',
              fontWeight: 600,
              borderRadius: 2,
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: 'primary.50',
              },
            }}
          >
            {t('goToDashboard')}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
