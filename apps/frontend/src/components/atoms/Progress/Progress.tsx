import { forwardRef } from 'react';
import MuiLinearProgress from '@mui/material/LinearProgress';
import MuiCircularProgress from '@mui/material/CircularProgress';
import { SxProps, Theme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

/**
 * Progress Component - Atomic Design: Atom
 *
 * Progress indicator component, supports linear and circular styles.
 *
 * @example
 * ```tsx
 * // Linear progress bar
 * <Progress type="linear" value={60} />
 *
 * // Circular progress indicator
 * <Progress type="circular" value={75} />
 *
 * // indeterminate state（loading）
 * <Progress type="linear" />
 * <Progress type="circular" />
 *
 * // Progress bar with label
 * <Progress type="linear" value={80} showLabel />
 * <Progress type="circular" value={50} showLabel />
 * ```
 */

export interface ProgressProps {
  /**
   * Progress type
   */
  type?: 'linear' | 'circular';

  /**
   * progress value（0-100）
   */
  value?: number;

  /**
   * Variant
   * - linear: supports 'determinate' | 'indeterminate' | 'buffer' | 'query'
   * - circular: only supports 'determinate' | 'indeterminate'
   */
  variant?: 'determinate' | 'indeterminate' | 'buffer' | 'query';

  /**
   * whether to showlabel
   */
  showLabel?: boolean;

  /**
   * labelformat function
   */
  labelFormatter?: (value: number) => string;

  /**
   * Color
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
   * Size（only valid for circular progress）
   */
  size?: number;

  /**
   * thickness（only valid for circular progress）
   */
  thickness?: number;

  /**
   * custom style
   */
  sx?: SxProps<Theme>;
}

/**
 * LinearProgress component（internal use）
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
 * CircularProgress component（internal use）
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
    // CircularProgress only supports determinate and indeterminate, if other value is passed, use indeterminate
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
 * Progress unifiedcomponent
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
