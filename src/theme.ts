/**
 * Escala pensada para 1080p/4K a distancia de sofá: todo es grande,
 * el contraste es alto y el foco se marca con luz, no con color.
 */
export const colors = {
  background: '#05070C',
  backgroundElevated: '#0E1219',
  card: 'rgba(255,255,255,0.07)',
  cardFocused: '#FFFFFF',
  border: 'rgba(255,255,255,0.12)',
  text: '#FFFFFF',
  textMuted: 'rgba(255,255,255,0.62)',
  textOnFocus: '#05070C',
  textMutedOnFocus: 'rgba(5,7,12,0.66)',
  live: '#FF3B30',
  accent: '#4CC2FF',
  scrim: 'rgba(0,0,0,0.86)',
} as const;

/** Margen de overscan: en televisores reales los bordes se recortan. */
export const overscan = {
  horizontal: 80,
  vertical: 48,
} as const;

export const spacing = {
  xs: 6,
  sm: 12,
  md: 20,
  lg: 32,
  xl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  pill: 999,
} as const;

export const typography = {
  display: {fontSize: 56, fontWeight: '700'},
  title: {fontSize: 34, fontWeight: '600'},
  subtitle: {fontSize: 26, fontWeight: '500'},
  body: {fontSize: 22, fontWeight: '400'},
  label: {fontSize: 18, fontWeight: '600', letterSpacing: 1.2},
} as const;
