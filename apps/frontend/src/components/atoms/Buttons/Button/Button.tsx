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
 * Button Component - Atomic Design: Atom
 *
 * Wrapper based on MUI Button, provides unified button styles and behavior.
 * Supports loading state, full width, various sizes and color variants.
 *
 * @example
 * ```tsx
 * <Button variant="contained" color="primary">
 *   click me
 * </Button>
 *
 * <Button variant="outlined" loading>
 *   loading...
 * </Button>
 * ```
 */

export interface ButtonProps extends Omit<
  MuiButtonProps,
  'endIcon' | 'startIcon' | 'variant'
> {
  /**
   * whether to show loading state
   * button will be disabled when loading，and show loading indicator
   */
  loading?: boolean;

  /**
   * Whether button fills parent container width
   */
  fullWidth?: boolean;

  /**
   * Start icon（Will be replaced when loading）
   */
  startIcon?: React.ReactNode;

  /**
   * End icon
   */
  endIcon?: React.ReactNode;

  /**
   * Button style
   */
  variant?: ButtonVariant;
}

/**
 * Button component
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
