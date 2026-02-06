import MuiButton, { ButtonProps as MuiButtonProps } from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { styled } from '@mui/material/styles';
import {
  getButtonVariantStyles,
  isCustomVariant,
  type ButtonVariant,
  type CustomVariant,
} from './buttonStyles';

const StyledButton = styled(MuiButton, {
  shouldForwardProp: (prop) => prop !== 'customVariant',
})<MuiButtonProps & { customVariant?: CustomVariant }>((props) => {
  const { theme, ownerState } = props as {
    theme: typeof props.theme;
    ownerState?: MuiButtonProps & { customVariant?: CustomVariant };
  };
  const state = (ownerState ?? props) as MuiButtonProps & {
    customVariant?: CustomVariant;
  };
  const variant = state.variant ?? 'contained';
  const customVariant = state.customVariant;

  return getButtonVariantStyles({
    variant,
    customVariant,
    size: state.size,
    tokens: theme.palette.buttonTokens,
  });
});

/**
 * Button 組件 - Atomic Design: Atom
 *
 * 基於 MUI Button 的封裝，提供統一的按鈕樣式和行為。
 * 支援載入狀態、全寬度、各種尺寸和顏色變體。
 *
 * @example
 * ```tsx
 * <Button variant="contained" color="primary">
 *   點擊我
 * </Button>
 *
 * <Button variant="outlined" loading>
 *   載入中...
 * </Button>
 * ```
 */

export interface ButtonProps extends Omit<
  MuiButtonProps,
  'endIcon' | 'startIcon' | 'variant'
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
   * 按鈕樣式
   */
  variant?: ButtonVariant;
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
  ...props
}: ButtonProps) {
  const customVariant = isCustomVariant(variant) ? variant : undefined;
  const resolvedVariant =
    customVariant === 'tagText'
      ? 'text'
      : customVariant
        ? 'contained'
        : variant;
  return (
    <StyledButton
      variant={resolvedVariant as MuiButtonProps['variant']}
      color={color}
      size={size}
      disabled={disabled || loading}
      fullWidth={fullWidth}
      customVariant={customVariant}
      data-loading={loading ? 'true' : undefined}
      {...props}
      startIcon={
        loading ? (
          <CircularProgress size={16} color="inherit" />
        ) : (
          props.startIcon
        )
      }
    >
      {children}
    </StyledButton>
  );
}

export default Button;
