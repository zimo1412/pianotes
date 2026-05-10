/**
 * Persisted theme: `light` / `dark` / `system` (follow OS prefers-color-scheme).
 */

export function normalizeTheme(raw) {
  if (raw === 'dark') return 'dark';
  if (raw === 'system') return 'system';
  return 'light';
}

/** @returns {boolean} */
export function getSystemPrefersDarkSnapshot() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/** @param {() => void} onStoreChange */
export function subscribeSystemPrefersDark(onStoreChange) {
  if (typeof window === 'undefined') return () => {};
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  mq.addEventListener('change', onStoreChange);
  return () => mq.removeEventListener('change', onStoreChange);
}
