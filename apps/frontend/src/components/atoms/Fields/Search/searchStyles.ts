import type { CSSObject, Theme } from '@mui/material/styles';

export type SearchTokens = Theme['palette']['searchTokens'];

type SearchStyleParams = {
  tokens: SearchTokens;
  size?: keyof SearchTokens['sizes'];
  variant?: keyof SearchTokens['variants'];
  state?: 'default' | 'hover' | 'focus' | 'active' | 'disabled';
};

export const getSearchStyles = ({
  tokens,
  size = 'medium',
  variant = 'pill',
  state = 'default',
}: SearchStyleParams): CSSObject => {
  const colors = tokens.colors;
  const sizeToken = tokens.sizes[size];
  const variantToken = tokens.variants[variant];

  const stateClass: Record<string, CSSObject> = {
    default: {},
    hover: { borderColor: colors.hoverBorder },
    focus: { borderColor: colors.focusBorder },
    active: { borderColor: colors.activeBorder },
    disabled: {
      borderColor: colors.disabledBorder,
      backgroundColor: colors.disabledBg,
      cursor: 'not-allowed',
    },
  };

  return {
    display: 'flex',
    alignItems: 'center',
    gap: sizeToken.iconGap,
    height: sizeToken.height,
    padding: `0 ${sizeToken.paddingX}px`,
    borderRadius: variantToken.borderRadius,
    border: `1px solid ${colors.border}`,
    backgroundColor: colors.bg,
    transition: 'border-color 160ms ease, background-color 160ms ease',
    '& .Search-inputRoot': {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      minWidth: 0,
    },
    '& .Search-input': {
      width: '100%',
      fontSize: 14,
      color: colors.text,
      padding: 0,
    },
    '& .Search-input::placeholder': {
      color: colors.placeholder,
      opacity: 1,
    },
    '& .Search-input::-webkit-search-cancel-button, & .Search-input::-webkit-search-decoration, & .Search-input::-webkit-search-results-button, & .Search-input::-webkit-search-results-decoration':
      {
        display: 'none',
        WebkitAppearance: 'none',
      },
    '& .Search-icon': {
      color: colors.icon,
      fontSize: sizeToken.iconSize,
    },
    '& .Search-clear': {
      width: sizeToken.clearSize,
      height: sizeToken.clearSize,
      borderRadius: '50%',
      backgroundColor: colors.clearBg,
      color: colors.clearIcon,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: 0,
      padding: 0,
      cursor: 'pointer',
    },
    '& .Search-clearPlaceholder': {
      width: sizeToken.clearSize,
      height: sizeToken.clearSize,
      borderRadius: '50%',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      visibility: 'hidden',
      pointerEvents: 'none',
    },
    ...stateClass[state],
    ...(state === 'disabled'
      ? {
          '& .Search-input': {
            cursor: 'not-allowed',
            color: colors.placeholder,
          },
          '& .Search-icon': {
            color: colors.placeholder,
          },
          '& .Search-clear': {
            cursor: 'not-allowed',
            backgroundColor: colors.clearBg,
            opacity: 0.5,
          },
        }
      : null),
  };
};
