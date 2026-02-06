'use client';

import {
  Box,
  TextField,
  MenuItem,
  Button,
  Grid,
  Paper,
  Typography,
} from '@mui/material';
import { FilterList, Clear } from '@mui/icons-material';
import { useTranslations } from 'next-intl';

interface AuditLogFiltersProps {
  filters: {
    userId?: string;
    action?: string;
    entity?: string;
    status?: string;
  };
  onChange: (filters: AuditLogFiltersProps['filters']) => void;
}

export function AuditLogFilters({ filters, onChange }: AuditLogFiltersProps) {
  const t = useTranslations('pages.admin.auditLogs.filters');
  const tc = useTranslations('common');

  const handleChange = (key: string, value: string) => {
    onChange({
      ...filters,
      [key]: value || undefined,
    });
  };

  const handleClear = () => {
    onChange({});
  };

  const hasFilters = Object.keys(filters).some(
    (key) => filters[key as keyof typeof filters],
  );

  return (
    <Paper
      elevation={0}
      sx={{ p: 3, mb: 4, border: '1px solid', borderColor: 'divider' }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <FilterList sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h6" component="h2">
          {t('title')}
        </Typography>
      </Box>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            fullWidth
            label={t('action')}
            value={filters.action || ''}
            onChange={(e) => handleChange('action', e.target.value)}
            placeholder={t('actionPlaceholder')}
            helperText={t('actionHelper')}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            fullWidth
            label={t('entity')}
            value={filters.entity || ''}
            onChange={(e) => handleChange('entity', e.target.value)}
            placeholder={t('entityPlaceholder')}
            helperText={t('entityHelper')}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            select
            fullWidth
            label={t('status')}
            value={filters.status || ''}
            onChange={(e) => handleChange('status', e.target.value)}
            SelectProps={{
              MenuProps: {
                PaperProps: {
                  style: {
                    maxHeight: 300,
                  },
                },
              },
            }}
            sx={{ minWidth: 120 }}
          >
            <MenuItem value="">{tc('all')}</MenuItem>
            <MenuItem value="SUCCESS">{t('success')}</MenuItem>
            <MenuItem value="FAILURE">{t('failure')}</MenuItem>
          </TextField>
        </Grid>

        <Grid
          size={{ xs: 12, sm: hasFilters ? 9 : 12, md: hasFilters ? 10 : 12 }}
        >
          <TextField
            fullWidth
            label={t('userId')}
            value={filters.userId || ''}
            onChange={(e) => handleChange('userId', e.target.value)}
            placeholder={t('userIdPlaceholder')}
          />
        </Grid>

        {hasFilters && (
          <Grid size={{ xs: 12, sm: 3, md: 2 }}>
            <Button
              variant="outlined"
              startIcon={<Clear />}
              onClick={handleClear}
              fullWidth
              sx={{ height: '56px' }}
            >
              {t('clear')}
            </Button>
          </Grid>
        )}
      </Grid>
    </Paper>
  );
}
