import { forwardRef } from 'react';
import MuiSlider from '@mui/material/Slider';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import FormHelperText from '@mui/material/FormHelperText';
import { FieldError } from 'react-hook-form';

/**
 * Slider 組件 - Atomic Design: Atom
 *
 * 滑桿控制項，與 react-hook-form 完美整合。
 *
 * @example
 * ```tsx
 * // 基本用法
 * <Slider
 *   label="音量"
 *   value={volume}
 *   onChange={(e, value) => setVolume(value)}
 *   min={0}
 *   max={100}
 * />
 *
 * // 帶刻度標記
 * <Slider
 *   label="優先級"
 *   marks={[
 *     { value: 0, label: '低' },
 *     { value: 50, label: '中' },
 *     { value: 100, label: '高' },
 *   ]}
 * />
 *
 * // 範圍選擇
 * <Slider
 *   label="價格範圍"
 *   value={[20, 80]}
 *   valueLabelDisplay="auto"
 * />
 * ```
 */

export interface SliderMark {
  value: number;
  label?: string;
}

export interface SliderProps {
  /**
   * 組件標籤
   */
  label?: string;

  /**
   * 當前值（單一值或範圍）
   */
  value?: number | number[];

  /**
   * 預設值
   */
  defaultValue?: number | number[];

  /**
   * 值變更時的回調
   */
  onChange?: (event: Event, value: number | number[]) => void;

  /**
   * 最小值
   */
  min?: number;

  /**
   * 最大值
   */
  max?: number;

  /**
   * 步長
   */
  step?: number;

  /**
   * 刻度標記
   */
  marks?: boolean | SliderMark[];

  /**
   * 值標籤顯示方式
   */
  valueLabelDisplay?: 'auto' | 'on' | 'off';

  /**
   * 值標籤格式化函數
   */
  valueLabelFormat?: (value: number) => string;

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
  color?: 'primary' | 'secondary';

  /**
   * 方向
   */
  orientation?: 'horizontal' | 'vertical';
}

/**
 * Slider 組件
 */
export const Slider = forwardRef<HTMLSpanElement, SliderProps>(function Slider(
  {
    label,
    value,
    defaultValue,
    onChange,
    min = 0,
    max = 100,
    step = 1,
    marks = false,
    valueLabelDisplay = 'auto',
    valueLabelFormat,
    error,
    helperText,
    required = false,
    disabled = false,
    name,
    size = 'medium',
    color = 'primary',
    orientation = 'horizontal',
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
      fullWidth
      sx={{ px: orientation === 'horizontal' ? 1 : 0 }}
    >
      {label && <FormLabel>{label}</FormLabel>}
      <MuiSlider
        ref={ref}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        min={min}
        max={max}
        step={step}
        marks={marks}
        valueLabelDisplay={valueLabelDisplay}
        valueLabelFormat={valueLabelFormat}
        disabled={disabled}
        size={size}
        color={color}
        orientation={orientation}
        name={name}
        {...props}
      />
      {(errorMessage || helperText) && (
        <FormHelperText>{errorMessage || helperText}</FormHelperText>
      )}
    </FormControl>
  );
});

export default Slider;
