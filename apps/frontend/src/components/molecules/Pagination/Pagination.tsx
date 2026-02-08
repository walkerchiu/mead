import { forwardRef } from 'react';
import MuiPagination from '@mui/material/Pagination';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { SxProps, Theme } from '@mui/material/styles';

/**
 * Pagination Component - Atomic Design: Molecule
 *
 * Pagination component，for navigating through large amounts of data。
 *
 * @example
 * ```tsx
 * // Basic usage
 * <Pagination
 *   count={10}
 *   page={1}
 *   onChange={(page) => console.log(page)}
 * />
 *
 * // With total count
 * <Pagination
 *   count={10}
 *   page={1}
 *   showInfo
 *   totalItems={95}
 *   itemsPerPage={10}
 * />
 *
 * // Different variants
 * <Pagination count={10} variant="outlined" />
 * <Pagination count={10} shape="rounded" />
 * ```
 */

export interface PaginationProps {
  /**
   * Total pages
   */
  count: number;

  /**
   * Current page
   */
  page: number;

  /**
   * Callback when page changes
   */
  onChange: (page: number) => void;

  /**
   * Default page number
   */
  defaultPage?: number;

  /**
   * number of buttons to display（except boundary buttons）
   */
  siblingCount?: number;

  /**
   * Number of boundary buttons
   */
  boundaryCount?: number;

  /**
   * Whether to show first page/last page button
   */
  showFirstButton?: boolean;
  showLastButton?: boolean;

  /**
   * whether to hide previous/next page buttons
   */
  hidePrevButton?: boolean;
  hideNextButton?: boolean;

  /**
   * componentsize
   */
  size?: 'small' | 'medium' | 'large';

  /**
   * component variant
   */
  variant?: 'text' | 'outlined';

  /**
   * button shape
   */
  shape?: 'circular' | 'rounded';

  /**
   * componentColor
   */
  color?: 'primary' | 'secondary' | 'standard';

  /**
   * Whether disabled
   */
  disabled?: boolean;

  /**
   * whether to show information text (total count, current range, etc.)
   */
  showInfo?: boolean;

  /**
   * total item count（Used to display information）
   */
  totalItems?: number;

  /**
   * items per page count（Used to display information）
   */
  itemsPerPage?: number;

  /**
   * customrender function
   */
  renderItem?: (item: unknown) => React.ReactNode;

  /**
   * custom style
   */
  sx?: SxProps<Theme>;
}

/**
 * Pagination component
 */
export const Pagination = forwardRef<HTMLElement, PaginationProps>(
  function Pagination(
    {
      count,
      page,
      onChange,
      defaultPage = 1,
      siblingCount = 1,
      boundaryCount = 1,
      showFirstButton = false,
      showLastButton = false,
      hidePrevButton = false,
      hideNextButton = false,
      size = 'medium',
      variant = 'text',
      shape = 'circular',
      color = 'primary',
      disabled = false,
      showInfo = false,
      totalItems,
      itemsPerPage,
      renderItem,
      sx,
      ...props
    },
    ref,
  ) {
    const handleChange = (
      _event: React.ChangeEvent<unknown>,
      value: number,
    ) => {
      onChange(value);
    };

    // calculate current page item range
    const getItemRange = () => {
      if (!totalItems || !itemsPerPage) return null;
      const start = (page - 1) * itemsPerPage + 1;
      const end = Math.min(page * itemsPerPage, totalItems);
      return { start, end };
    };

    const range = getItemRange();

    return (
      <Box
        ref={ref}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1,
          ...sx,
        }}
      >
        <MuiPagination
          count={count}
          page={page}
          onChange={handleChange}
          defaultPage={defaultPage}
          siblingCount={siblingCount}
          boundaryCount={boundaryCount}
          showFirstButton={showFirstButton}
          showLastButton={showLastButton}
          hidePrevButton={hidePrevButton}
          hideNextButton={hideNextButton}
          size={size}
          variant={variant}
          shape={shape}
          color={color}
          disabled={disabled}
          renderItem={renderItem}
          {...props}
        />
        {showInfo && range && totalItems && (
          <Typography variant="body2" color="text.secondary">
            display {range.start}-{range.end} items，Total {totalItems} items
          </Typography>
        )}
      </Box>
    );
  },
);

export default Pagination;
