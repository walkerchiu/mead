import { TextField, TextFieldProps } from '@/components/atoms';
import { forwardRef, useState, useEffect } from 'react';
import { FieldError } from 'react-hook-form';
import { InputAdornment } from '@mui/material';

/**
 * FormField 組件 - Atomic Design: Molecule
 *
 * 結合 TextField 和錯誤處理的表單欄位組件。
 * 與 react-hook-form 完美集成，自動顯示驗證錯誤。
 *
 * @example
 * ```tsx
 * // 與 react-hook-form 使用
 * <FormField
 *   label="Email"
 *   {...register('email')}
 *   error={errors.email}
 * />
 *
 * // 帶單位
 * <FormField
 *   label="價格"
 *   startAdornment="$"
 *   endAdornment="USD"
 *   {...register('price')}
 * />
 *
 * // 帶圖示
 * <FormField
 *   label="搜尋"
 *   startAdornment={<SearchIcon />}
 *   {...register('search')}
 * />
 *
 * // 數字格式化（千分位）
 * <FormField
 *   label="金額"
 *   formatNumber
 *   startAdornment="$"
 *   {...register('amount')}
 * />
 *
 * // 自訂對齊方式
 * <FormField
 *   label="數量"
 *   textAlign="right"
 *   {...register('quantity')}
 * />
 * ```
 */

export interface FormFieldProps extends Omit<
  TextFieldProps,
  'error' | 'helperText'
> {
  /**
   * 欄位錯誤（來自 react-hook-form）
   * 可以是 FieldError 物件或字串
   */
  error?: FieldError | string;

  /**
   * 輔助文字（非錯誤狀態時顯示）
   */
  helperText?: string;

  /**
   * 欄位前綴（開始位置）
   * 可以是文字、圖示或自訂元件
   */
  startAdornment?: React.ReactNode;

  /**
   * 欄位後綴（結束位置）
   * 可以是文字、圖示或自訂元件
   */
  endAdornment?: React.ReactNode;

  /**
   * 文字對齊方式
   * - 'left': 靠左對齊（預設）
   * - 'right': 靠右對齊（數值欄位建議使用）
   * - 'center': 置中對齊
   * - 'auto': number 類型自動靠右，其他靠左
   */
  textAlign?: 'left' | 'right' | 'center' | 'auto';

  /**
   * 是否格式化數字（加入千分位符號）
   * 只適用於數值輸入
   * 注意：啟用此功能時，type 會自動改為 "text"
   */
  formatNumber?: boolean;

  /**
   * 數字格式化的語系（預設：'en-US'）
   * - 'en-US': 1,234,567.89
   * - 'zh-TW': 1,234,567.89
   * - 'de-DE': 1.234.567,89
   */
  numberLocale?: string;

  /**
   * 小數位數（預設：undefined，不限制）
   */
  decimalPlaces?: number;
}

/**
 * FormField 組件
 *
 * 處理 react-hook-form 的 error 物件，
 * 自動提取錯誤訊息並顯示
 */
export const FormField = forwardRef<HTMLDivElement, FormFieldProps>(
  function FormField(
    {
      error,
      helperText,
      startAdornment,
      endAdornment,
      textAlign = 'auto',
      formatNumber = false,
      numberLocale = 'en-US',
      decimalPlaces,
      onChange,
      value,
      defaultValue,
      ...props
    },
    ref,
  ) {
    // 處理錯誤訊息
    const errorMessage = typeof error === 'string' ? error : error?.message;
    const hasError = Boolean(errorMessage);

    // 數字格式化狀態
    const [displayValue, setDisplayValue] = useState<string>('');
    const [isFocused, setIsFocused] = useState(false);

    // 格式化數字的輔助函數
    const formatNumberValue = (num: number | string): string => {
      if (num === '' || num === null || num === undefined) return '';

      const numValue =
        typeof num === 'string' ? parseFloat(num.replace(/,/g, '')) : num;
      if (isNaN(numValue)) return '';

      const formatter = new Intl.NumberFormat(numberLocale, {
        minimumFractionDigits: decimalPlaces,
        maximumFractionDigits: decimalPlaces ?? 20,
      });

      return formatter.format(numValue);
    };

    // 解析格式化的數字字串
    const parseFormattedNumber = (formatted: string): string => {
      // 移除千分位符號，保留小數點和負號
      return formatted.replace(/[^\d.-]/g, '');
    };

    // 初始化顯示值
    useEffect(() => {
      if (formatNumber && (value !== undefined || defaultValue !== undefined)) {
        const initialValue = value ?? defaultValue;
        if (
          initialValue !== '' &&
          initialValue !== null &&
          initialValue !== undefined
        ) {
          setDisplayValue(formatNumberValue(initialValue as string | number));
        }
      }
    }, []);

    // 當外部值改變時更新顯示值（僅在非聚焦時）
    useEffect(() => {
      if (formatNumber && !isFocused && value !== undefined) {
        if (value === '' || value === null) {
          setDisplayValue('');
        } else {
          setDisplayValue(formatNumberValue(value as string | number));
        }
      }
    }, [value, isFocused, formatNumber]);

    // 處理格式化數字的輸入
    const handleFormattedNumberChange = (
      e: React.ChangeEvent<HTMLInputElement>,
    ) => {
      const inputValue = e.target.value;

      // 移除格式，只保留數字
      const rawValue = parseFormattedNumber(inputValue);

      // 更新顯示值（不格式化，讓用戶可以輸入）
      setDisplayValue(inputValue);

      // 傳遞原始數字值給父組件
      if (onChange) {
        const syntheticEvent = {
          ...e,
          target: {
            ...e.target,
            value: rawValue,
          },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(syntheticEvent);
      }
    };

    // 處理聚焦
    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      if (formatNumber && displayValue) {
        // 聚焦時移除格式，方便編輯
        const rawValue = parseFormattedNumber(displayValue);
        setDisplayValue(rawValue);
      }
      if (props.onFocus) {
        props.onFocus(e);
      }
    };

    // 處理失焦
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      if (formatNumber && e.target.value) {
        // 失焦時格式化數字
        const formatted = formatNumberValue(e.target.value);
        setDisplayValue(formatted);
      }
      if (props.onBlur) {
        props.onBlur(e);
      }
    };

    // 決定文字對齊方式
    let finalTextAlign: 'left' | 'right' | 'center' = 'left';
    if (textAlign === 'auto') {
      finalTextAlign =
        props.type === 'number' || formatNumber ? 'right' : 'left';
    } else {
      finalTextAlign = textAlign;
    }

    // 決定最終的 type
    const finalType = formatNumber ? 'text' : props.type;

    // 決定最終的 value 和 onChange
    const finalValue = formatNumber
      ? isFocused
        ? displayValue
        : displayValue
      : value;
    const finalOnChange = formatNumber ? handleFormattedNumberChange : onChange;
    const finalDefaultValue = formatNumber ? undefined : defaultValue;

    // 建立 InputProps
    const inputProps = {
      ...props.InputProps,
      startAdornment: startAdornment ? (
        <InputAdornment position="start">{startAdornment}</InputAdornment>
      ) : (
        props.InputProps?.startAdornment
      ),
      endAdornment: endAdornment ? (
        <InputAdornment position="end">{endAdornment}</InputAdornment>
      ) : (
        props.InputProps?.endAdornment
      ),
      sx: {
        ...props.InputProps?.sx,
        '& input': {
          textAlign: finalTextAlign,
        },
        '& textarea': {
          textAlign: finalTextAlign,
        },
      },
    };

    return (
      <TextField
        ref={ref}
        error={hasError}
        helperText={errorMessage || helperText}
        {...props}
        type={finalType}
        value={finalValue}
        defaultValue={finalDefaultValue}
        onChange={finalOnChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        InputProps={inputProps}
      />
    );
  },
);

export default FormField;
