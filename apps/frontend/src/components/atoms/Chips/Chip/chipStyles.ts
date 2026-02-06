import type { CSSObject, Theme } from '@mui/material/styles';

export type ChipVariant =
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'text'
  | 'another';
export type ChipSize = 'small' | 'medium' | 'large';

type ChipTokens = Theme['palette']['chipTokens'];

type ChipStyleParams = {
  tokens: ChipTokens;
  variant?: ChipVariant;
  size?: ChipSize;
  disabled?: boolean;
  hasIcon?: boolean;
  hasDot?: boolean;
};

export const getChipStyles = ({
  tokens,
  variant = 'text',
  size = 'medium',
  disabled = false,
  hasIcon = false,
  hasDot = false,
}: ChipStyleParams): CSSObject => {
  const sizeToken = tokens.sizes[size];
  const variantToken = tokens.variants[variant];
  const colors = disabled ? tokens.disabled : variantToken;

  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: sizeToken.gap,
    height: sizeToken.height,
    padding: `0 ${sizeToken.paddingX}px`,
    borderRadius: sizeToken.borderRadius,
    backgroundColor: colors.bg,
    color: colors.text,
    fontSize: sizeToken.fontSize,
    fontWeight: sizeToken.fontWeight,
    lineHeight: 1,
    cursor: disabled ? 'not-allowed' : 'default',
    '& .Chip-icon': {
      width: sizeToken.iconContainer,
      height: sizeToken.iconContainer,
      borderRadius: '50%',
      backgroundColor: colors.iconBg,
      color: colors.iconColor,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: sizeToken.iconSize,
    },
    '& .Chip-dot': {
      width: sizeToken.dotSize,
      height: sizeToken.dotSize,
      borderRadius: '50%',
      backgroundColor: colors.iconBg,
      flexShrink: 0,
    },
    '& .Chip-label': {
      display: 'inline-flex',
      alignItems: 'center',
    },
    ...(hasIcon || hasDot
      ? {}
      : {
          paddingLeft: sizeToken.paddingX,
        }),
  };
};
