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
 * DataList 組件 - Atomic Design: Molecule
 *
 * 功能完整的數據列表組件，支援排序、篩選、高亮、展開/收合等功能。
 *
 * @example
 * ```tsx
 * // 基本用法
 * <DataList
 *   items={[
 *     { id: '1', title: '項目 1', subtitle: '描述' },
 *     { id: '2', title: '項目 2', subtitle: '描述' },
 *   ]}
 * />
 *
 * // 可展開的列表
 * <DataList
 *   items={items}
 *   expandable
 *   renderExpandedContent={(item) => <div>詳細內容</div>}
 * />
 *
 * // 可選擇的列表
 * <DataList
 *   items={items}
 *   selectable
 *   onSelectionChange={(selected) => console.log(selected)}
 * />
 * ```
 */

export interface DataListItem {
  /**
   * 項目 ID
   */
  id: string | number;

  /**
   * 主標題
   */
  title: string;

  /**
   * 副標題
   */
  subtitle?: string;

  /**
   * 圖示
   */
  icon?: React.ReactNode;

  /**
   * 右側操作
   */
  actions?: React.ReactNode;

  /**
   * 徽章
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
   * 其他自訂屬性
   */
  [key: string]: unknown;
}

export interface DataListProps {
  /**
   * 列表項目
   */
  items: DataListItem[];

  /**
   * 是否載入中
   */
  loading?: boolean;

  /**
   * 空數據提示
   */
  emptyText?: string;

  /**
   * 是否可選擇
   */
  selectable?: boolean;

  /**
   * 選中的項目
   */
  selectedItems?: string[];

  /**
   * 選擇變更回調
   */
  onSelectionChange?: (selectedIds: string[]) => void;

  /**
   * 是否可展開
   */
  expandable?: boolean;

  /**
   * 渲染展開內容
   */
  renderExpandedContent?: (item: DataListItem) => React.ReactNode;

  /**
   * 高亮項目的條件
   */
  highlightItem?: (item: DataListItem) => boolean;

  /**
   * 高亮項目的顏色
   */
  highlightColor?: string;

  /**
   * 項目點擊回調
   */
  onItemClick?: (item: DataListItem) => void;

  /**
   * 是否顯示分頁
   */
  pagination?: boolean;

  /**
   * 每頁項目數
   */
  pageSize?: number;

  /**
   * 當前頁
   */
  page?: number;

  /**
   * 總頁數
   */
  totalPages?: number;

  /**
   * 頁面變更回調
   */
  onPageChange?: (page: number) => void;

  /**
   * 排序選項
   */
  sortOptions?: Array<{
    value: string;
    label: string;
  }>;

  /**
   * 當前排序
   */
  sortBy?: string;

  /**
   * 排序變更回調
   */
  onSortChange?: (sortBy: string) => void;

  /**
   * 篩選輸入框的 placeholder
   */
  filterPlaceholder?: string;

  /**
   * 篩選值
   */
  filterValue?: string;

  /**
   * 篩選變更回調
   */
  onFilterChange?: (value: string) => void;

  /**
   * 是否顯示分隔線
   */
  divider?: boolean;

  /**
   * 展開圖標樣式（預設為 'right'）
   */
  expandIconPosition?: 'right' | 'down';

  /**
   * 自訂樣式
   */
  sx?: SxProps<Theme>;
}

export function DataList({
  items,
  loading = false,
  emptyText = '沒有項目',
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
  filterPlaceholder = '搜尋...',
  filterValue = '',
  onFilterChange,
  divider = true,
  expandIconPosition = 'right',
  sx,
}: DataListProps) {
  // 展開狀態
  const [expandedItems, setExpandedItems] = useState<Set<string | number>>(
    new Set(),
  );

  // 處理全選
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange?.(items.map((item) => String(item.id)));
    } else {
      onSelectionChange?.([]);
    }
  };

  // 處理單選
  const handleSelectItem = (id: string | number, checked: boolean) => {
    const idStr = String(id);
    if (checked) {
      onSelectionChange?.([...selectedItems, idStr]);
    } else {
      onSelectionChange?.(selectedItems.filter((itemId) => itemId !== idStr));
    }
  };

  // 處理展開
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

  // 載入中狀態
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <Progress type="circular" />
      </Box>
    );
  }

  // 空數據狀態
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
      {/* 工具欄 */}
      {(sortOptions || onFilterChange || selectable) && (
        <Box
          sx={{
            p: 2,
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
              <InputLabel>排序</InputLabel>
              <Select
                value={sortBy}
                label="排序"
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

      {/* 列表 */}
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
                {selectable && (
                  <Checkbox
                    checked={isSelected}
                    onChange={(e) =>
                      handleSelectItem(item.id, e.target.checked)
                    }
                    sx={{ ml: 1 }}
                  />
                )}

                <ListItemButton
                  onClick={() => onItemClick?.(item)}
                  sx={{ py: 2 }}
                >
                  {item.icon && <ListItemIcon>{item.icon}</ListItemIcon>}
                  <ListItemText
                    primary={item.title}
                    secondary={item.subtitle}
                    primaryTypographyProps={{
                      fontWeight: isHighlighted ? 600 : 400,
                    }}
                  />
                </ListItemButton>
              </ListItem>

              {/* 展開內容 */}
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

      {/* 分頁 */}
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
