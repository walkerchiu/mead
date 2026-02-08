'use client';

import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Skeleton,
} from '@mui/material';
import {
  Devices,
  Block,
  HourglassEmpty,
  CheckCircle,
} from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import { useSessionStatistics } from '@/hooks/useSessionStatistics';
import { useAuthReady } from '@/components/auth/ProtectedRoute';

export function SessionStats() {
  const t = useTranslations('pages.hq.sessions.stats');
  const authReady = useAuthReady();
  const { statistics: stats, loading } = useSessionStatistics({ authReady });

  if (loading) {
    return (
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[1, 2, 3, 4].map((i) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
            <Card elevation={2}>
              <CardContent>
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="80%" height={40} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  const statCards = [
    {
      title: t('activeCount'),
      value: stats?.activeSessions?.toLocaleString() || 0,
      icon: CheckCircle,
      color: '#2e7d32',
      bgColor: 'rgba(46, 125, 50, 0.15)',
      valueColor: '#2e7d32',
    },
    {
      title: t('revokedCount'),
      value: stats?.totalRevoked?.toLocaleString() || 0,
      icon: Block,
      color: '#d32f2f',
      bgColor: 'rgba(211, 47, 47, 0.15)',
      valueColor: '#d32f2f',
    },
    {
      title: t('expiredCount'),
      value: stats?.totalExpired?.toLocaleString() || 0,
      icon: HourglassEmpty,
      color: '#ed6c02',
      bgColor: 'rgba(237, 108, 2, 0.15)',
      valueColor: '#ed6c02',
    },
    {
      title: t('topDevice'),
      value: stats?.topDevices?.[0]?.deviceInfo || '-',
      subtitle: stats?.topDevices?.[0]?.count
        ? `${stats.topDevices[0].count} ${t('sessions')}`
        : t('noData'),
      icon: Devices,
      color: '#0288d1',
      bgColor: 'rgba(2, 136, 209, 0.15)',
    },
  ];

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {statCards.map((stat, index) => (
        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
          <Card
            elevation={2}
            sx={{
              height: '100%',
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 2,
                }}
              >
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  {stat.title}
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 40,
                    height: 40,
                    borderRadius: 1,
                    bgcolor: stat.bgColor,
                  }}
                >
                  <stat.icon sx={{ color: stat.color, fontSize: 24 }} />
                </Box>
              </Box>

              <Typography
                variant={
                  typeof stat.value === 'string' && stat.value.length > 15
                    ? 'h6'
                    : 'h4'
                }
                component="div"
                sx={{
                  fontWeight: 600,
                  color: stat.valueColor || 'text.primary',
                  mb: 0.5,
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
                  textAlign: index === 3 ? 'center' : 'right', // 「最常用設備」的值置中，其他靠右
                }}
              >
                {stat.value}
              </Typography>

              {stat.subtitle && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ textAlign: 'right' }}
                >
                  {stat.subtitle}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
