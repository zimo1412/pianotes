/**
 * Persistence adapter around localStorage (keys prefixed by STORAGE_PREFIX).
 */

export const STORAGE_PREFIX = 'piano_storage_';

export const practiceStorage = {
  async get(key) {
    try {
      const raw = localStorage.getItem(STORAGE_PREFIX + key);
      return raw != null ? { value: raw } : null;
    } catch {
      return null;
    }
  },
  async set(key, val) {
    try {
      localStorage.setItem(STORAGE_PREFIX + key, String(val));
    } catch {
      /* quota / private mode: silent fail */
    }
  },
};

/** Keys owned by PianoApp (export checklist / debugging). */
export const PERSISTED_KEYS = [
  'startDate',
  'blocks',
  'completed',
  'autoPostponed',
  'theme',
  'routeAnchor',
  'locale',
];
