import { forwardRef } from 'react';
import MuiPagination from '@mui/material/Pagination';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { SxProps, Theme } from '@mui/material/styles';

/**
 * Pagination 組件 - Atomic Design: Molecule
 *
 * 分頁組件，用於在大量資料中導航。
 *
 * @example
 * ```tsx
 * // 基本用法
 * <Pagination
 *   count={10}
 *   page={1}
 *   onChange={(page) => console.log(page)}
 * />
 *
 * // 帶總數資訊
 * <Pagination
 *   count={10}
 *   page={1}
 *   showInfo
 *   totalItems={95}
 *   itemsPerPage={10}
 * />
 *
 * // 不同變體
 * <Pagination count={10} variant="outlined" />
 * <Pagination count={10} shape="rounded" />
 * ```
 */

export interface PaginationProps {
  /**
   * 總頁數
   */
  count: number;

  /**
   * 當前頁碼
   */
  page: number;

  /**
   * 頁碼變更時的回調
   */
  onChange: (page: number) => void;

  /**
   * 預設頁碼
   */
  defaultPage?: number;

  /**
   * 顯示的按鈕數量（邊界按鈕除外）
   */
  siblingCount?: number;

  /**
   * 邊界按鈕數量
   */
  boundaryCount?: number;

  /**
   * 是否顯示第一頁/最後一頁按鈕
   */
  showFirstButton?: boolean;
  showLastButton?: boolean;

  /**
   * 是否隱藏上一頁/下一頁按鈕
   */
  hidePrevButton?: boolean;
  hideNextButton?: boolean;

  /**
   * 組件大小
   */
  size?: 'small' | 'medium' | 'large';

  /**
   * 組件變體
   */
  variant?: 'text' | 'outlined';

  /**
   * 按鈕形狀
   */
  shape?: 'circular' | 'rounded';

  /**
   * 組件顏色
   */
  color?: 'primary' | 'secondary' | 'standard';

  /**
   * 是否禁用
   */
  disabled?: boolean;

  /**
   * 是否顯示資訊文字（總筆數、當前範圍等）
   */
  showInfo?: boolean;

  /**
   * 總項目數（用於顯示資訊）
   */
  totalItems?: number;

  /**
   * 每頁項目數（用於顯示資訊）
   */
  itemsPerPage?: number;

  /**
   * 自訂渲染函數
   */
  renderItem?: (item: unknown) => React.ReactNode;

  /**
   * 自訂樣式
   */
  sx?: SxProps<Theme>;
}

/**
 * Pagination 組件
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

    // 計算當前頁面的項目範圍
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
            顯示 {range.start}-{range.end} 筆，共 {totalItems} 筆
          </Typography>
        )}
      </Box>
    );
  },
);

export default Pagination;
