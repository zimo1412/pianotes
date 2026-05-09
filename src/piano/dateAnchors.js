/**
 * Practice-day anchor and local-calendar helpers (device timezone).
 * Rollover at local 04:00; auto-defer compares deadlines to `completed` keys.
 */

/** Hour when a new practice day starts (local time). */
export const DAY_ROLLOVER_HOUR = 4;

/**
 * Calendar date (YYYY-MM-DD) for the practice day that `now` belongs to.
 * Between 00:00–03:59 local, still counts as the previous calendar day.
 */
export function getPracticeDayAnchor(now = new Date()) {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (now.getHours() < DAY_ROLLOVER_HOUR) {
    d.setDate(d.getDate() - 1);
  }
  return d;
}

/** Deadline for practice-day key `dayKey`: next calendar day at local 04:00. */
export function getDeadlineForPracticeDayKey(dayKey) {
  const [y, m, dd] = dayKey.split('-').map(Number);
  return new Date(y, m - 1, dd + 1, DAY_ROLLOVER_HOUR, 0, 0, 0);
}

/** Format `date` as YYYY-MM-DD in local calendar. */
export function getDateString(date) {
  const y = date.getFullYear();
  const mo = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${mo}-${d}`;
}

/**
 * Parse YYYY-MM-DD as local midnight. Avoid `new Date('YYYY-MM-DD')` (UTC parsing shifts dates in some TZs).
 */
export function parseLocalDayFromKey(dayKey) {
  if (typeof dayKey !== 'string') return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dayKey.trim());
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (!Number.isFinite(y) || !Number.isFinite(mo) || !Number.isFinite(d)) return null;
  const dt = new Date(y, mo - 1, d, 0, 0, 0, 0);
  if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return null;
  return dt;
}

/** Whole-day difference between two calendar anchors (`d2` may be a date string). */
export function daysBetween(d1, d2) {
  const ms = new Date(d2).getTime() - new Date(d1).getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}
