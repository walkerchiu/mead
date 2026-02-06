'use client';

import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';

export default function Home() {
  const t = useTranslations('pages.home');
  const router = useRouter();

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
        }}
      >
        <Typography variant="h2" component="h1" gutterBottom>
          {t('title')}
        </Typography>
        <Typography variant="h5" color="text.secondary" textAlign="center">
          {t('subtitle')}
        </Typography>
        <Typography variant="body1" color="text.secondary" textAlign="center">
          {t('description')}
        </Typography>
        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => router.push('/login')}
          >
            {t('login')}
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => router.push('/dashboard')}
          >
            {t('dashboard')}
          </Button>
        </Stack>
      </Box>
    </Container>
  );
}
