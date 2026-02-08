'use client';

import {
  Box,
  Typography,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import { CheckCircle, Cancel } from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import {
  PASSWORD_REQUIREMENTS,
  getPasswordStrength,
  getPasswordStrengthLabel,
} from '@/utils/password-validator';

interface PasswordStrengthIndicatorProps {
  password: string;
  showRequirements?: boolean;
}

export function PasswordStrengthIndicator({
  password,
  showRequirements = true,
}: PasswordStrengthIndicatorProps) {
  const t = useTranslations('common.passwordStrength');
  const strength = getPasswordStrength(password);
  const { labelKey, color } = getPasswordStrengthLabel(strength);
  const progress = (strength / PASSWORD_REQUIREMENTS.length) * 100;

  // 翻譯 key 映射
  const requirementKeys = [
    'minLength',
    'uppercase',
    'lowercase',
    'number',
    'specialChar',
  ];

  return (
    <Box sx={{ mt: 1 }}>
      {/* 強度進度條 */}
      {password && (
        <Box sx={{ mb: 2 }}>
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}
          >
            <Typography variant="caption" color="text.secondary">
              {t('label')}
            </Typography>
            <Typography
              variant="caption"
              color={`${color}.main`}
              fontWeight={600}
            >
              {t(labelKey)}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progress}
            color={color}
            sx={{ height: 6, borderRadius: 1 }}
          />
        </Box>
      )}

      {/* 密碼要求檢查列表 */}
      {showRequirements && (
        <Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mb: 1, display: 'block' }}
          >
            {t('requirements')}:
          </Typography>
          <List dense disablePadding>
            {PASSWORD_REQUIREMENTS.map((req, index) => {
              const isValid = password && req.test(password);
              return (
                <ListItem key={index} sx={{ py: 0.25, px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 28 }}>
                    {isValid ? (
                      <CheckCircle
                        sx={{ fontSize: 16, color: 'success.main' }}
                      />
                    ) : (
                      <Cancel sx={{ fontSize: 16, color: 'text.disabled' }} />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={t(requirementKeys[index])}
                    primaryTypographyProps={{
                      variant: 'caption',
                      color: isValid ? 'success.main' : 'text.secondary',
                    }}
                  />
                </ListItem>
              );
            })}
          </List>
        </Box>
      )}
    </Box>
  );
}
