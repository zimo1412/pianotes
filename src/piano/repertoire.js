/**
 * Progress-page repertoire: driven only by per-segment checklists.
 * Segment completion rule: `isStageCompletedForProgress`.
 */

import { getBlockChecklist, normalizeTags } from './blockModel.js';

/** Whether segment ending at `endWeek` counts as finished for repertoire purposes. */
export function isStageCompletedForProgress(endWeek, weekNumber, totalWeeks) {
  if (weekNumber > endWeek) return true;
  if (totalWeeks > 0 && endWeek === totalWeeks && weekNumber >= endWeek) return true;
  return false;
}

/** Map checklist rows to `{ id, title, tags }` for aggregation. */
export function getRepertoireRowsFromBlock(block) {
  return getBlockChecklist(block).map((row) => ({
    id: row.id,
    title: row.label,
    tags: normalizeTags(row.tags),
  }));
}

export function normalizePieceTitleKey(title) {
  return String(title).trim().toLowerCase().replace(/\s+/g, ' ');
}

/** Deduplicate titles across finished segments (first spelling wins). */
export function getDedupedCompletedPieceTitles(blocks, weekNumber, totalWeeks) {
  let cumulative = 0;
  const seen = new Set();
  const pool = [];
  for (const block of blocks) {
    cumulative += block.weeks;
    const endWeek = cumulative;
    if (!isStageCompletedForProgress(endWeek, weekNumber, totalWeeks)) continue;
    for (const row of getRepertoireRowsFromBlock(block)) {
      const k = normalizePieceTitleKey(row.title);
      if (seen.has(k)) continue;
      seen.add(k);
      pool.push(row.title);
    }
  }
  return pool;
}

/**
 * Group finished pieces by tag; empty-tag rows bucket under `t('progress.tagUncategorized')`.
 */
export function buildCompletedRepertoireByTag(blocks, weekNumber, totalWeeks, t) {
  const uncategorizedLabel = t('progress.tagUncategorized');
  let cumulative = 0;
  /** @type {Map<string, Map<string, { title: string, stages: Set<string> }>>} */
  const groupMaps = new Map();

  function ensureGroup(tag) {
    if (!groupMaps.has(tag)) groupMaps.set(tag, new Map());
    return groupMaps.get(tag);
  }

  for (const block of blocks) {
    const startWeek = cumulative + 1;
    cumulative += block.weeks;
    const endWeek = cumulative;
    if (!isStageCompletedForProgress(endWeek, weekNumber, totalWeeks)) continue;

    const stageLine = t('progress.pieceStageHint', { start: startWeek, end: endWeek });

    for (const row of getRepertoireRowsFromBlock(block)) {
      const tags = row.tags.length ? row.tags : [uncategorizedLabel];
      for (const tag of tags) {
        const m = ensureGroup(tag);
        const key = normalizePieceTitleKey(row.title);
        if (!m.has(key)) m.set(key, { title: row.title, stages: new Set() });
        m.get(key).stages.add(stageLine);
      }
    }
  }

  const sortedTags = [...groupMaps.keys()].sort((a, b) => {
    if (a === uncategorizedLabel) return 1;
    if (b === uncategorizedLabel) return -1;
    return a.localeCompare(b, undefined, { sensitivity: 'base' });
  });

  return sortedTags
    .map((tag) => {
      const m = groupMaps.get(tag);
      const items = [...m.values()].map((v) => ({
        title: v.title,
        stageHint: [...v.stages].sort().join(t('progress.stageHintJoiner')),
      }));
      items.sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }));
      return { tag, items };
    })
    .filter((g) => g.items.length > 0);
}
