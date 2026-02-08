import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  SxProps,
  Theme,
} from '@mui/material';
import { ContentCopy, Check } from '@mui/icons-material';
import { useTranslations } from 'next-intl';

export interface DetailRowProps {
  /** Icon (optional) */
  icon?: React.ReactNode;

  /** Label text */
  label: string;

  /** Value content (string or ReactNode) */
  value: React.ReactNode;

  /** Whether copyable (only works when value is string) */
  copyable?: boolean;

  /** Field name for copying (used for tracking state) */
  fieldName?: string;

  /** Layout mode */
  layout?: 'horizontal' | 'vertical' | 'auto';

  /** Auto mode threshold (character count, default 30) */
  autoThreshold?: number;

  /** Custom styles */
  sx?: SxProps<Theme>;
}

/**
 * DetailRow Component
 *
 * Unified detail information display component, supports three layout modes:
 * - horizontal: Horizontal layout (icon-label-value arranged horizontally)
 * - vertical: Vertical layout (label on top, value below)
 * - auto: Auto mode (chooses layout based on content length)
 *
 * @example
 * ```tsx
 * // Horizontal layout
 * <DetailRow
 *   icon={<UserIcon />}
 *   label="User ID"
 *   value="123456"
 *   copyable
 *   layout="horizontal"
 * />
 *
 * // Vertical layout
 * <DetailRow
 *   label="Description"
 *   value="This is a long description that needs vertical layout..."
 *   layout="vertical"
 * />
 *
 * // Auto mode
 * <DetailRow
 *   label="Email"
 *   value="user@example.com"
 *   layout="auto"
 *   autoThreshold={30}
 * />
 * ```
 */
export const DetailRow: React.FC<DetailRowProps> = ({
  icon,
  label,
  value,
  copyable = false,
  fieldName,
  layout = 'auto',
  autoThreshold = 30,
  sx,
}) => {
  const t = useTranslations('common');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Determine actual layout
  const getLayout = (): 'horizontal' | 'vertical' => {
    if (layout !== 'auto') return layout;

    // Calculate value length
    const valueLength =
      typeof value === 'string'
        ? value.length
        : value != null
          ? String(value).length
          : 0;

    return valueLength > autoThreshold ? 'vertical' : 'horizontal';
  };

  const actualLayout = getLayout();

  // Copy functionality
  const handleCopy = async () => {
    if (!copyable || typeof value !== 'string') return;

    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(fieldName || 'default');
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Copy button component
  const CopyButton = () => {
    if (!copyable || typeof value !== 'string') return null;

    const isCopied = copiedField === (fieldName || 'default');

    return (
      <Tooltip title={isCopied ? t('copied') : t('copy')}>
        <IconButton
          size="small"
          onClick={handleCopy}
          sx={{
            color: isCopied ? 'success.main' : 'text.secondary',
            '&:hover': {
              bgcolor: isCopied ? 'success.light' : 'action.hover',
            },
          }}
        >
          {isCopied ? (
            <Check fontSize="small" />
          ) : (
            <ContentCopy fontSize="small" />
          )}
        </IconButton>
      </Tooltip>
    );
  };

  // Horizontal layout
  if (actualLayout === 'horizontal') {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          py: 1,
          ...sx,
        }}
      >
        {icon && (
          <Box
            sx={{
              color: 'text.secondary',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {icon}
          </Box>
        )}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            minWidth: 100,
            flexShrink: 0,
          }}
        >
          {label}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            flex: 1,
            wordBreak: 'break-word',
            fontFamily:
              copyable && typeof value === 'string' ? 'monospace' : 'inherit',
          }}
        >
          {value}
        </Typography>
        <CopyButton />
      </Box>
    );
  }

  // Vertical layout
  return (
    <Box sx={{ py: 1, ...sx }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          mb: 0.5,
        }}
      >
        {icon && (
          <Box
            sx={{
              mr: 1,
              display: 'flex',
              alignItems: 'center',
              color: 'text.secondary',
            }}
          >
            {icon}
          </Box>
        )}
        <Typography variant="body2" color="text.secondary" fontWeight={500}>
          {label}
        </Typography>
      </Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1,
          pl: icon ? 4 : 0,
        }}
      >
        <Typography
          variant="body1"
          sx={{
            flex: 1,
            wordBreak: 'break-word',
            fontFamily:
              copyable && typeof value === 'string' ? 'monospace' : 'inherit',
          }}
        >
          {value}
        </Typography>
        <CopyButton />
      </Box>
    </Box>
  );
};

export default DetailRow;
