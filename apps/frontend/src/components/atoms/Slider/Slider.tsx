import { forwardRef } from 'react';
import MuiSlider from '@mui/material/Slider';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import FormHelperText from '@mui/material/FormHelperText';
import { FieldError } from 'react-hook-form';

/**
 * Slider Component - Atomic Design: Atom
 *
 * Slider control, perfect integration with react-hook-form.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <Slider
 *   label="Volume"
 *   value={volume}
 *   onChange={(e, value) => setVolume(value)}
 *   min={0}
 *   max={100}
 * />
 *
 * // With scale marks
 * <Slider
 *   label="priority"
 *   marks={[
 *     { value: 0, label: 'Low' },
 *     { value: 50, label: 'Medium' },
 *     { value: 100, label: 'High' },
 *   ]}
 * />
 *
 * // Range selection
 * <Slider
 *   label="price range"
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
   * componentlabel
   */
  label?: string;

  /**
   * Current value（singlevalue or range）
   */
  value?: number | number[];

  /**
   * defaultValue
   */
  defaultValue?: number | number[];

  /**
   * callback on value change
   */
  onChange?: (event: Event, value: number | number[]) => void;

  /**
   * minimum value
   */
  min?: number;

  /**
   * maximumValue
   */
  max?: number;

  /**
   * step
   */
  step?: number;

  /**
   * scale marks
   */
  marks?: boolean | SliderMark[];

  /**
   * Valuelabeldisplay mode
   */
  valueLabelDisplay?: 'auto' | 'on' | 'off';

  /**
   * Valuelabelformat function
   */
  valueLabelFormat?: (value: number) => string;

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
   * component name (for form)
   */
  name?: string;

  /**
   * componentsize
   */
  size?: 'small' | 'medium';

  /**
   * componentColor
   */
  color?: 'primary' | 'secondary';

  /**
   * direction
   */
  orientation?: 'horizontal' | 'vertical';
}

/**
 * Slider component
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
  // handleError message
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
