/**
 * Theme Configuration
 * Sci-Fi Gaming Look für Starship Mayflower
 */

export const theme = {
  colors: {
    background: '#0a0e1a',
    surface: '#1a1f2e',
    surfaceHover: '#242936',
    primary: '#00d9ff',
    secondary: '#7b2cbf',
    success: '#00ff88',
    warning: '#ffaa00',
    danger: '#ff3366',
    text: '#e0e6ed',
    textMuted: '#8891a0',
    border: '#2a3040',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
  },
  transitions: {
    fast: '150ms ease',
    normal: '200ms ease',
    slow: '300ms ease',
  },
  shadows: {
    sm: '0 2px 4px rgba(0, 0, 0, 0.3)',
    md: '0 4px 8px rgba(0, 0, 0, 0.4)',
    lg: '0 8px 16px rgba(0, 0, 0, 0.5)',
    glow: '0 0 20px rgba(0, 217, 255, 0.3)',
  },
  typography: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: {
      xs: '12px',
      sm: '14px',
      md: '16px',
      lg: '18px',
      xl: '20px',
      xxl: '24px',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
} as const;

export type Theme = typeof theme;
