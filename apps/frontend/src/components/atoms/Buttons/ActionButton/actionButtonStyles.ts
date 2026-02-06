import type { CSSObject, Theme } from '@mui/material/styles';
import { buildLayoutStyles } from '@/components/utils/layoutStyles';

export const actionButtonVariants = ['default', 'standard', 'outline'] as const;

export type ActionButtonVariant = (typeof actionButtonVariants)[number];
export type ActionButtonShape = 'circle' | 'pill';
export type ActionButtonSize = 'sm' | 'lg';

type ActionButtonTokens = Theme['palette']['actionButtonTokens'];

type VariantStyleParams = {
  variant?: ActionButtonVariant;
  tokens: ActionButtonTokens;
  iconColor?: string;
  shape?: ActionButtonShape;
  size?: ActionButtonSize;
};

export const getActionButtonVariantStyles = ({
  variant = 'default',
  tokens,
  iconColor,
  shape = 'circle',
  size = 'sm',
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

  const variantStyles: Record<ActionButtonVariant, () => CSSObject> = {
    default: () => {
      const token =
        shape === 'pill'
          ? size === 'lg'
            ? tokens.defaultPill
            : tokens.defaultPillSm
          : tokens.default;
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
    standard: () => {
      const token =
        shape === 'pill'
          ? size === 'lg'
            ? tokens.standardPill
            : tokens.standardPillSm
          : tokens.standard;
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
      const token =
        shape === 'pill'
          ? size === 'lg'
            ? tokens.outlinePill
            : tokens.outlinePillSm
          : tokens.outline;
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
          backgroundColor: token.disabledBg,
          color: token.disabledIcon,
        }),
      };
    },
  };

  return variantStyles[variant]();
};
