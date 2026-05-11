/**
 * Archive export/import (JSON body; filenames often end with .txt).
 * Validates appId/version; paste import strips Markdown ```json code fences.
 */

import { ARCHIVE_APP_ID, ARCHIVE_VERSION } from './constants.js';
import { normalizeBlocks } from './blockModel.js';
import { normalizeTheme } from './theme.js';
import { getPracticeDayAnchor, getDateString } from './dateAnchors.js';

export function buildPracticeArchive(snapshot, readme) {
  return {
    appId: ARCHIVE_APP_ID,
    version: ARCHIVE_VERSION,
    exportedAt: new Date().toISOString(),
    readme:
      readme ||
      '练琴手记完整快照：含练习起点、阶段计划、打卡记录、自动顺延标记、路线锚点与主题；导入会覆盖本机同名键。',
    keys: ['startDate', 'blocks', 'completed', 'autoPostponed', 'theme', 'routeAnchor'],
    startDate: snapshot.startDate,
    blocks: snapshot.blocks,
    completed: snapshot.completed,
    autoPostponed: snapshot.autoPostponed,
    theme: snapshot.theme,
    routeAnchor: snapshot.routeAnchor,
  };
}

function getExampleBlockForTemplate(locale) {
  if (locale === 'en') {
    return {
      id: 'b_example_1',
      weeks: 4,
      title: 'Phase 3 (example)',
      mainA: 'Haydn sonata, mvt 1',
      mainB: 'Chopin Étude Op.10 No.4',
      focusMinutes: 60,
      scalesLabel: 'Scales',
      scalesMinutes: 15,
      scalesNote: '',
      optA: { label: 'Bach', piece: 'Invention No.8', minutes: 15 },
      optB: { label: 'Maintenance', piece: '', minutes: 20 },
      note: 'Optional segment notes.',
      checklist: [
        { id: 'c_main_a', label: 'Haydn sonata, mvt 1', tags: ['Classical', 'Haydn'] },
        { id: 'c_main_b', label: 'Chopin Étude Op.10 No.4', tags: ['Chopin', 'Etude'] },
      ],
    };
  }
  return {
    id: 'b_example_1',
    weeks: 4,
    title: '第三期（示例）',
    mainA: '海顿奏鸣曲第一乐章',
    mainB: '肖邦练习曲 Op.10 No.4',
    focusMinutes: 60,
    scalesLabel: '音阶',
    scalesMinutes: 15,
    scalesNote: '',
    optA: { label: '巴赫', piece: '二部创意曲 No.8', minutes: 15 },
    optB: { label: '保养曲目', piece: '', minutes: 20 },
    note: '可写本阶段学习目标或备忘。',
    checklist: [
      { id: 'c_main_a', label: '海顿奏鸣曲第一乐章', tags: ['古典', '海顿'] },
      { id: 'c_main_b', label: '肖邦练习曲 Op.10 No.4', tags: ['肖邦', '练习曲'] },
    ],
  };
}

/** Export "archive template" payload (schema strings via i18n + example blocks). */
export function buildAiPlanTemplateArchive(t, locale) {
  return {
    appId: ARCHIVE_APP_ID,
    version: ARCHIVE_VERSION,
    exportedAt: new Date().toISOString(),
    readme: t('archive.templateReadme'),
    schemaGuide: t('archive.aiSchemaGuide'),
    keys: ['startDate', 'blocks', 'completed', 'autoPostponed', 'theme', 'routeAnchor'],
    startDate: '2026-01-01',
    blocks: [getExampleBlockForTemplate(locale)],
    completed: {},
    autoPostponed: {},
    theme: 'light',
    routeAnchor: null,
  };
}

export function downloadUtf8TextFile(filename, text) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function stripJsonFencesAndBom(text) {
  let s = String(text ?? '').replace(/^\uFEFF/, '').trim();
  if (s.startsWith('```')) {
    s = s.replace(/^```(?:json)?\s*/i, '');
    const li = s.lastIndexOf('```');
    if (li !== -1) s = s.slice(0, li);
  }
  return s.trim();
}

export function parseImportedArchiveText(raw) {
  return parsePracticeArchiveJson(stripJsonFencesAndBom(raw));
}

export function parsePracticeArchiveJson(text) {
  const data = JSON.parse(text);
  if (!data || typeof data !== 'object') throw new Error('bad');
  if (data.appId !== ARCHIVE_APP_ID) throw new Error('app');
  if (Number(data.version) !== ARCHIVE_VERSION) throw new Error('ver');
  const rawSd = typeof data.startDate === 'string' ? data.startDate.trim() : '';
  const startDate = /^\d{4}-\d{2}-\d{2}$/.test(rawSd) ? rawSd : getDateString(getPracticeDayAnchor(new Date()));
  const blocks = normalizeBlocks(Array.isArray(data.blocks) ? data.blocks : []);
  const completed =
    data.completed && typeof data.completed === 'object' && !Array.isArray(data.completed) ? data.completed : {};
  const autoPostponed =
    data.autoPostponed && typeof data.autoPostponed === 'object' && !Array.isArray(data.autoPostponed)
      ? data.autoPostponed
      : {};
  const theme = normalizeTheme(data.theme);
  const routeAnchor = normalizeRouteAnchor(data.routeAnchor);
  return { startDate, blocks, completed, autoPostponed, theme, routeAnchor };
}

/** Validate `{ date: 'YYYY-MM-DD', week: positive int }` shape; null otherwise. */
function normalizeRouteAnchor(raw) {
  if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const date = typeof raw.date === 'string' ? raw.date.trim() : '';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const wk = typeof raw.week === 'number' ? raw.week : parseInt(String(raw.week ?? '').trim(), 10);
  if (!Number.isFinite(wk) || wk < 1) return null;
  return { date, week: Math.floor(wk) };
}
