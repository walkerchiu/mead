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

interface AuditLogFiltersProps {
  filters: {
    userSearch?: string; // Unified user search (email, name, or ID)
    action?: string;
    entity?: string;
    status?: string;
  };
  onChange: (filters: AuditLogFiltersProps['filters']) => void;
  defaultExpanded?: boolean;
  resultCount?: number;
  totalCount?: number;
}

export function AuditLogFilters({
  filters,
  onChange,
  defaultExpanded = true,
  resultCount,
  totalCount,
}: AuditLogFiltersProps) {
  const t = useTranslations('pages.hq.auditLogs.filters');
  const tc = useTranslations('common');
  const [expanded, setExpanded] = useState(defaultExpanded);

  // Local state: for real-time display of user input
  const [localFilters, setLocalFilters] = useState(filters);

  // Debounced value: updates after 500ms delay
  const debouncedFilters = useDebounce(localFilters, 500);

  // When debounced filters change, trigger parent's onChange
  useEffect(() => {
    onChange(debouncedFilters);
  }, [debouncedFilters]);

  // When external filters change (e.g., clear filters), sync to local state
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

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
  if (localFilters.userSearch) {
    filterChips.push({
      key: 'userSearch',
      label: `${t('userSearch')}: ${localFilters.userSearch}`,
      value: localFilters.userSearch,
    });
  }
  if (localFilters.action) {
    filterChips.push({
      key: 'action',
      label: `${t('action')}: ${localFilters.action}`,
      value: localFilters.action,
    });
  }
  if (localFilters.entity) {
    filterChips.push({
      key: 'entity',
      label: `${t('entity')}: ${localFilters.entity}`,
      value: localFilters.entity,
    });
  }
  if (localFilters.status) {
    const statusLabel =
      localFilters.status === 'SUCCESS' ? t('success') : t('failure');
    filterChips.push({
      key: 'status',
      label: `${t('status')}: ${statusLabel}`,
      value: localFilters.status,
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
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormField
                fullWidth
                label={t('userSearch')}
                value={localFilters.userSearch || ''}
                onChange={(e) => handleChange('userSearch', e.target.value)}
                size="medium"
                placeholder={t('userSearchPlaceholder')}
              />
            </Grid>

            {/* Action */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormField
                fullWidth
                label={t('action')}
                value={localFilters.action || ''}
                onChange={(e) => handleChange('action', e.target.value)}
                size="medium"
                placeholder={t('actionPlaceholder')}
              />
            </Grid>

            {/* Entity */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormField
                fullWidth
                label={t('entity')}
                value={localFilters.entity || ''}
                onChange={(e) => handleChange('entity', e.target.value)}
                size="medium"
                placeholder={t('entityPlaceholder')}
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
                  { value: 'SUCCESS', label: t('success') },
                  { value: 'FAILURE', label: t('failure') },
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
