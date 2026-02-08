import type { ButtonProps as MuiButtonProps } from '@mui/material/Button';
import type { CSSObject, Theme } from '@mui/material/styles';
import { buildLayoutStyles } from '@/components/utils/layoutStyles';

export const customVariants = [
  'elevated',
  'tagContained',
  'tagText',
  'iconGradient',
] as const;

export type CustomVariant = (typeof customVariants)[number];
export type ButtonVariant = MuiButtonProps['variant'] | CustomVariant;
export type VariantKey = Exclude<ButtonVariant, undefined>;

export const isCustomVariant = (value: ButtonVariant): value is CustomVariant =>
  customVariants.includes(value as CustomVariant);

type ButtonTokens = Theme['palette']['buttonTokens'];
type VariantStyleParams = {
  variant?: MuiButtonProps['variant'];
  customVariant?: CustomVariant;
  tokens: ButtonTokens;
  size?: MuiButtonProps['size'];
};

export const getButtonVariantStyles = ({
  variant = 'contained',
  customVariant,
  tokens,
  size = 'medium',
}: VariantStyleParams): CSSObject => {
  if (!tokens) return {};

  const baseStyles: CSSObject = {
    boxShadow: 'none',
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
    "&[data-loading='true'], &[data-loading='true']:hover": {
      cursor: 'progress',
    },
  });

  const resolveLayout = (layout: ButtonTokens[keyof ButtonTokens]) => {
    const { sizes, ...base } = layout;
    const sizeOverride = sizes?.[size] ?? {};
    return buildLayoutStyles({ ...base, ...sizeOverride });
  };

  const variantStyles: Record<VariantKey, () => CSSObject> = {
    contained: () => {
      const contained = tokens.contained;
      const layoutStyles = resolveLayout(contained);
      return {
        ...baseStyles,
        ...layoutStyles,
        ...resolveBackground(contained.bg),
        color: contained.text,
        ...withInteraction(
          {
            ...resolveBackground(contained.hoverBg),
            boxShadow: baseStyles.boxShadow,
          },
          {
            ...resolveBackground(contained.pressedBg),
            boxShadow: baseStyles.boxShadow,
          },
        ),
        ...withDisabled({
          backgroundImage: 'none',
          backgroundColor: contained.disabledBg,
          color: contained.disabledText,
          boxShadow: 'none',
        }),
      };
    },
    outlined: () => {
      const outlined = tokens.outlined;
      const layoutStyles = resolveLayout(outlined);
      return {
        ...baseStyles,
        ...layoutStyles,
        color: outlined.text,
        border: `1px solid ${outlined.border}`,
        backgroundColor: outlined.bg,
        ...withInteraction(
          {
            backgroundColor: outlined.hoverBg,
            borderColor: outlined.border,
            color: outlined.text,
          },
          {
            backgroundColor: outlined.pressedBg,
            borderColor: outlined.border,
            color: outlined.text,
          },
        ),
        ...withDisabled({
          color: outlined.disabledText,
          borderColor: outlined.disabledBorder,
        }),
      };
    },
    text: () => {
      const text = tokens.text;
      const layoutStyles = resolveLayout(text);
      return {
        ...baseStyles,
        ...layoutStyles,
        color: text.text,
        backgroundColor: 'transparent',
        ...withInteraction(
          {
            backgroundColor: text.hoverBg,
            color: text.text,
          },
          {
            backgroundColor: text.pressedBg,
            color: text.text,
          },
        ),
        ...withDisabled({
          color: text.disabledText,
        }),
      };
    },
    elevated: () => {
      const elevated = tokens.elevated;
      const layoutStyles = resolveLayout(elevated);
      return {
        ...layoutStyles,
        boxShadow: elevated.boxShadow,
        ...resolveBackground(elevated.bg),
        color: elevated.text,
        ...withInteraction(
          {
            ...resolveBackground(elevated.hoverBg),
            boxShadow: elevated.boxShadow,
          },
          {
            ...resolveBackground(elevated.pressedBg),
            boxShadow: elevated.boxShadow,
          },
        ),
        ...withDisabled({
          backgroundImage: 'none',
          backgroundColor: elevated.disabledBg,
          color: elevated.disabledText,
          boxShadow: 'none',
        }),
      };
    },
    tagContained: () => {
      const tagContained = tokens.tagContained;
      const layoutStyles = resolveLayout(tagContained);
      return {
        ...baseStyles,
        ...layoutStyles,
        ...resolveBackground(tagContained.bg),
        color: tagContained.text,
        ...withInteraction(
          {
            ...resolveBackground(tagContained.hoverBg),
            boxShadow: 'none',
          },
          {
            ...resolveBackground(tagContained.pressedBg),
            boxShadow: 'none',
          },
        ),
        ...withDisabled({
          backgroundImage: 'none',
          backgroundColor: tagContained.disabledBg,
          color: tagContained.disabledText,
        }),
      };
    },
    tagText: () => {
      const tagText = tokens.tagText;
      const layoutStyles = resolveLayout(tagText);
      return {
        ...baseStyles,
        ...layoutStyles,
        color: tagText.text,
        backgroundColor: 'transparent',
        ...withInteraction(
          {
            backgroundColor: tagText.hoverBg,
            color: tagText.text,
            boxShadow: 'none',
          },
          {
            backgroundColor: tagText.pressedBg,
            color: tagText.text,
            boxShadow: 'none',
          },
        ),
        ...withDisabled({
          color: tagText.disabledText,
        }),
      };
    },
    iconGradient: () => {
      const iconGradient = tokens.iconGradient;
      const layoutStyles = resolveLayout(iconGradient);
      const startIconStyles = (layoutStyles['& .MuiButton-startIcon'] ??
        {}) as CSSObject;
      const endIconStyles = (layoutStyles['& .MuiButton-endIcon'] ??
        {}) as CSSObject;
      return {
        ...layoutStyles,
        boxShadow: iconGradient.boxShadow,
        ...resolveBackground(iconGradient.bg),
        color: 'inherit',
        '& .MuiButton-startIcon': {
          ...startIconStyles,
          color: iconGradient.iconColor,
        },
        '& .MuiButton-endIcon': {
          ...endIconStyles,
          color: iconGradient.iconColor,
        },
        '& .MuiButton-startIcon svg, & .MuiButton-endIcon svg': {
          color: iconGradient.iconColor,
        },
        ...withInteraction(
          {
            ...resolveBackground(iconGradient.hoverBg),
            boxShadow: 'none',
          },
          {
            ...resolveBackground(iconGradient.pressedBg),
          },
        ),
        ...withDisabled({
          ...resolveBackground(iconGradient.disabledBg),
          boxShadow: iconGradient.disableBoxShadow,
        }),
      };
    },
  };

  const resolvedKey: VariantKey =
    customVariant === 'tagText' ? 'text' : (customVariant ?? variant);
  const resolveVariant = variantStyles[resolvedKey] ?? variantStyles.contained;
  return resolveVariant();
};
