/**
 * Study Hub Design System 2.0 — Colors & Semantic Tokens
 * Single source of truth for programmatic color access across TypeScript files.
 */

export const BRAND_COLORS = {
  navy: '#10233F',
  blue: '#1F5F8B',
  softBlue: '#4E88B7',
  mist: '#EAF2F7',
  paperWhite: '#FCFBF8',
  warmCream: '#F7E7D0',
  softPeach: '#FCDAB7',
  ink: '#172033',
  inkBody: '#3D4A5A',
  muted: '#627083',
  success: '#2E8B72',
  warning: '#D99A3D',
  error: '#C95C5C',
} as const;

export const DARK_PALETTE = {
  navy: '#0B1B2F',
  blue: '#245C86',
  mist: '#DCE8EF',
  cream: '#EED8BE',
  text: '#F7F4EE',
} as const;

export const SEMANTIC_ROLES = {
  navbar: BRAND_COLORS.navy,
  heroDark: BRAND_COLORS.navy,
  heroLight: BRAND_COLORS.paperWhite,
  primaryAccent: BRAND_COLORS.blue,
  secondaryAccent: BRAND_COLORS.softBlue,
  cardLight: BRAND_COLORS.paperWhite,
  cardSoft: BRAND_COLORS.mist,
  editorialAccent: BRAND_COLORS.warmCream,
  highlightWarm: BRAND_COLORS.softPeach,
  bodyText: BRAND_COLORS.inkBody,
  headingText: BRAND_COLORS.ink,
  mutedText: BRAND_COLORS.muted,
  correct: BRAND_COLORS.success,
  warning: BRAND_COLORS.warning,
  error: BRAND_COLORS.error,
} as const;

export const GRADIENTS = {
  primary: 'linear-gradient(135deg, #1F5F8B 0%, #4E88B7 100%)',
  warm: 'linear-gradient(135deg, #F7E7D0 0%, #FCDAB7 100%)',
  ai: 'linear-gradient(135deg, #1F5F8B 0%, #4E88B7 50%, #5C8DAE 100%)',
  heroLight: 'radial-gradient(circle at 75% 35%, rgba(252,218,183,0.45), transparent 24%), radial-gradient(circle at 20% 15%, rgba(78,136,183,0.14), transparent 30%), #FCFBF8',
} as const;

export const SHADOWS = {
  soft: '0 8px 24px rgba(16, 35, 63, 0.06)',
  card: '0 14px 40px rgba(16, 35, 63, 0.08)',
  floating: '0 24px 70px rgba(16, 35, 63, 0.14)',
} as const;

export const BORDERS = {
  default: 'rgba(16, 35, 63, 0.08)',
  strong: 'rgba(31, 95, 139, 0.18)',
  dark: 'rgba(255, 255, 255, 0.12)',
} as const;

export const RADIUS = {
  small: '10px',
  control: '12px',
  card: '18px',
  feature: '24px',
  hero: '28px',
  pill: '9999px',
} as const;
