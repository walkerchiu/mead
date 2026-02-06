import { forwardRef } from 'react';
import MuiLinearProgress from '@mui/material/LinearProgress';
import MuiCircularProgress from '@mui/material/CircularProgress';
import { SxProps, Theme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

/**
 * Progress 組件 - Atomic Design: Atom
 *
 * 進度指示器組件，支援線性和圓形兩種樣式。
 *
 * @example
 * ```tsx
 * // 線性進度條
 * <Progress type="linear" value={60} />
 *
 * // 圓形進度指示器
 * <Progress type="circular" value={75} />
 *
 * // 不確定狀態（載入中）
 * <Progress type="linear" />
 * <Progress type="circular" />
 *
 * // 帶標籤的進度條
 * <Progress type="linear" value={80} showLabel />
 * <Progress type="circular" value={50} showLabel />
 * ```
 */

export interface ProgressProps {
  /**
   * 進度類型
   */
  type?: 'linear' | 'circular';

  /**
   * 進度值（0-100）
   */
  value?: number;

  /**
   * 變體
   * - linear: 支援 'determinate' | 'indeterminate' | 'buffer' | 'query'
   * - circular: 僅支援 'determinate' | 'indeterminate'
   */
  variant?: 'determinate' | 'indeterminate' | 'buffer' | 'query';

  /**
   * 是否顯示標籤
   */
  showLabel?: boolean;

  /**
   * 標籤格式化函數
   */
  labelFormatter?: (value: number) => string;

  /**
   * 顏色
   */
  color?:
    | 'primary'
    | 'secondary'
    | 'error'
    | 'warning'
    | 'info'
    | 'success'
    | 'inherit';

  /**
   * 尺寸（僅圓形進度有效）
   */
  size?: number;

  /**
   * 厚度（僅圓形進度有效）
   */
  thickness?: number;

  /**
   * 自訂樣式
   */
  sx?: SxProps<Theme>;
}

/**
 * LinearProgress 組件（內部使用）
 */
const LinearProgressComponent = forwardRef<HTMLDivElement, ProgressProps>(
  function LinearProgress(
    {
      value,
      variant = value !== undefined ? 'determinate' : 'indeterminate',
      showLabel = false,
      labelFormatter = (v) => `${Math.round(v)}%`,
      color = 'primary',
      sx,
      ...props
    },
    ref,
  ) {
    if (showLabel && value !== undefined) {
      return (
        <Box
          sx={{ display: 'flex', alignItems: 'center', width: '100%', ...sx }}
        >
          <Box sx={{ width: '100%', mr: 1 }}>
            <MuiLinearProgress
              ref={ref}
              variant={variant}
              value={value}
              color={color}
              {...props}
            />
          </Box>
          <Box sx={{ minWidth: 35 }}>
            <Typography variant="body2" color="text.secondary">
              {labelFormatter(value)}
            </Typography>
          </Box>
        </Box>
      );
    }

    return (
      <MuiLinearProgress
        ref={ref}
        variant={variant}
        value={value}
        color={color}
        sx={sx}
        {...props}
      />
    );
  },
);

/**
 * CircularProgress 組件（內部使用）
 */
const CircularProgressComponent = forwardRef<HTMLDivElement, ProgressProps>(
  function CircularProgress(
    {
      value,
      variant = value !== undefined ? 'determinate' : 'indeterminate',
      showLabel = false,
      labelFormatter = (v) => `${Math.round(v)}%`,
      color = 'primary',
      size = 40,
      thickness = 3.6,
      sx,
      ...props
    },
    ref,
  ) {
    // CircularProgress 僅支援 determinate 和 indeterminate，若傳入其他值則使用 indeterminate
    const circularVariant: 'determinate' | 'indeterminate' =
      variant === 'determinate' || variant === 'indeterminate'
        ? variant
        : 'indeterminate';

    if (showLabel && value !== undefined) {
      return (
        <Box sx={{ position: 'relative', display: 'inline-flex', ...sx }}>
          <MuiCircularProgress
            ref={ref}
            variant={circularVariant}
            value={value}
            color={color}
            size={size}
            thickness={thickness}
            {...props}
          />
          <Box
            sx={{
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              position: 'absolute',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography
              variant="caption"
              component="div"
              color="text.secondary"
              sx={{ fontSize: size > 50 ? '0.875rem' : '0.75rem' }}
            >
              {labelFormatter(value)}
            </Typography>
          </Box>
        </Box>
      );
    }

    return (
      <MuiCircularProgress
        ref={ref}
        variant={circularVariant}
        value={value}
        color={color}
        size={size}
        thickness={thickness}
        sx={sx}
        {...props}
      />
    );
  },
);

/**
 * Progress 統一組件
 */
export const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  function Progress({ type = 'linear', ...props }, ref) {
    if (type === 'circular') {
      return <CircularProgressComponent ref={ref} {...props} />;
    }
    return <LinearProgressComponent ref={ref} {...props} />;
  },
);

export default Progress;
