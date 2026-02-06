import MuiIconButton, {
  IconButtonProps as MuiIconButtonProps,
} from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
import {
  getIconButtonVariantStyles,
  type IconButtonVariant,
} from './iconButtonStyles';

const StyledIconButton = styled(MuiIconButton, {
  shouldForwardProp: (prop) => prop !== 'variantStyle' && prop !== 'iconColor',
})<
  MuiIconButtonProps & {
    variantStyle?: IconButtonVariant;
    iconColor?: string;
  }
>((props) => {
  const { theme, ownerState } = props as {
    theme: typeof props.theme;
    ownerState?: MuiIconButtonProps & {
      variantStyle?: IconButtonVariant;
      iconColor?: string;
    };
  };
  const state = (ownerState ?? props) as MuiIconButtonProps & {
    variantStyle?: IconButtonVariant;
    iconColor?: string;
  };
  const variant = state.variantStyle ?? 'default';
  return getIconButtonVariantStyles({
    variant,
    iconColor: state.iconColor,
    tokens: theme.palette.iconButtonTokens,
  });
});

export interface IconButtonProps extends Omit<MuiIconButtonProps, 'color'> {
  variant?: IconButtonVariant;
  /**
   * 覆蓋 icon 顏色，未提供則使用 token 預設值
   */
  iconColor?: string;
}

export function IconButton({
  variant = 'default',
  iconColor,
  ...props
}: IconButtonProps) {
  return (
    <StyledIconButton variantStyle={variant} iconColor={iconColor} {...props} />
  );
}

export default IconButton;
