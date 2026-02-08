import { TextField, TextFieldProps } from '@/components/atoms';
import { forwardRef, useState, useEffect } from 'react';
import { FieldError } from 'react-hook-form';
import { InputAdornment } from '@mui/material';
import type { TextFieldOwnerState } from '@mui/material/TextField';

/**
 * FormField Component - Atomic Design: Molecule
 *
 * Form field component combining TextField and error handling.
 * Perfect integration with react-hook-form, automatically displays validation errors.
 *
 * @example
 * ```tsx
 * // With react-hook-form
 * <FormField
 *   label="Email"
 *   {...register('email')}
 *   error={errors.email}
 * />
 *
 * // With units
 * <FormField
 *   label="Price"
 *   startAdornment="$"
 *   endAdornment="USD"
 *   {...register('price')}
 * />
 *
 * // With icon
 * <FormField
 *   label="Search"
 *   startAdornment={<SearchIcon />}
 *   {...register('search')}
 * />
 *
 * // Number formatting (thousands separator)
 * <FormField
 *   label="Amount"
 *   formatNumber
 *   startAdornment="$"
 *   {...register('amount')}
 * />
 *
 * // Custom text alignment
 * <FormField
 *   label="Quantity"
 *   textAlign="right"
 *   {...register('quantity')}
 * />
 * ```
 */

export interface FormFieldProps extends Omit<
  TextFieldProps,
  'error' | 'helperText' | 'slotProps'
> {
  /**
   * Field error (from react-hook-form)
   * Can be FieldError object or string
   */
  error?: FieldError | string;

  /**
   * Helper text (displayed when not in error state)
   */
  helperText?: string;

  /**
   * Field prefix (start position)
   * Can be text, icon, or custom component
   */
  startAdornment?: React.ReactNode;

  /**
   * Field suffix (end position)
   * Can be text, icon, or custom component
   */
  endAdornment?: React.ReactNode;

  /**
   * Text alignment
   * - 'left': Align left (default)
   * - 'right': Align right (recommended for numeric fields)
   * - 'center': Center alignment
   * - 'auto': number type auto-aligns right, others left
   */
  textAlign?: 'left' | 'right' | 'center' | 'auto';

  /**
   * Whether to format numbers (add thousands separator)
   * Only applies to numeric input
   * Note: When enabled, type will be automatically changed to "text"
   */
  formatNumber?: boolean;

  /**
   * Number formatting locale (default: 'en-US')
   * - 'en-US': 1,234,567.89
   * - 'zh-TW': 1,234,567.89
   * - 'de-DE': 1.234.567,89
   */
  numberLocale?: string;

  /**
   * Decimal places (default: undefined, no limit)
   */
  decimalPlaces?: number;
}

/**
 * FormField Component
 *
 * Handles react-hook-form error objects,
 * automatically extracts and displays error messages
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
    // Handle error message
    const errorMessage = typeof error === 'string' ? error : error?.message;
    const hasError = Boolean(errorMessage);

    // Number formatting state
    const [displayValue, setDisplayValue] = useState<string>('');
    const [isFocused, setIsFocused] = useState(false);

    // Helper function for formatting numbers
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

    // Parse formatted number string
    const parseFormattedNumber = (formatted: string): string => {
      // Remove thousands separator, keep decimal point and negative sign
      return formatted.replace(/[^\d.-]/g, '');
    };

    // Initialize display value
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

    // Update display value when external value changes (only when not focused)
    useEffect(() => {
      if (formatNumber && !isFocused && value !== undefined) {
        if (value === '' || value === null) {
          setDisplayValue('');
        } else {
          setDisplayValue(formatNumberValue(value as string | number));
        }
      }
    }, [value, isFocused, formatNumber]);

    // Handle formatted number input
    const handleFormattedNumberChange = (
      e: React.ChangeEvent<HTMLInputElement>,
    ) => {
      const inputValue = e.target.value;

      // Remove formatting, keep only numbers
      const rawValue = parseFormattedNumber(inputValue);

      // Update display value (without formatting, allow user input)
      setDisplayValue(inputValue);

      // Pass raw numeric value to parent component
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

    // Handle focus
    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      if (formatNumber && displayValue) {
        // Remove formatting on focus for easier editing
        const rawValue = parseFormattedNumber(displayValue);
        setDisplayValue(rawValue);
      }
      if (props.onFocus) {
        props.onFocus(e);
      }
    };

    // Handle blur
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      if (formatNumber && e.target.value) {
        // Format number on blur
        const formatted = formatNumberValue(e.target.value);
        setDisplayValue(formatted);
      }
      if (props.onBlur) {
        props.onBlur(e);
      }
    };

    // Determine text alignment
    let finalTextAlign: 'left' | 'right' | 'center' = 'left';
    if (textAlign === 'auto') {
      finalTextAlign =
        props.type === 'number' || formatNumber ? 'right' : 'left';
    } else {
      finalTextAlign = textAlign;
    }

    // Determine final type
    const finalType = formatNumber ? 'text' : props.type;

    // Determine final value and onChange
    const finalValue = formatNumber
      ? isFocused
        ? displayValue
        : displayValue
      : value;
    const finalOnChange = formatNumber ? handleFormattedNumberChange : onChange;
    const finalDefaultValue = formatNumber ? undefined : defaultValue;

    // Number input stepper logic:
    // 1. Always hide native browser spinner for number type (to avoid conflicts with custom stepper)
    // 2. Only show custom stepper when there are no adornments and formatNumber is false
    const hasStartAdornment = Boolean(startAdornment);
    const hasEndAdornment = Boolean(endAdornment);
    const shouldHideNumberSpinner = props.type === 'number';
    const shouldUseCustomStepper =
      props.type === 'number' &&
      !hasStartAdornment &&
      !hasEndAdornment &&
      !formatNumber;

    // Build slotProps - adapted for new TextField API
    const slotProps = {
      input: (_ownerState: TextFieldOwnerState) => {
        const inputProps: {
          sx: Record<string, unknown>;
          startAdornment?: React.ReactNode;
          endAdornment?: React.ReactNode;
        } = {
          sx: {
            '& input': {
              textAlign: finalTextAlign,
            },
            '& textarea': {
              textAlign: finalTextAlign,
            },
            // Add padding at InputBase-root level when adornment exists
            ...(startAdornment && {
              paddingLeft: '16px !important',
            }),
            ...(endAdornment && {
              paddingRight: '16px !important',
            }),
          },
        };

        if (startAdornment) {
          inputProps.startAdornment = (
            <InputAdornment
              position="start"
              sx={{
                marginRight: '8px',
              }}
            >
              {startAdornment}
            </InputAdornment>
          );
        }

        if (endAdornment) {
          inputProps.endAdornment = (
            <InputAdornment
              position="end"
              sx={{
                marginLeft: '8px',
                minWidth: '20px',
                display: 'flex',
                justifyContent: 'flex-end',
              }}
            >
              {endAdornment}
            </InputAdornment>
          );
        }

        return inputProps;
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
        hideNumberSpinner={shouldHideNumberSpinner}
        useCustomStepper={shouldUseCustomStepper}
        slotProps={slotProps}
      />
    );
  },
);

export default FormField;
