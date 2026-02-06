import type { CSSObject, Theme } from '@mui/material/styles';

export type SwitchSize = 'small' | 'medium';

type SwitchTokens = Theme['palette']['switchTokens'];

type SwitchStyleParams = {
  size?: SwitchSize;
  tokens: SwitchTokens;
};

export const getSwitchStyles = ({
  size = 'medium',
  tokens,
}: SwitchStyleParams): CSSObject => {
  const sizeToken = tokens.sizes[size];
  const { colors } = tokens;
  const translateX = sizeToken.width - sizeToken.height;

  return {
    width: sizeToken.width,
    height: sizeToken.height,
    padding: 0,
    cursor: 'pointer',
    '& .MuiSwitch-switchBase': {
      padding: 0,
      margin: sizeToken.padding,
      transition: 'transform 180ms ease',
      cursor: 'pointer',
      '&:hover': {
        backgroundColor: 'transparent',
      },
      '&.Mui-checked': {
        transform: `translateX(${translateX}px)`,
        '& + .MuiSwitch-track': {
          backgroundColor: colors.trackOn,
          opacity: 1,
        },
      },
      '&.Mui-disabled': {
        cursor: 'not-allowed !important',
        pointerEvents: 'auto !important',
        '& .MuiSwitch-thumb': {
          backgroundColor: colors.thumbDisabled,
          cursor: 'not-allowed',
        },
        '& + .MuiSwitch-track': {
          backgroundColor: colors.trackDisabled,
          opacity: 1,
          cursor: 'not-allowed',
        },
      },
      '&.Mui-checked.Mui-disabled': {
        '& + .MuiSwitch-track': {
          backgroundColor: colors.trackDisabled,
          opacity: 1,
        },
      },
    },
    '& .MuiSwitch-thumb': {
      width: sizeToken.thumbSize,
      height: sizeToken.thumbSize,
      boxSizing: 'border-box',
      backgroundColor: colors.thumb,
      boxShadow: 'none',
    },
    '& .MuiSwitch-track': {
      borderRadius: sizeToken.trackRadius,
      backgroundColor: colors.trackOff,
      opacity: 1,
      transition: 'background-color 180ms ease',
    },
    '& .MuiSwitch-switchBase.Mui-disabled + .MuiSwitch-track': {
      cursor: 'not-allowed',
    },
  };
};
