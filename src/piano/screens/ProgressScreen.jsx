/**
 * Progress tab: stat tiles, heatmap, repertoire grouped by tags.
 * Heatmap + Stat* helpers stay in this file to avoid fragmentation.
 */

import { Check, Flame } from 'lucide-react';
import { useI18n } from '../../locales/I18nProvider.jsx';
import {
  buildCompletedRepertoireByTag,
  getRepertoireRowsFromBlock,
  isStageCompletedForProgress,
  normalizePieceTitleKey,
} from '../repertoire.js';
import { getDayOfWeek } from '../routeFocus.js';
import { getDateString } from '../dateAnchors.js';
import { displayMixedItalic, TAB_LH_BODY, TAB_LH_META, TAB_LH_TIGHT } from '../typography.js';
import { MixedScriptBalance } from '../ui/MixedScriptBalance.jsx';

function Heatmap({ styles, isDark, completed, today }) {
  const { t, messages } = useI18n();
  const weekdays = messages.heatmap.weekdays;
  const weeks = 16;
  const todayDow = getDayOfWeek(today);
  const cells = [];
  for (let w = weeks - 1; w >= 0; w--) {
    const weekRow = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(today);
      const offset = w * 7 + (todayDow - d);
      date.setDate(date.getDate() - offset);
      const key = getDateString(date);
      const log = completed[key];
      weekRow.push({ date, key, log, future: date > today });
    }
    cells.push(weekRow);
  }

  return (
    <div>
      <div
        style={{
          overflowX: 'auto',
          width: '100%',
          WebkitOverflowScrolling: 'touch',
          textAlign: 'center',
        }}
      >
        <div style={{ display: 'inline-block', textAlign: 'left', verticalAlign: 'top' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `max-content repeat(${weeks}, 18px)`,
              gridTemplateRows: 'repeat(7, 18px)',
              columnGap: 4,
              rowGap: 4,
              fontFamily: '"Noto Serif SC", serif',
              fontWeight: 800,
              fontSize: 11,
              color: styles.textFaint,
              letterSpacing: '0.02em',
            }}
          >
          {weekdays.map((d, i) => (
            <div
              key={`dow-${i}`}
              style={{
                gridRow: i + 1,
                gridColumn: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                lineHeight: 1,
                paddingRight: 10,
              }}
            >
              {d}
            </div>
          ))}
          {cells.map((week, wi) =>
            week.map((cell, di) => {
              const baseStyle = {
                gridRow: di + 1,
                gridColumn: wi + 2,
                boxSizing: 'border-box',
                width: 18,
                height: 18,
                borderRadius: 2,
              };
              if (cell.future) {
                return <div key={`${wi}-${di}`} style={{ ...baseStyle, border: `1px solid ${styles.borderSoft}`, opacity: 0.3 }} />;
              }
              if (!cell.log) {
                return <div key={`${wi}-${di}`} style={{ ...baseStyle, border: `1px solid ${styles.borderSoft}` }} title={cell.key} />;
              }
              const intensity = Math.min(1, (cell.log.duration || 30) / 90);
              const alpha = 0.3 + intensity * 0.7;
              const color = isDark ? `rgba(251, 191, 36, ${alpha})` : `rgba(146, 64, 14, ${alpha})`;
              return (
                <div key={`${wi}-${di}`} style={{ ...baseStyle, background: color }} title={t('heatmap.durationTitle', { date: cell.key, minutes: cell.log.duration })} />
              );
            }),
          )}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, marginTop: 12, fontSize: 12, color: styles.textFaint, fontFamily: '"Noto Serif SC", serif', fontWeight: 700, flexWrap: 'wrap', lineHeight: TAB_LH_META }}>
        <span>{t('heatmap.less')}</span>
        <div style={{ width: 12, height: 12, border: `1px solid ${styles.borderSoft}`, borderRadius: 2, boxSizing: 'border-box' }} />
        <div style={{ width: 12, height: 12, background: isDark ? 'rgba(251, 191, 36, 0.4)' : 'rgba(146, 64, 14, 0.4)', borderRadius: 2, boxSizing: 'border-box' }} />
        <div style={{ width: 12, height: 12, background: isDark ? 'rgba(251, 191, 36, 0.7)' : 'rgba(146, 64, 14, 0.7)', borderRadius: 2, boxSizing: 'border-box' }} />
        <div style={{ width: 12, height: 12, background: isDark ? 'rgba(251, 191, 36, 1)' : 'rgba(146, 64, 14, 1)', borderRadius: 2, boxSizing: 'border-box' }} />
        <span>{t('heatmap.more')}</span>
      </div>
    </div>
  );
}

function StatValueFraction({ styles, numerator, denominator }) {
  const numStyle = {
    ...displayMixedItalic,
    fontSize: 30,
    fontWeight: 600,
    color: styles.text,
    lineHeight: 1,
    fontVariantNumeric: 'tabular-nums',
  };
  const slashStyle = {
    fontSize: 14,
    fontWeight: 700,
    fontFamily: '"Noto Serif SC", serif',
    fontStyle: 'normal',
    color: styles.textMuted,
    padding: '0 5px',
    lineHeight: 1,
    transform: 'translateY(-1px)',
  };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'baseline', justifyContent: 'flex-start', flexWrap: 'nowrap' }}>
      <span style={numStyle}>{numerator}</span>
      <span style={slashStyle} aria-hidden>
        /
      </span>
      <span style={numStyle}>{denominator}</span>
    </span>
  );
}

function StatValueNumberUnit({ styles, value, unit }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 6, flexWrap: 'wrap' }}>
      <span
        style={{
          ...displayMixedItalic,
          fontSize: 30,
          fontWeight: 600,
          color: styles.text,
          lineHeight: 1,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </span>
      <span
        style={{
          fontSize: 13,
          fontWeight: 700,
          fontFamily: '"Noto Serif SC", serif',
          fontStyle: 'normal',
          color: styles.textMuted,
          letterSpacing: '0.05em',
          lineHeight: 1.1,
        }}
      >
        {unit}
      </span>
    </span>
  );
}

function StatCard({ styles, label, icon, highlight, children }) {
  return (
    <div style={{ background: highlight ? styles.bgHighlight : styles.bgCard, border: `1px solid ${highlight ? styles.accent : styles.border}`, padding: 16 }}>
      <div style={{ fontSize: 12, letterSpacing: '0.08em', color: styles.textFaint, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4, fontFamily: '"Noto Serif SC", serif', fontWeight: 700, lineHeight: TAB_LH_META }}>
        {icon}
        {label}
      </div>
      <div>{children}</div>
    </div>
  );
}

export function ProgressScreen({ styles, isDark, weekNumber, totalWeeks, completed, blocks, streak, today }) {
  const { t } = useI18n();
  let cumulative = 0;
  const planSections = blocks.map((block) => {
    const startWeek = cumulative + 1;
    cumulative += block.weeks;
    const endWeek = cumulative;
    const rows = getRepertoireRowsFromBlock(block);
    return { block, startWeek, endWeek, rows };
  });

  const sectionsWithPieces = planSections.filter((s) => s.rows.length > 0);
  const stagesCompletedCount = sectionsWithPieces.filter((s) => isStageCompletedForProgress(s.endWeek, weekNumber, totalWeeks)).length;
  const stagesTotalCount = sectionsWithPieces.length;

  const totalFilledTitles = sectionsWithPieces.reduce((acc, s) => acc + s.rows.length, 0);

  const taggedGroups = buildCompletedRepertoireByTag(blocks, weekNumber, totalWeeks, t);
  const learnedPieceKeys = new Set();
  for (const g of taggedGroups) {
    for (const item of g.items) learnedPieceKeys.add(normalizePieceTitleKey(item.title));
  }
  const totalLearnedPieces = learnedPieceKeys.size;
  const repertoireDivider = isDark ? 'rgba(250, 250, 249, 0.06)' : 'rgba(12, 10, 9, 0.06)';
  const hasAnyFilledPiece = blocks.some((b) => getRepertoireRowsFromBlock(b).length > 0);
  const totalMinutes = Object.values(completed).reduce((s, c) => s + (c.duration || 0), 0);
  const allDone = stagesTotalCount > 0 && stagesCompletedCount >= stagesTotalCount && totalWeeks > 0 && weekNumber >= totalWeeks;

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
        <StatCard styles={styles} label={t('progress.statWeek')}>
          <StatValueFraction styles={styles} numerator={weekNumber} denominator={totalWeeks} />
        </StatCard>
        <StatCard styles={styles} label={t('progress.statStages')}>
          <StatValueFraction styles={styles} numerator={stagesCompletedCount} denominator={stagesTotalCount} />
        </StatCard>
        <StatCard styles={styles} label={t('progress.statStreak')} icon={streak > 0 ? <Flame size={14} strokeWidth={3} style={{ color: styles.accent }} /> : null} highlight={streak > 0}>
          <StatValueNumberUnit styles={styles} value={streak} unit={t('progress.statDaysSuffix')} />
        </StatCard>
        <StatCard styles={styles} label={t('progress.statHours')}>
          <StatValueNumberUnit styles={styles} value={Math.round(totalMinutes / 60)} unit={t('progress.statHoursSuffix')} />
        </StatCard>
      </div>

      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 12, letterSpacing: '0.15em', color: styles.accent, marginBottom: 10, fontFamily: '"Noto Serif SC", serif', fontWeight: 800, lineHeight: TAB_LH_META }}>
          {t('progress.heatmapTitle')}
        </div>
        <Heatmap styles={styles} isDark={isDark} completed={completed} today={today} />
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
          <div style={{ fontSize: 12, letterSpacing: '0.15em', color: styles.accent, fontFamily: '"Noto Serif SC", serif', fontWeight: 800, lineHeight: TAB_LH_META }}>
            {t('progress.repertoireTitle')}
          </div>
          {totalLearnedPieces > 0 && (
            <span style={{ fontSize: 11, letterSpacing: '0.06em', color: styles.textFaint, fontFamily: '"Noto Serif SC", serif', fontWeight: 700, lineHeight: TAB_LH_META }}>
              {t('progress.repertoireTotalCount', { n: totalLearnedPieces })}
            </span>
          )}
        </div>
        <p style={{ fontSize: 13, color: styles.textFaint, lineHeight: TAB_LH_BODY, fontFamily: '"Noto Serif SC", serif', fontWeight: 600, margin: 0 }}>
          {t('progress.repertoireIntro')}
        </p>
      </div>

      {totalFilledTitles === 0 && (
        <div style={{ padding: '16px 12px', background: styles.bgCard, border: `1px solid ${styles.border}`, marginBottom: 24, fontSize: 14, color: styles.textMuted, fontFamily: '"Noto Serif SC", serif', fontWeight: 600, lineHeight: TAB_LH_BODY }}>
          {t('progress.emptyPiecesHint')}
        </div>
      )}

      {hasAnyFilledPiece && taggedGroups.length === 0 && (
        <div style={{ padding: '16px 12px', background: styles.bgCard, border: `1px solid ${styles.border}`, marginBottom: 24, fontSize: 14, color: styles.textMuted, fontFamily: '"Noto Serif SC", serif', fontWeight: 600, lineHeight: TAB_LH_BODY }}>
          {t('progress.noCompletedPiecesYet')}
        </div>
      )}

      {taggedGroups.map(({ tag, items }) => (
        <div key={tag} style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
            <div style={{ fontSize: 12, letterSpacing: '0.15em', color: styles.accent, fontFamily: '"Noto Serif SC", serif', fontWeight: 800, lineHeight: TAB_LH_META }}>
              {tag}
            </div>
            <span style={{ fontSize: 11, letterSpacing: '0.04em', color: styles.textFaint, fontFamily: '"Noto Serif SC", serif', fontWeight: 600, lineHeight: TAB_LH_META }}>
              {t('progress.repertoireTagCount', { n: items.length })}
            </span>
          </div>
          <div>
            {items.map((item, idx) => (
              <div
                key={`${tag}::${normalizePieceTitleKey(item.title)}`}
                style={{
                  width: '100%',
                  padding: '5px 0',
                  borderBottom: idx < items.length - 1 ? `1px solid ${repertoireDivider}` : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <Check size={17} strokeWidth={3} style={{ color: styles.accent, flexShrink: 0, marginTop: 3 }} aria-hidden />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ ...displayMixedItalic, fontSize: 16, color: styles.text, lineHeight: TAB_LH_TIGHT }}>
                      <MixedScriptBalance latinEm={1.09} cjkEm={0.79}>
                        {item.title}
                      </MixedScriptBalance>
                    </div>
                    <div style={{ fontSize: 11, color: styles.textFaint, marginTop: 3, lineHeight: TAB_LH_META, fontFamily: '"Noto Serif SC", serif', fontWeight: 500 }}>
                      <MixedScriptBalance style={{ fontStyle: 'normal', fontSynthesis: 'none', fontWeight: 500 }} latinEm={1.05} cjkEm={0.86}>
                        {item.stageHint}
                      </MixedScriptBalance>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {allDone && (
        <div style={{ background: styles.bgRest, border: `1px solid ${styles.borderRest}`, padding: 20, marginTop: 24, textAlign: 'center' }}>
          <div style={{ ...displayMixedItalic, fontSize: 17, color: styles.text, marginBottom: 6, fontWeight: 600, lineHeight: TAB_LH_TIGHT }}>
            {t('progress.curriculumDoneTitle')}
          </div>
          <p style={{ fontSize: 14, color: styles.textMuted, lineHeight: TAB_LH_BODY, fontFamily: '"Noto Serif SC", serif', fontWeight: 600 }}>
            {t('progress.curriculumDoneHint')}
          </p>
        </div>
      )}
    </div>
  );
}
