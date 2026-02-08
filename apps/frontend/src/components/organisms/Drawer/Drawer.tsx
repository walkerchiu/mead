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
   * - persistent: Push content, toggleable (desktop version)
   * - permanent: Permanent display (desktop version)
   */
  variant?: DrawerVariant;
  /**
   * Anchor position
   */
  anchor?: 'left' | 'right';
  /**
   * Width when fully expanded (px)
   */
  width?: number;
  /**
   * Width when semi-expanded (mini state) (px)
   */
  miniWidth?: number;
  /**
   * Drawer Content
   */
  children?: ReactNode;
  /**
   * State change callback
   */
  onStateChange?: (newState: DrawerState) => void;
  /**
   * Whether to show toggle button
   */
  showToggleButton?: boolean;
  /**
   * Custom toggle button content (if not provided, use default arrow icon)
   */
  toggleButtonContent?: ReactNode;
  /**
   * Toggle button style
   */
  toggleButtonSx?: SxProps<Theme>;
  /**
   * Header content (displayed at the top)
   */
  header?: ReactNode;
  /**
   * Footer content (displayed at the bottom)
   */
  footer?: ReactNode;
  /**
   * Custom styles
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
 * Drawer Component - Atomic Design: Organism
 *
 * A flexible drawer component that supports three display states and three behavior modes.
 * Perfect for navigation sidebars, settings panels, and collapsible content areas.
 *
 * ## Variants
 *
 * - **temporary**: Overlays content like a modal, suitable for mobile devices. Dismissed by clicking outside.
 * - **persistent**: Pushes main content aside when open, toggleable via button. Suitable for desktop applications.
 * - **permanent**: Always visible, cannot be closed. Can toggle between open and mini states.
 *
 * ## States
 *
 * - **closed**: Completely hidden (temporary and persistent only)
 * - **mini**: Collapsed view showing only icons (56-80px wide)
 * - **open**: Fully expanded showing complete content (240-320px wide)
 *
 * @example
 * ```tsx
 * // Basic persistent drawer
 * <Drawer
 *   state="open"
 *   variant="persistent"
 *   onStateChange={(newState) => setState(newState)}
 * >
 *   <List>
 *     <ListItem>Home</ListItem>
 *     <ListItem>Settings</ListItem>
 *   </List>
 * </Drawer>
 * ```
 *
 * @example
 * ```tsx
 * // Temporary drawer for mobile
 * <Drawer
 *   state={isOpen ? 'open' : 'closed'}
 *   variant="temporary"
 *   onStateChange={(newState) => setIsOpen(newState === 'open')}
 * >
 *   <NavigationMenu />
 * </Drawer>
 * ```
 *
 * @example
 * ```tsx
 * // Permanent drawer with mini state
 * <Drawer
 *   state={isMini ? 'mini' : 'open'}
 *   variant="permanent"
 *   width={280}
 *   miniWidth={72}
 *   onStateChange={(newState) => setIsMini(newState === 'mini')}
 *   header={<Typography variant="h6">My App</Typography>}
 *   footer={<Typography variant="caption">v1.0.0</Typography>}
 * >
 *   <NavigationMenu />
 * </Drawer>
 * ```
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
      // Temporary mode: open <-> closed
      onStateChange(isOpen ? 'closed' : 'open');
    } else {
      // Persistent/permanent mode: open <-> mini
      onStateChange(isMini ? 'open' : 'mini');
    }
  };

  const handleClose = () => {
    if (onStateChange && variant === 'temporary') {
      onStateChange('closed');
    }
  };

  // Temporary mode uses standard MuiDrawer
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

  // Persistent/permanent modes use StyledDrawer
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
