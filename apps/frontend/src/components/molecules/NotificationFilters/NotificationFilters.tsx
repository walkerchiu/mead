'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Collapse,
  IconButton,
  Chip,
  Divider,
  InputAdornment,
} from '@mui/material';
import {
  FilterList,
  Clear,
  ExpandMore,
  ExpandLess,
  Close,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import { FormField, SelectField } from '@/components/molecules';
import { Button } from '@/components/atoms';
import { useDebounce } from '@/hooks/useDebounce';

/**
 * NotificationFilters Component - Atomic Design: Molecule
 *
 * Notification filter component with search and filtering capabilities
 *
 * @example
 * ```tsx
 * <NotificationFilters
 *   searchQuery=""
 *   onSearchChange={(query) => setSearchQuery(query)}
 *   selectedType="all"
 *   onTypeChange={(type) => setSelectedType(type)}
 *   readStatus="all"
 *   onReadStatusChange={(status) => setReadStatus(status)}
 * />
 * ```
 */

export type NotificationTypeFilter =
  | 'all'
  | 'INFO'
  | 'SUCCESS'
  | 'WARNING'
  | 'ERROR';

export interface NotificationFiltersProps {
  /**
   * Search query keyword
   */
  searchQuery: string;

  /**
   * Search change callback
   */
  onSearchChange: (query: string) => void;

  /**
   * Selected notification type
   */
  selectedType: NotificationTypeFilter;

  /**
   * Type change callback
   */
  onTypeChange: (type: NotificationTypeFilter) => void;

  /**
   * Default expanded state
   */
  defaultExpanded?: boolean;

  /**
   * Number of results matching current filters
   */
  resultCount?: number;

  /**
   * Total number of notifications
   */
  totalCount?: number;
}

export const NotificationFilters: React.FC<NotificationFiltersProps> = ({
  searchQuery,
  onSearchChange,
  selectedType,
  onTypeChange,
  defaultExpanded = true,
  resultCount,
  totalCount,
}) => {
  const t = useTranslations('pages.settings.notificationCenter.filters');
  const tTypes = useTranslations('pages.settings.notificationCenter.types');
  const tc = useTranslations('common');
  const [expanded, setExpanded] = useState(defaultExpanded);

  // Use totalCount if resultCount is not provided
  const displayCount = resultCount ?? totalCount;

  // Local state: for real-time display of user input
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [localType, setLocalType] = useState(selectedType);

  // Debounced value: updates after 500ms delay
  const debouncedSearchQuery = useDebounce(localSearchQuery, 500);

  // Trigger parent's onSearchChange when debounced search query changes
  useEffect(() => {
    onSearchChange(debouncedSearchQuery);
  }, [debouncedSearchQuery, onSearchChange]);

  // Sync local state when external searchQuery changes (e.g., clear filters)
  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    setLocalType(selectedType);
  }, [selectedType]);

  const handleSearchChange = (value: string) => {
    setLocalSearchQuery(value);
  };

  const handleTypeChange = (value: string) => {
    setLocalType(value as NotificationTypeFilter);
    onTypeChange(value as NotificationTypeFilter);
  };

  const handleRemoveFilter = (key: string) => {
    if (key === 'searchQuery') {
      setLocalSearchQuery('');
      onSearchChange('');
    } else if (key === 'selectedType') {
      setLocalType('all');
      onTypeChange('all');
    }
  };

  const handleClear = () => {
    setLocalSearchQuery('');
    setLocalType('all');
    onSearchChange('');
    onTypeChange('all');
  };

  const hasFilters = localSearchQuery || localType !== 'all';

  const activeFilterCount =
    (localSearchQuery ? 1 : 0) + (localType !== 'all' ? 1 : 0);

  // Generate filter chips
  const filterChips = [];
  if (localSearchQuery) {
    filterChips.push({
      key: 'searchQuery',
      label: `${t('search')}: ${localSearchQuery}`,
      value: localSearchQuery,
    });
  }
  if (localType !== 'all') {
    filterChips.push({
      key: 'selectedType',
      label: `${t('type')}: ${tTypes(localType.toLowerCase())}`,
      value: localType,
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
            {/* Search field */}
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <FormField
                fullWidth
                label={t('search')}
                value={localSearchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                size="medium"
                placeholder={t('searchPlaceholder')}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Type filter dropdown */}
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <SelectField
                fullWidth
                label={t('type')}
                value={localType}
                onChange={(e) => handleTypeChange(e.target.value)}
                size="medium"
                options={[
                  { value: 'all', label: tc('all') },
                  { value: 'INFO', label: tTypes('info') },
                  { value: 'SUCCESS', label: tTypes('success') },
                  { value: 'WARNING', label: tTypes('warning') },
                  { value: 'ERROR', label: tTypes('error') },
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
};

export default NotificationFilters;
