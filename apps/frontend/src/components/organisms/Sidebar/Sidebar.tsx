'use client';

import React, { ReactNode, useState, useRef, useEffect } from 'react';
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
  Box,
  Collapse,
  Popper,
  Paper,
  MenuList,
  MenuItem,
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { Drawer, DrawerState, DrawerVariant } from '@/components/organisms';

export interface SidebarMenuItem {
  /**
   * Menu item ID
   */
  id: string;
  /**
   * Display label
   */
  label: string;
  /**
   * icon
   */
  icon?: ReactNode;
  /**
   * Path (for routing)
   */
  path?: string;
  /**
   * Click callback
   */
  onClick?: () => void;
  /**
   * Whether it is a divider
   */
  divider?: boolean;
  /**
   * Whether disabled
   */
  disabled?: boolean;
  /**
   * Whether expandable（Show right arrow）
   */
  expandable?: boolean;
  /**
   * Submenu items
   */
  children?: SidebarMenuItem[];
  /**
   * Whether default expanded（Only valid for items with submenus）
   */
  defaultExpanded?: boolean;
}

export interface SidebarProps {
  /**
   * Menu items list
   */
  items: SidebarMenuItem[];
  /**
   * current activeItem ID
   */
  activeItemId?: string;
  /**
   * Drawer Display state
   */
  state?: DrawerState;
  /**
   * Drawer type
   */
  variant?: DrawerVariant;
  /**
   * Anchor position
   */
  anchor?: 'left' | 'right';
  /**
   * width when fully expanded
   */
  width?: number;
  /**
   * mini modewidth
   */
  miniWidth?: number;
  /**
   * state change callback
   */
  onStateChange?: (newState: DrawerState) => void;
  /**
   * Header Content（logo + Title）
   */
  header?: ReactNode;
  /**
   * Footer content (user information, etc.)
   */
  footer?: ReactNode;
  /**
   * whetheractiveResponsive design
   * - mobile version automatically uses temporary
   * - desktop version uses specified variant
   */
  responsive?: boolean;
  /**
   * mobile versionbreakpoint（default：md）
   */
  mobileBreakpoint?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /**
   * background color
   */
  bgcolor?: string;
  /**
   * text color
   */
  color?: string;
  /**
   * active item background color
   */
  activeBackgroundColor?: string;
  /**
   * hover item background color
   */
  hoverBackgroundColor?: string;
  /**
   * custom toggle button content
   */
  toggleButtonContent?: ReactNode;
  /**
   * toggle button style
   */
  toggleButtonSx?: import('@mui/material').SxProps<
    import('@mui/material').Theme
  >;
  /**
   * whether to show toggle button
   */
  showToggleButton?: boolean;
  /**
   * expandable menu items in mini mode are
   * - 'hide': Completely hide submenu（default）
   * - 'popover': Hover Whendisplay Popover floating menu（best practices）
   * - 'expand': temporarily expand sidebar on click
   */
  miniExpandBehavior?: 'hide' | 'popover' | 'expand';
}

/**
 * Sidebar component - application sidebar，based on Drawer Build
 *
 * Features：
 * - supports full expansion and half expansion（mini）mode
 * - Mini Only show in modeicon，hover display tooltip
 * - supportscanexpandedChildmenu，in mini in modeprovidesthree behaviors：
 *   1. 'hide': Completely hide submenu
 *   2. 'popover': Hover Show floating menu when（best practices）
 *   3. 'expand': temporarily expand sidebar on click
 * - Responsive design：mobile versionautotoggle temporary mode
 * - supportscustom header and footer
 * - activeItemautoHighhighlight
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
  bgcolor,
  color,
  activeBackgroundColor,
  hoverBackgroundColor,
  toggleButtonContent,
  toggleButtonSx,
  showToggleButton = true,
  miniExpandBehavior = 'hide',
}: SidebarProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down(mobileBreakpoint));
  const [internalState, setInternalState] = useState<DrawerState>('open');

  // For 'popover' behavior: track menu anchor element
  const [popoverAnchorEl, setPopoverAnchorEl] = useState<{
    element: HTMLElement;
    itemId: string;
  } | null>(null);

  // For 'expand' behavior: track temporary expansion state
  const [tempExpandedState, setTempExpandedState] =
    useState<DrawerState | null>(null);

  // For 'popover' behavior: track timeout to prevent flickering
  const popoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Track expanded items
  const [expandedItems, setExpandedItems] = useState<Set<string>>(() => {
    const initialExpanded = new Set<string>();
    const collectDefaultExpanded = (menuItems: SidebarMenuItem[]) => {
      menuItems.forEach((item) => {
        if (item.children && item.defaultExpanded) {
          initialExpanded.add(item.id);
        }
        if (item.children) {
          collectDefaultExpanded(item.children);
        }
      });
    };
    collectDefaultExpanded(items);
    return initialExpanded;
  });

  // responsive：Mobile version forced to use temporary
  const variant: DrawerVariant =
    responsive && isMobile ? 'temporary' : controlledVariant;

  // Use temporary expanded state if in 'expand' mode, otherwise use normal state
  const baseState =
    controlledState !== undefined ? controlledState : internalState;
  const state = tempExpandedState !== null ? tempExpandedState : baseState;

  const handleStateChange = (newState: DrawerState) => {
    // Clear temporary expansion
    setTempExpandedState(null);

    if (onStateChange) {
      onStateChange(newState);
    } else {
      setInternalState(newState);
    }
  };

  const handleToggleExpand = (itemId: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const isMini = state === 'mini';

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (popoverTimeoutRef.current) {
        clearTimeout(popoverTimeoutRef.current);
        popoverTimeoutRef.current = null;
      }
    };
  }, []);

  // Reset popover when exiting mini mode or changing behavior
  useEffect(() => {
    if (!isMini || miniExpandBehavior !== 'popover') {
      if (popoverTimeoutRef.current) {
        clearTimeout(popoverTimeoutRef.current);
        popoverTimeoutRef.current = null;
      }
      setPopoverAnchorEl(null);
    }
  }, [isMini, miniExpandBehavior]);

  const renderMenuItem = (item: SidebarMenuItem, level: number = 0) => {
    if (item.divider) {
      return (
        <Divider
          key={item.id}
          sx={{ my: 1, borderColor: 'rgba(255,255,255,0.2)' }}
        />
      );
    }

    const isActive = activeItemId === item.id;
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);

    const handleClick = () => {
      // In mini mode with 'expand' behavior, temporarily expand the sidebar
      if (isMini && hasChildren && miniExpandBehavior === 'expand') {
        setTempExpandedState('open');
        handleToggleExpand(item.id);
        return;
      }

      // If temporarily expanded and clicking a leaf item, collapse back to mini
      if (
        tempExpandedState === 'open' &&
        !hasChildren &&
        miniExpandBehavior === 'expand'
      ) {
        setTempExpandedState(null);
      }

      if (hasChildren) {
        handleToggleExpand(item.id);
      }
      if (item.onClick) {
        item.onClick();
      }
    };

    const handleMouseEnter = (event: React.MouseEvent<HTMLElement>) => {
      // In mini mode with 'popover' behavior, show popover menu
      if (isMini && hasChildren && miniExpandBehavior === 'popover') {
        // Clear any pending close timeout immediately
        if (popoverTimeoutRef.current) {
          clearTimeout(popoverTimeoutRef.current);
          popoverTimeoutRef.current = null;
        }

        // Set the popover anchor
        setPopoverAnchorEl({
          element: event.currentTarget,
          itemId: item.id,
        });
      }
    };

    const handleMouseLeave = () => {
      // Close popover when mouse leaves (with industry-standard delay)
      if (miniExpandBehavior === 'popover' && hasChildren && isMini) {
        // Clear any existing timeout
        if (popoverTimeoutRef.current) {
          clearTimeout(popoverTimeoutRef.current);
        }

        // Industry standard: 600ms delay for submenu stability
        popoverTimeoutRef.current = setTimeout(() => {
          setPopoverAnchorEl((prev) => {
            // Only close if we're still showing this item's popover
            if (prev?.itemId === item.id) {
              return null;
            }
            return prev;
          });
          popoverTimeoutRef.current = null;
        }, 600);
      }
    };

    const handlePopoverMouseEnter = () => {
      // Cancel close when entering popover
      if (popoverTimeoutRef.current) {
        clearTimeout(popoverTimeoutRef.current);
        popoverTimeoutRef.current = null;
      }
    };

    const handlePopoverMouseLeave = () => {
      // Close popover when leaving it
      if (popoverTimeoutRef.current) {
        clearTimeout(popoverTimeoutRef.current);
      }
      popoverTimeoutRef.current = setTimeout(() => {
        setPopoverAnchorEl((prev) => {
          if (prev?.itemId === item.id) {
            return null;
          }
          return prev;
        });
        popoverTimeoutRef.current = null;
      }, 600);
    };

    const listItemButton = (
      <ListItemButton
        selected={isActive}
        disabled={item.disabled}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        sx={{
          minHeight: 48,
          justifyContent: isMini ? 'center' : 'initial',
          px: 2.5,
          pl: isMini ? 2.5 : 2.5 + level * 2,
          color: color || 'inherit',
          '&:hover': {
            backgroundColor: hoverBackgroundColor || 'rgba(0, 0, 0, 0.08)',
          },
          '&.Mui-selected': {
            backgroundColor:
              activeBackgroundColor || theme.palette.primary.main,
            color: color || theme.palette.primary.contrastText,
            '&:hover': {
              backgroundColor: activeBackgroundColor
                ? `${activeBackgroundColor}dd`
                : theme.palette.primary.dark,
            },
            '& .MuiListItemIcon-root': {
              color: color || theme.palette.primary.contrastText,
            },
          },
          '& .MuiListItemIcon-root': {
            color: color || 'inherit',
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
        {!isMini && (
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <ListItemText primary={item.label} />
            {(item.expandable || hasChildren) && (
              <ExpandMoreIcon
                sx={{
                  fontSize: '1.2rem',
                  opacity: 0.7,
                  ml: 'auto',
                  transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                  transition: 'transform 0.3s',
                }}
              />
            )}
          </Box>
        )}
      </ListItemButton>
    );

    // Show popover for this item?
    const showPopover =
      popoverAnchorEl?.itemId === item.id &&
      hasChildren &&
      miniExpandBehavior === 'popover';

    // Show tooltip always (in mini or expanded mode), except for items that
    // use popover behavior in mini mode (popover替代了 tooltip)
    const shouldShowTooltip = !(
      isMini &&
      hasChildren &&
      miniExpandBehavior === 'popover'
    );

    const menuItem = (
      <React.Fragment key={item.id}>
        {shouldShowTooltip ? (
          <Tooltip
            title={item.label}
            placement={anchor === 'left' ? 'right' : 'left'}
            arrow
          >
            <ListItem disablePadding sx={{ display: 'block' }}>
              {listItemButton}
            </ListItem>
          </Tooltip>
        ) : (
          <ListItem disablePadding sx={{ display: 'block' }}>
            {listItemButton}
          </ListItem>
        )}

        {/* Render children in Collapse (for non-mini or 'hide'/'expand' behaviors) */}
        {hasChildren && !isMini && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children!.map((child) => renderMenuItem(child, level + 1))}
            </List>
          </Collapse>
        )}

        {/* Render children in Popover (for mini mode with 'popover' behavior) */}
        {showPopover && popoverAnchorEl && popoverAnchorEl.element && (
          <Popper
            open={true}
            anchorEl={popoverAnchorEl.element}
            placement={anchor === 'left' ? 'right-start' : 'left-start'}
            disablePortal={false}
            modifiers={[
              {
                name: 'offset',
                options: {
                  offset: [0, 0],
                },
              },
              {
                name: 'preventOverflow',
                options: {
                  padding: 8,
                },
              },
            ]}
            sx={{ zIndex: theme.zIndex.modal }}
          >
            <Paper
              elevation={8}
              onMouseEnter={handlePopoverMouseEnter}
              onMouseLeave={handlePopoverMouseLeave}
              sx={{
                backgroundColor: bgcolor || theme.palette.background.paper,
                color: color || 'inherit',
                minWidth: 160,
                maxWidth: 280,
                // Create invisible hover bridge to prevent gaps
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  [anchor === 'left' ? 'right' : 'left']: '100%',
                  width: '8px',
                  pointerEvents: 'auto',
                },
              }}
            >
              <MenuList sx={{ py: 0.5 }}>
                {item.children!.map((child) => (
                  <MenuItem
                    key={child.id}
                    selected={activeItemId === child.id}
                    disabled={child.disabled}
                    onClick={() => {
                      if (popoverTimeoutRef.current) {
                        clearTimeout(popoverTimeoutRef.current);
                        popoverTimeoutRef.current = null;
                      }
                      setPopoverAnchorEl(null);
                      if (child.onClick) {
                        child.onClick();
                      }
                    }}
                    sx={{
                      color: color || 'inherit',
                      '&.Mui-selected': {
                        backgroundColor:
                          activeBackgroundColor || theme.palette.primary.main,
                        color: color || theme.palette.primary.contrastText,
                      },
                    }}
                  >
                    {child.icon && (
                      <ListItemIcon
                        sx={{
                          minWidth: 40,
                          color:
                            activeItemId === child.id
                              ? color || theme.palette.primary.contrastText
                              : color || 'inherit',
                        }}
                      >
                        {child.icon}
                      </ListItemIcon>
                    )}
                    <ListItemText primary={child.label} />
                  </MenuItem>
                ))}
              </MenuList>
            </Paper>
          </Popper>
        )}
      </React.Fragment>
    );

    return menuItem;
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
      showToggleButton={showToggleButton}
      toggleButtonContent={toggleButtonContent}
      toggleButtonSx={toggleButtonSx}
      sx={{
        '& .MuiDrawer-paper': {
          backgroundColor: bgcolor,
          color: color,
        },
      }}
    >
      <List>{items.map((item) => renderMenuItem(item, 0))}</List>
    </Drawer>
  );
}
