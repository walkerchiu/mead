'use client';

import { Box, Grid, Paper, Typography } from '@mui/material';
import { FilterList, Clear } from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import { FormField, SelectField } from '@/components/molecules';
import { Button } from '@/components/atoms';

interface SessionFiltersProps {
  filters: {
    userId?: string;
    status?: 'ACTIVE' | 'EXPIRED' | 'REVOKED';
    ipAddress?: string;
    deviceInfo?: string;
    location?: string;
  };
  onFiltersChange: (filters: SessionFiltersProps['filters']) => void;
}

const SESSION_STATUSES = ['ACTIVE', 'EXPIRED', 'REVOKED'];

export function SessionFilters({
  filters,
  onFiltersChange,
}: SessionFiltersProps) {
  const t = useTranslations('pages.admin.sessions.filters');
  const tc = useTranslations('common');

  const handleChange = (key: string, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined,
    });
  };

  const handleClear = () => {
    onFiltersChange({});
  };

  const hasFilters = Object.keys(filters).some(
    (key) => filters[key as keyof typeof filters],
  );

  return (
    <Paper
      elevation={0}
      sx={{ p: 3, mb: 4, border: '1px solid', borderColor: 'divider' }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <FilterList sx={{ mr: 1, color: 'text.secondary' }} />
        <Typography variant="h6" component="h3">
          {t('title')}
        </Typography>
      </Box>

      <Grid container spacing={2}>
        {/* User ID */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <FormField
            fullWidth
            label={t('userId')}
            value={filters.userId || ''}
            onChange={(e) => handleChange('userId', e.target.value)}
            size="small"
            placeholder={t('userIdPlaceholder')}
          />
        </Grid>

        {/* Status */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <SelectField
            fullWidth
            label={t('status')}
            value={filters.status || ''}
            onChange={(e) => handleChange('status', e.target.value)}
            size="small"
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
            value={filters.ipAddress || ''}
            onChange={(e) => handleChange('ipAddress', e.target.value)}
            size="small"
            placeholder={t('ipAddressPlaceholder')}
          />
        </Grid>

        {/* Device Info */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <FormField
            fullWidth
            label={t('deviceInfo')}
            value={filters.deviceInfo || ''}
            onChange={(e) => handleChange('deviceInfo', e.target.value)}
            size="small"
            placeholder={t('deviceInfoPlaceholder')}
          />
        </Grid>

        {/* Location */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <FormField
            fullWidth
            label={t('location')}
            value={filters.location || ''}
            onChange={(e) => handleChange('location', e.target.value)}
            size="small"
            placeholder={t('locationPlaceholder')}
          />
        </Grid>

        {/* Clear Button */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<Clear />}
            onClick={handleClear}
            disabled={!hasFilters}
            sx={{ height: '40px' }}
          >
            {tc('clear')}
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
}
