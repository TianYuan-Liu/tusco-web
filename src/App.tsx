import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import HumanData from './pages/HumanData';
import MouseData from './pages/MouseData';
import PipelinePage from './pages/PipelinePage';

// Academic and professional theme configuration
let theme = createTheme({
  typography: {
    fontFamily: '"Inter", "Source Sans Pro", "Roboto", "Helvetica Neue", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      letterSpacing: '-0.025em',
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 600,
      letterSpacing: '-0.02em',
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 600,
      letterSpacing: '-0.015em',
      fontSize: '1.5rem',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.25rem',
      letterSpacing: '-0.01em',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.1rem',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
    },
    button: {
      fontWeight: 500,
      textTransform: 'none',
      letterSpacing: '0.01em',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      letterSpacing: '0.00938em',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      letterSpacing: '0.01071em',
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.4,
      letterSpacing: '0.03333em',
      color: '#64748b',
    },
    subtitle1: {
      fontSize: '1rem',
      lineHeight: 1.5,
      fontWeight: 500,
      letterSpacing: '0.00938em',
    },
    subtitle2: {
      fontSize: '0.875rem',
      lineHeight: 1.4,
      fontWeight: 500,
      letterSpacing: '0.00714em',
    },
  },
  palette: {
    mode: 'light',
    primary: {
      main: '#15918A',
      light: '#4DB5AA',
      dark: '#0F6B66',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#64748b',
      light: '#94a3b8',
      dark: '#475569',
      contrastText: '#ffffff',
    },
    info: {
      main: '#2EABA3',
      light: '#5BBDB7',
      dark: '#127A76',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#0f172a',
      secondary: '#475569',
    },
    error: {
      main: '#dc2626',
      light: '#ef4444',
      dark: '#b91c1c',
    },
    success: {
      main: '#059669',
      light: '#10b981',
      dark: '#047857',
    },
    warning: {
      main: '#d97706',
      light: '#f59e0b',
      dark: '#b45309',
    },
    divider: 'rgba(15, 23, 42, 0.08)',
    grey: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollBehavior: 'smooth',
          fontFeatureSettings: '"cv02", "cv03", "cv04", "cv11"',
          fontVariantNumeric: 'lining-nums',
          '&::-webkit-scrollbar': {
            width: '6px',
            height: '6px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(15, 23, 42, 0.15)',
            borderRadius: '3px',
            '&:hover': {
              backgroundColor: 'rgba(15, 23, 42, 0.25)',
            },
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'rgba(15, 23, 42, 0.03)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: 12,
        },
        elevation0: {
          border: '1px solid rgba(15, 23, 42, 0.06)',
        },
        elevation1: {
          boxShadow: '0 1px 3px 0 rgba(15, 23, 42, 0.08), 0 1px 2px -1px rgba(15, 23, 42, 0.06)',
          border: '1px solid rgba(15, 23, 42, 0.06)',
        },
        elevation2: {
          boxShadow: '0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.06)',
          border: '1px solid rgba(15, 23, 42, 0.06)',
        },
        elevation3: {
          boxShadow: '0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.06)',
          border: '1px solid rgba(15, 23, 42, 0.06)',
        },
        elevation4: {
          boxShadow: '0 20px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.06)',
          border: '1px solid rgba(15, 23, 42, 0.06)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 20px',
          transition: 'all 0.2s ease-in-out',
          fontWeight: 500,
          textTransform: 'none',
          fontSize: '0.875rem',
          minHeight: '40px',
        },
        contained: {
          boxShadow: '0 1px 3px 0 rgba(15, 23, 42, 0.12)',
          '&:hover': {
            boxShadow: '0 4px 6px -1px rgba(15, 23, 42, 0.15)',
            transform: 'translateY(-1px)',
          },
        },
        outlined: {
          borderWidth: '1px',
          '&:hover': {
            borderWidth: '1px',
            transform: 'translateY(-1px)',
          },
        },
        text: {
          '&:hover': {
            backgroundColor: 'rgba(15, 23, 42, 0.04)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          transition: 'all 0.2s ease-in-out',
          border: '1px solid rgba(15, 23, 42, 0.06)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 6px -1px rgba(15, 23, 42, 0.12)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
          fontSize: '0.8125rem',
        },
        colorPrimary: {
          backgroundColor: 'rgba(21, 145, 138, 0.08)',
          color: '#15918A',
        },
        colorSecondary: {
          backgroundColor: 'rgba(100, 116, 139, 0.08)',
          color: '#64748b',
        },
        colorInfo: {
          backgroundColor: 'rgba(46, 171, 163, 0.08)',
          color: '#2EABA3',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(15, 23, 42, 0.08)',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: 'all 0.15s ease-in-out',
          '&:hover': {
            backgroundColor: 'rgba(15, 23, 42, 0.06)',
            transform: 'scale(1.05)',
          },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          borderRadius: 6,
          fontSize: '0.75rem',
          padding: '8px 12px',
          backdropFilter: 'blur(8px)',
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        h1: {
          color: '#0f172a',
        },
        h2: {
          color: '#0f172a',
        },
        h3: {
          color: '#0f172a',
        },
        h4: {
          color: '#0f172a',
        },
        h5: {
          color: '#0f172a',
        },
        h6: {
          color: '#0f172a',
        },
        body1: {
          color: '#334155',
        },
        body2: {
          color: '#475569',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/human" element={<HumanData />} />
          <Route path="/mouse" element={<MouseData />} />
          <Route path="/pipeline" element={<PipelinePage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
