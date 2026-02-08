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
 * DataTable Component - Atomic Design: Molecule
 *
 * Full-featured data table component，supports sorting, filtering, highlighting, expand/collapse, and other features。
 *
 * @example
 * ```tsx
 * // Basic usage
 * <DataTable
 *   columns={[
 *     { id: 'name', label: 'Name', sortable: true },
 *     { id: 'age', label: 'Age', sortable: true },
 *   ]}
 *   data={[
 *     { id: '1', name: 'John Wang', age: 25 },
 *     { id: '2', name: 'Lisa Lee', age: 30 },
 *   ]}
 * />
 *
 * // Expandable table
 * <DataTable
 *   columns={columns}
 *   data={data}
 *   expandable
 *   renderExpandedRow={(row) => <div>Expanded content：{row.detail}</div>}
 * />
 *
 * // Selectable table
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
   * Column ID（Corresponds to data key）
   */
  id: string;

  /**
   * columnTitle
   */
  label: string;

  /**
   * whether sortable
   */
  sortable?: boolean;

  /**
   * whether filterable
   */
  filterable?: boolean;

  /**
   * column width
   */
  width?: number | string;

  /**
   * alignment
   */
  align?: 'left' | 'center' | 'right';

  /**
   * customrender function
   */
  render?: (value: unknown, row: T) => React.ReactNode;

  /**
   * custom sort function
   */
  sortFn?: (a: T, b: T) => number;

  /**
   * customFilterfunction
   */
  filterFn?: (row: T, filterValue: string) => boolean;
}

export interface DataTableProps<T = unknown> {
  /**
   * column definition
   */
  columns: DataTableColumn<T>[];

  /**
   * data
   */
  data: T[];

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
   * Selected rows
   */
  selectedRows?: string[];

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
  renderExpandedRow?: (row: T) => React.ReactNode;

  /**
   * Highlighted rowscondition
   */
  highlightRow?: (row: T) => boolean;

  /**
   * Highlighted rowsColor
   */
  highlightColor?: string;

  /**
   * rowClick callback
   */
  onRowClick?: (row: T) => void;

  /**
   * whether to showPagination
   */
  pagination?: boolean;

  /**
   * perPagerowcount
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
   * table row height (used when fixed header)
   */
  maxHeight?: number | string;

  /**
   * expand icon style (default: 'right')
   */
  expandIconPosition?: 'right' | 'down';

  /**
   * custom style
   */
  sx?: SxProps<Theme>;
}

export function DataTable<T extends { id: string | number }>({
  columns,
  data,
  loading = false,
  emptyText = 'nodata',
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
  // sortstate
  const [orderBy, setOrderBy] = useState<string | null>(null);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

  // Filterstate
  const [filters, setFilters] = useState<Record<string, string>>({});

  // Expand state
  const [expandedRows, setExpandedRows] = useState<Set<string | number>>(
    new Set(),
  );

  // handlesort
  const handleSort = (columnId: string) => {
    const isAsc = orderBy === columnId && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(columnId);
  };

  // handleFilter
  const handleFilter = (columnId: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [columnId]: value,
    }));
  };

  // handleselect all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange?.(processedData.map((row) => String(row.id)));
    } else {
      onSelectionChange?.([]);
    }
  };

  // handlesingle select
  const handleSelectRow = (id: string | number, checked: boolean) => {
    const idStr = String(id);
    if (checked) {
      onSelectionChange?.([...selectedRows, idStr]);
    } else {
      onSelectionChange?.(selectedRows.filter((rowId) => rowId !== idStr));
    }
  };

  // handleexpanded
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

  // handledata（filter and sort）
  const processedData = useMemo(() => {
    let result = [...data];

    // Filter
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

    // sort
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

  // loadingstate
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <Progress type="circular" />
      </Box>
    );
  }

  // empty datastate
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
            {/* Filterrow */}
            {columns.some((col) => col.filterable) && (
              <TableRow>
                {selectable && <TableCell />}
                {expandable && <TableCell />}
                {columns.map((column) => (
                  <TableCell key={column.id} align={column.align}>
                    {column.filterable && (
                      <TextField
                        size="small"
                        placeholder={`Filter ${column.label}`}
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

            {/* Header row */}
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

                  {/* expandedrow */}
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

export default DataTable;
