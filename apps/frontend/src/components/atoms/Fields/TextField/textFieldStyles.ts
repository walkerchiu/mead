import type { CSSObject, Theme } from '@mui/material/styles';

export type TextFieldSize = 'small' | 'medium' | 'large';

type TextFieldTokens = Theme['palette']['textFieldTokens'];

type TextFieldStyleParams = {
  size?: TextFieldSize;
  tokens: TextFieldTokens;
};

export const getTextFieldStyles = ({
  size = 'medium',
  tokens,
}: TextFieldStyleParams): CSSObject => {
  const sizeToken = tokens.sizes[size];
  const colors = tokens.colors;

  return {
    '& .MuiFormLabel-root': {
      color: colors.label,
      fontSize: sizeToken.labelFontSize,
    },
    '& .MuiInputLabel-shrink': {
      position: 'absolute',
      top: 0,
      left: sizeToken.paddingX - 4,
      transform: 'translate(0, -50%) !important',
      padding: '0 4px',
      backgroundColor: colors.bg,
      lineHeight: 1,
      zIndex: 1,
      pointerEvents: 'none',
      maxWidth: 'calc(100% - 24px)',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    '& .MuiFormLabel-root.Mui-focused': {
      color: colors.focusLabel,
    },
    '& .MuiFormLabel-root.Mui-error': {
      color: colors.errorLabel,
    },
    '& .MuiInputLabel-shrink.Mui-error': {
      backgroundColor: colors.bg,
    },
    '& .MuiFormLabel-root.Mui-disabled': {
      color: colors.disabledLabel,
    },
    '& .MuiInputLabel-shrink.Mui-disabled': {
      backgroundColor: colors.bg,
    },
    '& .MuiFormHelperText-root': {
      marginLeft: 0,
      marginRight: 0,
      color: colors.helper,
    },
    '& .MuiFormHelperText-root.Mui-error': {
      color: colors.errorText,
    },
    '& .MuiInputBase-root': {
      height: sizeToken.height,
      minHeight: sizeToken.height,
      borderRadius: sizeToken.borderRadius,
      padding: 0,
      backgroundColor: colors.bg,
      color: colors.text,
      transition: 'border-color 160ms ease, background-color 160ms ease',
    },
    '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: colors.hoverBorder,
    },
    '& .MuiOutlinedInput-root:hover': {
      backgroundColor: colors.hoverBg,
    },
    '& .MuiOutlinedInput-root.Mui-focused': {
      backgroundColor: colors.focusBg,
    },
    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: colors.focusBorder,
      borderWidth: 1,
    },
    '& .MuiOutlinedInput-input': {
      boxSizing: 'border-box',
      fontSize: sizeToken.fontSize,
    },
    '&.hide-number-spinner .MuiOutlinedInput-input[type=number]': {
      MozAppearance: 'textfield',
    },
    '&.hide-number-spinner .MuiOutlinedInput-input[type=number]::-webkit-outer-spin-button, &.hide-number-spinner .MuiOutlinedInput-input[type=number]::-webkit-inner-spin-button':
      {
        WebkitAppearance: 'none',
        margin: 0,
      },
    '& .MuiOutlinedInput-input:not(.MuiOutlinedInput-inputMultiline)': {
      padding: `0 ${sizeToken.paddingX}px`,
      height: '100%',
    },
    '& .MuiOutlinedInput-inputMultiline': {
      padding: `${Math.max(sizeToken.paddingX - 4, 8)}px ${sizeToken.paddingX}px`,
      height: 'auto',
    },
    // Select specific styles
    '& .MuiSelect-select': {
      padding: `0 ${sizeToken.paddingX}px !important`,
      paddingRight: `${sizeToken.paddingX + 34}px !important`,
      height: '100%',
      minHeight: 'unset !important',
      display: 'flex',
      alignItems: 'center',
      boxSizing: 'border-box',
    },
    '& .MuiSelect-icon': {
      right: `${sizeToken.paddingX}px`,
    },
    '& .MuiInputBase-root.Mui-multiline': {
      height: 'auto',
      minHeight: sizeToken.height,
      alignItems: 'flex-start',
      padding: 0,
    },
    '& .MuiInputAdornment-root': {
      color: colors.text,
      fontSize: sizeToken.fontSize,
      marginLeft: 0,
      marginRight: 0,
    },
    '& .MuiInputAdornment-positionStart': {
      marginRight: '8px',
    },
    '& .MuiInputAdornment-positionEnd': {
      marginLeft: '8px',
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: colors.border,
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: colors.hoverBorder,
    },
    '&:hover .MuiInputBase-root': {
      backgroundColor: colors.hoverBg,
    },
    '& .MuiOutlinedInput-root:active .MuiOutlinedInput-notchedOutline': {
      borderColor: colors.pressedBorder,
    },
    '& .MuiInputBase-root.Mui-disabled': {
      backgroundColor: colors.disabledBg,
      color: colors.disabledText,
      cursor: 'not-allowed',
    },
    '& .MuiInputBase-root.Mui-disabled input': {
      cursor: 'not-allowed',
    },
    '& .MuiInputBase-root.Mui-disabled textarea': {
      cursor: 'not-allowed',
    },
    '& .MuiInputBase-root.Mui-disabled .MuiOutlinedInput-notchedOutline': {
      borderColor: colors.disabledBorder,
    },
    '& .MuiOutlinedInput-input:-webkit-autofill, & .MuiOutlinedInput-input:-webkit-autofill:hover, & .MuiOutlinedInput-input:-webkit-autofill:focus':
      {
        WebkitBoxShadow: `0 0 0 1000px ${colors.bg} inset !important`,
        WebkitTextFillColor: `${colors.text} !important`,
        caretColor: colors.text,
        borderRadius: 'inherit',
      },
    '& .MuiInputBase-input::placeholder': {
      color: colors.placeholder,
      opacity: 1,
    },
    '& .MuiInputBase-input.Mui-disabled::placeholder': {
      color: colors.disabledText,
    },
    '& .MuiInputBase-root.Mui-error': {
      backgroundColor: colors.errorBg,
    },
    '& .MuiInputBase-root.Mui-error .MuiOutlinedInput-notchedOutline': {
      borderColor: colors.errorBorder,
    },
    '&.preview-hover .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': {
      borderColor: colors.hoverBorder,
    },
    '&.preview-hover .MuiOutlinedInput-root': {
      backgroundColor: colors.hoverBg,
    },
    '&.preview-focus .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': {
      borderColor: colors.focusBorder,
    },
    '&.preview-focus .MuiOutlinedInput-root': {
      backgroundColor: colors.focusBg,
    },
    '&.preview-pressed .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline':
      {
        borderColor: colors.pressedBorder,
      },
  };
};
