import DateRangeIcon from '@mui/icons-material/DateRange';
import InputAdornment from '@mui/material/InputAdornment';
import { useTheme } from '@mui/material/styles';
import { TextField, type TextFieldProps } from '../TextField/TextField';

export type DatePickerState = 'default' | 'hover' | 'focus' | 'press';

export interface DatePickerProps extends Omit<
  TextFieldProps,
  'type' | 'value' | 'onChange'
> {
  value: string;
  onChange: TextFieldProps['onChange'];
  state?: DatePickerState;
}

const stateClassMap: Record<DatePickerState, string | undefined> = {
  default: undefined,
  hover: 'preview-hover',
  focus: 'preview-focus',
  press: 'preview-pressed',
};

export function DatePicker({
  value,
  onChange,
  state = 'default',
  placeholder = 'MM/DD/YYYY',
  className,
  disabled,
  slotProps,
  ...props
}: DatePickerProps) {
  const theme = useTheme();
  const colors = theme.palette.textFieldTokens.colors;
  const iconColor = disabled ? colors.disabledText : colors.placeholder;
  const mergedClassName = [className, stateClassMap[state]]
    .filter(Boolean)
    .join(' ');
  const mergedSlotProps: DatePickerProps['slotProps'] = {
    ...slotProps,
    inputLabel: {
      shrink: true,
      ...slotProps?.inputLabel,
    },
    input: () => ({
      sx: {
        paddingRight: '16px !important',
      },
      endAdornment: (
        <InputAdornment
          position="end"
          sx={{
            marginLeft: '8px',
            minWidth: '20px',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <DateRangeIcon sx={{ color: iconColor }} />
        </InputAdornment>
      ),
    }),
    htmlInput: {
      ...slotProps?.htmlInput,
      inputMode: 'numeric',
      pattern: '\\d{2}/\\d{2}/\\d{4}',
    },
  };

  return (
    <TextField
      {...props}
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className={mergedClassName}
      slotProps={mergedSlotProps}
    />
  );
}

export default DatePicker;
