// src/lib/design-system/theme.ts
// Phase 3 Theme Export Source of Truth

export const theme = {
  colors: {
    forest: '#10261F',
    scholar: '#1F473B',
    sage: '#5C7A6D',
    paper: '#F5F0E8',
    parchment: '#E8DDCC',
    terracotta: '#C76B4A',
    gold: '#D7A84A',
    ink: '#181A19',
    muted: '#6C706D',
    success: '#4D8A6A',
    warning: '#C4903B',
    error: '#B9564D',
  },
  fonts: {
    display: "'Instrument Serif', Georgia, serif",
    body: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  radii: {
    sm: '8px',
    md: '14px',
    lg: '20px',
    xl: '28px',
    pill: '9999px',
  },
  shadows: {
    card: '0 12px 32px -8px rgba(16, 38, 31, 0.08)',
    float: '0 20px 48px -12px rgba(16, 38, 31, 0.14)',
    deep: '0 32px 80px -20px rgba(16, 38, 31, 0.22)',
  },
  eases: {
    ui: 'cubic-bezier(0.16, 1, 0.3, 1)',
    editorial: 'cubic-bezier(0.25, 1, 0.5, 1)',
    cinematic: 'cubic-bezier(0.77, 0, 0.175, 1)',
  },
} as const;

export type ThemeColors = keyof typeof theme.colors;
