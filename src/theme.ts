import { alpha, createTheme, Theme } from '@mui/material/styles';

export type Mode = 'light' | 'dark';

// Brand colours from the TUSCO logo (teal #15918A, pink #EE446F). The chart series
// steps were checked with the dataviz palette validator against each mode's surface.
export const tokens = {
  light: {
    page: '#ffffff',
    surface: '#ffffff',
    surfaceAlt: '#f6f6f3',
    ink: '#1b1c1d',
    inkSecondary: '#4b4f53',
    inkMuted: '#6f747a',
    hairline: '#dfe1dc',
    grid: '#e8e9e5',
    brand: '#0e7c75', // links and buttons: 5.0:1 on white
    brandSoft: '#e6f2f0',
    accent: '#c7325a', // pink, darkened from #EE446F for text contrast
    series: '#11948a',
    seriesMuted: '#c9ccd1',
  },
  dark: {
    page: '#131517',
    surface: '#131517',
    surfaceAlt: '#1b1e21',
    ink: '#e9eaeb',
    inkSecondary: '#b5babf',
    inkMuted: '#8b9096',
    hairline: '#2c3034',
    grid: '#262a2e',
    brand: '#4cc3b8',
    brandSoft: 'rgba(76, 195, 184, 0.12)',
    accent: '#f27094',
    series: '#1fa59a',
    seriesMuted: '#3a4148',
  },
} as const;

// Apple's San Francisco through the system font stack (Segoe UI / Roboto elsewhere); no web fonts to load
export const fontStack =
  '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", "Segoe UI", Roboto, Arial, sans-serif';
export const displayStack =
  '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", "Segoe UI", Roboto, Arial, sans-serif';
export const monoStack = 'ui-monospace, "SF Mono", SFMono-Regular, Menlo, Consolas, monospace';

export function createAppTheme(mode: Mode): Theme {
  const t = tokens[mode];
  return createTheme({
    palette: {
      mode,
      primary: { main: t.brand, contrastText: mode === 'light' ? '#ffffff' : '#0b1114' },
      secondary: { main: t.accent },
      background: { default: t.page, paper: t.surface },
      text: { primary: t.ink, secondary: t.inkSecondary },
      divider: t.hairline,
    },
    shape: { borderRadius: 4 },
    typography: {
      fontFamily: fontStack,
      h1: { fontFamily: displayStack, fontWeight: 700, fontSize: 'clamp(2.2rem, 4.5vw, 2.9rem)', letterSpacing: '-0.025em', lineHeight: 1.1 },
      h2: { fontFamily: displayStack, fontWeight: 650, fontSize: 'clamp(1.5rem, 3vw, 1.85rem)', letterSpacing: '-0.02em', lineHeight: 1.2 },
      h3: { fontFamily: displayStack, fontWeight: 600, fontSize: '1.25rem', letterSpacing: '-0.01em', lineHeight: 1.3 },
      h4: { fontWeight: 600, fontSize: '1rem', lineHeight: 1.4 },
      h5: { fontWeight: 600, fontSize: '0.95rem' },
      h6: { fontWeight: 600, fontSize: '0.9rem' },
      subtitle1: { fontSize: '1.05rem', lineHeight: 1.6, color: t.inkSecondary },
      body1: { fontSize: '0.975rem', lineHeight: 1.65 },
      body2: { fontSize: '0.875rem', lineHeight: 1.55 },
      caption: { fontSize: '0.78rem', lineHeight: 1.45, color: t.inkMuted },
      overline: { fontSize: '0.78rem', fontWeight: 600, letterSpacing: 0, textTransform: 'none', lineHeight: 1.6 },
      button: { fontWeight: 500, textTransform: 'none', letterSpacing: 0 },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: { backgroundColor: t.page, WebkitFontSmoothing: 'antialiased' },
          'code, kbd': { fontFamily: monoStack, fontSize: '0.86em' },
          '::selection': { backgroundColor: alpha(t.series, 0.25) },
          a: { color: t.brand },
        },
      },
      MuiPaper: {
        defaultProps: { elevation: 0 },
        styleOverrides: { root: { backgroundImage: 'none' }, outlined: { borderColor: t.hairline } },
      },
      MuiButton: {
        defaultProps: { disableElevation: true, disableRipple: true },
        styleOverrides: {
          root: { borderRadius: 4, paddingInline: 12, minWidth: 0 },
          sizeSmall: { paddingBlock: 3, paddingInline: 10, fontSize: '0.84rem' },
          sizeLarge: { paddingBlock: 8, paddingInline: 18, fontSize: '0.95rem' },
          outlined: { borderColor: t.hairline, '&:hover': { borderColor: t.inkMuted, backgroundColor: t.surfaceAlt } },
        },
      },
      MuiChip: { styleOverrides: { root: { borderRadius: 3, fontWeight: 500 } } },
      MuiTableCell: {
        styleOverrides: {
          root: { borderColor: t.hairline },
          head: { fontWeight: 600, color: t.inkSecondary, fontSize: '0.8rem', whiteSpace: 'nowrap', backgroundColor: t.surfaceAlt },
          body: { fontVariantNumeric: 'tabular-nums' },
        },
      },
      MuiToggleButton: {
        defaultProps: { disableRipple: true },
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
            borderColor: t.hairline,
            borderRadius: 4,
            paddingBlock: 4,
            color: t.inkSecondary,
            '&.Mui-selected': { backgroundColor: t.brandSoft, color: t.brand, fontWeight: 600 },
          },
        },
      },
      MuiOutlinedInput: { styleOverrides: { root: { borderRadius: 4 }, notchedOutline: { borderColor: t.hairline } } },
      MuiTooltip: { styleOverrides: { tooltip: { fontSize: '0.78rem', borderRadius: 3 } } },
      MuiLink: { defaultProps: { underline: 'hover' } },
      MuiAlert: { styleOverrides: { root: { borderRadius: 4 } } },
    },
  });
}
