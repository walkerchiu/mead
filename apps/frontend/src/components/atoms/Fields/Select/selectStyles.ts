import type { CSSObject, Theme } from '@mui/material/styles';

export type SelectSize = 'small' | 'medium' | 'large';

type SelectTokens = Theme['palette']['selectTokens'];

type SelectStyleParams = {
  size?: SelectSize;
  tokens: SelectTokens;
};

export const getSelectStyles = ({
  size = 'medium',
  tokens,
}: SelectStyleParams): CSSObject => {
  const sizeToken = tokens.sizes[size];
  const colors = tokens.colors;
  const labelOffset = sizeToken.paddingX - 4;

  return {
    '&.Mui-disabled': {
      cursor: 'not-allowed',
    },
    '& .MuiFormLabel-root': {
      color: colors.label,
      fontSize: sizeToken.labelFontSize,
      position: 'absolute',
      top: 0,
      left: labelOffset,
      transform: 'translate(0, -50%)',
      padding: '0 4px',
      backgroundColor: colors.bg,
      lineHeight: 1.2,
      zIndex: 1,
      pointerEvents: 'none',
    },
    '& .MuiFormLabel-root.Mui-focused': {
      color: colors.focusLabel,
    },
    '& .MuiFormLabel-root.Mui-error': {
      color: colors.errorLabel,
      backgroundColor: 'transparent',
    },
    '& .MuiFormLabel-root.Mui-disabled': {
      color: colors.disabledText,
      backgroundColor: 'transparent',
    },
    '& .MuiOutlinedInput-root': {
      height: sizeToken.height,
      borderRadius: sizeToken.borderRadius,
      backgroundColor: colors.bg,
      color: colors.text,
      transition: 'border-color 160ms ease, background-color 160ms ease',
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: colors.border,
      },
      '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: colors.hoverBorder,
      },
      '&.Mui-focused': {
        backgroundColor: colors.focusBg,
      },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: colors.focusBorder,
      },
      '&.Mui-error .MuiOutlinedInput-notchedOutline': {
        borderColor: colors.errorBorder,
      },
      '&.Mui-error .MuiSelect-select': {
        color: colors.errorText,
      },
      '&.Mui-disabled, &.Mui-disabled:hover': {
        backgroundColor: colors.disabledBg,
        color: colors.disabledText,
        cursor: 'not-allowed',
        pointerEvents: 'auto',
      },
      '&.Mui-disabled .MuiSelect-select, &.Mui-disabled:hover .MuiSelect-select':
        {
          color: colors.disabledText,
          cursor: 'not-allowed',
        },
      '&.Mui-disabled .MuiSelect-icon, &.Mui-disabled:hover .MuiSelect-icon': {
        color: colors.disabledIcon,
        cursor: 'not-allowed',
      },
      '&.Mui-disabled .MuiOutlinedInput-notchedOutline': {
        borderColor: colors.disabledBorder,
      },
      '&.Mui-disabled:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: colors.disabledBorder,
      },
    },
    '& .MuiSelect-select': {
      boxSizing: 'border-box',
      display: 'flex',
      alignItems: 'center',
      minHeight: 'unset !important',
      paddingLeft: `${sizeToken.paddingX}px !important`,
      paddingRight: `${sizeToken.paddingX + 34}px !important`,
      fontSize: sizeToken.fontSize,
      color: 'inherit',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    '& .MuiSelect-icon': {
      right: sizeToken.paddingX - 2,
      color: colors.icon,
      fontSize: 20,
      transition: 'transform 150ms ease, color 150ms ease',
    },
    '& .MuiSelect-iconOpen': {
      transform: 'rotate(180deg)',
    },
    '& .Select-placeholder': {
      color: colors.placeholder,
    },
    '& .MuiFormHelperText-root': {
      marginLeft: 0,
      marginRight: 0,
      marginTop: '6px',
      color: colors.helper,
      fontSize: '0.75rem',
    },
    '& .MuiFormHelperText-root.Mui-error': {
      color: colors.errorText,
    },
    '&.Mui-disabled .MuiFormLabel-root, &.Mui-disabled:hover .MuiFormLabel-root':
      {
        cursor: 'not-allowed',
      },
    '&.preview-hover .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': {
      borderColor: colors.hoverBorder,
    },
    '&.preview-focus .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': {
      borderColor: colors.focusBorder,
    },
    '&.preview-focus .MuiFormLabel-root': {
      color: colors.focusLabel,
      backgroundColor: colors.bg,
    },
    '&.preview-focus .MuiSelect-icon': {
      transform: 'rotate(180deg)',
    },
    '&.preview-pressed .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline':
      {
        borderColor: colors.pressedBorder,
      },
    '&.preview-pressed .MuiFormLabel-root': {
      color: colors.focusLabel,
      backgroundColor: colors.bg,
    },
    '&.preview-pressed .MuiSelect-icon': {
      transform: 'rotate(180deg)',
    },
  };
};
