import { useState } from 'react';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Box,
  TextField,
  Checkbox,
  IconButton,
  Collapse,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import { SxProps, Theme } from '@mui/material/styles';
import {
  KeyboardArrowDown,
  KeyboardArrowUp,
  KeyboardArrowRight,
} from '@mui/icons-material';
import { Badge, Progress, Divider } from '@/components/atoms';
import { Pagination } from '@/components/molecules';

/**
 * DataList Component - Atomic Design: Molecule
 *
 * Full-featured data list component，supports sorting, filtering, highlighting, expand/collapse, and other features。
 *
 * @example
 * ```tsx
 * // Basic usage
 * <DataList
 *   items={[
 *     { id: '1', title: 'Item 1', subtitle: 'Description' },
 *     { id: '2', title: 'Item 2', subtitle: 'Description' },
 *   ]}
 * />
 *
 * // Expandable list
 * <DataList
 *   items={items}
 *   expandable
 *   renderExpandedContent={(item) => <div>Detailed content</div>}
 * />
 *
 * // Selectable list
 * <DataList
 *   items={items}
 *   selectable
 *   onSelectionChange={(selected) => console.log(selected)}
 * />
 * ```
 */

export interface DataListItem {
  /**
   * Item ID
   */
  id: string | number;

  /**
   * Main title
   */
  title: string;

  /**
   * Subtitle
   */
  subtitle?: string;

  /**
   * icon
   */
  icon?: React.ReactNode;

  /**
   * Right side actions
   */
  actions?: React.ReactNode;

  /**
   * badge
   */
  badge?: {
    label: string;
    color?:
      | 'default'
      | 'primary'
      | 'secondary'
      | 'error'
      | 'warning'
      | 'info'
      | 'success';
  };

  /**
   * other custom properties
   */
  [key: string]: unknown;
}

export interface DataListProps {
  /**
   * columnListItem
   */
  items: DataListItem[];

  /**
   * whether loading
   */
  loading?: boolean;

  /**
   * empty data message
   */
  emptyText?: string;

  /**
   * whetherselectable
   */
  selectable?: boolean;

  /**
   * selected items
   */
  selectedItems?: string[];

  /**
   * selection change callback
   */
  onSelectionChange?: (selectedIds: string[]) => void;

  /**
   * Whether expandable
   */
  expandable?: boolean;

  /**
   * render expanded content
   */
  renderExpandedContent?: (item: DataListItem) => React.ReactNode;

  /**
   * HighhighlightItemcondition
   */
  highlightItem?: (item: DataListItem) => boolean;

  /**
   * HighhighlightItemColor
   */
  highlightColor?: string;

  /**
   * ItemClick callback
   */
  onItemClick?: (item: DataListItem) => void;

  /**
   * whether to showPagination
   */
  pagination?: boolean;

  /**
   * items per page count
   */
  pageSize?: number;

  /**
   * currentPage
   */
  page?: number;

  /**
   * Total pages
   */
  totalPages?: number;

  /**
   * Page change callback
   */
  onPageChange?: (page: number) => void;

  /**
   * sortoptions
   */
  sortOptions?: Array<{
    value: string;
    label: string;
  }>;

  /**
   * currentsort
   */
  sortBy?: string;

  /**
   * sort change callback
   */
  onSortChange?: (sortBy: string) => void;

  /**
   * FilterInputfield placeholder
   */
  filterPlaceholder?: string;

  /**
   * FilterValue
   */
  filterValue?: string;

  /**
   * Filterchangecallback
   */
  onFilterChange?: (value: string) => void;

  /**
   * whether to show divider
   */
  divider?: boolean;

  /**
   * expand icon style (default: 'right')
   */
  expandIconPosition?: 'right' | 'down';

  /**
   * custom style
   */
  sx?: SxProps<Theme>;
}

export function DataList({
  items,
  loading = false,
  emptyText = 'noItem',
  selectable = false,
  selectedItems = [],
  onSelectionChange,
  expandable = false,
  renderExpandedContent,
  highlightItem,
  highlightColor = 'rgba(25, 118, 210, 0.08)',
  onItemClick,
  pagination = false,
  pageSize: _pageSize = 10,
  page = 1,
  totalPages,
  onPageChange,
  sortOptions,
  sortBy,
  onSortChange,
  filterPlaceholder = 'search...',
  filterValue = '',
  onFilterChange,
  divider = true,
  expandIconPosition = 'right',
  sx,
}: DataListProps) {
  // Expand state
  const [expandedItems, setExpandedItems] = useState<Set<string | number>>(
    new Set(),
  );

  // handleselect all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange?.(items.map((item) => String(item.id)));
    } else {
      onSelectionChange?.([]);
    }
  };

  // handlesingle select
  const handleSelectItem = (id: string | number, checked: boolean) => {
    const idStr = String(id);
    if (checked) {
      onSelectionChange?.([...selectedItems, idStr]);
    } else {
      onSelectionChange?.(selectedItems.filter((itemId) => itemId !== idStr));
    }
  };

  // handleexpanded
  const handleExpandItem = (id: string | number) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // loadingstate
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <Progress type="circular" />
      </Box>
    );
  }

  // empty datastate
  if (items.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center', ...sx }}>
        <Typography color="text.secondary">{emptyText}</Typography>
      </Paper>
    );
  }

  const allSelected = items.length > 0 && selectedItems.length === items.length;
  const someSelected = selectedItems.length > 0 && !allSelected;

  return (
    <Paper sx={{ width: '100%', ...sx }}>
      {/* toolbar */}
      {(sortOptions || onFilterChange || selectable) && (
        <Box
          sx={{
            py: 2,
            pr: 2,
            pl: 2,
            display: 'flex',
            gap: 2,
            alignItems: 'center',
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          {selectable && (
            <Checkbox
              checked={allSelected}
              indeterminate={someSelected}
              onChange={(e) => handleSelectAll(e.target.checked)}
              sx={{ mr: 1 }}
            />
          )}

          {onFilterChange && (
            <TextField
              size="small"
              placeholder={filterPlaceholder}
              value={filterValue}
              onChange={(e) => onFilterChange(e.target.value)}
              sx={{ flexGrow: 1 }}
            />
          )}

          {sortOptions && sortBy !== undefined && onSortChange && (
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>sort</InputLabel>
              <Select
                value={sortBy}
                label="sort"
                onChange={(e) => onSortChange(e.target.value)}
              >
                {sortOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Box>
      )}

      {/* columnList */}
      <List sx={{ p: 0 }}>
        {items.map((item, index) => {
          const isSelected = selectedItems.includes(String(item.id));
          const isExpanded = expandedItems.has(item.id);
          const isHighlighted = highlightItem?.(item) || false;

          return (
            <Box key={item.id}>
              <ListItem
                disablePadding
                sx={{
                  ...(isHighlighted && {
                    backgroundColor: highlightColor,
                  }),
                }}
                secondaryAction={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {item.badge && (
                      <Badge color={item.badge.color}>{item.badge.label}</Badge>
                    )}
                    {item.actions}
                    {expandable && (
                      <IconButton
                        edge="end"
                        onClick={() => handleExpandItem(item.id)}
                      >
                        {isExpanded ? (
                          expandIconPosition === 'down' ? (
                            <KeyboardArrowUp />
                          ) : (
                            <KeyboardArrowDown />
                          )
                        ) : expandIconPosition === 'down' ? (
                          <KeyboardArrowDown />
                        ) : (
                          <KeyboardArrowRight />
                        )}
                      </IconButton>
                    )}
                  </Box>
                }
              >
                <ListItemButton
                  onClick={() => onItemClick?.(item)}
                  sx={{ py: 2, pl: 2, pr: 2 }}
                >
                  {selectable && (
                    <Checkbox
                      checked={isSelected}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleSelectItem(item.id, e.target.checked);
                      }}
                      tabIndex={-1}
                      disableRipple
                      sx={{ mr: 1 }}
                    />
                  )}
                  {item.icon && (
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      {item.icon}
                    </ListItemIcon>
                  )}
                  <ListItemText
                    primary={item.title}
                    secondary={item.subtitle}
                    primaryTypographyProps={{
                      fontWeight: isHighlighted ? 600 : 400,
                    }}
                  />
                </ListItemButton>
              </ListItem>

              {/* Expanded content */}
              {expandable && (
                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                  <Box sx={{ px: 3, py: 2, bgcolor: 'grey.50' }}>
                    {renderExpandedContent?.(item)}
                  </Box>
                </Collapse>
              )}

              {divider && index < items.length - 1 && <Divider />}
            </Box>
          );
        })}
      </List>

      {/* Pagination */}
      {pagination && totalPages && onPageChange && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            p: 2,
            borderTop: 1,
            borderColor: 'divider',
          }}
        >
          <Pagination
            count={totalPages}
            page={page}
            onChange={onPageChange}
            color="primary"
            showFirstButton
            showLastButton
          />
        </Box>
      )}
    </Paper>
  );
}

export default DataList;
