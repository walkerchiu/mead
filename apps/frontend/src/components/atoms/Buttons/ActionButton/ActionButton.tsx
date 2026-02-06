import MuiIconButton, {
  IconButtonProps as MuiIconButtonProps,
} from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
import {
  getActionButtonVariantStyles,
  type ActionButtonShape,
  type ActionButtonSize,
  type ActionButtonVariant,
} from './actionButtonStyles';

const StyledActionButton = styled(MuiIconButton, {
  shouldForwardProp: (prop) =>
    prop !== 'variantStyle' &&
    prop !== 'iconColor' &&
    prop !== 'shapeStyle' &&
    prop !== 'sizeStyle',
})<
  MuiIconButtonProps & {
    variantStyle?: ActionButtonVariant;
    iconColor?: string;
    shapeStyle?: ActionButtonShape;
    sizeStyle?: ActionButtonSize;
  }
>((props) => {
  const { theme, ownerState } = props as {
    theme: typeof props.theme;
    ownerState?: MuiIconButtonProps & {
      variantStyle?: ActionButtonVariant;
      iconColor?: string;
      shapeStyle?: ActionButtonShape;
      sizeStyle?: ActionButtonSize;
    };
  };
  const state = (ownerState ?? props) as MuiIconButtonProps & {
    variantStyle?: ActionButtonVariant;
    iconColor?: string;
    shapeStyle?: ActionButtonShape;
    sizeStyle?: ActionButtonSize;
  };
  const variant = state.variantStyle ?? 'default';
  return getActionButtonVariantStyles({
    variant,
    iconColor: state.iconColor,
    shape: state.shapeStyle,
    size: state.sizeStyle,
    tokens: theme.palette.actionButtonTokens,
  });
});

export interface ActionButtonProps extends Omit<
  MuiIconButtonProps,
  'color' | 'size'
> {
  variant?: ActionButtonVariant;
  /**
   * 覆蓋 icon 顏色，未提供則使用 token 預設值
   */
  iconColor?: string;
  /**
   * 外觀形狀（circle/pill）
   */
  shape?: ActionButtonShape;
  /**
   * 尺寸（sm=32, lg=40）
   */
  size?: ActionButtonSize;
}

export function ActionButton({
  variant = 'default',
  iconColor,
  shape = 'circle',
  size = 'sm',
  ...props
}: ActionButtonProps) {
  return (
    <StyledActionButton
      variantStyle={variant}
      iconColor={iconColor}
      shapeStyle={shape}
      sizeStyle={size}
      {...props}
    />
  );
}

export default ActionButton;
