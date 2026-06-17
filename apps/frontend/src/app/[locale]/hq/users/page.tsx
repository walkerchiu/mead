'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import {
  Container,
  Alert,
  Skeleton,
  Tabs,
  Tab,
  Box,
  Typography,
} from '@mui/material';
import { Button } from '@/components/atoms';
import {
  PersonAdd as PersonAddIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import { useSnackbar } from 'notistack';
import { useQuery, useMutation } from '@apollo/client/react';
import { AppShell } from '@/components/layout';
import { PageHeader } from '@/components/molecules';
import ProtectedRoute, { useAuthReady } from '@/components/auth/ProtectedRoute';
import {
  GET_USERS_PAGINATED,
  RESTORE_USER,
  LOCK_USER,
  UNLOCK_USER,
  User,
  PaginatedUsers,
  LockUserInput,
  UserFilterInput,
} from '@/graphql/users';
import { usePermissions } from '@/hooks/usePermissions';
import {
  GET_FEATURE_MATRIX,
  SET_ROLE_FEATURE_ACCESS,
  RoleFeatureRow,
} from '@/graphql/rbac';
import { callerRankInScope } from '@/lib/rbac';

// Lazy load components
const UserTable = dynamic(
  () =>
    import('@/components/organisms/hq/UserTable/UserTable').then(
      (mod) => mod.UserTable,
    ),
  {
    loading: () => <Skeleton variant="rectangular" height={400} />,
  },
);

const UserFilters = dynamic(
  () =>
    import('@/components/organisms/hq/UserFilters/UserFilters').then(
      (mod) => mod.UserFilters,
    ),
  {
    loading: () => <Skeleton variant="rectangular" height={120} />,
  },
);

const CreateUserDialog = dynamic(
  () => import('@/components/organisms/hq/CreateUserDialog'),
  { ssr: false },
);

const EditUserDialog = dynamic(
  () => import('@/components/organisms/hq/EditUserDialog'),
  { ssr: false },
);

const ResetPasswordDialog = dynamic(
  () => import('@/components/organisms/hq/ResetPasswordDialog'),
  { ssr: false },
);

const DeleteUserModal = dynamic(
  () =>
    import('@/components/organisms/hq/DeleteUserModal').then((mod) => ({
      default: mod.DeleteUserModal,
    })),
  { ssr: false },
);

const ManageRolesDialog = dynamic(
  () => import('@/components/organisms/hq/ManageRolesDialog'),
  { ssr: false },
);

const FeatureMatrix = dynamic(
  () =>
    import('@/components/organisms/hq/FeatureMatrix/FeatureMatrix').then(
      (mod) => mod.FeatureMatrix,
    ),
  { loading: () => <Skeleton variant="rectangular" height={320} /> },
);

function UsersContent() {
  const t = useTranslations('pages.hq.users');
  const tc = useTranslations('common');
  const { enqueueSnackbar } = useSnackbar();
  const authReady = useAuthReady();

  const [page, setPage] = useState(1);
  const [includeDeleted] = useState(true); // 改為 true 以便篩選器可以篩選已刪除的用戶
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [deleteUserModalOpen, setDeleteUserModalOpen] = useState(false);
  const [manageRolesUser, setManageRolesUser] = useState<User | null>(null);
  const [filters, setFilters] = useState<UserFilterInput>({});
  const { hasPermission } = usePermissions();
  const canWriteUsers = hasPermission('users:create');
  const canManageRoles = hasPermission('roles:manage');

  const tFeature = useTranslations('pages.hq.users.featureMatrix');
  const [tab, setTab] = useState(0);
  const callerRank = callerRankInScope('HQ_SCOPE');
  const hqFeatureColumns = [
    { key: 'user-management', label: tFeature('features.user-management') },
    { key: 'audit-logs', label: tFeature('features.audit-logs') },
    { key: 'sessions', label: tFeature('features.sessions') },
    { key: 'cron-jobs', label: tFeature('features.cron-jobs') },
  ];

  // 查詢用戶列表
  const { data, loading, error, refetch } = useQuery<{
    usersPaginated: PaginatedUsers;
  }>(GET_USERS_PAGINATED, {
    variables: {
      pagination: { page, limit: 20 },
      filter: filters,
      includeDeleted,
    },
    skip: !authReady,
    fetchPolicy: 'network-only',
  });

  // 恢復用戶
  const [restoreUser] = useMutation(RESTORE_USER, {
    onCompleted: () => {
      enqueueSnackbar(t('restoreSuccess'), { variant: 'success' });
      refetch();
    },
    onError: (error) => {
      enqueueSnackbar(`${tc('error.restoreFailed')}: ${error.message}`, {
        variant: 'error',
      });
    },
  });

  // 鎖定用戶
  const [lockUser] = useMutation(LOCK_USER, {
    onCompleted: () => {
      enqueueSnackbar(t('lockSuccess'), { variant: 'success' });
      refetch();
    },
    onError: (error) => {
      enqueueSnackbar(`${tc('error')}: ${error.message}`, {
        variant: 'error',
      });
    },
  });

  // 解鎖用戶
  const [unlockUser] = useMutation(UNLOCK_USER, {
    onCompleted: () => {
      enqueueSnackbar(t('unlockSuccess'), { variant: 'success' });
      refetch();
    },
    onError: (error) => {
      enqueueSnackbar(`${tc('error')}: ${error.message}`, {
        variant: 'error',
      });
    },
  });

  // 功能權限矩陣（HQ scope）；切到該分頁才查詢。
  const {
    data: matrixData,
    loading: matrixLoading,
    refetch: refetchMatrix,
  } = useQuery<{ featureMatrix: RoleFeatureRow[] }>(GET_FEATURE_MATRIX, {
    variables: { scope: 'HQ_SCOPE' },
    skip: !authReady || tab !== 1,
    fetchPolicy: 'cache-and-network',
  });

  const [setFeatureAccess] = useMutation(SET_ROLE_FEATURE_ACCESS, {
    onCompleted: () => {
      enqueueSnackbar(tFeature('updateSuccess'), { variant: 'success' });
      refetchMatrix();
    },
    onError: (err) => {
      enqueueSnackbar(`${tc('error')}: ${err.message}`, { variant: 'error' });
    },
  });

  const handleFeatureToggle = (
    roleId: string,
    featureKey: string,
    canRead: boolean,
    canWrite: boolean,
  ) => {
    setFeatureAccess({
      variables: { input: { roleId, featureKey, canRead, canWrite } },
    });
  };

  // 直接使用後端篩選後的結果
  const users = data?.usersPaginated?.data || [];
  const pageInfo = data?.usersPaginated?.pageInfo;

  // 當篩選條件變更時，重置頁碼到第一頁
  useEffect(() => {
    setPage(1);
  }, [filters]);

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setEditDialogOpen(true);
  };

  const handleResetPassword = (user: User) => {
    setSelectedUser(user);
    setResetPasswordDialogOpen(true);
  };

  const handleManageRoles = (user: User) => {
    setManageRolesUser(user);
  };

  const handleDelete = (user: User) => {
    setSelectedUser(user);
    setDeleteUserModalOpen(true);
  };

  const handleDeleteSuccess = () => {
    enqueueSnackbar(t('deleteSuccess'), { variant: 'success' });
    setDeleteUserModalOpen(false);
    refetch();
  };

  const handleRestore = async (user: User) => {
    await restoreUser({ variables: { id: user.id } });
  };

  const handleLock = async (user: User) => {
    // 直接永久鎖定（999999 分鐘 ≈ 694 天）
    const input: LockUserInput = {
      lockDurationMinutes: 999999,
    };
    await lockUser({
      variables: {
        id: user.id,
        input,
      },
    });
  };

  const handleUnlock = async (user: User) => {
    await unlockUser({ variables: { id: user.id } });
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <AppShell>
      {/* 主要內容區 */}
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* 頁面標題 */}
        <PageHeader
          breadcrumbs={[
            { label: tc('breadcrumb.dashboard'), href: '/dashboard' },
            { label: tc('breadcrumb.hq') },
            { label: tc('breadcrumb.users') },
          ]}
          title={t('title')}
          description={t('description')}
          icon={<PeopleIcon sx={{ fontSize: '2rem', color: 'primary.main' }} />}
          actions={
            canWriteUsers ? (
              <Button
                variant="contained"
                startIcon={<PersonAddIcon />}
                onClick={() => setCreateDialogOpen(true)}
              >
                {t('createUser')}
              </Button>
            ) : undefined
          }
        />

        {/* 分頁：帳號 / 功能權限 */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v as number)}>
            <Tab label={t('tabs.accounts')} />
            <Tab label={t('tabs.featureMatrix')} />
          </Tabs>
        </Box>

        {tab === 0 && (
          <>
            {/* 錯誤提示 */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {tc('error.loadFailed')}: {error.message}
              </Alert>
            )}

            {/* 篩選器 */}
            <UserFilters
              filters={filters}
              onChange={setFilters}
              resultCount={pageInfo?.totalCount}
            />

            {/* 用戶列表 */}
            <UserTable
              users={users}
              loading={loading}
              pageInfo={pageInfo}
              page={page}
              onPageChange={handlePageChange}
              onEdit={handleEdit}
              onResetPassword={handleResetPassword}
              onManageRoles={canManageRoles ? handleManageRoles : undefined}
              onDelete={handleDelete}
              onRestore={handleRestore}
              onLock={handleLock}
              onUnlock={handleUnlock}
              readOnly={!canWriteUsers}
            />
          </>
        )}

        {tab === 1 && (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {tFeature('description')}
            </Typography>
            {!canManageRoles && (
              <Alert severity="info" sx={{ mb: 2 }}>
                {tFeature('noPermission')}
              </Alert>
            )}
            <FeatureMatrix
              rows={matrixData?.featureMatrix ?? []}
              features={hqFeatureColumns}
              loading={matrixLoading}
              callerRank={callerRank}
              editable={canManageRoles}
              onToggle={handleFeatureToggle}
            />
          </Box>
        )}
      </Container>

      {/* 創建用戶對話框 */}
      <CreateUserDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSuccess={() => {
          setCreateDialogOpen(false);
          refetch();
        }}
      />

      {/* 編輯用戶對話框 */}
      {selectedUser && (
        <EditUserDialog
          open={editDialogOpen}
          user={selectedUser}
          onClose={() => setEditDialogOpen(false)}
          onSuccess={() => {
            setEditDialogOpen(false);
            refetch();
          }}
        />
      )}

      {/* 重設密碼對話框 */}
      {selectedUser && (
        <ResetPasswordDialog
          open={resetPasswordDialogOpen}
          user={selectedUser}
          onClose={() => setResetPasswordDialogOpen(false)}
          onSuccess={() => {
            setResetPasswordDialogOpen(false);
          }}
        />
      )}

      {/* 管理角色對話框 */}
      {manageRolesUser && (
        <ManageRolesDialog
          open={!!manageRolesUser}
          user={manageRolesUser}
          onClose={() => setManageRolesUser(null)}
          onSuccess={() => {
            refetch();
          }}
        />
      )}

      {/* 刪除用戶確認 Modal */}
      <DeleteUserModal
        open={deleteUserModalOpen}
        user={selectedUser}
        onClose={() => setDeleteUserModalOpen(false)}
        onSuccess={handleDeleteSuccess}
      />
    </AppShell>
  );
}

export default function UsersPage() {
  return (
    <ProtectedRoute
      requiredScopes={['HQ_SCOPE']}
      requiredPermissions={['users:create', 'users:read']}
    >
      <UsersContent />
    </ProtectedRoute>
  );
}
