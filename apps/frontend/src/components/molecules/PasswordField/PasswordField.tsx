import { useState, forwardRef } from 'react';
import { FieldError } from 'react-hook-form';
import { TextField, TextFieldProps } from '@/components/atoms';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import LinearProgress from '@mui/material/LinearProgress';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

/**
 * PasswordField 組件 - Atomic Design: Molecule
 *
 * 專為密碼輸入設計的組件，提供：
 * - 顯示/隱藏密碼切換
 * - 密碼強度指示器（可選）
 * - 密碼要求提示
 *
 * @example
 * ```tsx
 * <PasswordField
 *   label="密碼"
 *   showStrength
 *   helperText="至少 8 個字元，包含大小寫字母和數字"
 * />
 * ```
 */

export interface PasswordFieldProps extends Omit<
  TextFieldProps,
  'type' | 'error' | 'helperText'
> {
  /**
   * 是否顯示密碼強度指示器
   */
  showStrength?: boolean;

  /**
   * 欄位錯誤（來自 react-hook-form）
   * 可以是 FieldError 物件或字串或 boolean
   */
  error?: FieldError | string | boolean;

  /**
   * 輔助文字（非錯誤狀態時顯示）
   */
  helperText?: string;
}

/**
 * 計算密碼強度
 * 返回 0-100 的分數和描述
 */
function calculatePasswordStrength(password: string): {
  score: number;
  label: string;
  color: 'error' | 'warning' | 'info' | 'success';
} {
  if (!password) {
    return { score: 0, label: '', color: 'error' };
  }

  let score = 0;

  // 長度檢查
  if (password.length >= 8) score += 25;
  if (password.length >= 12) score += 10;
  if (password.length >= 16) score += 10;

  // 包含小寫字母
  if (/[a-z]/.test(password)) score += 15;

  // 包含大寫字母
  if (/[A-Z]/.test(password)) score += 15;

  // 包含數字
  if (/\d/.test(password)) score += 15;

  // 包含特殊字元
  if (/[^a-zA-Z\d]/.test(password)) score += 10;

  // 確定標籤和顏色
  if (score < 30) {
    return { score, label: '弱', color: 'error' };
  } else if (score < 60) {
    return { score, label: '中等', color: 'warning' };
  } else if (score < 80) {
    return { score, label: '強', color: 'info' };
  } else {
    return { score, label: '非常強', color: 'success' };
  }
}

/**
 * PasswordField 組件
 */
export const PasswordField = forwardRef<HTMLDivElement, PasswordFieldProps>(
  function PasswordField(
    { showStrength = false, value, onChange, error, helperText, ...props },
    ref,
  ) {
    const [showPassword, setShowPassword] = useState(false);
    const [internalValue, setInternalValue] = useState('');

    // 使用外部 value 或內部 state
    const currentValue = value !== undefined ? String(value) : internalValue;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInternalValue(newValue);
      onChange?.(e);
    };

    const handleClickShowPassword = () => {
      setShowPassword((show) => !show);
    };

    const handleMouseDownPassword = (
      event: React.MouseEvent<HTMLButtonElement>,
    ) => {
      event.preventDefault();
    };

    // 處理錯誤訊息
    const errorMessage =
      typeof error === 'object' && error !== null && 'message' in error
        ? (error as FieldError).message
        : typeof error === 'string'
          ? error
          : undefined;

    const hasError = Boolean(error);

    // 計算密碼強度
    const strength = showStrength
      ? calculatePasswordStrength(currentValue)
      : null;

    return (
      <Box>
        <TextField
          ref={ref}
          {...props}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={handleChange}
          error={hasError}
          helperText={errorMessage || helperText}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="切換密碼顯示"
                  onClick={handleClickShowPassword}
                  onMouseDown={handleMouseDownPassword}
                  edge="end"
                  size="small"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {showStrength && strength && currentValue && (
          <Box sx={{ mt: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LinearProgress
                variant="determinate"
                value={strength.score}
                color={strength.color}
                sx={{ flexGrow: 1, height: 6, borderRadius: 1 }}
              />
              <Typography
                variant="caption"
                color={`${strength.color}.main`}
                sx={{ minWidth: 60, textAlign: 'right', fontWeight: 600 }}
              >
                {strength.label}
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
    );
  },
);

export default PasswordField;
