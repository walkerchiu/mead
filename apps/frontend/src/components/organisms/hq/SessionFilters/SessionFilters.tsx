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
  Fade,
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

interface SessionFiltersProps {
  filters: {
    userSearch?: string; // Unified user search (email, name, or ID)
    status?: 'ACTIVE' | 'EXPIRED' | 'REVOKED';
    ipAddress?: string;
    deviceInfo?: string;
    location?: string;
    revokedMethod?: string;
  };
  onFiltersChange: (filters: SessionFiltersProps['filters']) => void;
  defaultExpanded?: boolean;
  resultCount?: number;
  totalCount?: number;
}

const SESSION_STATUSES = ['ACTIVE', 'EXPIRED', 'REVOKED'];
const REVOKED_METHODS = [
  'USER_LOGOUT',
  'HQ_FORCE',
  'BATCH_REVOKE',
  'AUTO_EXPIRE',
  'SECURITY_MEASURE',
];

export function SessionFilters({
  filters,
  onFiltersChange,
  defaultExpanded = true,
  resultCount,
  totalCount,
}: SessionFiltersProps) {
  const t = useTranslations('pages.hq.sessions.filters');
  const tc = useTranslations('common');
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [showRevokedMethod, setShowRevokedMethod] = useState(
    filters.status === 'REVOKED',
  );

  // Local state: for real-time display of user input
  const [localFilters, setLocalFilters] = useState(filters);

  // Debounced value: updates after 500ms delay
  const debouncedFilters = useDebounce(localFilters, 500);

  // When debounced filters change, trigger parent's onFiltersChange
  useEffect(() => {
    onFiltersChange(debouncedFilters);
  }, [debouncedFilters]);

  // When external filters change (e.g., clear filters), sync to local state
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // When status changes, clear revoked method filter and control display animation
  useEffect(() => {
    if (localFilters.status === 'REVOKED') {
      setShowRevokedMethod(true);
    } else {
      setShowRevokedMethod(false);
      if (localFilters.revokedMethod) {
        const newFilters = { ...localFilters };
        delete newFilters.revokedMethod;
        setLocalFilters(newFilters);
      }
    }
  }, [localFilters.status]);

  const handleChange = (key: string, value: string) => {
    setLocalFilters({
      ...localFilters,
      [key]: value || undefined,
    });
  };

  const handleRemoveFilter = (key: string) => {
    const newFilters = { ...localFilters };
    delete newFilters[key as keyof typeof localFilters];
    setLocalFilters(newFilters);
    // Immediate update, no need to wait for debounce
    onFiltersChange(newFilters);
  };

  const handleClear = () => {
    setLocalFilters({});
    // Immediate update, no need to wait for debounce
    onFiltersChange({});
  };

  const hasFilters = Object.keys(localFilters).some(
    (key) => localFilters[key as keyof typeof localFilters],
  );

  const activeFilterCount = Object.keys(localFilters).filter(
    (k) => localFilters[k as keyof typeof localFilters],
  ).length;

  // Generate filter chips
  const filterChips = [];
  if (localFilters.userSearch) {
    filterChips.push({
      key: 'userSearch',
      label: `${t('userSearch')}: ${localFilters.userSearch}`,
      value: localFilters.userSearch,
    });
  }
  if (localFilters.status) {
    filterChips.push({
      key: 'status',
      label: `${t('status')}: ${t(`statuses.${localFilters.status.toLowerCase()}`)}`,
      value: localFilters.status,
    });
  }
  if (localFilters.ipAddress) {
    filterChips.push({
      key: 'ipAddress',
      label: `${t('ipAddress')}: ${localFilters.ipAddress}`,
      value: localFilters.ipAddress,
    });
  }
  if (localFilters.deviceInfo) {
    filterChips.push({
      key: 'deviceInfo',
      label: `${t('deviceInfo')}: ${localFilters.deviceInfo}`,
      value: localFilters.deviceInfo,
    });
  }
  if (localFilters.location) {
    filterChips.push({
      key: 'location',
      label: `${t('location')}: ${localFilters.location}`,
      value: localFilters.location,
    });
  }
  if (localFilters.revokedMethod) {
    filterChips.push({
      key: 'revokedMethod',
      label: `${t('revokedMethod')}: ${t(`revokedMethods.${localFilters.revokedMethod.toLowerCase()}`)}`,
      value: localFilters.revokedMethod,
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Result Count */}
          {typeof resultCount === 'number' && (
            <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
              {hasFilters ? (
                <>
                  {tc('showingResults', { count: resultCount })}{' '}
                  {typeof totalCount === 'number' && (
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
                tc('totalResults', { count: resultCount })
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
            {/* User Search */}
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <FormField
                fullWidth
                label={t('userSearch')}
                value={localFilters.userSearch || ''}
                onChange={(e) => handleChange('userSearch', e.target.value)}
                size="medium"
                placeholder={t('userSearchPlaceholder')}
              />
            </Grid>

            {/* Status */}
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <SelectField
                fullWidth
                label={t('status')}
                value={localFilters.status || ''}
                onChange={(e) => handleChange('status', e.target.value)}
                size="medium"
                options={[
                  { value: '', label: tc('all') },
                  ...SESSION_STATUSES.map((status) => ({
                    value: status,
                    label: t(`statuses.${status.toLowerCase()}`),
                  })),
                ]}
              />
            </Grid>

            {/* IP Address */}
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <FormField
                fullWidth
                label={t('ipAddress')}
                value={localFilters.ipAddress || ''}
                onChange={(e) => handleChange('ipAddress', e.target.value)}
                size="medium"
                placeholder={t('ipAddressPlaceholder')}
              />
            </Grid>

            {/* Device Info */}
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <FormField
                fullWidth
                label={t('deviceInfo')}
                value={localFilters.deviceInfo || ''}
                onChange={(e) => handleChange('deviceInfo', e.target.value)}
                size="medium"
                placeholder={t('deviceInfoPlaceholder')}
              />
            </Grid>

            {/* Location */}
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <FormField
                fullWidth
                label={t('location')}
                value={localFilters.location || ''}
                onChange={(e) => handleChange('location', e.target.value)}
                size="medium"
                placeholder={t('locationPlaceholder')}
              />
            </Grid>

            {/* Revoked Method - Only show when status is REVOKED */}
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Fade in={showRevokedMethod} timeout={300} unmountOnExit>
                <Box>
                  <SelectField
                    fullWidth
                    label={t('revokedMethod')}
                    value={localFilters.revokedMethod || ''}
                    onChange={(e) =>
                      handleChange('revokedMethod', e.target.value)
                    }
                    size="medium"
                    options={[
                      { value: '', label: tc('all') },
                      ...REVOKED_METHODS.map((method) => ({
                        value: method,
                        label: t(`revokedMethods.${method.toLowerCase()}`),
                      })),
                    ]}
                  />
                </Box>
              </Fade>
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
