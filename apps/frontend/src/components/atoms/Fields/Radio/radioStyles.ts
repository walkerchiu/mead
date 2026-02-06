import { alpha, type CSSObject, type Theme } from '@mui/material/styles';

export type RadioSize = 'small' | 'medium' | 'large';

type RadioTokens = Theme['palette']['radioTokens'];

type RadioStyleParams = {
  size?: RadioSize;
  tokens: RadioTokens;
  color?: string;
};

type RadioStateVars = {
  border: string;
  bg: string;
  dotColor: string;
};

const isValidColor = (value?: string) => {
  if (!value) return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (typeof CSS !== 'undefined' && CSS.supports) {
    return CSS.supports('color', trimmed);
  }
  return /^#([0-9a-fA-F]{3,8})$/.test(trimmed);
};

const applyVars = (vars: RadioStateVars): CSSObject => ({
  '--radio-border': vars.border,
  '--radio-bg': vars.bg,
  '--radio-dot-color': vars.dotColor,
});

export const getRadioStyles = ({
  size = 'medium',
  tokens,
  color,
}: RadioStyleParams): CSSObject => {
  const sizeToken = tokens.sizes[size];
  const { unchecked, checked } = tokens.colors;
  const resolvedColor = isValidColor(color) ? color!.trim() : undefined;
  const checkedColors = resolvedColor
    ? {
        border: resolvedColor,
        bg: alpha(resolvedColor, 0.12),
        dot: resolvedColor,
        hoverBorder: resolvedColor,
        hoverBg: alpha(resolvedColor, 0.2),
        hoverDot: resolvedColor,
        pressedBorder: resolvedColor,
        pressedBg: alpha(resolvedColor, 0.32),
        pressedDot: resolvedColor,
        disabledBorder: checked.disabledBorder,
        disabledBg: checked.disabledBg,
        disabledDot: checked.disabledDot,
      }
    : checked;

  const baseUnchecked = applyVars({
    border: unchecked.border,
    bg: unchecked.bg,
    dotColor: 'transparent',
  });
  const baseChecked = applyVars({
    border: checkedColors.border,
    bg: checkedColors.bg,
    dotColor: checkedColors.dot,
  });
  const hoverUnchecked = applyVars({
    border: unchecked.hoverBorder,
    bg: unchecked.hoverBg,
    dotColor: 'transparent',
  });
  const hoverChecked = applyVars({
    border: checkedColors.hoverBorder,
    bg: checkedColors.hoverBg,
    dotColor: checkedColors.hoverDot,
  });
  const pressedUnchecked = applyVars({
    border: unchecked.pressedBorder,
    bg: unchecked.pressedBg,
    dotColor: 'transparent',
  });
  const pressedChecked = applyVars({
    border: checkedColors.pressedBorder,
    bg: checkedColors.pressedBg,
    dotColor: checkedColors.pressedDot,
  });
  const disabledUnchecked = applyVars({
    border: unchecked.disabledBorder,
    bg: unchecked.disabledBg,
    dotColor: 'transparent',
  });
  const disabledChecked = applyVars({
    border: checkedColors.disabledBorder,
    bg: checkedColors.disabledBg,
    dotColor: checkedColors.disabledDot,
  });

  return {
    '--radio-size': `${sizeToken.size}px`,
    '--radio-dot': `${sizeToken.dot}px`,
    '--radio-border-width': `${sizeToken.borderWidth}px`,
    ...baseUnchecked,
    padding: 0,
    margin: 0,
    cursor: 'pointer',
    '& .WindRadio-icon': {
      width: 'var(--radio-size)',
      height: 'var(--radio-size)',
      borderRadius: '50%',
      border: 'var(--radio-border-width) solid var(--radio-border)',
      backgroundColor: 'var(--radio-bg)',
      boxSizing: 'border-box',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      transition: 'background-color 160ms ease, border-color 160ms ease',
      '&::before': {
        content: '""',
        width: 'var(--radio-dot)',
        height: 'var(--radio-dot)',
        borderRadius: '50%',
        backgroundColor: 'var(--radio-dot-color)',
        transform: 'scale(0)',
        transition: 'transform 160ms ease, background-color 160ms ease',
      },
    },
    '&.Mui-checked': {
      ...baseChecked,
      '& .WindRadio-icon::before': {
        transform: 'scale(1)',
      },
    },
    '&:hover:not(.Mui-disabled)': {
      ...hoverUnchecked,
    },
    '&:hover:not(.Mui-disabled).Mui-checked': {
      ...hoverChecked,
    },
    '&:active:not(.Mui-disabled)': {
      ...pressedUnchecked,
    },
    '&:active:not(.Mui-disabled).Mui-checked': {
      ...pressedChecked,
    },
    '&.preview-hover': {
      ...hoverUnchecked,
    },
    '&.preview-hover.Mui-checked': {
      ...hoverChecked,
    },
    '&.preview-pressed': {
      ...pressedUnchecked,
    },
    '&.preview-pressed.Mui-checked': {
      ...pressedChecked,
    },
    '&.Mui-disabled': {
      cursor: 'not-allowed',
      pointerEvents: 'auto',
      ...disabledUnchecked,
    },
    '&.Mui-disabled.Mui-checked': {
      ...disabledChecked,
      '& .WindRadio-icon::before': {
        transform: 'scale(1)',
      },
    },
  };
};
