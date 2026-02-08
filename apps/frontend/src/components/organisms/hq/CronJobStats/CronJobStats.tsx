'use client';

import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Skeleton,
} from '@mui/material';
import { CheckCircle, Error, Schedule, Timer } from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import type { CronJobStatistics } from '@/hooks/useCronStatistics';

interface CronJobStatsProps {
  statistics: CronJobStatistics | null;
  loading?: boolean;
}

/**
 * 格式化時長（毫秒 -> 秒/分鐘）
 */
function formatDuration(ms?: number): string {
  if (!ms) return '-';
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}min`;
}

export function CronJobStats({ statistics, loading }: CronJobStatsProps) {
  const t = useTranslations('pages.hq.cronJobs.stats');

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

  // 即使沒有統計數據也顯示卡片 (顯示 0 值)
  const statCards = [
    {
      title: t('totalExecutions'),
      value: statistics?.totalExecutions?.toLocaleString() || 0,
      icon: Schedule,
      color: '#1976d2',
      bgColor: 'rgba(25, 118, 210, 0.15)',
    },
    {
      title: t('successRate'),
      value: statistics?.successRate
        ? `${statistics.successRate.toFixed(1)}%`
        : '0%',
      subtitle: `${statistics?.successfulExecutions || 0} / ${statistics?.totalExecutions || 0}`,
      icon: CheckCircle,
      color: '#2e7d32',
      bgColor: 'rgba(46, 125, 50, 0.15)',
      valueColor: '#2e7d32',
    },
    {
      title: t('failedExecutions'),
      value: statistics?.failedExecutions?.toLocaleString() || 0,
      icon: Error,
      color: '#d32f2f',
      bgColor: 'rgba(211, 47, 47, 0.15)',
      valueColor: '#d32f2f',
    },
    {
      title: t('averageDuration'),
      value: formatDuration(statistics?.averageDuration),
      icon: Timer,
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
              transition: 'all 0.2s',
              '&:hover': {
                boxShadow: `0 6px 16px ${stat.color}40`,
              },
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: stat.bgColor,
                    mr: 2,
                  }}
                >
                  <stat.icon sx={{ color: stat.color, fontSize: 28 }} />
                </Box>
                <Typography
                  color="text.secondary"
                  variant="body2"
                  fontWeight="medium"
                >
                  {stat.title}
                </Typography>
              </Box>
              <Typography
                variant={
                  typeof stat.value === 'string' && stat.value.length > 15
                    ? 'h6'
                    : 'h4'
                }
                component="div"
                fontWeight="bold"
                sx={{
                  color: stat.valueColor || 'text.primary',
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
                  textAlign: 'right',
                }}
              >
                {stat.value}
              </Typography>
              {stat.subtitle && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 1, display: 'block', textAlign: 'right' }}
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
