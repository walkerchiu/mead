'use client';

import { ReactNode } from 'react';
import { Drawer as MuiDrawer, Box, IconButton, styled } from '@mui/material';
import { SxProps, Theme } from '@mui/material/styles';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';

export type DrawerVariant = 'temporary' | 'persistent' | 'permanent';
export type DrawerState = 'closed' | 'mini' | 'open';

export interface DrawerComponentProps {
  /**
   * Display state
   */
  state?: DrawerState;
  /**
   * Drawer type
   * - temporary: Overlay on content, closable (mobile version)
   * - persistent: Push content，Toggle（Desktop version）
   * - permanent: Permanent display（Desktop version）
   */
  variant?: DrawerVariant;
  /**
   * Anchor position
   */
  anchor?: 'left' | 'right';
  /**
   * width when fully expanded (px)
   */
  width?: number;
  /**
   * width when half expanded (mini) (px)
   */
  miniWidth?: number;
  /**
   * Drawer Content
   */
  children?: ReactNode;
  /**
   * state change callback
   */
  onStateChange?: (newState: DrawerState) => void;
  /**
   * whether to show toggle button
   */
  showToggleButton?: boolean;
  /**
   * custom toggle button content (if not provided, use default arrow icon)
   */
  toggleButtonContent?: ReactNode;
  /**
   * toggle button style
   */
  toggleButtonSx?: SxProps<Theme>;
  /**
   * header content (displayed at the top)
   */
  header?: ReactNode;
  /**
   * Footer Content（show at bottom）
   */
  footer?: ReactNode;
  /**
   * custom style
   */
  sx?: SxProps<Theme>;
}

// Styled Drawer with dynamic width
const StyledDrawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) =>
    prop !== 'drawerWidth' && prop !== 'miniDrawerWidth' && prop !== 'state',
})<{
  open: boolean;
  drawerWidth: number;
  miniDrawerWidth: number;
  variant: DrawerVariant;
  state: DrawerState;
}>(({ theme, open: _open, drawerWidth, miniDrawerWidth, variant, state }) => {
  const isMini = state === 'mini';
  const currentWidth = isMini ? miniDrawerWidth : drawerWidth;

  return {
    width: currentWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(variant === 'permanent' && {
      '& .MuiDrawer-paper': {
        position: 'relative',
        width: currentWidth,
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
        overflowX: 'hidden',
      },
    }),
    ...(variant === 'persistent' && {
      '& .MuiDrawer-paper': {
        width: currentWidth,
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
        overflowX: 'hidden',
      },
    }),
  };
});

/**
 * Drawer component - supportsthree states（close、halfexpanded、fully expanded）And three modes（temporary, persistent, permanent）
 *
 * use cases:
 * - temporary: mobile version sidebar, overlays content
 * - persistent: Desktop versionsidebar，Toggleand push mainContent
 * - permanent: Always visible sidebar
 *
 * state：
 * - closed: completely closed (only temporary and persistent)
 * - mini: halfexpanded，only showicon
 * - open: fully expanded，show fullContent
 */
export function Drawer({
  state = 'open',
  variant = 'persistent',
  anchor = 'left',
  width = 240,
  miniWidth = 64,
  children,
  onStateChange,
  showToggleButton = true,
  toggleButtonContent,
  toggleButtonSx,
  header,
  footer,
  sx,
}: DrawerComponentProps) {
  const isOpen = state === 'open' || state === 'mini';
  const isMini = state === 'mini';

  const handleToggle = () => {
    if (!onStateChange) return;

    if (variant === 'temporary') {
      // temporary mode：open <-> closed
      onStateChange(isOpen ? 'closed' : 'open');
    } else {
      // persistent/permanent mode：open <-> mini
      onStateChange(isMini ? 'open' : 'mini');
    }
  };

  const handleClose = () => {
    if (onStateChange && variant === 'temporary') {
      onStateChange('closed');
    }
  };

  // temporary use standard MuiDrawer
  if (variant === 'temporary') {
    return (
      <MuiDrawer
        anchor={anchor}
        open={isOpen}
        onClose={handleClose}
        sx={{
          '& .MuiDrawer-paper': {
            width: width,
          },
          ...sx,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          }}
        >
          {/* Header */}
          {header && (
            <Box
              sx={{
                p: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              {header}
              {showToggleButton && (
                <IconButton
                  onClick={handleClose}
                  size="small"
                  sx={toggleButtonSx}
                >
                  {toggleButtonContent ||
                    (anchor === 'left' ? (
                      <ChevronLeftIcon />
                    ) : (
                      <ChevronRightIcon />
                    ))}
                </IconButton>
              )}
            </Box>
          )}

          {/* Content */}
          <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>{children}</Box>

          {/* Footer */}
          {footer && <Box sx={{ p: 2 }}>{footer}</Box>}
        </Box>
      </MuiDrawer>
    );
  }

  // persistent/permanent use StyledDrawer
  return (
    <StyledDrawer
      variant={variant}
      anchor={anchor}
      open={isOpen}
      drawerWidth={width}
      miniDrawerWidth={miniWidth}
      state={state}
      sx={sx}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
      >
        {/* Header */}
        {header && (
          <Box
            sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: isMini ? 'center' : 'space-between',
              minHeight: 64,
            }}
          >
            {!isMini && header}
            {showToggleButton && (
              <IconButton
                onClick={handleToggle}
                size="small"
                sx={toggleButtonSx}
              >
                {toggleButtonContent ||
                  (isMini ? (
                    anchor === 'left' ? (
                      <ChevronRightIcon />
                    ) : (
                      <ChevronLeftIcon />
                    )
                  ) : anchor === 'left' ? (
                    <ChevronLeftIcon />
                  ) : (
                    <ChevronRightIcon />
                  ))}
              </IconButton>
            )}
          </Box>
        )}

        {/* Content */}
        <Box sx={{ flexGrow: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          {children}
        </Box>

        {/* Footer */}
        {footer && (
          <Box
            sx={{
              p: 2,
            }}
          >
            {footer}
          </Box>
        )}
      </Box>
    </StyledDrawer>
  );
}
