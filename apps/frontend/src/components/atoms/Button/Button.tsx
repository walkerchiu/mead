import MuiButton, { ButtonProps as MuiButtonProps } from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

/**
 * Button 組件 - Atomic Design: Atom
 *
 * 基於 MUI Button 的封裝，提供統一的按鈕樣式和行為。
 * 支援載入狀態、圖示、全寬度、各種尺寸和顏色變體。
 *
 * @example
 * ```tsx
 * // 基本按鈕
 * <Button variant="contained" color="primary">
 *   點擊我
 * </Button>
 *
 * // 帶圖示的按鈕
 * <Button startIcon={<Icon>➕</Icon>}>
 *   新增
 * </Button>
 *
 * // 純圖示按鈕
 * <Button iconOnly>
 *   <Icon>🔍</Icon>
 * </Button>
 *
 * // 載入狀態
 * <Button variant="outlined" loading>
 *   載入中...
 * </Button>
 * ```
 */

export interface ButtonProps extends Omit<
  MuiButtonProps,
  'endIcon' | 'startIcon'
> {
  /**
   * 是否顯示載入狀態
   * 載入時按鈕會被停用，並顯示載入指示器
   */
  loading?: boolean;

  /**
   * 按鈕是否佔滿父容器寬度
   */
  fullWidth?: boolean;

  /**
   * 開始圖示（loading 時會被替換）
   */
  startIcon?: React.ReactNode;

  /**
   * 結束圖示
   */
  endIcon?: React.ReactNode;

  /**
   * 是否為純圖示按鈕（無文字）
   */
  iconOnly?: boolean;
}

/**
 * Button 組件
 */
export function Button({
  children,
  loading = false,
  disabled,
  fullWidth = false,
  variant = 'contained',
  color = 'primary',
  size = 'medium',
  startIcon,
  endIcon,
  iconOnly = false,
  ...props
}: ButtonProps) {
  // 計算 loading 圖標大小
  const loadingSize = size === 'small' ? 14 : size === 'large' ? 18 : 16;

  return (
    <MuiButton
      variant={variant}
      color={color}
      size={size}
      disabled={disabled || loading}
      fullWidth={fullWidth}
      startIcon={
        loading && !iconOnly ? (
          <CircularProgress size={loadingSize} color="inherit" />
        ) : (
          startIcon
        )
      }
      endIcon={endIcon}
      sx={{
        ...(iconOnly && {
          minWidth: 'auto',
          padding: size === 'small' ? '6px' : size === 'large' ? '12px' : '8px',
        }),
        ...props.sx,
      }}
      {...props}
    >
      {loading && iconOnly ? (
        <CircularProgress size={loadingSize} color="inherit" />
      ) : (
        children
      )}
    </MuiButton>
  );
}

export default Button;
