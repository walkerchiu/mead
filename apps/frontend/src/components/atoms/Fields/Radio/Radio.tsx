import MuiRadio, { RadioProps as MuiRadioProps } from '@mui/material/Radio';
import { styled } from '@mui/material/styles';
import { getRadioStyles, type RadioSize } from './radioStyles';

const StyledRadio = styled(MuiRadio, {
  shouldForwardProp: (prop) => prop !== 'radioSize' && prop !== 'radioColor',
})<MuiRadioProps & { radioSize?: RadioSize; radioColor?: string }>((props) => {
  const { theme } = props as { theme: typeof props.theme };
  const state = props as MuiRadioProps & {
    radioSize?: RadioSize;
    radioColor?: string;
  };

  return getRadioStyles({
    size: state.radioSize ?? 'medium',
    color: state.radioColor,
    tokens: theme.palette.radioTokens,
  });
});

const RadioIcon = <span className="WindRadio-icon" />;

export interface RadioProps extends Omit<MuiRadioProps, 'color' | 'size'> {
  size?: RadioSize;
  /**
   * 自訂顏色（支援任意色碼）
   */
  color?: string;
}

export function Radio({ size = 'medium', color, ...props }: RadioProps) {
  const muiSize = size === 'small' ? 'small' : 'medium';
  return (
    <StyledRadio
      radioSize={size}
      radioColor={color}
      size={muiSize}
      icon={RadioIcon}
      checkedIcon={RadioIcon}
      disableRipple
      {...props}
    />
  );
}

export default Radio;
