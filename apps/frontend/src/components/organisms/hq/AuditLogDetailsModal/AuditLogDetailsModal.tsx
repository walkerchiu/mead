'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tooltip,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  IconButton as MuiIconButton,
  Chip,
  useTheme,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Schedule as TimeIcon,
  Person as PersonIcon,
  Description as ActionIcon,
  Storage as EntityIcon,
  Http as MethodIcon,
  Public as IpIcon,
  Timer as DurationIcon,
  Link as LinkIcon,
  Send as RequestIcon,
  Reply as ResponseIcon,
  Info as InfoIcon,
  DataObject as DataObjectIcon,
  TableChart as TableChartIcon,
  ContentCopy as CopyIcon,
} from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { formatDistanceToNow } from 'date-fns';
import { zhTW, enUS } from 'date-fns/locale';
import { useQuery } from '@apollo/client/react';
import { Modal } from '@/components/organisms';
import { DetailRow } from '@/components/molecules';
import { AUDIT_LOG_BY_ID_QUERY } from '@/lib/audit-logs-queries';
import { downloadJSON, downloadCSV } from '@/utils/download';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import {
  getActionColor,
  getEntityColor,
  getSessionStatusColors,
} from '@/utils/theme-colors';

interface AuditLog {
  id: string;
  timestamp: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  action: string;
  entity: string;
  entityId?: string;
  status: string;
  method?: string;
  path?: string;
  ipAddress?: string;
  userAgent?: string;
  duration?: number;
  requestId?: string;
  details?: Record<string, unknown>;
}

interface AuditLogDetailsModalProps {
  open: boolean;
  log: AuditLog | null;
  onClose: () => void;
}

/**
 * 獲取狀態圖標
 */
const getStatusIcon = (status: string) => {
  return status === 'SUCCESS' ? '✓' : '✕';
};

/**
 * 獲取狀態標籤
 */
const getStatusLabel = (status: string, t: any) => {
  return status === 'SUCCESS' ? t('success') : t('failure');
};

export function AuditLogDetailsModal({
  open,
  log,
  onClose,
}: AuditLogDetailsModalProps) {
  const t = useTranslations('pages.hq.auditLogs.details');
  const tc = useTranslations('common');
  const theme = useTheme();
  const [currentTab, setCurrentTab] = useState(0);
  const [copiedUserId, setCopiedUserId] = useState(false);
  const { isMobile } = useMediaQuery();

  // Select date-fns locale based on current language
  const locale = tc('locale') === 'zh-TW' ? zhTW : enUS;

  // Fetch full audit log details when modal opens
  const { data, loading, error } = useQuery(AUDIT_LOG_BY_ID_QUERY, {
    variables: { id: log?.id },
    skip: !log?.id || !open,
  });

  // Reset tab when modal opens
  useEffect(() => {
    if (open) {
      setCurrentTab(0);
    }
  }, [open]);

  if (!log) return null;

  // Use fetched data if available, otherwise use the log from props
  const fullLog = (data as any)?.auditLogById || log;
  const details = fullLog.details as
    | {
        request?: any;
        response?: any;
        error?: any;
      }
    | undefined;

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const formatted = format(date, 'yyyy-MM-dd HH:mm:ss');
    const relative = formatDistanceToNow(date, {
      addSuffix: true,
      locale,
    });
    return { formatted, relative };
  };

  const parseUserAgent = (ua?: string) => {
    if (!ua) return { browser: '-', os: '-' };

    // Simple user agent parsing
    let browser = '-';
    let os = '-';

    if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Safari')) browser = 'Safari';
    else if (ua.includes('Edge')) browser = 'Edge';

    if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Mac')) os = 'macOS';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iOS')) os = 'iOS';

    return { browser, os };
  };

  const { formatted: formattedTime, relative: relativeTime } = formatTimestamp(
    fullLog.timestamp,
  );
  const { browser, os } = parseUserAgent(fullLog.userAgent);

  // Copy User ID functionality
  const handleCopyUserId = async (userId: string) => {
    try {
      await navigator.clipboard.writeText(userId);
      setCopiedUserId(true);
      setTimeout(() => setCopiedUserId(false), 2000);
    } catch (err) {
      console.error('Failed to copy userId:', err);
    }
  };

  // Export functionality
  const handleExport = (format: 'json' | 'csv') => {
    const exportData = {
      id: fullLog.id,
      timestamp: fullLog.timestamp,
      timestampFormatted: formattedTime,
      userId: fullLog.userId || '',
      userName: fullLog.userName || '',
      userEmail: fullLog.userEmail || '',
      action: fullLog.action,
      entity: fullLog.entity,
      entityId: fullLog.entityId || '',
      status: fullLog.status,
      method: fullLog.method || '',
      path: fullLog.path || '',
      ipAddress: fullLog.ipAddress || '',
      userAgent: fullLog.userAgent || '',
      browser,
      os,
      duration: fullLog.duration || 0,
      requestId: fullLog.requestId || '',
    };

    const filename = `audit-log-${fullLog.id}-${Date.now()}`;
    if (format === 'json') {
      downloadJSON(exportData, `${filename}.json`);
    } else {
      downloadCSV(exportData, `${filename}.csv`);
    }
  };

  // Render JSON content with copy button
  const JsonContent = ({ data, label }: { data: any; label: string }) => {
    const [copied, setCopied] = useState(false);

    const handleCopyJson = async () => {
      try {
        await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    };

    return (
      <Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 1,
          }}
        >
          <Typography variant="subtitle2" fontWeight={600}>
            {label}
          </Typography>
          <Tooltip title={copied ? t('copied') : t('copy')}>
            <MuiIconButton size="small" onClick={handleCopyJson}>
              {copied ? (
                <CheckIcon fontSize="small" color="success" />
              ) : (
                <CopyIcon fontSize="small" />
              )}
            </MuiIconButton>
          </Tooltip>
        </Box>
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            bgcolor: 'grey.50',
            maxHeight: 500,
            overflow: 'auto',
          }}
        >
          <pre
            style={{
              margin: 0,
              fontFamily: 'monospace',
              fontSize: '0.875rem',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {JSON.stringify(data, null, 2)}
          </pre>
        </Paper>
      </Box>
    );
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6" component="span">
            {t('title')}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
            <Tooltip title={t('exportJSON')}>
              <MuiIconButton size="small" onClick={() => handleExport('json')}>
                <DataObjectIcon fontSize="small" />
              </MuiIconButton>
            </Tooltip>
            <Tooltip title={t('exportCSV')}>
              <MuiIconButton size="small" onClick={() => handleExport('csv')}>
                <TableChartIcon fontSize="small" />
              </MuiIconButton>
            </Tooltip>
          </Box>
        </Box>
      }
      maxWidth="lg"
      fullWidth
      dividers
      fullScreen={isMobile}
      sx={{
        '& .MuiDialogContent-root': {
          pt: { xs: 1, sm: 1.5 },
          px: { xs: 2, sm: 3 },
          pb: { xs: 2, sm: 3 },
        },
      }}
    >
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {t('loadError')}
        </Alert>
      ) : (
        <>
          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={currentTab} onChange={(_, v) => setCurrentTab(v)}>
              <Tab
                label={t('basicInfoTab')}
                icon={<InfoIcon fontSize="small" />}
                iconPosition="start"
              />
              <Tab
                label={t('requestTab')}
                icon={<RequestIcon fontSize="small" />}
                iconPosition="start"
              />
              <Tab
                label={t('responseTab')}
                icon={<ResponseIcon fontSize="small" />}
                iconPosition="start"
              />
            </Tabs>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Tab 0: Basic Information */}
            {currentTab === 0 && (
              <>
                <Box>
                  <Typography
                    variant="subtitle1"
                    fontWeight={600}
                    gutterBottom
                    sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                  >
                    📌 {t('basicInfo')}
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <DetailRow
                      icon={<TimeIcon fontSize="small" />}
                      label={t('timestamp')}
                      value={`${formattedTime} (${relativeTime})`}
                      layout="horizontal"
                    />
                    <Box sx={{ py: 1 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                        }}
                      >
                        <Box sx={{ color: 'text.secondary', display: 'flex' }}>
                          <PersonIcon fontSize="small" />
                        </Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ minWidth: 100 }}
                        >
                          {t('user')}
                        </Typography>
                        <Box sx={{ flex: 1 }}>
                          <Box>
                            <Typography
                              variant="body2"
                              fontWeight={500}
                              component="span"
                            >
                              {fullLog.userName || t('unknown')}
                            </Typography>
                            {fullLog.userEmail && (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                component="span"
                                sx={{ ml: 1 }}
                              >
                                ({fullLog.userEmail})
                              </Typography>
                            )}
                          </Box>
                          {fullLog.userId && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              fontFamily="monospace"
                              display="block"
                              sx={{ mt: 0.5 }}
                            >
                              ID: {fullLog.userId}
                            </Typography>
                          )}
                        </Box>
                        {fullLog.userId && (
                          <Tooltip
                            title={copiedUserId ? tc('copied') : tc('copy')}
                          >
                            <MuiIconButton
                              size="small"
                              onClick={() => handleCopyUserId(fullLog.userId!)}
                            >
                              {copiedUserId ? (
                                <CheckIcon fontSize="small" color="success" />
                              ) : (
                                <CopyIcon fontSize="small" />
                              )}
                            </MuiIconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </Box>
                    <DetailRow
                      icon={<ActionIcon fontSize="small" />}
                      label={t('action')}
                      value={
                        <Chip
                          label={fullLog.action.toUpperCase()}
                          size="small"
                          variant="outlined"
                          sx={{
                            fontWeight: 500,
                            height: '26px',
                            fontSize: '0.75rem',
                            letterSpacing: '0.02em',
                            color: getActionColor(
                              fullLog.action,
                              theme.palette.mode,
                            ).text,
                            borderColor: getActionColor(
                              fullLog.action,
                              theme.palette.mode,
                            ).border,
                          }}
                        />
                      }
                      layout="horizontal"
                    />
                    <DetailRow
                      icon={<EntityIcon fontSize="small" />}
                      label={t('entity')}
                      value={
                        <Chip
                          label={fullLog.entity.toUpperCase()}
                          size="small"
                          variant="outlined"
                          sx={{
                            fontWeight: 500,
                            height: '26px',
                            fontSize: '0.75rem',
                            letterSpacing: '0.02em',
                            color: getEntityColor(
                              fullLog.entity,
                              theme.palette.mode,
                            ).text,
                            borderColor: getEntityColor(
                              fullLog.entity,
                              theme.palette.mode,
                            ).border,
                          }}
                        />
                      }
                      layout="horizontal"
                    />
                    {fullLog.entityId && (
                      <DetailRow
                        icon={<LinkIcon fontSize="small" />}
                        label={t('entityId')}
                        value={fullLog.entityId}
                        copyable
                        fieldName="entityId"
                        layout="horizontal"
                      />
                    )}
                    <DetailRow
                      icon={<CheckIcon fontSize="small" />}
                      label={t('status')}
                      value={
                        <Chip
                          label={
                            <>
                              {getStatusIcon(fullLog.status)}{' '}
                              {getStatusLabel(fullLog.status, t)}
                            </>
                          }
                          size="small"
                          sx={{
                            fontWeight: 600,
                            minWidth: '90px',
                            height: '26px',
                            fontSize: '0.75rem',
                            bgcolor: (
                              getSessionStatusColors(theme.palette.mode)[
                                fullLog.status as keyof ReturnType<
                                  typeof getSessionStatusColors
                                >
                              ] ||
                              getSessionStatusColors(theme.palette.mode).SUCCESS
                            ).bg,
                            border: `1px solid ${
                              (
                                getSessionStatusColors(theme.palette.mode)[
                                  fullLog.status as keyof ReturnType<
                                    typeof getSessionStatusColors
                                  >
                                ] ||
                                getSessionStatusColors(theme.palette.mode)
                                  .SUCCESS
                              ).border
                            }`,
                            color: (
                              getSessionStatusColors(theme.palette.mode)[
                                fullLog.status as keyof ReturnType<
                                  typeof getSessionStatusColors
                                >
                              ] ||
                              getSessionStatusColors(theme.palette.mode).SUCCESS
                            ).text,
                          }}
                        />
                      }
                      layout="horizontal"
                    />
                  </Paper>
                </Box>

                {/* Technical Information */}
                <Box>
                  <Typography
                    variant="subtitle1"
                    fontWeight={600}
                    gutterBottom
                    sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                  >
                    🔧 {t('techInfo')}
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    {fullLog.requestId && (
                      <DetailRow
                        icon={<LinkIcon fontSize="small" />}
                        label={t('requestId')}
                        value={fullLog.requestId}
                        copyable
                        fieldName="requestId"
                        layout="horizontal"
                      />
                    )}
                    {fullLog.method && (
                      <DetailRow
                        icon={<MethodIcon fontSize="small" />}
                        label={t('method')}
                        value={fullLog.method}
                        layout="horizontal"
                      />
                    )}
                    {fullLog.path && (
                      <DetailRow
                        icon={<LinkIcon fontSize="small" />}
                        label={t('path')}
                        value={fullLog.path}
                        copyable
                        fieldName="path"
                        layout="horizontal"
                      />
                    )}
                    {fullLog.ipAddress && (
                      <DetailRow
                        icon={<IpIcon fontSize="small" />}
                        label={t('ipAddress')}
                        value={fullLog.ipAddress}
                        copyable
                        fieldName="ipAddress"
                        layout="horizontal"
                      />
                    )}
                    {fullLog.userAgent && (
                      <DetailRow
                        icon={<PersonIcon fontSize="small" />}
                        label={t('userAgent')}
                        value={`${browser} / ${os}`}
                        layout="horizontal"
                      />
                    )}
                    {fullLog.duration !== undefined &&
                      fullLog.duration !== null && (
                        <DetailRow
                          icon={<DurationIcon fontSize="small" />}
                          label={t('duration')}
                          value={`${fullLog.duration}ms`}
                          layout="horizontal"
                        />
                      )}
                  </Paper>
                </Box>
              </>
            )}

            {/* Tab 1: Request Data */}
            {currentTab === 1 && (
              <>
                {details?.request ? (
                  <JsonContent
                    data={details.request}
                    label={t('requestData')}
                  />
                ) : (
                  <Alert severity="info">{t('noRequestData')}</Alert>
                )}
              </>
            )}

            {/* Tab 2: Response Data */}
            {currentTab === 2 && (
              <>
                {details?.response ? (
                  <JsonContent
                    data={details.response}
                    label={t('responseData')}
                  />
                ) : details?.error ? (
                  <Alert severity="error">
                    <JsonContent
                      data={details.error}
                      label={t('errorDetails')}
                    />
                  </Alert>
                ) : (
                  <Alert severity="info">{t('noResponseData')}</Alert>
                )}
              </>
            )}
          </Box>
        </>
      )}
    </Modal>
  );
}
