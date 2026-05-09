/**
 * Light/dark semantic palette tokens consumed by inline styles.
 */

export function createAppStyles(isDark) {
  return {
    bg: isDark ? '#0c0a09' : '#fafaf9',
    bgCard: isDark ? '#1c1917' : '#f5f5f4',
    bgHighlight: isDark ? '#292524' : '#e7e5e4',
    border: isDark ? '#44403c' : '#a8a29e',
    borderSoft: isDark ? '#292524' : '#d6d3d1',
    text: isDark ? '#fafaf9' : '#0c0a09',
    textSoft: isDark ? '#e7e5e4' : '#1c1917',
    textMuted: isDark ? '#d6d3d1' : '#44403c',
    textFaint: isDark ? '#a8a29e' : '#57534e',
    accent: isDark ? '#fbbf24' : '#92400e',
    primary: isDark ? '#fda4af' : '#7f1d1d',
    primaryBg: isDark ? '#fafaf9' : '#0c0a09',
    primaryBgText: isDark ? '#0c0a09' : '#fafaf9',
    bgRest: isDark ? 'rgba(120, 53, 15, 0.35)' : 'rgba(254, 243, 199, 1)',
    borderRest: isDark ? '#b45309' : '#fcd34d',
    bgDone: isDark ? 'rgba(20, 83, 45, 0.4)' : 'rgba(220, 252, 231, 1)',
    borderDone: isDark ? '#15803d' : '#86efac',
    textDone: isDark ? '#bbf7d0' : '#14532d',
    bgMissed: isDark ? 'rgba(127, 29, 29, 0.25)' : 'rgba(254, 226, 226, 0.6)',
    borderMissed: isDark ? '#7f1d1d' : '#fca5a5',
  };
}
