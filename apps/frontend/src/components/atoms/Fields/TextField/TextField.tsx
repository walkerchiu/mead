import ArrowDropDownicon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpicon from '@mui/icons-material/ArrowDropUp';
import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';
import MuiTextField, {
  TextFieldProps as MuiTextFieldProps,
  TextFieldOwnerState,
} from '@mui/material/TextField';
import { styled } from '@mui/material/styles';
import { useForkRef } from '@mui/material/utils';
import { forwardRef, useCallback, useMemo, useRef } from 'react';
import { getTextFieldStyles, type TextFieldSize } from './textFieldStyles';

export interface TextFieldProps extends Omit<
  MuiTextFieldProps,
  'variant' | 'size'
> {
  /**
   * Input variant
   * @default 'outlined'
   */
  variant?: 'outlined';
  /**
   * Input size
   */
  size?: TextFieldSize;
  /**
   * Whether to hide number input arrows
   * @default true
   */
  hideNumberSpinner?: boolean;
  /**
   * whether to use custom number stepper
   * - default：type=number when it is true
   */
  useCustomStepper?: boolean;
}

type TextFieldSlotProps = NonNullable<MuiTextFieldProps['slotProps']>;
type InputSlotProps = TextFieldSlotProps['input'];
type InputLabelSlotProps = TextFieldSlotProps['inputLabel'];
type ResolveSlotProps<T> = T extends (
  ownerState: TextFieldOwnerState,
) => infer R
  ? R
  : T;
type ResolvedInputSlotProps = ResolveSlotProps<NonNullable<InputSlotProps>>;
type ResolvedInputLabelSlotProps = ResolveSlotProps<
  NonNullable<InputLabelSlotProps>
>;

const StyledTextField = styled(MuiTextField, {
  shouldForwardProp: (prop) =>
    prop !== 'textFieldSize' &&
    prop !== 'hideNumberSpinner' &&
    prop !== 'useCustomStepper',
})<
  MuiTextFieldProps & {
    textFieldSize?: TextFieldSize;
    hideNumberSpinner?: boolean;
    useCustomStepper?: boolean;
  }
>((props) => {
  const { theme } = props as { theme: typeof props.theme };
  const state = props as MuiTextFieldProps & { textFieldSize?: TextFieldSize };
  return getTextFieldStyles({
    size: state.textFieldSize ?? 'medium',
    tokens: theme.palette.textFieldTokens,
  });
});

/**
 * TextField component
 *
 * Using forwardRef to support ref forwarding.
 */
export const TextField = forwardRef<HTMLDivElement, TextFieldProps>(
  function TextField(
    {
      variant = 'outlined',
      size = 'medium',
      fullWidth = true,
      hideNumberSpinner,
      useCustomStepper,
      className,
      slotProps,
      ...props
    },
    ref,
  ) {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const mergedInputRef = useForkRef(inputRef, props.inputRef);
    const isNumberType = props.type === 'number';
    const resolvedUseCustomStepper = useCustomStepper ?? isNumberType;
    const resolvedHideNumberSpinner =
      hideNumberSpinner ?? resolvedUseCustomStepper;
    const mergedClassName = [
      className,
      resolvedHideNumberSpinner ? 'hide-number-spinner' : null,
    ]
      .filter(Boolean)
      .join(' ');
    const handleStep = useCallback(
      (direction: 'up' | 'down') => {
        const input = inputRef.current;
        if (!input || props.disabled) return;
        if (direction === 'up') {
          input.stepUp();
        } else {
          input.stepDown();
        }
        input.dispatchEvent(new Event('input', { bubbles: true }));
      },
      [props.disabled],
    );
    const customStepper = useMemo(() => {
      if (!resolvedUseCustomStepper || !isNumberType) return null;
      return (
        <InputAdornment position="end" sx={{ ml: 1.5 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0,
              color: (theme) => theme.palette.grey[300],
              '& svg': {
                color: (theme) => theme.palette.grey[300],
              },
            }}
          >
            <Box
              component="button"
              type="button"
              aria-label="Increase value"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => handleStep('up')}
              disabled={props.disabled}
              sx={{
                border: 0,
                background: 'transparent',
                padding: 0,
                margin: 0,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: props.disabled ? 'not-allowed' : 'pointer',
                lineHeight: 0.5,
                height: '12px',
              }}
            >
              <ArrowDropUpicon fontSize="small" />
            </Box>
            <Box
              component="button"
              type="button"
              aria-label="Decrease value"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => handleStep('down')}
              disabled={props.disabled}
              sx={{
                border: 0,
                background: 'transparent',
                padding: 0,
                margin: 0,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: props.disabled ? 'not-allowed' : 'pointer',
                lineHeight: 0.5,
                height: '12px',
              }}
            >
              <ArrowDropDownicon fontSize="small" />
            </Box>
          </Box>
        </InputAdornment>
      );
    }, [handleStep, isNumberType, props.disabled, resolvedUseCustomStepper]);
    const resolveInputSlotProps = (
      ownerState: TextFieldOwnerState,
    ): ResolvedInputSlotProps | undefined => {
      if (!slotProps?.input) return undefined;
      return typeof slotProps.input === 'function'
        ? slotProps.input(ownerState)
        : slotProps.input;
    };
    const resolveInputLabelSlotProps = (
      ownerState: TextFieldOwnerState,
    ): ResolvedInputLabelSlotProps | undefined => {
      if (!slotProps?.inputLabel) return undefined;
      return typeof slotProps.inputLabel === 'function'
        ? slotProps.inputLabel(ownerState)
        : slotProps.inputLabel;
    };
    const mergedSlotProps = {
      ...slotProps,
      inputLabel: (ownerState: TextFieldOwnerState) => ({
        shrink: true,
        ...(resolveInputLabelSlotProps(ownerState) ?? {}),
      }),
      input: (ownerState: TextFieldOwnerState) => {
        const resolvedInput = resolveInputSlotProps(ownerState) ?? {};
        const existingEndAdornment = resolvedInput.endAdornment;
        const mergedEndAdornment =
          resolvedUseCustomStepper && isNumberType ? (
            existingEndAdornment ? (
              <>
                {existingEndAdornment}
                {customStepper}
              </>
            ) : (
              customStepper
            )
          ) : (
            existingEndAdornment
          );

        // When there is custom stepper, add paddingRight to ensure spacing with border
        const needsStepperPadding = resolvedUseCustomStepper && isNumberType;
        const mergedSx = needsStepperPadding
          ? {
              ...(resolvedInput.sx ?? {}),
              paddingRight: '8px !important',
            }
          : resolvedInput.sx;

        return {
          ...resolvedInput,
          sx: mergedSx,
          endAdornment: mergedEndAdornment,
        };
      },
    } satisfies MuiTextFieldProps['slotProps'];
    return (
      <StyledTextField
        ref={ref}
        variant={variant}
        size={size === 'small' ? 'small' : 'medium'}
        textFieldSize={size}
        fullWidth={fullWidth}
        hideNumberSpinner={resolvedHideNumberSpinner}
        useCustomStepper={resolvedUseCustomStepper}
        className={mergedClassName}
        inputRef={mergedInputRef}
        slotProps={mergedSlotProps}
        {...props}
      />
    );
  },
);

export default TextField;
