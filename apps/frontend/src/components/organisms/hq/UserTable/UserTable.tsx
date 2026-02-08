'use client';

import {
  IconButton,
  Tooltip,
  Box,
  Typography,
  Chip,
  Stack,
  useTheme,
} from '@mui/material';
import {
  Edit,
  Lock,
  LockOpen,
  LockReset,
  Delete,
  Restore,
  ManageAccounts,
} from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import { formatDistanceToNow } from 'date-fns';
import { zhTW, enUS } from 'date-fns/locale';
import { DataTable, type DataTableColumn } from '@/components/molecules';
import { UserLink } from '@/components/atoms';
import type { User, PaginatedUsers } from '@/graphql/users';
import { useLocale } from 'next-intl';
import { getStatusColors } from '@/utils/theme-colors';

interface UserTableProps {
  users: User[];
  loading: boolean;
  pageInfo?: PaginatedUsers['pageInfo'];
  page: number;
  onPageChange: (page: number) => void;
  onEdit: (user: User) => void;
  onResetPassword: (user: User) => void;
  onManageRoles?: (user: User) => void;
  onDelete: (user: User) => void;
  onRestore: (user: User) => void;
  onLock: (user: User) => void;
  onUnlock: (user: User) => void;
  readOnly?: boolean;
}

export function UserTable({
  users,
  loading,
  pageInfo,
  page,
  onPageChange,
  onEdit,
  onResetPassword,
  onManageRoles,
  onDelete,
  onRestore,
  onLock,
  onUnlock,
  readOnly,
}: UserTableProps) {
  const theme = useTheme();
  const t = useTranslations('pages.hq.users.table');
  const tm = useTranslations('pages.hq.users.menu');
  const tu = useTranslations('pages.hq.users');
  const tc = useTranslations('common');
  const locale = useLocale();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return formatDistanceToNow(date, {
      addSuffix: true,
      locale: locale === 'zh-TW' ? zhTW : enUS,
    });
  };

  const columns: DataTableColumn<User>[] = [
    {
      id: 'name',
      label: t('name'),
      sortable: true,
      width: '12%',
      render: (_, user) => (
        <UserLink
          userId={user.id}
          name={user.name}
          email={user.email}
          avatar={user.profile?.avatar}
        />
      ),
    },
    {
      id: 'email',
      label: t('email'),
      sortable: true,
      width: '20%',
      render: (_, user) => (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {user.email}
        </Typography>
      ),
    },
    {
      id: 'accessScopes',
      label: t('accessScopes'),
      width: '15%',
      render: (_, user) => (
        <Stack direction="row" spacing={0.5} flexWrap="wrap">
          {user.accessScopes.map((scope) => (
            <Chip
              key={scope}
              label={scope}
              size="small"
              sx={{
                fontSize: '0.75rem',
                height: 24,
                bgcolor:
                  scope === 'HQ_SCOPE'
                    ? getStatusColors(theme).error.bgColor
                    : scope === 'CUSTOMER_SCOPE'
                      ? getStatusColors(theme).info.bgColor
                      : getStatusColors(theme).default.bgColor,
                color:
                  scope === 'HQ_SCOPE'
                    ? getStatusColors(theme).error.textColor
                    : scope === 'CUSTOMER_SCOPE'
                      ? getStatusColors(theme).info.textColor
                      : getStatusColors(theme).default.textColor,
              }}
            />
          ))}
        </Stack>
      ),
    },
    {
      id: 'roles',
      label: t('roles'),
      width: '15%',
      render: (_, user) => (
        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
          {(user.roles || []).map((role) => (
            <Chip
              key={role.id}
              label={
                role.scope === 'HQ_SCOPE'
                  ? `[HQ] ${role.displayName}`
                  : role.displayName
              }
              size="small"
              sx={{
                fontSize: '0.75rem',
                height: 24,
                bgcolor:
                  role.scope === 'HQ_SCOPE'
                    ? getStatusColors(theme).error.bgColor
                    : getStatusColors(theme).info.bgColor,
                color:
                  role.scope === 'HQ_SCOPE'
                    ? getStatusColors(theme).error.textColor
                    : getStatusColors(theme).info.textColor,
              }}
            />
          ))}
          {(!user.roles || user.roles.length === 0) && (
            <Typography variant="body2" sx={{ color: 'text.disabled' }}>
              -
            </Typography>
          )}
        </Stack>
      ),
    },
    {
      id: 'lastLoginAt',
      label: t('lastLoginAt'),
      sortable: true,
      width: '15%',
      render: (_, user) => (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {user.lastLoginAt ? formatDate(user.lastLoginAt) : tc('never')}
        </Typography>
      ),
    },
    {
      id: 'status',
      label: t('status'),
      width: '15%',
      align: 'center',
      render: (_, user) => {
        const isLocked =
          user.lockedUntil && new Date(user.lockedUntil) > new Date();
        const isDeleted = user.deletedAt;

        // 檢查是否為永久鎖定（鎖定時間超過 500 天視為永久）
        const isPermanentLock =
          isLocked &&
          user.lockedUntil &&
          new Date(user.lockedUntil).getTime() - new Date().getTime() >
            500 * 24 * 60 * 60 * 1000;

        let statusLabel = tu('active');
        let statusColor = getStatusColors(theme).success;

        if (isDeleted) {
          statusLabel = tu('deleted');
          statusColor = getStatusColors(theme).error;
        } else if (isLocked) {
          statusLabel = tu('locked');
          statusColor = getStatusColors(theme).warning;
        }

        return (
          <Box>
            <Chip
              label={statusLabel}
              size="small"
              sx={{
                fontSize: '0.75rem',
                height: 24,
                bgcolor: statusColor.bgColor,
                color: statusColor.textColor,
              }}
            />
            {isLocked && user.lockedUntil && (
              <Typography
                variant="caption"
                sx={{ display: 'block', mt: 0.5, color: 'text.secondary' }}
              >
                {isPermanentLock
                  ? tu('permanentLock')
                  : formatDate(user.lockedUntil)}
              </Typography>
            )}
          </Box>
        );
      },
    },
    {
      id: 'actions',
      label: t('actions'),
      width: '13%',
      align: 'right',
      render: (_, user) => {
        const isLocked =
          user.lockedUntil && new Date(user.lockedUntil) > new Date();
        const isDeleted = user.deletedAt;

        return (
          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
            {!isDeleted ? (
              <>
                <Tooltip title={tm('edit')}>
                  <IconButton size="small" onClick={() => onEdit(user)}>
                    <Edit fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title={tm('resetPassword')}>
                  <IconButton
                    size="small"
                    onClick={() => onResetPassword(user)}
                  >
                    <LockReset fontSize="small" />
                  </IconButton>
                </Tooltip>
                {onManageRoles && (
                  <Tooltip title={tm('manageRoles')}>
                    <IconButton
                      size="small"
                      onClick={() => onManageRoles(user)}
                    >
                      <ManageAccounts fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
                {isLocked ? (
                  <Tooltip title={tm('unlock')}>
                    <IconButton
                      size="small"
                      color="success"
                      onClick={() => onUnlock(user)}
                    >
                      <LockOpen fontSize="small" />
                    </IconButton>
                  </Tooltip>
                ) : (
                  <Tooltip title={tm('lock')}>
                    <IconButton
                      size="small"
                      color="warning"
                      onClick={() => onLock(user)}
                    >
                      <Lock fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
                <Tooltip title={tm('delete')}>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => onDelete(user)}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            ) : (
              <Tooltip title={tm('restore')}>
                <IconButton
                  size="small"
                  color="success"
                  onClick={() => onRestore(user)}
                >
                  <Restore fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        );
      },
    },
  ];

  const visibleColumns = readOnly
    ? columns.filter((col) => col.id !== 'actions')
    : columns;

  return (
    <DataTable
      columns={visibleColumns}
      data={users}
      loading={loading}
      emptyText={tu('noUsers')}
      pagination={true}
      page={page}
      totalPages={pageInfo?.totalPages || 0}
      onPageChange={onPageChange}
      sx={{
        '& .MuiTableRow-root': {
          '&:hover': {
            bgcolor: 'action.hover',
          },
        },
      }}
    />
  );
}
