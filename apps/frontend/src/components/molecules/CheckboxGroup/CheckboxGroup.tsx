import { forwardRef } from 'react';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import FormHelperText from '@mui/material/FormHelperText';
import { FieldError } from 'react-hook-form';

/**
 * CheckboxGroup 組件 - Atomic Design: Molecule
 *
 * 複選框組,與 react-hook-form 完美整合。
 *
 * @example
 * ```tsx
 * // 基本用法
 * <CheckboxGroup
 *   label="興趣"
 *   options={[
 *     { value: 'reading', label: '閱讀' },
 *     { value: 'music', label: '音樂' },
 *   ]}
 *   value={['reading']}
 *   onChange={(values) => console.log(values)}
 *   error={errors.interests}
 * />
 *
 * // 橫向排列
 * <CheckboxGroup
 *   label="功能"
 *   row
 *   options={[
 *     { value: 'notifications', label: '通知' },
 *     { value: 'marketing', label: '行銷資訊' },
 *   ]}
 * />
 * ```
 */

export interface CheckboxOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  description?: string;
}

export interface CheckboxGroupProps {
  /**
   * 組件標籤
   */
  label?: string;

  /**
   * 選項列表
   */
  options: CheckboxOption[];

  /**
   * 當前選中的值列表
   */
  value?: (string | number)[];

  /**
   * 值變更時的回調
   */
  onChange?: (values: (string | number)[]) => void;

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
   * 是否橫向排列
   */
  row?: boolean;

  /**
   * 組件名稱（用於 form）
   */
  name?: string;
}

/**
 * CheckboxGroup 組件
 */
export const CheckboxGroup = forwardRef<
  HTMLFieldSetElement,
  CheckboxGroupProps
>(function CheckboxGroup(
  {
    label,
    options,
    value = [],
    onChange,
    error,
    helperText,
    required = false,
    disabled = false,
    row = false,
    name,
    ...props
  },
  ref,
) {
  // 處理錯誤訊息
  const errorMessage = typeof error === 'string' ? error : error?.message;
  const hasError = Boolean(errorMessage);

  // 處理單個選項的勾選/取消
  const handleChange = (optionValue: string | number, checked: boolean) => {
    if (!onChange) return;

    const currentValues = value || [];
    const newValues = checked
      ? [...currentValues, optionValue]
      : currentValues.filter((v) => v !== optionValue);

    onChange(newValues);
  };

  return (
    <FormControl
      error={hasError}
      required={required}
      disabled={disabled}
      component="fieldset"
      ref={ref}
      {...props}
    >
      {label && <FormLabel component="legend">{label}</FormLabel>}
      <FormGroup row={row}>
        {options.map((option) => {
          const isChecked = (value || []).includes(option.value);
          return (
            <FormControlLabel
              key={option.value}
              control={
                <Checkbox
                  checked={isChecked}
                  onChange={(e) => handleChange(option.value, e.target.checked)}
                  name={name}
                />
              }
              label={
                option.description ? (
                  <div>
                    <div>{option.label}</div>
                    <div style={{ fontSize: '0.875rem', color: '#666' }}>
                      {option.description}
                    </div>
                  </div>
                ) : (
                  option.label
                )
              }
              disabled={option.disabled || disabled}
            />
          );
        })}
      </FormGroup>
      {(errorMessage || helperText) && (
        <FormHelperText>{errorMessage || helperText}</FormHelperText>
      )}
    </FormControl>
  );
});

export default CheckboxGroup;
