import { forwardRef } from 'react';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import FormHelperText from '@mui/material/FormHelperText';
import { FieldError } from 'react-hook-form';

/**
 * CheckboxGroup Component - Atomic Design: Molecule
 *
 * Checkbox group,Perfect integration with react-hook-form。
 *
 * @example
 * ```tsx
 * // Basic usage
 * <CheckboxGroup
 *   label="Interests"
 *   options={[
 *     { value: 'reading', label: 'Reading' },
 *     { value: 'music', label: 'Music' },
 *   ]}
 *   value={['reading']}
 *   onChange={(values) => console.log(values)}
 *   error={errors.interests}
 * />
 *
 * // Horizontal layout
 * <CheckboxGroup
 *   label="Features"
 *   row
 *   options={[
 *     { value: 'notifications', label: 'Notifications' },
 *     { value: 'marketing', label: 'Marketing' },
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
   * componentlabel
   */
  label?: string;

  /**
   * Option items list
   */
  options: CheckboxOption[];

  /**
   * Currently selected valuecolumnList
   */
  value?: (string | number)[];

  /**
   * callback on value change
   */
  onChange?: (values: (string | number)[]) => void;

  /**
   * Field error（from react-hook-form）
   */
  error?: FieldError | string;

  /**
   * helper text（displayed in non-error state）
   */
  helperText?: string;

  /**
   * whetherRequired
   */
  required?: boolean;

  /**
   * Whether disabled
   */
  disabled?: boolean;

  /**
   * whetherHorizontal layout
   */
  row?: boolean;

  /**
   * component name (for form)
   */
  name?: string;
}

/**
 * CheckboxGroup component
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
  // handleError message
  const errorMessage = typeof error === 'string' ? error : error?.message;
  const hasError = Boolean(errorMessage);

  // handle single item selection/deselection
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
