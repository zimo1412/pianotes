/**
 * Piano Notes shell (练琴手记): persistence, week routing, tabs, modals.
 * Domain logic under src/piano/; tab screens under src/piano/screens/.
 */

import { useState, useEffect, useRef, useMemo, useSyncExternalStore } from 'react';
import { Edit3, TrendingUp, Music, X, Plus, Minus, Flame, Moon, Sun, AlertCircle, Monitor } from 'lucide-react';
import { practiceStorage } from './storage.js';
import { useI18n } from './locales/I18nProvider.jsx';
import { DEFAULT_BLOCKS, PRACTICE_LOG_DURATION_STEP } from './piano/constants.js';
import { normalizeBlock, normalizeBlocks } from './piano/blockModel.js';
import { getPracticeDayAnchor, getDateString, daysBetween, getDeadlineForPracticeDayKey, parseLocalDayFromKey } from './piano/dateAnchors.js';
import { getFocusForToday, defaultLogMinutesFromTodayInfo, calculateStreak } from './piano/routeFocus.js';
import { getSystemPrefersDarkSnapshot, normalizeTheme, subscribeSystemPrefersDark } from './piano/theme.js';
import {
  buildPracticeArchive,
  buildAiPlanTemplateArchive,
  downloadUtf8TextFile,
  parseImportedArchiveText,
} from './piano/archive.js';

import { createAppStyles } from './piano/ui/appStyles.js';
import { iconButton, primaryButton, secondaryButton } from './piano/ui/buttonStyles.js';
import { Modal, TabButton } from './piano/ui/Modal.jsx';
import { TodayScreen } from './piano/screens/TodayScreen.jsx';
import { ProgressScreen } from './piano/screens/ProgressScreen.jsx';
import { PlanScreen } from './piano/screens/PlanScreen.jsx';
import { BlockEditorModal } from './piano/screens/BlockEditorModal.jsx';
import { FONT_UI, displayMixedItalic } from './piano/typography.js';

/**
 * Count entries in `autoPostponed` whose key falls in the half-open range
 * `[startKey, endKey)`. Date keys are zero-padded YYYY-MM-DD so lexicographic
 * comparison matches calendar order.
 */
function countDeferredInRange(autoPostponed, startKey, endKey) {
  let n = 0;
  for (const k of Object.keys(autoPostponed)) {
    if (autoPostponed[k] && k >= startKey && k < endKey) n++;
  }
  return n;
}

export default function PianoApp() {
  const { locale, setLocale, t, messages } = useI18n();
  const [tab, setTab] = useState('today');
  const [startDate, setStartDate] = useState(() => getDateString(getPracticeDayAnchor(new Date())));
  const [blocks, setBlocks] = useState(DEFAULT_BLOCKS);
  const [completed, setCompleted] = useState({});
  const [autoPostponed, setAutoPostponed] = useState({});
  const [planEditor, setPlanEditor] = useState(null);
  const [logModal, setLogModal] = useState(false);
  const [practiceLogMode, setPracticeLogMode] = useState('create');
  const [logDuration, setLogDuration] = useState(90);
  const [logNote, setLogNote] = useState('');
  const [theme, setTheme] = useState('system');
  const [autoMsg, setAutoMsg] = useState(0);
  /**
   * Route anchor: shifts the (anchorDate, anchorWeek) reference for the
   * global week counter. `null` means "use startDate as week 1".
   * Set via `runStartRouteFromBlock`; never derived from auto-defer state.
   * @type {[null | { date: string, week: number }, Function]}
   */
  const [routeAnchor, setRouteAnchor] = useState(null);
  const archiveImportRef = useRef(null);
  const [archivePasteOpen, setArchivePasteOpen] = useState(false);
  const [archivePasteText, setArchivePasteText] = useState('');
  /** null | { kind: 'start'; index: number } | { kind: 'delete'; id: string } */
  const [planConfirm, setPlanConfirm] = useState(null);
  /** Generic confirm / alert (replaces window.confirm / alert) */
  const [appDialog, setAppDialog] = useState(
    /** @type {null | { kind: 'importConfirm'; imported: unknown; closePaste?: boolean } | { kind: 'alert'; title: string; body: string } | { kind: 'undoTodayLog' }} */
    null,
  );

  const systemPrefersDark = useSyncExternalStore(subscribeSystemPrefersDark, getSystemPrefersDarkSnapshot, () => false);
  const resolvedTheme = theme === 'system' ? (systemPrefersDark ? 'dark' : 'light') : theme;
  const isDark = resolvedTheme === 'dark';
  const styles = createAppStyles(isDark);

  useEffect(() => {
    document.documentElement.style.backgroundColor = styles.bg;
    document.body.style.backgroundColor = styles.bg;
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
    let metaTheme = document.querySelector('meta[name="theme-color"]');
    if (!metaTheme) {
      metaTheme = document.createElement('meta');
      metaTheme.setAttribute('name', 'theme-color');
      document.head.appendChild(metaTheme);
    }
    metaTheme.setAttribute('content', styles.bg);
  }, [styles.bg, isDark]);

  useEffect(() => {
    async function load() {
      const practiceDayKey = getDateString(getPracticeDayAnchor(new Date()));
      let sd = practiceDayKey;
      let sdExisted = false;
      try {
        const r = await practiceStorage.get('startDate');
        if (r && r.value != null && String(r.value).trim() !== '') {
          sd = String(r.value).trim();
          sdExisted = true;
        }
      } catch (e) {}
      if (!sdExisted || !parseLocalDayFromKey(sd)) {
        sd = practiceDayKey;
        sdExisted = false;
      }
      if (!sdExisted) {
        try {
          await practiceStorage.set('startDate', practiceDayKey);
        } catch (e) {}
      }
      setStartDate(sd);

      let curCompleted = {};
      try {
        const r = await practiceStorage.get('completed');
        if (r) curCompleted = JSON.parse(r.value);
      } catch (e) {}
      setCompleted(curCompleted);

      let curAuto = {};
      try {
        const r = await practiceStorage.get('autoPostponed');
        if (r) curAuto = JSON.parse(r.value);
      } catch (e) {}

      try {
        const r = await practiceStorage.get('blocks');
        if (r) setBlocks(normalizeBlocks(JSON.parse(r.value)));
      } catch (e) {}
      try {
        const r = await practiceStorage.get('theme');
        if (r) {
          const v = normalizeTheme(r.value);
          setTheme(v);
          if (v !== r.value)
            try {
              await practiceStorage.set('theme', v);
            } catch (e2) {}
        }
      } catch (e) {}

      try {
        const r = await practiceStorage.get('routeAnchor');
        if (r && r.value !== '') {
          const parsed = JSON.parse(r.value);
          if (
            parsed &&
            typeof parsed === 'object' &&
            typeof parsed.date === 'string' &&
            /^\d{4}-\d{2}-\d{2}$/.test(parsed.date) &&
            Number.isFinite(Number(parsed.week)) &&
            Number(parsed.week) >= 1
          ) {
            setRouteAnchor({ date: parsed.date, week: Math.floor(Number(parsed.week)) });
          }
        }
      } catch (e) {}

      // Auto-defer: any past practice-day with no log gets marked in autoPostponed.
      // This is the SOLE source of truth for "missed days"; week math derives a
      // separate count from the (anchor, today) window so anchoring never
      // touches this dict.
      const now = new Date();
      const cursor = parseLocalDayFromKey(sd) ?? parseLocalDayFromKey(practiceDayKey);
      if (!cursor) return;
      let added = 0;
      const newAuto = { ...curAuto };
      while (true) {
        const k = getDateString(cursor);
        if (getDeadlineForPracticeDayKey(k) > now) break;
        if (!curCompleted[k] && !newAuto[k]) {
          added++;
          newAuto[k] = true;
        }
        cursor.setDate(cursor.getDate() + 1);
      }
      setAutoPostponed(newAuto);
      if (added > 0) {
        try {
          await practiceStorage.set('autoPostponed', JSON.stringify(newAuto));
        } catch (e) {}
        setAutoMsg(added);
      }
    }
    load();
  }, []);

  async function saveRouteAnchor(next) {
    setRouteAnchor(next);
    if (next == null) await save('routeAnchor', '');
    else await save('routeAnchor', { date: next.date, week: next.week });
  }

  /** Clear or clamp routeAnchor.week if blocks shrink below it. */
  useEffect(() => {
    const tw = blocks.reduce((s, b) => s + b.weeks, 0);
    setRouteAnchor((cur) => {
      if (cur == null) return cur;
      if (tw <= 0) {
        void save('routeAnchor', '');
        return null;
      }
      const clamped = Math.min(tw, Math.max(1, cur.week));
      if (clamped === cur.week) return cur;
      const next = { date: cur.date, week: clamped };
      void save('routeAnchor', next);
      return next;
    });
  }, [blocks]);

  async function save(key, val) {
    try {
      await practiceStorage.set(key, typeof val === 'string' ? val : JSON.stringify(val));
    } catch (e) {}
  }
  async function saveBlocks(b) {
    setBlocks(b);
    save('blocks', b);
  }
  async function saveCompleted(c) {
    setCompleted(c);
    save('completed', c);
  }
  async function saveTheme(th) {
    setTheme(th);
    save('theme', th);
  }
  async function saveStartDate(sd) {
    setStartDate(sd);
    await save('startDate', sd);
  }

  function exportPracticeArchive() {
    const payload = buildPracticeArchive(
      {
        startDate,
        blocks,
        completed,
        autoPostponed,
        theme,
        routeAnchor,
      },
      t('archive.readme'),
    );
    downloadUtf8TextFile(`${t('archive.downloadPrefix')}${getDateString(new Date())}.txt`, JSON.stringify(payload, null, 2));
  }

  function exportAiPlanTemplate() {
    const payload = buildAiPlanTemplateArchive(t, locale);
    downloadUtf8TextFile(`${t('archive.downloadTemplatePrefix')}${getDateString(new Date())}.txt`, JSON.stringify(payload, null, 2));
  }

  async function commitImportedArchive(imported) {
    await saveStartDate(imported.startDate);
    setBlocks(imported.blocks);
    await save('blocks', imported.blocks);
    setCompleted(imported.completed);
    await save('completed', imported.completed);
    setAutoPostponed(imported.autoPostponed);
    await save('autoPostponed', imported.autoPostponed);
    await saveTheme(imported.theme);
    await saveRouteAnchor(imported.routeAnchor ?? null);
    setAutoMsg(0);
    setPlanEditor(null);
  }

  function openImportOverwriteConfirm(imported, options) {
    setAppDialog({ kind: 'importConfirm', imported, closePaste: options?.closePaste });
  }

  function handleArchiveImportChange(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = parseImportedArchiveText(String(reader.result ?? ''));
        openImportOverwriteConfirm(imported);
      } catch {
        setAppDialog({ kind: 'alert', title: t('confirm.alertTitle'), body: t('archive.importError') });
      }
    };
    reader.readAsText(file, 'UTF-8');
  }

  function handleArchivePasteSubmit() {
    try {
      const imported = parseImportedArchiveText(archivePasteText);
      openImportOverwriteConfirm(imported, { closePaste: true });
    } catch {
      setAppDialog({ kind: 'alert', title: t('confirm.alertTitle'), body: t('archive.importError') });
    }
  }

  const today = getPracticeDayAnchor(new Date());
  const todayStr = getDateString(today);
  const totalWeeks = blocks.reduce((s, b) => s + b.weeks, 0);

  // Display stat (header): cumulative auto-deferrals since startDate. Never reset.
  const totalDeferred = useMemo(
    () => Object.values(autoPostponed).reduce((n, v) => (v ? n + 1 : n), 0),
    [autoPostponed],
  );

  // Week math is anchored: anchor defaults to (startDate, week 1) if user hasn't
  // explicitly anchored via "Start here". Auto-defer entries before the anchor
  // are intentionally ignored — only deferrals that happen *after* anchoring
  // slow week progression.
  const anchorDate = routeAnchor?.date ?? startDate;
  const anchorWeek = routeAnchor?.week ?? 1;
  const daysSinceAnchor = Math.max(0, daysBetween(anchorDate, todayStr));
  const deferredSinceAnchor = useMemo(
    () => countDeferredInRange(autoPostponed, anchorDate, todayStr),
    [autoPostponed, anchorDate, todayStr],
  );
  const effectiveDays = Math.max(0, daysSinceAnchor - deferredSinceAnchor);
  const weekNumber =
    totalWeeks > 0 ? Math.min(totalWeeks, anchorWeek + Math.floor(effectiveDays / 7)) : 0;

  const scalesRotationPool = messages.scales.rotationPool;
  const scalesFallbackLabel = messages.scales.fallbackLabel;
  const todayInfo = getFocusForToday(today, blocks, weekNumber, {
    scalesRotationPool,
    effectiveDays,
    scalesFallbackLabel,
  });
  const completedToday = completed[todayStr];
  const streak = calculateStreak(completed, new Date());

  // Make-up for yesterday: precomputed so the Today tab can offer a one-tap
  // backfill when the user practiced but forgot to log it (saving will also
  // drop yesterday from autoPostponed if it was already auto-deferred).
  const yesterday = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() - 1);
    return d;
  }, [today]);
  const yesterdayStr = useMemo(() => getDateString(yesterday), [yesterday]);
  const canMakeupYesterday = !completed[yesterdayStr] && yesterdayStr >= startDate;
  const yesterdayInfo = useMemo(() => {
    const dsa = Math.max(0, daysBetween(anchorDate, yesterdayStr));
    const dis = countDeferredInRange(autoPostponed, anchorDate, yesterdayStr);
    const ed = Math.max(0, dsa - dis);
    const wn = totalWeeks > 0 ? Math.min(totalWeeks, anchorWeek + Math.floor(ed / 7)) : 0;
    return getFocusForToday(yesterday, blocks, wn, {
      scalesRotationPool,
      effectiveDays: ed,
      scalesFallbackLabel,
    });
  }, [yesterday, yesterdayStr, anchorDate, anchorWeek, autoPostponed, totalWeeks, blocks, scalesRotationPool, scalesFallbackLabel]);
  const yesterdayDateLabel = useMemo(
    () => yesterday.toLocaleDateString(locale === 'en' ? 'en-US' : 'zh-CN', { month: 'long', day: 'numeric', weekday: 'long' }),
    [yesterday, locale],
  );
  const yesterdayDateShort = useMemo(
    () => yesterday.toLocaleDateString(locale === 'en' ? 'en-US' : 'zh-CN', { month: 'short', day: 'numeric' }),
    [yesterday, locale],
  );

  const plannedDefaultLogMinutes = useMemo(() => {
    const [y, mo, d] = todayStr.split('-').map(Number);
    const anchor = getPracticeDayAnchor(new Date(y, mo - 1, d, 12, 0, 0, 0));
    const info = getFocusForToday(anchor, blocks, weekNumber, {
      scalesRotationPool: messages.scales.rotationPool,
      effectiveDays,
      scalesFallbackLabel: messages.scales.fallbackLabel,
    });
    return defaultLogMinutesFromTodayInfo(info);
  }, [todayStr, blocks, weekNumber, messages, effectiveDays]);

  /** When opening "new log" modal, seed duration from today's computed totals */
  useEffect(() => {
    if (!logModal || practiceLogMode !== 'create') return;
    setLogDuration(plannedDefaultLogMinutes);
  }, [logModal, practiceLogMode, plannedDefaultLogMinutes]);

  function resetPracticeLogDraft() {
    setPracticeLogMode('create');
    setLogNote('');
  }

  function openPracticeLogCreate() {
    resetPracticeLogDraft();
    setLogModal(true);
  }

  function openPracticeLogEdit() {
    const c = completed[todayStr];
    if (!c) return;
    setPracticeLogMode('edit');
    setLogDuration(Number.isFinite(Number(c.duration)) ? Number(c.duration) : defaultLogMinutesFromTodayInfo(todayInfo));
    setLogNote(typeof c.note === 'string' ? c.note : '');
    setLogModal(true);
  }

  function openMakeupYesterday() {
    if (!canMakeupYesterday) return;
    setPracticeLogMode('makeup');
    setLogNote('');
    setLogDuration(defaultLogMinutesFromTodayInfo(yesterdayInfo));
    setLogModal(true);
  }

  function handleUndoTodayLog() {
    setAppDialog({ kind: 'undoTodayLog' });
  }

  function handleLogPractice() {
    if (practiceLogMode === 'makeup') {
      // Backfill yesterday: write the log AND drop any auto-deferral for that
      // day so week math and the header stat both reflect the recovered day.
      const next = { ...completed, [yesterdayStr]: { duration: logDuration, note: logNote, focus: yesterdayInfo?.focus } };
      saveCompleted(next);
      if (autoPostponed[yesterdayStr]) {
        const nextAuto = { ...autoPostponed };
        delete nextAuto[yesterdayStr];
        setAutoPostponed(nextAuto);
        void save('autoPostponed', nextAuto);
      }
      setLogModal(false);
      resetPracticeLogDraft();
      return;
    }
    saveCompleted({ ...completed, [todayStr]: { duration: logDuration, note: logNote, focus: todayInfo?.focus } });
    setLogModal(false);
    resetPracticeLogDraft();
  }

  /**
   * Plan: anchor today as week 1 day 1 of the chosen segment.
   * Only writes `routeAnchor`; does not touch `startDate`, `autoPostponed`,
   * or any other state. Future check-ins advance the week counter naturally
   * from this anchor; pre-anchor deferrals do not affect week math.
   */
  function runStartRouteFromBlock(blockIndex) {
    const bi = blockIndex;
    if (bi < 0 || bi >= blocks.length) return;
    let cumBefore = 0;
    for (let i = 0; i < bi; i++) cumBefore += blocks[i].weeks;
    const stageStartWeek = cumBefore + 1;
    void saveRouteAnchor({ date: todayStr, week: stageStartWeek });
  }

  function cycleTheme() {
    const order = ['light', 'dark', 'system'];
    const i = order.indexOf(theme);
    const next = order[(i >= 0 ? i + 1 : 1) % order.length];
    saveTheme(next);
  }

  function applyPlanEditorSave(payload) {
    const normalized = normalizeBlock(payload);
    if (!planEditor) return;
    if (planEditor.mode === 'add') saveBlocks([...blocks, normalized]);
    else saveBlocks(blocks.map((b) => (b.id === normalized.id ? normalized : b)));
    setPlanEditor(null);
  }

  function removePlanBlockCore(id) {
    saveBlocks(blocks.filter((b) => b.id !== id));
    setPlanEditor(null);
  }

  const themeName =
    theme === 'system'
      ? t('header.themeSystemWithAppearance', {
          appearance: isDark ? t('header.themeDark') : t('header.themeLight'),
        })
      : theme === 'dark'
        ? t('header.themeDark')
        : t('header.themeLight');

  const headerCornerBtn = {
    width: 36,
    height: 36,
    padding: 0,
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    color: styles.textMuted,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    flexShrink: 0,
    lineHeight: 1,
  };

  return (
    <div style={{ minHeight: '100vh', background: styles.bg, fontFamily: FONT_UI, transition: 'background 0.3s', color: styles.text }}>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500;1,600;1,700&family=Noto+Serif+SC:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

      <div style={{ maxWidth: 448, margin: '0 auto', paddingBottom: 96 }}>
        <header style={{ paddingTop: 'max(24px, calc(env(safe-area-inset-top) + 24px))', paddingRight: 24, paddingBottom: 16, paddingLeft: 24, borderBottom: `1px solid ${styles.border}` }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
            <h1 style={{ ...displayMixedItalic, flex: 1, minWidth: 0, margin: 0, padding: 0, fontSize: 34, color: styles.text, fontWeight: 700, lineHeight: 1, letterSpacing: '-0.01em' }}>
              {t('header.titleBefore')}
              <span style={{ color: styles.primary }}>{t('header.titleAccent')}</span>
            </h1>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: 4, flexShrink: 0, transform: 'translateY(-3px)' }}>
              <button
                type="button"
                onClick={() => void setLocale(locale === 'zh' ? 'en' : 'zh')}
                style={{ ...headerCornerBtn, fontSize: 12, fontFamily: '"Noto Serif SC", serif', fontWeight: 800, letterSpacing: '0.06em' }}
                title={locale === 'zh' ? t('header.langSwitchToEn') : t('header.langSwitchToZh')}
              >
                {locale === 'zh' ? 'EN' : '中'}
              </button>
              <button
                type="button"
                onClick={cycleTheme}
                style={headerCornerBtn}
                title={`${t('header.themeTitle', { name: themeName })} · ${t('header.themeCycleHint')}`}
                aria-label={themeName}
              >
                {theme === 'system' ? (
                  <Monitor size={20} strokeWidth={2.5} />
                ) : isDark ? (
                  <Moon size={20} strokeWidth={2.5} />
                ) : (
                  <Sun size={20} strokeWidth={2.5} />
                )}
              </button>
            </div>
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 12, color: styles.textFaint, fontFamily: '"Noto Serif SC", serif', fontWeight: 700, letterSpacing: '0.06em', lineHeight: 1.3 }}>
              <span>{totalWeeks > 0 ? t('header.weekProgress', { current: weekNumber, total: totalWeeks }) : t('header.weekProgressNoPlan')}</span>
              {streak > 0 && (
                <span style={{ color: styles.accent, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                  <Flame size={12} strokeWidth={3} /> {t('header.streakLine', { n: streak })}
                </span>
              )}
              {totalDeferred > 0 && <span style={{ color: styles.accent }}>{t('header.skippedLine', { n: totalDeferred })}</span>}
            </div>
          </div>
        </header>

        {autoMsg > 0 && (
          <div style={{ margin: '16px 24px 0', padding: '10px 12px', background: styles.bgMissed, border: `1px solid ${styles.borderMissed}`, fontSize: 12, color: styles.textSoft, fontFamily: '"Noto Serif SC", serif', fontWeight: 700, letterSpacing: '0.04em', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <AlertCircle size={14} strokeWidth={3} /> {t('autoDeferBanner', { n: autoMsg })}
            </span>
            <button onClick={() => setAutoMsg(0)} style={{ background: 'none', border: 'none', color: styles.textFaint, cursor: 'pointer', padding: 0, display: 'flex' }}>
              <X size={14} strokeWidth={3} />
            </button>
          </div>
        )}

        {tab === 'today' && (
          <TodayScreen
            styles={styles}
            todayInfo={todayInfo}
            completedToday={completedToday}
            onOpenNewLog={openPracticeLogCreate}
            onEditLog={openPracticeLogEdit}
            onUndoLog={handleUndoTodayLog}
            onMakeupYesterday={openMakeupYesterday}
            canMakeupYesterday={canMakeupYesterday}
            yesterdayDateLabel={yesterdayDateLabel}
            yesterdayDateShort={yesterdayDateShort}
            today={today}
            streak={streak}
            blocks={blocks}
            weekNumber={weekNumber}
            totalWeeks={totalWeeks}
          />
        )}
        {tab === 'progress' && (
          <ProgressScreen styles={styles} isDark={isDark} weekNumber={weekNumber} totalWeeks={totalWeeks} completed={completed} blocks={blocks} streak={streak} today={today} />
        )}
        {tab === 'plan' && (
          <PlanScreen
            styles={styles}
            blocks={blocks}
            weekNumber={weekNumber}
            setPlanEditor={setPlanEditor}
            onRequestStartFromBlock={(bi) => setPlanConfirm({ kind: 'start', index: bi })}
            onRequestDeletePlanBlock={(id) => setPlanConfirm({ kind: 'delete', id })}
            onExportArchive={exportPracticeArchive}
            onPickImportArchive={() => archiveImportRef.current?.click()}
            onOpenArchivePaste={() => setArchivePasteOpen(true)}
            onExportAiTemplate={exportAiPlanTemplate}
          />
        )}

        <input ref={archiveImportRef} type="file" accept="application/json,.json,text/plain,.txt" style={{ display: 'none' }} onChange={handleArchiveImportChange} />

        {archivePasteOpen && (
          <Modal
            styles={styles}
            onClose={() => {
              setArchivePasteOpen(false);
              setArchivePasteText('');
            }}
          >
            <h3 style={{ ...displayMixedItalic, fontSize: 22, marginBottom: 12, color: styles.text, fontWeight: 700 }}>
              {t('archive.pasteTitle')}
            </h3>
            <p style={{ fontSize: 12, color: styles.textMuted, marginBottom: 14, lineHeight: 1.55, fontWeight: 600 }}>
              {t('archive.pasteHint')}
            </p>
            <textarea
              value={archivePasteText}
              onChange={(e) => setArchivePasteText(e.target.value)}
              placeholder={t('archive.pastePlaceholder')}
              rows={14}
              spellCheck={false}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: `1px solid ${styles.border}`,
                borderRadius: 2,
                background: isDark ? styles.bgCard : '#fff',
                color: styles.text,
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                fontSize: 12,
                lineHeight: 1.45,
                boxSizing: 'border-box',
                resize: 'vertical',
                minHeight: 220,
              }}
            />
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button type="button" onClick={handleArchivePasteSubmit} style={{ ...primaryButton(styles), flex: 1 }}>
                {t('archive.pasteSubmit')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setArchivePasteOpen(false);
                  setArchivePasteText('');
                }}
                style={{ ...secondaryButton(styles), flex: 1 }}
              >
                {t('editor.cancel')}
              </button>
            </div>
          </Modal>
        )}

        <nav
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            maxWidth: 448,
            margin: '0 auto',
            background: isDark ? 'rgba(23, 20, 17, 0.95)' : 'rgba(250, 250, 249, 0.95)',
            backdropFilter: 'blur(8px)',
            borderTop: `1px solid ${styles.border}`,
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
          }}
        >
          <TabButton styles={styles} icon={<Music size={18} strokeWidth={3} />} label={t('tabs.today')} active={tab === 'today'} onClick={() => setTab('today')} />
          <TabButton styles={styles} icon={<TrendingUp size={18} strokeWidth={3} />} label={t('tabs.progress')} active={tab === 'progress'} onClick={() => setTab('progress')} />
          <TabButton styles={styles} icon={<Edit3 size={18} strokeWidth={3} />} label={t('tabs.plan')} active={tab === 'plan'} onClick={() => setTab('plan')} />
        </nav>

        {logModal && (
          <Modal
            styles={styles}
            onClose={() => {
              setLogModal(false);
              resetPracticeLogDraft();
            }}
          >
            <h3 style={{ ...displayMixedItalic, fontSize: 24, marginBottom: practiceLogMode === 'makeup' ? 4 : 16, color: styles.text, fontWeight: 700 }}>
              {practiceLogMode === 'edit'
                ? t('logModal.titleEdit')
                : practiceLogMode === 'makeup'
                  ? t('logModal.titleMakeup')
                  : t('logModal.title')}
            </h3>
            {practiceLogMode === 'makeup' && (
              <p style={{ fontSize: 13, color: styles.textMuted, marginTop: 0, marginBottom: 16, fontFamily: '"Noto Serif SC", serif', fontWeight: 600 }}>
                {t('logModal.makeupSubtitle', { date: yesterdayDateLabel })}
              </p>
            )}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, letterSpacing: '0.08em', color: styles.textFaint, marginBottom: 8, display: 'block', fontFamily: '"Noto Serif SC", serif', fontWeight: 700 }}>
                {t('logModal.durationLabel')}
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <button
                  type="button"
                  aria-label={t('logModal.durationMinusStepAria', { step: PRACTICE_LOG_DURATION_STEP })}
                  onClick={() => setLogDuration((d) => Math.max(0, d - PRACTICE_LOG_DURATION_STEP))}
                  style={{ ...iconButton(styles), width: 52, height: 52, minWidth: 52, flexShrink: 0 }}
                >
                  <Minus size={22} strokeWidth={3} />
                </button>
                <div
                  style={{
                    ...displayMixedItalic,
                    flex: 1,
                    textAlign: 'center',
                    fontSize: 30,
                    padding: '12px 8px',
                    color: styles.text,
                    fontWeight: 700,
                    lineHeight: 1.2,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {logDuration}
                  <span style={{ fontSize: 15, fontStyle: 'normal', fontWeight: 700, fontFamily: FONT_UI, color: styles.textFaint, marginLeft: 6 }}>
                    {t('logModal.durationSuffix')}
                  </span>
                </div>
                <button
                  type="button"
                  aria-label={t('logModal.durationPlusStepAria', { step: PRACTICE_LOG_DURATION_STEP })}
                  onClick={() => setLogDuration((d) => Math.min(720, d + PRACTICE_LOG_DURATION_STEP))}
                  style={{ ...iconButton(styles), width: 52, height: 52, minWidth: 52, flexShrink: 0 }}
                >
                  <Plus size={22} strokeWidth={3} />
                </button>
              </div>
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 12, letterSpacing: '0.08em', color: styles.textFaint, marginBottom: 8, display: 'block', fontFamily: '"Noto Serif SC", serif', fontWeight: 700 }}>
                {t('logModal.noteLabel')}
              </label>
              <textarea
                value={logNote}
                onChange={(e) => setLogNote(e.target.value)}
                placeholder={t('logModal.notePlaceholder')}
                style={{ width: '100%', padding: 12, border: `1px solid ${styles.border}`, background: isDark ? styles.bgCard : '#fff', color: styles.text, fontSize: 14, fontFamily: 'inherit', fontWeight: 600, resize: 'vertical' }}
                rows={3}
              />
            </div>
            <button type="button" onClick={handleLogPractice} style={primaryButton(styles)}>
              {t('logModal.save')}
            </button>
          </Modal>
        )}

        {planEditor && (
          <BlockEditorModal
            styles={styles}
            isDark={isDark}
            planEditor={planEditor}
            blocks={blocks}
            onClose={() => setPlanEditor(null)}
            onSave={applyPlanEditorSave}
            onDelete={(id) => setPlanConfirm({ kind: 'delete', id })}
          />
        )}

        {planConfirm && (
          <Modal styles={styles} onClose={() => setPlanConfirm(null)}>
            <h3 style={{ ...displayMixedItalic, fontSize: 22, marginBottom: 14, color: styles.text, fontWeight: 700 }}>
              {t('confirm.planDialogTitle')}
            </h3>
            <p style={{ fontSize: 13, color: styles.textMuted, marginBottom: 20, lineHeight: 1.65, fontFamily: '"Noto Serif SC", serif', fontWeight: 600 }}>
              {planConfirm.kind === 'start' ? t('confirm.startFromBlock') : t('confirm.deleteBlock')}
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" onClick={() => setPlanConfirm(null)} style={{ ...secondaryButton(styles), flex: 1 }}>
                {t('editor.cancel')}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (planConfirm.kind === 'start') runStartRouteFromBlock(planConfirm.index);
                  else removePlanBlockCore(planConfirm.id);
                  setPlanConfirm(null);
                }}
                style={{ ...primaryButton(styles), flex: 1 }}
              >
                {t('confirm.confirmBtn')}
              </button>
            </div>
          </Modal>
        )}

        {appDialog && (
          <Modal styles={styles} onClose={() => setAppDialog(null)}>
            <h3 style={{ ...displayMixedItalic, fontSize: 22, marginBottom: 14, color: styles.text, fontWeight: 700 }}>
              {appDialog.kind === 'alert' ? appDialog.title : t('confirm.planDialogTitle')}
            </h3>
            <p style={{ fontSize: 13, color: styles.textMuted, marginBottom: 20, lineHeight: 1.65, fontFamily: '"Noto Serif SC", serif', fontWeight: 600 }}>
              {appDialog.kind === 'alert'
                ? appDialog.body
                : appDialog.kind === 'importConfirm'
                  ? t('archive.importConfirm')
                  : t('confirm.undoTodayLog')}
            </p>
            {appDialog.kind === 'alert' ? (
              <button type="button" onClick={() => setAppDialog(null)} style={{ ...primaryButton(styles), width: '100%' }}>
                {t('confirm.confirmBtn')}
              </button>
            ) : (
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={() => setAppDialog(null)} style={{ ...secondaryButton(styles), flex: 1 }}>
                  {t('editor.cancel')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (appDialog.kind === 'importConfirm') {
                      void commitImportedArchive(appDialog.imported);
                      if (appDialog.closePaste) {
                        setArchivePasteOpen(false);
                        setArchivePasteText('');
                      }
                    } else {
                      const next = { ...completed };
                      delete next[todayStr];
                      saveCompleted(next);
                      resetPracticeLogDraft();
                    }
                    setAppDialog(null);
                  }}
                  style={{ ...primaryButton(styles), flex: 1 }}
                >
                  {t('confirm.confirmBtn')}
                </button>
              </div>
            )}
          </Modal>
        )}
      </div>
    </div>
  );
}
