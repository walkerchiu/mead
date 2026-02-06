import { forwardRef } from 'react';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import MuiRadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import FormHelperText from '@mui/material/FormHelperText';
import { FieldError } from 'react-hook-form';

/**
 * RadioGroup 組件 - Atomic Design: Molecule
 *
 * 單選按鈕組，與 react-hook-form 完美整合。
 *
 * @example
 * ```tsx
 * // 基本用法
 * <RadioGroup
 *   label="性別"
 *   options={[
 *     { value: 'male', label: '男性' },
 *     { value: 'female', label: '女性' },
 *   ]}
 *   {...register('gender')}
 *   error={errors.gender}
 * />
 *
 * // 橫向排列
 * <RadioGroup
 *   label="訂閱方案"
 *   row
 *   options={[
 *     { value: 'monthly', label: '月付' },
 *     { value: 'yearly', label: '年付' },
 *   ]}
 * />
 * ```
 */

export interface RadioOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  description?: string;
}

export interface RadioGroupProps {
  /**
   * 組件標籤
   */
  label?: string;

  /**
   * 選項列表
   */
  options: RadioOption[];

  /**
   * 當前選中的值
   */
  value?: string | number;

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
   * 是否橫向排列
   */
  row?: boolean;

  /**
   * 組件名稱（用於 form）
   */
  name?: string;
}

/**
 * RadioGroup 組件
 */
export const RadioGroup = forwardRef<HTMLFieldSetElement, RadioGroupProps>(
  function RadioGroup(
    {
      label,
      options,
      value,
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
        <MuiRadioGroup
          value={value ?? ''}
          onChange={onChange}
          name={name}
          row={row}
        >
          {options.map((option) => (
            <FormControlLabel
              key={option.value}
              value={option.value}
              control={<Radio />}
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
          ))}
        </MuiRadioGroup>
        {(errorMessage || helperText) && (
          <FormHelperText>{errorMessage || helperText}</FormHelperText>
        )}
      </FormControl>
    );
  },
);

export default RadioGroup;
