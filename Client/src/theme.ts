import { createTheme } from '@mui/material/styles'

// Custom color palette for weather conditions
export const weatherColors = {
  ideal: '#4CAF50',     // Green - ideal picnic conditions
  fair: '#FF9800',      // Orange/Yellow - fair conditions
  poor: '#F44336',      // Red - poor conditions
  sky: '#2196F3',       // Blue - sky/general weather
} as const

// Dark theme color palette
export const darkColors = {
  background: {
    primary: '#0a0a0a',    // Main app background
    secondary: '#1a1a1a',  // Card backgrounds
    tertiary: '#2a2a2a',   // Elevated card backgrounds
  },
  text: {
    primary: '#ffffff',    // Main text color
    secondary: '#cccccc',  // Secondary text color
    tertiary: '#888888',   // Muted text color
  },
  border: {
    primary: '#333333',    // Main border color
    secondary: '#444444',  // Lighter border color
    tertiary: '#555555',   // Input border color
  },
  button: {
    primary: '#4caf50',    // Main action color
    primaryHover: '#45a049', // Primary hover color
    secondary: '#666666',  // Secondary button color
    secondaryHover: '#888888', // Secondary hover color
  },
  error: '#ff6b6b',        // Error color
  warning: '#ff9800',      // Warning color
  success: '#4caf50',      // Success color
} as const

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: darkColors.button.primary,
    },
    secondary: {
      main: weatherColors.ideal,
    },
    background: {
      default: darkColors.background.primary,
      paper: darkColors.background.secondary,
    },
    text: {
      primary: darkColors.text.primary,
      secondary: darkColors.text.secondary,
    },
    error: {
      main: darkColors.error,
    },
    warning: {
      main: darkColors.warning,
    },
    success: {
      main: darkColors.success,
    },
    divider: darkColors.border.secondary,
  },
  typography: {
    h4: {
      fontWeight: 600,
      color: darkColors.text.primary,
    },
    h5: {
      fontWeight: 500,
      color: darkColors.text.primary,
    },
    h6: {
      fontWeight: 500,
      color: darkColors.text.primary,
    },
    body1: {
      color: darkColors.text.primary,
    },
    body2: {
      color: darkColors.text.secondary,
    },
    caption: {
      color: darkColors.text.tertiary,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: darkColors.background.primary,
          color: darkColors.text.primary,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: darkColors.background.secondary,
          color: darkColors.text.primary,
          borderRadius: 12,
          border: `1px solid ${darkColors.border.primary}`,
        },
        elevation1: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        },
        elevation2: {
          boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
        },
        elevation3: {
          boxShadow: '0 6px 16px rgba(0,0,0,0.5)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: darkColors.background.tertiary,
          borderRadius: 12,
          border: `1px solid ${darkColors.border.primary}`,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
        },
        contained: {
          backgroundColor: darkColors.button.primary,
          color: darkColors.text.primary,
          '&:hover': {
            backgroundColor: darkColors.button.primaryHover,
          },
          '&:disabled': {
            backgroundColor: darkColors.border.primary,
            color: darkColors.text.tertiary,
          },
        },
        outlined: {
          borderColor: darkColors.button.primary,
          color: darkColors.button.primary,
          '&:hover': {
            borderColor: darkColors.button.primaryHover,
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
          },
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          color: darkColors.text.primary,
          borderColor: darkColors.border.secondary,
          '&.Mui-selected': {
            backgroundColor: darkColors.border.primary,
            color: darkColors.text.primary,
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputLabel-root': {
            color: darkColors.text.secondary,
          },
          '& .MuiOutlinedInput-root': {
            color: darkColors.text.primary,
            '& fieldset': {
              borderColor: darkColors.border.tertiary,
            },
            '&:hover fieldset': {
              borderColor: darkColors.button.primary,
            },
            '&.Mui-focused fieldset': {
              borderColor: darkColors.button.primary,
            },
          },
          '& .MuiFormHelperText-root': {
            color: darkColors.text.tertiary,
            '&.Mui-error': {
              color: darkColors.error,
            },
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: darkColors.background.secondary,
          color: darkColors.text.primary,
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          backgroundColor: darkColors.background.secondary,
          color: darkColors.text.primary,
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          backgroundColor: darkColors.background.secondary,
          borderColor: darkColors.border.primary,
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          backgroundColor: darkColors.background.secondary,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: darkColors.text.secondary,
          '&:hover': {
            backgroundColor: darkColors.border.primary,
          },
        },
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        root: {
          backgroundColor: darkColors.border.primary,
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          backgroundColor: darkColors.border.primary,
          color: darkColors.text.primary,
          border: `1px solid ${darkColors.border.tertiary}`,
          '&:before': {
            display: 'none',
          },
        },
      },
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          backgroundColor: darkColors.border.primary,
          color: darkColors.text.primary,
        },
      },
    },
    MuiAccordionDetails: {
      styleOverrides: {
        root: {
          backgroundColor: darkColors.background.tertiary,
          color: darkColors.text.primary,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 'bold',
        },
      },
    },
  },
})

// Export theme-aware utility functions
export const getWeatherColor = (condition: keyof typeof weatherColors) => 
  weatherColors[condition]

export const getDarkColor = (path: string) => {
  const keys = path.split('.')
  let value: any = darkColors
  for (const key of keys) {
    value = value[key]
  }
  return value
} 