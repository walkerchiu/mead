import MuiTextField, {
  TextFieldProps as MuiTextFieldProps,
} from '@mui/material/TextField';
import { styled } from '@mui/material/styles';
import { forwardRef } from 'react';
import { getTextAreaStyles, type TextAreaSize } from './textAreaStyles';

export interface TextAreaProps extends Omit<
  MuiTextFieldProps,
  'variant' | 'size' | 'multiline'
> {
  /**
   * Textarea variant
   * @default 'outlined'
   */
  variant?: 'outlined';
  /**
   * Textarea size
   * @default 'medium'
   */
  size?: TextAreaSize;
  /**
   * Number of rows to display
   * @default 4
   */
  rows?: number;
  /**
   * Minimum number of rows (for auto-expanding)
   */
  minRows?: number;
  /**
   * Maximum number of rows (for auto-expanding)
   */
  maxRows?: number;
}

const StyledTextField = styled(MuiTextField, {
  shouldForwardProp: (prop) => prop !== 'textAreaSize',
})<
  MuiTextFieldProps & {
    textAreaSize?: TextAreaSize;
  }
>((props) => {
  const { theme } = props as { theme: typeof props.theme };
  const state = props as MuiTextFieldProps & { textAreaSize?: TextAreaSize };
  return getTextAreaStyles({
    size: state.textAreaSize ?? 'medium',
    tokens: theme.palette.textFieldTokens,
  });
});

/**
 * TextArea component for multiline text input
 *
 * Using forwardRef to support ref forwarding.
 */
export const TextArea = forwardRef<HTMLDivElement, TextAreaProps>(
  function TextArea(
    {
      variant = 'outlined',
      size = 'medium',
      fullWidth = true,
      rows = 4,
      ...props
    },
    ref,
  ) {
    return (
      <StyledTextField
        ref={ref}
        variant={variant}
        size={size === 'small' ? 'small' : 'medium'}
        textAreaSize={size}
        fullWidth={fullWidth}
        multiline
        rows={rows}
        {...props}
      />
    );
  },
);

export default TextArea;
