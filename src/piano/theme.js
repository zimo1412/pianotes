/**
 * Persisted theme enum: only `light` / `dark`.
 */

export function normalizeTheme(raw) {
  if (raw === 'dark') return 'dark';
  return 'light';
}
