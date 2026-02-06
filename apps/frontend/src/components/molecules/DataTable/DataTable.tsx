import { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  Box,
  TextField,
  Checkbox,
  IconButton,
  Collapse,
  Typography,
} from '@mui/material';
import { SxProps, Theme } from '@mui/material/styles';
import {
  KeyboardArrowDown,
  KeyboardArrowUp,
  KeyboardArrowRight,
} from '@mui/icons-material';
import { Progress } from '@/components/atoms';
import { Pagination } from '@/components/molecules';

/**
 * DataTable 組件 - Atomic Design: Molecule
 *
 * 功能完整的數據表格組件，支援排序、篩選、高亮、展開/收合等功能。
 *
 * @example
 * ```tsx
 * // 基本用法
 * <DataTable
 *   columns={[
 *     { id: 'name', label: '姓名', sortable: true },
 *     { id: 'age', label: '年齡', sortable: true },
 *   ]}
 *   data={[
 *     { id: '1', name: '王小明', age: 25 },
 *     { id: '2', name: '李小華', age: 30 },
 *   ]}
 * />
 *
 * // 可展開的表格
 * <DataTable
 *   columns={columns}
 *   data={data}
 *   expandable
 *   renderExpandedRow={(row) => <div>展開內容：{row.detail}</div>}
 * />
 *
 * // 可選擇的表格
 * <DataTable
 *   columns={columns}
 *   data={data}
 *   selectable
 *   onSelectionChange={(selected) => console.log(selected)}
 * />
 * ```
 */

export interface DataTableColumn<T = unknown> {
  /**
   * 列 ID（對應數據的鍵）
   */
  id: string;

  /**
   * 列標題
   */
  label: string;

  /**
   * 是否可排序
   */
  sortable?: boolean;

  /**
   * 是否可篩選
   */
  filterable?: boolean;

  /**
   * 列寬度
   */
  width?: number | string;

  /**
   * 對齊方式
   */
  align?: 'left' | 'center' | 'right';

  /**
   * 自訂渲染函數
   */
  render?: (value: unknown, row: T) => React.ReactNode;

  /**
   * 自訂排序函數
   */
  sortFn?: (a: T, b: T) => number;

  /**
   * 自訂篩選函數
   */
  filterFn?: (row: T, filterValue: string) => boolean;
}

export interface DataTableProps<T = unknown> {
  /**
   * 列定義
   */
  columns: DataTableColumn<T>[];

  /**
   * 數據
   */
  data: T[];

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
   * 選中的行
   */
  selectedRows?: string[];

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
  renderExpandedRow?: (row: T) => React.ReactNode;

  /**
   * 高亮行的條件
   */
  highlightRow?: (row: T) => boolean;

  /**
   * 高亮行的顏色
   */
  highlightColor?: string;

  /**
   * 行點擊回調
   */
  onRowClick?: (row: T) => void;

  /**
   * 是否顯示分頁
   */
  pagination?: boolean;

  /**
   * 每頁行數
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
   * 表格高度（固定表頭時使用）
   */
  maxHeight?: number | string;

  /**
   * 展開圖標樣式（預設為 'right'）
   */
  expandIconPosition?: 'right' | 'down';

  /**
   * 自訂樣式
   */
  sx?: SxProps<Theme>;
}

export function DataTable<T extends { id: string | number }>({
  columns,
  data,
  loading = false,
  emptyText = '沒有數據',
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  expandable = false,
  renderExpandedRow,
  highlightRow,
  highlightColor = 'rgba(25, 118, 210, 0.08)',
  onRowClick,
  pagination = false,
  pageSize: _pageSize = 10,
  page = 1,
  totalPages,
  onPageChange,
  maxHeight,
  expandIconPosition = 'right',
  sx,
}: DataTableProps<T>) {
  // 排序狀態
  const [orderBy, setOrderBy] = useState<string | null>(null);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

  // 篩選狀態
  const [filters, setFilters] = useState<Record<string, string>>({});

  // 展開狀態
  const [expandedRows, setExpandedRows] = useState<Set<string | number>>(
    new Set(),
  );

  // 處理排序
  const handleSort = (columnId: string) => {
    const isAsc = orderBy === columnId && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(columnId);
  };

  // 處理篩選
  const handleFilter = (columnId: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [columnId]: value,
    }));
  };

  // 處理全選
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange?.(processedData.map((row) => String(row.id)));
    } else {
      onSelectionChange?.([]);
    }
  };

  // 處理單選
  const handleSelectRow = (id: string | number, checked: boolean) => {
    const idStr = String(id);
    if (checked) {
      onSelectionChange?.([...selectedRows, idStr]);
    } else {
      onSelectionChange?.(selectedRows.filter((rowId) => rowId !== idStr));
    }
  };

  // 處理展開
  const handleExpandRow = (id: string | number) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // 處理數據（篩選和排序）
  const processedData = useMemo(() => {
    let result = [...data];

    // 篩選
    Object.entries(filters).forEach(([columnId, filterValue]) => {
      if (filterValue) {
        const column = columns.find((col) => col.id === columnId);
        result = result.filter((row) => {
          if (column?.filterFn) {
            return column.filterFn(row, filterValue);
          }
          const value = String(row[columnId as keyof T] || '');
          return value.toLowerCase().includes(filterValue.toLowerCase());
        });
      }
    });

    // 排序
    if (orderBy) {
      const column = columns.find((col) => col.id === orderBy);
      result.sort((a, b) => {
        if (column?.sortFn) {
          return order === 'asc' ? column.sortFn(a, b) : column.sortFn(b, a);
        }

        const aVal = a[orderBy as keyof T];
        const bVal = b[orderBy as keyof T];

        if (aVal == null) return 1;
        if (bVal == null) return -1;

        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return order === 'asc'
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }

        if (aVal < bVal) return order === 'asc' ? -1 : 1;
        if (aVal > bVal) return order === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, filters, orderBy, order, columns]);

  // 載入中狀態
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <Progress type="circular" />
      </Box>
    );
  }

  // 空數據狀態
  if (data.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center', ...sx }}>
        <Typography color="text.secondary">{emptyText}</Typography>
      </Paper>
    );
  }

  const allSelected =
    processedData.length > 0 && selectedRows.length === processedData.length;
  const someSelected = selectedRows.length > 0 && !allSelected;

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', ...sx }}>
      <TableContainer sx={{ maxHeight }}>
        <Table stickyHeader>
          <TableHead>
            {/* 篩選行 */}
            {columns.some((col) => col.filterable) && (
              <TableRow>
                {selectable && <TableCell />}
                {expandable && <TableCell />}
                {columns.map((column) => (
                  <TableCell key={column.id} align={column.align}>
                    {column.filterable && (
                      <TextField
                        size="small"
                        placeholder={`篩選 ${column.label}`}
                        value={filters[column.id] || ''}
                        onChange={(e) =>
                          handleFilter(column.id, e.target.value)
                        }
                        fullWidth
                        sx={{ minWidth: 120 }}
                      />
                    )}
                  </TableCell>
                ))}
              </TableRow>
            )}

            {/* 表頭行 */}
            <TableRow>
              {selectable && (
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={allSelected}
                    indeterminate={someSelected}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </TableCell>
              )}
              {expandable && <TableCell />}
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ width: column.width }}
                >
                  {column.sortable ? (
                    <TableSortLabel
                      active={orderBy === column.id}
                      direction={orderBy === column.id ? order : 'asc'}
                      onClick={() => handleSort(column.id)}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {processedData.map((row) => {
              const isSelected = selectedRows.includes(String(row.id));
              const isExpanded = expandedRows.has(row.id);
              const isHighlighted = highlightRow?.(row) || false;

              return (
                <>
                  <TableRow
                    key={row.id}
                    hover
                    selected={isSelected}
                    onClick={() => onRowClick?.(row)}
                    sx={{
                      cursor: onRowClick ? 'pointer' : 'default',
                      ...(isHighlighted && {
                        backgroundColor: highlightColor,
                        '&:hover': {
                          backgroundColor: highlightColor,
                        },
                      }),
                    }}
                  >
                    {selectable && (
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isSelected}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleSelectRow(row.id, e.target.checked);
                          }}
                        />
                      </TableCell>
                    )}
                    {expandable && (
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExpandRow(row.id);
                          }}
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
                      </TableCell>
                    )}
                    {columns.map((column) => (
                      <TableCell key={column.id} align={column.align}>
                        {column.render
                          ? column.render(row[column.id as keyof T], row)
                          : String(row[column.id as keyof T] || '')}
                      </TableCell>
                    ))}
                  </TableRow>

                  {/* 展開行 */}
                  {expandable && (
                    <TableRow>
                      <TableCell
                        colSpan={
                          columns.length +
                          (selectable ? 1 : 0) +
                          (expandable ? 1 : 0)
                        }
                        sx={{ py: 0, borderBottom: isExpanded ? undefined : 0 }}
                      >
                        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                          <Box sx={{ py: 2 }}>{renderExpandedRow?.(row)}</Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

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

export default DataTable;
