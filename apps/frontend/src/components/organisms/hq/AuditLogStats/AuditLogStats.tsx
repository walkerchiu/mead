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
  CheckCircle,
  Error,
  Assessment,
  TrendingUp,
} from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import { useQuery } from '@apollo/client/react';
import { AUDIT_LOG_STATISTICS_QUERY } from '@/lib/audit-logs-queries';

interface AuditLogStatistics {
  total: number;
  successRate: number;
  successCount: number;
  failureCount: number;
  byAction: Array<{
    action: string;
    count: number;
  }>;
}

export function AuditLogStats() {
  const t = useTranslations('pages.hq.auditLogs.stats');
  const { data, loading } = useQuery(AUDIT_LOG_STATISTICS_QUERY);
  const stats = (data as { auditLogStatistics?: AuditLogStatistics })
    ?.auditLogStatistics;

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
      title: t('totalCount'),
      value: stats?.total?.toLocaleString() || 0,
      icon: Assessment,
      color: '#1976d2',
      bgColor: 'rgba(25, 118, 210, 0.15)',
    },
    {
      title: t('successRate'),
      value: stats?.successRate ? `${stats.successRate.toFixed(1)}%` : '0%',
      subtitle: `${stats?.successCount || 0} / ${stats?.total || 0}`,
      icon: CheckCircle,
      color: '#2e7d32',
      bgColor: 'rgba(46, 125, 50, 0.15)',
      valueColor: '#2e7d32',
    },
    {
      title: t('failureCount'),
      value: stats?.failureCount?.toLocaleString() || 0,
      icon: Error,
      color: '#d32f2f',
      bgColor: 'rgba(211, 47, 47, 0.15)',
      valueColor: '#d32f2f',
    },
    {
      title: t('topAction'),
      value: stats?.byAction?.[0]?.action || '-',
      subtitle: stats?.byAction?.[0]?.count
        ? `${stats.byAction[0].count} ${t('times')}`
        : t('noData'),
      icon: TrendingUp,
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
                  textAlign: index === 3 ? 'center' : 'right', // 「熱門操作」的值置中，其他靠右
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
