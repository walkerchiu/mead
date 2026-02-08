'use client';

import { useState } from 'react';
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
import { SelectField } from '@/components/molecules';
import { Button } from '@/components/atoms';
import type { CronJobStatus, CronJobConfig } from '@/hooks/useCronJobs';

interface CronJobFiltersProps {
  configs: CronJobConfig[];
  filters: {
    jobName?: string;
    status?: CronJobStatus;
  };
  onChange: (filters: CronJobFiltersProps['filters']) => void;
  resultCount?: number;
  defaultExpanded?: boolean;
}

export function CronJobFilters({
  configs,
  filters,
  onChange,
  resultCount,
  defaultExpanded = false,
}: CronJobFiltersProps) {
  const t = useTranslations('pages.hq.cronJobs.executionFilters');
  const tc = useTranslations('common');
  const [expanded, setExpanded] = useState(defaultExpanded);

  const handleClear = () => {
    onChange({});
  };

  const handleRemoveFilter = (key: 'jobName' | 'status') => {
    const newFilters = { ...filters };
    delete newFilters[key];
    onChange(newFilters);
  };

  const hasFilters = filters.jobName || filters.status;
  const activeFilterCount = [filters.jobName, filters.status].filter(
    Boolean,
  ).length;

  // Generate filter chips
  const filterChips = [];
  if (filters.jobName) {
    const job = configs.find((c) => c.jobName === filters.jobName);
    filterChips.push({
      key: 'jobName',
      label: `${t('job')}: ${job?.displayName || filters.jobName}`,
    });
  }
  if (filters.status) {
    const statusLabels: Record<CronJobStatus, string> = {
      SUCCESS: t('statuses.success'),
      FAILED: t('statuses.failed'),
      TIMEOUT: t('statuses.timeout'),
      RUNNING: t('statuses.running'),
      SKIPPED: t('statuses.skipped'),
    };
    filterChips.push({
      key: 'status',
      label: `${t('status')}: ${statusLabels[filters.status]}`,
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
              {hasFilters
                ? tc('showingResults', { count: resultCount })
                : tc('totalResults', { count: resultCount })}
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
            {/* Job 篩選 */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <SelectField
                fullWidth
                label={t('job')}
                value={filters.jobName || ''}
                onChange={(e) =>
                  onChange({ ...filters, jobName: e.target.value || undefined })
                }
                size="medium"
                options={[
                  { value: '', label: t('all') },
                  ...configs.map((job) => ({
                    value: job.jobName,
                    label: job.displayName,
                  })),
                ]}
              />
            </Grid>

            {/* 狀態篩選 */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <SelectField
                fullWidth
                label={t('status')}
                value={filters.status || ''}
                onChange={(e) =>
                  onChange({
                    ...filters,
                    status: e.target.value
                      ? (e.target.value as CronJobStatus)
                      : undefined,
                  })
                }
                size="medium"
                options={[
                  { value: '', label: t('all') },
                  { value: 'SUCCESS', label: t('statuses.success') },
                  { value: 'FAILED', label: t('statuses.failed') },
                  { value: 'TIMEOUT', label: t('statuses.timeout') },
                  { value: 'RUNNING', label: t('statuses.running') },
                  { value: 'SKIPPED', label: t('statuses.skipped') },
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
                onDelete={() =>
                  handleRemoveFilter(chip.key as 'jobName' | 'status')
                }
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
