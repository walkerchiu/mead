'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Collapse,
  IconButton,
  Chip,
  Divider,
} from '@mui/material';
import {
  FilterList,
  Clear,
  ExpandMore,
  ExpandLess,
  Close,
} from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import { FormField, SelectField } from '@/components/molecules';
import { Button } from '@/components/atoms';
import { useDebounce } from '@/hooks/useDebounce';
import { useQuery } from '@apollo/client/react';
import { GET_ASSIGNABLE_ROLES, UserFilterInput, Role } from '@/graphql/users';

interface UserFiltersProps {
  filters: UserFilterInput;
  onChange: (filters: UserFilterInput) => void;
  defaultExpanded?: boolean;
  resultCount?: number;
  totalCount?: number;
}

export function UserFilters({
  filters,
  onChange,
  defaultExpanded = true,
  resultCount,
  totalCount,
}: UserFiltersProps) {
  const t = useTranslations('pages.hq.users.filters');
  const tc = useTranslations('common');
  const [expanded, setExpanded] = useState(defaultExpanded);

  // Query available roles for role filter
  const { data: rolesData } = useQuery<{ assignableRoles: Role[] }>(
    GET_ASSIGNABLE_ROLES,
  );

  // Use totalCount if resultCount is not provided
  const displayCount = resultCount ?? totalCount;

  // Local state: for real-time display of user input
  const [localFilters, setLocalFilters] = useState(filters);

  // Debounced value: updates after 500ms delay
  const debouncedFilters = useDebounce(localFilters, 500);

  // When debounced filters change, trigger parent's onChange
  useEffect(() => {
    onChange(debouncedFilters);
  }, [debouncedFilters, onChange]);

  // When external filters change (e.g., clear filters), sync to local state
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleChange = (key: string, value: string) => {
    const updated = {
      ...localFilters,
      [key]: value || undefined,
    };

    // 連動：選擇 Access Scope 時，清除不屬於該 Scope 的 Role
    if (key === 'accessScope' && updated.roleId) {
      const selectedRole = rolesData?.assignableRoles?.find(
        (r) => r.id === updated.roleId,
      );
      if (selectedRole && value && selectedRole.scope !== value) {
        updated.roleId = undefined;
      }
    }

    // 連動：選擇 Role 時，自動設定 Access Scope
    if (key === 'roleId' && value) {
      const selectedRole = rolesData?.assignableRoles?.find(
        (r) => r.id === value,
      );
      if (selectedRole) {
        updated.accessScope = selectedRole.scope;
      }
    }

    setLocalFilters(updated);
  };

  const handleRemoveFilter = (key: string) => {
    const newFilters = { ...localFilters };
    delete newFilters[key as keyof typeof localFilters];
    setLocalFilters(newFilters);
    // Immediate update, no need to wait for debounce
    onChange(newFilters);
  };

  const handleClear = () => {
    setLocalFilters({});
    // Immediate update, no need to wait for debounce
    onChange({});
  };

  const hasFilters = Object.keys(localFilters).some(
    (key) => localFilters[key as keyof typeof localFilters],
  );

  const activeFilterCount = Object.keys(localFilters).filter(
    (k) => localFilters[k as keyof typeof localFilters],
  ).length;

  // Generate filter chips
  const filterChips = [];
  if (localFilters.search) {
    filterChips.push({
      key: 'search',
      label: `${t('search')}: ${localFilters.search}`,
      value: localFilters.search,
    });
  }
  if (localFilters.accessScope) {
    filterChips.push({
      key: 'accessScope',
      label: `${t('accessScope')}: ${t(`accessScopes.${localFilters.accessScope.toLowerCase()}`)}`,
      value: localFilters.accessScope,
    });
  }
  if (localFilters.status) {
    filterChips.push({
      key: 'status',
      label: `${t('status')}: ${t(`statuses.${localFilters.status.toLowerCase()}`)}`,
      value: localFilters.status,
    });
  }
  if (localFilters.roleId) {
    const roleName =
      rolesData?.assignableRoles?.find((r) => r.id === localFilters.roleId)
        ?.displayName || localFilters.roleId;
    filterChips.push({
      key: 'roleId',
      label: `${t('role')}: ${roleName}`,
      value: localFilters.roleId,
    });
  }

  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        mb: 3,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            flex: 1,
          }}
          onClick={() => setExpanded(!expanded)}
        >
          <FilterList
            sx={{
              mr: 1,
              color: hasFilters ? 'primary.main' : 'text.secondary',
            }}
          />
          <Typography variant="h6" component="h3">
            {t('title')}
          </Typography>
          {hasFilters && (
            <Chip
              label={activeFilterCount}
              size="medium"
              color="primary"
              sx={{ ml: 1, height: 20, fontSize: '0.75rem' }}
            />
          )}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Result Count - Moved to right side */}
          {typeof displayCount === 'number' && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ whiteSpace: 'nowrap' }}
            >
              {hasFilters ? (
                <>
                  {tc('showingResults', { count: displayCount })}{' '}
                  {typeof totalCount === 'number' &&
                    resultCount !== undefined &&
                    resultCount !== totalCount && (
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.disabled"
                      >
                        / {tc('totalResults', { count: totalCount })}
                      </Typography>
                    )}
                </>
              ) : (
                tc('totalResults', { count: displayCount })
              )}
            </Typography>
          )}
          {hasFilters && (
            <Button
              variant="text"
              startIcon={<Clear />}
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              size="medium"
              color="primary"
            >
              {tc('clearAll')}
            </Button>
          )}
          <IconButton
            size="medium"
            onClick={() => setExpanded(!expanded)}
            aria-label={expanded ? 'collapse' : 'expand'}
          >
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Box>
      </Box>

      {/* Filter Form */}
      <Collapse in={expanded}>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            {/* Search */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormField
                fullWidth
                label={t('search')}
                value={localFilters.search || ''}
                onChange={(e) => handleChange('search', e.target.value)}
                size="medium"
                placeholder={t('searchPlaceholder')}
              />
            </Grid>

            {/* Access Scope */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <SelectField
                fullWidth
                label={t('accessScope')}
                value={localFilters.accessScope || ''}
                onChange={(e) => handleChange('accessScope', e.target.value)}
                size="medium"
                options={[
                  { value: '', label: tc('all') },
                  { value: 'HQ_SCOPE', label: t('accessScopes.hq_scope') },
                  {
                    value: 'CUSTOMER_SCOPE',
                    label: t('accessScopes.customer_scope'),
                  },
                  {
                    value: 'PUBLIC_SCOPE',
                    label: t('accessScopes.public_scope'),
                  },
                ]}
              />
            </Grid>

            {/* Status */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <SelectField
                fullWidth
                label={t('status')}
                value={localFilters.status || ''}
                onChange={(e) => handleChange('status', e.target.value)}
                size="medium"
                options={[
                  { value: '', label: tc('all') },
                  { value: 'ACTIVE', label: t('statuses.active') },
                  { value: 'LOCKED', label: t('statuses.locked') },
                  { value: 'DELETED', label: t('statuses.deleted') },
                ]}
              />
            </Grid>

            {/* Role */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <SelectField
                fullWidth
                label={t('role')}
                value={localFilters.roleId || ''}
                onChange={(e) => handleChange('roleId', e.target.value)}
                size="medium"
                options={[
                  { value: '', label: tc('all') },
                  ...(rolesData?.assignableRoles || [])
                    .filter(
                      (role) =>
                        !localFilters.accessScope ||
                        role.scope === localFilters.accessScope,
                    )
                    .map((role) => ({
                      value: role.id,
                      label:
                        role.scope === 'HQ_SCOPE'
                          ? `[HQ] ${role.displayName}`
                          : role.displayName,
                    })),
                ]}
              />
            </Grid>
          </Grid>
        </Box>
      </Collapse>

      {/* Active Filters Chips - Display at bottom */}
      {hasFilters && (
        <>
          <Divider sx={{ mt: 2, mb: 1.5 }} />
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {filterChips.map((chip) => (
              <Chip
                key={chip.key}
                label={chip.label}
                onDelete={() => handleRemoveFilter(chip.key)}
                deleteIcon={<Close />}
                size="medium"
                variant="outlined"
                color="primary"
                sx={{
                  maxWidth: '300px',
                  '& .MuiChip-label': {
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  },
                }}
              />
            ))}
          </Box>
        </>
      )}
    </Paper>
  );
}
