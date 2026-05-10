/**
 * Light/dark semantic palette tokens consumed by inline styles.
 */

export function createAppStyles(isDark) {
  return {
    /** Dark: warm charcoal (easier than near-black + paper-white). */
    bg: isDark ? '#171411' : '#fafaf9',
    bgCard: isDark ? '#1f1d1a' : '#f5f5f4',
    bgHighlight: isDark ? '#2c2825' : '#e7e5e4',
    border: isDark ? '#403c38' : '#a8a29e',
    borderSoft: isDark ? '#32302c' : '#d6d3d1',
    text: isDark ? '#ece8e3' : '#0c0a09',
    textSoft: isDark ? '#dbd6d0' : '#1c1917',
    textMuted: isDark ? '#ada8a2' : '#44403c',
    textFaint: isDark ? '#8f8a84' : '#57534e',
    accent: isDark ? '#fbbf24' : '#92400e',
    primary: isDark ? '#fda4af' : '#7f1d1d',
    /** Dark: soft warm fill — avoids paper-white primary CTAs on charcoal bg. */
    primaryBg: isDark ? '#403b36' : '#0c0a09',
    primaryBgText: isDark ? '#f7f4ef' : '#fafaf9',
    bgRest: isDark ? 'rgba(120, 53, 15, 0.35)' : 'rgba(254, 243, 199, 1)',
    borderRest: isDark ? '#b45309' : '#fcd34d',
    bgDone: isDark ? 'rgba(20, 83, 45, 0.4)' : 'rgba(220, 252, 231, 1)',
    borderDone: isDark ? '#15803d' : '#86efac',
    textDone: isDark ? '#bbf7d0' : '#14532d',
    bgMissed: isDark ? 'rgba(127, 29, 29, 0.25)' : 'rgba(254, 226, 226, 0.6)',
    borderMissed: isDark ? '#7f1d1d' : '#fca5a5',
  };
}
