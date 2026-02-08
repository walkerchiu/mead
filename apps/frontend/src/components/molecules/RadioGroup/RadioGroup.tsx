import { forwardRef } from 'react';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import MuiRadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import FormHelperText from '@mui/material/FormHelperText';
import { FieldError } from 'react-hook-form';

/**
 * RadioGroup Component - Atomic Design: Molecule
 *
 * Radio button group，Perfect integration with react-hook-form。
 *
 * @example
 * ```tsx
 * // Basic usage
 * <RadioGroup
 *   label="Gender"
 *   options={[
 *     { value: 'male', label: 'Male' },
 *     { value: 'female', label: 'Female' },
 *   ]}
 *   {...register('gender')}
 *   error={errors.gender}
 * />
 *
 * // Horizontal layout
 * <RadioGroup
 *   label="Subscription plan"
 *   row
 *   options={[
 *     { value: 'monthly', label: 'Monthly' },
 *     { value: 'yearly', label: 'Yearly' },
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
   * componentlabel
   */
  label?: string;

  /**
   * Option items list
   */
  options: RadioOption[];

  /**
   * Currently selected value
   */
  value?: string | number;

  /**
   * callback on value change
   */
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;

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
 * RadioGroup component
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
    // handleError message
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
