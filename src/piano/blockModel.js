/**
 * Segment ("block") model + checklist normalization.
 * Progress-page repertoire aggregation: see repertoire.js.
 */

export function newChecklistRowId() {
  return `c_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export function normalizeTags(arr) {
  if (!Array.isArray(arr)) return [];
  const out = [];
  const seen = new Set();
  for (const x of arr) {
    const s = String(x ?? '').trim();
    if (!s) continue;
    const low = s.toLowerCase();
    if (seen.has(low)) continue;
    seen.add(low);
    out.push(s);
  }
  return out;
}

/** Parse comma / Chinese comma / enumeration dot separated tags. */
export function tagsFromCommaInput(str) {
  const parts = String(str ?? '')
    .split(/[,，、]/)
    .map((s) => s.trim())
    .filter(Boolean);
  return normalizeTags(parts);
}

/** Normalize checklist rows; drop empties. */
export function normalizeBlockChecklist(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((row) => ({
      id: typeof row?.id === 'string' && row.id ? row.id : newChecklistRowId(),
      label: String(row?.label ?? '').trim(),
      tags: normalizeTags(Array.isArray(row?.tags) ? row.tags : []),
    }))
    .filter((r) => r.label.length > 0);
}

export function getBlockChecklist(block) {
  if (!block) return [];
  return normalizeBlockChecklist(block.checklist);
}

/**
 * Generate checklist rows from main A/B + optional piece fields (stable ids).
 */
export function deriveChecklistFromPieces(block) {
  const rows = [];
  const push = (id, text) => {
    const label = String(text ?? '').trim();
    if (label) rows.push({ id, label, tags: [] });
  };
  push('mainA', block.mainA);
  push('mainB', block.mainB);
  const oa = String(block.optA?.piece ?? '').trim();
  const ob = String(block.optB?.piece ?? '').trim();
  const la = String(block.optA?.label ?? '').trim();
  const lb = String(block.optB?.label ?? '').trim();
  if (oa) push('optA', la ? `${la} · ${oa}` : oa);
  if (ob) push('optB', lb ? `${lb} · ${ob}` : ob);
  return rows;
}

/** In-memory defaults before normalize / editor i18n. */
export function createEmptyBlock() {
  return {
    id: `b_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    weeks: 4,
    title: '',
    mainA: '',
    mainB: '',
    focusMinutes: 60,
    scalesLabel: '音阶',
    scalesMinutes: 15,
    scalesNote: '',
    optA: { label: '', piece: '', minutes: 15 },
    optB: { label: '', piece: '', minutes: 20 },
    note: '',
    checklist: [],
  };
}

/** Fresh segment draft for the modal (labels via `t`). */
export function createEmptyBlockForEditor(t) {
  const b = createEmptyBlock();
  return {
    ...b,
    scalesLabel: t('defaults.scalesLabel'),
    optA: { ...b.optA, label: t('defaults.blockOptALabel') },
    optB: { ...b.optB, label: t('defaults.blockOptBLabel') },
  };
}

/** Coerce arbitrary saved block into current schema. */
export function normalizeBlock(b) {
  if (!b || typeof b !== 'object') return createEmptyBlock();
  const base = createEmptyBlock();
  return {
    id: typeof b.id === 'string' && b.id.trim() ? b.id.trim() : base.id,
    weeks: Math.max(1, parseInt(b.weeks, 10) || 4),
    title: String(b.title ?? ''),
    mainA: String(b.mainA ?? ''),
    mainB: String(b.mainB ?? ''),
    focusMinutes: clampNum(b.focusMinutes, 5, 300, 60),
    scalesLabel: String(b.scalesLabel ?? base.scalesLabel),
    scalesMinutes: clampNum(b.scalesMinutes, 0, 120, 15),
    scalesNote: String(b.scalesNote ?? ''),
    optA: {
      label: String(b.optA?.label ?? ''),
      piece: String(b.optA?.piece ?? ''),
      minutes: clampNum(b.optA?.minutes, 0, 180, 15),
    },
    optB: {
      label: String(b.optB?.label ?? ''),
      piece: String(b.optB?.piece ?? ''),
      minutes: clampNum(b.optB?.minutes, 0, 180, 20),
    },
    note: String(b.note ?? ''),
    checklist: normalizeBlockChecklist(b.checklist),
  };
}

/** Normalize an array of blocks; non-array -> []. */
export function normalizeBlocks(list) {
  if (!Array.isArray(list)) return [];
  return list.map(normalizeBlock);
}

export function clampNum(v, min, max, fallback) {
  const n = parseInt(v, 10);
  if (Number.isNaN(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}
