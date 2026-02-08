import { Components, Theme } from '@mui/material/styles';
import { colorsDark, greyDark } from './tokens/paletteDark';

/**
 * MUI component style overrides for both light and dark modes
 * Dark mode uses soft, professional colors for comfortable viewing
 */
export function getComponentOverrides(
  mode: 'light' | 'dark',
): Components<Theme> {
  const isDark = mode === 'dark';

  return {
    MuiCssBaseline: {
      styleOverrides: isDark
        ? {
            body: {
              backgroundColor: '#0f1419',
              color: 'rgba(255, 255, 255, 0.87)',
            },
          }
        : undefined,
    },
    MuiTypography: {
      styleOverrides: {
        root: isDark
          ? {
              color: 'inherit',
            }
          : {},
        h1: isDark
          ? {
              color: greyDark[950],
            }
          : {},
        h2: isDark
          ? {
              color: greyDark[950],
            }
          : {},
        h3: isDark
          ? {
              color: greyDark[950],
            }
          : {},
        h4: isDark
          ? {
              color: greyDark[900],
            }
          : {},
        h5: isDark
          ? {
              color: greyDark[900],
            }
          : {},
        h6: isDark
          ? {
              color: greyDark[900],
            }
          : {},
        body1: isDark
          ? {
              color: greyDark[800],
            }
          : {},
        body2: isDark
          ? {
              color: greyDark[800],
            }
          : {},
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
        contained: isDark
          ? {
              backgroundColor: colorsDark.primary.main, // Soft blue
              color: '#ffffff',
              '&:hover': {
                backgroundColor: colorsDark.primary.dark,
              },
              '&:active': {
                backgroundColor: '#3670c2',
              },
              '&.Mui-disabled': {
                backgroundColor: greyDark[300],
                color: greyDark[600],
              },
            }
          : {},
        outlined: isDark
          ? {
              borderColor: greyDark[500],
              color: greyDark[900],
              backgroundColor: 'transparent',
              '&:hover': {
                backgroundColor: 'rgba(90, 155, 245, 0.08)',
                borderColor: greyDark[600],
              },
              '&.Mui-disabled': {
                borderColor: greyDark[400],
                color: greyDark[600],
              },
            }
          : {},
        text: isDark
          ? {
              color: colorsDark.primary.light, // Lighter blue for text
              '&:hover': {
                backgroundColor: 'rgba(90, 155, 245, 0.08)',
              },
              '&.Mui-disabled': {
                color: greyDark[600],
              },
            }
          : {},
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: isDark
          ? {
              '& .MuiOutlinedInput-root': {
                backgroundColor: greyDark[200],
                '& fieldset': {
                  borderColor: greyDark[400],
                },
                '&:hover fieldset': {
                  borderColor: greyDark[500],
                },
                '&.Mui-focused fieldset': {
                  borderColor: colorsDark.primary.light,
                  borderWidth: '2px',
                },
                '&.Mui-disabled': {
                  backgroundColor: greyDark[100],
                  '& fieldset': {
                    borderColor: greyDark[300],
                  },
                },
              },
              '& .MuiInputLabel-root': {
                color: greyDark[700],
                '&.Mui-focused': {
                  color: colorsDark.primary.light,
                },
                '&.Mui-disabled': {
                  color: greyDark[600],
                },
              },
              '& .MuiInputBase-input': {
                color: greyDark[900],
                '&::placeholder': {
                  color: greyDark[600],
                  opacity: 1,
                },
                '&.Mui-disabled': {
                  color: greyDark[600],
                  WebkitTextFillColor: greyDark[600],
                },
              },
              '& .MuiFormHelperText-root': {
                color: greyDark[700],
              },
            }
          : {},
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: isDark
          ? {
              backgroundImage: 'none',
              backgroundColor: greyDark[100],
            }
          : {},
        elevation1: isDark
          ? {
              boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.3)',
            }
          : {},
        elevation2: isDark
          ? {
              boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.3)',
            }
          : {},
        elevation8: isDark
          ? {
              boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.4)',
            }
          : {},
      },
    },
    MuiCard: {
      styleOverrides: {
        root: isDark
          ? {
              backgroundColor: greyDark[100],
              backgroundImage: 'none',
            }
          : {},
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: isDark
          ? {
              borderBottom: `1px solid ${greyDark[300]}`,
              color: greyDark[900],
              // Ensure all text inside table cells is clearly visible
              '& .MuiTypography-root': {
                color: 'inherit',
              },
              '& .MuiTypography-body2': {
                color: greyDark[900],
              },
              '& .MuiTypography-caption': {
                color: greyDark[700],
              },
            }
          : {},
        head: isDark
          ? {
              backgroundColor: greyDark[200],
              color: greyDark[950],
              fontWeight: 600,
            }
          : {},
      },
    },
    MuiChip: {
      styleOverrides: {
        root: isDark
          ? {
              backgroundColor: greyDark[200],
              color: greyDark[900],
              fontWeight: 500,
              '&:hover': {
                backgroundColor: greyDark[300],
              },
            }
          : {},
        filled: isDark
          ? {
              backgroundColor: greyDark[200],
              color: greyDark[900],
            }
          : {},
        outlined: isDark
          ? {
              borderColor: greyDark[500],
              color: greyDark[900],
              backgroundColor: 'transparent',
            }
          : {},
        // Color-specific variants for dark mode
        colorSuccess: isDark
          ? {
              backgroundColor: 'rgba(76, 175, 80, 0.2)',
              color: '#81c784',
              '& .MuiChip-icon': {
                color: '#81c784',
              },
            }
          : {},
        colorError: isDark
          ? {
              backgroundColor: 'rgba(244, 67, 54, 0.2)',
              color: '#e57373',
              '& .MuiChip-icon': {
                color: '#e57373',
              },
            }
          : {},
        colorWarning: isDark
          ? {
              backgroundColor: 'rgba(255, 152, 0, 0.2)',
              color: '#ffb74d',
              '& .MuiChip-icon': {
                color: '#ffb74d',
              },
            }
          : {},
        colorInfo: isDark
          ? {
              backgroundColor: 'rgba(33, 150, 243, 0.2)',
              color: '#64b5f6',
              '& .MuiChip-icon': {
                color: '#64b5f6',
              },
            }
          : {},
        colorPrimary: isDark
          ? {
              backgroundColor: 'rgba(90, 155, 245, 0.2)',
              color: colorsDark.primary.light,
              '& .MuiChip-icon': {
                color: colorsDark.primary.light,
              },
            }
          : {},
        colorSecondary: isDark
          ? {
              backgroundColor: 'rgba(77, 184, 172, 0.2)',
              color: colorsDark.secondary.light,
              '& .MuiChip-icon': {
                color: colorsDark.secondary.light,
              },
            }
          : {},
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: isDark
          ? {
              color: greyDark[800],
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
              },
              '&.Mui-disabled': {
                color: greyDark[500],
              },
            }
          : {},
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: isDark
          ? {
              borderColor: 'rgba(255, 255, 255, 0.12)',
            }
          : {},
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: isDark
          ? {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: greyDark[400],
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: greyDark[600],
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: colorsDark.primary.light,
              },
            }
          : {},
        icon: isDark
          ? {
              color: greyDark[700],
            }
          : {},
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: isDark
          ? {
              backgroundColor: greyDark[100],
            }
          : {},
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: isDark
          ? {
              color: greyDark[900],
              '&:hover': {
                backgroundColor: greyDark[200],
              },
              '&.Mui-selected': {
                backgroundColor: greyDark[300],
                '&:hover': {
                  backgroundColor: greyDark[400],
                },
              },
            }
          : {},
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: isDark
          ? {
              color: greyDark[900],
            }
          : {},
        standardSuccess: isDark
          ? {
              backgroundColor: 'rgba(76, 175, 80, 0.15)',
              color: colorsDark.success.light,
              '& .MuiAlert-icon': {
                color: colorsDark.success.main,
              },
            }
          : {},
        standardError: isDark
          ? {
              backgroundColor: 'rgba(245, 101, 101, 0.15)',
              color: colorsDark.error.light,
              '& .MuiAlert-icon': {
                color: colorsDark.error.main,
              },
            }
          : {},
        standardWarning: isDark
          ? {
              backgroundColor: 'rgba(245, 164, 66, 0.15)',
              color: colorsDark.warning.light,
              '& .MuiAlert-icon': {
                color: colorsDark.warning.main,
              },
            }
          : {},
        standardInfo: isDark
          ? {
              backgroundColor: 'rgba(66, 165, 245, 0.15)',
              color: colorsDark.info.light,
              '& .MuiAlert-icon': {
                color: colorsDark.info.main,
              },
            }
          : {},
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: isDark
          ? {
              '& .MuiSwitch-switchBase': {
                color: greyDark[600],
                '&.Mui-checked': {
                  color: colorsDark.primary.main,
                  '& + .MuiSwitch-track': {
                    backgroundColor: colorsDark.primary.main,
                    opacity: 0.5,
                  },
                },
              },
              '& .MuiSwitch-track': {
                backgroundColor: greyDark[500],
                opacity: 0.38,
              },
            }
          : {},
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: isDark
          ? {
              color: greyDark[600],
              '&.Mui-checked': {
                color: colorsDark.primary.main,
              },
              '&.Mui-disabled': {
                color: greyDark[400],
              },
            }
          : {},
      },
    },
    MuiRadio: {
      styleOverrides: {
        root: isDark
          ? {
              color: greyDark[600],
              '&.Mui-checked': {
                color: colorsDark.primary.main,
              },
              '&.Mui-disabled': {
                color: greyDark[400],
              },
            }
          : {},
      },
    },
    MuiSvgIcon: {
      styleOverrides: {
        root: isDark
          ? {
              // Ensure icons inside table cells are visible
              '.MuiTableCell-root &': {
                color: greyDark[700],
              },
              // Small icons should be slightly lighter
              '&.MuiSvgIcon-fontSizeSmall': {
                color: greyDark[700],
              },
            }
          : {},
        colorAction: isDark
          ? {
              color: greyDark[700],
            }
          : {},
      },
    },
  };
}
