import { forwardRef } from 'react';
import MuiSwitch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import { FieldError } from 'react-hook-form';

/**
 * Switch 組件 - Atomic Design: Atom
 *
 * 開關控制項，與 react-hook-form 完美整合。
 *
 * @example
 * ```tsx
 * // 基本用法
 * <Switch
 *   label="啟用通知"
 *   checked={enabled}
 *   onChange={(e) => setEnabled(e.target.checked)}
 * />
 *
 * // 與 react-hook-form 整合
 * <Switch
 *   {...register('notifications')}
 *   label="接收電子郵件通知"
 *   error={errors.notifications}
 * />
 *
 * // 禁用狀態
 * <Switch
 *   label="維護模式"
 *   disabled
 *   helperText="需要管理員權限才能修改"
 * />
 * ```
 */

export interface SwitchProps {
  /**
   * 組件標籤
   */
  label?: string;

  /**
   * 是否選中
   */
  checked?: boolean;

  /**
   * 值變更時的回調
   */
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;

  /**
   * 欄位錯誤（來自 react-hook-form）
   */
  error?: FieldError | string;

  /**
   * 輔助文字（非錯誤狀態時顯示）
   */
  helperText?: string;

  /**
   * 是否必填
   */
  required?: boolean;

  /**
   * 是否禁用
   */
  disabled?: boolean;

  /**
   * 組件名稱（用於 form）
   */
  name?: string;

  /**
   * 組件大小
   */
  size?: 'small' | 'medium';

  /**
   * 組件顏色
   */
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';

  /**
   * 標籤位置
   */
  labelPlacement?: 'start' | 'end' | 'top' | 'bottom';
}

/**
 * Switch 組件
 */
export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  function Switch(
    {
      label,
      checked = false,
      onChange,
      error,
      helperText,
      required = false,
      disabled = false,
      name,
      size = 'medium',
      color = 'primary',
      labelPlacement = 'end',
      ...props
    },
    ref,
  ) {
    // 處理錯誤訊息
    const errorMessage = typeof error === 'string' ? error : error?.message;
    const hasError = Boolean(errorMessage);

    const switchControl = (
      <MuiSwitch
        checked={checked}
        onChange={onChange}
        name={name}
        disabled={disabled}
        size={size}
        color={color}
        inputRef={ref}
        {...props}
      />
    );

    if (!label) {
      return switchControl;
    }

    return (
      <FormControl error={hasError} required={required} disabled={disabled}>
        <FormControlLabel
          control={switchControl}
          label={label}
          labelPlacement={labelPlacement}
        />
        {(errorMessage || helperText) && (
          <FormHelperText>{errorMessage || helperText}</FormHelperText>
        )}
      </FormControl>
    );
  },
);

export default Switch;
