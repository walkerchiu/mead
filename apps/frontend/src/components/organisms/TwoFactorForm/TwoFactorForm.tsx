'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import { useTranslations } from 'next-intl';
import { CodeInput } from '@/components/atoms';
import { Button } from '@/components/atoms';
import { AlertMessage } from '@/components/molecules';

export interface TwoFactorFormProps {
  onSubmit: (code: string, isBackupCode: boolean) => void | Promise<void>;
  loading?: boolean;
  error?: string;
  onBack?: () => void;
  codeLength?: number;
}

export function TwoFactorForm({
  onSubmit,
  loading = false,
  error,
  onBack,
  codeLength = 6,
}: TwoFactorFormProps) {
  const [code, setCode] = useState('');
  const [isBackupCode, setIsBackupCode] = useState(false);
  const t = useTranslations('auth.twoFactor');

  const handleComplete = (completeCode: string) => {
    if (!loading) {
      onSubmit(completeCode, isBackupCode);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length === codeLength && !loading) {
      onSubmit(code, isBackupCode);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleManualSubmit}
      sx={{ width: '100%', maxWidth: 400, textAlign: 'center' }}
    >
      {/* 動態提示文字 */}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {isBackupCode ? t('subtitleBackup') : t('codeInfo')}
      </Typography>

      {error && (
        <AlertMessage
          severity="error"
          showRetry
          retryText={t('retry') || 'Try Again'}
          onRetry={() => setCode('')}
          sx={{ mb: 3 }}
        >
          {error}
        </AlertMessage>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <CodeInput
          length={codeLength}
          value={code}
          onChange={setCode}
          onComplete={handleComplete}
          error={Boolean(error)}
          disabled={loading}
        />
      </Box>

      <FormControlLabel
        control={
          <Checkbox
            checked={isBackupCode}
            onChange={(e) => {
              setIsBackupCode(e.target.checked);
              setCode('');
            }}
            disabled={loading}
          />
        }
        label={t('useBackupCode')}
        sx={{ mb: 2 }}
      />

      <Button
        type="submit"
        variant="contained"
        fullWidth
        size="large"
        loading={loading}
        disabled={loading || code.length !== codeLength}
        sx={{ mt: 1 }}
      >
        {t('submit')}
      </Button>

      {onBack && (
        <Box sx={{ mt: 2 }}>
          <Link
            component="button"
            type="button"
            variant="body2"
            onClick={onBack}
            sx={{ cursor: 'pointer' }}
          >
            {t('backToLogin')}
          </Link>
        </Box>
      )}
    </Box>
  );
}

export default TwoFactorForm;
