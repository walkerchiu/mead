'use client';

import { useState, useEffect, useRef } from 'react';
import {
  IconButton,
  Tooltip,
  Box,
  Typography,
  Chip,
  Stack,
  useTheme,
  Card,
  CardContent,
} from '@mui/material';
import {
  Delete,
  Visibility,
  Computer,
  PhoneAndroid,
  Tablet,
  DesktopWindows,
  Apple,
  Android,
  Language,
  AccessTime,
} from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import { useSnackbar } from 'notistack';
import { format, formatDistanceToNow } from 'date-fns';
import { zhTW, enUS } from 'date-fns/locale';
import { DataTable, type DataTableColumn } from '@/components/molecules';
import { UserLink } from '@/components/atoms';
import { SessionDetailsModal } from '../SessionDetailsModal';
import { RevokeSessionModal } from '../RevokeSessionModal';
import type { Session, PageInfo } from '@/hooks/useSessions';
import { useLocale } from 'next-intl';
import { getSessionStatusColors } from '@/utils/theme-colors';

interface SessionTableProps {
  sessions: Session[];
  loading: boolean;
  pageInfo?: PageInfo;
  page: number;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
}

export function SessionTable({
  sessions,
  loading,
  pageInfo,
  page,
  onPageChange,
  onRefresh,
}: SessionTableProps) {
  const theme = useTheme();
  const t = useTranslations('pages.hq.sessions.table');
  const td = useTranslations('pages.hq.sessions.details');
  const { enqueueSnackbar } = useSnackbar();
  const locale = useLocale();
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [revokeSessionId, setRevokeSessionId] = useState<string | null>(null);
  const [revokeSessionUser, setRevokeSessionUser] = useState<
    { name: string; email: string } | undefined
  >();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [revokeOpen, setRevokeOpen] = useState(false);

  // ✅ Track newly inserted session IDs (for animation effects)
  const [newSessionIds, setNewSessionIds] = useState<Set<string>>(new Set());
  const prevSessionsRef = useRef<Session[]>(sessions);

  useEffect(() => {
    if (sessions.length > 0 && prevSessionsRef.current.length > 0) {
      // Detect newly inserted sessions (appear at top of list but not in previous list)
      const prevIds = new Set(
        prevSessionsRef.current.map((session) => session.id),
      );
      const newIds = sessions
        .filter((session) => !prevIds.has(session.id))
        .map((session) => session.id);

      if (newIds.length > 0) {
        console.log(
          `[SessionTable] Detected ${newIds.length} new sessions:`,
          newIds,
        );
        setNewSessionIds(new Set(newIds));

        // Clear new session marker after 5 seconds
        setTimeout(() => {
          setNewSessionIds(new Set());
        }, 5000);
      }
    }

    prevSessionsRef.current = sessions;
  }, [sessions]);

  const handleViewDetails = (session: Session) => {
    setSelectedSession(session);
    setDetailsOpen(true);
  };

  const handleRevokeClick = (session: Session) => {
    setRevokeSessionId(session.id);
    setRevokeSessionUser(
      session.userName && session.userEmail
        ? { name: session.userName, email: session.userEmail }
        : undefined,
    );
    setRevokeOpen(true);
  };

  const handleRevokeFromDetails = (sessionId: string) => {
    setDetailsOpen(false);
    const session = sessions.find((s) => s.id === sessionId);
    if (session) {
      handleRevokeClick(session);
    }
  };

  const handleRevokeSuccess = () => {
    enqueueSnackbar(t('revokeSuccess'), { variant: 'success' });
    onRefresh();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return '●'; // Solid dot for active
      case 'REVOKED':
        return '✕'; // Cross for revoked
      case 'EXPIRED':
        return '⏱'; // Timer for expired
      default:
        return '○'; // Empty dot for unknown
    }
  };

  const getRevokedMethodColor = (
    method: string | null | undefined,
  ):
    | 'success'
    | 'error'
    | 'warning'
    | 'default'
    | 'primary'
    | 'secondary'
    | 'info' => {
    switch (method) {
      case 'USER_LOGOUT':
        return 'success';
      case 'HQ_FORCE':
      case 'BATCH_REVOKE':
        return 'warning';
      case 'AUTO_EXPIRE':
        return 'default';
      case 'SECURITY_MEASURE':
        return 'error';
      default:
        return 'default';
    }
  };

  const getRevokedMethodLabel = (
    method: string | null | undefined,
    revokedByName: string | null | undefined,
  ): string => {
    if (!method) return '-';

    const methodKey = method.toLowerCase();

    if ((method === 'HQ_FORCE' || method === 'BATCH_REVOKE') && revokedByName) {
      const translationKey = `${methodKey}_with_name`;
      return t(`revokedMethods.${translationKey}`, { name: revokedByName });
    }

    return t(`revokedMethods.${methodKey}`);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'yyyy-MM-dd HH:mm:ss');
    } catch {
      return dateString;
    }
  };

  const getRelativeTime = (dateString: string) => {
    try {
      const dateLocale = locale === 'zh-TW' ? zhTW : enUS;
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: dateLocale,
      });
    } catch {
      return '';
    }
  };

  const getDeviceIcon = (
    os: string | null | undefined,
    browser: string | null | undefined,
  ) => {
    // Priority 1: Check browser first for specific cases
    if (browser) {
      const browserLower = browser.toLowerCase();

      // Safari is Apple-specific
      if (browserLower.includes('safari') && !browserLower.includes('chrome')) {
        return <Apple fontSize="small" />;
      }

      // Mobile browsers
      if (browserLower.includes('mobile')) {
        return <PhoneAndroid fontSize="small" />;
      }

      // Tablet
      if (browserLower.includes('tablet')) {
        return <Tablet fontSize="small" />;
      }
    }

    // Priority 2: Check OS for mobile devices
    if (os) {
      const osLower = os.toLowerCase();

      if (
        osLower.includes('ios') ||
        osLower.includes('iphone') ||
        osLower.includes('ipad')
      ) {
        return <Apple fontSize="small" />;
      }

      if (osLower.includes('android')) {
        return <Android fontSize="small" />;
      }

      // Desktop OS - use generic desktop icon
      if (osLower.includes('windows')) {
        return <DesktopWindows fontSize="small" />;
      }

      // For macOS with non-Safari browsers, use generic desktop icon
      if (osLower.includes('mac')) {
        return <DesktopWindows fontSize="small" />;
      }
    }

    // Default: generic computer icon
    return <Computer fontSize="small" />;
  };

  const getCountryFlag = (location: string | null) => {
    if (!location) return '';

    // Simple country to flag emoji mapping
    const countryFlags: Record<string, string> = {
      taiwan: '🇹🇼',
      'united states': '🇺🇸',
      japan: '🇯🇵',
      korea: '🇰🇷',
      china: '🇨🇳',
      'hong kong': '🇭🇰',
      singapore: '🇸🇬',
      canada: '🇨🇦',
      'united kingdom': '🇬🇧',
      germany: '🇩🇪',
      france: '🇫🇷',
      australia: '🇦🇺',
    };

    const locationLower = location.toLowerCase();
    for (const [country, flag] of Object.entries(countryFlags)) {
      if (locationLower.includes(country)) {
        return flag + ' ';
      }
    }

    return '';
  };

  // Define table columns
  const columns: DataTableColumn<Session>[] = [
    {
      id: 'user',
      label: t('user'),
      sortable: true,
      align: 'left',
      width: '200px',
      render: (_, row) => (
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <UserLink
              userId={row.userId}
              name={row.userName}
              email={row.userEmail}
              showAvatar={false}
            />
            {row.isCurrent && (
              <Chip
                label={td('currentSession')}
                color="info"
                size="small"
                variant="outlined"
              />
            )}
          </Box>
          <Typography variant="caption" color="text.secondary" noWrap>
            {row.userEmail}
          </Typography>
        </Box>
      ),
      sortFn: (a, b) => {
        const aName = a.userName || a.userId;
        const bName = b.userName || b.userId;
        return aName.localeCompare(bName);
      },
    },
    {
      id: 'status',
      label: t('status'),
      sortable: true,
      align: 'center',
      width: '110px',
      render: (_, row) => {
        const statusColors = getSessionStatusColors(theme.palette.mode);
        const colors =
          statusColors[row.status as keyof typeof statusColors] ||
          statusColors.ACTIVE;

        return (
          <Chip
            label={
              <>
                {getStatusIcon(row.status)}{' '}
                {t(`statuses.${row.status.toLowerCase()}`)}
              </>
            }
            size="small"
            sx={{
              fontWeight: 500,
              minWidth: '90px',
              bgcolor: colors.bg,
              border: `1px solid ${colors.border}`,
              color: colors.text,
            }}
          />
        );
      },
    },
    {
      id: 'device',
      label: t('device'),
      align: 'center',
      width: '240px',
      render: (_, row) => {
        if (!row.browser && !row.os) {
          return (
            <Typography variant="caption" color="text.secondary">
              -
            </Typography>
          );
        }

        // Combine browser and OS into one chip for cleaner display
        const deviceLabel = [row.browser, row.os].filter(Boolean).join(' • ');

        return (
          <Chip
            icon={getDeviceIcon(row.os, row.browser)}
            label={deviceLabel}
            size="small"
            variant="outlined"
            sx={{
              maxWidth: '100%',
              px: 1.5,
              height: 28,
              '& .MuiChip-label': {
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                px: 0.5,
              },
              '& .MuiChip-icon': {
                marginLeft: 0.5,
                marginRight: 0.5,
                color:
                  theme.palette.mode === 'dark'
                    ? theme.palette.text.primary
                    : theme.palette.text.secondary,
              },
            }}
          />
        );
      },
    },
    {
      id: 'ipAddress',
      label: t('ipAddress'),
      sortable: true,
      align: 'center',
      width: '140px',
      render: (_, row) =>
        row.ipAddress ? (
          <Chip
            icon={<Language fontSize="small" />}
            label={row.ipAddress}
            size="small"
            variant="outlined"
            sx={{
              fontFamily: 'monospace',
              fontSize: '0.75rem',
              maxWidth: '100%',
              '& .MuiChip-icon': {
                color:
                  theme.palette.mode === 'dark'
                    ? theme.palette.text.primary
                    : theme.palette.text.secondary,
              },
            }}
          />
        ) : (
          <Typography variant="caption" color="text.secondary">
            -
          </Typography>
        ),
    },
    {
      id: 'location',
      label: t('location'),
      sortable: true,
      align: 'center',
      width: '130px',
      render: (_, row) => {
        if (!row.location) {
          return (
            <Typography variant="caption" color="text.secondary">
              -
            </Typography>
          );
        }

        const flag = getCountryFlag(row.location);
        return (
          <Chip
            label={
              <>
                {flag}
                {row.location}
              </>
            }
            size="small"
            variant="outlined"
            sx={{
              maxWidth: '100%',
            }}
          />
        );
      },
    },
    {
      id: 'revokedMethod',
      label: t('revokedMethod'),
      align: 'center',
      width: '180px',
      render: (_, row) => {
        if (row.status !== 'REVOKED' && row.status !== 'EXPIRED') {
          return (
            <Typography variant="caption" color="text.secondary">
              -
            </Typography>
          );
        }

        return (
          <Chip
            label={getRevokedMethodLabel(row.revokedMethod, row.revokedByName)}
            color={getRevokedMethodColor(row.revokedMethod)}
            size="small"
            variant="outlined"
            sx={{
              maxWidth: '100%',
              '& .MuiChip-label': {
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              },
            }}
          />
        );
      },
    },
    {
      id: 'createdAt',
      label: t('createdAt'),
      sortable: true,
      align: 'center',
      width: '170px',
      render: (_, row) => (
        <Tooltip title={getRelativeTime(row.createdAt)} arrow>
          <Stack
            direction="row"
            spacing={0.5}
            alignItems="center"
            justifyContent="center"
          >
            <AccessTime sx={{ fontSize: 14, color: 'text.secondary' }} />
            <Typography variant="caption" noWrap>
              {formatDate(row.createdAt)}
            </Typography>
          </Stack>
        </Tooltip>
      ),
      sortFn: (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      id: 'lastUsedAt',
      label: t('lastUsedAt'),
      sortable: true,
      align: 'center',
      width: '170px',
      render: (_, row) => (
        <Tooltip title={getRelativeTime(row.lastUsedAt)} arrow>
          <Stack
            direction="row"
            spacing={0.5}
            alignItems="center"
            justifyContent="center"
          >
            <AccessTime sx={{ fontSize: 14, color: 'text.secondary' }} />
            <Typography variant="caption" noWrap>
              {formatDate(row.lastUsedAt)}
            </Typography>
          </Stack>
        </Tooltip>
      ),
      sortFn: (a, b) =>
        new Date(a.lastUsedAt).getTime() - new Date(b.lastUsedAt).getTime(),
    },
    {
      id: 'actions',
      label: t('actions'),
      align: 'center',
      width: '90px',
      render: (_, row) => (
        <Stack direction="row" spacing={0.5} justifyContent="center">
          <Tooltip title={t('viewDetails')}>
            <IconButton size="medium" onClick={() => handleViewDetails(row)}>
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
          {row.status === 'ACTIVE' && !row.isCurrent && (
            <Tooltip title={t('revokeSession')}>
              <IconButton
                size="medium"
                color="error"
                onClick={() => handleRevokeClick(row)}
              >
                <Delete fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      ),
    },
  ];

  return (
    <>
      <Card elevation={2}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">{t('sessionsTable')}</Typography>
            {pageInfo && pageInfo.totalCount > 0 && (
              <Typography variant="body2" color="text.secondary">
                {pageInfo.totalPages > 1
                  ? // 多頁：顯示範圍和頁碼
                    t('showingRecordsWithPage', {
                      start: (pageInfo.currentPage - 1) * 20 + 1,
                      end: Math.min(
                        pageInfo.currentPage * 20,
                        pageInfo.totalCount,
                      ),
                      total: pageInfo.totalCount,
                      page: pageInfo.currentPage,
                      totalPages: pageInfo.totalPages,
                    })
                  : // 單頁：只顯示總數
                    t('totalRecords', { total: pageInfo.totalCount })}
              </Typography>
            )}
          </Box>

          <DataTable
            columns={columns}
            data={sessions}
            loading={loading}
            emptyText={t('noSessions')}
            pagination={(pageInfo?.totalPages || 0) > 1}
            page={page}
            totalPages={pageInfo?.totalPages || 0}
            onPageChange={onPageChange}
            highlightRow={(row) => newSessionIds.has(row.id)}
            highlightColor="rgba(76, 175, 80, 0.1)"
            animateHighlight={true}
          />
        </CardContent>
      </Card>

      {/* Modals - conditional rendering to avoid z-index issues */}
      {detailsOpen && (
        <SessionDetailsModal
          open={detailsOpen}
          session={selectedSession}
          onClose={() => setDetailsOpen(false)}
          onRevoke={handleRevokeFromDetails}
        />
      )}

      {revokeOpen && (
        <RevokeSessionModal
          open={revokeOpen}
          sessionId={revokeSessionId}
          sessionUser={revokeSessionUser}
          onClose={() => setRevokeOpen(false)}
          onSuccess={handleRevokeSuccess}
        />
      )}
    </>
  );
}
