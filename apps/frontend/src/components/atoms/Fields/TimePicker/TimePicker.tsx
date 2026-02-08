import AccessTimeIcon from '@mui/icons-material/AccessTime';
import InputAdornment from '@mui/material/InputAdornment';
import { useTheme } from '@mui/material/styles';
import { TextField, type TextFieldProps } from '../TextField/TextField';

export type TimePickerState = 'default' | 'hover' | 'focus' | 'press';

export interface TimePickerProps extends Omit<
  TextFieldProps,
  'type' | 'value' | 'onChange'
> {
  value: string;
  onChange: TextFieldProps['onChange'];
  state?: TimePickerState;
}

const stateClassMap: Record<TimePickerState, string | undefined> = {
  default: undefined,
  hover: 'preview-hover',
  focus: 'preview-focus',
  press: 'preview-pressed',
};

export function TimePicker({
  value,
  onChange,
  state = 'default',
  placeholder = 'hh:mm aa',
  className,
  disabled,
  slotProps,
  sx,
  ...props
}: TimePickerProps) {
  const theme = useTheme();
  const colors = theme.palette.textFieldTokens.colors;
  const iconColor = disabled ? colors.disabledText : colors.placeholder;
  const mergedClassName = [className, stateClassMap[state]]
    .filter(Boolean)
    .join(' ');
  const mergedSlotProps: TimePickerProps['slotProps'] = {
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
          <AccessTimeIcon sx={{ color: iconColor }} />
        </InputAdornment>
      ),
    }),
    htmlInput: {
      ...slotProps?.htmlInput,
      inputMode: 'numeric',
      pattern: '\\d{2}:\\d{2}',
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
      sx={sx}
    />
  );
}

export default TimePicker;
