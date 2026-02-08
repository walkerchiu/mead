'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
} from '@mui/material';
import { ManageAccounts } from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import { useSnackbar } from 'notistack';
import { useMutation, useQuery } from '@apollo/client/react';
import {
  GET_USER_ROLES,
  GET_ASSIGNABLE_ROLES,
  ASSIGN_ROLE,
  REVOKE_ROLE,
  User,
  Role,
} from '@/graphql/users';
import { Modal } from '@/components/organisms/Modal';
import { Button } from '@/components/atoms';

interface ManageRolesDialogProps {
  open: boolean;
  user: User;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ManageRolesDialog({
  open,
  user,
  onClose,
  onSuccess,
}: ManageRolesDialogProps) {
  const t = useTranslations('pages.hq.users');
  const tc = useTranslations('common');
  const { enqueueSnackbar } = useSnackbar();

  const [selectedRoleId, setSelectedRoleId] = useState('');

  // Query current user roles
  const { data: rolesData, refetch: refetchRoles } = useQuery<{
    userRoles: Array<{
      id: string;
      role: Role;
      grantedAt: string;
      grantedBy?: string | null;
    }>;
  }>(GET_USER_ROLES, {
    variables: { userId: user.id },
    skip: !open,
    fetchPolicy: 'network-only',
  });

  // Query assignable roles
  const { data: assignableData } = useQuery<{
    assignableRoles: Role[];
  }>(GET_ASSIGNABLE_ROLES, {
    skip: !open,
    fetchPolicy: 'network-only',
  });

  const currentUserRoles = rolesData?.userRoles || [];
  const currentRoleIds = currentUserRoles.map((ur) => ur.role.id);
  const availableRoles = (assignableData?.assignableRoles || []).filter(
    (r) => !currentRoleIds.includes(r.id),
  );

  const [assignRole, { loading: assigning }] = useMutation(ASSIGN_ROLE, {
    onCompleted: () => {
      enqueueSnackbar(t('assignSuccess'), { variant: 'success' });
      setSelectedRoleId('');
      refetchRoles();
      onSuccess();
    },
    onError: (error) => {
      enqueueSnackbar(`${tc('error.failed')}: ${error.message}`, {
        variant: 'error',
      });
    },
  });

  const [revokeRole, { loading: revoking }] = useMutation(REVOKE_ROLE, {
    onCompleted: () => {
      enqueueSnackbar(t('revokeSuccess'), { variant: 'success' });
      refetchRoles();
      onSuccess();
    },
    onError: (error) => {
      enqueueSnackbar(`${tc('error.failed')}: ${error.message}`, {
        variant: 'error',
      });
    },
  });

  const handleClose = () => {
    setSelectedRoleId('');
    onClose();
  };

  const handleAssign = async () => {
    if (!selectedRoleId) return;
    await assignRole({
      variables: {
        input: {
          targetUserId: user.id,
          roleId: selectedRoleId,
        },
      },
    });
  };

  const handleRevoke = async (roleId: string) => {
    if (!confirm(t('confirmRevoke'))) return;
    await revokeRole({
      variables: {
        input: {
          targetUserId: user.id,
          roleId,
        },
      },
    });
  };

  const loading = assigning || revoking;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={t('manageRoles')}
      icon={<ManageAccounts sx={{ color: 'primary.main' }} />}
      maxWidth="sm"
      fullWidth
      dividers
      actions={[
        {
          label: tc('close'),
          onClick: handleClose,
          disabled: loading,
        },
      ]}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Typography variant="body2" color="text.secondary">
          {t('manageRolesFor')} <strong>{user.name || user.email}</strong>
        </Typography>

        {/* Current Roles */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            {t('currentRoles')}
          </Typography>
          {currentUserRoles.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              {t('noRoles')}
            </Typography>
          ) : (
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {currentUserRoles.map((ur) => (
                <Chip
                  key={ur.id}
                  label={`${ur.role.scope === 'HQ_SCOPE' ? '[HQ] ' : ''}${ur.role.displayName}`}
                  onDelete={() => handleRevoke(ur.role.id)}
                  disabled={loading}
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Stack>
          )}
        </Box>

        {/* Assign Role */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            {t('assignRole')}
          </Typography>
          <Stack direction="row" spacing={2} alignItems="flex-start">
            <FormControl fullWidth size="small">
              <InputLabel>{t('selectRole')}</InputLabel>
              <Select
                value={selectedRoleId}
                onChange={(e) => setSelectedRoleId(e.target.value)}
                label={t('selectRole')}
                disabled={loading || availableRoles.length === 0}
              >
                {availableRoles.map((role) => (
                  <MenuItem key={role.id} value={role.id}>
                    {role.scope === 'HQ_SCOPE' ? '[HQ] ' : ''}
                    {role.displayName}
                    {role.description && (
                      <Typography
                        component="span"
                        variant="caption"
                        color="text.secondary"
                        sx={{ ml: 1 }}
                      >
                        - {role.description}
                      </Typography>
                    )}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              onClick={handleAssign}
              disabled={loading || !selectedRoleId}
              sx={{ whiteSpace: 'nowrap' }}
            >
              {t('assignRole')}
            </Button>
          </Stack>
        </Box>
      </Box>
    </Modal>
  );
}
