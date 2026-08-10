import type { CSSObject, Theme } from '@mui/material/styles';
import { buildLayoutStyles } from '@/components/utils/layoutStyles';

export const iconButtonVariants = [
  'default',
  'tonal',
  'outline',
  'toggle',
] as const;

export type IconButtonVariant = (typeof iconButtonVariants)[number];

type IconButtonTokens = Theme['palette']['iconButtonTokens'];

type VariantStyleParams = {
  variant?: IconButtonVariant;
  tokens: IconButtonTokens;
  iconColor?: string;
};

export const getIconButtonVariantStyles = ({
  variant = 'default',
  tokens,
  iconColor,
}: VariantStyleParams): CSSObject => {
  const baseStyles: CSSObject = {
    padding: 0,
    display: 'inline-flex',
  };

  const resolveBackground = (value: string): CSSObject => {
    const normalized = value.trim().replace(/;$/, '');
    const isGradient = normalized.includes('gradient(');
    return isGradient
      ? { backgroundImage: normalized, backgroundColor: 'transparent' }
      : {
          backgroundImage: `linear-gradient(${normalized}, ${normalized})`,
          backgroundColor: normalized,
        };
  };

  const withInteraction = (
    hoverStyles: CSSObject,
    activeStyles: CSSObject,
  ): CSSObject => ({
    '&:hover:not(.Mui-disabled)': hoverStyles,
    '&:active:not(.Mui-disabled)': activeStyles,
  });

  const withDisabled = (styles: CSSObject): CSSObject => ({
    '&.Mui-disabled': {
      pointerEvents: 'auto',
      ...styles,
    },
    '&.Mui-disabled, &.Mui-disabled:hover': {
      cursor: 'not-allowed',
    },
  });

  const variantStyles: Record<IconButtonVariant, () => CSSObject> = {
    default: () => {
      const token = tokens.default;
      const layoutStyles = buildLayoutStyles(token);
      const resolvedIconColor = iconColor ?? token.icon;
      return {
        ...baseStyles,
        ...layoutStyles,
        ...resolveBackground(token.bg),
        color: resolvedIconColor,
        '& svg': { color: 'currentColor' },
        ...withInteraction(
          resolveBackground(token.hoverBg),
          resolveBackground(token.pressedBg),
        ),
        ...withDisabled({
          ...resolveBackground(token.disabledBg),
          color: token.disabledIcon,
        }),
      };
    },
    tonal: () => {
      const token = tokens.tonal;
      const layoutStyles = buildLayoutStyles(token);
      const resolvedIconColor = iconColor ?? token.icon;
      return {
        ...baseStyles,
        ...layoutStyles,
        ...resolveBackground(token.bg),
        color: resolvedIconColor,
        '& svg': { color: 'currentColor' },
        ...withInteraction(
          resolveBackground(token.hoverBg),
          resolveBackground(token.pressedBg),
        ),
        ...withDisabled({
          ...resolveBackground(token.disabledBg),
          color: token.disabledIcon,
        }),
      };
    },
    outline: () => {
      const token = tokens.outline;
      const layoutStyles = buildLayoutStyles(token);
      const resolvedIconColor = iconColor ?? token.icon;
      return {
        ...baseStyles,
        ...layoutStyles,
        border: `1px solid ${token.border}`,
        backgroundColor: token.bg,
        color: resolvedIconColor,
        '& svg': { color: 'currentColor' },
        ...withInteraction(
          {
            backgroundColor: token.hoverBg,
            borderColor: token.border,
          },
          {
            backgroundColor: token.pressedBg,
            borderColor: token.border,
          },
        ),
        ...withDisabled({
          borderColor: token.disabledBorder,
          color: token.disabledIcon,
        }),
      };
    },
    toggle: () => {
      const token = tokens.toggle;
      const layoutStyles = buildLayoutStyles(token);
      const resolvedIconColor = iconColor ?? token.icon;
      return {
        ...baseStyles,
        ...layoutStyles,
        border: `1px solid ${token.border}`,
        backgroundColor: token.bg,
        color: resolvedIconColor,
        '& svg': { color: 'currentColor' },
        ...withInteraction(
          {
            backgroundColor: token.hoverBg,
            borderColor: token.border,
          },
          {
            backgroundColor: token.pressedBg,
            borderColor: token.border,
          },
        ),
        ...withDisabled({
          borderColor: token.disabledBorder,
          color: token.disabledIcon,
        }),
      };
    },
  };

  return variantStyles[variant]();
};
