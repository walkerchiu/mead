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
   * 顯示狀態
   */
  state?: DrawerState;
  /**
   * Drawer 類型
   * - temporary: 覆蓋在內容上方，可關閉（手機版）
   * - persistent: 推開內容，可切換（桌面版）
   * - permanent: 永久顯示（桌面版）
   */
  variant?: DrawerVariant;
  /**
   * 錨點位置
   */
  anchor?: 'left' | 'right';
  /**
   * 完全展開時的寬度（px）
   */
  width?: number;
  /**
   * 半展開（mini）時的寬度（px）
   */
  miniWidth?: number;
  /**
   * Drawer 內容
   */
  children?: ReactNode;
  /**
   * 狀態變更回調
   */
  onStateChange?: (newState: DrawerState) => void;
  /**
   * 是否顯示切換按鈕
   */
  showToggleButton?: boolean;
  /**
   * Header 內容（顯示在最上方）
   */
  header?: ReactNode;
  /**
   * Footer 內容（顯示在最下方）
   */
  footer?: ReactNode;
  /**
   * 自訂樣式
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
 * Drawer 元件 - 支援三種狀態（關閉、半展開、完全展開）和三種模式（temporary, persistent, permanent）
 *
 * 使用場景：
 * - temporary: 手機版側邊欄，覆蓋在內容上
 * - persistent: 桌面版側邊欄，可切換並推開主要內容
 * - permanent: 始終顯示的側邊欄
 *
 * 狀態：
 * - closed: 完全關閉（僅 temporary 和 persistent）
 * - mini: 半展開，只顯示圖示
 * - open: 完全展開，顯示完整內容
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
  header,
  footer,
  sx,
}: DrawerComponentProps) {
  const isOpen = state === 'open' || state === 'mini';
  const isMini = state === 'mini';

  const handleToggle = () => {
    if (!onStateChange) return;

    if (variant === 'temporary') {
      // temporary 模式：open <-> closed
      onStateChange(isOpen ? 'closed' : 'open');
    } else {
      // persistent/permanent 模式：open <-> mini
      onStateChange(isMini ? 'open' : 'mini');
    }
  };

  const handleClose = () => {
    if (onStateChange && variant === 'temporary') {
      onStateChange('closed');
    }
  };

  // temporary 使用標準 MuiDrawer
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
                <IconButton onClick={handleClose} size="small">
                  {anchor === 'left' ? (
                    <ChevronLeftIcon />
                  ) : (
                    <ChevronRightIcon />
                  )}
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

  // persistent/permanent 使用 StyledDrawer
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
              <IconButton onClick={handleToggle} size="small">
                {isMini ? (
                  anchor === 'left' ? (
                    <ChevronRightIcon />
                  ) : (
                    <ChevronLeftIcon />
                  )
                ) : anchor === 'left' ? (
                  <ChevronLeftIcon />
                ) : (
                  <ChevronRightIcon />
                )}
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
              display: 'flex',
              justifyContent: isMini ? 'center' : 'flex-start',
            }}
          >
            {footer}
          </Box>
        )}
      </Box>
    </StyledDrawer>
  );
}
