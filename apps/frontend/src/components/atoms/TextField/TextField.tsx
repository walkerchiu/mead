import MuiTextField, {
  TextFieldProps as MuiTextFieldProps,
} from '@mui/material/TextField';
import { forwardRef } from 'react';

/**
 * TextField 組件 - Atomic Design: Atom
 *
 * 基於 MUI TextField 的封裝，提供統一的輸入框樣式。
 * 支援各種輸入類型、錯誤狀態、輔助文字等。
 *
 * @example
 * ```tsx
 * <TextField
 *   label="Email"
 *   type="email"
 *   placeholder="user@example.com"
 *   helperText="請輸入您的電子郵件地址"
 * />
 *
 * <TextField
 *   label="密碼"
 *   type="password"
 *   error
 *   helperText="密碼長度至少 8 個字元"
 * />
 * ```
 */

export interface TextFieldProps extends Omit<MuiTextFieldProps, 'variant'> {
  /**
   * 輸入框變體
   * @default 'outlined'
   */
  variant?: 'outlined' | 'filled' | 'standard';
}

/**
 * TextField 組件
 *
 * 使用 forwardRef 以支援 ref 轉發，
 * 這對於表單驗證庫（如 react-hook-form）很重要
 */
export const TextField = forwardRef<HTMLDivElement, TextFieldProps>(
  function TextField(
    { variant = 'outlined', size = 'small', fullWidth = true, ...props },
    ref,
  ) {
    return (
      <MuiTextField
        ref={ref}
        variant={variant}
        size={size}
        fullWidth={fullWidth}
        {...props}
      />
    );
  },
);

export default TextField;
