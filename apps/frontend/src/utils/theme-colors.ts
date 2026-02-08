/**
 * Theme-aware color utilities for dark and light modes
 * Provides high-contrast colors for better readability in dark mode
 */

import type { Theme } from '@mui/material/styles';

export interface ColorSet {
  bg: string;
  border: string;
  text: string;
}

export interface StatusColorSet {
  bgColor: string;
  textColor: string;
}

/**
 * Get session status colors based on theme mode (for Session components)
 */
export function getSessionStatusColors(mode: 'light' | 'dark') {
  if (mode === 'dark') {
    return {
      ACTIVE: {
        bg: 'rgba(76, 175, 80, 0.25)',
        border: 'rgba(76, 175, 80, 0.5)',
        text: '#81c784', // Lighter green for dark mode
      },
      REVOKED: {
        bg: 'rgba(244, 67, 54, 0.25)',
        border: 'rgba(244, 67, 54, 0.5)',
        text: '#e57373', // Lighter red for dark mode
      },
      EXPIRED: {
        bg: 'rgba(255, 152, 0, 0.25)',
        border: 'rgba(255, 152, 0, 0.5)',
        text: '#ffb74d', // Lighter orange for dark mode
      },
      SUCCESS: {
        bg: 'rgba(76, 175, 80, 0.25)',
        border: 'rgba(76, 175, 80, 0.5)',
        text: '#81c784',
      },
      FAILURE: {
        bg: 'rgba(244, 67, 54, 0.25)',
        border: 'rgba(244, 67, 54, 0.5)',
        text: '#e57373',
      },
    };
  }

  // Light mode colors
  return {
    ACTIVE: {
      bg: 'rgba(46, 125, 50, 0.08)',
      border: 'rgba(46, 125, 50, 0.3)',
      text: '#2e7d32',
    },
    REVOKED: {
      bg: 'rgba(211, 47, 47, 0.08)',
      border: 'rgba(211, 47, 47, 0.3)',
      text: '#d32f2f',
    },
    EXPIRED: {
      bg: 'rgba(237, 108, 2, 0.08)',
      border: 'rgba(237, 108, 2, 0.3)',
      text: '#ed6c02',
    },
    SUCCESS: {
      bg: 'rgba(46, 125, 50, 0.08)',
      border: 'rgba(46, 125, 50, 0.3)',
      text: '#2e7d32',
    },
    FAILURE: {
      bg: 'rgba(211, 47, 47, 0.08)',
      border: 'rgba(211, 47, 47, 0.3)',
      text: '#d32f2f',
    },
  };
}

/**
 * Get action colors based on theme mode (for audit logs)
 *
 * Unified Blue-Grey color scheme with depth-based differentiation:
 * - Uses single color family (Blue-Grey) for visual harmony
 * - Depth indicates risk/importance level (lighter = less critical)
 * - Low saturation to complement status colors (green/red)
 * - Semantic grouping by operation risk level:
 *   * QUERY (查詢): Lightest - read-only, most frequent
 *   * AUTH (認證): Light - authentication operations
 *   * UPDATE (修改): Medium - data modifications
 *   * CREATE (創建): Deep - new data creation
 *   * DELETE (刪除): Deepest - highest risk operations
 */
export function getActionColor(
  action: string,
  mode: 'light' | 'dark',
): ColorSet {
  const actionLower = action.toLowerCase();

  if (mode === 'dark') {
    // 1. QUERY operations (查詢) - Lightest Blue-Grey
    if (actionLower.startsWith('query')) {
      return {
        bg: 'rgba(144, 164, 174, 0.2)',
        border: 'rgba(144, 164, 174, 0.4)',
        text: '#b0bec5',
      };
    }

    // 2. AUTH operations (認證) - Light Blue-Grey
    if (
      actionLower.includes('login') ||
      actionLower.includes('logout') ||
      actionLower.includes('auth') ||
      actionLower.includes('refresh') ||
      actionLower.includes('token')
    ) {
      return {
        bg: 'rgba(120, 144, 156, 0.22)',
        border: 'rgba(120, 144, 156, 0.45)',
        text: '#90a4ae',
      };
    }

    // 3. UPDATE operations (修改) - Medium Blue-Grey
    if (
      actionLower.includes('update') ||
      actionLower.includes('modify') ||
      actionLower.includes('edit') ||
      actionLower.includes('change')
    ) {
      return {
        bg: 'rgba(96, 125, 139, 0.25)',
        border: 'rgba(96, 125, 139, 0.5)',
        text: '#78909c',
      };
    }

    // 4. CREATE operations (創建) - Deep Blue-Grey
    if (
      actionLower.includes('create') ||
      actionLower.includes('register') ||
      actionLower.includes('add')
    ) {
      return {
        bg: 'rgba(84, 110, 122, 0.28)',
        border: 'rgba(84, 110, 122, 0.55)',
        text: '#607d8b',
      };
    }

    // 5. DELETE operations (刪除) - Deepest Blue-Grey
    if (
      actionLower.includes('delete') ||
      actionLower.includes('remove') ||
      actionLower.includes('destroy')
    ) {
      return {
        bg: 'rgba(69, 90, 100, 0.32)',
        border: 'rgba(69, 90, 100, 0.6)',
        text: '#546e7a',
      };
    }

    // 6. REVOKE/EXPIRE operations (撤銷) - Medium-Deep Blue-Grey
    if (
      actionLower.includes('revoke') ||
      actionLower.includes('expire') ||
      actionLower.includes('cancel') ||
      actionLower.includes('disable')
    ) {
      return {
        bg: 'rgba(84, 110, 122, 0.28)',
        border: 'rgba(84, 110, 122, 0.55)',
        text: '#607d8b',
      };
    }

    // Default - Neutral Grey
    return {
      bg: 'rgba(158, 158, 158, 0.15)',
      border: 'rgba(158, 158, 158, 0.3)',
      text: '#9e9e9e',
    };
  }

  // Light mode - Blue-Grey monochrome system
  // 1. QUERY operations (查詢) - Lightest
  if (actionLower.startsWith('query')) {
    return {
      bg: 'rgba(96, 125, 139, 0.12)',
      border: 'rgba(96, 125, 139, 0.4)',
      text: '#455a64',
    };
  }

  // 2. AUTH operations (認證) - Light
  if (
    actionLower.includes('login') ||
    actionLower.includes('logout') ||
    actionLower.includes('auth') ||
    actionLower.includes('refresh') ||
    actionLower.includes('token')
  ) {
    return {
      bg: 'rgba(69, 90, 100, 0.15)',
      border: 'rgba(69, 90, 100, 0.5)',
      text: '#37474f',
    };
  }

  // 3. UPDATE operations (修改) - Medium
  if (
    actionLower.includes('update') ||
    actionLower.includes('modify') ||
    actionLower.includes('edit') ||
    actionLower.includes('change')
  ) {
    return {
      bg: 'rgba(55, 71, 79, 0.18)',
      border: 'rgba(55, 71, 79, 0.6)',
      text: '#263238',
    };
  }

  // 4. CREATE operations (創建) - Deep
  if (
    actionLower.includes('create') ||
    actionLower.includes('register') ||
    actionLower.includes('add')
  ) {
    return {
      bg: 'rgba(38, 50, 56, 0.2)',
      border: 'rgba(38, 50, 56, 0.65)',
      text: '#1b2329',
    };
  }

  // 5. DELETE operations (刪除) - Deepest
  if (
    actionLower.includes('delete') ||
    actionLower.includes('remove') ||
    actionLower.includes('destroy')
  ) {
    return {
      bg: 'rgba(38, 50, 56, 0.25)',
      border: 'rgba(38, 50, 56, 0.75)',
      text: '#0d1117',
    };
  }

  // 6. REVOKE/EXPIRE operations (撤銷) - Medium-Deep
  if (
    actionLower.includes('revoke') ||
    actionLower.includes('expire') ||
    actionLower.includes('cancel') ||
    actionLower.includes('disable')
  ) {
    return {
      bg: 'rgba(38, 50, 56, 0.2)',
      border: 'rgba(38, 50, 56, 0.65)',
      text: '#1b2329',
    };
  }

  // Default - Neutral Grey
  return {
    bg: 'rgba(0, 0, 0, 0.04)',
    border: 'rgba(0, 0, 0, 0.15)',
    text: 'rgba(0, 0, 0, 0.54)',
  };
}

/**
 * Get entity colors based on theme mode (for audit logs)
 *
 * Unified Blue-Grey color scheme matching action colors:
 * - Uses same color family as actions for visual consistency
 * - Slightly lighter opacity to differentiate from action column
 * - Semantic grouping by entity importance/sensitivity:
 *   * User/me (用戶): Base level - user data
 *   * Session (會話): Security level - session management
 *   * Auth (認證): Security level - authentication
 *   * Role/Permission (權限): Control level - access control
 *   * System (系統): Infrastructure level - system operations
 */
/**
 * Get status colors for MUI components (accepts Theme object)
 * Used for consistent status indication across the app
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

  // Light mode
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

export function getEntityColor(
  entity: string,
  mode: 'light' | 'dark',
): ColorSet {
  const entityLower = entity.toLowerCase();

  if (mode === 'dark') {
    // 1. User/me (用戶) - Base Blue-Grey
    if (entityLower.includes('user') || entityLower === 'me') {
      return {
        bg: 'rgba(144, 164, 174, 0.18)',
        border: 'rgba(144, 164, 174, 0.38)',
        text: '#b0bec5',
      };
    }

    // 2. Session (會話) - Security Blue-Grey
    if (entityLower.includes('session')) {
      return {
        bg: 'rgba(120, 144, 156, 0.2)',
        border: 'rgba(120, 144, 156, 0.42)',
        text: '#90a4ae',
      };
    }

    // 3. Auth (認證) - Security Blue-Grey
    if (
      entityLower.includes('login') ||
      entityLower.includes('logout') ||
      entityLower.includes('auth') ||
      entityLower.includes('token') ||
      entityLower.includes('password') ||
      entityLower.includes('twofactor') ||
      entityLower.includes('2fa')
    ) {
      return {
        bg: 'rgba(120, 144, 156, 0.2)',
        border: 'rgba(120, 144, 156, 0.42)',
        text: '#90a4ae',
      };
    }

    // 4. Role/Permission (權限) - Control Blue-Grey
    if (entityLower.includes('role') || entityLower.includes('permission')) {
      return {
        bg: 'rgba(96, 125, 139, 0.23)',
        border: 'rgba(96, 125, 139, 0.48)',
        text: '#78909c',
      };
    }

    // 5. System (系統) - Infrastructure Blue-Grey
    if (
      entityLower.includes('system') ||
      entityLower.includes('config') ||
      entityLower.includes('setting')
    ) {
      return {
        bg: 'rgba(84, 110, 122, 0.26)',
        border: 'rgba(84, 110, 122, 0.52)',
        text: '#607d8b',
      };
    }

    // Default - Neutral Grey
    return {
      bg: 'rgba(158, 158, 158, 0.13)',
      border: 'rgba(158, 158, 158, 0.28)',
      text: '#9e9e9e',
    };
  }

  // Light mode - Blue-Grey monochrome system with lighter opacity
  // 1. User/me (用戶) - Base
  if (entityLower.includes('user') || entityLower === 'me') {
    return {
      bg: 'rgba(96, 125, 139, 0.1)',
      border: 'rgba(96, 125, 139, 0.35)',
      text: '#455a64',
    };
  }

  // 2. Session (會話) - Security
  if (entityLower.includes('session')) {
    return {
      bg: 'rgba(69, 90, 100, 0.13)',
      border: 'rgba(69, 90, 100, 0.45)',
      text: '#37474f',
    };
  }

  // 3. Auth (認證) - Security
  if (
    entityLower.includes('login') ||
    entityLower.includes('logout') ||
    entityLower.includes('auth') ||
    entityLower.includes('token') ||
    entityLower.includes('password') ||
    entityLower.includes('twofactor') ||
    entityLower.includes('2fa')
  ) {
    return {
      bg: 'rgba(69, 90, 100, 0.13)',
      border: 'rgba(69, 90, 100, 0.45)',
      text: '#37474f',
    };
  }

  // 4. Role/Permission (權限) - Control
  if (entityLower.includes('role') || entityLower.includes('permission')) {
    return {
      bg: 'rgba(55, 71, 79, 0.16)',
      border: 'rgba(55, 71, 79, 0.55)',
      text: '#263238',
    };
  }

  // 5. System (系統) - Infrastructure
  if (
    entityLower.includes('system') ||
    entityLower.includes('config') ||
    entityLower.includes('setting')
  ) {
    return {
      bg: 'rgba(38, 50, 56, 0.18)',
      border: 'rgba(38, 50, 56, 0.6)',
      text: '#1b2329',
    };
  }

  // Default - Neutral Grey
  return {
    bg: 'rgba(0, 0, 0, 0.03)',
    border: 'rgba(0, 0, 0, 0.12)',
    text: 'rgba(0, 0, 0, 0.54)',
  };
}
