/**
 * Theme-aware color utilities for shared UI states.
 */

import type { Theme } from '@mui/material/styles';

export interface StatusColorSet {
  bgColor: string;
  textColor: string;
}

/**
 * Get status colors for MUI components.
 */
export function getStatusColors(theme: Theme): {
  success: StatusColorSet;
  error: StatusColorSet;
  warning: StatusColorSet;
  info: StatusColorSet;
  default: StatusColorSet;
} {
  const mode = theme.palette.mode;

  if (mode === 'dark') {
    return {
      success: {
        bgColor: 'rgba(76, 175, 80, 0.25)',
        textColor: '#81c784',
      },
      error: {
        bgColor: 'rgba(244, 67, 54, 0.25)',
        textColor: '#e57373',
      },
      warning: {
        bgColor: 'rgba(255, 152, 0, 0.25)',
        textColor: '#ffb74d',
      },
      info: {
        bgColor: 'rgba(33, 150, 243, 0.25)',
        textColor: '#64b5f6',
      },
      default: {
        bgColor: 'rgba(158, 158, 158, 0.15)',
        textColor: '#9e9e9e',
      },
    };
  }

  return {
    success: {
      bgColor: 'rgba(46, 125, 50, 0.08)',
      textColor: '#2e7d32',
    },
    error: {
      bgColor: 'rgba(211, 47, 47, 0.08)',
      textColor: '#d32f2f',
    },
    warning: {
      bgColor: 'rgba(237, 108, 2, 0.08)',
      textColor: '#ed6c02',
    },
    info: {
      bgColor: 'rgba(2, 136, 209, 0.08)',
      textColor: '#0288d1',
    },
    default: {
      bgColor: 'rgba(0, 0, 0, 0.04)',
      textColor: 'rgba(0, 0, 0, 0.54)',
    },
  };
}
