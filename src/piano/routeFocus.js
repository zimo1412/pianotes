/**
 * Route navigation: current segment, today A/B focus, scales rotation row.
 * Caller passes `scales.rotationPool` from locales.
 * `effectiveDays` is the anchor-relative practice-day index (days since the
 * route anchor, minus auto-deferrals in that window).
 */

import { getPracticeDayAnchor, getDateString } from './dateAnchors.js';

/** Resolve segment for global week index; `block` is null if plan is empty. */
export function getCurrentBlock(blocks, weekNumber) {
  if (!blocks.length) return { block: null, weekInBlock: 0 };
  let cumulativeWeeks = 0;
  for (const block of blocks) {
    if (weekNumber <= cumulativeWeeks + block.weeks) {
      return { block, weekInBlock: weekNumber - cumulativeWeeks };
    }
    cumulativeWeeks += block.weeks;
  }
  return { block: blocks[blocks.length - 1], weekInBlock: Math.max(0, weekNumber - cumulativeWeeks) };
}

/** Monday=0 … Sunday=6 (heatmap + Today weekday labels). */
export function getDayOfWeek(date) {
  const js = new Date(date).getDay();
  return js === 0 ? 6 : js - 1;
}

/**
 * Build "Today" card focus payload.
 * opts: scalesRotationPool, effectiveDays, scalesFallbackLabel (from locales via PianoApp).
 */
export function getFocusForToday(_practiceAnchorDate, blocks, weekNumber, opts) {
  const { scalesRotationPool = [], effectiveDays: rawEffectiveDays, scalesFallbackLabel = '' } = opts || {};
  const ed = Math.max(0, Math.floor(Number(rawEffectiveDays) || 0));
  const poolLen = scalesRotationPool.length;
  const scaleIdx = poolLen ? ed % poolLen : 0;
  const scaleRow = scalesRotationPool[scaleIdx] ?? { scale: '' };

  const { block } = getCurrentBlock(blocks, weekNumber);
  if (!block) {
    return {
      focus: '',
      focusType: 'A',
      scaleDetail: scaleRow.scale,
      scaleRotation: poolLen ? { current: scaleIdx + 1, total: poolLen } : null,
      scalesMinutes: 15,
      scalesLabel: scalesFallbackLabel,
      focusMinutes: 60,
      block: null,
    };
  }

  const scaleDetail = block.scalesNote?.trim() ? block.scalesNote.trim() : scaleRow.scale;
  const isSlotA = ed % 2 === 0;
  const focus = isSlotA ? block.mainA : block.mainB;
  const focusType = isSlotA ? 'A' : 'B';
  return {
    focus,
    focusType,
    scaleDetail,
    scaleRotation: poolLen ? { current: scaleIdx + 1, total: poolLen } : null,
    scalesMinutes: block.scalesMinutes ?? 15,
    scalesLabel: block.scalesLabel || scalesFallbackLabel,
    focusMinutes: block.focusMinutes ?? 60,
    block,
  };
}

/** Default log duration (minutes): scales + main focus + filled optional slots. */
export function defaultLogMinutesFromTodayInfo(info) {
  if (!info?.block) return 90;
  let sum = (Number(info.scalesMinutes) || 0) + (Number(info.focusMinutes) || 0);
  const { block } = info;
  if (String(block.optA?.piece ?? '').trim()) {
    sum += Number.isFinite(Number(block.optA?.minutes)) ? Number(block.optA.minutes) : 15;
  }
  if (String(block.optB?.piece ?? '').trim()) {
    sum += Number.isFinite(Number(block.optB?.minutes)) ? Number(block.optB.minutes) : 20;
  }
  return Math.max(15, Math.round(sum));
}

/** Streak length counting backward from today's practice anchor. */
export function calculateStreak(completed, now = new Date()) {
  let streak = 0;
  let cursor = getPracticeDayAnchor(now);
  if (!completed[getDateString(cursor)]) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (completed[getDateString(cursor)]) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
