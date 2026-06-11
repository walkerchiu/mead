'use client';

import { useMemo, useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Stack,
  Button,
  Paper,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
  Skeleton,
} from '@mui/material';
import {
  ArrowForward as ArrowForwardIcon,
  CheckCircleOutline as CheckCircleIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Devices as SessionIcon,
  Schedule as CronIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';
import { useTranslations, useLocale } from 'next-intl';
import { useQuery } from '@apollo/client/react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { AppShell } from '@/components/layout';
import { KPICard } from '@/components/molecules';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useNavRouter as useRouter } from '@/i18n/use-nav-router';
import { ACTIVE_SESSION_COUNT_QUERY } from '@/graphql/sessions';
import { GET_CRON_JOB_STATISTICS } from '@/graphql/cron-jobs';
import { GET_NOTIFICATIONS } from '@/graphql/notification';
import { getAccessToken, parseJwt } from '@/lib/auth';
import { AccessScope } from '@/types/auth';

function DashboardContent() {
  const t = useTranslations('pages.dashboard');
  const locale = useLocale();
  const router = useRouter();
  const { user } = useCurrentUser();

  const [roles, setRoles] = useState<{ isHQ: boolean }>({ isHQ: false });

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;
    const payload = parseJwt(token);
    const scopes = (payload?.accessScopes as string[]) || [];
    const perms = (payload?.permissions as string[]) || [];
    const hasHQScope = scopes.includes(AccessScope.HQ_SCOPE);
    setRoles({
      isHQ: hasHQScope && perms.includes('sessions:read_all'),
    });
  }, []);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return t('greeting.morning');
    if (hour < 18) return t('greeting.afternoon');
    return t('greeting.evening');
  }, [t]);

  const todayLabel = useMemo(() => {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    }).format(new Date());
  }, [locale]);

  // HQ：活躍會話數
  const { data: activeSessionData, loading: activeSessionLoading } = useQuery<{
    activeSessionCount: number;
  }>(ACTIVE_SESSION_COUNT_QUERY, {
    skip: !roles.isHQ,
    fetchPolicy: 'cache-and-network',
  });

  // HQ：Cron 統計（過去 7 天）
  const cronStartDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString();
  }, []);
  const { data: cronStatsData, loading: cronStatsLoading } = useQuery<{
    cronJobStatistics: {
      totalExecutions: number;
      successfulExecutions: number;
      failedExecutions: number;
      successRate: number;
    };
  }>(GET_CRON_JOB_STATISTICS, {
    variables: { startDate: cronStartDate },
    skip: !roles.isHQ,
    fetchPolicy: 'cache-and-network',
  });

  interface NotificationItem {
    id: string;
    type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
    data?: { actionUrl?: string } | null;
  }
  const { data: notificationsData, loading: notificationsLoading } = useQuery<{
    notifications: { notifications: NotificationItem[] };
  }>(GET_NOTIFICATIONS, {
    variables: { filter: { limit: 5, offset: 0 } },
    fetchPolicy: 'cache-and-network',
  });

  const activeSessionCount = activeSessionData?.activeSessionCount ?? 0;
  const cronSuccessRate = cronStatsData?.cronJobStatistics?.successRate;
  const cronFailed = cronStatsData?.cronJobStatistics?.failedExecutions ?? 0;
  const cronHealthy = cronFailed === 0;

  return (
    <AppShell title={t('title')}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Greeting */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{ fontWeight: 700, mb: 0.5 }}
          >
            {greeting}
            {user?.name ? `，${user.name}` : ''}！
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('greeting.today', { date: todayLabel })}
          </Typography>
        </Box>

        {/* 近期動態 */}
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            mb: 2,
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 1.5 }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {t('activityFeed.title')}
            </Typography>
            <Button
              size="small"
              endIcon={<ArrowForwardIcon />}
              onClick={() => router.push('/notifications')}
            >
              {t('activityFeed.viewAll')}
            </Button>
          </Stack>
          <Divider sx={{ mb: 1 }} />
          <ActivityFeedList
            items={notificationsData?.notifications?.notifications ?? []}
            loading={notificationsLoading}
            locale={locale}
            onItemClick={(item) => {
              const url = item.data?.actionUrl || '/notifications';
              router.push(url as never);
            }}
          />
        </Paper>

        {/* HQ 系統健康度（僅 HQ）*/}
        {roles.isHQ && (
          <Paper
            elevation={0}
            sx={{
              mt: 2,
              p: 2.5,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 1.5 }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <AdminIcon fontSize="small" sx={{ color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {t('systemHealth.title')}
                </Typography>
                <Chip
                  label={t('systemHealth.subtitle')}
                  size="small"
                  variant="outlined"
                  sx={{ height: 20, fontSize: '0.7rem' }}
                />
              </Stack>
            </Stack>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <KPICard
                  title={t('systemHealth.activeSessions')}
                  value={activeSessionCount}
                  icon={<SessionIcon />}
                  href="/hq/sessions"
                  loading={activeSessionLoading}
                  accentColor="info.main"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <KPICard
                  title={t('systemHealth.cronHealth')}
                  value={
                    cronSuccessRate !== undefined
                      ? `${Math.round(cronSuccessRate * 100) / 100}%`
                      : '—'
                  }
                  icon={<CronIcon />}
                  href="/hq/cron-jobs"
                  loading={cronStatsLoading}
                  accentColor={cronHealthy ? 'success.main' : 'error.main'}
                  hint={
                    cronHealthy
                      ? t('systemHealth.cronHealthy')
                      : t('systemHealth.cronHasFailures')
                  }
                  hintColor={cronHealthy ? 'success' : 'error'}
                />
              </Grid>
            </Grid>
          </Paper>
        )}
      </Container>
    </AppShell>
  );
}

function ActivityFeedList({
  items,
  loading,
  locale,
  onItemClick,
}: {
  items: Array<{
    id: string;
    type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
    data?: { actionUrl?: string } | null;
  }>;
  loading: boolean;
  locale: string;
  onItemClick: (item: { data?: { actionUrl?: string } | null }) => void;
}) {
  const t = useTranslations('pages.dashboard.activityFeed');

  if (loading) {
    return (
      <Stack spacing={1} sx={{ py: 1 }}>
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} variant="rounded" height={48} />
        ))}
      </Stack>
    );
  }

  if (items.length === 0) {
    return (
      <Box sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>
        <Typography variant="body2">{t('empty')}</Typography>
      </Box>
    );
  }

  const typeIconMap = {
    SUCCESS: (
      <CheckCircleIcon fontSize="small" sx={{ color: 'success.main' }} />
    ),
    WARNING: <WarningIcon fontSize="small" sx={{ color: 'warning.main' }} />,
    ERROR: <ErrorIcon fontSize="small" sx={{ color: 'error.main' }} />,
    INFO: <InfoIcon fontSize="small" sx={{ color: 'info.main' }} />,
  };

  const formatRelativeTime = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;
    return new Intl.DateTimeFormat(locale, {
      month: 'short',
      day: 'numeric',
    }).format(new Date(iso));
  };

  return (
    <List disablePadding>
      {items.map((item) => (
        <ListItemButton
          key={item.id}
          onClick={() => onItemClick(item)}
          sx={{
            borderRadius: 1,
            px: 1.5,
            bgcolor: item.isRead ? 'transparent' : 'action.hover',
          }}
        >
          <ListItemIcon sx={{ minWidth: 36 }}>
            {typeIconMap[item.type] || typeIconMap.INFO}
          </ListItemIcon>
          <ListItemText
            primary={
              <Stack direction="row" spacing={1} alignItems="baseline">
                <Typography
                  variant="body2"
                  component="span"
                  sx={{ fontWeight: item.isRead ? 500 : 600, flex: 1 }}
                  noWrap
                >
                  {item.title}
                </Typography>
                <Typography
                  variant="caption"
                  component="span"
                  sx={{ color: 'text.secondary', flexShrink: 0 }}
                >
                  {formatRelativeTime(item.createdAt)}
                </Typography>
              </Stack>
            }
            secondary={item.message}
            secondaryTypographyProps={{
              variant: 'caption',
              noWrap: true,
            }}
          />
        </ListItemButton>
      ))}
    </List>
  );
}

export default function DashboardPage() {
  return (
    // customer 商業頁：限 CUSTOMER_SCOPE。純 HQ / 純 public 無此 scope → 顯示權限不足頁（不放行）。
    <ProtectedRoute requiredScopes={['CUSTOMER_SCOPE']}>
      <DashboardContent />
    </ProtectedRoute>
  );
}
