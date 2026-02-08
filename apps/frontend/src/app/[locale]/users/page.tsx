'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Container, Alert, Skeleton } from '@mui/material';
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
  LOCK_USER,
  UNLOCK_USER,
  User,
  PaginatedUsers,
  LockUserInput,
  UserFilterInput,
} from '@/graphql/users';
import { usePermissions } from '@/hooks/usePermissions';

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

function UsersContent() {
  const t = useTranslations('pages.hq.users');
  const tc = useTranslations('common');
  const { enqueueSnackbar } = useSnackbar();
  const authReady = useAuthReady();

  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [deleteUserModalOpen, setDeleteUserModalOpen] = useState(false);
  const [manageRolesUser, setManageRolesUser] = useState<User | null>(null);
  const [filters, setFilters] = useState<UserFilterInput>({});
  const { hasPermission } = usePermissions();
  const canWriteUsers = hasPermission('users:create');

  const { data, loading, error, refetch } = useQuery<{
    usersPaginated: PaginatedUsers;
  }>(GET_USERS_PAGINATED, {
    variables: {
      pagination: { page, limit: 20 },
      filter: filters,
      includeDeleted: false,
    },
    skip: !authReady,
    fetchPolicy: 'network-only',
  });

  const [lockUser] = useMutation(LOCK_USER, {
    onCompleted: () => {
      enqueueSnackbar(t('lockSuccess'), { variant: 'success' });
      refetch();
    },
    onError: (err) => {
      enqueueSnackbar(`${tc('error')}: ${err.message}`, { variant: 'error' });
    },
  });

  const [unlockUser] = useMutation(UNLOCK_USER, {
    onCompleted: () => {
      enqueueSnackbar(t('unlockSuccess'), { variant: 'success' });
      refetch();
    },
    onError: (err) => {
      enqueueSnackbar(`${tc('error')}: ${err.message}`, { variant: 'error' });
    },
  });

  const users = data?.usersPaginated?.data || [];
  const pageInfo = data?.usersPaginated?.pageInfo;

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

  const handleLock = async (user: User) => {
    const input: LockUserInput = { lockDurationMinutes: 999999 };
    await lockUser({ variables: { id: user.id, input } });
  };

  const handleUnlock = async (user: User) => {
    await unlockUser({ variables: { id: user.id } });
  };

  return (
    <AppShell>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <PageHeader
          breadcrumbs={[
            { label: tc('breadcrumb.dashboard'), href: '/dashboard' },
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

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {tc('error.loadFailed')}: {error.message}
          </Alert>
        )}

        <UserFilters
          filters={filters}
          onChange={setFilters}
          resultCount={pageInfo?.totalCount}
        />

        <UserTable
          users={users}
          loading={loading}
          pageInfo={pageInfo}
          page={page}
          onPageChange={setPage}
          onEdit={handleEdit}
          onResetPassword={handleResetPassword}
          onManageRoles={
            hasPermission('roles:manage') ? handleManageRoles : undefined
          }
          onDelete={handleDelete}
          onRestore={() => {}}
          onLock={handleLock}
          onUnlock={handleUnlock}
          readOnly={!canWriteUsers}
        />
      </Container>

      <CreateUserDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSuccess={() => {
          setCreateDialogOpen(false);
          refetch();
        }}
      />

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

      {selectedUser && (
        <ResetPasswordDialog
          open={resetPasswordDialogOpen}
          user={selectedUser}
          onClose={() => setResetPasswordDialogOpen(false)}
          onSuccess={() => setResetPasswordDialogOpen(false)}
        />
      )}

      {manageRolesUser && (
        <ManageRolesDialog
          open={!!manageRolesUser}
          user={manageRolesUser}
          onClose={() => setManageRolesUser(null)}
          onSuccess={() => refetch()}
        />
      )}

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
      requiredScopes={['CUSTOMER_SCOPE']}
      requiredPermissions={['users:create']}
    >
      <UsersContent />
    </ProtectedRoute>
  );
}
