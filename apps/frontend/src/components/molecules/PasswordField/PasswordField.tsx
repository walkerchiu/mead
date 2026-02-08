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
 * PasswordField Component - Atomic Design: Molecule
 *
 * Component specifically designed for password input，provides：
 * - Show/hide password toggle
 * - Password strength indicator (optional)
 * - Password requirement hints
 *
 * @example
 * ```tsx
 * <PasswordField
 *   label="password"
 *   showStrength
 *   helperText="At least 8 characters, including uppercase and lowercase letters and numbers"
 * />
 * ```
 */

export interface PasswordFieldProps extends Omit<
  TextFieldProps,
  'type' | 'error' | 'helperText'
> {
  /**
   * Whether to show password strength indicator
   */
  showStrength?: boolean;

  /**
   * Field error（from react-hook-form）
   * can be FieldError object or string or boolean
   */
  error?: FieldError | string | boolean;

  /**
   * helper text（displayed in non-error state）
   */
  helperText?: string;
}

/**
 * calculate password strength
 * returns 0-100 score and description
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

  // length check
  if (password.length >= 8) score += 25;
  if (password.length >= 12) score += 10;
  if (password.length >= 16) score += 10;

  // contains lowercase letters
  if (/[a-z]/.test(password)) score += 15;

  // contains uppercase letters
  if (/[A-Z]/.test(password)) score += 15;

  // Contains digits
  if (/\d/.test(password)) score += 15;

  // contains special characters
  if (/[^a-zA-Z\d]/.test(password)) score += 10;

  // confirm label and color
  if (score < 30) {
    return { score, label: 'Weak', color: 'error' };
  } else if (score < 60) {
    return { score, label: 'medium level', color: 'warning' };
  } else if (score < 80) {
    return { score, label: 'strong', color: 'info' };
  } else {
    return { score, label: 'very strong', color: 'success' };
  }
}

/**
 * PasswordField component
 */
export const PasswordField = forwardRef<HTMLDivElement, PasswordFieldProps>(
  function PasswordField(
    { showStrength = false, value, onChange, error, helperText, ...props },
    ref,
  ) {
    const [showPassword, setShowPassword] = useState(false);
    const [internalValue, setInternalValue] = useState('');

    // use external value orinternal state
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

    // handleError message
    const errorMessage =
      typeof error === 'object' && error !== null && 'message' in error
        ? (error as FieldError).message
        : typeof error === 'string'
          ? error
          : undefined;

    const hasError = Boolean(error);

    // calculate password strength
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
          slotProps={{
            input: {
              sx: { paddingRight: '12px !important' },
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="togglepassworddisplay"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                    size="small"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            },
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
