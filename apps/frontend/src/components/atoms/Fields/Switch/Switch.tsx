import MuiSwitch, { SwitchProps as MuiSwitchProps } from '@mui/material/Switch';
import { styled } from '@mui/material/styles';
import { getSwitchStyles, type SwitchSize } from './switchStyles';

const StyledSwitch = styled(MuiSwitch, {
  shouldForwardProp: (prop) => prop !== 'switchSize',
})<MuiSwitchProps & { switchSize?: SwitchSize }>((props) => {
  const { theme, ownerState } = props as {
    theme: typeof props.theme;
    ownerState?: MuiSwitchProps & { switchSize?: SwitchSize };
  };
  const state = (ownerState ?? props) as MuiSwitchProps & {
    switchSize?: SwitchSize;
  };

  return getSwitchStyles({
    size: state.switchSize ?? state.size ?? 'medium',
    tokens: theme.palette.switchTokens,
  });
});

export interface SwitchProps extends Omit<MuiSwitchProps, 'color'> {
  size?: SwitchSize;
}

export function Switch({ size = 'medium', ...props }: SwitchProps) {
  return (
    <StyledSwitch switchSize={size} size={size} disableRipple {...props} />
  );
}

export default Switch;
