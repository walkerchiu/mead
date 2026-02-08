'use client';

import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Collapse,
  IconButton,
  Chip,
  Divider,
  Grid,
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
import type { CronJobConfig } from '@/hooks/useCronJobs';

interface CronJobListFiltersProps {
  configs: CronJobConfig[];
  filters: {
    category?: string;
    jobType?: string;
  };
  onChange: (filters: CronJobListFiltersProps['filters']) => void;
  resultCount?: number;
  defaultExpanded?: boolean;
}

export function CronJobListFilters({
  configs,
  filters,
  onChange,
  resultCount,
  defaultExpanded = false,
}: CronJobListFiltersProps) {
  const t = useTranslations('pages.hq.cronJobs.listFilters');
  const tc = useTranslations('common');
  const [expanded, setExpanded] = useState(defaultExpanded);

  const handleClear = () => {
    onChange({});
  };

  const handleRemoveFilter = (key: 'category' | 'jobType') => {
    const newFilters = { ...filters };
    delete newFilters[key];
    onChange(newFilters);
  };

  const hasFilters = filters.category || filters.jobType;
  const activeFilterCount = [filters.category, filters.jobType].filter(
    Boolean,
  ).length;

  // 取得唯一的類別和類型選項
  const uniqueCategories = Array.from(
    new Set(configs.map((c) => c.category)),
  ).sort();
  const uniqueTypes = Array.from(new Set(configs.map((c) => c.jobType))).sort();

  // Generate filter chips
  const filterChips = [];
  if (filters.category) {
    filterChips.push({
      key: 'category',
      label: `${t('category')}: ${filters.category.toUpperCase()}`,
    });
  }
  if (filters.jobType) {
    filterChips.push({
      key: 'jobType',
      label: `${t('type')}: ${filters.jobType.toUpperCase()}`,
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
            {/* 類別篩選 */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <SelectField
                fullWidth
                label={t('category')}
                value={filters.category || ''}
                onChange={(e) =>
                  onChange({
                    ...filters,
                    category: e.target.value || undefined,
                  })
                }
                size="medium"
                options={[
                  { value: '', label: t('all') },
                  ...uniqueCategories.map((category) => ({
                    value: category,
                    label: category.toUpperCase(),
                  })),
                ]}
              />
            </Grid>

            {/* 類型篩選 */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <SelectField
                fullWidth
                label={t('type')}
                value={filters.jobType || ''}
                onChange={(e) =>
                  onChange({ ...filters, jobType: e.target.value || undefined })
                }
                size="medium"
                options={[
                  { value: '', label: t('all') },
                  ...uniqueTypes.map((type) => ({
                    value: type,
                    label: type.toUpperCase(),
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
                onDelete={() =>
                  handleRemoveFilter(chip.key as 'category' | 'jobType')
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
