'use client';

import { ReactNode, useState } from 'react';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Divider,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Drawer, DrawerState, DrawerVariant } from '@/components/atoms/Drawer';

export interface SidebarMenuItem {
  /**
   * 選單項目 ID
   */
  id: string;
  /**
   * 顯示標籤
   */
  label: string;
  /**
   * 圖示
   */
  icon?: ReactNode;
  /**
   * 路徑（用於路由）
   */
  path?: string;
  /**
   * 點擊回調
   */
  onClick?: () => void;
  /**
   * 是否為分隔線
   */
  divider?: boolean;
  /**
   * 是否禁用
   */
  disabled?: boolean;
}

export interface SidebarProps {
  /**
   * 選單項目列表
   */
  items: SidebarMenuItem[];
  /**
   * 當前活動項目 ID
   */
  activeItemId?: string;
  /**
   * Drawer 顯示狀態
   */
  state?: DrawerState;
  /**
   * Drawer 類型
   */
  variant?: DrawerVariant;
  /**
   * 錨點位置
   */
  anchor?: 'left' | 'right';
  /**
   * 完全展開時的寬度
   */
  width?: number;
  /**
   * Mini 模式寬度
   */
  miniWidth?: number;
  /**
   * 狀態變更回調
   */
  onStateChange?: (newState: DrawerState) => void;
  /**
   * Header 內容（logo + 標題）
   */
  header?: ReactNode;
  /**
   * Footer 內容（用戶資訊等）
   */
  footer?: ReactNode;
  /**
   * 是否啟用響應式設計
   * - 手機版自動使用 temporary
   * - 桌面版使用指定的 variant
   */
  responsive?: boolean;
  /**
   * 手機版斷點（預設：md）
   */
  mobileBreakpoint?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Sidebar 元件 - 應用程式側邊欄，基於 Drawer 構建
 *
 * 特性：
 * - 支援完全展開和半展開（mini）模式
 * - Mini 模式下只顯示圖示，hover 顯示 tooltip
 * - 響應式設計：手機版自動切換為 temporary 模式
 * - 支援自訂 header 和 footer
 * - 活動項目自動高亮
 */
export function Sidebar({
  items,
  activeItemId,
  state: controlledState,
  variant: controlledVariant = 'persistent',
  anchor = 'left',
  width = 240,
  miniWidth = 64,
  onStateChange,
  header,
  footer,
  responsive = true,
  mobileBreakpoint = 'md',
}: SidebarProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down(mobileBreakpoint));
  const [internalState, setInternalState] = useState<DrawerState>('open');

  // 響應式：手機版強制使用 temporary
  const variant: DrawerVariant =
    responsive && isMobile ? 'temporary' : controlledVariant;
  const state = controlledState !== undefined ? controlledState : internalState;

  const handleStateChange = (newState: DrawerState) => {
    if (onStateChange) {
      onStateChange(newState);
    } else {
      setInternalState(newState);
    }
  };

  const isMini = state === 'mini';

  const renderMenuItem = (item: SidebarMenuItem) => {
    if (item.divider) {
      return <Divider key={item.id} sx={{ my: 1 }} />;
    }

    const isActive = activeItemId === item.id;

    const listItemButton = (
      <ListItemButton
        selected={isActive}
        disabled={item.disabled}
        onClick={item.onClick}
        sx={{
          minHeight: 48,
          justifyContent: isMini ? 'center' : 'initial',
          px: 2.5,
          '&.Mui-selected': {
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            '&:hover': {
              backgroundColor: theme.palette.primary.dark,
            },
            '& .MuiListItemIcon-root': {
              color: theme.palette.primary.contrastText,
            },
          },
        }}
      >
        {item.icon && (
          <ListItemIcon
            sx={{
              minWidth: 0,
              mr: isMini ? 0 : 3,
              justifyContent: 'center',
            }}
          >
            {item.icon}
          </ListItemIcon>
        )}
        {!isMini && <ListItemText primary={item.label} />}
      </ListItemButton>
    );

    // Mini 模式下，使用 Tooltip 顯示標籤
    if (isMini) {
      return (
        <Tooltip
          key={item.id}
          title={item.label}
          placement={anchor === 'left' ? 'right' : 'left'}
          arrow
        >
          <ListItem disablePadding sx={{ display: 'block' }}>
            {listItemButton}
          </ListItem>
        </Tooltip>
      );
    }

    return (
      <ListItem key={item.id} disablePadding sx={{ display: 'block' }}>
        {listItemButton}
      </ListItem>
    );
  };

  return (
    <Drawer
      state={state}
      variant={variant}
      anchor={anchor}
      width={width}
      miniWidth={miniWidth}
      onStateChange={handleStateChange}
      header={header}
      footer={footer}
    >
      <List>{items.map(renderMenuItem)}</List>
    </Drawer>
  );
}
