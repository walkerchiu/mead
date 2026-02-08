import type { CSSObject, Theme } from '@mui/material/styles';

export type TextAreaSize = 'small' | 'medium' | 'large';

type TextFieldTokens = Theme['palette']['textFieldTokens'];

type TextAreaStyleParams = {
  size?: TextAreaSize;
  tokens: TextFieldTokens;
};

export const getTextAreaStyles = ({
  size = 'medium',
  tokens,
}: TextAreaStyleParams): CSSObject => {
  const sizeToken = tokens.sizes[size];
  const colors = tokens.colors;

  return {
    '& .MuiFormLabel-root': {
      color: colors.label,
      fontSize: sizeToken.labelFontSize,
    },
    '& .MuiInputLabel-root': {
      position: 'absolute',
      top: 0,
      left: sizeToken.paddingX - 4,
      transform: 'translate(0, -50%)',
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
    '& .MuiFormLabel-root.Mui-disabled': {
      color: colors.disabledLabel,
    },
    '& .MuiFormHelperText-root': {
      marginLeft: 0,
      marginRight: 0,
      color: colors.helper,
      marginTop: '6px',
    },
    '& .MuiFormHelperText-root.Mui-error': {
      color: colors.errorText,
    },
    '& .MuiInputBase-root': {
      height: 'auto',
      minHeight: sizeToken.height,
      borderRadius: '8px',
      padding: 0,
      backgroundColor: colors.bg,
      color: colors.text,
      alignItems: 'flex-start',
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
      padding: `${Math.max(sizeToken.paddingX - 4, 10)}px ${sizeToken.paddingX}px`,
      height: 'auto',
      overflow: 'auto',
      resize: 'vertical',
    },
    '& textarea.MuiOutlinedInput-input': {
      padding: `${Math.max(sizeToken.paddingX - 4, 10)}px ${sizeToken.paddingX}px`,
      minHeight: 'unset',
      lineHeight: 1.5,
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: colors.border,
      borderRadius: '8px',
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
    '& .MuiInputBase-root.Mui-disabled textarea': {
      cursor: 'not-allowed',
    },
    '& .MuiInputBase-root.Mui-disabled .MuiOutlinedInput-notchedOutline': {
      borderColor: colors.disabledBorder,
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
  };
};
